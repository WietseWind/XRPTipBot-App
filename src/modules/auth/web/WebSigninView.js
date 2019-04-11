import React, { Component } from 'react';
import PropTypes from 'prop-types';

import {
    View,
    StyleSheet,
    Text,
    TouchableOpacity,
    Vibration,
    Platform,
    Linking,
    ActivityIndicator,
} from 'react-native';

import { Alert, Separator, PinInput, Spacer } from '@components';
import { AppStyles, AppColors, AppSizes, AppFonts } from '@theme/';

import { RNCamera as Camera } from 'react-native-camera';
import LottieView from 'lottie-react-native';
import LinearGradient from 'react-native-linear-gradient';

const LOGIN_REGEX = RegExp('(xrptipbot:\\/\\/)(internal)(\\/)(login)(\\/)(.*)+');

class WebSigninView extends Component {
    static displayName = 'WebSigninView';

    constructor(props) {
        super(props);

        this.state = {
            isLoading: false,
            isScanning: false,
            checkingPin: false,
            WrongCode: false,
            step: 'scan',
            authToken: '',
        };

        this.scanned = false;
        this.scanTimeout = null;
    }

    static navigatorStyle = {
        tabBarHidden: Platform.OS !== 'ios',
        statusBarTextColorScheme: 'light',
        drawUnderTabBar: true,
    };

    static propTypes = {
        onSuccessRead: PropTypes.func,
    };

    vibration = async () => {
        Vibration.vibrate();
    };

    notAuthorizedView = (
        <View style={styles.notAuthorizedView}>
            <LottieView
                source={require('../../../assets/animation/empty_list.json')}
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

    getURLParams = entry => {
        const vars = {};
        entry.replace(/[?&]+([^=&]+)=([^&]*)/gi, (m, key, value) => {
            vars[key] = value;
        });
        return vars;
    };

    onBarCodeRead = scanned => {
        const { data } = scanned;

        if (this.state.isScanning) return;

        clearTimeout(this.scanTimeout);

        this.setState({
            isScanning: true,
        });

        if (LOGIN_REGEX.test(data)) {
            this.setState({
                authToken: data,
                step: 'pin',
            });
            setTimeout(() => {
                this.props.navigator.setTitle({ title: 'Confirm' });
            }, 300);
        } else {
            Vibration.vibrate();
            Alert.show('Invalid QR Code for web sign-in.', { type: 'error' });
        }

        this.scanTimeout = setTimeout(() => {
            this.setState({
                isScanning: false,
            });
        }, 2000);
    };

    onPinSubmit = pin => {
        const { authToken } = this.state;

        this.setState({
            checkingPin: true,
            WrongCode: false,
        });

        this.props
            .webLogin({
                auth: authToken,
                pin,
            })
            .then(() => {
                this.props.navigator.popToRoot();
            })
            .catch(error => {
                switch (error) {
                    case 'Invalid PIN':
                        Vibration.vibrate();
                        this.setState({
                            checkingPin: false,
                            WrongCode: true,
                        });
                        break;
                    default:
                        Vibration.vibrate();
                        this.setState({
                            step: 'scan',
                            authToken: '',
                        });
                        this.props.navigator.setTitle({ title: 'Scan code' });
                        Alert.show('Invalid web sign-in QR code.', { type: 'error' });
                        break;
                }
            });
    };

    render() {
        const { isLoading, step, WrongCode, checkingPin } = this.state;
        switch (step) {
            case 'scan':
                return (
                    <View style={[AppStyles.container]}>
                        <Camera
                            style={styles.preview}
                            onBarCodeRead={data => this.onBarCodeRead(data)}
                            barCodeTypes={[Camera.Constants.BarCodeType.qr]}
                            captureAudio={false}
                            notAuthorizedView={this.notAuthorizedView}
                            permissionDialogTitle="Permission to use camera"
                            permissionDialogMessage="We need your permission to use your camera phone"
                        >
                            <View style={styles.rectangleContainer}>
                                <LottieView
                                    source={require('../../../assets/animation/barcode_scanner.json')}
                                    style={styles.rectangle}
                                    autoPlay
                                    loop
                                />
                            </View>
                        </Camera>
                        <View
                            style={[
                                { height: AppSizes.screen.height * 0.15, width: AppSizes.screen.width },
                                AppStyles.centerAligned,
                                { backgroundColor: AppColors.brand.primary },
                            ]}
                        >
                            <Text
                                numberOfLines={2}
                                style={[
                                    AppStyles.h5,
                                    {
                                        marginRight: 10,
                                        marginLeft: 10,
                                        color: AppColors.brand.light,
                                        textAlign: 'center',
                                    },
                                ]}
                            >
                                Please visit xrptipbot.com and go to Login. Select "Paper account", and scan the QR
                                code.
                            </Text>
                        </View>
                        {isLoading && (
                            <View style={styles.loading}>
                                <ActivityIndicator />
                                <Text style={[AppStyles.h5, AppStyles.textCenterAligned]}>Loading ...</Text>
                            </View>
                        )}
                    </View>
                );
            case 'pin':
                return (
                    <LinearGradient
                        style={[styles.mainContent]}
                        colors={['#4476E1', '#3056A6']}
                        start={{ x: 0, y: 0.1 }}
                        end={{ x: 0.1, y: 1 }}
                    >
                        <View style={[AppStyles.flex1, AppStyles.centerAligned]}>
                            <Text style={[AppStyles.h5, { textAlign: 'center', color: AppColors.brand.light }]}>
                                Please enter your account PIN code to login.
                            </Text>
                        </View>
                        <View style={AppStyles.flex2}>
                            <PinInput
                                middleText={WrongCode ? 'Wrong PIN' : ' '}
                                loading={checkingPin}
                                wrongCode={WrongCode}
                                onSubmit={this.onPinSubmit}
                            />
                        </View>
                    </LinearGradient>
                );
        }
    }
}

/* Styles ==================================================================== */
const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
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
    preview: {
        flex: 12,
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
    loading: {
        position: 'absolute',
        zIndex: 99999,
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        opacity: 0.9,
        backgroundColor: 'black',
        justifyContent: 'center',
        alignItems: 'center',
    },
    mainContent: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'space-around',
    },
});

export default WebSigninView;
