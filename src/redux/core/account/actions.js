
import {Platform} from 'react-native';

import AppAPI from '@libs/api';

import { clearAuthenticationToken, setAuthenticationToken, getAuthenticationToken } from '@libs/authentication'

import * as appActions from '@redux/core/app/actions';

import * as types from './actionTypes';

import DeviceInfo from 'react-native-device-info';


export function login(token, freshLogin) {
    return dispatch => new Promise(async(resolve, reject) => {

        if (!token) return reject("Empty Token");

        // Force logout, before logging in
        if (freshLogin) {await clearAuthenticationToken();}

        AppAPI.token.post(null, {
            token: token,
            platform: Platform.OS,
            model: DeviceInfo.getModel(),
        }).then(async(res) => {
            if(res.error === true){
                return reject(res.message)
            }
            // Set token in AsyncStorage + memory
            await setAuthenticationToken(token);

            const { data } = res;

            dispatch({
                type: types.USER_REPLACE,
                payload: {
                    uid: data.uid,
                    network: data.network,
                    slug: data.slug
                }
            });
            return resolve(token)
        }).catch(err => reject(err));

    });
}


export function paperLogin(token) {
    return dispatch => new Promise(async(resolve, reject) => {

        if (!token) return reject("Empty Token");

        AppAPI.activate.post(null, {
            token,
        }).then(async(res) => {
            if(res.error === true){
                return resolve(res.message)
            }
            const { data } = res;

            if(data.next){
                return resolve(data.next)
            }
        }).catch(err => reject(err));
    });
}


export function pinLogin(token, pin) {
    return dispatch => new Promise(async(resolve, reject) => {

        if (!token || !pin) return reject("Empty Token");

        AppAPI.activate.post(null, {
            token,
            pin
        }).then(async(res) => {
            if(res.error === true){
                return reject(res.message)
            }
            const { data } = res;
            if (data.next === "SIGN_IN" && data.app_token){
                const {app_token } = data;

                AppAPI.token.post(null, {
                    token: app_token,
                    platform: Platform.OS,
                    model: DeviceInfo.getModel(),
                }).then(async(res) => {
                    if(res.error === true){
                        return reject(res.message)
                    }
                    // Set token in AsyncStorage + memory
                    await setAuthenticationToken(app_token);

                    const { data } = res;

                    dispatch({
                        type: types.USER_REPLACE,
                        payload: {
                            uid: data.uid,
                            network: data.network,
                            slug: data.slug
                        }
                    });
                    return resolve("SUCCESS")
                }).catch(err => reject(err));
            }
        }).catch(err => reject(err));
    });
}


export function webLogin(params) {
    return dispatch => new Promise(async(resolve, reject) => {
        const token = await getAuthenticationToken();


        AppAPI.webauth.post(null, {...params, token}).then(async(res) => {
            if(res.error === true){
                return reject(res.message)
            }
            return resolve()
        }).catch(err => reject(err));
    });
}

export function getBalance() {
    return dispatch => new Promise(async(resolve, reject) => {

        const token = await getAuthenticationToken();
        AppAPI.balance.post(null, {
            token: token
        }).then(async(res) => {

            if(res.error == true) {
                return reject(res.message)
            }

            const { data } = res;

            dispatch({
                type: types.USER_REPLACE,
                payload: {
                    uid: data.uid,
                    network: data.network,
                    slug: data.slug,
                    balance: data.balance
                }
            });

            return resolve(token)


        }).catch(err => reject(err));

    });
}


export function getContacts() {
    return dispatch => new Promise(async(resolve, reject) => {

        const token = await getAuthenticationToken();
        AppAPI.contacts.post(null, {
            token,
        }).then(async(res) => {
            if(res.error === true){
                return reject('Error!')
            }

            dispatch({
                type: types.USER_REPLACE,
                payload: {
                    contacts: res.data
                }
            });

            return resolve(res)

        }).catch(err => reject(err));

    });
}



export function persistContacts(contacts) {
    return dispatch => new Promise(async(resolve, reject) => {

        const token = await getAuthenticationToken();
        AppAPI.persist.post(null, {
            token,
            contacts
        }).then(async(res) => {
            if(res.error === true){
                return reject('Error!')
            }
            dispatch({
                type: types.USER_REPLACE,
                payload: {
                    ts: (new Date).getTime(),
                    contacts: contacts
                }
            });

            return resolve(res)

        }).catch(err => reject(err));

    });
}
export function lookupUsers(query) {
    return dispatch => new Promise(async(resolve, reject) => {

        const token = await getAuthenticationToken();
        AppAPI.lookup.post(null, {
            token,
            query
        }).then(async(res) => {
            if(res.error === true){
                return reject('Error!')
            }
            return resolve(res)

        }).catch(err => reject(err));

    });
}

export function getTransactions() {
    return dispatch => new Promise(async(resolve, reject) => {

        const token = await getAuthenticationToken();
        AppAPI.userinfo.post(null, {
            token,
        }).then(async(res) => {
            if(res.error === true){
                return reject('Error!')
            }
            return resolve(res)

        }).catch(err => reject(err));

    });
}


export function bump(amount) {
    return dispatch => new Promise(async(resolve, reject) => {

        const token = await getAuthenticationToken();
        AppAPI.bump.post(null, {
            token,
            amount,
        }).then(async(res) => {
            if(res.error === true){
                return reject('Error!')
            }
            return resolve(token)

        }).catch(err => reject(err));

    });
}

export function tip(amount,to) {
    return dispatch => new Promise(async(resolve, reject) => {

        const token = await getAuthenticationToken();
        AppAPI.tip.post(null, {
            token,
            amount,
            to
        }).then(async(res) => {
            const { data } = res ;

            switch (data.code){
                case 200:
                    dispatch({
                        type: types.ADD_MUST_TIP_AMOUNT,
                        payload:  amount
                    });
                    return resolve(data.slug);
                case 500:
                    return reject('Destination is invalid!');
                case 404:
                    return reject('Destination user never logged in at the TipBot website.');
                case 403:
                    return reject('No amount specified!');
                case 401:
                    return reject('No (or insufficient) balance.');
                case 413:
                    return reject('Exceeded per-tip limit.');
                case 300:
                    return reject('Can\'t tip yourself!');
                case 400:
                    return reject('Destination user disabled TipBot');
                default:
                    return reject('Something is wrong!')
            }

        }).catch(err => reject(err));

    });
}


export function logout() {
    return async dispatch => {
        const token = await getAuthenticationToken();

        AppAPI.logout.post(null, {
            token,
        }).then(async(res) => {
            clearAuthenticationToken()
                .then(() => {
                    dispatch({
                        type: types.RESET,
                    });
                    dispatch(appActions.changeAppRoot('login'))
                });
        });


    }
}






