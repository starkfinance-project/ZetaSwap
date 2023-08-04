import './App.scss';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HeaderLayout from './layouts/v2/Header';
import { publicRoutes } from './routes';
import { StarknetConfig, InjectedConnector } from '@starknet-react/core';
import React, { useState, useEffect } from 'react';
import FooterLayout from './layouts/v2/Footer';
import Footer from './layouts/Footer';

import { useEagerConnect } from './evm/hooks/useEagerConnect';
import { useInactiveListener } from './evm/hooks/useInactiveListener';
import { Web3Provider } from '@ethersproject/providers';
import { useWeb3React, Web3ReactProvider } from '@web3-react/core';
import { useDispatch, useSelector } from 'react-redux';
import actions from './redux/action';

function getLibrary(provider) {
    const library = new Web3Provider(provider);
    library.pollingInterval = 12000;
    return library;
}

// Hook
function useWindowSize() {
    const [windowSize, setWindowSize] = useState({
        width: undefined,
        height: undefined,
    });
    useEffect(() => {
        function handleResize() {
            setWindowSize({
                width: window.innerWidth,
                height: window.innerHeight,
            });
        }
        window.addEventListener('resize', handleResize);
        handleResize();
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    return windowSize;
}

const App = () => {
    const dispatch = useDispatch();

    const isEvm = useSelector((state) => state.isEvm);

    useEffect(() => {
        const isEvm = String(localStorage.getItem('isEvm')).toLowerCase() === 'true';
        dispatch(actions.setIsEvm(isEvm));
    }, []);

    const { connector } = useWeb3React();

    const [activatingConnector, setActivatingConnector] = useState();
    useEffect(() => {
        if (activatingConnector && activatingConnector === connector) {
            setActivatingConnector(undefined);
        }
    }, [activatingConnector, connector]);
    const triedEager = useEagerConnect();
    useInactiveListener(!triedEager || !!activatingConnector);

    const size = useWindowSize();
    const connectors = [
        new InjectedConnector({ options: { id: 'braavos' } }),
        new InjectedConnector({ options: { id: 'argentX' } }),
    ];

    return (
        <StarknetConfig connectors={connectors}>
            <Router>
                <div className="content-wrapper">
                    <HeaderLayout />

                    <Routes>
                        {publicRoutes.map((route, index) => {
                            const Page = route.element;
                            return <Route key={index} path={route.path} element={<Page />}></Route>;
                        })}
                    </Routes>
                    <Footer />
                    <FooterLayout />
                </div>
            </Router>
        </StarknetConfig>
    );
};

// eslint-disable-next-line import/no-anonymous-default-export
export default function () {
    return (
        <Web3ReactProvider getLibrary={getLibrary}>
            <App />
        </Web3ReactProvider>
    );
}
