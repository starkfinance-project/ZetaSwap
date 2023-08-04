import assets from '../../assets';
import './style.scss';

import { route } from '../../routes/configs';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import actions from '../../redux/action';
import { useAccount, useConnectors, useNetwork } from '@starknet-react/core';
import { useEffect, useState } from 'react';

const mockTrending = [
    {
        name: 'BTC',
        id: 'bitcoin',
        src: assets.svg.btc,
        price: 0,
        toFixed: 2,
    },
    {
        name: 'ETH',
        id: 'ethereum',
        src: assets.svg.eth,
        price: 0,
        toFixed: 2,
    },
    {
        name: 'BNB',
        id: 'binance-coin',
        src: assets.images.bnb_icon,
        price: 0,
        toFixed: 2,
    },
    {
        name: 'DOGE',
        id: 'dogecoin',
        src: assets.images.doge,
        price: 0,
        toFixed: 5,
    },
    {
        name: 'FTM',
        id: 'fantom',
        src: assets.images.ftm,
        price: 0,
        toFixed: 5,
    },
    {
        name: 'SHIB',
        id: 'shiba-inu',
        src: assets.images.shib,
        price: 0,
        toFixed: 5,
    },
    {
        name: 'ADA',
        id: 'cardano',
        src: assets.images.ada,
        price: 0,
        toFixed: 5,
    },
    {
        name: 'XRP',
        id: 'xrp',
        src: assets.images.xrp,
        price: 0,
        toFixed: 5,
    },
];

const ItemMar = ({ item }) => {
    const [price, setPrice] = useState(0);

    const getPrice = async (id, fixed) => {
        await fetch(`https://api.coincap.io/v2/assets/${id}`)
            .then((response) => response.json())
            .then((data) => {
                let priceTemp = data.data.priceUsd;

                setPrice(Number.parseFloat(priceTemp).toFixed(fixed));
            })
            .catch((error) => console.log(error));
    };

    useEffect(() => {
        getPrice(item.id, item.toFixed);
    }, []);

    return (
        <div className="token-div row a-center gap-10">
            <img src={item.src} />
            <div className="col a-center">
                <h5 style={{ fontWeight: 300 }}>{item.name}</h5>
                <h4 style={{ fontWeight: 700 }}>${price}</h4>
            </div>
        </div>
    );
};

const HeaderLayout = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { disconnect } = useConnectors();
    const { address, status } = useAccount();
    const { chain } = useNetwork();
    const [dataTrending, setDataTrending] = useState(mockTrending);

    const navClick = (path) => {
        navigate(path);
    };

    const showSelectModal = () => {
        dispatch(actions.showModalWallet(true));
    };

    // Handle short address type
    const shortAddress = () => {
        if (address) {
            // console.log('Current address:', address);
            const firstDigits = address.slice(0, 6);
            const lastDigits = address.slice(-4);

            const resultAddress = firstDigits + '...' + lastDigits;
            return resultAddress;
        }
    };

    return (
        <div>
            {status == 'connected' ? (
                <div className="header-layout row j-between a-center ">
                    <div className="row a-center gap-10">
                        <div style={{ height: 50, width: 50 }}>
                            <img src={assets.images.newlogo} />
                        </div>
                    </div>
                    <div className="trending-token-div gap-30">
                        {/* <h3>Trending</h3> */}
                        <marquee className="marquee-container">
                            <div className="row">
                                {dataTrending.map((e) => {
                                    return <ItemMar item={e} />;
                                })}
                            </div>
                        </marquee>
                    </div>
                    <div
                        className="btn"
                        onClick={() => {
                            disconnect();
                        }}
                    >
                        <h5 style={{ textAlign: 'center' }}>{shortAddress()}</h5>
                    </div>
                </div>
            ) : (
                <div className="header-layout row j-between a-center">
                    <div className="row a-center gap-10">
                        <div style={{ height: 50, width: 50 }}>
                            <img src={assets.images.newlogo} />
                        </div>
                    </div>
                    <div className="trending-token-div gap-30">
                        {/* <h3>Trending</h3> */}
                        <marquee className="marquee-container">
                            <div className="row">
                                {dataTrending.map((e) => {
                                    return <ItemMar item={e} />;
                                })}
                            </div>
                        </marquee>
                    </div>
                    <div
                        className="btn"
                        onClick={() => {
                            showSelectModal();
                        }}
                    >
                        <h5 style={{ textAlign: 'center' }}>Connect Wallet</h5>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HeaderLayout;
