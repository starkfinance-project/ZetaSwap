import './style.scss';

const DonutChart = () => {
    return (
        <div class="container">
            <div class="donut-chart-block block">
                <div class="donut-chart">
                    <div id="part1" class="portion-block">
                        <div class="circle"></div>
                    </div>
                    <div id="part2" class="portion-block">
                        <div class="circle"></div>
                    </div>
                    <div id="part3" class="portion-block">
                        <div class="circle"></div>
                    </div>
                    <p class="center"></p>
                </div>
            </div>
        </div>
    );
};

export default DonutChart;
