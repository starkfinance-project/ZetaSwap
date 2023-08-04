import { useState } from 'react';

const useModalSettingSwap = () => {
    const [isShowingSetting, setIsShowingSetting] = useState(false);

    function toggleSettingSwap() {
        setIsShowingSetting(!isShowingSetting);
    }

    return {
        isShowingSetting,
        toggleSettingSwap,
    };
};

export default useModalSettingSwap;
