import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { useAccount, useStarknetExecute } from '@starknet-react/core';
import axios from 'axios';
import { BigNumber } from '@ethersproject/bignumber';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Area, AreaChart, Tooltip, XAxis, YAxis } from 'recharts';
import { Contract, Provider, uint256 } from 'starknet';
import router from '../../../assets/abi/router.js';
import ModalSettingSwap from '../../../components/ModalSettingSwap';
import useModalSettingSwap from '../../../components/ModalSettingSwap/useModalSettingSwap';
import assets from '../../../assets';
import svg from '../../../assets/svg';
import ModalSelectToken from '../Liquidity/ModalSelectToken/index.js';
import './style.scss';
import {
    Field,
    ROUTER_ADDRESS,
    TOKEN_ICON_LIST,
    TOKEN_LIST,
    UNKNOWN_TOKEN_ICON,
    WETH,
} from '../../configs/networks.js';
import { Token, TokenAmount } from '@uniswap/sdk';
import { Fraction } from '@uniswap/sdk-core';
import { parseUnits } from '@ethersproject/units';
import { useActiveWeb3React } from '../../hooks/useActiveWeb3React.js';
import useListTokens from '../../hooks/useListTokens.js';
import { EmptyPool, getCurrencyBalances, getPoolInfo } from '../../state/liquidity.js';
import { getDerivedSwapInfo, swapCallback } from '../../state/swap';
import { approves, getAllowances, getToken } from '../../state/erc20';
import { isAddress } from '../../utils/index.js';
import { Button, Modal } from 'antd';

const FACTORY_ADDRESS = '0x594074315e98393351438011f5a558466f1733fde666f73f41738a39804c27';
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
    // const base = new BigNumber(10).exponentiatedBy(decimals);
    // const tokenAmountInWei = new BigNumber(amount).multipliedBy(base);
    // const tokenAmountInWeiString = BigInt(tokenAmountInWei.toString()).value.toString();
    // return tokenAmountInWeiString;
    return '';
}

