import { useConnectors } from '@starknet-react/core';
import React, { useCallback } from 'react';
import { useEffect } from 'react';
import ReactDOM from 'react-dom';
import assets from '../../assets';
import './style.scss';

import { useWallet } from '../../evm/hooks/useWallet';
import { injected } from '../../evm/utils/web3React';
import { useDispatch } from 'react-redux';
import actions from '../../redux/action';

const ModalWallet = ({ isShowing, hide }) => {
    const dispatch = useDispatch();

    const { connect: connectEvm } = useWallet();

    const handleArgent = () => {};

    const handleBraavos = () => {};

    const handleClose = () => {
        hide();
    };

    const { available, connectors, connect, refresh } = useConnectors();

    // Refresh to check for available connectors every 5 seconds.
    useEffect(() => {
        const interval = setInterval(refresh, 5000);
        return () => clearInterval(interval);
    }, [refresh]);

    // Handle connect wallet, alert if user haven't installed that wallet
    const handleConnect = (connector, isEvm = false) => {
        if (isEvm) {
            connectEvm(connector);
        } else {
            const isWalletConnected = available?.find(
                (availableConnector) => availableConnector.id() === connector.id(),
            );
            if (!isWalletConnected && !isEvm) return alert(`Please install ${connector.id()} wallet!`);
            connect(connector);
        }
        localStorage.setItem('isEvm', isEvm);
        dispatch(actions.setIsEvm(isEvm));
        handleClose();
    };

    return isShowing
        ? ReactDOM.createPortal(
              <React.Fragment>
                  <div className="modal-overlay" />
                  <div className="modal-wrapper-wallet" aria-modal aria-hidden tabIndex={-1} role="dialog">
                      <div
                          className="modal"
                          onClick={(event) => {
                              event.stopPropagation();
                          }}
                      >
                          <div className="modal-header">
                              <p className="fz-20 fw-7">WalletConnect</p>

                              <div className="modal-close" onClick={handleClose}>
                                  <img src={assets.svg.iconClose} alt="close" style={{ height: 15, width: 15 }} />
                              </div>
                          </div>
                          <div className="modal-body row j-center g-50">
                              <div
                                  className="wallet-icon col a-center g-5"
                                  onClick={() => handleConnect(connectors[1])}
                              >
                                  <img src={assets.images.argent} />
                                  <p className="fz-18 fw-7">Argent</p>
                              </div>
                              <div
                                  className="wallet-icon col a-center g-5"
                                  onClick={() => handleConnect(connectors[0])}
                              >
                                  <img src={assets.images.braavos} />
                                  <p className="fz-18 fw-7">Braavos</p>
                              </div>

                              <div
                                  className="wallet-icon col a-center g-5"
                                  onClick={() => handleConnect(injected, true)}
                              >
                                  <img src={assets.images.metamask} />
                                  <p className="fz-18 fw-7">MetaMask</p>
                              </div>
                          </div>
                      </div>
                  </div>
              </React.Fragment>,
              document.body,
          )
        : null;
};

export default ModalWallet;
