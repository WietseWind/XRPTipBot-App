import React, { Component } from 'react';
import PropTypes from 'prop-types';

import {
    View,
    StyleSheet,
    Text,
    Platform,
    Alert,
    TouchableOpacity,
    CameraRoll,
    Image,
    ScrollView,
    RefreshControl,
    TouchableHighlight,
    Linking,
} from 'react-native';

import { AppStyles, AppColors, AppSizes, AppFonts } from '@theme/';

// libs
import Share from 'react-native-share';
import firebase from 'react-native-firebase';
import Discovery from 'react-native-discovery';

import { requestExternalStoragePermission, findGetParameter } from '@libs/utils';

// components
import ActionSheet from '@expo/react-native-action-sheet';
import { LoadingIndicator, SegmentButton, QRCode } from '@components';

const TIPBOT_REGEX = RegExp('(xrptipbot:\\/\\/)(twitter|coil|reddit|discord|internal)(\\/)((?!activate)[^\\/\\?]+)');

class ReceiveView extends Component {
    static displayName = 'ReceiveView';

    constructor(props) {
        super(props);

        this.state = {
            loadingBalance: false,
            initialize: true,
            showBalance: true,
            discoveryInitialized: false,
        };

        this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
    }

    static navigatorButtons = {
        rightButtons: [
            {
                icon: require('../../assets/images/settings.png'),
                id: 'settings',
            },
        ],
    };

    static navigatorStyle = {
        statusBarTextColorScheme: 'light',
    };

    static propTypes = {
        accountState: PropTypes.object,
        changeAppState: PropTypes.func,
    };

    onNavigatorEvent(event) {
        switch (event.type) {
            case 'NavBarButtonPress':
                if (event.id === 'settings') {
                    this.showSettingsDialog();
                    break;
                }
                break;
            case 'ScreenChangedEvent':
                switch (event.id) {
                    case 'willAppear':
                        if (Platform.OS === 'ios') this.props.navigator.toggleTabs({ to: 'shown' });
                        break;
                }
        }
    }

    componentWillMount() {
        if (Platform.OS === 'ios') {
            Linking.getInitialURL()
                .then(url => {
                    if (url) {
                        return this._handleDeepLink({ url });
                    }
                })
                .catch(err => console.error('An error occurred', err));
        }
        Linking.addEventListener('url', this._handleDeepLink);
    }

    componentDidMount() {
        const { accountState, navigator } = this.props;

        // init the center tab text

        let label = accountState.slug;

        switch (accountState.network) {
            case 'internal':
                label = 'TipBot';
                break;
            case 'coil':
                label = 'Coil Account';
                break;
            default:
                label = accountState.slug;
                break;
        }
        navigator.setTabButton({
            tabIndex: 1,
            label: label,
        });

        // set navbar component
        // as in android there is some bug on this we need to set timeout
        setTimeout(() => {
            this.props.navigator.setStyle({
                navBarCustomView: 'xrptipbot.NavBar',
                navBarCustomViewInitialProps: {
                    ts: new Date().getTime(),
                },
            });
        }, 400);

        setTimeout(() => {
            this.checkBluetooth();
            // enable discovery;
            // this will enable advisering so other users can find this users as nearby user
            this.enableDiscovery();
        }, 1000);

        // fetch user balance
        this.fetchBalance();

        // request for require permission
        this.checkNotificationPermission();
    }

    _handleDeepLink = event => {
        const { url } = event;
        if (TIPBOT_REGEX.test(url)) {
            const username = url.split(TIPBOT_REGEX)[4];
            const network = url.split(TIPBOT_REGEX)[2];
            const sendAmount = findGetParameter(url, 'amount');
            switch (network) {
                case 'discord':
                    this.props.lookupUsers(username).then(res => {
                        if (res.data.length === 1) {
                            const user = res.data[0];
                            this.showSendScreen({
                                sendTo: { username: user.username, slug: user.slug, network: user.network },
                                sendAmount,
                            });
                        }
                    });
                    break;
                case 'internal':
                    this.showSendScreen({
                        sendTo: { username, network, slug: 'Paper Account' },
                        sendAmount,
                    });
                    break;
                case 'coil':
                    this.showSendScreen({
                        sendTo: { username, network, slug: 'Coil Account' },
                        sendAmount,
                    });
                    break;
                default:
                    this.showSendScreen({ sendTo: { username, network }, sendAmount });
            }
        }
    };

