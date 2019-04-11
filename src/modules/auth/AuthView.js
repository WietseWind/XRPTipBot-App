import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { StyleSheet, View, Text, Vibration, Linking, Platform, TouchableOpacity } from 'react-native';

import { Alert, PinInput } from '@components';
import { AppStyles, AppColors, AppSizes } from '@theme/';

import { RNCamera as Camera } from 'react-native-camera';
import LottieView from 'lottie-react-native';
import LinearGradient from 'react-native-linear-gradient';

const INTERNAL_REGEX = RegExp('(xrptipbot:\\/\\/)(internal)(\\/)(activate)(\\/)(.*)+');
const TOKEN_REGEX = RegExp('^[a-zA-Z0-9]+$');

/* Styles ==================================================================== */
const styles = StyleSheet.create({
    preview: {
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'center',
        backgroundColor: AppColors.background,
    },
    rectangleContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'transparent',
    },
    rectangle: {
        height: AppSizes.screen.height * 0.35,
        width: AppSizes.screen.width * 0.35,
        backgroundColor: 'transparent',
    },
    mainContent: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'space-around',
    },
    whiteText: {
        color: '#fff',
    },
    notAuthorizedView: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    notAuthorizedViewText: {
        color: '#364150',
        textAlign: 'center',
        fontSize: 18,
    },
    btn: {
        backgroundColor: '#dedfe3',
        alignSelf: 'center',
        borderRadius: 5,
        paddingHorizontal: 30,
        paddingVertical: 10,
    },
    btnText: {
        color: '#364150',
        fontSize: 20,
    },
    animation: {
        width: 200,
        height: 200,
    },
});

class AuthView extends Component {
    static displayName = 'AuthView';

    constructor(props) {
        super(props);

        this.state = {
            step: 'scan',
            isScanning: false,
        };

        this.scanTimeout = null;
        this.mounted = false;

        this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
    }

    static navigatorStyle = {
        navBarTextColor: '#fff',
        navBarButtonColor: '#fff',
        statusBarTextColorScheme: 'light',
        drawUnderNavBar: true,
        navBarTranslucent: Platform.OS === 'ios',
        navBarNoBorder: true,
        navBarTransparent: true,
        navBarBackgroundColor: 'transparent',
        topBarElevationShadowEnabled: false,
        statusBarColor: 'black',
    };

    static propTypes = {
        accountState: PropTypes.object,
        changeAppRoot: PropTypes.func.isRequired,
        login: PropTypes.func.isRequired,
    };

    static defaultProps = {
        token: null,
    };

    onNavigatorEvent(event) {
        switch (event.type) {
            case 'ScreenChangedEvent':
                switch (event.id) {
                    case 'willAppear':
                        this.props.navigator.setStyle({
                            navBarHidden: false,
                        });
                        this.mounted = true;
                        break;
                    case 'willDisappear':
                        this.mounted = false;
                        break;
                }
        }
    }

    _handleOpenURL = event => {
        const { url } = event;
        const token = url.replace('xrptipbot://', '');
        if (token && token.length > 0) {
            this.handleLogin({ data: token });
        }
    };

    componentWillMount() {
        Linking.addEventListener('url', this._handleOpenURL);
    }

    componentWillUnmount() {
        Linking.removeEventListener('url', this._handleOpenURL);
    }

    notAuthorizedView = (
        <View style={styles.notAuthorizedView}>
            <LottieView
                source={require('../../assets/animation/empty_list.json')}
                style={styles.animation}
                autoPlay
                loop
            />
            <Text style={styles.notAuthorizedViewText}>
                Need permission to access Camera,{'\n'}
                Please go to <Text style={{ fontWeight: 'bold' }}>Settings</Text> and allow{'\n'}
                <Text style={{ fontWeight: 'bold', color: '#364150' }}>XRPTipBot</Text> to access Camera
            </Text>
            {Platform.OS === 'ios' && (
                <TouchableOpacity
                    onPress={() => Linking.openURL('app-settings:')}
                    activeOpacity={0.7}
                    style={[styles.btn, { marginTop: 15 }]}
                >
                    <Text style={[styles.btnText]}>Go to Settings</Text>
                </TouchableOpacity>
            )}
        </View>
    );

