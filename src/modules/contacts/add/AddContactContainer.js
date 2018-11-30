import {connect} from 'react-redux';

import * as accountActions from '@redux/core/account/actions';


import AddContactView from './AddContactView';

const mapStateToProps = state => ({
    accountState: state.accountState
});

const mapDispatchToProps = {
    getContacts: accountActions.getContacts,
    persistContacts: accountActions.persistContacts,
    lookupUsers: accountActions.lookupUsers
};

export default connect(mapStateToProps, mapDispatchToProps)(AddContactView);
