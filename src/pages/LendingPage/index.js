import { Checkbox, Switch } from 'antd';
import { useState } from 'react';
import { useEffect } from 'react';
import assets from '../../assets';
import Footer from '../../layouts/Footer';
import './style.scss';

const mockData = [
    {
        src: assets.images.wbtc,
        name: 'WBTC',
        apy: '+ 0,76882%',
        wallet: 0,
        sym: 'WBTC',
    },
    {
        src: assets.svg.eth,
        name: 'ETH',
        apy: '+ 1,9435%',
        wallet: 0,
        sym: 'ETH',
    },
    {
        src: assets.images.usdc,
        name: 'USDC ',
        apy: '+ 4,7786%',
        wallet: 0,
        sym: 'USDC',
    },
    {
        src: assets.images.usdt,
        name: 'USDT',
        apy: '+ 5,3432%',
        wallet: 0,
        sym: 'USDT',
    },
    {
        src: assets.images.doge,
        name: 'DOGE',
        apy: '+ 0,1432%',
        wallet: 0,
        sym: 'DOGE',
    },
    {
        src: assets.images.dai,
        name: 'DAI',
        apy: '+ 1,1242%',
        wallet: 0,
        sym: 'DAI',
    },
];

const mockData2 = [
    {
        src: assets.images.wbtc,
        name: 'WBTC',
        apy: '- 4,76882%',
        wallet: 0,
        sym: 'WBTC',
    },
    {
        src: assets.svg.eth,
        name: 'ETH',
        apy: '- 6,9435%',
        wallet: 0,
        sym: 'ETH',
    },
    {
        src: assets.images.usdc,
        name: 'USDC',
        apy: '- 6,3456%',
        wallet: 0,
        sym: 'USDC',
    },
    {
        src: assets.images.usdt,
        name: 'USDT',
        apy: '- 6,3523%',
        wallet: 0,
        sym: 'USDT',
    },
    {
        src: assets.images.doge,
        name: 'DOGE',
        apy: '- 4,1432%',
        wallet: 0,
        sym: 'DOGE',
    },
    {
        src: assets.images.dai,
        name: 'DAI',
        apy: '- 4,7242%',
        wallet: 0,
        sym: 'DAI',
    },
];

const mockData3 = [
    {
        src: assets.images.wbtc,
        name: 'WBTC',
        price: '24,000',
        percent: 80,
        percentValue: 1645477.65,
        sup: 429.888,
        bor: 66.88,
    },
    {
        src: assets.svg.eth,
        name: 'ETH',
        price: '1686,41',
        percent: 20,
        percentValue: 732106.65,
        sup: 1766.888,
        bor: 456.88,
    },
    {
        src: assets.images.usdc,
        name: 'USDC',
        price: '1',
        percent: 20,
        percentValue: 1312538.65,
        sup: 11834213.888,
        bor: 1345123.88,
    },
    {
        src: assets.images.usdt,
        name: 'USDT',
        price: '1',
        percent: 20,
        percentValue: 1611332.65,
        sup: 1324243.888,
        bor: 1754343.88,
    },
    {
        src: assets.images.dai,
        name: 'USDT',
        price: '1',
        percent: 20,
        percentValue: 324223.65,
        sup: 42342.888,
        bor: 43232.88,
    },
];

