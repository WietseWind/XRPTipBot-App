import {connect} from 'react-redux';

import SelectContactView from './SelectContactView';


import * as accountActions from '@redux/core/account/actions';


const mapStateToProps = state => ({
    accountState: state.accountState
});

const mapDispatchToProps = {
    lookupUsers: accountActions.lookupUsers

};

export default connect(mapStateToProps, mapDispatchToProps)(SelectContactView);
