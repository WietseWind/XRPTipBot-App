import { connect } from 'react-redux';

import * as authActions from '@redux/core/account/actions';
import * as appActions from '@redux/core/app/actions';

import WebSigninView from './WebSigninView';

const mapStateToProps = state => ({
    accountState: state.accountState,
});

const mapDispatchToProps = {
    webLogin: authActions.webLogin,
    changeAppRoot: appActions.changeAppRoot,
    connect: appActions.connect,
};

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(WebSigninView);
