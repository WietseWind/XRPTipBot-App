import * as types from './actionTypes';

import { isSignedIn } from '@libs/authentication';

export function appInitialized() {
    return async function(dispatch, getState) {
        isSignedIn()
            // Logged in, show Main screen
            .then(() => {
                dispatch(changeAppRoot('after-login'));
                dispatch(connect());
            })
            // Not Logged in, show Login screen
            .catch(() => {
                dispatch(changeAppRoot('login'));
                dispatch(disconnect());
            });
    };
}

export function connect() {
    return { type: 'CONNECT' };
}

export function disconnect() {
    return { type: 'DISCONNECT' };
}

export function changeAppRoot(root) {
    return { type: types.ROOT_CHANGED, root: root };
}

export function changeAppState(state, message) {
    return { type: types.STATE_CHANGED, state: state, message: message || '' };
}
