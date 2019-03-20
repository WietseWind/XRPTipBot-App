/**
 * Combine All Reducers
 */

import { combineReducers } from 'redux';

import appState from '@redux/core/app/reducer';
import accountState from '@redux/core/account/reducer';
import pushState from '@redux/core/push/reducer';

// Combine all
const appReducer = combineReducers({
    appState,
    accountState,
    pushState,
});

// Setup root reducer
const rootReducer = (state, action) => {
    const newState = action.type === 'RESET' ? null : state;
    return appReducer(newState, action);
};

export default rootReducer;
