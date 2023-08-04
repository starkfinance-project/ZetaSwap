import { INIT_CODE_HASH, WETH } from '../configs/networks';
import { getAddress, getCreate2Address } from '@ethersproject/address';
import { AddressZero } from '@ethersproject/constants';
import { Contract } from '@ethersproject/contracts';
import { keccak256, pack } from '@ethersproject/solidity';
import { Token, TradeType } from '@uniswap/sdk';
import { validateAndParseAddress } from '@uniswap/sdk-core';
import invariant from 'tiny-invariant';

export const formatAddress = (account) => {
    const length = account.length;
    return length > 12 ? `${account.slice(0, 7)}...${account.slice(length - 5, length)}` : account;
};

export const removeNumericKey = (object) => {
    let obj = { ...object };
    for (let key in obj) {
        if (!Number.isNaN(+key)) {
            delete obj[key];
        }
    }
    return obj;
};

// returns the checksummed address if the address is valid, otherwise returns false
export function isAddress(value) {
    try {
        return getAddress(value);
    } catch {
        return false;
    }
}

// account is not optional
export function getSigner(library, account) {
    return library.getSigner(account).connectUnchecked();
}

// account is optional
export function getProviderOrSigner(library, account = undefined) {
    return account ? getSigner(library, account) : library;
}

// account is optional
export function getContract(address, ABI, library, account = undefined) {
    if (!isAddress(address) || address === AddressZero) {
        throw Error(`Invalid 'address' parameter '${address}'.`);
    }

    return new Contract(address, ABI, getProviderOrSigner(library, account));
}

export const computePairAddress = ({ factoryAddress, tokenA, tokenB }) => {
    const [token0, token1] = tokenA.sortsBefore(tokenB) ? [tokenA, tokenB] : [tokenB, tokenA]; // does safety checks
    return getCreate2Address(
        factoryAddress,
        keccak256(['bytes'], [pack(['address', 'address'], [token0.address, token1.address])]),
        INIT_CODE_HASH,
    );
};

export const wrappedCurrency = (currency) => {
    return currency instanceof Token ? currency : undefined;
};

const ZERO_HEX = '0x0';

export const swapCallParameters = (trade, options) => {
    const etherIn = trade.inputAmount.currency.address === WETH.address;
    const etherOut = trade.outputAmount.currency.address === WETH.address;
    // the router does not support both ether in and out
    invariant(!(etherIn && etherOut), 'ETHER_IN_OUT');
    invariant(!('ttl' in options) || options.ttl > 0, 'TTL');

    const to = validateAndParseAddress(options.recipient);
    const amountIn = trade.maximumAmountIn(options.allowedSlippage).raw.toString();
    const amountOut = trade.minimumAmountOut(options.allowedSlippage).raw.toString();
    const path = trade.route.path.map((token) => token.address);
    const deadline =
        'ttl' in options
            ? `0x${(Math.floor(new Date().getTime() / 1000) + options.ttl).toString(16)}`
            : `0x${options.deadline.toString(16)}`;

    const useFeeOnTransfer = Boolean(options.feeOnTransfer);

    let methodName;
    let args;
    let value;
    switch (trade.tradeType) {
        case TradeType.EXACT_INPUT:
            if (etherIn) {
                methodName = useFeeOnTransfer
                    ? 'swapExactETHForTokensSupportingFeeOnTransferTokens'
                    : 'swapExactETHForTokens';
                // (uint amountOutMin, address[] calldata path, address to, uint deadline)
                args = [amountOut, path, to, deadline];
                value = amountIn;
            } else if (etherOut) {
                methodName = useFeeOnTransfer
                    ? 'swapExactTokensForETHSupportingFeeOnTransferTokens'
                    : 'swapExactTokensForETH';
                // (uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline)
                args = [amountIn, amountOut, path, to, deadline];
                value = ZERO_HEX;
            } else {
                methodName = useFeeOnTransfer
                    ? 'swapExactTokensForTokensSupportingFeeOnTransferTokens'
                    : 'swapExactTokensForTokens';
                // (uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline)
                args = [amountIn, amountOut, path, to, deadline];
                value = ZERO_HEX;
            }
            break;
        case TradeType.EXACT_OUTPUT:
            invariant(!useFeeOnTransfer, 'EXACT_OUT_FOT');
            if (etherIn) {
                methodName = 'swapETHForExactTokens';
                // (uint amountOut, address[] calldata path, address to, uint deadline)
                args = [amountOut, path, to, deadline];
                value = amountIn;
            } else if (etherOut) {
                methodName = 'swapTokensForExactETH';
                // (uint amountOut, uint amountInMax, address[] calldata path, address to, uint deadline)
                args = [amountOut, amountIn, path, to, deadline];
                value = ZERO_HEX;
            } else {
                methodName = 'swapTokensForExactTokens';
                // (uint amountOut, uint amountInMax, address[] calldata path, address to, uint deadline)
                args = [amountOut, amountIn, path, to, deadline];
                value = ZERO_HEX;
            }
            break;
    }
    return {
        methodName,
        args,
        value,
    };
};
