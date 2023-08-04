import assets from '../../assets';
import './style.scss';
import { Timeline } from 'antd';
import { useNavigate } from 'react-router-dom';
import Footer from '../../layouts/Footer';
import { route } from '../../routes/configs';
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

const HomePage = () => {
    return <></>;
};

export default HomePage;
