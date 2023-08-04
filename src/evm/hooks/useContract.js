import ERC20ABI from '../abis/ERC20.json';
import FactoryABI from '../abis/Factory.json';
import MulticallABI from '../abis/Muticall2.json';
import PairABI from '../abis/Pair.json';
import RouterABI from '../abis/Router.json';
import { FACTORY_ADDRESS, MULTICALL_ADDRESS, ROUTER_ADDRESS } from '../configs/networks';
import { getContract, isAddress } from '../utils';
import { BigNumber } from '@ethersproject/bignumber';

export async function callContract(contract, method, args, overrides = {}) {
    try {
        const estimateGas = await contract.estimateGas[method](...args, {
            ...overrides,
        });

        const gasLimit = estimateGas.add(estimateGas.mul(BigNumber.from(15)).div(BigNumber.from(100)));

        const tx = await contract[method](...args, { gasLimit: gasLimit.toString(), ...overrides });
        if (typeof tx.wait !== 'function') return tx;
        const res = await tx.wait();
        return res;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

export async function callStaticContract(contract, method, args, overrides = {}) {
    try {
        // console.log(contract, method, args);
        const staticTx = await contract.callStatic[method](...args, {
            ...overrides,
        });
        // console.log(staticTx);
        if (typeof staticTx.wait !== 'function') return staticTx;
        const res = await staticTx.wait();
        console.log(res);
        return res;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

export function getMulticallContract(library, account = undefined) {
    return getContract(MULTICALL_ADDRESS, MulticallABI, library, account);
}

export function getERC20Contract(token, library, account = undefined) {
    if (!isAddress(token)) throw Error('invalid token address');
    return getContract(token, ERC20ABI, library, account);
}

export function getPairContract(pair, library, account = undefined) {
    if (!isAddress(pair)) throw Error('invalid pair address');
    return getContract(pair, PairABI, library, account);
}

export function getFactoryContract(library, account = undefined) {
    return getContract(FACTORY_ADDRESS, FactoryABI, library, account);
}

export function getRouterContract(library, account = undefined) {
    return getContract(ROUTER_ADDRESS, RouterABI, library, account);
}
