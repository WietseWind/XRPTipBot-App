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

import { Alert, Separator } from '@components';
import { AppStyles, AppColors, AppSizes, AppFonts } from '@theme/';

import { RNCamera as Camera } from 'react-native-camera';
import LottieView from 'lottie-react-native';

import { findGetParameter } from '@libs/utils';

const URL_REGEX = /rPEPPER7kfTD9w2To4CQk6UCfuHM9c6GDY/i;
const TIPBOT_REGEX = RegExp('(xrptipbot:\\/\\/)(twitter|reddit|discord|internal|coil)(\\/)((?!activate)[^\\/\\?]+)');

class SendScanView extends Component {
    static displayName = 'SendScanView';

    constructor(props) {
        super(props);

        this.state = {
            isLoading: false,
            isScanning: false,
        };

        this.scanned = false;
        this.scanTimeout = null;
    }

    static navigatorStyle = {
        navBarTextColor: '#fff',
        navBarButtonColor: '#fff',
        drawUnderTabBar: true,
        tabBarHidden: Platform.OS !== 'ios',
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

    onBarCodeRead = scanned => {
        const { data } = scanned;

        if (this.scanned || this.state.isScanning) return;

        clearTimeout(this.scanTimeout);

        this.setState({
            isScanning: true,
        });

        if (URL_REGEX.test(data)) {
            this.setState({ isLoading: true });
            this.props
                .lookupUsers(data)
                .then(res => {
                    if (res.data.length === 1) {
                        this.scanned = true;
                        const user = res.data[0];
                        this.props.navigator.pop();
                        this.props.onSuccessRead({
                            sendTo: { username: user.username, network: user.network, slug: user.slug },
                        });
                    } else {
                        this.vibration();
                        Alert.show('Please scan a valid XRPTipBot QR', { type: 'error' });
                    }
                })
                .finally(() => {
                    this.setState({ isLoading: false });
                });
            return;
        }

        if (TIPBOT_REGEX.test(data)) {
            this.scanned = true;
            const username = data.split(TIPBOT_REGEX)[4];
            const network = data.split(TIPBOT_REGEX)[2];
            const sendAmount = findGetParameter(data, 'amount');

            switch (network) {
                case 'discord':
                    this.setState({ isLoading: true });
                    this.props
                        .lookupUsers(username)
                        .then(res => {
                            if (res.data.length === 1) {
                                const user = res.data[0];
                                this.props.navigator.pop();
                                this.props.onSuccessRead({
                                    sendTo: { username: user.username, slug: user.slug, network: user.network },
                                    sendAmount,
                                });
                            } else {
                                this.vibration();
                                Alert.show('Please scan a valid XRPTipBot QR', { type: 'error' });
                            }
                        })
                        .finally(() => {
                            this.setState({ isLoading: false });
                        });
                    break;
                case 'internal':
                    this.props.navigator.pop();
                    this.props.onSuccessRead({
                        sendTo: { username, network, slug: 'Paper Account' },
                        sendAmount,
                    });
                    break;
                case 'coil':
                    this.props.navigator.pop();
                    this.props.onSuccessRead({
                        sendTo: { username, network, slug: 'Coil Account' },
                        sendAmount,
                    });
                    break;
                default:
                    this.props.navigator.pop();
                    this.props.onSuccessRead({ sendTo: { username, network }, sendAmount });
            }
            return;
        }

        this.vibration();
        Alert.show('Please scan an XRPTipBot QR Code ', { type: 'error' });

        this.scanTimeout = setTimeout(() => {
            this.setState({
                isScanning: false,
            });
        }, 2000);
    };

    render() {
        const { isLoading } = this.state;

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
                {isLoading && (
                    <View style={styles.loading}>
                        <ActivityIndicator />
                        <Text style={[AppStyles.h5, AppStyles.textCenterAligned]}>Loading ...</Text>
                    </View>
                )}
            </View>
        );
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
        flex: 1,
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
        width: AppSizes.screen.width * 0.4,
        height: AppSizes.screen.height * 0.4,
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
});

export default SendScanView;
