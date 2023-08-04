import { parseUnits } from '@ethersproject/units';
import { CurrencyAmount, JSBI, Percent, Token, TokenAmount, TradeType } from '@uniswap/sdk';
import { BIPS_BASE, Field } from '../configs/networks';
import { callContract, getRouterContract } from '../hooks/useContract';
import { swapCallParameters } from '../utils';
import { getTradeExactIn, getTradeExactOut } from './index';

// try to parse a user entered amount for a given token
export const tryParseAmount = (value, currency) => {
    if (!value || !currency) {
        return undefined;
    }
    try {
        const typedValueParsed = parseUnits(value, currency.decimals).toString();
        if (typedValueParsed !== '0') {
            return currency instanceof Token
                ? new TokenAmount(currency, JSBI.BigInt(typedValueParsed))
                : CurrencyAmount.ether(JSBI.BigInt(typedValueParsed));
        }
    } catch (error) {
        // should fail if the user specifies too many decimal places of precision (or maybe exceed max uint?)
        console.debug(`Failed to parse input amount: "${value}"`, error);
    }
    // necessary for all paths to return a value
    return undefined;
};

// from the current swap inputs, compute the best trade and return it.
export const getDerivedSwapInfo = async ({
    library,
    independentField = Field.INPUT,
    typedValue,
    currencies,
    singlehops,
}) => {
    if (!library) return null;
    // console.log(independentField, typedValue, currencies);
    const { [Field.INPUT]: inputCurrency, [Field.OUTPUT]: outputCurrency } = currencies;
    if (!inputCurrency || !outputCurrency) return null;

    const isExactIn = independentField === Field.INPUT;
    const parsedAmount = tryParseAmount(
        typedValue.toString(),
        (isExactIn ? inputCurrency : outputCurrency) ?? undefined,
    );
    if (!parsedAmount) return null;

    const [bestTradeExactIn, bestTradeExactOut] = await Promise.all([
        getTradeExactIn(
            library,
            inputCurrency,
            outputCurrency,
            parsedAmount,
            isExactIn ? outputCurrency : inputCurrency,
            singlehops,
        ),
        getTradeExactOut(
            library,
            inputCurrency,
            outputCurrency,
            parsedAmount,
            isExactIn ? outputCurrency : inputCurrency,
            singlehops,
        ),
    ]);

    const trade = isExactIn ? bestTradeExactIn : bestTradeExactOut;

    return trade;
};

/**
 * Returns the swap calls that can be used to make the trade
 * @param trade trade to execute
 * @param allowedSlippage user allowed slippage
 * @param recipientAddressOrName
 */
export const getSwapCallArguments = async (
    recipientAddressOrName, // the ENS name or address of the recipient of the trade, or null if swap should be returned to sender,
    deadline,
    allowedSlippage,
    routerContract,
    trade, // trade to execute, required
) => {
    const recipient = recipientAddressOrName;

    if (!trade || !recipient || !deadline || !routerContract) return [];

    const swapMethods = [];

    try {
        swapMethods.push(
            swapCallParameters(trade, {
                feeOnTransfer: false,
                allowedSlippage: new Percent(JSBI.BigInt(allowedSlippage), BIPS_BASE),
                recipient,
                deadline,
            }),
        );
        if (trade.tradeType === TradeType.EXACT_INPUT) {
            swapMethods.push(
                swapCallParameters(trade, {
                    feeOnTransfer: true,
                    allowedSlippage: new Percent(JSBI.BigInt(allowedSlippage), BIPS_BASE),
                    recipient,
                    deadline,
                }),
            );
        }

        return swapMethods.map((parameters) => ({
            parameters,
            routerContract,
        }));
    } catch (error) {
        throw error;
    }
};

export const swapCallback = async (
    library,
    account, // the ENS name or address of the recipient of the trade, or null if swap should be returned to sender,
    trade, // trade to execute, required
    allowedSlippage,
) => {
    try {
        if (!library || !account || !trade || isNaN(allowedSlippage)) return;

        const routerContract = getRouterContract(library, account);
        const deadline = Math.floor(Date.now() / 1000) + 30 * 60;

        // swapCalls arguments
        const swapCalls = await getSwapCallArguments(
            account,
            deadline,
            Math.floor(allowedSlippage * 100),
            routerContract,
            trade,
        );

        if (!trade || !account || !swapCalls?.length || !routerContract) return;

        let {
            parameters: { methodName, args, value },
        } = swapCalls[0];

        let options = { value };

        return callContract(routerContract, methodName, args, options);
    } catch (error) {
        console.error('user reject transaction', error);
        throw error;
    }
};
