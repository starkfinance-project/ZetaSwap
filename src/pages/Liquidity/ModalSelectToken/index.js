import 'antd/dist/antd.css';
import './style.scss';
import Modal from 'antd/lib/modal/Modal';
import assets from '../../../assets';
import React, { useEffect, useState } from 'react';
import erc20 from '../../../assets/abi/erc20.js';
import { useAccount, useContract, useStarknetCall, useStarknetExecute } from '@starknet-react/core';
import { RpcProvider, Provider, Contract, Account, ec, json, uint256, number } from 'starknet';
import { ModalCreatePair } from '../ModalCreatePair';
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

function hex2a(hexx) {
    var hex = hexx.toString(); //force conversion
    var str = '';
    for (var i = 0; i < hex.length; i += 2) str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    return str.substring(1); // remove whitespace in front
}

const TokenInfo = ({ tokenAddress, handleSelectToken }) => {
    const { address, status } = useAccount();
    const [tokenSymbol, setTokenSymbol] = useState(null);
    const [tokenDecimals, setTokenDecimals] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            const erc20Contract = new Contract(erc20abi, tokenAddress, provider);
            let fetchedTokenSymbol = await erc20Contract.call('symbol');
            setTokenSymbol(fetchedTokenSymbol);
            let fetchedTokenDecimals = await erc20Contract.call('decimals');
            setTokenDecimals(fetchedTokenDecimals);
        };
        fetchData();
    }, [tokenAddress]);

    if (tokenSymbol !== null && tokenDecimals !== null) {
        let tokenSymbolValue = hex2a(number.toHex(tokenSymbol.symbol));
        let tokenDecimalsValue = tokenDecimals.decimals.words[0];
        console.log(assets);
        return (
            <div
                className="row gap-10 a-center item-wrapper "
                onClick={() => {
                    handleSelectToken({
                        name: tokenSymbolValue,
                        icon: assets.svg.tokenicon,
                        address: tokenAddress,
                        decimals: tokenDecimalsValue,
                        freeToken: 1,
                    });
                }}
            >
                <img src={assets.svg.tokenicon} style={{ height: 30, width: 30 }} />
                <h3>{tokenSymbolValue}</h3>
            </div>
        );
    } else {
        return <h3 style={{ textAlign: 'center', marginTop: 20, marginBottom: 20 }}>Token not found</h3>;
    }
};

const ModalSelectToken = (props) => {
    const { isShow, setIsShow, token0, token1, setToken0, setToken1, mockDataTokenTest, typeModal } = props;

    const [searchValue, setSearchValue] = useState('');
    const handleInputChange = (event) => {
        let tokenAddress = event.target.value;
        setSearchValue(tokenAddress);
    };

    const handleSelectToken = (item) => {
        if (typeModal === 1) {
            if (item.name === token1.name) {
                setToken1(token0);
            }
            setToken0(item);
        } else if (typeModal === 2) {
            if (item.name === token0.name) {
                setToken0(token1);
            }
            setToken1(item);
        }
        setIsShow(false);
    };

    return (
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
                    <h3>Select a token</h3>

                    <div className="search-wrapper">
                        <img src={assets.svg.search} alt="search" />
                        <input
                            placeholder="Search name or paste address"
                            value={searchValue}
                            onChange={handleInputChange}
                        />
                    </div>
                </div>

                <div className="line"></div>

                <div className="list-wrapper">
                    {searchValue == '' ? (
                        <div>
                            {mockDataTokenTest.map((item, index) => {
                                return (
                                    <div
                                        key={index}
                                        className="row gap-10 a-center item-wrapper "
                                        onClick={() => {
                                            handleSelectToken(item);
                                        }}
                                    >
                                        <img src={item.icon} alt={item.name} style={{ height: 30, width: 30 }} />
                                        <h3>{item.name}</h3>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', marginTop: 20, marginBottom: 20 }}>
                            {searchValue != '' ? (
                                <TokenInfo tokenAddress={searchValue} handleSelectToken={handleSelectToken} />
                            ) : (
                                <h3>Token not found</h3>
                            )}
                        </div>
                        // <h3 style={{ textAlign: 'center', marginTop: 20, marginBottom: 20 }}>Token not found</h3>
                    )}
                </div>
            </div>
        </Modal>
    );
};

export default ModalSelectToken;
