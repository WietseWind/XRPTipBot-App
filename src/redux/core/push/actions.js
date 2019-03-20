import firebase from 'react-native-firebase';

import * as types from './actionTypes';
import * as accountActions from '@redux/core/account/actions';

import AppAPI from '@libs/api';
import { getAuthenticationToken } from '@libs/authentication';

export function register(fcmToken) {
    return async dispatch => {
        if (!fcmToken) {
            fcmToken = await firebase.messaging().getToken();
            // if (fcmToken) {
            const token = await getAuthenticationToken();
            // user has a device token
            AppAPI.push_token
                .post(null, {
                    token,
                    pushtoken: fcmToken,
                })
                .then(res => {
                    return dispatch({ type: types.PUSH_REGISTER, payload: { token: fcmToken } });
                })
                .catch(err => console.log(err));
            // }
        }
    };
}

export function unregister() {
    return { type: types.PUSH_UNREGISTER };
}

export function messageReceived(notification) {
    const { title, body } = notification;

    const notify = new firebase.notifications.Notification({
        sound: 'default',
        show_in_foreground: true,
    })
        .setNotificationId('notification_id')
        .android.setChannelId('default_notification_channel_id')
        .android.setSmallIcon('default_notification_icon')
        .android.setLargeIcon('ic_launcher')
        .setTitle(title)
        .setBody(body);

    firebase.notifications().displayNotification(notify);

    return accountActions.getBalance();

    // THIS IS FOR BUMPING ...
    // switch (data.code){
    //     case 200:
    //         return appActions.changeAppState('success', data.direction_str);
    //     case 500:
    //         return appActions.changeAppState('error', 'Unable to match bump');
    //     case 403:
    //         return appActions.changeAppState('error', 'Both parties specified an amount');
    //     case 404:
    //         return appActions.changeAppState('error', 'Both parties didn\'t specify an amount');
    //     case 401:
    //         return appActions.changeAppState('error', 'Sending party has no (or insufficient) balance');
    //     case 413:
    //         return appActions.changeAppState('error', 'Sending party exceeded per-tip limit');
    // }
}
