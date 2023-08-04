import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import assets from '../../assets';
import Footer from '../../layouts/Footer';
import { route } from '../../routes/configs';
import ModalSelectToken from './ModalSelectToken';
import './style.scss';
import { useAccount, useContract, useStarknetCall, useStarknetExecute } from '@starknet-react/core';
import { RpcProvider, Provider, Contract, Account, ec, json, uint256, number } from 'starknet';
import BigNumber from 'bignumber.js';
import BigInt from 'big-integer';
import erc20 from '../../assets/abi/erc20.js';
import router from '../../assets/abi/router.js';
import useModalSettingSwap from '../../components/ModalSettingSwap/useModalSettingSwap';
import ModalSettingSwap from '../../components/ModalSettingSwap';
import PoolComponent from './Pools';
import ModalCreatePair from './ModalCreatePair';
import { Modal } from 'antd';

import { useActiveWeb3React } from '../../evm/hooks/useActiveWeb3React';
import LiquidityPageEvm from '../../evm/pages/Liquidity';

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
const mockDataTokenTest = [
    {
        name: 'WBTC',
        icon: assets.svg.btc,
        address: '0x3fe2b97c1fd336e750087d68b9b867997fd64a2661ff3ca5a7c771641e8e7ac',
        decimals: 8,
        freeToken: 1,
    },
    {
        name: 'ETH',
        icon: assets.images.eth,
        address: '0x49d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7',
        decimals: 18,
        freeToken: 10000,
    },
    {
        name: 'USDC',
        icon: assets.images.usdc,
        address: '0x53c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8',
        decimals: 6,
        freeToken: 5000,
    },
    {
        name: 'USDT',
        icon: assets.images.usdt,
        address: '0x68f5c6a61780768455de69077e07e89787839bf8166decfbf92b645209c0fb8',
        decimals: 6,
        freeToken: 10000,
    },
    {
        name: 'DAI',
        icon: assets.images.dai,
        address: '0xda114221cb83fa859dbdb4c44beeaa0bb37c7537ad5ae66fe5e0efd20e6eb3',
        decimals: 18,
        freeToken: 10000,
    },
    {
        name: 'SFN',
        icon: assets.images.newlogo,
        address: '0x482c9ba8eac039eba45c875eeac660eb91768ca4a32cf3c5ae804cc62dccd2',
        decimals: 18,
        freeToken: 10000,
    },
];

function getTokenAmountInWei(amount, decimals) {
    const base = new BigNumber(10).exponentiatedBy(decimals);
    const tokenAmountInWei = new BigNumber(amount).multipliedBy(base);
    const tokenAmountInWeiRounded = tokenAmountInWei.toFixed(0); // Round to nearest whole number
    const tokenAmountInWeiString = BigInt(tokenAmountInWeiRounded).toString();
    return tokenAmountInWeiString;
}

function getTokenAmountInEther(amount, decimals) {
    const tokenAmountInWei = new BigNumber(amount);
    const etherAmount = tokenAmountInWei.dividedBy(new BigNumber(10 ** decimals));
    return etherAmount.toFixed(6);
}

function getDeadlineTime() {
    const unixTimeSeconds = Math.floor(new Date().getTime() / 1000); // current Unix time in seconds
    const fiveMinutesInSeconds = 20 * 60; // convert 20 minutes to seconds
    const newUnixTimeSeconds = unixTimeSeconds + fiveMinutesInSeconds; // add 20 minutes to the current Unix time
    return newUnixTimeSeconds;
}

