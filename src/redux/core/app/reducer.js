import * as types from './actionTypes';
import Immutable from 'seamless-immutable';

const initialState = Immutable({
    root: undefined, // 'login' / 'after-login'
    state: 'normal', // 'confirming' / 'ready'
    message: '', // global message
    initialized: false,
});

export default function appState(state = initialState, action = {}) {
    switch (action.type) {
        case types.ROOT_CHANGED:
            return state.merge({
                root: action.root,
                initialized: action.root === 'after-login' ? true : state.initialized,
            });
        case types.STATE_CHANGED:
            return state.merge({
                state: action.state,
                message: action.message || '',
            });
        default:
            return state;
    }
}
