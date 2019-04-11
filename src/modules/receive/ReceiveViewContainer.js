import { connect } from 'react-redux';

import * as appActions from '@redux/core/app/actions';
import * as accountActions from '@redux/core/account/actions';

import ReceiveView from './ReceiveView';

const mapStateToProps = state => ({
    accountState: state.accountState,
});

const mapDispatchToProps = {
    changeAppState: appActions.changeAppState,
    getBalance: accountActions.getBalance,
    logout: accountActions.logout,
    disconnect: appActions.disconnect,
    lookupUsers: accountActions.lookupUsers,
    saveSettings: accountActions.saveSettings,
};

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(ReceiveView);
