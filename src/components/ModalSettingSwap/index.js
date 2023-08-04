import { useConnectors } from '@starknet-react/core';
import React from 'react';
import { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import assets from '../../assets';
import './style.scss';

const ModalSettingSwap = ({ isShowing, hide }) => {
    const handleClose = () => {
        hide();
    };

    const { available, connectors, connect, refresh } = useConnectors();

    const [activeButtonIndex, setActiveButtonIndex] = useState(0);

    const handleButtonClick = (index) => {
        setActiveButtonIndex(index);
    };

    const buttonOptions = ['Auto', '0.1 %', '0.5 %', '1 %'];

    // Refresh to check for available connectors every 5 seconds.
    useEffect(() => {
        const interval = setInterval(refresh, 5000);
        return () => clearInterval(interval);
    }, [refresh]);

    return isShowing
        ? ReactDOM.createPortal(
            <React.Fragment>
                <div className="modal-overlay" />
                <div className="modal-wrapper-swap" aria-modal aria-hidden tabIndex={-1} role="dialog">
                    <div
                        className="modal"
                        onClick={(event) => {
                            event.stopPropagation();
                        }}
                    >
                        <div className="modal-header">
                            <p className="fz-20 fw-7">Transaction Settings</p>

                            <div className="modal-close" onClick={handleClose}>
                                <img src={assets.svg.iconClose} alt="close" style={{ height: 15, width: 15 }} />
                            </div>
                        </div>
                        <div className="modal-body col j-center g-20">
                            <p>
                                <strong>Slippage tolerance:</strong> Your transaction will revert if the price changes
                                unfavorably by more than this percentage.
                            </p>

                            <div className="body__select">
                                {buttonOptions.map((option, index) => (
                                    <div
                                        key={index}
                                        className={`btn__outline${index === activeButtonIndex ? ' btn__outline--active' : ''}`}
                                        onClick={() => handleButtonClick(index)}
                                    >
                                        <p>{option}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="inputvalue">
                                <input />
                                <p>%</p>
                            </div>

                            <div className="btn" onClick={handleClose}>
                                <p>Confirm</p>
                            </div>
                        </div>
                    </div>
                </div>
            </React.Fragment>,
            document.body,
        )
        : null;
};

export default ModalSettingSwap;
