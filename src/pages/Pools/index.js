import './style.scss';
import { Select, Checkbox } from 'antd';
import { useState } from 'react';
import assets from '../../assets';
import Footer from '../../layouts/Footer';

const PoolsPage = () => {
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
            id: 0,
            icon: assets.images.logo,
        },
        {
            id: 1,
            icon: assets.images.starknet_logo,
        },
        {
            id: 2,
            icon: assets.svg.eth,
        },
        {
            id: 3,
            icon: assets.images.wbtc,
        },
        {
            id: 4,
            icon: assets.images.usdc,
        },
        {
            id: 5,
            icon: assets.images.dai,
        },
    ];

    return (
        <div className="pools-page p-10">
            {/* <div className="banner-div ">
                <img src={assets.images.stackingbanner} />
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
                                className="body-one a-center row gap-20"
                                onClick={() => {
                                    handleShowDetail(item.id);
                                }}
                            >
                                <div className="row a-center gap-10">
                                    <img src={item.icon} style={{ height: 30, width: 30 }} />
                                    <img src={assets.svg.arrow_right} style={{ height: 20, width: 20 }} />
                                    <img src={assets.images.logo} style={{ height: 30, width: 30 }} />
                                    <h4>SFN</h4>
                                </div>

                                <div className="row gap-10">
                                    <div className="icon-social-wrapper">
                                        <img src={assets.svg.discord} style={{ height: 30, width: 30 }} />
                                    </div>

                                    <div className="icon-social-wrapper">
                                        <img src={assets.svg.twitter} style={{ height: 30, width: 30 }} />
                                    </div>
                                </div>

                                <div className="col a-center">
                                    <h5 className="body-one-title ">SFN</h5>
                                    <h4>0.00%</h4>
                                </div>

                                <div className="col a-center">
                                    <h5 className="body-one-title ">Total Staked</h5>
                                    <h4>$0.00</h4>
                                </div>

                                <div className="col a-center">
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

export default PoolsPage;
