import { CurrencyAmount, currencyEquals, JSBI, Pair, TokenAmount, Trade } from '@uniswap/sdk';
import flatMap from 'lodash/flatMap';
import {
    BASES_TO_CHECK_TRADES_AGAINST,
    BETTER_TRADE_LESS_HOPS_THRESHOLD,
    CUSTOM_BASES,
    FACTORY_ADDRESS,
    MAX_TRADE_HOPS,
    ONE_HUNDRED_PERCENT,
    ZERO_PERCENT,
} from '../configs/networks';
import { getERC20Contract, getMulticallContract, getPairContract } from '../hooks/useContract';
import { computePairAddress, isAddress, removeNumericKey, wrappedCurrency } from '../utils';
import {
    getMultipleContractMultipleData,
    getSingleContractMultipleData,
    getSingleContractMultipleDataMultipleMethods,
} from '../utils/multicall';

/**
 * Returns a map of the given addresses to their eventually consistent BNB balances.
 */
export const getBNBBalances = async (library, uncheckedAddresses = undefined) => {
    const multicallContract = await getMulticallContract(library);
    const addresses = uncheckedAddresses
        ? uncheckedAddresses
              .map(isAddress)
              .filter((a) => a !== false)
              .sort()
        : [];
    const results = await getSingleContractMultipleData(
        library,
        multicallContract,
        'getEthBalance',
        addresses.map((address) => [address]),
    );
    return addresses.reduce((memo, address, i) => {
        const value = results?.[i];
        if (value) memo[address] = CurrencyAmount.ether(JSBI.BigInt(value + ''));
        return memo;
    }, {});
};

/**
 * Returns a map of the given addresses to their eventually consistent token balances.
 */
export const getTokenBalances = async (account, library, tokens) => {
    try {
        const tokenContracts = tokens.map((token) => getERC20Contract(token.address, library));
        const results = await getMultipleContractMultipleData(
            library,
            tokenContracts,
            'balanceOf',
            tokenContracts.map((_) => [account]),
        );

        return tokens.reduce((memo, token, i) => {
            const value = results?.[i][0];
            if (value) memo[token.address] = new TokenAmount(token, JSBI.BigInt(value + ''));
            return memo;
        }, {});
    } catch (error) {
        throw error;
    }
};

/**
 * Returns pair info
 */
export const getPairInfo = async (library, account, pairContract) => {
    try {
        const methodNames = ['token0', 'token1', 'getReserves', 'balanceOf', 'totalSupply'];
        const results = await getSingleContractMultipleDataMultipleMethods(library, pairContract, methodNames, [
            [],
            [],
            [],
            [account],
            [],
        ]);
        return methodNames.reduce((memo, method, i) => {
            const value = results?.[i][0];
            // console.log("value + ", value + "");
            if (value) {
                if (i !== 2) memo[method] = value + '';
                else memo = { ...memo, ...removeNumericKey(results[i]) };
            }
            return memo;
        }, {});
    } catch (error) {
        console.log(error);
        return undefined;
    }
};

export const PairState = {
    LOADING: 0,
    NOT_EXISTS: 1,
    EXISTS: 2,
    INVALID: 3,
};

export const getPairs = async (library, currencies) => {
    const tokens = currencies.map(([currencyA, currencyB]) => [wrappedCurrency(currencyA), wrappedCurrency(currencyB)]);

    const pairAddresses = tokens.map(([tokenA, tokenB]) => {
        return tokenA && tokenB && !tokenA.equals(tokenB)
            ? computePairAddress({
                  factoryAddress: FACTORY_ADDRESS,
                  tokenA,
                  tokenB,
              })
            : undefined;
    });
    const pairContracts = pairAddresses.filter((pair) => !!pair).map((pair) => getPairContract(pair, library));

    const results = await getMultipleContractMultipleData(
        library,
        pairContracts,
        'getReserves',
        pairContracts.map((_) => []),
    );

    if (!results) return [];

    return results.map((reserves, i) => {
        const tokenA = tokens[i][0];
        const tokenB = tokens[i][1];
        if (!tokenA || !tokenB || tokenA.equals(tokenB)) return [PairState.INVALID, null];
        if (!reserves) return [PairState.NOT_EXISTS, null];
        const { reserve0, reserve1 } = reserves;
        const [token0, token1] = tokenA.sortsBefore(tokenB) ? [tokenA, tokenB] : [tokenB, tokenA];
        return [
            PairState.EXISTS,
            new Pair(new TokenAmount(token0, reserve0.toString()), new TokenAmount(token1, reserve1.toString())),
        ];
    });
};

