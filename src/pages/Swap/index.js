import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import assets from '../../assets';
import Footer from '../../layouts/Footer';
import { route } from '../../routes/configs';
import ModalSelectToken from '../Liquidity/ModalSelectToken/index.js';
import './style.scss';
import { useAccount, useContract, useStarknetCall, useStarknetExecute } from '@starknet-react/core';
import { RpcProvider, Provider, Contract, Account, ec, json, uint256, number } from 'starknet';
import BigNumber from 'bignumber.js';
import BigInt from 'big-integer';
import erc20 from '../../assets/abi/erc20.js';
import router from '../../assets/abi/router.js';
import ModalSettingSwap from '../../components/ModalSettingSwap';
import useModalSettingSwap from '../../components/ModalSettingSwap/useModalSettingSwap';
import {
    Area,
    AreaChart,
    defs,
    LinearGradient,
    Stop,
    Bar,
    BarChart,
    CartesianGrid,
    Legend,
    Line,
    LineChart,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';
import dataChart from './res.json';
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import axios from 'axios';
import svg from '../../assets/svg';

import SwapPageEvm from '../../evm/pages/Swap';
import { useActiveWeb3React } from '../../evm/hooks/useActiveWeb3React';

const FACTORY_ADDRESS = '0x594074315e98393351438011f5a558466f1733fde666f73f41738a39804c27';
const ROUTER_ADDRESS = '0x2d300192ea8d3291755bfd2bb2f9e16b38f48a20e4ce98e189d2daa7be435c2';
// const provider = new RpcProvider({
//     nodeUrl: 'https://starknet-mainnet.infura.io/v3/6892505f20e24c1d86f9b3313f47ea74',
// });
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

function getDeadlineTime() {
    const unixTimeSeconds = Math.floor(new Date().getTime() / 1000); // current Unix time in seconds
    const fiveMinutesInSeconds = 20 * 60; // convert 20 minutes to seconds
    const newUnixTimeSeconds = unixTimeSeconds + fiveMinutesInSeconds; // add 20 minutes to the current Unix time
    return newUnixTimeSeconds;
}
const getCurrentDateInUTC = () => {
    const now = new Date();

    const year = now.getUTCFullYear();
    const month = String(now.getUTCMonth() + 1).padStart(2, '0');
    const day = String(now.getUTCDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
};

const FormSwap = ({ historicalPrices, setHistoricalPrices, setVol }) => {
    const { address, status } = useAccount();
    const [isShow, setIsShow] = useState(false);
    const navigate = useNavigate();

    const inputToken0Ref = useRef(null);

    // Token Picker
    const [token0, setToken0] = useState(mockDataTokenTest[0]);
    const [token1, setToken1] = useState(mockDataTokenTest[1]);
    const [typeModal, setTypeModal] = useState(1);

    // Token 0 Input Amount
    const [token0InputAmount, setToken0InputAmount] = useState(0);
    const initialRender = useRef(true);
    const handleToken0InputAmountChange = (event) => {
        if (event.target.value === '') {
            setToken0InputAmount(0);
            setToken1OutputAmount(0);
            setToken1OutputDisplayAmount(0);
        } else {
            setToken0InputAmount(getTokenAmountInWei(event.target.value, token0.decimals));
        }
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
    const handleSlippagePercentageChange = (event) => {
        let inputNumber = event.target.value;
        if (inputNumber < 0) {
            inputNumber = 0;
        }
        setSlippagePercentage(inputNumber);
    };

    const getHistoricalPrices = async () => {
        try {
            const response = await axios.get(
                `https://api.starksport.finance/api/historical-prices?tokenInAddress=${token0.address}&tokenOutAddress=${token1.address}`, // Fix to server query
            );
            setHistoricalPrices(response.data);
        } catch (error) {
            console.error('Error fetching historical prices:', error);
        }
    };

    // Reset token 0 input amount when change another token
    useEffect(() => {
        setToken0InputAmount(0);
        setToken1OutputAmount(0);
        setToken1OutputDisplayAmount(0);
        inputToken0Ref.current.value = '';
        if (token0.address && token1.address) {
            getHistoricalPrices();
        }
    }, [token0, token1]);

    useEffect(() => {
        async function getPairId(token0Address, token1Address) {
            let res = await axios.get(
                `https://api.starksport.finance/api/token-pairs/${token0Address}/${token1Address}`,
            );
            // setRowsData(res.data);
            // console.log("🚀 ~ file: index.js:560 ~ getPairId ~ res:", res.data)
            let vol = parseFloat(res.data).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            });
            console.log('🚀 ~ file: index.js:571 ~ getPairId ~ vol:', vol);
            setVol(vol);
        }
        getPairId(token0.address, token1.address);
    }, [token0, token1]);

    // Handle token change
    const handleChangeToken = async () => {
        const tempToken = token0;
        setToken0(token1);
        setToken1(tempToken);
        setToken0InputAmount(0);
        setToken1OutputAmount(0);
        setToken1OutputDisplayAmount(0);
    };

    /// SWAP
    const calls = [
        {
            contractAddress: token0.address,
            entrypoint: 'approve',
            calldata: [ROUTER_ADDRESS, token0InputAmount, 0],
        },
        {
            contractAddress: ROUTER_ADDRESS,
            entrypoint: 'swap_exact_tokens_for_tokens', // (amountIn, amountOutMin, path, to, deadline)
            // calldata: [token0InputAmount, 0, 0, 0, 2, token0.address, token1.address, address, getDeadlineTime()],
            calldata: [
                token0InputAmount,
                0,
                token1OutputAmount.toString(),
                0,
                2,
                token0.address,
                token1.address,
                address,
                getDeadlineTime(),
            ],
        },
    ];
    // console.log('🚀 ~ file: index.js:591 ~ FormSwap ~ token1OutputAmount:', token1OutputAmount);
    // console.log("🚀 ~ file: index.js:589 ~ FormSwap ~ (token1OutputAmount - token1OutputAmount * (slippagePercentage / 100)).toString():", (token1OutputAmount - token1OutputAmount * (slippagePercentage / 100)).toString())
    // console.log("token1OutputAmount - token1OutputAmount * (slippagePercentage / 100)", token1OutputAmount - token1OutputAmount * (slippagePercentage / 100));

    const handleSwap = () => {
        if (status == 'connected') {
            execute();
        } else {
            alert('Please connect wallet');
        }
    };

    const { execute } = useStarknetExecute({ calls });

    /// GET BALANCE TOKEN 0

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

    useEffect(() => {
        const fetchData = async () => {
            if (status === 'connected') {
                const erc20Contract = new Contract(erc20abi, token0.address, provider);
                let token0Balance = await erc20Contract.call('balanceOf', [address]);
                let token0BalanceInWei = uint256.uint256ToBN(token0Balance.balance).toString();
                let token0BalanceInEther = getTokenAmountInEther(token0BalanceInWei, token0.decimals);
                setToken0BalanceAmount(token0BalanceInEther);

                const erc20ContractToken1 = new Contract(erc20abi, token1.address, provider);
                let token1Balance = await erc20ContractToken1.call('balanceOf', [address]);
                let token1BalanceInWei = uint256.uint256ToBN(token1Balance.balance).toString();
                let token1BalanceInEther = getTokenAmountInEther(token1BalanceInWei, token1.decimals);
                setToken1BalanceAmount(token1BalanceInEther);
            }
        };
        fetchData();
    }, [status, token0.address, token1.address]);

    // useEffect(() => {
    //     if (token0Balance) {
    //         let token0BalanceInWei = uint256.uint256ToBN(token0Balance.balance).toString();
    //         let token0BalanceInEther = getTokenAmountInEther(token0BalanceInWei, token0.decimals);
    //         setToken0BalanceAmount(token0BalanceInEther);
    //     }
    // }, [token0Balance]);

    /// GET BALANCE TOKEN 1

    // const { contract: token1Contract } = useContract({
    //     address: token1.address,
    //     abi: erc20.abi,
    // });

    // const { data: token1Balance } = useStarknetCall({
    //     contract: token1Contract,
    //     method: 'balanceOf',
    //     args: [address],
    //     options: {
    //         watch: true,
    //     },
    // });

    // useEffect(() => {
    //     if (token1Balance) {
    //         let token1BalanceInWei = uint256.uint256ToBN(token1Balance.balance).toString();
    //         let token1BalanceInEther = getTokenAmountInEther(token1BalanceInWei, token1.decimals);
    //         setToken1BalanceAmount(token1BalanceInEther);
    //     }
    // }, [token1Balance]);

    /// GET AMOUNT OUT BEFORE SWAP

    useEffect(() => {
        if (initialRender.current) {
            initialRender.current = false;
        } else {
            console.log(token0InputAmount);
            const fetchData = async () => {
                const routerContract = new Contract(router.abi, ROUTER_ADDRESS, provider);
                console.log('routerContract', routerContract);
                let token1Output = await routerContract.call('get_amounts_out', [
                    [token0InputAmount, 0],
                    [token0.address, token1.address],
                ]);
                let token1OutputInWei = uint256.uint256ToBN(token1Output.amounts[1]).toString();
                let token1OutputInEther = getTokenAmountInEther(token1OutputInWei, token1.decimals);
                setToken1OutputAmount(token1OutputInWei);
                setToken1OutputDisplayAmount(token1OutputInEther);
            };
            if (token0InputAmount > 0) {
                setToken1OutputAmount('Loading');
                setToken1OutputDisplayAmount('Loading');
                fetchData();
            }
        }
    }, [token0InputAmount]);

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
    //         watch: true,
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

    // CLEAR AMOUNT OUT WHEN CHANGE TOKEN 0 INPUT

    // useEffect(() => {
    //     setToken1OutputAmount('Loading');
    //     setToken1OutputDisplayAmount('Loading');
    // }, [token0InputAmount]);

    const openModalSetting = () => {
        toggleSettingSwap();
    };

    const { isShowingSetting, toggleSettingSwap } = useModalSettingSwap();

    return (
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
            <ModalSettingSwap isShowing={isShowingSetting} hide={toggleSettingSwap} />

            <div className="row j-between" style={{ margin: '10px 0' }}>
                <div className="row gap-10" style={{ marginBottom: 10 }}>
                    <h4 className="hover-primary-color ">Swap</h4>
                    <h4
                        className="hover-primary-color title-noactive"
                        onClick={() => {
                            navigate('/liquidity');
                        }}
                    >
                        Liquidity
                    </h4>
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
                            <img src={assets.svg.down_arrow} style={{ height: 20, width: 20 }} alt="down_arrow_icon" />
                        </div>
                    </div>
                    <div className="input-balance-wrapper">
                        <p>Balance: {token0BalanceAmount}</p>
                    </div>
                </div>
            </div>

            <div
                className="center icon-swap-wrapper"
                style={{
                    marginTop: -20,
                    marginBottom: -20,
                    zIndex: 99,
                    border: '4px solid #26193c',
                    cursor: 'pointer',
                }}
                onClick={() => handleChangeToken()}
            >
                <img src={assets.svg.swap} style={{ height: 24, width: 24 }} alt="swap_icon" />
            </div>

            <div className="input-wrapper">
                <div style={{ padding: 12, marginTop: 10 }}>
                    <div className="row">
                        <h4 style={{ margin: 'auto' }}>~ {token1OutputDisplayAmount}</h4>
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
                    <div className="input-balance-wrapper" style={{ marginBottom: 0 }}>
                        <p>Balance: {token1BalanceAmount}</p>
                    </div>
                </div>
            </div>

            <div className="btn p-20" style={{ marginTop: 20 }} onClick={() => handleSwap()}>
                <h4>Swap</h4>
            </div>
        </div>
    );
};

const SwapPage = () => {
    const { address, status } = useAccount();
    const [vol, setVol] = useState(0);
    const [windowSize, setWindowSize] = useState({
        width: window.innerWidth,
        height: window.innerHeight,
    });
    const [historicalPrices, setHistoricalPrices] = useState([]);
    useEffect(() => {
        function handleResize() {
            setWindowSize({
                width: window.innerWidth,
                height: window.innerHeight,
            });
        }

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);
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
    const data = [
        { name: 'Tháng 1', doanhThu: 2400, chiPhi: 800, loiNhuan: 1600 },
        { name: 'Tháng 2', doanhThu: 1398, chiPhi: 1200, loiNhuan: 198 },
        { name: 'Tháng 3', doanhThu: 9800, chiPhi: 2000, loiNhuan: 7800 },
        { name: 'Tháng 4', doanhThu: 3908, chiPhi: 2780, loiNhuan: 1128 },
        { name: 'Tháng 5', doanhThu: 4800, chiPhi: 1890, loiNhuan: 2910 },
        { name: 'Tháng 6', doanhThu: 3800, chiPhi: 2390, loiNhuan: 1410 },
        { name: 'Tháng 7', doanhThu: 4300, chiPhi: 3490, loiNhuan: 810 },
    ];

    // const formatTimestamp = (dateStr) => {
    //     const months = [
    //         'January',
    //         'February',
    //         'March',
    //         'April',
    //         'May',
    //         'June',
    //         'July',
    //         'August',
    //         'September',
    //         'October',
    //         'November',
    //         'December',
    //     ];
    //     const date = new Date(Date.parse(dateStr));

    //     const day = date.getDate().toString().padStart(2, '0');
    //     const month = months[date.getMonth()];
    //     const year = date.getFullYear();
    //     const hours = date.getHours();
    //     const minutes = date.getMinutes().toString().padStart(2, '0');
    //     const seconds = date.getSeconds().toString().padStart(2, '0');
    //     const ampm = hours >= 12 ? 'PM' : 'AM';
    //     const formattedDate = `${month} ${day}, ${year} ${hours}:${minutes} ${ampm}`;
    //     return formattedDate;
    // };

    function formatTimestamp(timestamp) {
        const date = new Date(timestamp);
        const options = {
            year: 'numeric',
            month: 'long',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
        };

        const formattedDate = new Intl.DateTimeFormat('en-US', options).format(date);
        return formattedDate;
    }

    const formatPrice = (price) => {
        if (price != null) {
            return price.toFixed(6);
        }
        return 0;
    };

    function formatPrice2(price) {
        const formattedPrice = Number(price).toFixed(6);
        return formattedPrice;
    }

    function formatPrice3(price) {
        console.log('🚀 ~ file: index.js:1002 ~ formatPrice3 ~ price:', price);
        let formattedPrice = 0;
        if (price > 1) {
            formattedPrice = Number(price).toFixed(2);
        } else {
            formattedPrice = Number(price).toFixed(6);
        }
        return parseFloat(formattedPrice);
    }

    const convertToLocalTime = (timestamp) => {
        // Create a Date object from the given timestamp
        const date = new Date(timestamp);

        // Format the date and time
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');

        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    };

    const [priceSrt, setPriceSrt] = useState();
    const [dateCurrent, setDateCurrent] = useState();
    const [activeIndex, setActiveIndex] = useState(0);
    const [rowsData, setRowsData] = useState([]); // TODO

    useEffect(() => {
        if (historicalPrices && historicalPrices.length > 0) {
            setPriceSrt(formatPrice2(historicalPrices[historicalPrices.length - 1]?.price));
            setDateCurrent(formatTimestamp(historicalPrices[historicalPrices.length - 1]?.timestamp));

            // You can use the formatTimestamp() function here, assuming it's defined in your code
            // if (firstTimestamp) {
            //     setDateCurrent(formatTimestamp(firstTimestamp));
            // }
        }
        // setPriceSrt(formatPrice(historicalPrices[0].price));
        // setDateCurrent(formatTimestamp(historicalPrices[0].timestamp));
    }, [historicalPrices]);

    const handleMouseEnter = (index) => {
        setActiveIndex(index);
    };

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            setDateCurrent(formatTimestamp(payload[0].payload.timestamp));
            setPriceSrt(formatPrice2(payload[0].value));
            return (
                <div className="custom-tooltip">
                    <p>{formatTimestamp(payload[0].payload.timestamp)}</p>
                    <p className="label">{formatPrice2(payload[0].value)}</p>
                </div>
            );
        }
        return null;
    };

    function createData(name, calories, fat, carbs, protein) {
        return { name, calories, fat, carbs, protein };
    }

    useEffect(() => {
        async function getSwapTx() {
            let res = await axios.get(`https://api.starksport.finance/api/swap-transactions/latest`);
            setRowsData(res.data);
        }
        getSwapTx();
    }, []);

    // Handle short address type
    const shortAddress = (address) => {
        if (address) {
            // console.log('Current address:', address);
            const firstDigits = address.slice(0, 6);
            const lastDigits = address.slice(-4);

            const resultAddress = firstDigits + '...' + lastDigits;
            return resultAddress;
        }
    };

    const rows = [
        createData('Frozen yoghurt', 159, 6.0, 24, 4.0),
        createData('Ice cream sandwich', 237, 9.0, 37, 4.3),
        createData('Eclair', 262, 16.0, 24, 6.0),
        createData('Cupcake', 305, 3.7, 67, 4.3),
        createData('Gingerbread', 356, 16.0, 49, 3.9),
    ];

    const openInNewTab = (url) => {
        var win = window.open(url, '_blank');
        win.focus();
    };

    return (
        <div className="swap-page">
            <div className="row j-center gap-30 flex-wrap">
                <div className="chart-wrapper">
                    <div className="mb-50">
                        <h5 className="" style={{ marginTop: 12, color: 'grey' }}>
                            24h Vol: ${isNaN(vol) ? '0' : vol}
                        </h5>
                        <div className="row  flex-wrap a-end gap-20">
                            <h2 className="fz-40 fw-900 text-end cl-green">{priceSrt}</h2>
                            {/* <div className="row gap-20">
                                <h2 className="fz-20">AVAX/1INCH</h2>
                                <h2 className="fz-20">-1.29%</h2>
                            </div> */}
                        </div>
                        <h3 className="fz-16">{dateCurrent}</h3>
                    </div>
                    <AreaChart
                        width={windowSize.width > 600 ? 600 : windowSize.width - 80}
                        height={300}
                        data={historicalPrices}
                    >
                        <defs>
                            <linearGradient id="colorUv" x1="1" y1="1" x2="0" y2="0">
                                <stop offset="10%" stopColor="#fff" stopOpacity={0.9} />
                                <stop offset="100%" stopColor="#14ffe3" stopOpacity={0.9} />
                            </linearGradient>
                        </defs>
                        <XAxis dataKey="name" />
                        <YAxis domain={[historicalPrices[0] - 5, 'auto']} />
                        {/* <Legend /> */}

                        {/* <Line
                           
                            type="monotone"
                            dataKey="price"
                            stroke="#14ffe3"
                        /> */}
                        <Area
                            // activeDot={(e) => {
                            //     handleMouseEnter(e.index);
                            // }}
                            // onMouseEnter={(e) => {
                            //     console.log(e);
                            // }}
                            type="monotone"
                            dataKey="price"
                            stroke="#14ffe3"
                            fill="url(#colorUv)"
                        />
                        <Tooltip content={<CustomTooltip />} />
                    </AreaChart>
                </div>

                <FormSwap
                    historicalPrices={historicalPrices}
                    setHistoricalPrices={setHistoricalPrices}
                    setVol={setVol}
                />
            </div>

            {/* <div className="form-claim">
                <div className="row gap-10 a-center item-wrapper " style={{ marginTop: 10, marginBottom: 30 }}>
                    <h2 className="title-claim" style={{ margin: 'auto', fontWeight: 600, color: '#fff' }}>
                        CLAIM FREE TESTNET TOKEN
                    </h2>
                </div>
                <div style={{ width: 'auto' }}>
                    {mockDataTokenTest.map((item, index) => (
                        <div
                            className="row gap-10 a-center item-wrapper "
                            style={{
                                marginLeft: 'auto',
                                marginRight: 'auto',
                                marginTop: 20,
                                marginBottom: 20,
                                width: 140,
                            }}
                        >
                            <img src={item.icon} alt={item.name} style={{ height: 30, width: 30 }} />
                            <h4>
                                {item.freeToken} {item.name}
                            </h4>
                        </div>
                    ))}
                </div>
                <div
                    className="btn"
                    style={{
                        marginLeft: 'auto',
                        marginRight: 'auto',
                        marginTop: 30,
                        marginBottom: 10,
                        height: 40,
                        width: 120,
                    }}
                    onClick={() => handleClaimFreeToken()}
                >
                    <h4>Claim</h4>
                </div>
            </div> */}

            <div className="table-swap">
                <TableContainer component={Paper} style={{ background: '#0e0a1f' }}>
                    <Table sx={{}} aria-label="simple table">
                        <TableHead>
                            <TableRow>
                                {/* <TableCell style={{ textAlign: 'center' }}>ID</TableCell> */}
                                <TableCell style={{ textAlign: 'center' }}>Txhash</TableCell>
                                <TableCell style={{ textAlign: 'center' }}>Address</TableCell>
                                <TableCell style={{ textAlign: 'center' }}>From</TableCell>
                                <TableCell style={{ textAlign: 'center' }}>To</TableCell>
                                <TableCell style={{ textAlign: 'center' }}>Timestamp</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {rowsData.map((row) => (
                                <TableRow key={row.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                    {/* <TableCell style={{ textAlign: 'center' }} component="th" scope="row">
                                        {row.id}
                                    </TableCell> */}
                                    <TableCell
                                        style={{ textAlign: 'center', cursor: 'pointer' }}
                                        onClick={() => {
                                            openInNewTab(`https://starkscan.co/tx/` + row.tx_hash);
                                        }}
                                    >
                                        {shortAddress(row.tx_hash)}
                                        <img
                                            src={svg.link}
                                            style={{ height: 13, width: 13, marginLeft: 5, marginBottom: 15 }}
                                        />
                                    </TableCell>
                                    <TableCell style={{ textAlign: 'center' }}>
                                        {shortAddress(row.sender_address)}
                                    </TableCell>
                                    <TableCell style={{ textAlign: 'center' }}>
                                        {formatPrice3(row.amount_in) + ' ' + row.token_in_symbol}
                                    </TableCell>
                                    <TableCell style={{ textAlign: 'center' }}>
                                        {formatPrice3(row.amount_out) + ' ' + row.token_out_symbol}
                                    </TableCell>
                                    <TableCell style={{ textAlign: 'center' }}>
                                        {convertToLocalTime(row.transaction_timestamp)}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </div>
        </div>
    );
};

const WrapSwapPage = () => {
    const { isConnected: isConnectedEvm } = useActiveWeb3React();

    return isConnectedEvm ? <SwapPageEvm /> : <SwapPage />;
};

export default WrapSwapPage;
