import 'antd/dist/antd.css';
import './style.scss';
import Modal from 'antd/lib/modal/Modal';
import assets from '../../../assets';
import React, { useEffect } from 'react';

const ModalSetting = (props) => {
    const {
        isShowSetting,
        setIsShowSetting,
        slippagePercentage,
        deadlineMinutes,
        setSlippagePercentage,
        setDeadlineMinutes,
    } = props;
    const handleSlippagePercentageChange = (event) => {
        let inputNumber = event.target.value;
        if (inputNumber <= 0) {
            inputNumber = 0.1;
        } else if (inputNumber > 50) {
            inputNumber = 49;
        }
        setSlippagePercentage(inputNumber);
    };
    const handleDeadlineMinutesChange = (event) => {
        let inputNumber = event.target.value;
        if (inputNumber <= 0) {
            inputNumber = 1;
        }
        setDeadlineMinutes(inputNumber);
    };
    const handleDivClick = (value) => {
        setSlippagePercentage(value);
    };
    return (
        <Modal
            open={isShowSetting}
            footer={null}
            centered
            bodyStyle={{
                backgroundColor: '#000',
                overflow: 'auto',
                gap: 20,
            }}
            onCancel={() => {
                setIsShowSetting(false);
            }}
        >
            <div className="select-token-modal">
                <div className="header-modal-wrapper">
                    <div
                        className="row gap-10"
                        style={{ marginTop: 10, marginBottom: 20, display: 'flex', justifyContent: 'space-between' }}
                    >
                        <div
                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}
                        >
                            <h4 className="">Slippage</h4>
                            <input
                                className="slippage-input"
                                placeholder={slippagePercentage}
                                type={'number'}
                                min={'0'}
                                onChange={handleSlippagePercentageChange}
                            ></input>
                            <h4
                                className=""
                                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            >
                                %
                            </h4>
                        </div>
                        <div
                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}
                        >
                            <div
                                className="slippage-input cursor-pointer"
                                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                onClick={() => handleDivClick(0.1)}
                            >
                                0.1%
                            </div>
                            <div
                                className="slippage-input cursor-pointer"
                                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                onClick={() => handleDivClick(1)}
                            >
                                1%
                            </div>
                            <div
                                className="slippage-input cursor-pointer"
                                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                onClick={() => handleDivClick(2)}
                            >
                                2%
                            </div>
                        </div>
                    </div>

                    <div className="row gap-10">
                        <h4>Transaction deadline</h4>
                        <input
                            className="slippage-input"
                            placeholder={deadlineMinutes}
                            type={'number'}
                            min={'0'}
                            onChange={handleDeadlineMinutesChange}
                        ></input>
                        <h4>minutes</h4>
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default ModalSetting;
