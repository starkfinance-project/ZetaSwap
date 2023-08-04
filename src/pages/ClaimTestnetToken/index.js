import { useState, useEffect } from 'react';
import assets from '../../assets';
import './style.scss';
import { useAccount, useContract, useStarknetCall, useStarknetExecute } from '@starknet-react/core';
import BigNumber from 'bignumber.js';
import BigInt from 'big-integer';

const mockDataTokenTest = [
    // {
    //     name: 'WBTC',
    //     icon: assets.svg.btc,
    //     address: '0x03fe2b97c1fd336e750087d68b9b867997fd64a2661ff3ca5a7c771641e8e7ac',
    //     decimals: 18,
    //     freeToken: 1,
    // },
    // {
    //     name: 'USDC',
    //     icon: assets.images.usdc,
    //     address: '0x068f5c6a61780768455de69077e07e89787839bf8166decfbf92b645209c0fb8',
    //     decimals: 18,
    //     freeToken: 5000,
    // },
    // {
    //     name: 'SFN',
    //     icon: assets.images.newlogo,
    //     address: '0x00482c9ba8eac039eba45c875eeac660eb91768ca4a32cf3c5ae804cc62dccd2',
    //     decimals: 18,
    //     freeToken: 10000,
    // }
];

function getTokenAmountInWei(amount, decimals) {
    const base = new BigNumber(10).exponentiatedBy(decimals);
    const tokenAmountInWei = new BigNumber(amount).multipliedBy(base);
    const tokenAmountInWeiString = BigInt(tokenAmountInWei.toString()).value.toString();
    return tokenAmountInWeiString;
}

const ClaimTestnetTokenPage = () => {
    const { address, status } = useAccount();
    const [windowSize, setWindowSize] = useState({
        width: window.innerWidth,
        height: window.innerHeight,
    });
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

    return (
        <div className="testnet-token-page ">
            <div className="form-claim">
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
            </div>
        </div>
    );
};

export default ClaimTestnetTokenPage;