const FormSwap = ({ isShowAddLiquidity, setIsShowAddLiquidity }) => {
    const { address, status } = useAccount();
    const [isShow, setIsShow] = useState(false);
    const navigate = useNavigate();

    // Token Picker
    const [token0, setToken0] = useState(mockDataTokenTest[0]);
    const [token1, setToken1] = useState(mockDataTokenTest[1]);
    const [typeModal, setTypeModal] = useState(1);

    const inputToken0Ref = useRef(null);
    const inputToken1Ref = useRef(null);

    // Token 0 Input Amount
    const [token0InputAmount, setToken0InputAmount] = useState(0);
    const handleToken0InputAmountChange = (event) => {
        if (event.target.value == '') {
            setToken1OutputAmount(0);
            setToken1OutputDisplayAmount(0);
        } else {
            setToken0InputAmount(getTokenAmountInWei(event.target.value, token0.decimals));
        }
    };

    // Token 1 Input Amount
    // const [token1InputAmount, setToken1InputAmount] = useState(0);
    // const handleToken1InputAmountChange = (event) => {
    //     setToken1InputAmount(getTokenAmountInWei(event.target.value, token1.decimals));
    // };

    // Token 1 Output Amount
    const [token1OutputAmount, setToken1OutputAmount] = useState(0);

    // Token 1 Output Display Amount
    const [token1OutputDisplayAmount, setToken1OutputDisplayAmount] = useState(0);

    // Token 0 Balance
    const [token0BalanceAmount, setToken0BalanceAmount] = useState(0);

    // Token 1 Balance
    const [token1BalanceAmount, setToken1BalanceAmount] = useState(0);

    // Slippage
    const [slippagePercentage, setSlippagePercentage] = useState(0.5);
    const handleSlippagePercentageChange = (event) => {
        let inputNumber = event.target.value;
        if (inputNumber < 0) {
            inputNumber = 0;
        }
        setSlippagePercentage(inputNumber);
    };

    // Reset tokens input amount when change another token
    useEffect(() => {
        try {
            setToken0InputAmount(0);
            setToken1OutputAmount(0);
            setToken1OutputDisplayAmount(0);
            inputToken0Ref.current.value = '';
        } catch (err) {}
    }, [token0, token1]);

    useEffect(() => {
        const fetchData = async () => {
            if (status === 'connected') {
                const erc20Contract = new Contract(erc20abi, token0.address, provider);
                let token0Balance = await erc20Contract.call('balanceOf', [address]);
                let token0BalanceInWei = uint256.uint256ToBN(token0Balance.balance).toString();
                let token0BalanceInEther = getTokenAmountInEther(token0BalanceInWei, token0.decimals);
                setToken0BalanceAmount(token0BalanceInEther);

                const erc201Contract = new Contract(erc20abi, token1.address, provider);
                let token1Balance = await erc201Contract.call('balanceOf', [address]);
                let token1BalanceInWei = uint256.uint256ToBN(token1Balance.balance).toString();
                let token1BalanceInEther = getTokenAmountInEther(token1BalanceInWei, token1.decimals);
                setToken1BalanceAmount(token1BalanceInEther);
            }
        };
        fetchData();
    }, [status, token0.address, token1.address]);

    /// ADD LIQUIDITY
    const calls = [
        {
            contractAddress: token0.address,
            entrypoint: 'approve',
            calldata: [ROUTER_ADDRESS, token0InputAmount, 0],
        },
        {
            contractAddress: token1.address,
            entrypoint: 'approve',
            calldata: [ROUTER_ADDRESS, token1OutputAmount, 0],
        },
        {
            contractAddress: ROUTER_ADDRESS,
            entrypoint: 'add_liquidity',
            calldata: [
                token0.address,
                token1.address,
                token0InputAmount,
                0,
                token1OutputAmount,
                0,
                0,
                0,
                0,
                0,
                address,
                getDeadlineTime(),
            ],
        },
    ];

    const handleAddLiquidity = () => {
        if (status == 'connected') {
            execute();
        } else {
            alert('Please connect wallet');
        }
    };

    const { execute } = useStarknetExecute({ calls });

    useEffect(() => {
        const fetchData = async () => {
            setToken1OutputAmount(0);
            setToken1OutputDisplayAmount('Loading');
            const factoryContract = new Contract(factoryabi, FACTORY_ADDRESS, provider);
            let pairAddress = await factoryContract.call('get_pair', [token0.address, token1.address]);
            let pairAddressValue = number.toHex(pairAddress.pair);

            const pairContract = new Contract(pairabi, pairAddressValue, provider);
            let pairToken0 = await pairContract.call('token0');
            let pairToken0Address = number.toHex(pairToken0.address);

            let pairToken1 = await pairContract.call('token1');
            let pairToken1Address = number.toHex(pairToken1.address);

            let pairReserves = await pairContract.call('get_reserves');
            let reserve0Value = uint256.uint256ToBN(pairReserves.reserve0).toString();
            console.log('🚀 ~ file: index.js:1803 ~ fetchData ~ reserve0Value:', reserve0Value);
            let reserve1Value = uint256.uint256ToBN(pairReserves.reserve1).toString();
            console.log('🚀 ~ file: index.js:1805 ~ fetchData ~ reserve1Value:', reserve1Value);
            let reserveRatio;
            console.log('🚀 ~ file: index.js:1810 ~ fetchData ~ pairToken0Address:', pairToken0Address);
            console.log('🚀 ~ file: index.js:1810 ~ fetchData ~ token0.address:', token0.address);
            console.log('🚀 ~ file: index.js:1816 ~ fetchData ~ token1.address:', token1.address);
            if (token0.address.slice(-10) === pairToken0Address.slice(-10)) {
                reserveRatio =
                    getTokenAmountInEther(reserve0Value, token0.decimals) /
                    getTokenAmountInEther(reserve1Value, token1.decimals);
                console.log(
                    '🚀 ~ file: index.js:1817 ~ fetchData ~ getTokenAmountInEther(reserve1Value, token1.decimals):',
                    getTokenAmountInEther(reserve1Value, token1.decimals),
                );
                console.log(
                    '🚀 ~ file: index.js:1817 ~ fetchData ~ getTokenAmountInEther(reserve0Value, token0.decimals):',
                    getTokenAmountInEther(reserve0Value, token0.decimals),
                );
            } else if (token1.address.slice(-10) === pairToken0Address.slice(-10)) {
                reserveRatio =
                    getTokenAmountInEther(reserve1Value, token0.decimals) /
                    getTokenAmountInEther(reserve0Value, token1.decimals);
                console.log(
                    '🚀 ~ file: index.js:1819 ~ fetchData ~ getTokenAmountInEther(reserve0Value, token1.decimals):',
                    getTokenAmountInEther(reserve0Value, token1.decimals),
                );
                console.log(
                    '🚀 ~ file: index.js:1819 ~ fetchData ~ getTokenAmountInEther(reserve1Value, token0.decimals):',
                    getTokenAmountInEther(reserve1Value, token0.decimals),
                );
            }
            console.log('🚀 ~ file: index.js:1811 ~ fetchData ~ reserveRatio:', reserveRatio);

            // // let reserves = await
            // // const routerContract = new Contract(routerabi, ROUTER_ADDRESS, provider);
            // let token1AmountOut = await routerContract.call('get_amounts_out', [
            //     [token0InputAmount, 0],
            //     [token0.address, token1.address],
            // ]);
            let token1OutputInEther = getTokenAmountInEther(token0InputAmount, token0.decimals) / reserveRatio;
            console.log('🚀 ~ file: index.js:1821 ~ fetchData ~ token0InputAmount:', token0InputAmount);
            console.log(
                '🚀 ~ file: index.js:1821 ~ fetchData ~ getTokenAmountInEther(token0InputAmount, token0.decimals):',
                getTokenAmountInEther(token0InputAmount, token0.decimals),
            );
            console.log('🚀 ~ file: index.js:1821 ~ fetchData ~ token1OutputInEther:', token1OutputInEther);
            let token1OutputInWei = getTokenAmountInWei(token1OutputInEther, token1.decimals);
            console.log('🚀 ~ file: index.js:1830 ~ fetchData ~ token1OutputInWei:', token1OutputInWei);
            setToken1OutputAmount(token1OutputInWei);
            setToken1OutputDisplayAmount(token1OutputInEther);
        };

        if (token0InputAmount == 0 || token0InputAmount == undefined || isNaN(token0InputAmount)) {
            setToken1OutputAmount(0);
            setToken1OutputDisplayAmount(0);
        } else {
            fetchData();
        }
    }, [token0InputAmount]);

    // CLEAR AMOUNT OUT WHEN CHANGE TOKEN 0 INPUT

    // useEffect(() => {
    //     setToken1OutputAmount(0);
    //     setToken1OutputDisplayAmount(0);
    // }, [token0InputAmount]);

    const openModalSetting = () => {
        toggleSettingSwap();
    };

    const { isShowingSetting, toggleSettingSwap } = useModalSettingSwap();

    return (
        <Modal
            open={isShowAddLiquidity}
            footer={null}
            centered
            bodyStyle={{
                backgroundColor: '#000',
                overflow: 'auto',
                gap: 20,
            }}
            onCancel={() => {
                setIsShowAddLiquidity(false);
            }}
        >
            <div className="form-wrapper col gap-10" style={{ gap: 2 }}>
                <ModalSelectToken
                    isShow={isShow}
                    setIsShow={setIsShow}
                    token0={token0}
                    token1={token1}
                    setToken0={setToken0}
                    setToken1={setToken1}
                    mockDataTokenTest={mockDataTokenTest}
                    typeModal={typeModal}
                />
                <div style={{ height: 20 }}> </div>
                <ModalSettingSwap isShowing={isShowingSetting} hide={toggleSettingSwap} />
                <div className="row j-between" style={{ margin: '10px 0' }}>
                    <div className="row gap-10" style={{ marginBottom: 10 }}>
                        <h4
                            className="hover-primary-color title-noactive"
                            onClick={() => {
                                navigate(route.swap);
                            }}
                        >
                            Swap
                        </h4>
                        <h4 className="hover-primary-color">Liquidity</h4>
                    </div>
                    <div
                        className="btn__setting row gap-10 center"
                        style={{ marginBottom: 10 }}
                        onClick={() => {
                            openModalSetting();
                        }}
                    >
                        <img src={assets.svg.setting} style={{ width: 15, height: 15 }} />
                    </div>
                    {/* <div style={{ height: 20, width: 20 }}>
                    <img src={assets.svg.setting} />
                </div> */}
                </div>
                <div className="input-wrapper">
                    <div style={{ padding: 12 }}>
                        <div className="row">
                            <input
                                placeholder="0.0"
                                type={'number'}
                                ref={inputToken0Ref}
                                onChange={handleToken0InputAmountChange}
                            />
                            <div
                                className="row gap-5 option-wrapper a-center p-10"
                                onClick={() => {
                                    setTypeModal(1);
                                    setIsShow(true);
                                }}
                            >
                                <img src={token0.icon} style={{ height: 30, width: 30 }} alt="eth_icon" />
                                <h5>{token0.name}</h5>
                                <img
                                    src={assets.svg.down_arrow}
                                    style={{ height: 20, width: 20 }}
                                    alt="down_arrow_icon"
                                />
                            </div>
                        </div>
                        <div className="input-balance-wrapper">
                            <p>Balance: {token0BalanceAmount}</p>
                        </div>
                    </div>
                </div>
                <div className="center icon-swap-wrapper" style={{ zIndex: 99 }}>
                    <img src={assets.svg.plus} style={{ height: 20, width: 20 }} alt="swap_icon" />
                </div>
                <div className="input-wrapper">
                    <div style={{ padding: 12 }}>
                        <div className="row">
                            {/* <input placeholder="0.0" type={'number'} ref={inputToken1Ref} onChange={handleToken1InputAmountChange} /> */}
                            <h4 style={{ margin: 'auto' }}>{token1OutputDisplayAmount}</h4>
                            <div
                                className="row gap-5 option-wrapper a-center p-10"
                                onClick={() => {
                                    setTypeModal(2);
                                    setIsShow(true);
                                }}
                            >
                                <img src={token1.icon} style={{ height: 30, width: 30 }} alt="eth_icon" />
                                <h5>{token1.name}</h5>
                                <img
                                    src={assets.svg.down_arrow}
                                    style={{ height: 20, width: 20 }}
                                    alt="down_arrow_icon"
                                />
                            </div>
                        </div>
                        <div className="input-balance-wrapper">
                            <p>Balance: {token1BalanceAmount}</p>
                        </div>
                    </div>
                </div>
                <div
                    className="btn"
                    style={{ marginTop: 20 }}
                    onClick={() => {
                        handleAddLiquidity();
                    }}
                >
                    <h4>Add Liquidity</h4>
                </div>
            </div>
        </Modal>
    );
};

