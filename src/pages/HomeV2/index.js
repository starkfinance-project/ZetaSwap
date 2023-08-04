import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import assets from '../../assets';
import { route } from '../../routes/configs';
import './style.scss';
import axios from 'axios';

const HomePageV2 = () => {
    const navigate = useNavigate();
    const [allTimeVol, setAllTimeVol] = useState(0);
    useEffect(() => {
        async function getTotalVol() {
            let res = await axios.get(`https://api.starksport.finance/api/daily-volume/total-volume`);
            let vol = parseInt(res.data.data).toFixed(0).toLocaleString('en-US');
            setAllTimeVol(vol);
        }
        getTotalVol();
    }, []);

    const openInNewTab = (url) => {
        var win = window.open(url, '_blank');
        win.focus();
    };

    const navClick = (path) => {
        navigate(path);
    };

    return (
        <div className="home-page">
            <div className="container col mx-auto my-60">
                <div className="banner row mx-auto g-20 a-center p-20">
                    <div className="banner__content col g-2 a-center">
                        <p className="fz-80 fw-7">STARK SPORT</p>
                        <p className="fz-32">Decentralized Finance Platform</p>
                        <p className="fz-18 cl-light fw-3">Cryptocurrency trading platform, NFTS event</p>

                        {/* <p className="fz-23 my-20 cl-green">$4908 all-time volume</p> */}
                        <p className="fz-23 my-20 cl-green">
                            ${isNaN(allTimeVol) ? '0' : allTimeVol > 10000 ? 4960 : allTimeVol} all-time volume
                        </p>

                        <div
                            className="btn"
                            onClick={() => {
                                navClick(route.nft);
                            }}
                        >
                            <p className="btn__title">Mint Now</p>
                        </div>
                    </div>
                </div>

                <div className=" col g-20 my-60">
                    <p className="fz-13 cl-light text-center">POWERED BY</p>

                    <div className="row j-center g-40">
                        {/* <div className="row a-center j-center g-4">
                            <img src={assets.images.galxe} alt="galxe" style={{ height: 50, width: 50 }} />

                            <h4 className="fz-20 cl-light">GALXE</h4>
                        </div> */}

                        <div className="row a-center j-center g-4">
                            <img src={assets.images.starknet} alt="starknet" style={{ height: 50, width: 50 }} />

                            <h4 className="fz-20 cl-light">STARKNET</h4>
                        </div>
                    </div>
                </div>
            </div>

            <div className="experience container row mx-auto my-60 g-24">
                <div className="experience__left col f-1 g-30">
                    <h1 className="experience__left--title fz-48">Our mission & vision</h1>
                    <div
                        className="btn"
                        onClick={() => {
                            openInNewTab('https://starksport.gitbook.io/');
                        }}
                    >
                        <p className="btn__title">Open docs</p>
                    </div>
                </div>

                {/* <div className="f-1"></div> */}

                <div className="experience__right col f-1 g-30">
                    <div className="row a-center g-15 p-">
                        <img src={assets.svg.iconLayer2} alt="layer2" style={{ height: 36, width: 32 }} />
                        <div className="col">
                            <p className="fz-20">INDUSTRY BEST PRACTICES</p>
                            <p className="cl-light">Allow for user rewards to be paid and used immediately.</p>
                        </div>
                    </div>

                    <div className="row a-center g-15">
                        <img src={assets.svg.iconPriceFeeds} alt="layer2" style={{ height: 36, width: 32 }} />
                        <div className="col">
                            <p className="fz-20">NFTs EVENT</p>
                            <p className="cl-light">Supports NFT trading and staking to maximize returns. </p>
                        </div>
                    </div>

                    <div className="row a-center g-15">
                        <img src={assets.svg.iconYield} alt="layer2" style={{ height: 36, width: 32 }} />
                        <div className="col">
                            <p className="fz-20">EXCHANGE</p>
                            <p className="cl-light">Allow for easy swapping between tokens.</p>
                        </div>
                    </div>

                    <div className="row a-center g-15">
                        <img src={assets.svg.iconLiquidation} alt="layer2" style={{ height: 36, width: 32 }} />
                        <div className="col">
                            <p className="fz-20">SAFE TREANSACTION</p>
                            <p className="cl-light">Ensure all governance to be implemented.</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="security container row mx-auto my-60 g-24 p-20">
                <div className="security__content col f-1 g-30">
                    <div className="security__content__wrapper row a-end">
                        <h1 className=" security__content--title fz-48">Security </h1>
                        <h1 className="fz-48 ml-10">&</h1>
                        <img src={assets.images.audit2} style={{ width: 160, height: 115 }} />
                    </div>
                    <p className="security__content--subtitle fz-24 fw-3 cl-light">
                        Due to the experimental nature of our platform, we consider security a top priority. Our smart
                        contract is undergoing multiple independent audits from StarkGuardians and Certik
                    </p>
                    <div
                        className="btn"
                        onClick={() => {
                            openInNewTab('https://skynet.certik.com/projects/starksport');
                        }}
                    >
                        <p className="btn__title">Learn more</p>
                    </div>
                </div>

                <div className="security__img f-1 row a-center ">
                    <img src={assets.images.audit_logo} style={{ width: 300 }} />
                    <img src={assets.images.audit_certik} style={{ width: 170 }} />
                </div>
            </div>
        </div>
    );
};

export default HomePageV2;
