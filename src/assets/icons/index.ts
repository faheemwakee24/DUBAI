// Import all SVG icons
import WhiteEmail from './white-email.svg';
import SendTransaction from './send-transaction.svg';
import CrossBtnSvg from './cross-btn.svg';
import AppleAuth from './apple-auth.svg';
import GoogleAuth from './google-auth.svg';
import ConnectHardWallet from './connect-hard-wallet.svg';
import PrivateKey from './private-key.svg';
import Microphone from './microphone.svg';
import User from './user.svg';
import ArrowRight from './arrow-right.svg';
import GooglePLay from './GooglePay.svg';
import AppleIcon from './AppleIcon.svg'
import ClosedEye from './ClosedEye.svg';
import OpenEye from './OpenEye.svg';
import Arrows from './Arrows.svg'

// Export all SVGs in a centralized object
export const Svgs = {
    // Authentication & User
    AppleAuth,
    GoogleAuth,
    User,
    PrivateKey,

    // Communication & Actions
    WhiteEmail,
    SendTransaction,
    CrossBtnSvg,
    ArrowRight,

    // Hardware & Security
    ConnectHardWallet,

    // Audio & Media
    Microphone,
    GooglePLay,
    AppleIcon,
    ClosedEye,
    OpenEye,
    Arrows

};

// Export individual icons for direct import if needed
export {
    WhiteEmail,
    SendTransaction,
    CrossBtnSvg,
    AppleAuth,
    GoogleAuth,
    ConnectHardWallet,
    PrivateKey,
    Microphone,
    User,
    ArrowRight,
};

// Export type for TypeScript support
export type SvgIconName = keyof typeof Svgs;
