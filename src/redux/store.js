// redux lib
import {applyMiddleware, compose, createStore} from 'redux';
import {AsyncStorage} from 'react-native';
import {persistStore, autoRehydrate} from 'redux-persist'; // for persist redux

import ImmutablePersistenceTransform from './ImmutablePersistenceTransform'

// redux tools
import thunk from "redux-thunk";
import logger from 'redux-logger';

import rootReducer from '@redux/reducer';
import { pushMiddleware } from '@redux/middleware/';

// Load middleware
let middleware = [
    thunk,
    pushMiddleware
];

if (__DEV__) {
    // Dev-only middleware
    middleware = [
        ...middleware,
        logger
    ];
}

export default function configureStore(initialState) {
    return new Promise((resolve, reject) => {
        try {
            const store = compose(
                applyMiddleware(...middleware),
                autoRehydrate(),
            )(createStore)(rootReducer);

            persistStore(
                store,
                {
                    storage: AsyncStorage,
                    whitelist: ['accountState'],
                    transforms: [ImmutablePersistenceTransform]
                },
                () => resolve(store)
            );
        } catch (e) {
            reject(e);
        }
    });
}
