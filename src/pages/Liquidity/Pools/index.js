import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import assets from '../../../assets';
import Footer from '../../../layouts/Footer';
import { route } from '../../../routes/configs';
import MyPools from '../MyPools';

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
// randomed not truth
const tokenNameSymbol = [
    {
        name: 'WBTC',
        id: 'bitcoin',
        src: assets.svg.btc,
        price: 27623,
        toFixed: 2,
    },
    {
        name: 'ETH',
        id: 'ethereum',
        src: assets.svg.eth,
        price: 1800,
        toFixed: 2,
    },
    {
        name: 'BNB',
        id: 'binance-coin',
        src: assets.images.bnb_icon,
        price: 278,
        toFixed: 2,
    },
    {
        name: 'SFN',
        id: 'dogecoin',
        src: assets.images.doge,
        price: 0.982,
        toFixed: 5,
    },
    {
        name: 'FTM',
        id: 'fantom',
        src: assets.images.ftm,
        price: 0.34,
        toFixed: 5,
    },
    {
        name: 'SHIB',
        id: 'shiba-inu',
        src: assets.images.shib,
        price: 0.0001,
        toFixed: 5,
    },
    {
        name: 'USDC',
        id: 'cardano',
        src: assets.images.ada,
        price: 1,
        toFixed: 5,
    },
    {
        name: 'XRP',
        id: 'xrp',
        src: assets.images.xrp,
        price: 0.35,
        toFixed: 5,
    },
];

var pairsSymbol = [];

function findTokenPriceByName(tokenName) {
    for (let i = 0; i < tokenNameSymbol.length; i++) {
        if (tokenNameSymbol[i].name == tokenName) {
            return tokenNameSymbol[i].price;
        }
    }
    return 1;
}

function getTokenAmountInEther(amount, decimals) {
    const tokenAmountInWei = new BigNumber(amount);
    const etherAmount = tokenAmountInWei.dividedBy(new BigNumber(10 ** decimals));
    return etherAmount.toFixed(6);
}

function hex2a(hexx) {
    var hex = hexx.toString(); //force conversion
    var str = '';
    for (var i = 0; i < hex.length; i += 2) str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    return str.substring(1); // remove whitespace in front
}

const getTokenSymbol = async (contractAddress) => {
    const provider = new Provider({ sequencer: { network: 'mainnet-alpha' } });
    const testAddress = contractAddress;
    const { abi: testAbi } = await provider.getClassAt(testAddress);
    if (testAbi === undefined) {
        throw new Error('no abi.');
    }
    const myTestContract = new Contract(testAbi, testAddress, provider);
    const tokenSymbol = await myTestContract.call('symbol');
    // hex2a(number.toHex(tokenSymbol.symbol));
    // console.log("🚀 ~ file: index.js:117 ~ getTokenSymbol ~ hex2a(number.toHex(tokenSymbol.symbol)):", hex2a(number.toHex(tokenSymbol.symbol)))
    return hex2a(number.toHex(tokenSymbol.symbol));
    // console.log('Initial balance =', uint256.uint256ToBN(bal1.totalSupply).toString());
};

const TVLComponent = ({ token0Symbol, token1Symbol, token0Reserve, token1Reserve }) => {
    console.log('🚀 ~ file: index.js:1695 ~ TVLComponent ~ token1Reserve:', token1Reserve);
    console.log('🚀 ~ file: index.js:1695 ~ TVLComponent ~ token0Reserve:', token0Reserve);
    const [token0TVL, setToken0TVL] = useState(0);
    const [token1TVL, setToken1TVL] = useState(0);
    const [TVL, setTVL] = useState(0);

    useEffect(() => {
        let token0Price = findTokenPriceByName(token0Symbol);
        console.log('🚀 ~ file: index.js:1703 ~ useEffect ~ token0Price:', token0Price);
        console.log('🚀 ~ file: index.js:1703 ~ useEffect ~ token0Symbol:', token0Symbol);
        let token1Price = findTokenPriceByName(token1Symbol);
        console.log('🚀 ~ file: index.js:1706 ~ useEffect ~ token1Price:', token1Price);
        console.log('🚀 ~ file: index.js:1704 ~ useEffect ~ token1Symbol:', token1Symbol);
        setToken0TVL(token0Price * token0Reserve);
        setToken1TVL(token1Price * token1Reserve);
    }, [token0Symbol, token1Symbol, token0Reserve, token1Reserve]);

    useEffect(() => {
        setTVL(
            Math.floor(token0TVL + token1TVL).toLocaleString('en-US', {
                style: 'currency',
                currency: 'USD',
                minimumFractionDigits: 2,
            }),
        );
        console.log('🚀 ~ file: index.js:1717 ~ TVLComponent ~ token0TVL, token1TVL:', token0TVL, token1TVL);
    }, [token0TVL, token1TVL]);
    return <h5>{TVL}</h5>;
};

