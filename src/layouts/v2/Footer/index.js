import assets from '../../../assets';
import './style.scss';

const FooterLayout = () => {
    const contactData = {
        telegram: 'https://t.me/starksportglobal',
        telegramChannel: 'https://t.me/starksportchanel',
        twitter: 'https://twitter.com/starkfinance?s=21&t=mYOANC7ZpixnNnYAW14NEQ',
        discord: 'https://discord.gg/Z2Z8BwHy6k',
    };

    const openInNewTab = (url) => {
        var win = window.open(url, '_blank');
        win.focus();
    };

    return (
        <div className="footer-layout col g-10">
            <p className="text-center fz-18">Stark Sport us a product developer by 0xIcii</p>
            <div className="row g-15 a-center j-center">
                <img
                    src={assets.svg.iconDiscord}
                    alt="discord"
                    style={{ height: '4rem', width: '4rem' }}
                    onClick={() => {
                        openInNewTab(contactData.discord);
                    }}
                />
                <img
                    src={assets.svg.iconTwetter}
                    alt="discord"
                    style={{ height: '4rem', width: '4rem' }}
                    onClick={() => {
                        openInNewTab(contactData.twitter);
                    }}
                />
                <img
                    src={assets.svg.iconTelegram}
                    alt="discord"
                    style={{ height: '4rem', width: '4rem' }}
                    onClick={() => {
                        openInNewTab(contactData.telegram);
                    }}
                />
                <img
                    src={assets.svg.iconTelegram}
                    alt="discord"
                    style={{ height: '4rem', width: '4rem' }}
                    onClick={() => {
                        openInNewTab(contactData.telegramChannel);
                    }}
                />
            </div>
            <p className="text-center fz-14">Contact: support@starksport.finance</p>
            <p className="text-center fz-12">©2023 STARKSPORT ALL RIGHTS RESERVED</p>
        </div>
    );
};

export default FooterLayout;
