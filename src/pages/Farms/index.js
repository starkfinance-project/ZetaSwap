import './style.scss';
import { Select, Checkbox } from 'antd';
import { useState } from 'react';
import assets from '../../assets';
import Footer from '../../layouts/Footer';

const FarmsPage = () => {
    const [activeBtn, setActiveBtn] = useState(true);

    const handleChange = (value) => {
        console.log(`selected ${value}`);
    };

    const [isShowDetailToken, setIsShowDetailToken] = useState(0);

    const handleShowDetail = (value) => {
        if (value === isShowDetailToken) setIsShowDetailToken(0);
        else setIsShowDetailToken(value);
    };

    const mockDataPools = [
        {
            id: 1,
            icon: assets.images.wbtc,
            icon2: assets.svg.eth,
            name: 'WBTC-ETH',
        },
        {
            id: 2,
            icon: assets.svg.eth,
            icon2: assets.images.usdc,
            name: 'ETH-USDC',
        },
        {
            id: 3,
            icon: assets.images.wbtc,
            icon2: assets.images.usdc,
            name: 'WBTC-USDC',
        },
        {
            id: 4,
            icon: assets.images.wbtc,
            icon2: assets.svg.eth,
            name: 'WBTC-ETH',
        },
        {
            id: 5,
            icon: assets.svg.eth,
            icon2: assets.images.usdc,
            name: 'ETH-USDC',
        },
        {
            id: 6,
            icon: assets.images.wbtc,
            icon2: assets.images.usdc,
            name: 'WBTC-USDC',
        },
        {
            id: 7,
            icon: assets.images.wbtc,
            icon2: assets.svg.eth,
            name: 'WBTC-ETH',
        },
        {
            id: 8,
            icon: assets.svg.eth,
            icon2: assets.images.usdc,
            name: 'ETH-USDC',
        },
        {
            id: 9,
            icon: assets.images.wbtc,
            icon2: assets.images.usdc,
            name: 'WBTC-USDC',
        },
    ];

    return (
        <div className="farms-page p-10">
            {/* <div className="banner-div ">
                <img src={assets.images.farmbanner} />
            </div> */}
            <div className="pool-header-wrapper row a-center">
                <div className="btn-dev">
                    <p>Developing</p>
                </div>
                <div className="search-wrapper row a-center gap-10">
                    <h4>Search</h4>
                    <input />
                </div>

                <Select
                    defaultValue="all"
                    style={{ width: 150, background: '#424242' }}
                    dropdownStyle={{ background: '#424242', color: 'white' }}
                    onChange={handleChange}
                    options={[
                        {
                            value: 'all',
                            label: 'All',
                        },
                        {
                            value: 'hot',
                            label: 'Hot',
                        },
                        {
                            value: 'new',
                            label: 'New',
                        },
                    ]}
                />

                <Select
                    defaultValue="all"
                    style={{ width: 150, background: '#424242' }}
                    dropdownStyle={{ background: '#424242', color: 'white' }}
                    onChange={handleChange}
                    options={[
                        {
                            value: 'all',
                            label: 'All Token',
                        },
                        {
                            value: 'new',
                            label: 'SFN',
                        },
                    ]}
                />

                <div className="switch-wrapper row">
                    <div
                        className={`btn-switch ${activeBtn && 'active-btn'}`}
                        onClick={() => {
                            setActiveBtn(true);
                        }}
                    >
                        ACTIVE
                    </div>
                    <div
                        className={`btn-switch ${!activeBtn && 'active-btn'}`}
                        onClick={() => {
                            setActiveBtn(false);
                        }}
                    >
                        INACTIVE
                    </div>
                </div>

                <Checkbox>Staked</Checkbox>

                <div className="btn">
                    <h4>HARVEST ALL</h4>
                </div>
            </div>

            <div className="pool-body-wrapper">
                {mockDataPools.map((item, index) => {
                    return (
                        <div>
                            <div
                                className="body-one a-center row gap-20 "
                                onClick={() => {
                                    handleShowDetail(item.id);
                                }}
                            >
                                <div className="row a-center gap-10 flex-2">
                                    <div className="icon-div-1">
                                        <img className="icon-1" src={item.icon} style={{ height: 30, width: 30 }} />
                                        <img className="icon-2" src={item.icon2} style={{ height: 30, width: 30 }} />
                                    </div>
                                    <img src={assets.svg.arrow_right} style={{ height: 20, width: 20 }} />
                                    <img src={assets.images.logo} style={{ height: 30, width: 30 }} />
                                    <h4>{item.name}</h4>
                                </div>

                                {/* <div className="row gap-10">
                                    <div className="icon-social-wrapper">
                                        <img src={assets.svg.discord} style={{ height: 30, width: 30 }} />
                                    </div>

                                    <div className="icon-social-wrapper">
                                        <img src={assets.svg.twitter} style={{ height: 30, width: 30 }} />
                                    </div>
                                </div> */}

                                <div className="col a-center flex-1">
                                    <h5 className="body-one-title ">APY</h5>
                                    <h4>0.00%</h4>
                                </div>

                                <div className="col a-center flex-1">
                                    <h5 className="body-one-title ">APR</h5>
                                    <h4>0.00%</h4>
                                </div>

                                <div className="col a-center flex-1">
                                    <h5 className="body-one-title ">Liquidity</h5>
                                    <h4>$0.00</h4>
                                </div>

                                <div className="col a-center flex-1">
                                    <h5 className="body-one-title ">Earned</h5>
                                    <h4>$0.00</h4>
                                </div>
                            </div>

                            <div
                                className="body-two gap-10"
                                style={{ display: isShowDetailToken === item.id ? 'flex' : 'none' }}
                            >
                                <div className="row a-center gap-10">
                                    <div className="btn">
                                        <h5>GET SFN</h5>
                                    </div>
                                    <div className="col">
                                        <h5 className="body-two-title">Available SFN</h5>
                                        <h4>0.000000</h4>
                                        <h5>$0.00</h5>
                                    </div>
                                    <img src={assets.svg.arrow_right} style={{ height: 30, width: 30 }} />
                                </div>

                                <div className="row a-center">
                                    <div className="btn">
                                        <h5>Connect Wallet</h5>
                                    </div>
                                    <img src={assets.svg.arrow_right} style={{ height: 30, width: 30 }} />
                                </div>

                                <div className="btn">
                                    <h5>SFN HARDER</h5>
                                </div>

                                <div className="btn">
                                    <h5>HARVEST</h5>
                                </div>

                                <div>
                                    <h5 className="body-two-title">Earned SFN</h5>
                                    <h4>0.000000</h4>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default FarmsPage;