const TokenPairComponent = ({ index, pairAddress, token0Address, token1Address, token0Reserve, token1Reserve }) => {
    const { address, status } = useAccount();
    // Get token symbols
    const [token0Symbol, setToken0Symbol] = useState(' - ');
    const [token1Symbol, setToken1Symbol] = useState(' - ');

    useEffect(() => {
        const fetchData = async () => {
            if (status === 'connected' && token0Address && token1Address) {
                const token0ContractObj = new Contract(erc20abi, token0Address, provider);
                let token0_symbol = await token0ContractObj.call('symbol');
                let token0SymbolValue = hex2a(number.toHex(token0_symbol.symbol));
                setToken0Symbol(token0SymbolValue);
                const token1ContractObj = new Contract(erc20abi, token1Address, provider);
                let token1_symbol = await token1ContractObj.call('symbol');
                let token1SymbolValue = hex2a(number.toHex(token1_symbol.symbol));
                setToken1Symbol(token1SymbolValue);
                if (token0SymbolValue && token1SymbolValue && index) {
                    pairsSymbol[index]['token0SymbolData'] = token0SymbolValue === undefined ? '' : token0SymbolValue;
                    pairsSymbol[index]['token1SymbolData'] = token1SymbolValue;
                }
            }
        };
        fetchData();
    }, [status, token0Address, token1Address]);

    return (
        <div className="body-one a-center row gap-20" style={{ flex: 'auto' }}>
            <div className="row a-center gap-10 flex-2">
                <h4>
                    {token0Symbol}/{token1Symbol}
                </h4>
            </div>
            <div className="col a-end flex-1">
                <h5 className="body-one-title" style={{ color: '#747272' }}>
                    Liquidity
                </h5>
                <TVLComponent
                    token0Symbol={token0Symbol}
                    token1Symbol={token1Symbol}
                    token0Reserve={token0Reserve}
                    token1Reserve={token1Reserve}
                />
            </div>
        </div>
    );
};

const PairComponent = ({ index, pairAddress }) => {
    const { address, status } = useAccount();
    // Get token addresses
    const [token0Address, setToken0Address] = useState();
    const [token1Address, setToken1Address] = useState();

    // Get reserves
    const [token0Reserve, setToken0Reserve] = useState(0);
    const [token1Reserve, setToken1Reserve] = useState(0);

    useEffect(() => {
        const fetchData = async () => {
            if (status === 'connected') {
                const pairContract = new Contract(pairabi, pairAddress, provider);
                let token0_address = await pairContract.call('token0');
                let token1_address = await pairContract.call('token1');
                let token0AddressValue = number.toHex(token0_address.address);
                let token1AddressValue = number.toHex(token1_address.address);
                setToken0Address(token0AddressValue);
                setToken1Address(token1AddressValue);
                if (index) {
                    pairsSymbol[index]['token0AddressData'] = token0AddressValue.toString();
                    pairsSymbol[index]['token1AddressData'] = token1AddressValue.toString();
                }
                const token0ContractObj = new Contract(erc20abi, token0AddressValue, provider);
                let token0_decimals = await token0ContractObj.call('decimals');
                let token0DecimalsValue = token0_decimals.decimals.words[0];

                const token1ContractObj = new Contract(erc20abi, token1AddressValue, provider);
                let token1_decimals = await token1ContractObj.call('decimals');
                let token1DecimalsValue = token1_decimals.decimals.words[0];
                //
                let reserves = await pairContract.call('get_reserves');
                setToken0Reserve(
                    getTokenAmountInEther(uint256.uint256ToBN(reserves.reserve0).toString(), token0DecimalsValue),
                );
                setToken1Reserve(
                    getTokenAmountInEther(uint256.uint256ToBN(reserves.reserve1).toString(), token1DecimalsValue),
                );
            }
        };
        fetchData();
    }, [status]);

    return (
        <div className="row gap-5 a-center px-20 py-10 input-wrapper">
            <TokenPairComponent
                index={index}
                pairAddress={pairAddress}
                token0Address={token0Address}
                token1Address={token1Address}
                token0Reserve={token0Reserve}
                token1Reserve={token1Reserve}
            />
        </div>
    );
};

