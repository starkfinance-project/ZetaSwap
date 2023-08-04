import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import assets from '../../../assets';
import Footer from '../../../layouts/Footer';
import { route } from '../../../routes/configs';

import '../style.scss';
import { useAccount, useContract, useStarknetCall, useStarknetExecute } from '@starknet-react/core';
import { RpcProvider, Provider, Contract, Account, ec, json, uint256, number } from 'starknet';
import BigNumber from 'bignumber.js';
import BigInt from 'big-integer';
import erc20 from '../../../assets/abi/erc20.js';
import router from '../../../assets/abi/router.js';
import factory from '../../../assets/abi/factory.js';
import pair from '../../../assets/abi/pair.js';

import { useActiveWeb3React } from '../../../evm/hooks/useActiveWeb3React';

const FACTORY_ADDRESS = '0x594074315e98393351438011f5a558466f1733fde666f73f41738a39804c27';
const ROUTER_ADDRESS = '0x2d300192ea8d3291755bfd2bb2f9e16b38f48a20e4ce98e189d2daa7be435c2';
const ethContractAddress = '0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7';
const provider = new Provider({ sequencer: { network: 'mainnet-alpha' } });
const erc20abi = [
    {
        members: [
            {
                name: 'low',
                offset: 0,
                type: 'felt',
            },
            {
                name: 'high',
                offset: 1,
                type: 'felt',
            },
        ],
        name: 'Uint256',
        size: 2,
        type: 'struct',
    },
    {
        data: [
            {
                name: 'from_',
                type: 'felt',
            },
            {
                name: 'to',
                type: 'felt',
            },
            {
                name: 'value',
                type: 'Uint256',
            },
        ],
        keys: [],
        name: 'Transfer',
        type: 'event',
    },
    {
        data: [
            {
                name: 'owner',
                type: 'felt',
            },
            {
                name: 'spender',
                type: 'felt',
            },
            {
                name: 'value',
                type: 'Uint256',
            },
        ],
        keys: [],
        name: 'Approval',
        type: 'event',
    },
    {
        data: [
            {
                name: 'account',
                type: 'felt',
            },
        ],
        keys: [],
        name: 'Paused',
        type: 'event',
    },
    {
        data: [
            {
                name: 'account',
                type: 'felt',
            },
        ],
        keys: [],
        name: 'Unpaused',
        type: 'event',
    },
    {
        data: [
            {
                name: 'previousOwner',
                type: 'felt',
            },
            {
                name: 'newOwner',
                type: 'felt',
            },
        ],
        keys: [],
        name: 'OwnershipTransferred',
        type: 'event',
    },
    {
        data: [
            {
                name: 'implementation',
                type: 'felt',
            },
        ],
        keys: [],
        name: 'Upgraded',
        type: 'event',
    },
    {
        data: [
            {
                name: 'previousAdmin',
                type: 'felt',
            },
            {
                name: 'newAdmin',
                type: 'felt',
            },
        ],
        keys: [],
        name: 'AdminChanged',
        type: 'event',
    },
    {
        inputs: [
            {
                name: 'owner',
                type: 'felt',
            },
            {
                name: 'recipient',
                type: 'felt',
            },
            {
                name: 'proxy_admin',
                type: 'felt',
            },
        ],
        name: 'initializer',
        outputs: [],
        type: 'function',
    },
    {
        inputs: [],
        name: 'name',
        outputs: [
            {
                name: 'name',
                type: 'felt',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [],
        name: 'symbol',
        outputs: [
            {
                name: 'symbol',
                type: 'felt',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [],
        name: 'totalSupply',
        outputs: [
            {
                name: 'totalSupply',
                type: 'Uint256',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [],
        name: 'decimals',
        outputs: [
            {
                name: 'decimals',
                type: 'felt',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [
            {
                name: 'account',
                type: 'felt',
            },
        ],
        name: 'balanceOf',
        outputs: [
            {
                name: 'balance',
                type: 'Uint256',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [
            {
                name: 'owner',
                type: 'felt',
            },
            {
                name: 'spender',
                type: 'felt',
            },
        ],
        name: 'allowance',
        outputs: [
            {
                name: 'remaining',
                type: 'Uint256',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [],
        name: 'paused',
        outputs: [
            {
                name: 'paused',
                type: 'felt',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [],
        name: 'owner',
        outputs: [
            {
                name: 'owner',
                type: 'felt',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [
            {
                name: 'recipient',
                type: 'felt',
            },
            {
                name: 'amount',
                type: 'Uint256',
            },
        ],
        name: 'transfer',
        outputs: [
            {
                name: 'success',
                type: 'felt',
            },
        ],
        type: 'function',
    },
    {
        inputs: [
            {
                name: 'sender',
                type: 'felt',
            },
            {
                name: 'recipient',
                type: 'felt',
            },
            {
                name: 'amount',
                type: 'Uint256',
            },
        ],
        name: 'transferFrom',
        outputs: [
            {
                name: 'success',
                type: 'felt',
            },
        ],
        type: 'function',
    },
    {
        inputs: [
            {
                name: 'spender',
                type: 'felt',
            },
            {
                name: 'amount',
                type: 'Uint256',
            },
        ],
        name: 'approve',
        outputs: [
            {
                name: 'success',
                type: 'felt',
            },
        ],
        type: 'function',
    },
    {
        inputs: [
            {
                name: 'spender',
                type: 'felt',
            },
            {
                name: 'added_value',
                type: 'Uint256',
            },
        ],
        name: 'increaseAllowance',
        outputs: [
            {
                name: 'success',
                type: 'felt',
            },
        ],
        type: 'function',
    },
    {
        inputs: [
            {
                name: 'spender',
                type: 'felt',
            },
            {
                name: 'subtracted_value',
                type: 'Uint256',
            },
        ],
        name: 'decreaseAllowance',
        outputs: [
            {
                name: 'success',
                type: 'felt',
            },
        ],
        type: 'function',
    },
    {
        inputs: [
            {
                name: 'newOwner',
                type: 'felt',
            },
        ],
        name: 'transferOwnership',
        outputs: [],
        type: 'function',
    },
    {
        inputs: [],
        name: 'renounceOwnership',
        outputs: [],
        type: 'function',
    },
    {
        inputs: [],
        name: 'pause',
        outputs: [],
        type: 'function',
    },
    {
        inputs: [],
        name: 'unpause',
        outputs: [],
        type: 'function',
    },
    {
        inputs: [
            {
                name: 'new_implementation',
                type: 'felt',
            },
        ],
        name: 'upgrade',
        outputs: [],
        type: 'function',
    },
];
const routerabi = [
    {
        members: [
            {
                name: 'low',
                offset: 0,
                type: 'felt',
            },
            {
                name: 'high',
                offset: 1,
                type: 'felt',
            },
        ],
        name: 'Uint256',
        size: 2,
        type: 'struct',
    },
    {
        data: [
            {
                name: 'implementation',
                type: 'felt',
            },
        ],
        keys: [],
        name: 'Upgraded',
        type: 'event',
    },
    {
        data: [
            {
                name: 'previousAdmin',
                type: 'felt',
            },
            {
                name: 'newAdmin',
                type: 'felt',
            },
        ],
        keys: [],
        name: 'AdminChanged',
        type: 'event',
    },
    {
        inputs: [
            {
                name: 'factory',
                type: 'felt',
            },
            {
                name: 'proxy_admin',
                type: 'felt',
            },
        ],
        name: 'initializer',
        outputs: [],
        type: 'function',
    },
    {
        inputs: [],
        name: 'factory',
        outputs: [
            {
                name: 'address',
                type: 'felt',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [
            {
                name: 'tokenA',
                type: 'felt',
            },
            {
                name: 'tokenB',
                type: 'felt',
            },
        ],
        name: 'sort_tokens',
        outputs: [
            {
                name: 'token0',
                type: 'felt',
            },
            {
                name: 'token1',
                type: 'felt',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [
            {
                name: 'amountA',
                type: 'Uint256',
            },
            {
                name: 'reserveA',
                type: 'Uint256',
            },
            {
                name: 'reserveB',
                type: 'Uint256',
            },
        ],
        name: 'quote',
        outputs: [
            {
                name: 'amountB',
                type: 'Uint256',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [
            {
                name: 'amountIn',
                type: 'Uint256',
            },
            {
                name: 'reserveIn',
                type: 'Uint256',
            },
            {
                name: 'reserveOut',
                type: 'Uint256',
            },
        ],
        name: 'get_amount_out',
        outputs: [
            {
                name: 'amountOut',
                type: 'Uint256',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [
            {
                name: 'amountOut',
                type: 'Uint256',
            },
            {
                name: 'reserveIn',
                type: 'Uint256',
            },
            {
                name: 'reserveOut',
                type: 'Uint256',
            },
        ],
        name: 'get_amount_in',
        outputs: [
            {
                name: 'amountIn',
                type: 'Uint256',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [
            {
                name: 'amountIn',
                type: 'Uint256',
            },
            {
                name: 'path_len',
                type: 'felt',
            },
            {
                name: 'path',
                type: 'felt*',
            },
        ],
        name: 'get_amounts_out',
        outputs: [
            {
                name: 'amounts_len',
                type: 'felt',
            },
            {
                name: 'amounts',
                type: 'Uint256*',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [
            {
                name: 'amountOut',
                type: 'Uint256',
            },
            {
                name: 'path_len',
                type: 'felt',
            },
            {
                name: 'path',
                type: 'felt*',
            },
        ],
        name: 'get_amounts_in',
        outputs: [
            {
                name: 'amounts_len',
                type: 'felt',
            },
            {
                name: 'amounts',
                type: 'Uint256*',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [
            {
                name: 'tokenA',
                type: 'felt',
            },
            {
                name: 'tokenB',
                type: 'felt',
            },
            {
                name: 'amountADesired',
                type: 'Uint256',
            },
            {
                name: 'amountBDesired',
                type: 'Uint256',
            },
            {
                name: 'amountAMin',
                type: 'Uint256',
            },
            {
                name: 'amountBMin',
                type: 'Uint256',
            },
            {
                name: 'to',
                type: 'felt',
            },
            {
                name: 'deadline',
                type: 'felt',
            },
        ],
        name: 'add_liquidity',
        outputs: [
            {
                name: 'amountA',
                type: 'Uint256',
            },
            {
                name: 'amountB',
                type: 'Uint256',
            },
            {
                name: 'liquidity',
                type: 'Uint256',
            },
        ],
        type: 'function',
    },
    {
        inputs: [
            {
                name: 'tokenA',
                type: 'felt',
            },
            {
                name: 'tokenB',
                type: 'felt',
            },
            {
                name: 'liquidity',
                type: 'Uint256',
            },
            {
                name: 'amountAMin',
                type: 'Uint256',
            },
            {
                name: 'amountBMin',
                type: 'Uint256',
            },
            {
                name: 'to',
                type: 'felt',
            },
            {
                name: 'deadline',
                type: 'felt',
            },
        ],
        name: 'remove_liquidity',
        outputs: [
            {
                name: 'amountA',
                type: 'Uint256',
            },
            {
                name: 'amountB',
                type: 'Uint256',
            },
        ],
        type: 'function',
    },
    {
        inputs: [
            {
                name: 'amountIn',
                type: 'Uint256',
            },
            {
                name: 'amountOutMin',
                type: 'Uint256',
            },
            {
                name: 'path_len',
                type: 'felt',
            },
            {
                name: 'path',
                type: 'felt*',
            },
            {
                name: 'to',
                type: 'felt',
            },
            {
                name: 'deadline',
                type: 'felt',
            },
        ],
        name: 'swap_exact_tokens_for_tokens',
        outputs: [
            {
                name: 'amounts_len',
                type: 'felt',
            },
            {
                name: 'amounts',
                type: 'Uint256*',
            },
        ],
        type: 'function',
    },
    {
        inputs: [
            {
                name: 'amountOut',
                type: 'Uint256',
            },
            {
                name: 'amountInMax',
                type: 'Uint256',
            },
            {
                name: 'path_len',
                type: 'felt',
            },
            {
                name: 'path',
                type: 'felt*',
            },
            {
                name: 'to',
                type: 'felt',
            },
            {
                name: 'deadline',
                type: 'felt',
            },
        ],
        name: 'swap_tokens_for_exact_tokens',
        outputs: [
            {
                name: 'amounts_len',
                type: 'felt',
            },
            {
                name: 'amounts',
                type: 'Uint256*',
            },
        ],
        type: 'function',
    },
];
const factoryabi = [
    {
        data: [
            {
                name: 'implementation',
                type: 'felt',
            },
        ],
        keys: [],
        name: 'Upgraded',
        type: 'event',
    },
    {
        data: [
            {
                name: 'previousAdmin',
                type: 'felt',
            },
            {
                name: 'newAdmin',
                type: 'felt',
            },
        ],
        keys: [],
        name: 'AdminChanged',
        type: 'event',
    },
    {
        data: [
            {
                name: 'token0',
                type: 'felt',
            },
            {
                name: 'token1',
                type: 'felt',
            },
            {
                name: 'pair',
                type: 'felt',
            },
            {
                name: 'total_pairs',
                type: 'felt',
            },
        ],
        keys: [],
        name: 'PairCreated',
        type: 'event',
    },
    {
        inputs: [
            {
                name: 'pair_proxy_contract_class_hash',
                type: 'felt',
            },
            {
                name: 'pair_contract_class_hash',
                type: 'felt',
            },
            {
                name: 'fee_to_setter',
                type: 'felt',
            },
        ],
        name: 'initializer',
        outputs: [],
        type: 'function',
    },
    {
        inputs: [
            {
                name: 'token0',
                type: 'felt',
            },
            {
                name: 'token1',
                type: 'felt',
            },
        ],
        name: 'get_pair',
        outputs: [
            {
                name: 'pair',
                type: 'felt',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [],
        name: 'get_all_pairs',
        outputs: [
            {
                name: 'all_pairs_len',
                type: 'felt',
            },
            {
                name: 'all_pairs',
                type: 'felt*',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [],
        name: 'get_num_of_pairs',
        outputs: [
            {
                name: 'num_of_pairs',
                type: 'felt',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [],
        name: 'get_fee_to',
        outputs: [
            {
                name: 'address',
                type: 'felt',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [],
        name: 'get_fee_to_setter',
        outputs: [
            {
                name: 'address',
                type: 'felt',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [],
        name: 'get_pair_contract_class_hash',
        outputs: [
            {
                name: 'class_hash',
                type: 'felt',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [
            {
                name: 'tokenA',
                type: 'felt',
            },
            {
                name: 'tokenB',
                type: 'felt',
            },
        ],
        name: 'create_pair',
        outputs: [
            {
                name: 'pair',
                type: 'felt',
            },
        ],
        type: 'function',
    },
    {
        inputs: [
            {
                name: 'new_fee_to',
                type: 'felt',
            },
        ],
        name: 'set_fee_to',
        outputs: [],
        type: 'function',
    },
    {
        inputs: [
            {
                name: 'new_fee_to_setter',
                type: 'felt',
            },
        ],
        name: 'set_fee_to_setter',
        outputs: [],
        type: 'function',
    },
];
const pairabi = [
    {
        members: [
            {
                name: 'low',
                offset: 0,
                type: 'felt',
            },
            {
                name: 'high',
                offset: 1,
                type: 'felt',
            },
        ],
        name: 'Uint256',
        size: 2,
        type: 'struct',
    },
    {
        data: [
            {
                name: 'from_',
                type: 'felt',
            },
            {
                name: 'to',
                type: 'felt',
            },
            {
                name: 'value',
                type: 'Uint256',
            },
        ],
        keys: [],
        name: 'Transfer',
        type: 'event',
    },
    {
        data: [
            {
                name: 'owner',
                type: 'felt',
            },
            {
                name: 'spender',
                type: 'felt',
            },
            {
                name: 'value',
                type: 'Uint256',
            },
        ],
        keys: [],
        name: 'Approval',
        type: 'event',
    },
    {
        data: [
            {
                name: 'implementation',
                type: 'felt',
            },
        ],
        keys: [],
        name: 'Upgraded',
        type: 'event',
    },
    {
        data: [
            {
                name: 'previousAdmin',
                type: 'felt',
            },
            {
                name: 'newAdmin',
                type: 'felt',
            },
        ],
        keys: [],
        name: 'AdminChanged',
        type: 'event',
    },
    {
        data: [
            {
                name: 'from_address',
                type: 'felt',
            },
            {
                name: 'to_address',
                type: 'felt',
            },
            {
                name: 'amount',
                type: 'Uint256',
            },
        ],
        keys: [],
        name: 'Transfer',
        type: 'event',
    },
    {
        data: [
            {
                name: 'owner',
                type: 'felt',
            },
            {
                name: 'spender',
                type: 'felt',
            },
            {
                name: 'amount',
                type: 'Uint256',
            },
        ],
        keys: [],
        name: 'Approval',
        type: 'event',
    },
    {
        data: [
            {
                name: 'sender',
                type: 'felt',
            },
            {
                name: 'amount0',
                type: 'Uint256',
            },
            {
                name: 'amount1',
                type: 'Uint256',
            },
        ],
        keys: [],
        name: 'Mint',
        type: 'event',
    },
    {
        data: [
            {
                name: 'sender',
                type: 'felt',
            },
            {
                name: 'amount0',
                type: 'Uint256',
            },
            {
                name: 'amount1',
                type: 'Uint256',
            },
            {
                name: 'to',
                type: 'felt',
            },
        ],
        keys: [],
        name: 'Burn',
        type: 'event',
    },
    {
        data: [
            {
                name: 'sender',
                type: 'felt',
            },
            {
                name: 'amount0In',
                type: 'Uint256',
            },
            {
                name: 'amount1In',
                type: 'Uint256',
            },
            {
                name: 'amount0Out',
                type: 'Uint256',
            },
            {
                name: 'amount1Out',
                type: 'Uint256',
            },
            {
                name: 'to',
                type: 'felt',
            },
        ],
        keys: [],
        name: 'Swap',
        type: 'event',
    },
    {
        data: [
            {
                name: 'reserve0',
                type: 'Uint256',
            },
            {
                name: 'reserve1',
                type: 'Uint256',
            },
        ],
        keys: [],
        name: 'Sync',
        type: 'event',
    },
    {
        inputs: [
            {
                name: 'token0',
                type: 'felt',
            },
            {
                name: 'token1',
                type: 'felt',
            },
            {
                name: 'proxy_admin',
                type: 'felt',
            },
        ],
        name: 'initializer',
        outputs: [],
        type: 'function',
    },
    {
        inputs: [],
        name: 'name',
        outputs: [
            {
                name: 'name',
                type: 'felt',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [],
        name: 'symbol',
        outputs: [
            {
                name: 'symbol',
                type: 'felt',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [],
        name: 'totalSupply',
        outputs: [
            {
                name: 'totalSupply',
                type: 'Uint256',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [],
        name: 'decimals',
        outputs: [
            {
                name: 'decimals',
                type: 'felt',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [
            {
                name: 'account',
                type: 'felt',
            },
        ],
        name: 'balanceOf',
        outputs: [
            {
                name: 'balance',
                type: 'Uint256',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [
            {
                name: 'owner',
                type: 'felt',
            },
            {
                name: 'spender',
                type: 'felt',
            },
        ],
        name: 'allowance',
        outputs: [
            {
                name: 'remaining',
                type: 'Uint256',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [],
        name: 'token0',
        outputs: [
            {
                name: 'address',
                type: 'felt',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [],
        name: 'token1',
        outputs: [
            {
                name: 'address',
                type: 'felt',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [],
        name: 'get_reserves',
        outputs: [
            {
                name: 'reserve0',
                type: 'Uint256',
            },
            {
                name: 'reserve1',
                type: 'Uint256',
            },
            {
                name: 'block_timestamp_last',
                type: 'felt',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [],
        name: 'price_0_cumulative_last',
        outputs: [
            {
                name: 'res',
                type: 'Uint256',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [],
        name: 'price_1_cumulative_last',
        outputs: [
            {
                name: 'res',
                type: 'Uint256',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [],
        name: 'klast',
        outputs: [
            {
                name: 'res',
                type: 'Uint256',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [
            {
                name: 'recipient',
                type: 'felt',
            },
            {
                name: 'amount',
                type: 'Uint256',
            },
        ],
        name: 'transfer',
        outputs: [
            {
                name: 'success',
                type: 'felt',
            },
        ],
        type: 'function',
    },
    {
        inputs: [
            {
                name: 'sender',
                type: 'felt',
            },
            {
                name: 'recipient',
                type: 'felt',
            },
            {
                name: 'amount',
                type: 'Uint256',
            },
        ],
        name: 'transferFrom',
        outputs: [
            {
                name: 'success',
                type: 'felt',
            },
        ],
        type: 'function',
    },
    {
        inputs: [
            {
                name: 'spender',
                type: 'felt',
            },
            {
                name: 'amount',
                type: 'Uint256',
            },
        ],
        name: 'approve',
        outputs: [
            {
                name: 'success',
                type: 'felt',
            },
        ],
        type: 'function',
    },
    {
        inputs: [
            {
                name: 'spender',
                type: 'felt',
            },
            {
                name: 'added_value',
                type: 'Uint256',
            },
        ],
        name: 'increaseAllowance',
        outputs: [
            {
                name: 'success',
                type: 'felt',
            },
        ],
        type: 'function',
    },
    {
        inputs: [
            {
                name: 'spender',
                type: 'felt',
            },
            {
                name: 'subtracted_value',
                type: 'Uint256',
            },
        ],
        name: 'decreaseAllowance',
        outputs: [
            {
                name: 'success',
                type: 'felt',
            },
        ],
        type: 'function',
    },
    {
        inputs: [
            {
                name: 'to',
                type: 'felt',
            },
        ],
        name: 'mint',
        outputs: [
            {
                name: 'liquidity',
                type: 'Uint256',
            },
        ],
        type: 'function',
    },
    {
        inputs: [
            {
                name: 'to',
                type: 'felt',
            },
        ],
        name: 'burn',
        outputs: [
            {
                name: 'amount0',
                type: 'Uint256',
            },
            {
                name: 'amount1',
                type: 'Uint256',
            },
        ],
        type: 'function',
    },
    {
        inputs: [
            {
                name: 'amount0Out',
                type: 'Uint256',
            },
            {
                name: 'amount1Out',
                type: 'Uint256',
            },
            {
                name: 'to',
                type: 'felt',
            },
            {
                name: 'data_len',
                type: 'felt',
            },
            {
                name: 'data',
                type: 'felt*',
            },
        ],
        name: 'swap',
        outputs: [],
        type: 'function',
    },
    {
        inputs: [
            {
                name: 'to',
                type: 'felt',
            },
        ],
        name: 'skim',
        outputs: [],
        type: 'function',
    },
    {
        inputs: [],
        name: 'sync',
        outputs: [],
        type: 'function',
    },
];
let tempPairsSymbol = [];

function getDeadlineTime(deadlineMinutes) {
    const unixTimeSeconds = Math.floor(new Date().getTime() / 1000); // current Unix time in seconds
    const minutesInSeconds = deadlineMinutes * 60; // convert 20 minutes to seconds
    const newUnixTimeSeconds = unixTimeSeconds + minutesInSeconds; // add 20 minutes to the current Unix time
    return newUnixTimeSeconds;
}

// function getSymbolsForPairAddress(pairAddress) {
//     const pair = tempPairsSymbol.find((p) => p.pairAddress === pairAddress);
//     if (pair) {
//         return pair.token0SymbolData + '/' + pair.token1SymbolData;
//     }
//     return 'null/null';
// }

function getTokenAddressForPairAddress(pairAddress, token0or1) {
    const pair = tempPairsSymbol.find((p) => p.pairAddress === pairAddress);
    if (pair) {
        if (token0or1 == 0) {
            return pair.token0AddressData;
        } else {
            return pair.token1AddressData;
        }
    }
    return 0;
}

function getTokenAmountInEther(amount, decimals) {
    const tokenAmountInWei = new BigNumber(amount);
    const etherAmount = tokenAmountInWei.dividedBy(new BigNumber(10 ** decimals));
    return etherAmount.toFixed(6);
}

const PairComponent = ({
    allPairsLength,
    pairAddress,
    address,
    status,
    index,
    noLiquidityFound,
    setNoLiquidityFound,
    pairsSymbol,
}) => {
    const [liquidityBalance, setLiquidityBalance] = useState('');
    const [liquidityBalanceInWei, setLiquidityBalanceInWei] = useState(0);

    useEffect(() => {
        console.log('fetching data');
        const fetchData = async () => {
            if (status === 'connected') {
                const erc20Contract = new Contract(pairabi, pairAddress, provider);
                let liquidity_balance = await erc20Contract.call('balanceOf', [address]);
                let liquidity_balance_value = uint256.uint256ToBN(liquidity_balance.balance).toString();
                console.log('🚀 ~ file: index.js:1657 ~ fetchData ~ liquidity_balance_value:', liquidity_balance_value);

                let liquidity_totalSupply = await erc20Contract.call('totalSupply');
                let liquidity_totalSupply_value = uint256.uint256ToBN(liquidity_totalSupply.totalSupply).toString();
                console.log('🚀 ~ file: index.js:1660 ~ fetchData ~ liquidity_totalSupply:', liquidity_totalSupply);
                console.log(
                    '🚀 ~ file: index.js:1661 ~ fetchData ~ liquidity_totalSupply_value:',
                    liquidity_totalSupply_value,
                );

                let balancePoolRatio = liquidity_balance_value / liquidity_totalSupply_value;
                console.log('🚀 ~ file: index.js:1665 ~ fetchData ~ balancePoolRatio:', balancePoolRatio);

                let pairReserves = await erc20Contract.call('get_reserves');

                let reserve0Value = uint256.uint256ToBN(pairReserves.reserve0).toString();
                console.log('🚀 ~ file: index.js:1803 ~ fetchData ~ reserve0Value:', reserve0Value);

                let reserve1Value = uint256.uint256ToBN(pairReserves.reserve1).toString();
                console.log('🚀 ~ file: index.js:1805 ~ fetchData ~ reserve1Value:', reserve1Value);

                let token0_address = await erc20Contract.call('token0');
                let token1_address = await erc20Contract.call('token1');
                let token0AddressValue = number.toHex(token0_address.address).toString();
                let token1AddressValue = number.toHex(token1_address.address).toString();
                const token0ContractObj = new Contract(erc20abi, token0AddressValue, provider);
                let token0_decimals = await token0ContractObj.call('decimals');
                let token0DecimalsValue = token0_decimals.decimals.words[0];

                const token1ContractObj = new Contract(erc20abi, token1AddressValue, provider);
                let token1_decimals = await token1ContractObj.call('decimals');
                let token1DecimalsValue = token1_decimals.decimals.words[0];

                let token0lp = getTokenAmountInEther(balancePoolRatio * reserve0Value, token0DecimalsValue);
                console.log('🚀 ~ file: index.js:1676 ~ fetchData ~ token0lp:', token0lp);
                let token1lp = getTokenAmountInEther(balancePoolRatio * reserve1Value, token1DecimalsValue);
                console.log('🚀 ~ file: index.js:1678 ~ fetchData ~ token1lp:', token1lp);

                let liquidityBalanceInEtherValue = getTokenAmountInEther(
                    uint256.uint256ToBN(liquidity_balance.balance).toString(),
                    18,
                );
                setLiquidityBalance(token0lp + ' / ' + token1lp);
                setLiquidityBalanceInWei(uint256.uint256ToBN(liquidity_balance.balance).toString());
                if (liquidityBalanceInEtherValue != 0) {
                    setNoLiquidityFound(false);
                }
            }
        };
        fetchData();
    }, [status]);

    // REMOVE LIQUIDITY
    const calls = [
        {
            contractAddress: pairAddress,
            entrypoint: 'approve',
            calldata: [ROUTER_ADDRESS, liquidityBalanceInWei, 0],
        },
        {
            contractAddress: ROUTER_ADDRESS,
            entrypoint: 'remove_liquidity',
            calldata: [
                getTokenAddressForPairAddress(pairAddress, 0),
                getTokenAddressForPairAddress(pairAddress, 1),
                liquidityBalanceInWei,
                0,
                0,
                0,
                0,
                0,
                address,
                getDeadlineTime(10),
            ],
        },
    ];

    const handleRemoveLiquidity = () => {
        if (status == 'connected') {
            execute();
        }
    };
    const { execute } = useStarknetExecute({ calls });
    if (liquidityBalance != '0.000000 / 0.000000') {
        setNoLiquidityFound(false);
        console.log('🚀 ~ file: index.js:1775 ~ allPairsLength:', allPairsLength);
        console.log('🚀 ~ file: index.js:1775 ~ index:', index);
        console.log('🚀 ~ file: index.js:1731 ~ liquidityBalance:', liquidityBalance);
        console.log('==========================');
        return (
            <div className="row gap-5 a-center p-20 input-wrapper">
                <div className="body-one a-center row gap-30" style={{ flex: 'auto' }}>
                    <div className="row a-center flex-2">
                        {(() => {
                            const foundPair = pairsSymbol.find((p) => p.pairAddress === pairAddress);
                            console.log('🚀 ~ file: index.js:1734 ~ pairsSymbol:', pairsSymbol);
                            console.log('🚀 ~ file: index.js:1734 ~ foundPair:', foundPair);

                            const pairWithSymbols = foundPair
                                ? {
                                      ...foundPair,
                                      pairSymbol: `${foundPair.token0SymbolData}/${foundPair.token1SymbolData}`,
                                  }
                                : null;
                            console.log('🚀 ~ file: index.js:1737 ~ pairWithSymbols:', pairWithSymbols);
                            if (pairWithSymbols) {
                                return <h4>{pairWithSymbols.pairSymbol}</h4>;
                            }
                            return <h4>~ / ~</h4>;
                        })()}
                    </div>

                    <div className="col a-center flex-1">
                        <h5 className="body-one-title" style={{ color: '#747272' }}>
                            Liquidity Provided
                        </h5>
                        <h5>{liquidityBalance}</h5>
                    </div>
                    <div
                        className="row a-center flex-1 "
                        style={{ flex: 'none' }}
                        onClick={() => {
                            handleRemoveLiquidity();
                        }}
                    >
                        <h5 className="hover-primary-color">Remove</h5>
                    </div>
                </div>
            </div>
        );
    } else if (noLiquidityFound && index == allPairsLength) {
        return <h5 style={{ textAlign: 'center', marginTop: 20, marginBottom: 20 }}>No liquidity found</h5>;
    }
};

const MyPools = ({ allPairs, pairsSymbol }) => {
    const { isConnected: isConnectedEvm } = useActiveWeb3React();

    const { address, status } = useAccount();
    const [noLiquidityFound, setNoLiquidityFound] = useState(true);
    tempPairsSymbol = pairsSymbol;
    return (
        <div className="form-show" style={{ marginTop: 10 }}>
            <div className="col gap-10" style={{ gap: 2, marginTop: 0, marginBottom: 0 }}>
                {status == 'connected' || isConnectedEvm ? (
                    <div className="row gap-10" style={{ flexDirection: 'column', justifyContent: 'space-between' }}>
                        {allPairs.length == 0 ? (
                            <h4>Loading...</h4>
                        ) : (
                            allPairs.map((item, index) => (
                                <PairComponent
                                    key={index}
                                    index={index}
                                    pairsSymbol={pairsSymbol}
                                    allPairsLength={allPairs.length - 1}
                                    pairAddress={item}
                                    address={address}
                                    status={status}
                                    noLiquidityFound={noLiquidityFound}
                                    setNoLiquidityFound={setNoLiquidityFound}
                                />
                            ))
                        )}
                        {}
                    </div>
                ) : (
                    <h5 style={{ textAlign: 'center', marginTop: 20, marginBottom: 20 }}>
                        Connect wallet to view your pools
                    </h5>
                )}
            </div>
        </div>
    );
};

export default MyPools;
