import {connect} from 'react-redux';

import * as authActions from '@redux/core/account/actions';
import * as appActions from '@redux/core/app/actions';


import PinCodeView from './PinCodeView';

const mapStateToProps = state => ({
    accountState: state.accountState
});


const mapDispatchToProps = {
    pinLogin: authActions.pinLogin,
    changeAppRoot: appActions.changeAppRoot,
    connect: appActions.connect
};

export default connect(mapStateToProps, mapDispatchToProps)(PinCodeView);