const PoolComponent = ({ isShow, setIsShowCreatePair, setIsShowAddLiquidity }) => {
    const { isConnected: isConnectedEvm } = useActiveWeb3React();

    const { address, status } = useAccount();
    // 1. get_all_pairs​ in FACTORY
    const [allPairs, setAllPairs] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            if (status === 'connected') {
                const factoryContract = new Contract(factoryabi, FACTORY_ADDRESS, provider);
                let all_pairs = await factoryContract.call('get_all_pairs');
                let tempAllPairs = all_pairs.all_pairs;
                let tempArr = [];
                pairsSymbol = [];
                for (let index = 0; index < tempAllPairs.length; index++) {
                    let pair = number.toHex(tempAllPairs[index]);
                    tempArr.push(pair);
                    const pairContract = new Contract(pairabi, pair, provider);
                    let token0_address = await pairContract.call('token0');
                    let token1_address = await pairContract.call('token1');
                    let token0AddressValue = number.toHex(token0_address.address).toString();
                    let token1AddressValue = number.toHex(token1_address.address).toString();
                    const token0ContractObj = new Contract(erc20abi, token0AddressValue, provider);
                    let token0_symbol = await token0ContractObj.call('symbol');
                    let token0SymbolValue = hex2a(number.toHex(token0_symbol.symbol));
                    const token1ContractObj = new Contract(erc20abi, token1AddressValue, provider);
                    let token1_symbol = await token1ContractObj.call('symbol');
                    let token1SymbolValue = hex2a(number.toHex(token1_symbol.symbol));
                    pairsSymbol.push({
                        pairAddress: pair,
                        token0AddressData: token0AddressValue,
                        token1AddressData: token1AddressValue,
                        token0SymbolData: token0SymbolValue,
                        token1SymbolData: token1SymbolValue,
                    });
                }
                setAllPairs(tempArr);
            }
        };
        fetchData();
    }, [status]);
    const params = useParams();
    const [activeTab, setActiveTab] = useState(true);

    useEffect(() => {
        if (params.activeTab == '1') setActiveTab(false);
        else setActiveTab(true);
    }, [params]);

    const handleActiveTab = (status) => {
        setActiveTab(status);
    };

    return (
        <div className="pool-page">
            <div className="form-wrapper col gap-10" style={{ gap: 2, marginTop: 0, marginBottom: 0 }}>
                <div
                    className="row j-between"
                    style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', margin: '10px 0', alignItems: 'baseline' }}
                >
                    <div className="row gap-10">
                        <div
                            className="row gap-10 cursor-pointer"
                            style={{ marginBottom: 10 }}
                            onClick={() => {
                                handleActiveTab(true);
                            }}
                        >
                            <h3 style={{ color: !activeTab ? 'gray' : 'white' }}>Overview</h3>
                        </div>
                        <div
                            className="row gap-10 cursor-pointer"
                            style={{ marginBottom: 10 }}
                            onClick={() => {
                                handleActiveTab(false);
                            }}
                        >
                            <h3 style={{ color: activeTab ? 'gray' : 'white' }}>Your liquidity</h3>
                        </div>
                    </div>

                    {status == 'connected' || isConnectedEvm ? (
                        <div className="row gap-10">
                            {!isConnectedEvm && (
                                <div
                                    className="btn"
                                    style={{}}
                                    onClick={() => {
                                        setIsShowCreatePair(true);
                                    }}
                                >
                                    <h4>Create Pair</h4>
                                </div>
                            )}
                            <div
                                className="btn"
                                style={{}}
                                onClick={() => {
                                    setIsShowAddLiquidity(true);
                                }}
                            >
                                <h4>Add Liquidity</h4>
                            </div>
                        </div>
                    ) : (
                        <></>
                    )}
                </div>

                {activeTab ? (
                    <div className="form-show">
                        {status == 'connected' || isConnectedEvm ? (
                            <div
                                className="row gap-10"
                                style={{ flexDirection: 'column', justifyContent: 'space-between' }}
                            >
                                {allPairs.length == 0 ? (
                                    <h4>Loading...</h4>
                                ) : (
                                    allPairs.map((item, index) => (
                                        <PairComponent key={index} index={index} pairAddress={item} />
                                    ))
                                )}
                                {}
                            </div>
                        ) : (
                            <h5 style={{ textAlign: 'center', marginTop: 20, marginBottom: 20 }}>
                                Connect wallet to view all pools
                            </h5>
                        )}
                    </div>
                ) : (
                    <>
                        <MyPools allPairs={allPairs} pairsSymbol={pairsSymbol} />
                    </>
                )}
            </div>
        </div>
    );
};

export default PoolComponent;
