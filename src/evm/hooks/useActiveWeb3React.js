import { useWeb3React } from '@web3-react/core';
import { useEffect, useRef, useState } from 'react';
import { simpleRpcProvider } from '../utils/web3React';
import { useSelector } from 'react-redux';

export const useActiveWeb3React = () => {
    const isEvm = useSelector((state) => state.isEvm);
    const { account, chainId, library, ...rest } = useWeb3React();

    const refEth = useRef(library);
    const [provider, setProvider] = useState(library || simpleRpcProvider);

    useEffect(() => {
        if (library !== refEth.current) {
            setProvider(library || simpleRpcProvider);
            refEth.current = library;
        }
    }, [library]);

    return {
        isConnected: !!(account && chainId && isEvm),
        account,
        chainId,
        library: provider,
        ...rest,
    };
};
