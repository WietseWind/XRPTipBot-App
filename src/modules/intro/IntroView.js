import React from 'react';

import { StyleSheet, View, Text, Image, Linking, Platform, TouchableOpacity, Vibration } from 'react-native';

import LinearGradient from 'react-native-linear-gradient';

import { AppStyles, AppColors, AppSizes, AppFonts } from '@theme/';

import { Alert } from '@components';

import LottieView from 'lottie-react-native';

const styles = StyleSheet.create({
    mainContent: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'space-around',
    },
    image: {
        height: AppSizes.screen.height * 0.22,
    },
    animation: {
        width: AppSizes.screen.widget * 0.5,
        height: AppSizes.screen.height * 0.5,
    },
    text: {
        fontSize: AppFonts.base.size,
        color: 'rgba(255, 255, 255, 0.8)',
        backgroundColor: 'transparent',
        textAlign: 'center',
        paddingHorizontal: 30,
        paddingVertical: 16,
    },
    title: {
        fontSize: AppFonts.p.size,
        color: 'white',
        backgroundColor: 'transparent',
        textAlign: 'center',
    },
    buttonLogin: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#41E196',
        height: AppSizes.screen.height * 0.08,
        width: AppSizes.screen.width * 0.7,
        zIndex: 1,
        borderRadius: AppSizes.screen.width * 0.7 * AppSizes.screen.height * 0.1,
    },
    buttonLoginText: {
        fontFamily: AppFonts.h5.family,
        fontSize: AppFonts.h5.size,
        fontWeight: Platform.OS === 'ios' ? '500' : '400',
        color: 'white',
        backgroundColor: 'transparent',
    },
    buttonScan: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'transparent',
        height: AppSizes.screen.height * 0.08,
        width: AppSizes.screen.width * 0.7,
        zIndex: 1,
        borderRadius: AppSizes.screen.width * 0.7 * AppSizes.screen.height * 0.1,
        borderWidth: 0.6,
        borderColor: '#000',
    },
    buttonScanText: {
        fontFamily: AppFonts.h5.family,
        fontSize: AppFonts.h5.size,
        fontWeight: Platform.OS === 'ios' ? '500' : '400',
        color: 'white',
        backgroundColor: 'transparent',
    },
    whiteText: {
        color: '#fff',
    },
});

const _goToURL = () => {
    const url = `https://www.xrptipbot.com/app?from=${Platform.OS}`;
    Linking.canOpenURL(url).then(supported => {
        if (supported) {
            Linking.openURL(url);
        } else {
            console.log(`Don\'t know how to open URI: ${url}`);
        }
    });
};

class IntroView extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            step: 'normal',
        };
        this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
    }

    static navigatorStyle = {
        navBarHidden: true,
        statusBarTextColorScheme: 'light',
    };

    onNavigatorEvent(event) {
        switch (event.type) {
            case 'ScreenChangedEvent':
                switch (event.id) {
                    case 'willDisappear':
                        Linking.removeEventListener('url', this._handleOpenURL);
                        break;
                    case 'didAppear':
                        Linking.addEventListener('url', this._handleOpenURL);
                        break;
                }
        }
    }

    componentDidMount() {
        const { appState } = this.props;

        if (Platform.OS === 'ios') {
            Linking.getInitialURL()
                .then(url => {
                    if (url && !appState.initialized) {
                        this._handleOpenURL({ url });
                    }
                })
                .catch(err => console.error('An error occurred', err));
        }
    }

    _handleOpenURL = event => {
        const { url } = event;
        const re = new RegExp('(xrptipbot:\\/\\/)([a-zA-Z0-9]+$)');
        if (re.test(url)) {
            const token = url.replace('xrptipbot://', '');
            this.handleDeepLinkLogin(token);
        } else {
            Vibration.vibrate();
            Alert.show('This is not an XRPTipBot token.', { type: 'error' });
        }
    };

    handleDeepLinkLogin = token => {
        if (token.length <= 40) {
            Vibration.vibrate();
            return Alert.show('This is not an XRPTipBot token', {
                type: 'error',
            });
        }

        if (token) {
            this.props.navigator.setStyle({
                navBarHidden: true,
            });

            this.setState({
                step: 'loading',
            });

            this.props
                .login(token, true)
                .then(() => {
                    this.props.changeAppRoot('after-login');
                    this.props.connect();
                })
                .catch(error => {
                    Alert.show(error, {
                        type: 'error',
                    });
                    Vibration.vibrate();
                    this.setState({
                        step: 'normal',
                    });
                });
        }
    };

    render() {
        const { step } = this.state;
        if (step === 'normal') {
            return (
                <LinearGradient
                    style={[styles.mainContent]}
                    colors={['#4476E1', '#3056A6']}
                    start={{ x: 0, y: 0.1 }}
                    end={{ x: 0.1, y: 1 }}
                >
                    <View style={[AppStyles.flex2, AppStyles.centerAligned]}>
                        <Image resizeMode={'contain'} source={require('../../assets/images/logo.png')} />
                    </View>
                    <View style={[AppStyles.flex4, AppStyles.centerAligned]}>
                        <Image
                            style={styles.image}
                            resizeMode={'contain'}
                            source={require('../../assets/images/tipbot.png')}
                        />
                    </View>

                    <View style={[{ flex: 2 }, AppStyles.centerAligned]}>
                        <Text style={styles.title}>Welcome to XRP Tip Bot</Text>
                        <Text style={styles.text}>
                            Use your{' '}
                            <Text
                                style={AppStyles.link}
                                onPress={() => {
                                    _goToURL();
                                }}
                            >
                                xrptipbot.com
                            </Text>{' '}
                            account to activate the app, or scan your pairing QR code.
                        </Text>
                    </View>
                    <View style={[{ flex: 3 }, AppStyles.centerAligned]}>
                        <View style={{ flex: 1 }}>
                            <TouchableOpacity
                                style={styles.buttonLogin}
                                onPress={() => this.props.navigator.push({ screen: 'xrptipbot.RemoteLoginScreen' })}
                            >
                                <Text style={[styles.buttonLoginText]}>Activate online</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={{ flex: 1 }}>
                            <TouchableOpacity
                                style={styles.buttonScan}
                                onPress={() => this.props.navigator.push({ screen: 'xrptipbot.AuthScreen' })}
                            >
                                <Text style={[styles.buttonScanText]}>Scan pairing QR</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </LinearGradient>
            );
        } else {
            return (
                <LinearGradient
                    style={[styles.mainContent]}
                    colors={['#4476E1', '#3056A6']}
                    start={{ x: 0, y: 0.1 }}
                    end={{ x: 0.1, y: 1 }}
                >
                    <LottieView
                        source={require('../../assets/animation/loading_semicircle.json')}
                        style={{ width: 400, height: 400 }}
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

export default IntroView;
