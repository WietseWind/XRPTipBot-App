import { getAuthenticationToken } from '@libs/authentication';

// Actions
import * as actions from '@redux/core/push/actions';
import * as accountActions from '@redux/core/account/actions';

import { AppConfig } from '@constants';
import firebase from 'react-native-firebase';

const pushMiddleware = (() => {
    let LISTENING = null;

    const createNotificationListeners = async store => {
        LISTENING = true;
        /*
         * Triggered when a particular notification has been received in foreground
         * */
        this.notificationListener = firebase.notifications().onNotification(notification => {
            store.dispatch(actions.messageReceived(notification));
        });

        /*
         * If your app is in background, you can listen for when a notification is clicked / tapped / opened as follows:
         * */
        this.notificationOpenedListener = firebase.notifications().onNotificationOpened(notificationOpen => {
            store.dispatch(accountActions.getBalance());
        });

        /*
         * If your app is closed, you can check if it was opened by a notification being clicked / tapped / opened as follows:
         * */
        // const notificationOpen = await firebase.notifications().getInitialNotification();
        // if (notificationOpen) {
        //     const { title, body } = notificationOpen.notification;
        //     this.showAlert(title, body);
        // }
        /*
         * Triggered for data only payload in foreground
         * */
        // this.messageListener = firebase.messaging().onMessage((message) => {
        //     //process data message
        //     console.log(JSON.stringify(message));
        // });
    };

    return store => next => action => {
        switch (action.type) {
            case 'CONNECT':
                // Start a new connection to the server
                if (LISTENING !== null) {
                    return;
                }

                // register the token on server if it's not set yet
                const fcmToken = store.getState().pushState.token;
                store.dispatch(actions.register(fcmToken));

                // create notifications listener
                createNotificationListeners(store);

                break;

            // The user wants us to disconnect
            case 'DISCONNECT':
                if (!LISTENING) {
                    return;
                }

                // remove the listener
                this.notificationListener();

                // set listening to false
                LISTENING = false;

                // Set our state to disconnected
                break;

            // This action is irrelevant to us, pass it on to the next middleware
            default:
                return next(action);
        }

        return next(action);
    };
})();

export default pushMiddleware;
