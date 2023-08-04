import { SHOW_MODAL_WALLET, SET_IS_EVM } from './type';

const showModalWallet = (state) => {
    return {
        type: SHOW_MODAL_WALLET,
        value: state,
    };
};

const setIsEvm = (isEvm) => {
    return {
        type: SET_IS_EVM,
        value: isEvm,
    };
};

const actions = {
    showModalWallet,
    setIsEvm,
};

export default actions;
