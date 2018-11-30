import {connect} from 'react-redux';

import * as authActions from '@redux/core/account/actions';
import * as appActions from '@redux/core/app/actions';


import AuthView from './AuthView';

const mapStateToProps = state => ({
    accountState: state.accountState
});


const mapDispatchToProps = {
    login: authActions.login,
    paperLogin: authActions.paperLogin,
    changeAppRoot: appActions.changeAppRoot,
    connect: appActions.connect
};

export default connect(mapStateToProps, mapDispatchToProps)(AuthView);