    checkBluetooth = () => {
        const { accountState, saveSettings } = this.props;
        // check Bluetooth status
        Discovery.isBluetoothEnabled()
            .then(status => {
                // if disabled
                if (status !== true) {
                    if (accountState.bluetoothAlert === undefined || accountState.bluetoothAlert) {
                        Alert.alert(
                            'Nearby user discovery',
                            'The App can discover nearby TipBot users, so it’s easy to send each other tips if you’re standing next to each other. For other users to find you, Bluetooth should be turned on',
                            [
                                {
                                    text: Platform.OS === 'android' ? 'Turn Bluetooth on' : 'Ok',
                                    onPress: () => (Platform.OS === 'android' ? Discovery.setBluetoothOn() : null),
                                    style: 'default',
                                },
                                {
                                    text: "Don't remind me",
                                    onPress: () => saveSettings('bluetoothAlert', false),
                                    style: 'destructive',
                                },
                            ],
                        );
                    }
                }
            })
            .catch(() => {});
    };

    enableDiscovery = () => {
        const { accountState } = this.props;
        const { discoveryInitialized } = this.state;
        if (accountState.uuidv4 && !discoveryInitialized) {
            Discovery.initialize(accountState.uuidv4, 'XRPTIP')
                .then(uuid => {
                    this.setState({ discoveryInitialized: true });
                    Discovery.setShouldAdvertise(true).catch(() => {});
                })
                .catch(() => {});
        }
    };

    async checkNotificationPermission() {
        // notifications permission
        try {
            await firebase.messaging().requestPermission();
        } catch (error) {
            // User has rejected permissions
            console.log('Notifications permission rejected');
        }
    }

    fetchBalance = () => {
        const { discoveryInitialized } = this.state;
        // set loading at first
        this.setState({
            loadingBalance: true,
        });
        // get blaance
        this.props
            .getBalance()
            .then(() => {
                // for the old users this will be needed
                if (!discoveryInitialized) {
                    this.enableDiscovery();
                }
                // loading false
                this.setState({
                    loadingBalance: false,
                    initialize: false,
                });
            })
            .catch(error => {
                // check if token expired or invalid
                if (error == 'Invalid token: invalid, removed or expired') {
                    setTimeout(() => {
                        this.props.logout();
                        this.props.disconnect();
                    }, 3000);
                }
            });
    };

    logout = () => {
        Alert.alert(
            'Disconnect',
            'Are you sure you want to disconnect from the XRPTipBot (you will need to activate the app again)?',
            [
                {
                    text: 'Yes',
                    onPress: () => {
                        this.props.logout();
                        this.props.disconnect();
                    },
                },
                { text: 'No', onPress: () => null, style: 'cancel' },
            ],
            { cancelable: false },
        );
    };

    showQRCodeDialog = () => {
        const options = ['Share', 'Save', 'Cancel'];
        const cancelButtonIndex = options.length - 1;
        this.actionSheetRef.showActionSheetWithOptions(
            {
                options,
                cancelButtonIndex,
            },
            buttonIndex => {
                switch (buttonIndex) {
                    case 0:
                        this.shareQRCode();
                        break;
                    case 1:
                        this.saveQRToDisk();
                        break;
                    default:
                }
            },
        );
    };

    saveQRToDisk() {
        this.qr.viewRef.capture().then(uri => {
            requestExternalStoragePermission()
                .then(() => {
                    CameraRoll.saveToCameraRoll(uri, 'photo')
                        .then(() => {
                            Alert.alert('Success', 'QRCode successfully saved into the gallery');
                        })
                        .catch(e => {
                            Alert.alert('Oh..', 'We can not save the QR code to the gallery');
                        });
                })
                .catch(() => {
                    Alert.alert('Oh..', 'XRPTIPBot need to have permission to save QRCode');
                });
        });
    }

