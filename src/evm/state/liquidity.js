import { BigNumber } from '@ethersproject/bignumber';
import { Pair, Percent, Price, Token, TokenAmount } from '@uniswap/sdk';
import { getBNBBalances, getPairInfo, getTokenBalances } from './index';
import { FACTORY_ADDRESS, Field, NETWORKS_SUPPORTED, ROUTER_ADDRESS, WETH } from '../configs/networks';
import {
    callContract,
    getERC20Contract,
    getFactoryContract,
    getPairContract,
    getRouterContract,
} from '../hooks/useContract';
import { computePairAddress } from '../utils';
import { getSingleContractMultipleDataMultipleMethods } from '../utils/multicall';

export const getCurrencyBalances = async (account, library, currencies) => {
    try {
        if (!currencies.filter((currency) => !!currency).length) return undefined;
        const tokens = currencies?.filter((currency) => currency instanceof Token && !currency.equals(WETH)) ?? [];
        const containsBNB = currencies?.some((currency) => currency === WETH) ?? false;
        const ethBalance = await getBNBBalances(library, containsBNB ? [account] : []);
        const tokenBalances = await getTokenBalances(account, library, tokens);
        return (
            currencies?.map((currency) => {
                if (!account || !currency) return undefined;
                if (currency === WETH) return ethBalance[account];
                if (currency instanceof Token) return tokenBalances[currency.address];
                return undefined;
            }) ?? []
        );
    } catch (error) {
        throw error;
    }
};

export const EmptyPool = {
    pair: undefined,
    inputIsToken0: true,
    prices: {
        [Field.INPUT]: undefined,
        [Field.OUTPUT]: undefined,
    },
    shareOfPool: undefined,
    totalSupply: undefined,
    noLiquidity: true,
};

export const getPoolInfo = async (account, library, currencies) => {
    if (!WETH || !FACTORY_ADDRESS) return undefined;
    const [tokenA, tokenB] = currencies;
    if (!tokenA || !tokenB || tokenA.equals(tokenB)) return undefined;
    const computePair = computePairAddress({
        factoryAddress: FACTORY_ADDRESS,
        tokenA,
        tokenB,
    });
    if (!computePair) return EmptyPool;
    const pairContract = getPairContract(computePair, library);
    try {
        await pairContract?.getReserves();
    } catch (error) {
        return EmptyPool;
    }
    const pairInfo = await getPairInfo(library, account, pairContract);
    if (!pairInfo) return EmptyPool;
    const { token0, reserve0, reserve1, balanceOf, totalSupply } = pairInfo;
    const isTokenA0 = tokenA.address === token0;
    const pair = new Pair(
        new TokenAmount(isTokenA0 ? tokenA : tokenB, reserve0),
        new TokenAmount(isTokenA0 ? tokenB : tokenA, reserve1),
    );
    const price01 = new Price(isTokenA0 ? tokenA : tokenB, isTokenA0 ? tokenB : tokenA, reserve0, reserve1);
    const price10 = new Price(isTokenA0 ? tokenB : tokenA, isTokenA0 ? tokenA : tokenB, reserve1, reserve0);
    const prices = {
        [Field.INPUT]: price01,
        [Field.OUTPUT]: price10,
    };

    return {
        pair,
        balanceOf: new TokenAmount(pair.liquidityToken, balanceOf),
        inputIsToken0: isTokenA0,
        prices,
        shareOfPool: new Percent(balanceOf, totalSupply),
        totalSupply: new TokenAmount(pair.liquidityToken, totalSupply),
        noLiquidity: false,
    };
};
export const addLiquidityCallback = async (account, library, tokens, amounts) => {
    try {
        if (!account || !library || [tokens, amounts].some((e) => !e[Field.INPUT] || !e[Field.OUTPUT])) return;

        const routerContract = getRouterContract(library, account);

        let args,
            overrides = {},
            methodName = '';

        // addLiquidityETH
        if (tokens[Field.INPUT]?.equals(WETH) || tokens[Field.OUTPUT]?.equals(WETH)) {
            methodName = 'addLiquidityETH';
            const inputIsETH = tokens[Field.INPUT]?.equals(WETH);
            args = [
                (inputIsETH ? tokens[Field.OUTPUT]?.address : tokens[Field.INPUT]?.address) ?? '', // token
                (inputIsETH ? amounts[Field.OUTPUT]?.raw.toString() : amounts[Field.INPUT]?.raw.toString()) ?? 0, // token amount
                0, // token min
                0, // eth min
                account,
                Math.floor(Date.now() / 1000) + 30 * 60, // TODO deadline of user's settings
            ];
            overrides = {
                value: inputIsETH ? amounts[Field.INPUT]?.raw.toString() : amounts[Field.OUTPUT]?.raw.toString(),
            };
        } else {
            // addLiquidity
            methodName = 'addLiquidity';
            args = [
                tokens[Field.INPUT]?.address ?? '', // token0
                tokens[Field.OUTPUT]?.address ?? '', // token1
                amounts[Field.INPUT]?.raw.toString() ?? 0, // token0 amount
                amounts[Field.OUTPUT]?.raw.toString() ?? 0, // token1 amount
                0, // token0 min
                0, // token1 min
                account,
                Math.floor(Date.now() / 1000) + 30 * 60, // TODO deadline of user's settings
            ];
        }
        return callContract(routerContract, methodName, args, overrides);
    } catch (error) {
        console.error(error);
        throw error;
    }
};