export const getAllCommonPairs = async (library, currencyA, currencyB) => {
    if (!library) return [];
    const [tokenA, tokenB] = [
        // wrappedCurrency(currencyA),
        // wrappedCurrency(currencyB),
        currencyA,
        currencyB,
    ];
    if (!tokenA || !tokenB) return [];

    const bases = BASES_TO_CHECK_TRADES_AGAINST ? BASES_TO_CHECK_TRADES_AGAINST : [];

    const basePairs = flatMap(bases, (base) => bases.map((otherBase) => [base, otherBase])).filter(
        ([t0, t1]) => t0.address !== t1.address,
    );

    const allPairCombinations =
        tokenA && tokenB
            ? [
                  // the direct pair
                  [tokenA, tokenB],
                  // token A against all bases
                  ...bases.map((base) => [tokenA, base]),
                  // token B against all bases
                  ...bases.map((base) => [tokenB, base]),
                  // each base against all bases
                  ...basePairs,
              ]
                  .filter((tokens) => Boolean(tokens[0] && tokens[1]))
                  .filter(([t0, t1]) => t0.address !== t1.address)
                  .filter(([tokenA, tokenB]) => {
                      const customBases = CUSTOM_BASES;
                      if (!customBases) return true;

                      const customBasesA = customBases[tokenA.address];
                      const customBasesB = customBases[tokenB.address];

                      if (!customBasesA && !customBasesB) return true;

                      if (customBasesA && !customBasesA.find((base) => tokenB.equals(base))) return false;
                      if (customBasesB && !customBasesB.find((base) => tokenA.equals(base))) return false;

                      return true;
                  })
            : [];

    const allPairs = await getPairs(library, allPairCombinations);

    return Object.values(
        allPairs
            // filter out invalid pairs
            .filter((result) => Boolean(result[0] === PairState.EXISTS && result[1]))
            // filter out duplicated pairs
            .reduce((memo, [, curr]) => {
                memo[curr.liquidityToken.address] = memo[curr.liquidityToken.address] ?? curr;
                return memo;
            }, {}),
    );
};

// returns whether tradeB is better than tradeA by at least a threshold percentage amount
export function isTradeBetter(tradeA, tradeB, minimumDelta = ZERO_PERCENT) {
    if (tradeA && !tradeB) return false;
    if (tradeB && !tradeA) return true;
    if (!tradeA || !tradeB) return undefined;

    if (
        tradeA.tradeType !== tradeB.tradeType ||
        !currencyEquals(tradeA.inputAmount.currency, tradeB.inputAmount.currency) ||
        !currencyEquals(tradeA.outputAmount.currency, tradeB.outputAmount.currency)
    ) {
        throw new Error('Trades are not comparable');
    }

    if (minimumDelta.equalTo(ZERO_PERCENT)) {
        return tradeA.executionPrice.lessThan(tradeB.executionPrice);
    }
    return tradeA.executionPrice.raw.multiply(minimumDelta.add(ONE_HUNDRED_PERCENT)).lessThan(tradeB.executionPrice);
}

export const getTradeExactIn = async (
    library,
    currencyA,
    currencyB,
    currencyAmountIn,
    currencyOut,
    singleHopOnly = true,
) => {
    const allowedPairs = await getAllCommonPairs(library, currencyA, currencyB);
    if (!allowedPairs.length) return null;

    if (currencyAmountIn && currencyOut && allowedPairs.length > 0) {
        if (singleHopOnly) {
            return (
                Trade.bestTradeExactIn(allowedPairs, currencyAmountIn, currencyOut, {
                    maxHops: 1,
                    maxNumResults: 1,
                })[0] ?? null
            );
        }
        // search through trades with varying hops, find best trade out of them
        let bestTradeSoFar = null;
        for (let i = 1; i <= MAX_TRADE_HOPS; i++) {
            const currentTrade =
                Trade.bestTradeExactIn(allowedPairs, currencyAmountIn, currencyOut, {
                    maxHops: i,
                    maxNumResults: 1,
                })[0] ?? null;
            // if current trade is best yet, save it
            if (isTradeBetter(bestTradeSoFar, currentTrade, BETTER_TRADE_LESS_HOPS_THRESHOLD)) {
                bestTradeSoFar = currentTrade;
            }
        }
        return bestTradeSoFar;
    }
    return null;
};

export const getTradeExactOut = async (library, currencyA, currencyB, currencyAmountOut, currencyIn, singleHopOnly) => {
    const allowedPairs = await getAllCommonPairs(library, currencyA, currencyB);
    if (!allowedPairs.length) return null;

    if (currencyAmountOut && currencyIn && allowedPairs.length > 0) {
        if (singleHopOnly) {
            return (
                Trade.bestTradeExactOut(allowedPairs, currencyIn, currencyAmountOut, {
                    maxHops: 1,
                    maxNumResults: 1,
                })[0] ?? null
            );
        }
        // search through trades with varying hops, find best trade out of them
        let bestTradeSoFar = null;
        for (let i = 1; i <= MAX_TRADE_HOPS; i++) {
            const currentTrade =
                Trade.bestTradeExactOut(allowedPairs, currencyIn, currencyAmountOut, {
                    maxHops: i,
                    maxNumResults: 1,
                })[0] ?? null;
            // if current trade is best yet, save it
            if (isTradeBetter(bestTradeSoFar, currentTrade, BETTER_TRADE_LESS_HOPS_THRESHOLD)) {
                bestTradeSoFar = currentTrade;
            }
        }
        return bestTradeSoFar;
    }
    return null;
};
