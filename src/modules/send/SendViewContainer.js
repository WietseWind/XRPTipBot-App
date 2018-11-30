import {connect} from 'react-redux';

import * as appActions from '@redux/core/app/actions';
import * as accountActions from '@redux/core/account/actions';


import SendView from './SendView';

const mapStateToProps = state => ({
    accountState: state.accountState
});

const mapDispatchToProps = {
    changeAppState: appActions.changeAppState,
    getBalance: accountActions.getBalance,
    tip: accountActions.tip

};

export default connect(mapStateToProps, mapDispatchToProps)(SendView);
