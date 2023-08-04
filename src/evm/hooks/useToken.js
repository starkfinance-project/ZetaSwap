import { getToken } from '@/state/erc20';
import { useActiveWeb3React } from './useActiveWeb3React';
import { useEffect, useState } from 'react';

const useToken = (address) => {
    const { library } = useActiveWeb3React();

    const [token, setToken] = useState();

    useEffect(() => {
        (async () => {
            try {
                if (address) {
                    const token = await getToken(address, library);
                    console.log(token);
                    setToken(token);
                }
                setToken(undefined);
            } catch (error) {}
        })();
    }, [address, library]);

    return token;
};

export default useToken;