function getTokenAmountInEther(amount, decimals) {
    // const tokenAmountInWei = new BigNumber(amount);
    // const etherAmount = tokenAmountInWei.dividedBy(new BigNumber(10 ** decimals));
    // return etherAmount.toFixed(6);
    return '';
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

const FormSwap = ({ setHistoricalPrices, setVol }) => {
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
                `https://api.starksport.finance/api/historical-prices?tokenInAddress=0x49d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7&tokenOutAddress=0x3fe2b97c1fd336e750087d68b9b867997fd64a2661ff3ca5a7c771641e8e7ac`, // Fix to server query
            );
            setHistoricalPrices(response.data);
        } catch (error) {
            console.error('Error fetching historical prices:', error);
        }
    };

    useEffect(() => {
        async function getPairId(token0Address, token1Address) {
            let res = await axios.get(
                `https://api.starksport.finance/api/token-pairs/0x3fe2b97c1fd336e750087d68b9b867997fd64a2661ff3ca5a7c771641e8e7ac/0x49d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7`,
            );
            // setRowsData(res.data);
            // console.log("🚀 ~ file: index.js:560 ~ getPairId ~ res:", res.data)
            let vol = parseFloat(res.data).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            });
            // console.log('🚀 ~ file: index.js:571 ~ getPairId ~ vol:', vol);
            setVol(vol);
        }
        getPairId(token0.address, token1.address);
    }, [token0, token1]);

    const openModalSetting = () => {
        toggleSettingSwap();
    };

    const { isShowingSetting, toggleSettingSwap } = useModalSettingSwap();

    // swap
    const handleTokenShow = (field) => {
        setIsShow(true);
        setIndependentField(field);
    };

    const handleReverse = () => {
        const [_input, _output] = [tokens[Field.INPUT], tokens[Field.OUTPUT]];
        setTokens({
            [Field.INPUT]: _output,
            [Field.OUTPUT]: _input,
        });
    };

    const { account, library, isConnected: isConnectedEvm } = useActiveWeb3React();
    // const { query } = useRouter();
    const listTokens = useListTokens();
    // const { connect } = useWallet();

    const [tokens, setTokens] = useState({
        [Field.INPUT]: WETH,
        [Field.OUTPUT]: TOKEN_LIST[2],
    });

    // Reset token 0 input amount when change another token
    useEffect(() => {
        if (tokens[Field.INPUT] && tokens[Field.OUTPUT]) {
            getHistoricalPrices();
        }
    }, [tokens]);
    const [balances, setBalances] = useState();

    const [typedValue, setTypedValue] = useState('');
    const [independentField, setIndependentField] = useState(Field.INPUT);
    const [reloadPool, setReloadPool] = useState(false);
    const [poolInfo, setPoolInfo] = useState(EmptyPool);
    const [submitting, setSubmitting] = useState(false);
    const [tokensNeedApproved, setTokensNeedApproved] = useState([]);
    const [trade, setTrade] = useState(null);
    const [slippage, setSlippage] = useState('0.5');
    const [disabledMultihops, setDisabledMultihops] = useState(false);
    const [loadedPool, setLoadedPool] = useState(false);

    useEffect(() => {
        (async () => {
            if (!account || !library) return;
            try {
                const [balances, poolInfo] = await Promise.all([
                    getCurrencyBalances(account, library, [tokens[Field.INPUT], tokens[Field.OUTPUT]]),
                    getPoolInfo(account, library, [tokens[Field.INPUT], tokens[Field.OUTPUT]]),
                ]);
                poolInfo && setPoolInfo(poolInfo);
                balances && setBalances(balances);
            } catch (error) {
                console.error(error);
            }
        })();
    }, [account, library, tokens, reloadPool]);

    useEffect(() => {
        (async () => {
            try {
                if (!account) return;
                setLoadedPool(false);
                const trade = await getDerivedSwapInfo({
                    library,
                    independentField,
                    typedValue,
                    currencies: tokens,
                    singlehops: disabledMultihops,
                });
                setTrade(trade);
                setLoadedPool(true);
            } catch (error) {
                setLoadedPool(false);
                console.error(error);
            }
        })();
    }, [account, library, tokens, typedValue, independentField, disabledMultihops]);

    useEffect(() => {
        if (!account || !library || !trade || !tokens[Field.INPUT] || !typedValue) return;

        const decimals = tokens[Field.INPUT]?.decimals ?? 18;
        const parsedAmount = new Fraction(parseUnits(typedValue, decimals).toString());
        const inputAmount =
            independentField === Field.INPUT
                ? new TokenAmount(tokens?.[Field.INPUT], parsedAmount.quotient.toString())
                : trade.inputAmount;
        getAllowances(library, account, ROUTER_ADDRESS, [tokens[Field.INPUT]], [inputAmount])
            .then(setTokensNeedApproved)
            .catch(console.error);
    }, [account, library, trade, tokens, independentField, typedValue]);

    // const handleOpenModal = (independentField) => {
    // 	setIndependentField(independentField);
    // 	onOpen();
    // };

    const handleSelectToken = (token, depend) => {
        let _tokens = { ...tokens };
        _tokens[depend] = token;
        if (depend === Field.INPUT) {
            if (tokens[Field.OUTPUT] && token.equals(tokens[Field.OUTPUT])) {
                if (tokens[Field.INPUT]) _tokens[Field.OUTPUT] = tokens[Field.INPUT];
                else _tokens[Field.OUTPUT] = undefined;
            }
        } else {
            if (tokens[Field.INPUT] && token.equals(tokens[Field.INPUT])) {
                if (tokens[Field.OUTPUT]) _tokens[Field.INPUT] = tokens[Field.OUTPUT];
                else _tokens[Field.INPUT] = undefined;
            }
        }
        setTokens(_tokens);
        // handleTokenClose();
        setIsShow(false);
        // onClose();
    };

    const handleChangeAmounts = (value, independentField) => {
        if (isNaN(+value)) return;
        setTypedValue(value);
        setIndependentField(independentField);
    };

    const isDisableBtn = useMemo(() => {
        if (!trade || !balances?.[0] || !tokens[Field.INPUT] || !typedValue) return true;
        let input =
            independentField === Field.INPUT
                ? parseUnits(typedValue, tokens[Field.INPUT]?.decimals).toString()
                : trade.inputAmount.raw.toString();

        if (BigNumber.from(input).gt(BigNumber.from(balances[0]?.raw.toString() ?? '0'))) {
            return true;
        }
        return false;
    }, [trade, balances]);

    const isNeedApproved = useMemo(() => (tokensNeedApproved.length > 0 ? true : false), [tokensNeedApproved]);

    const onSwapCallback = useCallback(async () => {
        try {
            if (!account || !library || submitting) return;
            setSubmitting(true);
            await swapCallback(library, account, trade, +slippage);
            setReloadPool((pre) => !pre);
            setSubmitting(false);
            setTypedValue('');
            alert('Swap success');
        } catch (error) {
            console.error(error);
            setSubmitting(false);
            alert(error?.reason ?? error?.message ?? error);
        }
    }, [account, library, trade, slippage]);

    const onApproveTokens = useCallback(async () => {
        try {
            if (!account || !library || submitting) return;
            setSubmitting(true);
            const result = await approves(library, account, ROUTER_ADDRESS, tokensNeedApproved);
            if (result) setTokensNeedApproved([]);
            setSubmitting(false);
            alert('Approve tokens success');
        } catch (error) {
            console.error(error);
            setSubmitting(false);
            alert(error?.reason ?? error?.message ?? error);
        }
    }, [account, library, tokensNeedApproved]);

    // const isHighPriceImpact = useMemo(
    // 	() => (trade ? trade.priceImpact.greaterThan(FIVE_PERCENT) : false),
    // 	[trade]
    // );

    const onSubmit = () => {
        if (!isConnectedEvm) return alert('Please connect wallet');
        // if (isHighPriceImpact) return onOpenConfirmHighSlippage();
        if (isNeedApproved) {
            return onApproveTokens();
        } else if (!isDisableBtn) {
            return onSwapCallback();
        }
    };

    // const onSubmitHighSlippage = () => {
    // 	if (isNeedApproved) {
    // 		return onApproveTokens();
    // 	} else if (!isDisableBtn) {
    // 		return onSwapCallback().then(onCloseConfirmHighSlippage);
    // 	}
    // };

    const buttonText = useMemo(() => {
        if (!account) return 'Connect wallet';
        if (!loadedPool || !tokens[Field.INPUT] || !tokens[Field.OUTPUT] || !balances || !balances[0] || !balances[1])
            return 'Swap';

        if (!trade) {
            if (poolInfo.pair) return 'Swap';
            else return 'No route';
        } else {
            let input =
                independentField === Field.INPUT
                    ? parseUnits(typedValue, tokens[Field.INPUT]?.decimals).toString()
                    : trade.inputAmount.raw.toString();

            if (BigNumber.from(input).gt(BigNumber.from(balances[0]?.raw.toString() ?? '0'))) {
                return `Insufficient ${tokens[Field.INPUT]?.symbol} balance`;
            }
            if (poolInfo.noLiquidity && poolInfo.pair) return 'No liquidity';
            else if (isNeedApproved) return 'Approve token';
        }
        return 'Swap';
    }, [loadedPool, tokens, trade, poolInfo, isNeedApproved, account, balances]);

    // search token
    const [searchToken, setSearchToken] = useState('');
    const [_listTokens, _setListTokens] = useState([]);

    const handleSearchToken = useCallback(async () => {
        if (!searchToken || !isAddress(searchToken)) return listTokens;
        const existsTokens = listTokens.filter((t) => t.address.toLowerCase() === searchToken.toLowerCase());
        if (existsTokens.length) return existsTokens;
        const _t = await getToken(searchToken, library);
        if (_t instanceof Token) return [_t];
        return [];
    }, [listTokens, searchToken, library]);

    useEffect(() => {
        (async () => {
            try {
                const _tokens = await handleSearchToken();
                console.log(_tokens);
                _setListTokens(_tokens);
            } catch (error) {
                console.error(error);
            }
        })();
    }, [handleSearchToken]);

    return (
        <div className="form-wrapper col gap-10" style={{ gap: 2 }}>
            {/* Select token modal */}
            <Modal
                open={isShow}
                footer={null}
                centered
                bodyStyle={{
                    backgroundColor: '#000',
                    overflow: 'auto',
                    gap: 20,
                }}
                onCancel={() => {
                    setIsShow(false);
                }}
            >
                <div className="select-token-modal">
                    <div className="header-modal-wrapper">
                        <h3>Select a token or search token</h3>

                        <div className="search-wrapper">
                            <img src={assets.svg.search} alt="search" />
                            <input
                                placeholder="Token address"
                                value={searchToken}
                                onChange={(e) => setSearchToken(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="line"></div>

                    <div className="list-wrapper">
                        {searchToken !== '' || _listTokens.length > 0 ? (
                            <div>
                                {_listTokens.map((t, index) => {
                                    return (
                                        <div
                                            key={index}
                                            className="row gap-10 a-center item-wrapper "
                                            onClick={() => handleSelectToken(t, independentField)}
                                        >
                                            <img
                                                src={TOKEN_ICON_LIST[t.address] ?? UNKNOWN_TOKEN_ICON}
                                                alt={t.symbol ?? '?'}
                                                style={{ height: 30, width: 30 }}
                                            />
                                            <h3>{t.symbol}</h3>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div style={{ textAlign: 'center', marginTop: 20, marginBottom: 20 }}>
                                {searchToken != '' ? (
                                    <div className="row gap-10 a-center item-wrapper "></div>
                                ) : (
                                    <h3>Token not found</h3>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </Modal>
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
                            value={
                                independentField === Field.INPUT
                                    ? typedValue
                                    : trade?.outputAmount.toSignificant(18) ?? ''
                            }
                            onChange={(e) => handleChangeAmounts(e.target.value, Field.INPUT)}
                        />
                        <div
                            className="row gap-5 option-wrapper a-center p-10"
                            onClick={() => {
                                handleTokenShow(Field.INPUT);
                            }}
                        >
                            <img
                                alt={tokens[Field.INPUT]?.symbol ?? '?'}
                                src={TOKEN_ICON_LIST[tokens[Field.INPUT]?.address] ?? UNKNOWN_TOKEN_ICON}
                                style={{ height: 30, width: 30 }}
                            />
                            <h5>{tokens[Field.INPUT]?.symbol ?? '--'}</h5>
                            <img src={assets.svg.down_arrow} style={{ height: 20, width: 20 }} alt="down_arrow_icon" />
                        </div>
                    </div>
                    <div className="input-balance-wrapper">
                        <p>Balance: {balances?.[0]?.toSignificant(18)}</p>
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
                onClick={() => handleReverse()}
            >
                <img src={assets.svg.swap} style={{ height: 24, width: 24 }} alt="swap_icon" />
            </div>

            <div className="input-wrapper">
                <div style={{ padding: 12, marginTop: 10 }}>
                    <div className="row">
                        <h4 style={{ margin: 'auto' }}>
                            ~{' '}
                            {independentField === Field.OUTPUT
                                ? typedValue
                                : trade?.outputAmount.toSignificant(18) ?? ''}
                        </h4>
                        <div
                            className="row gap-5 option-wrapper a-center p-10"
                            onClick={() => {
                                handleTokenShow(Field.OUTPUT);
                            }}
                        >
                            <img
                                alt={tokens[Field.OUTPUT]?.symbol ?? '?'}
                                src={TOKEN_ICON_LIST[tokens[Field.OUTPUT]?.address] ?? UNKNOWN_TOKEN_ICON}
                                style={{ height: 30, width: 30 }}
                            />
                            <h5>{tokens[Field.OUTPUT]?.symbol ?? '--'}</h5>
                            <img src={assets.svg.down_arrow} style={{ height: 20, width: 20 }} alt="down_arrow_icon" />
                        </div>
                    </div>
                    <div className="input-balance-wrapper" style={{ marginBottom: 0 }}>
                        <p>Balance: {balances?.[1]?.toSignificant(18)}</p>
                    </div>
                </div>
            </div>

            <Button
                style={{
                    marginTop: 20,
                    width: '100%',
                    border: 'none',
                }}
                className="btn p-20"
                onClick={() => {
                    onSubmit();
                }}
                loading={submitting}
            >
                {buttonText}
            </Button>
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

    // useEffect(() => {
    //     if (historicalPrices && historicalPrices.length > 0) {
    //         setPriceSrt(formatPrice2(historicalPrices[historicalPrices.length - 1]?.price));
    //         setDateCurrent(formatTimestamp(historicalPrices[historicalPrices.length - 1]?.timestamp));

    //         // You can use the formatTimestamp() function here, assuming it's defined in your code
    //         // if (firstTimestamp) {
    //         //     setDateCurrent(formatTimestamp(firstTimestamp));
    //         // }
    //     }
    //     // setPriceSrt(formatPrice(historicalPrices[0].price));
    //     // setDateCurrent(formatTimestamp(historicalPrices[0].timestamp));
    // }, [historicalPrices]);

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
                        <Area type="monotone" dataKey="price" stroke="#14ffe3" fill="url(#colorUv)" />
                        <Tooltip content={<CustomTooltip />} />
                    </AreaChart>
                </div>

                <FormSwap setVol={setVol} setHistoricalPrices={setHistoricalPrices} />
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

export default SwapPage;
