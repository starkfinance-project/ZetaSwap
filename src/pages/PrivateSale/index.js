import assets from '../../assets';

import Footer from '../../layouts/Footer';
import './style.scss';

const PrivateSalePage = () => {
    return (
        <div className="nft-page">
            <div className="list-wrapper col a-center">
                <iframe
                    src="https://docs.google.com/forms/d/e/1FAIpQLSfdGf4rgrvkRcXlFRkX3lF1H40waT2DYPrb-I4hOoX-LJQq1w/viewform?embedded=true"
                    width="650"
                    height="1500"
                    frameborder="0"
                    marginheight="0"
                    marginwidth="0"
                >
                    Đang tải…
                </iframe>
            </div>
        </div>
    );
};

export default PrivateSalePage;
