import {connect} from 'react-redux';

import IntroView from './IntroView';

import * as authActions from '@redux/core/account/actions';
import * as appActions from '@redux/core/app/actions';


const mapStateToProps = state => ({
    appState: state.appState
});

const mapDispatchToProps = {
    login: authActions.login,
    changeAppRoot: appActions.changeAppRoot,
    connect: appActions.connect
};

export default connect(mapStateToProps, mapDispatchToProps)(IntroView);