import ReactDOM from 'react-dom/client';
import { setSmartChartsPublicPath } from '@deriv/deriv-charts';
import { AuthWrapper } from './app/AuthWrapper';
import { AnalyticsInitializer } from './utils/analytics';
import { registerPWA } from './utils/pwa-utils';
import './styles/index.scss';

// Set SmartCharts public path immediately before React mounts
// This ensures all SmartCharts chunks (including Flutter adapter) load from the correct path
setSmartChartsPublicPath('/js/smartcharts/');

AnalyticsInitializer();
registerPWA()
    .then(registration => {
        if (registration) {
            console.log('PWA service worker registered successfully for Chrome');
        } else {
            console.log('PWA service worker disabled for non-Chrome browser');
        }
    })
    .catch(error => {
        console.error('PWA service worker registration failed:', error);
    });

ReactDOM.createRoot(document.getElementById('root')!).render(<AuthWrapper />);