    invalidToken = message => {
        Alert.show(message || 'Invalid Token.', { type: 'error' });
        Vibration.vibrate();
    };

    handleLogin = scanned => {
        const { data } = scanned;

        if (this.state.isScanning || !this.mounted) return;

        clearTimeout(this.scanTimeout);

        this.setState({
            isScanning: true,
        });

        if (INTERNAL_REGEX.test(data)) {
            // internal login

            this.props.navigator.setStyle({
                navBarHidden: true,
            });
            this.setState({
                step: 'loading',
            });

            this.props
                .paperLogin(data)
                .then(resp => {
                    switch (resp) {
                        case 'Error':
                            this.invalidToken();
                            break;
                        case 'PIN required':
                            this.props.navigator.push({
                                screen: 'xrptipbot.PinCodeScreen',
                                backButtonTitle: 'Cancel',
                                passProps: {
                                    paperToken: data,
                                    action: 'check',
                                },
                            });
                            break;
                        case 'SET_PIN':
                            this.props.navigator.push({
                                screen: 'xrptipbot.PinCodeScreen',
                                backButtonTitle: 'Cancel',
                                passProps: {
                                    paperToken: data,
                                    action: 'set',
                                },
                            });
                            break;
                        default:
                            this.invalidToken();
                    }
                })
                .catch(error => {
                    this.invalidToken(error);
                })
                .finally(() => {
                    this.props.navigator.setStyle({
                        navBarHidden: false,
                    });
                    this.setState({
                        step: 'scan',
                    });
                });
        } else if (TOKEN_REGEX.test(data)) {
            // normal login
            if (data.length <= 40) {
                return this.invalidToken('This is not an XRPTipBot token QRCode!');
            }

            this.props.navigator.setStyle({
                navBarHidden: true,
            });
            this.setState({
                step: 'loading',
            });

            this.props
                .login(data)
                .then(() => {
                    this.props.changeAppRoot('after-login');
                    this.props.connect();
                })
                .catch(error => {
                    this.invalidToken(error);
                })
                .finally(() => {
                    this.props.navigator.setStyle({
                        navBarHidden: false,
                    });
                    this.setState({
                        step: 'scan',
                    });
                });
        } else {
            this.invalidToken('This is not an XRPTipBot token QRCode!');
        }

        this.scanTimeout = setTimeout(() => {
            this.setState({
                isScanning: false,
            });
        }, 2000);
    };

    render() {
        const { step } = this.state;
        switch (step) {
            case 'scan':
                return (
                    <View style={[AppStyles.container]}>
                        <Camera
                            style={styles.preview}
                            onBarCodeRead={data => this.handleLogin(data)}
                            captureAudio={false}
                            notAuthorizedView={this.notAuthorizedView}
                            permissionDialogTitle="Permission to use camera"
                            permissionDialogMessage="We need your permission to use your camera phone"
                        >
                            <View style={styles.rectangleContainer}>
                                <LottieView
                                    source={require('../../assets/animation/barcode_scanner.json')}
                                    style={styles.rectangle}
                                    autoPlay
                                    loop
                                />
                            </View>
                        </Camera>
                    </View>
                );
            case 'loading':
                return (
                    <LinearGradient
                        style={[styles.mainContent]}
                        colors={['#4F00BC', '#29ABE2']}
                        start={{ x: 0, y: 0.1 }}
                        end={{ x: 0.1, y: 1 }}
                    >
                        <LottieView
                            source={require('../../assets/animation/loading_semicircle.json')}
                            style={{ width: AppSizes.screen.width * 0.8 , height: AppSizes.screen.height * 0.8 }}
                            autoPlay
                            loop
                            resizeMode={'contain'}
                        />
                        <Text style={[AppStyles.h5, AppStyles.textCenterAligned, styles.whiteText]}>
                            Connecting account ...
                        </Text>
                    </LinearGradient>
                );
        }
    }
}

export default AuthView;