    shareQRCode = () => {
        const { accountState } = this.props;
        this.qr.viewRef.capture().then(uri => {
            Share.open({
                title: 'XRPTipBot',
                message: `xrptipbot://${accountState.network}/${accountState[
                    accountState.network === 'discord' ? 'uid' : 'slug'
                ]
                    .replace('@', '')
                    .replace('/u/', '')}`,
                url: uri,
                subject: 'XRPTipBot QRCode', // for email
            })
                .then(res => {
                    console.log(res);
                })
                .catch(err => {
                    err && console.log(err);
                });
        });
    };

    showSendScreen = props => {
        this.props.navigator.switchToTab({
            tabIndex: 1,
        });

        if (Platform.OS === 'ios') this.props.navigator.toggleTabs({ to: 'hidden' });

        this.props.navigator.push({
            screen: 'xrptipbot.SendScreen',
            backButtonTitle: 'Cancel',
            title: 'Send a tip',
            navigatorStyle: {
                drawUnderTabBar: true,
            },
            passProps: props || {},
        });
    };

    toggleBalance = () => {
        this.state.showBalance ? this.setState({ showBalance: false }) : this.setState({ showBalance: true });
    };

    webSignin = () => {
        if (Platform.OS === 'ios') this.props.navigator.toggleTabs({ to: 'hidden' });

        this.props.navigator.push({
            screen: 'xrptipbot.WebSigninScreen',
            backButtonTitle: 'Cancel',
            title: 'Scan code',
            navigatorStyle: {
                drawUnderTabBar: true,
            },
        });
    };

    showSettingsDialog = () => {
        const { accountState } = this.props;

        const options = ['Disconnect app'];

        let webSigninIndex = null;

        if (accountState.network === 'internal') {
            options.push('Web (desktop) sign in');
            webSigninIndex = options.length - 1;
        }

        options.push('Cancel');

        const cancelButtonIndex = options.length - 1;
        this.actionSheetRef.showActionSheetWithOptions(
            {
                options,
                cancelButtonIndex,
            },
            buttonIndex => {
                switch (buttonIndex) {
                    case 0:
                        this.logout();
                        break;
                    case webSigninIndex:
                        this.webSignin();
                        break;
                    default:
                }
            },
        );
    };

