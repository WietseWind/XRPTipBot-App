import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { StyleSheet, View, Text, Platform } from 'react-native';

import { Alert, PinInput, Spacer } from '@components';
import { AppStyles, AppColors, AppFonts } from '@theme/';

import LinearGradient from 'react-native-linear-gradient';

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
        height: 300,
        width: 300,
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

class PinCodeView extends Component {
    static displayName = 'PinCodeView';

    constructor(props) {
        super(props);

        this.state = {
            action: props.action,
            pinCode: '',
            WrongCode: false,
            checkingPin: false,
        };
    }

    static navigatorStyle = {
        navBarHidden: false,
        navBarTextColor: '#fff',
        navBarButtonColor: '#fff',
        statusBarTextColorScheme: 'light',
        drawUnderNavBar: false,
        // navBarTranslucent: Platform.OS === 'ios',
        navBarNoBorder: true,
        navBarTransparent: true,
        navBarBackgroundColor: AppColors.brand.primary,
        topBarElevationShadowEnabled: false,
        drawUnderTabBar: true,
        navBarTitleTextCentered: true,
        navBarTextFontSize: AppFonts.scale(20),
    };

    static propTypes = {
        pinLogin: PropTypes.func.isRequired,
    };

    static defaultProps = {
        token: null,
        action: 'set',
    };

    componentDidMount() {
        const { action } = this.props;

        switch (action) {
            case 'check':
                this.props.navigator.setTitle({ title: 'Welcome back!' });
                break;
            case 'set':
            case 'set_confirm':
                this.props.navigator.setTitle({ title: 'Welcome' });
                break;
            default:
                this.props.navigator.setTitle({ title: 'Welcome' });
        }
    }

    pinLogin = pin => {
        const { paperToken } = this.props;

        this.setState({ checkingPin: true });

        this.props
            .pinLogin(paperToken, pin)
            .then(() => {
                this.props.changeAppRoot('after-login');
                this.props.connect();
            })
            .catch(error => {
                this.setState({ checkingPin: false, WrongCode: true });
                this.onClear();
            });
    };

    onPinSubmit = pin => {
        const { action, pinCode } = this.state;
        switch (action) {
            case 'set':
                this.setState({ pinCode: pin, action: 'set_confirm' });
                break;
            case 'set_confirm':
                if (pinCode === pin) {
                    this.setState({ WrongCode: false });
                    this.pinLogin(pin);
                } else {
                    this.setState({
                        WrongCode: true,
                    });
                }
                break;
            case 'check':
                this.pinLogin(pin);
        }
    };

    onClear = () => {
        const { action } = this.props;
        this.setState({
            action: action,
            WrongCode: false,
            pinCode: '',
        });
    };

    render() {
        const { action, pinCode, WrongCode, checkingPin } = this.state;

        const paddingTop = Platform.OS === 'ios' ? 0 : 50;

        switch (action) {
            case 'check':
                return (
                    <LinearGradient
                        style={[styles.mainContent, { paddingTop: paddingTop }]}
                        colors={['#4476E1', '#3056A6']}
                        start={{ x: 0, y: 0.1 }}
                        end={{ x: 0.1, y: 1 }}
                    >
                        <View style={[AppStyles.flex1, AppStyles.centerAligned]}>
                            <Text
                                style={[
                                    AppStyles.h5,
                                    {
                                        textAlign: 'center',
                                        color: AppColors.brand.light,
                                        marginRight: 10,
                                        marginLeft: 10,
                                    },
                                ]}
                            >
                                Please enter your account PIN code to login to your account. This is the PIN you
                                selected when you activated your account for the first time.
                            </Text>
                        </View>
                        <View style={AppStyles.flex2}>
                            <PinInput
                                middleText={' '}
                                loading={checkingPin}
                                wrongCode={WrongCode}
                                onSubmit={this.onPinSubmit}
                            />
                        </View>
                    </LinearGradient>
                );
            case 'set':
            case 'set_confirm':
                return (
                    <LinearGradient
                        style={[styles.mainContent, { paddingTop: paddingTop }]}
                        colors={['#4476E1', '#3056A6']}
                        start={{ x: 0, y: 0.1 }}
                        end={{ x: 0.1, y: 1 }}
                    >
                        <View style={[AppStyles.flex1, AppStyles.centerAligned]}>
                            <Text
                                style={[
                                    AppStyles.h5,
                                    {
                                        textAlign: 'center',
                                        color: AppColors.brand.light,
                                        marginRight: 10,
                                        marginLeft: 10,
                                    },
                                ]}
                            >
                                Please configure the PIN code for your new account. Please store your PIN in a secure
                                place. You need to enter this PIN if your ever want to withdraw your XRP.
                            </Text>
                        </View>
                        <View style={AppStyles.flex2}>
                            <PinInput
                                middleText={!pinCode ? ' ' : 'Please confirm your PIN'}
                                wrongCode={WrongCode}
                                loading={checkingPin}
                                onSubmit={this.onPinSubmit}
                                onClear={this.onClear}
                            />
                        </View>
                    </LinearGradient>
                );
        }
    }
}

export default PinCodeView;
