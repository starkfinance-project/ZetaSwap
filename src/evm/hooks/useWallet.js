import { UnsupportedChainIdError } from '@web3-react/core';
import { NoEthereumProviderError } from '@web3-react/injected-connector';
import { useCallback, useEffect, useState } from 'react';
import { setupDefaultNetwork } from '../utils/web3React';
import { useActiveWeb3React } from './useActiveWeb3React';

export const useWallet = () => {
    const { activate, deactivate, error } = useActiveWeb3React();

    const [currentConnector, setCurrentConnector] = useState();

    useEffect(() => {
        const catchError = async () => {
            if (!error || !currentConnector || !activate) return;
            let errorMessage;
            if (error instanceof UnsupportedChainIdError) {
                const hasSetup = await setupDefaultNetwork();
                hasSetup && currentConnector && activate(currentConnector);
            } else if (error instanceof NoEthereumProviderError) {
                errorMessage =
                    'NoEthereumProviderError: Please install metamask extension or visit website in app which has ethereum provider.';
            } else {
                errorMessage = 'Error connect';
            }
            errorMessage && alert(errorMessage);
        };

        catchError();
    }, [error, activate, currentConnector]);

    const connect = useCallback(
        (connector) => {
            setCurrentConnector(connector);
            activate(connector);
        },
        [activate],
    );

    const disconnect = useCallback(() => {
        deactivate();
    }, [deactivate]);

    return {
        connect,
        disconnect,
        error,
    };
};
