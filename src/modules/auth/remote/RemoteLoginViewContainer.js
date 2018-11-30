import {connect} from 'react-redux';

import * as authActions from '@redux/core/account/actions';
import * as appActions from '@redux/core/app/actions';


import RemoteLoginView from './RemoteLoginView';

const mapStateToProps = state => ({
    accountState: state.accountState
});


const mapDispatchToProps = {
    login: authActions.login,
    changeAppRoot: appActions.changeAppRoot,
    connect: appActions.connect
};

export default connect(mapStateToProps, mapDispatchToProps)(RemoteLoginView);
