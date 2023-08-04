import 'antd/dist/antd.css';
import './style.scss';
import Modal from 'antd/lib/modal/Modal';
import { useDispatch, useSelector } from 'react-redux';
import actions from '../../../redux/action';
import assets from '../../../assets';
import { useConnectors } from '@starknet-react/core';
import React, { useEffect } from 'react';

const ModalConnectWallet = (props) => {
    const dispatch = useDispatch();
    const isShow = useSelector((state) => state.showModalWallet);

    const handleCancel = () => {
        dispatch(actions.showModalWallet(false));
    };

    const { available, connectors, connect, refresh } = useConnectors();

    // Refresh to check for available connectors every 5 seconds.
    useEffect(() => {
        const interval = setInterval(refresh, 5000);
        return () => clearInterval(interval);
    }, [refresh]);

    // Handle connect wallet, alert if user haven't installed that wallet
    const handleConnect = (connector) => {
        const isWalletConnected = available.find((availableConnector) => availableConnector.id() === connector.id());
        isWalletConnected ? connect(connector) : alert(`Please install ${connector.id()} wallet!`);
        handleCancel();
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
            onCancel={handleCancel}
        >
            <div className="modal-wrapper ">
                <div className="col gap-10 a-center" onClick={() => handleConnect(connectors[0])}>
                    <div className="icon-wrapper">
                        <img src={assets.images.logoBraavos} />
                    </div>
                    <h3>Braavos</h3>
                </div>

                <div className="col gap-10 a-center" onClick={() => handleConnect(connectors[1])}>
                    <div className="icon-wrapper">
                        <img src={assets.images.logoArgent} />
                    </div>
                    <h3>Argent X</h3>
                </div>

                <div className="col gap-10 a-center" onClick={() => handleConnect(connectors[0])}>
                    <div className="icon-wrapper">
                        <img src={assets.images.metamask} />
                    </div>
                    <h3>MetaMask</h3>
                </div>
            </div>
        </Modal>
    );
};

export default ModalConnectWallet;
