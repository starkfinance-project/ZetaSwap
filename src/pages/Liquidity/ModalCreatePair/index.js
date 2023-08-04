import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import assets from '../../../assets';
import ModalSelectToken from '../ModalSelectToken';

import './style.scss';
import { useAccount, useContract, useStarknetCall, useStarknetExecute } from '@starknet-react/core';
import { RpcProvider, Provider, Contract, Account, ec, json, uint256, number } from 'starknet';
import BigNumber from 'bignumber.js';
import BigInt from 'big-integer';
import erc20 from '../../../assets/abi/erc20.js';
import router from '../../../assets/abi/router.js';
import Modal from 'antd/lib/modal/Modal';
// import PoolComponent from './Pools';

const FACTORY_ADDRESS = '0x594074315e98393351438011f5a558466f1733fde666f73f41738a39804c27';
const ROUTER_ADDRESS = '0x2d300192ea8d3291755bfd2bb2f9e16b38f48a20e4ce98e189d2daa7be435c2';

const provider = new Provider({ sequencer: { network: 'mainnet-alpha' } })
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
    const tokenAmountInWeiString = BigInt(tokenAmountInWei.toString()).value.toString();
    return tokenAmountInWeiString;
}

function getTokenAmountInEther(amount, decimals) {
    const tokenAmountInWei = new BigNumber(amount);
    const etherAmount = tokenAmountInWei.dividedBy(new BigNumber(10 ** decimals));
    return etherAmount.toFixed(6);
}

function getDeadlineTime(deadlineMinutes) {
    const unixTimeSeconds = Math.floor(new Date().getTime() / 1000); // current Unix time in seconds
    const minutesInSeconds = deadlineMinutes * 60; // convert 20 minutes to seconds
    const newUnixTimeSeconds = unixTimeSeconds + minutesInSeconds; // add 20 minutes to the current Unix time
    return newUnixTimeSeconds;
}

