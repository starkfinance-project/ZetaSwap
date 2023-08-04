import axios from 'axios';
import { useState, useEffect, useRef } from 'react';
import {
    Area,
    AreaChart,
    defs,
    LinearGradient,
    Stop,
    Bar,
    BarChart,
    CartesianGrid,
    Legend,
    Line,
    LineChart,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';

function formatPrice2(price) {
    const formattedPrice = Number(price).toFixed(0);
    return formattedPrice;
}
function getHighestTotalVolume(data) {
    let highestVolume = 0;

    for (let i = 0; i < data.length; i++) {
        const volume = parseFloat(data[i].total_volume);
        if (volume > highestVolume) {
            highestVolume = volume;
        }
    }
    return parseInt(highestVolume) + 200;
}

const InfoPage = () => {
    const [liquidityData, setLiquidityData] = useState([]);
    const [volumeData, setVolumeData] = useState([]);

    const [priceSrt, setPriceSrt] = useState();
    const [dateCurrent, setDateCurrent] = useState();

    const [priceSrtVol, setPriceSrtVol] = useState();
    const [dateCurrentVol, setDateCurrentVol] = useState();

    const [windowSize, setWindowSize] = useState({
        width: window.innerWidth,
        height: window.innerHeight,
    });
    useEffect(() => {
        function handleResize() {
            setWindowSize({
                width: window.innerWidth,
                height: window.innerHeight,
            });
        }

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            setDateCurrent(payload[0].payload.date);
            setPriceSrt(formatPrice2(payload[0].payload.total_liquidity));
            return (
                <div className="custom-tooltip">
                    <p>{payload[0].date}</p>
                    <p className="label">{formatPrice2(payload[0].payload.total_liquidity)}</p>
                </div>
            );
        }
        return null;
    };

    const CustomTooltipVol = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            setDateCurrentVol(payload[0].payload.date);
            setPriceSrtVol(formatPrice2(payload[0].payload.total_volume));
            return (
                <div className="custom-tooltip">
                    <p>{payload[0].date}</p>
                    <p className="label">{formatPrice2(payload[0].payload.total_volume)}</p>
                </div>
            );
        }
        return null;
    };

    const getLiquidityData = async () => {
        try {
            const response = await axios.get(
                `https://api.starksport.finance/api/daily-liquidity/daily-liquidity`, // Fix to server query
            );
            setLiquidityData(response.data.data);
        } catch (error) {
            console.error('Error fetching liquidity prices:', error);
        }
    };

    const getVolumeData = async () => {
        try {
            const response = await axios.get(
                `https://api.starksport.finance/api/daily-volume/daily-volume`, // Fix to server query
            );
            setVolumeData(response.data.data);
        } catch (error) {
            console.error('Error fetching volume prices:', error);
        }
    };

    useEffect(() => {
        getLiquidityData();
        getVolumeData();
    }, []);

    useEffect(() => {
        if (liquidityData && liquidityData.length > 0) {
            setPriceSrt(formatPrice2(liquidityData[liquidityData.length - 1].total_liquidity));
            setDateCurrent(liquidityData[liquidityData.length - 1].date);
        }
    }, [liquidityData]);

    useEffect(() => {
        if (volumeData && volumeData.length > 0) {
            setPriceSrtVol(formatPrice2(volumeData[volumeData.length - 1].total_volume));
            setDateCurrentVol(volumeData[volumeData.length - 1].date);
        }
    }, [volumeData]);

    const rowsData = [{ Name: 'Token0/Token1', Liquidity: 2400, Vol24h: 800, Vol7d: 1600, Fee24h: 10 },]

    return (
        <div className="swap-page">
            <div className="row j-center gap-30 flex-wrap">
                <div className="chart-wrapper">
                    <div className="mb-50">
                        <h2 className="fz-16">Liquidity</h2>
                        <div className="row  flex-wrap a-end gap-20">
                            <h2 className="fz-40 fw-900 text-end cl-green">${priceSrt}</h2>
                        </div>
                        <h3 className="fz-16">Date: {dateCurrent}</h3>
                    </div>
                    <AreaChart
                        width={windowSize.width > 600 ? 600 : windowSize.width - 80}
                        height={300}
                        data={liquidityData}
                    >
                        <defs>
                            <linearGradient id="colorUv" x1="1" y1="1" x2="0" y2="0">
                                <stop offset="10%" stopColor="#fff" stopOpacity={0.9} />
                                <stop offset="100%" stopColor="#14ffe3" stopOpacity={0.9} />
                            </linearGradient>
                        </defs>
                        <XAxis dataKey="date" />
                        <YAxis dataKey="total_liquidity" />
                        <Area type="monotone" dataKey="total_liquidity" stroke="#14ffe3" fill="url(#colorUv)" />
                        <Tooltip content={<CustomTooltip />} />
                    </AreaChart>
                </div>

                <div className="chart-wrapper">
                    <div className="mb-50">
                        <h2 className="fz-16">Volume</h2>
                        <div className="row  flex-wrap a-end gap-20">
                            <h2 className="fz-40 fw-900 text-end cl-green">${priceSrtVol}</h2>
                        </div>
                        <h3 className="fz-16">Date: {dateCurrentVol}</h3>
                    </div>
                    <AreaChart
                        width={windowSize.width > 600 ? 600 : windowSize.width - 80}
                        height={300}
                        data={volumeData}
                    >
                        <defs>
                            <linearGradient id="colorUv" x1="1" y1="1" x2="0" y2="0">
                                <stop offset="10%" stopColor="#fff" stopOpacity={0.9} />
                                <stop offset="100%" stopColor="#14ffe3" stopOpacity={0.9} />
                            </linearGradient>
                        </defs>
                        <XAxis dataKey="date" />
                        <YAxis dataKey="total_volume" domain={[0, getHighestTotalVolume(volumeData)]} />
                        <Area type="monotone" dataKey="total_volume" stroke="#14ffe3" fill="url(#colorUv)" />
                        <Tooltip content={<CustomTooltipVol />} />
                    </AreaChart>
                </div>
            </div>
            <div className="row j-center gap-30 flex-wrap">
                <div className="mt-50">
                    <h2 className="">Top Pairs</h2>
                </div>
            </div>
            <div className="table-swap">
                <TableContainer component={Paper} style={{ background: '#0e0a1f' }}>
                    <Table sx={{}} aria-label="simple table">
                        <TableHead>
                            <TableRow>
                                {/* <TableCell style={{ textAlign: 'center' }}>ID</TableCell> */}
                                <TableCell style={{ textAlign: 'center' }}>Name</TableCell>
                                <TableCell style={{ textAlign: 'center' }}>Liquidity</TableCell>
                                <TableCell style={{ textAlign: 'center' }}>Volume (24h)</TableCell>
                                <TableCell style={{ textAlign: 'center' }}>Volume (7d)</TableCell>
                                <TableCell style={{ textAlign: 'center' }}>Fees (24h)</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {rowsData.map((row) => (
                                <TableRow key={row.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                    <TableCell style={{ textAlign: 'center' }}>
                                        {row.Name}
                                    </TableCell>
                                    <TableCell style={{ textAlign: 'center' }}>
                                        {row.Liquidity}
                                    </TableCell>
                                    <TableCell style={{ textAlign: 'center' }}>
                                        {row.Vol24h}
                                    </TableCell>
                                    <TableCell style={{ textAlign: 'center' }}>
                                        {row.Vol7d}
                                    </TableCell>
                                    <TableCell style={{ textAlign: 'center' }}>
                                        {row.Fee24h}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </div>

            <div className="row j-center gap-30 flex-wrap">
                <div className="">
                    <h2 className="">Top Tokens</h2>
                </div>
            </div>
            <div className="table-swap">
                <TableContainer component={Paper} style={{ background: '#0e0a1f' }}>
                    <Table sx={{}} aria-label="simple table">
                        <TableHead>
                            <TableRow>
                                {/* <TableCell style={{ textAlign: 'center' }}>ID</TableCell> */}
                                <TableCell style={{ textAlign: 'center' }}>Name</TableCell>
                                <TableCell style={{ textAlign: 'center' }}>Symbol</TableCell>
                                <TableCell style={{ textAlign: 'center' }}>Liquidity</TableCell>
                                <TableCell style={{ textAlign: 'center' }}>Volume (24h)</TableCell>
                                <TableCell style={{ textAlign: 'center' }}>Price</TableCell>
                            </TableRow>
                        </TableHead>
                    </Table>
                </TableContainer>
            </div>

        </div>
    );
};

export default InfoPage;
