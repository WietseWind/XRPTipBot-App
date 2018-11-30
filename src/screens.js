import {Navigation} from 'react-native-navigation';


// AUth Screens
import IntroScreen from '@modules/intro';
import AuthScreen from '@modules/auth';
import WebSigninScreen from '@modules/auth/web';
import RemoteLoginScreen from '@modules/auth/remote';
import PinCodeScreen from '@modules/auth/pin';

// Main Screens
import TransactionsScreen from '@modules/transactions';
import SendScreen from '@modules/send';
import ReceiveScreen from '@modules/receive';
import SendScanScreen from '@modules/send/scan';
import ContactsScreen from '@modules/contacts';
import ContactsAddScreen from '@modules/contacts/add';
import ContactsSelectScreen from '@modules/contacts/select';
// components
import {NavBar} from '@components'


// register all screens of the app (including internal ones)
export function registerScreens(store, Provider) {
    // Auth Screens
    Navigation.registerComponent('xrptipbot.IntroScreen', () => IntroScreen, store, Provider);
    Navigation.registerComponent('xrptipbot.AuthScreen', () => AuthScreen, store, Provider);
    Navigation.registerComponent('xrptipbot.WebSigninScreen', () => WebSigninScreen, store, Provider);
    Navigation.registerComponent('xrptipbot.RemoteLoginScreen', () => RemoteLoginScreen, store, Provider);
    Navigation.registerComponent('xrptipbot.PinCodeScreen', () => PinCodeScreen, store, Provider);
    // Main Screens
    Navigation.registerComponent('xrptipbot.TransactionsScreen', () => TransactionsScreen, store, Provider);
    Navigation.registerComponent('xrptipbot.SendScreen', () => SendScreen, store, Provider);
    Navigation.registerComponent('xrptipbot.SendScanScreen', () => SendScanScreen, store, Provider);

    Navigation.registerComponent('xrptipbot.ReceiveScreen', () => ReceiveScreen, store, Provider);
    Navigation.registerComponent('xrptipbot.ContactsScreen', () => ContactsScreen, store, Provider);
    Navigation.registerComponent('xrptipbot.ContactsAddScreen', () => ContactsAddScreen, store, Provider);
    Navigation.registerComponent('xrptipbot.ContactsSelectScreen', () => ContactsSelectScreen, store, Provider);

    Navigation.registerComponent('xrptipbot.NavBar', () => NavBar, store, Provider);
}