    render() {
        const { accountState } = this.props;
        const { loadingBalance, showBalance, initialize } = this.state;
        return (
            <ActionSheet
                ref={component => {
                    this.actionSheetRef = component;
                }}
            >
                <ScrollView
                    contentContainerStyle={[AppStyles.container]}
                    refreshControl={
                        <RefreshControl
                            onRefresh={() => this.fetchBalance()}
                            refreshing={loadingBalance && !initialize}
                        />
                    }
                >
                    <View
                        style={[AppStyles.flex2, AppStyles.centerAligned, { backgroundColor: AppColors.brand.light }]}
                    >
                        <View style={[AppStyles.flex2, AppStyles.containerCentered]}>
                            <Text style={[AppStyles.textCenterAligned, AppStyles.h5, AppStyles.strong]}>
                                My TipBot Balance
                            </Text>

                            <View style={[styles.pickerContainer, AppStyles.centerAligned]}>
                                <View style={[AppStyles.flex1, { paddingLeft: 22, paddingTop: 2 }]}>
                                    <Image
                                        style={{
                                            height: AppSizes.screen.width * 0.2,
                                            width: AppSizes.screen.width * 0.05,
                                        }}
                                        resizeMode="contain"
                                        source={require('../../assets/images/xrp.png')}
                                    />
                                </View>
                                <View style={[AppStyles.flex6, AppStyles.centerAligned]}>
                                    {loadingBalance ? (
                                        <LoadingIndicator />
                                    ) : showBalance ? (
                                        <Text style={styles.balanceText}>{accountState.balance.XRP}</Text>
                                    ) : (
                                        <Text style={[styles.balanceText, { color: AppColors.brand.grey }]}>
                                            *********
                                        </Text>
                                    )}
                                </View>
                                <View style={[AppStyles.flex1, { alignItems: 'flex-end', paddingRight: 20 }]}>
                                    <TouchableOpacity onPress={this.toggleBalance}>
                                        {showBalance ? (
                                            <Image
                                                style={{
                                                    width: AppSizes.screen.width * 0.05,
                                                    height: AppSizes.screen.width * 0.05,
                                                    tintColor: AppColors.brand.secondary,
                                                }}
                                                resizeMode="contain"
                                                source={require('../../assets/images/eye-open.png')}
                                            />
                                        ) : (
                                            <Image
                                                style={{
                                                    width: AppSizes.screen.width * 0.05,
                                                    height: AppSizes.screen.width * 0.05,
                                                    tintColor: AppColors.brand.grey,
                                                }}
                                                resizeMode="contain"
                                                source={require('../../assets/images/eye-shut.png')}
                                            />
                                        )}
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </View>
                    <View style={[AppStyles.flex3, AppStyles.centerAligned, AppStyles.containerCentered]}>
                        <TouchableHighlight
                            style={styles.buttonTip}
                            onPress={() => {
                                this.showSendScreen();
                            }}
                            activeOpacity={0.8}
                            underlayColor="#3BD48C"
                        >
                            <Text style={[styles.buttonTipText]}>
                                Send a tip{' '}
                                <Image
                                    style={{
                                        width: AppSizes.screen.width * 0.04,
                                        height: AppSizes.screen.width * 0.04,
                                    }}
                                    resizeMode="contain"
                                    source={require('../../assets/images/arrow-right.png')}
                                />
                            </Text>
                        </TouchableHighlight>
                        <View style={[AppStyles.flex1, AppStyles.centerAligned, { marginTop: 25 }]}>
                            <Text style={[AppStyles.baseText, AppStyles.strong, AppStyles.textCenterAligned]}>
                                This is your personal TipBot QR
                            </Text>
                            <Text style={[AppStyles.subtext, AppStyles.textCenterAligned]}>
                                Have it scanned to receive XRP
                            </Text>
                            <TouchableOpacity onPress={this.showQRCodeDialog} style={{ marginTop: 20 }}>
                                <QRCode
                                    ref={ref => (this.qr = ref)}
                                    logo={true}
                                    value={`xrptipbot://${accountState.network}/${accountState[
                                        accountState.network === 'discord' ? 'uid' : 'slug'
                                    ]
                                        .replace('@', '')
                                        .replace('/u/', '')}`}
                                    size={AppSizes.screen.height / 4}
                                    bgColor="black"
                                    fgColor="white"
                                />
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </ActionSheet>
        );
    }
}

/* Styles ==================================================================== */
const styles = StyleSheet.create({
    balanceText: {
        fontFamily: AppFonts.h4.family,
        fontSize: AppFonts.h4.size,
        fontWeight: Platform.OS === 'ios' ? '600' : '500',
        color: AppColors.brand.primary,
    },
    pickerContainer: {
        marginLeft: 10,
        marginRight: 10,
        marginBottom: 5,
        marginTop: 5,
        borderColor: '#c6c6c6',
        borderWidth: 1,
        flexDirection: 'row',
        borderRadius: AppSizes.screen.width * 0.7 * AppSizes.screen.height * 0.1,
        overflow: 'hidden',
        backgroundColor: AppColors.segmentButton.background,
        height: AppSizes.screen.height * 0.08,
        width: AppSizes.screen.width * 0.7,
    },
    buttonTip: {
        position: 'absolute',
        top: -28,
        left: AppSizes.screen.width / 2 - AppSizes.screen.width * 0.35,
        right: 0,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#41E196',
        height: AppSizes.screen.height * 0.08,
        width: AppSizes.screen.width * 0.7,
        zIndex: 1,
        borderRadius: AppSizes.screen.width * 0.7 * AppSizes.screen.height * 0.1,
    },
    buttonTipText: {
        fontFamily: AppFonts.h5.family,
        fontSize: AppFonts.h5.size,
        fontWeight: 'bold',
        color: 'white',
        backgroundColor: 'transparent',
    },
});

export default ReceiveView;