const LiquidityPage = () => {
    const { address, status } = useAccount();
    const [isShowCreatePair, setIsShowCreatePair] = useState(false);
    const [isShowAddLiquidity, setIsShowAddLiquidity] = useState(false);

    /// CLAIM FREE TOKENS
    const calls = [
        {
            contractAddress: mockDataTokenTest[0].address,
            entrypoint: 'mint',
            calldata: [address, getTokenAmountInWei(mockDataTokenTest[0].freeToken, mockDataTokenTest[0].decimals), 0],
        },
        {
            contractAddress: mockDataTokenTest[1].address,
            entrypoint: 'mint',
            calldata: [address, getTokenAmountInWei(mockDataTokenTest[1].freeToken, mockDataTokenTest[1].decimals), 0],
        },
        {
            contractAddress: mockDataTokenTest[2].address,
            entrypoint: 'mint',
            calldata: [address, getTokenAmountInWei(mockDataTokenTest[2].freeToken, mockDataTokenTest[2].decimals), 0],
        },
    ];

    const handleClaimFreeToken = () => {
        if (status == 'connected') {
            execute();
        } else {
            alert('Please connect wallet');
        }
    };

    const { execute } = useStarknetExecute({ calls });
    return (
        <div className="liquidity-page">
            <ModalCreatePair isShowCreatePair={isShowCreatePair} setIsShowCreatePair={setIsShowCreatePair} />
            <FormSwap setIsShowAddLiquidity={setIsShowAddLiquidity} isShowAddLiquidity={isShowAddLiquidity} />
            <PoolComponent
                isShowCreatePair={isShowCreatePair}
                setIsShowAddLiquidity={setIsShowAddLiquidity}
                setIsShowCreatePair={setIsShowCreatePair}
            />
        </div>
    );
};

const WrapLiquidityPage = () => {
    const { isConnected: isConnectedEvm } = useActiveWeb3React();

    return isConnectedEvm ? <LiquidityPageEvm /> : <LiquidityPage />;
};

export default WrapLiquidityPage;
