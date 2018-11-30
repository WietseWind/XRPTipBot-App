import {connect} from 'react-redux';

import * as accountActions from '@redux/core/account/actions';


import ContactsView from './ContactsView';

const mapStateToProps = state => ({
    accountState: state.accountState
});

const mapDispatchToProps = {
    getContacts: accountActions.getContacts,
    persistContacts: accountActions.persistContacts,


};

export default connect(mapStateToProps, mapDispatchToProps)(ContactsView);
