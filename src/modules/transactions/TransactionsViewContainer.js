import { connect } from 'react-redux';

import * as appActions from '@redux/core/app/actions';
import * as accountActions from '@redux/core/account/actions';

import TransactionsView from './TransactionsView';

const mapStateToProps = state => ({
    accountState: state.accountState,
});

const mapDispatchToProps = {
    changeAppState: appActions.changeAppState,
    getBalance: accountActions.getBalance,
    getTransactions: accountActions.getTransactions,
    persistContacts: accountActions.persistContacts,
};

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(TransactionsView);
