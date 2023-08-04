import { InjectedConnector } from '@web3-react/injected-connector';
import { StaticJsonRpcProvider } from '@ethersproject/providers';
import sample from 'lodash/sample';
import { NETWORKS_SUPPORTED } from '../configs/networks';

const chainId = parseInt(NETWORKS_SUPPORTED.chainId.toString(), 10);
const rpcNode = sample(NETWORKS_SUPPORTED.rpc);
if (!rpcNode) throw Error('One RPC node is not configured');

export const injected = new InjectedConnector({
    supportedChainIds: [chainId],
});

export const connectorByNames = {
    injected,
};

export const simpleRpcProvider = new StaticJsonRpcProvider(rpcNode);

export const setupDefaultNetwork = async () => {
    const provider = window.ethereum;
    if (provider) {
        try {
            await provider.request({
                method: 'wallet_addEthereumChain',
                params: [
                    {
                        chainId: `0x${chainId.toString(16)}`,
                        chainName: NETWORKS_SUPPORTED.name,
                        nativeCurrency: {
                            name: 'Zeta',
                            symbol: 'ZETA',
                            decimals: 18,
                        },
                        rpcUrls: [rpcNode],
                        blockExplorerUrls: [NETWORKS_SUPPORTED.explorer],
                    },
                ],
            });
            return true;
        } catch (error) {
            console.error('Failed to setup the network in Metamask:', error);
            return false;
        }
    } else {
        console.error("Can't setup the BSC network on metamask because window.ethereum is undefined");
        return false;
    }
};