const LendingPage = () => {
    const [tab, setTab] = useState(0);

    useEffect(() => {
        var doghnutCharts = document.querySelectorAll('.doghnutChartGroup .circular-progress');

        for (var h = 0; h < doghnutCharts.length; h++) {
            var percent = doghnutCharts[h].getAttribute('data-percent');
            var degree = 90 + (360 / 100) * Number(percent);

            if (percent > 0 && percent <= 25) {
                doghnutCharts[h].style.background =
                    'linear-gradient(90deg, #E0E0E0 50%, transparent 50%, transparent), linear-gradient(' +
                    degree +
                    'deg , #9900f0 50%, #E0E0E0 50%, #E0E0E0)';
            } else if (percent > 25 && percent <= 50) {
                doghnutCharts[h].style.background =
                    'linear-gradient(90deg, #E0E0E0 50%, transparent 50%, transparent), linear-gradient(' +
                    degree +
                    'deg , #9900f0 50%, #E0E0E0 50%, #E0E0E0)';
            } else if (percent > 50 && percent <= 75) {
                doghnutCharts[h].style.background =
                    'linear-gradient(-90deg, #9900f0 50%, transparent 50%, transparent), linear-gradient(' +
                    degree +
                    'deg , #9900f0 50%, #E0E0E0 50%, #E0E0E0)';
            } else if (percent > 75 && percent <= 100) {
                doghnutCharts[h].style.background =
                    'linear-gradient(-90deg, #9900f0 50%, transparent 50%, transparent), linear-gradient(' +
                    degree +
                    'deg , #9900f0 50%, #E0E0E0 50%, #E0E0E0)';
            } else {
                doghnutCharts[h].style.background =
                    'linear-gradient(90deg, #E0E0E0 50%, transparent 50%, transparent), linear-gradient(90deg , #9900f0 50%, #E0E0E0 50%, #E0E0E0)';
            }
        }
    }, []);

    return (
        <div className="lending-page">
            <div className="tabs-wrapper">
                <div className="btn-dev">
                    <p>Developing</p>
                </div>
                <div className="option-wrapper">
                    <div
                        className={`option ${tab === 0 && 'option-active'}`}
                        onClick={() => {
                            setTab(0);
                        }}
                    >
                        <h4>MARKETS</h4>
                    </div>
                    <div
                        className={`option ${tab === 1 && 'option-active'}`}
                        onClick={() => {
                            setTab(1);
                        }}
                    >
                        <h4>NETWORK</h4>
                    </div>
                    <div
                        className={`option ${tab === 2 && 'option-active'}`}
                        onClick={() => {
                            setTab(2);
                        }}
                    >
                        <h4>PROFILE</h4>
                    </div>
                </div>

                <div className="markets-wrapper">
                    <div className="center col">
                        <h2>
                            {tab === 0
                                ? 'Your supply balance'
                                : tab === 1
                                ? 'Network supply balance'
                                : 'Supply balance'}
                        </h2>
                        <h2>$0</h2>
                    </div>

                    <div class="doghnutChartGroup displayInlineBlock">
                        <div class="circular-progress" data-percent="0" data-text="0%"></div>
                    </div>

                    <div className="center col">
                        <h2>
                            {tab === 0
                                ? 'Your borrow balance'
                                : tab === 1
                                ? 'Network borrow balance'
                                : 'Borrow balance'}
                        </h2>
                        <h2>$0</h2>
                    </div>
                </div>

                <div className="col gap-10">
                    <div className="row j-between">
                        <h4>Liquidation Limit (0%)</h4>
                        <h4>$0</h4>
                    </div>
                    <div className="process-wrapper"></div>
                </div>
            </div>
            {tab === 0 && (
                <div className="content-div">
                    <div className="supply-markets-wrapper">
                        <div className="row j-between">
                            <h4>Supply Markets</h4>
                            <h5>(Click on an asset to Supply/Withdraw)</h5>
                        </div>

                        <div className="row-wrapper">
                            <h4 className="flex-1">Aset</h4>
                            <h4 className="flex-1">APY</h4>
                            <h4 className="flex-1">Wallet</h4>
                            <h4 className="flex-1">Collateral</h4>
                        </div>

                        {mockData.map((item) => {
                            return (
                                <div className="row-wrapper">
                                    <div className="row gap-10 a-center flex-1">
                                        <img src={item.src} style={{ height: 30, width: 30 }} />
                                        <h4>{item.name}</h4>
                                    </div>

                                    <h4 className="apt-text  flex-1">{item.apy}</h4>

                                    <h4 className="flex-1">
                                        {item.wallet} {item.sym}
                                    </h4>
                                    <div className="flex-1">
                                        <Switch />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    <div className="supply-markets-wrapper">
                        <div className="row j-between">
                            <h4>Borrow Markets</h4>
                            <h5>(Click on an asset to Borow/Repay)</h5>
                        </div>

                        <div className="row-wrapper ">
                            <h4 className="flex-1">Aset</h4>
                            <h4 className="flex-1">APY</h4>
                            <h4 className="flex-1">Wallet</h4>
                            <h4 className="flex-1">Collateral</h4>
                        </div>
                        {mockData2.map((item) => {
                            return (
                                <div className="row-wrapper">
                                    <div className="row gap-10 a-center flex-1">
                                        <img src={item.src} style={{ height: 30, width: 30 }} />
                                        <h4>{item.name}</h4>
                                    </div>

                                    <h4 className="apt-text-2  flex-1">{item.apy}</h4>

                                    <h4 className="flex-1">
                                        {item.wallet} {item.sym}
                                    </h4>
                                    <div className="flex-1">$0,00 M</div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {tab === 1 && (
                <div className="network-content">
                    {mockData3.map((item) => {
                        return (
                            <div className="item-network-content">
                                <div className="row a-center gap-20">
                                    <img src={item.src} style={{ height: 50, width: 50 }} />
                                    <div className="col gap-10">
                                        <h3>{item.name}</h3>
                                        <h4>${item.price}</h4>
                                    </div>
                                    <div class="doghnutChartGroup2 displayInlineBlock2">
                                        <div
                                            class="circular-progress"
                                            data-percent={item.percent}
                                            data-text={`$${item.percentValue}`}
                                        ></div>
                                    </div>
                                </div>

                                <div className="row j-around">
                                    <div className="col a-center">
                                        <h4>Supplied {item.name}</h4>
                                        <h4>{item.sup}</h4>
                                    </div>
                                    <div className="col a-center">
                                        <h4>Borrowed {item.name}</h4>
                                        <h4>{item.bor}</h4>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {tab === 2 && (
                <div className="profile-div">
                    <div className="item-profile">
                        <div className="row flex-1 a-center j-around max-w">
                            <h2 style={{ color: 'green', fontWeight: 700 }}>Supplied</h2>
                            <h2 style={{ color: 'red', fontWeight: 700 }}>Borrowed</h2>
                        </div>
                        <div className="row flex-1 a-center j-around max-w">
                            <h2 style={{ fontWeight: 700 }}>No Supply</h2>
                            <h2 style={{ fontWeight: 700 }}>No Borrows</h2>
                        </div>
                    </div>
                    <div className="item-profile">
                        <h3>Rain Forecase - No Rain</h3>

                        <div>
                            <h6>Estimated ~ 2,589,162 Blocks/Year</h6>
                            <h6>1 block every ~ 12.18 seconds</h6>
                        </div>

                        <div className="row gap-20">
                            <div className="col gap-10 a-center">
                                <h3 style={{ color: 'gray', textAlign: 'center' }}>Estimated Yearly Rain</h3>
                                <h4>0 SFN</h4>
                            </div>

                            <div className="col gap-10 a-center">
                                <h3 style={{ color: 'gray', textAlign: 'center' }}>Estimated Daily Rain</h3>
                                <h4>0 SFN</h4>
                            </div>
                        </div>

                        <div className="row gap-20">
                            <div className="col gap-10 a-center">
                                <h3 style={{ color: 'gray', textAlign: 'center' }}>Estimated Rain/Block</h3>
                                <h4>0 SFN</h4>
                            </div>

                            <div className="col gap-10 a-center">
                                <h3 style={{ color: 'gray', textAlign: 'center' }}>Unclaimed Rain</h3>
                                <h4>0 SFN</h4>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LendingPage;
