import { getListTokens } from '../utils/networks';
import { useMemo } from 'react';

const useListTokens = () => {
    return useMemo(() => getListTokens(), []);
};

export default useListTokens;