const FormSwap = ({ setIsShowCreatePair }) => {
    const { address, status } = useAccount();
    const [isShow, setIsShow] = useState(false);
    const [isShowSetting, setIsShowSetting] = useState(false);

    const navigate = useNavigate();

    // Token Picker
    const [token0, setToken0] = useState(mockDataTokenTest[0]);
    const [token1, setToken1] = useState(mockDataTokenTest[1]);
    useEffect(() => {
        console.log('token0', token0);
        console.log('token1', token1);
    }, [token0, token1]);
    const [typeModal, setTypeModal] = useState(1);

    const inputToken0Ref = useRef(null);
    const inputToken1Ref = useRef(null);

    // Token 0 Input Amount
    const [token0InputAmount, setToken0InputAmount] = useState(0);
    const handleToken0InputAmountChange = (event) => {
        setToken0InputAmount(getTokenAmountInWei(event.target.value, token0.decimals));
    };

    // Token 1 Input Amount
    const [token1InputAmount, setToken1InputAmount] = useState(0);
    const handleToken1InputAmountChange = (event) => {
        setToken1InputAmount(getTokenAmountInWei(event.target.value, token1.decimals));
    };

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

    // Deadline
    const [deadlineMinutes, setDeadlineMinutes] = useState(10);

    // Reset tokens input amount when change another token
    useEffect(() => {
        setToken0InputAmount(0);
        inputToken0Ref.current.value = '';
    }, [token0]);

    // Reset tokens input amount when change another token
    useEffect(() => {
        setToken1InputAmount(0);
        inputToken1Ref.current.value = '';
    }, [token1]);

    // /// GET BALANCE TOKEN 0

    // const { contract: token0Contract } = useContract({
    //     address: token0.address,
    //     abi: erc20.abi,
    // });

    // const { data: token0Balance } = useStarknetCall({
    //     contract: token0Contract,
    //     method: 'balanceOf',
    //     args: [address],
    //     options: {
    //         watch: false,
    //     },
    // });

    // useEffect(() => {
    //     if (token0Balance) {
    //         let token0BalanceInWei = uint256.uint256ToBN(token0Balance.balance).toString();
    //         let token0BalanceInEther = getTokenAmountInEther(token0BalanceInWei, token0.decimals);
    //         setToken0BalanceAmount(token0BalanceInEther);
    //     }
    // }, [token0Balance]);

    // /// GET BALANCE TOKEN 1

    // const { contract: token1Contract } = useContract({
    //     address: token1.address,
    //     abi: erc20.abi,
    // });

    // const { data: token1Balance } = useStarknetCall({
    //     contract: token1Contract,
    //     method: 'balanceOf',
    //     args: [address],
    //     options: {
    //         watch: false,
    //     },
    // });

    // useEffect(() => {
    //     if (token1Balance) {
    //         let token1BalanceInWei = uint256.uint256ToBN(token1Balance.balance).toString();
    //         let token1BalanceInEther = getTokenAmountInEther(token1BalanceInWei, token1.decimals);
    //         setToken1BalanceAmount(token1BalanceInEther);
    //     }
    // }, [token1Balance]);

    useEffect(() => {
        const fetchData = async () => {
            if (status === 'connected') {
                const erc20Contract = new Contract(erc20abi, token0.address, provider);
                let token0Balance = await erc20Contract.call('balanceOf', [address]);
                console.log("token0Balance", token0Balance);
                let token0BalanceInWei = uint256.uint256ToBN(token0Balance.balance).toString();
                console.log("token0BalanceInWei", token0BalanceInWei);
                let token0BalanceInEther = getTokenAmountInEther(token0BalanceInWei, token0.decimals);
                console.log("token0.decimals", token0.decimals);
                console.log("token0BalanceInEther", token0BalanceInEther);
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
            contractAddress: FACTORY_ADDRESS,
            entrypoint: 'create_pair',
            calldata: [token0.address, token1.address],
        },
        {
            contractAddress: token0.address,
            entrypoint: 'approve',
            calldata: [ROUTER_ADDRESS, token0InputAmount, 0],
        },
        {
            contractAddress: token1.address,
            entrypoint: 'approve',
            calldata: [ROUTER_ADDRESS, token1InputAmount, 0],
        },
        {
            contractAddress: ROUTER_ADDRESS,
            entrypoint: 'add_liquidity',
            calldata: [
                token0.address,
                token1.address,
                token0InputAmount,
                0,
                token1InputAmount,
                0,
                token0InputAmount,
                0,
                token1InputAmount,
                0,
                address,
                getDeadlineTime(deadlineMinutes),
            ],
        },
    ];
    const handleCreatePoolAddLiquidity = () => {
        if (status == 'connected') {
            execute();
        } else {
            alert('Please connect wallet');
        }
    };

    const { execute } = useStarknetExecute({ calls });

    /// GET OPTIMAL AMOUNT TOKEN 1 BEFORE ADD LIQUIDITY

    // const { contract: routerContract } = useContract({
    //     address: ROUTER_ADDRESS,
    //     abi: router.abi,
    // });

    // const { data: token1AmountOut } = useStarknetCall({
    //     contract: routerContract,
    //     method: 'get_amounts_out',
    //     args: [
    //         [token0InputAmount, 0],
    //         [token0.address, token1.address],
    //     ],
    //     options: {
    //         watch: false,
    //     },
    // });

    // useEffect(() => {
    //     if (token1AmountOut) {
    //         let token1OutputInWei = uint256.uint256ToBN(token1AmountOut.amounts[1]).toString();
    //         let token1OutputInEther = getTokenAmountInEther(token1OutputInWei, token1.decimals);
    //         setToken1OutputAmount(token1OutputInWei);
    //         setToken1OutputDisplayAmount(token1OutputInEther);
    //     }
    // }, [token1AmountOut]);

    // // CLEAR AMOUNT OUT WHEN CHANGE TOKEN 0 INPUT

    // useEffect(() => {
    //     setToken1OutputAmount(0);
    //     setToken1OutputDisplayAmount(0);
    // }, [token0InputAmount]);

    useEffect(() => {
        const fetchData = async () => {
            setToken1OutputAmount(0);
            setToken1OutputDisplayAmount('Loading');
            const routerContract = new Contract(routerabi, ROUTER_ADDRESS, provider);
            let token1AmountOut = await routerContract.call('get_amounts_out', [
                [token0InputAmount, 0],
                [token0.address, token1.address],
            ]);
            let token1OutputInWei = uint256.uint256ToBN(token1AmountOut.amounts[1]).toString();
            let token1OutputInEther = getTokenAmountInEther(token1OutputInWei, token1.decimals);
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
    return (
        <div className="form-wrapper col gap-10" style={{ gap: 2, margin: 0 }}>
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
            <div className="row j-between" style={{ margin: '10px 0' }}>
                <div className="row gap-10" style={{ marginBottom: 10 }}>
                    <h2 className="">Create Pair</h2>
                </div>
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
                            <img src={assets.svg.down_arrow} style={{ height: 20, width: 20 }} alt="down_arrow_icon" />
                        </div>
                    </div>
                    <div className="input-balance-wrapper">
                        <p>Balance: {token0BalanceAmount}</p>
                    </div>
                </div>
            </div>
            <div className="center icon-swap-wrapper" style={{ zIndex: 99 }}>
                <img src={assets.svg.plus} style={{ height: 20, width: 20 }} alt="plus_icon" />
            </div>
            <div className="input-wrapper">
                <div style={{ padding: 12 }}>
                    <div className="row">
                        {/* <h4 style={{ margin: 'auto' }}>{token1OutputDisplayAmount}</h4> */}
                        <input
                            placeholder="0.0"
                            type={'number'}
                            ref={inputToken1Ref}
                            onChange={handleToken1InputAmountChange}
                        />
                        <div
                            className="row gap-5 option-wrapper a-center p-10"
                            onClick={() => {
                                setTypeModal(2);
                                setIsShow(true);
                            }}
                        >
                            <img src={token1.icon} style={{ height: 30, width: 30 }} alt="eth_icon" />
                            <h5>{token1.name}</h5>
                            <img src={assets.svg.down_arrow} style={{ height: 20, width: 20 }} alt="down_arrow_icon" />
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
                    handleCreatePoolAddLiquidity();
                    setIsShowCreatePair(false);
                }}
            >
                <h4>Create Pair</h4>
            </div>
        </div>
    );
};

const ModalCreatePair = ({ isShowCreatePair, setIsShowCreatePair }) => {
    const { address, status } = useAccount();
    return (
        <Modal
            open={isShowCreatePair}
            footer={null}
            centered
            bodyStyle={{
                backgroundColor: '#000',
                overflow: 'auto',
                gap: 20,
            }}
            onCancel={() => {
                setIsShowCreatePair(false);
            }}
        >
            <div className="s-page" style={{ width: '100%' }}>
                <FormSwap setIsShowCreatePair={setIsShowCreatePair} />
            </div>
        </Modal>
    );
};

export default ModalCreatePair;
