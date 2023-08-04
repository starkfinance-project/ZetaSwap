import {
    ComingSoonPage,
    FarmsPage,
    LiquidityPage,
    NFTPage,
    PoolsPage,
    SwapPage,
    LendingPage,
    AirdropPage,
    InfoPage,
} from '../pages';
import TestnetTokenPage from '../pages/ClaimTestnetToken';
import HomePage from '../pages/Home';
import HomePageV2 from '../pages/HomeV2';
import PrivateSalePage from '../pages/PrivateSale';
import { route } from './configs';

const publicRoutes = [
    { path: route.home, element: HomePageV2 },
    { path: route.nft, element: NFTPage },
    // { path: route.airdrop, element: AirdropPage },
    { path: route.privatesale, element: PrivateSalePage },
    { path: route.swap, element: SwapPage },
    { path: route.liquidity, element: LiquidityPage },
    { path: route.liquidity2, element: LiquidityPage },
    { path: route.pools, element: PoolsPage },
    { path: route.lending, element: LendingPage },
    { path: route.farms, element: FarmsPage },
    { path: route.privatesale, element: PrivateSalePage },
    { path: route.claimToken, element: TestnetTokenPage },
    { path: route.info, element: InfoPage },
    { path: '*', element: ComingSoonPage },
];

const privateRoutes = [];

export { publicRoutes, privateRoutes };