export const getAllLiquidityPools = async (library) => {
    try {
        if (!library) return [];

        const factoryContract = getFactoryContract(library);
        const allPairsLength = await callContract(factoryContract, 'allPairsLength', []);
        const allPairs = await Promise.all(
            new Array(+allPairsLength.toString())
                .fill('')
                .map((_, i) => callContract(factoryContract, 'allPairs', [i])),
        );

        const pairContracts = allPairs.map((pair) => getPairContract(pair, library));

        // TODO call with multicall
        const results = await Promise.all(
            pairContracts.map(async (pair) => {
                const [token0, token1, reserves, totalSupply] = await Promise.all([
                    callContract(pair, 'token0', []),
                    callContract(pair, 'token1', []),
                    callContract(pair, 'getReserves', []),
                    callContract(pair, 'totalSupply', []),
                ]);

                const { reserve0, reserve1 } = reserves;
                const [_token0, _token1] = await Promise.all(
                    [token0, token1].map(async (token) => {
                        const erc20Contract = getERC20Contract(token, library);
                        const erc20Methods = ['name', 'symbol', 'decimals'];
                        const results = await getSingleContractMultipleDataMultipleMethods(
                            library,
                            erc20Contract,
                            erc20Methods,
                            erc20Methods.map((_) => []),
                        );
                        if (!results?.length) return;
                        const _token = results.reduce((memo, result, i) => {
                            if (result?.[0]) memo[erc20Methods[i]] = result[0];
                            return memo;
                        }, {});
                        if (
                            Array.from(new Set([...Object.keys(_token), ...erc20Methods]).values()).length !==
                            erc20Methods.length
                        )
                            return;

                        return new Token(
                            NETWORKS_SUPPORTED.chainId,
                            token,
                            _token['decimals'],
                            _token['symbol'],
                            _token['name'],
                        );
                    }),
                );
                if (!_token0 || !_token1) return;

                const _pair = new Pair(new TokenAmount(_token0, reserve0), new TokenAmount(_token1, reserve1));
                const price01 = new Price(_token0, _token1, reserve0, reserve1);
                const price10 = new Price(_token1, _token0, reserve1, reserve0);
                const prices = {
                    [Field.INPUT]: price01,
                    [Field.OUTPUT]: price10,
                };

                return {
                    pair: _pair,
                    totalSupply: new TokenAmount(_pair.liquidityToken, totalSupply),
                    prices,
                    reserves,
                };
            }),
        );
        return results;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

export const getOwnerLiquidityPools = async (library, account) => {
    try {
        if (!library || !account) return [];

        const factoryContract = getFactoryContract(library);
        const allPairsLength = await callContract(factoryContract, 'allPairsLength', []);
        const allPairs = await Promise.all(
            new Array(+allPairsLength.toString())
                .fill('')
                .map((_, i) => callContract(factoryContract, 'allPairs', [i])),
        );

        const pairContracts = allPairs.map((pair) => getPairContract(pair, library));

        // TODO call with multicall
        // const methodNames = ["token0", "token1"];
        // const results = await getMultipleContractMultipleDataMultipleMethods(
        //   library,
        //   pairContracts,
        //   methodNames,
        //   methodNames.map((_) => [])
        // );
        // console.log(pairContracts);
        let ownerPairsContracts = [];
        await Promise.all(
            pairContracts.map(async (pair) => {
                const balanceOf = await callContract(pair, 'balanceOf', [account]);
                BigNumber.from(balanceOf).gt(BigNumber.from('0')) && ownerPairsContracts.push(pair);
            }),
        );

        const results = await Promise.all(
            ownerPairsContracts.map(async (pair) => {
                const [token0, token1, reserves, totalSupply, balanceOf] = await Promise.all([
                    callContract(pair, 'token0', []),
                    callContract(pair, 'token1', []),
                    callContract(pair, 'getReserves', []),
                    callContract(pair, 'totalSupply', []),
                    callContract(pair, 'balanceOf', [account]),
                ]);

                const { reserve0, reserve1 } = reserves;
                const [_token0, _token1] = await Promise.all(
                    [token0, token1].map(async (token) => {
                        const erc20Contract = getERC20Contract(token, library);
                        const erc20Methods = ['name', 'symbol', 'decimals'];
                        const results = await getSingleContractMultipleDataMultipleMethods(
                            library,
                            erc20Contract,
                            erc20Methods,
                            erc20Methods.map((_) => []),
                        );
                        if (!results?.length) return;
                        const _token = results.reduce((memo, result, i) => {
                            if (result?.[0]) memo[erc20Methods[i]] = result[0];
                            return memo;
                        }, {});
                        if (
                            Array.from(new Set([...Object.keys(_token), ...erc20Methods]).values()).length !==
                            erc20Methods.length
                        )
                            return;

                        return new Token(
                            NETWORKS_SUPPORTED.chainId,
                            token,
                            _token['decimals'],
                            _token['symbol'],
                            _token['name'],
                        );
                    }),
                );
                if (!_token0 || !_token1) return;

                const _pair = new Pair(new TokenAmount(_token0, reserve0), new TokenAmount(_token1, reserve1));
                const price01 = new Price(_token0, _token1, reserve0, reserve1);
                const price10 = new Price(_token1, _token0, reserve1, reserve0);
                const prices = {
                    [Field.INPUT]: price01,
                    [Field.OUTPUT]: price10,
                };

                return {
                    pair: _pair,
                    totalSupply: new TokenAmount(_pair.liquidityToken, totalSupply),
                    balanceOf: new TokenAmount(_pair.liquidityToken, balanceOf),
                    prices,
                    shareOfPool: new Percent(balanceOf, totalSupply),
                };
            }),
        );
        return results;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

export const removeLiquidityCallback = async (account, library, pair, removeAmount) => {
    try {
        if (!account || !library || !WETH || removeAmount.lte(BigNumber.from('0'))) return;
        let token0, token1;
        [token0, token1] = [pair.token0, pair.token1];

        const routerContract = getRouterContract(library, account);

        const deadline = Math.floor(Date.now() / 1000) + 30 * 60;

        let args,
            overrides = {},
            methodName = '';

        // removeLiquidityETH
        if (token0.equals(WETH) || token1.equals(WETH)) {
            methodName = 'removeLiquidityETH';
            const token0IsETH = token0.equals(WETH);
            args = [
                (token0IsETH ? token1.address : token0.address) ?? '', // token
                removeAmount.toString(), // liquidity remove
                0, // token min
                0, // eth min
                account,
                deadline, // TODO deadline of user's settings
            ];
        } else {
            // removeLiquidity
            methodName = 'removeLiquidity';
            args = [
                token0.address ?? '', // token0
                token1.address ?? '', // token1
                removeAmount.toString(), // liquidity remove
                0, // token0 min
                0, // token1 min
                account,
                deadline, // TODO deadline of user's settings
            ];
        }
        const _pair = computePairAddress({
            factoryAddress: FACTORY_ADDRESS,
            tokenA: token0,
            tokenB: token1,
        });
        const pairContract = getPairContract(_pair, library, account);
        await callContract(pairContract, 'approve', [ROUTER_ADDRESS, removeAmount]);
        return callContract(routerContract, methodName, args, overrides);
    } catch (error) {
        console.error(error);
        throw error;
    }
};
