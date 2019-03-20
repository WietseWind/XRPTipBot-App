import { connect } from 'react-redux';

import * as appActions from '@redux/core/app/actions';
import * as accountActions from '@redux/core/account/actions';

import ScanView from './ScanView';

const mapStateToProps = state => ({
    appState: state.appState,
});

const mapDispatchToProps = {
    tip: accountActions.tip,
    getBalance: accountActions.getBalance,
    changeAppState: appActions.changeAppState,
    bump: accountActions.bump,
    lookupUsers: accountActions.lookupUsers,
};

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(ScanView);
