import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { WebView, StyleSheet, Platform, View, Text, Vibration, ActivityIndicator } from 'react-native';

import { Alert, Separator, PinInput, Spacer } from '@components';
import { AppStyles, AppColors, AppSizes, AppFonts } from '@theme/';

import LottieView from 'lottie-react-native';
import LinearGradient from 'react-native-linear-gradient';

class RemoteLoginView extends Component {
    static displayName = 'RemoteLoginView';

    constructor(props) {
        super(props);

        this.state = {
            isLoading: true,
            step: 'login',
        };
    }

    static navigatorStyle = {
        tabBarHidden: false,
        statusBarTextColorScheme: 'light',
        topBarElevationShadowEnabled: false,
        screenBackgroundColor: AppColors.background,
        navBarTitleTextCentered: true,
        navBarBackgroundColor: AppColors.brand.primary,
        orientation: 'portrait',
        navBarButtonColor: '#ffffff',
        navBarTextColor: '#ffffff',
        statusBarColor: '#4476f4',
    };

    static propTypes = {
        onSuccessRead: PropTypes.func,
    };

    onMessage = event => {
        const token = event.nativeEvent.data.replace('xrptipbot://', '');
        if (token && token.length > 0) {
            this.handleLogin(token);
        }
    };

    handleLogin = token => {
        // normal login
        if (token.length <= 40) {
            return Alert.show('This is not an XRPTipBot token QRCode', {
                type: 'error',
            });
        }

        this.props.navigator.setStyle({
            navBarHidden: true,
        });
        this.setState({
            step: 'loading',
        });

        this.props
            .login(token)
            .then(() => {
                this.props.changeAppRoot('after-login');
                this.props.connect();
            })
            .catch(message => {
                Alert.show(message || 'Invalid Token.', { type: 'error' });
                Vibration.vibrate();
            })
            .finally(() => {
                this.props.navigator.setStyle({
                    navBarHidden: false,
                });
                this.setState({
                    step: 'login',
                });
            });
    };

    renderSpinner = () => {
        return (
            <View style={styles.loading}>
                <ActivityIndicator size="large" color={'white'} />
                <Text style={[AppStyles.h5, styles.whiteText, AppStyles.textCenterAligned]}>Loading ...</Text>
            </View>
        );
    };

    render() {
        const { step } = this.state;
        switch (step) {
            case 'login':
                return (
                    <WebView
                        originWhitelist={['*']}
                        onLoad={() => this.setState({ isLoading: false })}
                        source={{
                            uri: `https://www.xrptipbot.com/app?from=${Platform.OS}`,
                            headers: { XRPTIPBOT: 'TRUE' },
                        }}
                        startInLoadingState={true}
                        onMessage={this.onMessage}
                        style={{ flex: 1 }}
                        renderLoading={() => {
                            return this.renderSpinner();
                        }}
                    />
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
                            source={require('../../../assets/animation/loading_semicircle.json')}
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

/* Styles ==================================================================== */
const styles = StyleSheet.create({
    mainContent: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'space-around',
    },
    whiteText: {
        color: '#fff',
    },
    loading: {
        position: 'absolute',
        zIndex: 99999,
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        backgroundColor: AppColors.brand.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default RemoteLoginView;
