import { Provider } from 'react-redux';
import { Navigation } from 'react-native-navigation';
import { Platform } from 'react-native';

import * as appActions from '@redux/core/app/actions';
import configureStore from '@redux/store';

import { registerScreens } from './screens';

import { AppStyles, AppColors } from '@theme/';

export default class App {
    constructor() {
        configureStore().then(_store => {
            this.store = _store;

            registerScreens(this.store, Provider);

            this.store.subscribe(this.onStoreUpdate.bind(this));
            this.store.dispatch(appActions.appInitialized());
        });
    }

    onStoreUpdate() {
        const { root } = this.store.getState().appState;
        // handle a root change
        if (this.currentRoot != root) {
            this.currentRoot = root;
            this.startApp(root);
        }
    }

    startApp(root) {
        switch (root) {
            case 'login':
                Navigation.startSingleScreenApp({
                    screen: {
                        screen: 'xrptipbot.IntroScreen',
                    },
                    appStyle: {
                        orientation: 'portrait',
                    },
                });
                return;
            case 'after-login':
                Navigation.startTabBasedApp({
                    tabs: [
                        {
                            label: 'History',
                            screen: 'xrptipbot.TransactionsScreen',
                            icon: require('./assets/images/history.png'),
                            title: 'History',
                            navigatorStyle: {
                                navBarBackgroundColor: AppColors.brand.primary,
                            },
                        },
                        {
                            label: 'Receive',
                            screen: 'xrptipbot.ReceiveScreen',
                            icon: require('./assets/images/account.png'),
                            navigatorStyle: {
                                navBarCustomView: 'xrptipbot.NavBar',
                                navBarComponentAlignment: 'center',
                                navBarBackgroundColor: AppColors.brand.primary,
                            },
                        },
                        {
                            label: 'Contacts',
                            screen: 'xrptipbot.ContactsScreen',
                            icon: require('./assets/images/contacts.png'),
                            title: 'Contacts',
                            navigatorStyle: {
                                navBarBackgroundColor: AppColors.brand.primary,
                            },
                            navigatorButtons: {
                                rightButtons: [
                                    {
                                        icon: require('./assets/images/navicon_add.png'),
                                        id: 'addContact',
                                        systemItem: 'add',
                                    },
                                ],
                            },
                        },
                    ],
                    animationType: Platform.OS === 'ios' ? 'slide-down' : 'fade',
                    appStyle: AppStyles.appStyle,
                    tabsStyle: AppStyles.tabsStyle,
                });
                return;
            default:
                console.error('Unknown app root');
        }
    }
}
