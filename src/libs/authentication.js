import { AsyncStorage } from 'react-native';

const AUTHENTICATION_STORAGE_KEY = 'XRPTipBot:Authentication';

export async function getAuthenticationToken() {
    return await AsyncStorage.getItem(AUTHENTICATION_STORAGE_KEY);
}

export async function setAuthenticationToken(token) {
    return AsyncStorage.setItem(AUTHENTICATION_STORAGE_KEY, token);
}

export async function clearAuthenticationToken() {
    return AsyncStorage.removeItem(AUTHENTICATION_STORAGE_KEY);
}

export async function isSignedIn() {
    return new Promise((resolve, reject) => {
        getAuthenticationToken()
            .then(res => {
                if (res !== null) {
                    resolve(true);
                } else {
                    reject();
                }
            })
            .catch(err => reject(err));
    });
}
