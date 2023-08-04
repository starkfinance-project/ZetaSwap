import { Percent, JSBI, Token } from '@uniswap/sdk';
import assets from '../../assets';

export const NETWORKS_SUPPORTED = {
    name: 'Zeta Testnet',
    chainId: 7001,
    rpc: ['https://zetachain-athens-evm.blockpi.network/v1/rpc/public'],
    explorer: 'https://athens3.explorer.zetachain.com/',
};

export const WETH = new Token(
    NETWORKS_SUPPORTED.chainId,
    '0x5F0b1a82749cb4E2278EC87F8BF6B618dC71a8bf',
    18,
    'ZETA',
    'Zeta',
);

// used to construct intermediary pairs for trading
export const BASES_TO_CHECK_TRADES_AGAINST = [WETH];

export const CUSTOM_BASES = {};

export const TOKEN_LIST = [
    WETH,
    new Token(NETWORKS_SUPPORTED.chainId, '0xC05a487a9c4c9B155F4B39117bB854D1E792B210', 18, 'TEST_BTC', 'TEST_BTC'),
    new Token(NETWORKS_SUPPORTED.chainId, '0x0439187Ab4a0E43B7E726482871df480Deb870b9', 18, 'MTK1', 'MyToken1'),
];

export const TOKEN_ICON_LIST = {
    [WETH.address]: assets.images.zeta,
    '0xC05a487a9c4c9B155F4B39117bB854D1E792B210': assets.svg.btc,
    '0x0439187Ab4a0E43B7E726482871df480Deb870b9': assets.svg.eth,
};

export const UNKNOWN_TOKEN_ICON =
    'https://icones.pro/wp-content/uploads/2021/05/icone-point-d-interrogation-question-noir.png';

export const MULTICALL_ADDRESS = '0x4aF8d9Ab04EA63C621C729EFd95d6BDCB8B15cf9';

export const FACTORY_ADDRESS = '0x2723a9B9F8D015C1f0bD3B5fd9393716e16D2f20';

export const ROUTER_ADDRESS = '0xDA9cd02db532d205D593430ce7B12769F2F1e291';

export const INIT_CODE_HASH = '0x5bfbf8ac5fa24ec49b051b579d000fb25988e044b9ab8fe321d250613193c74f';

export const Field = {
    INPUT: 'INPUT',
    OUTPUT: 'OUTPUT',
};

export const MAX_TRADE_HOPS = 3;

export const BETTER_TRADE_LESS_HOPS_THRESHOLD = new Percent(JSBI.BigInt(50), JSBI.BigInt(10000));

export const ZERO_PERCENT = new Percent('0');
export const ONE_HUNDRED_PERCENT = new Percent('1');
export const FIVE_PERCENT = new Percent(JSBI.BigInt(5), JSBI.BigInt(100));
export const SWAP_FEE_PERCENT = new Percent(JSBI.BigInt(97), JSBI.BigInt(100));

export const BIPS_BASE = JSBI.BigInt(10000);
