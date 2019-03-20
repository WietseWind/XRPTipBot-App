import React, { Component } from 'react';
import PropTypes from 'prop-types';

import {
    Alert,
    View,
    StyleSheet,
    Text,
    Platform,
    TouchableOpacity,
    TouchableHighlight,
    Image,
    Animated,
    ScrollView,
} from 'react-native';

import { AppStyles, AppColors, AppSizes, AppFonts } from '@theme/';

import { Alert as CustomAlert, Spacer, NumericKeyboard } from '@components';

import _ from 'lodash';

import LottieView from 'lottie-react-native';

import LinearGradient from 'react-native-linear-gradient';

class SendView extends Component {
    static displayName = 'SendView';

    constructor(props) {
        super(props);

        this.state = {
            error: '',
            step: 'waiting',
            sendAmount: props.sendAmount || '',
            sendTo: props.sendTo || '',
        };

        this.ConfirmFromBottom = new Animated.Value(50);
        this.KeyboardHeight = new Animated.Value(0);
    }

    static navigatorStyle = {
        statusBarTextColorScheme: 'light',
        tabBarHidden: Platform.OS !== 'ios',
    };

    static propTypes = {
        accountState: PropTypes.object,
        changeAppState: PropTypes.func,
        sendAmount: PropTypes.number,
        sendTo: PropTypes.object,
    };

    static defaultProps: {
        sendAmount: '',
        sendTo: '',
    };

    keyboardDidShow = () => {
        Animated.parallel([
            Animated.spring(this.ConfirmFromBottom, {
                toValue: AppSizes.screen.height * 0.43 + 20,
            }),
            Animated.spring(this.KeyboardHeight, {
                toValue:
                    AppSizes.screen.height * 0.43 +
                    AppSizes.screen.height * 0.08 +
                    (Platform.OS === 'android' ? 80 : 50),
            }),
        ]).start();
    };

    keyboardDidHide = () => {
        Animated.parallel([
            Animated.spring(this.ConfirmFromBottom, {
                toValue: 50,
            }),
            Animated.spring(this.KeyboardHeight, {
                toValue: 0,
            }),
        ]).start();
    };

    parseAmount = amount => {
        let sendAmount = amount;
        sendAmount = sendAmount.replace(',', '.');
        sendAmount = sendAmount.replace(/[^0-9\.]/g, '');
        if (sendAmount.split('.').length > 2) {
            sendAmount = sendAmount.replace(/\.+$/, '');
        }
        if (sendAmount.split('.')[1] && sendAmount.split('.').reverse()[0].length >= 6) {
            sendAmount =
                sendAmount.split('.').reverse()[1] +
                '.' +
                sendAmount
                    .split('.')
                    .reverse()[0]
                    .slice(0, 6);
        }
        return sendAmount;
    };

    onChangeAmount = sendAmount => {
        this.setState({
            sendAmount,
        });
    };

    showScanScreen = () => {
        this.props.navigator.push({
            screen: 'xrptipbot.SendScanScreen',
            title: 'Scan TipBot QR',
            backButtonTitle: 'Back',
            passProps: {
                onSuccessRead: this.onSuccessRead,
            },
        });
    };

    showContactsScreen = () => {
        this.props.navigator.push({
            screen: 'xrptipbot.ContactsSelectScreen',
            backButtonTitle: 'Cancel',
            title: 'Select destination',
            passProps: {
                onSuccessRead: this.onSuccessRead,
            },
        });
    };

    popToRoot = () => {
        setTimeout(() => {
            this.props.navigator.popToRoot({
                animated: true,
                animationType: 'fade',
            });
        }, 4000);
    };

    onSuccessRead = data => {
        const { sendTo, sendAmount } = data;
        this.setState({
            sendTo,
            sendAmount: sendAmount || this.state.sendAmount,
        });
    };

    sendTip = () => {
        let { sendAmount, sendTo } = this.state;
        //
        // Keyboard.dismiss();

        if (!sendAmount || sendAmount <= 0) {
            CustomAlert.show('Minimum tip amount: 0.000001 XRP', {
                type: 'error',
            });
            this.setState({
                sendAmount: '0.000001',
            });
            return;
        }

        if (sendAmount > 20) {
            CustomAlert.show('Sending amount should be less than 20 XRP', {
                type: 'error',
            });
            this.setState({
                sendAmount: '20',
            });
            return;
        }

        if (!sendTo) {
            return CustomAlert.show('Please set the destination.', {
                type: 'error',
            });
        }

        this.setState({
            step: 'sending',
        });
        this.props.navigator.setStyle({
            navBarHidden: true,
            statusBarColor: 'black',
        });

        if (sendAmount.startsWith('.')) sendAmount = '0' + sendAmount;

        this.props
            .tip(sendAmount, `xrptipbot://${sendTo.network}/${sendTo.username}`)
            .then(slug => {
                this.setState({
                    step: 'success',
                    to: slug,
                });
                this.props.getBalance();
                this.popToRoot();
            })
            .catch(error => {
                this.setState({
                    step: 'error',
                    error,
                });

                setTimeout(() => {
                    this.props.navigator.setStyle({
                        navBarHidden: false,
                        statusBarColor: '#4476f4',
                    });
                    this.setState({
                        step: 'waiting',
                    });
                }, 3000);
            });
    };

    renderPicker = () => {
        const { sendTo } = this.state;

        if (sendTo) {
            const iconStyle = {
                width: AppSizes.screen.width * 0.06,
                height: AppSizes.screen.width * 0.06,
            };

            let networkIcon = null;
            let tintColor = '#FFF';

            switch (sendTo.network) {
                case 'twitter':
                    tintColor = '#1DA1F2';
                    networkIcon = (
                        <Image style={[iconStyle, { tintColor }]} source={require('../../assets/images/twitter.png')} />
                    );
                    break;
                case 'reddit':
                    tintColor = '#ff4500';
                    networkIcon = (
                        <Image style={[iconStyle, { tintColor }]} source={require('../../assets/images/reddit.png')} />
                    );
                    break;
                case 'discord':
                    tintColor = '#7289DA';
                    networkIcon = (
                        <Image style={[iconStyle, { tintColor }]} source={require('../../assets/images/discord.png')} />
                    );
                    break;
                case 'internal':
                    networkIcon = <Image style={[iconStyle]} source={require('../../assets/images/internal.png')} />;
                    break;
            }

            return (
                <View style={[styles.pickerContainer, AppStyles.centerAligned]}>
                    <View style={[AppStyles.flex1, { paddingLeft: 15 }]}>{networkIcon}</View>
                    <View style={[AppStyles.flex4, AppStyles.centerAligned]}>
                        <Text style={[AppStyles.baseText, AppStyles.strong]}>
                            {sendTo.network === 'discord' || sendTo.network === 'internal'
                                ? sendTo.slug
                                : sendTo.username}
                        </Text>
                    </View>
                    <TouchableOpacity
                        onPress={() => {
                            this.setState({ sendTo: null });
                        }}
                        style={[AppStyles.flex1, { alignItems: 'flex-end', paddingRight: 15 }]}
                    >
                        <Image style={[iconStyle]} source={require('../../assets/images/clear.png')} />
                    </TouchableOpacity>
                </View>
            );
        } else {
            return (
                <View style={[styles.pickerContainer]}>
                    <TouchableHighlight
                        underlayColor={'#ffffff'}
                        onPress={this.showContactsScreen}
                        style={[
                            styles.button,
                            {
                                borderRightWidth: 1,
                                borderRightColor: AppColors.segmentButton.borderColor,
                            },
                        ]}
                    >
                        <View style={[styles.textContainer]}>
                            <Image
                                style={[
                                    styles.buttonIcon,
                                    {
                                        height: AppSizes.screen.width * 0.065,
                                        width: AppSizes.screen.width * 0.089,
                                    },
                                ]}
                                resizeMode={'stretch'}
                                source={require('../../assets/images/contacts.png')}
                            />
                        </View>
                    </TouchableHighlight>
                    <TouchableHighlight
                        underlayColor={'#ffffff'}
                        onPress={this.showScanScreen}
                        style={[
                            styles.button,
                            {
                                borderTopLeftRadius: 3,
                                borderBottomLeftRadius: 3,
                            },
                        ]}
                    >
                        <View style={[styles.textContainer]}>
                            <Image
                                style={[
                                    styles.buttonIcon,
                                    {
                                        height: AppSizes.screen.width * 0.07,
                                        width: AppSizes.screen.width * 0.07,
                                    },
                                ]}
                                resizeMode={'stretch'}
                                source={require('../../assets/images/qr.png')}
                            />
                        </View>
                    </TouchableHighlight>
                </View>
            );
        }
    };

    renderKeyboardHeader = () => {
        const { accountState } = this.props;
        let mustTips = _.sortBy(accountState.mustTip || [], [
            function(o) {
                return o.last_use;
            },
        ]);

        if (mustTips.length <= 0) {
            mustTips = [
                { amount: '0.25' },
                { amount: '1' },
                { amount: '2.5' },
                { amount: '5' },
                { amount: '10' },
                { amount: '20' },
            ];
        }
        return (
            <ScrollView
                horizontal={true}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={[AppStyles.row, AppStyles.paddingRight, AppStyles.paddingLeftSml]}
            >
                {mustTips.reverse().map((item, index) => {
                    return (
                        <TouchableOpacity
                            key={index}
                            onPress={() => {
                                this.textInput.blur();
                                this.setState({ sendAmount: item.amount });
                            }}
                            style={[
                                AppStyles.centerAligned,
                                {
                                    backgroundColor: AppColors.brand.light,
                                    borderRadius: 20,
                                    paddingRight: 10,
                                    paddingLeft: 10,
                                    marginRight: 5,
                                    marginLeft: 2,
                                    marginTop: 5,
                                    marginBottom: 5,
                                    borderColor: AppColors.brand.grey,
                                },
                            ]}
                        >
                            <Text style={[AppStyles.h5]}>{item.amount}</Text>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
        );
    };

    render() {
        const { sendAmount, sendTo, step, error } = this.state;

        switch (step) {
            case 'waiting':
                return (
                    <Animated.View style={[styles.container, { flexGrow: 1, paddingBottom: this.KeyboardHeight }]}>
                        <View style={[AppStyles.flex6, AppStyles.centerAligned]}>
                            <Text style={[AppStyles.h5, AppStyles.strong, AppStyles.textCenterAligned]}>
                                Destination
                            </Text>
                            <Text style={[AppStyles.baseText, AppStyles.textCenterAligned]}>
                                Select a contact or scan QR code
                            </Text>
                            <Spacer size={20} />
                            {this.renderPicker()}

                            <Spacer size={40} />

                            <Text style={[AppStyles.h5, AppStyles.strong, AppStyles.textCenterAligned]}>
                                Set the amount you want to tip
                            </Text>
                            <Text style={[AppStyles.baseText, AppStyles.textCenterAligned]}>Max. amount is 20 XRP</Text>
                            <Spacer size={20} />

                            <NumericKeyboard
                                disabled={false}
                                placeholder={'Set the amount'}
                                placeholderTextColor={'#AFBCD8'}
                                onChangeText={this.onChangeAmount}
                                onFocus={this.keyboardDidShow}
                                onBlur={this.keyboardDidHide}
                                style={[styles.amountInput]}
                                valueStyle={[AppStyles.h5]}
                                ref={r => {
                                    this.textInput = r;
                                }}
                                value={sendAmount.toString()}
                                regs={this.parseAmount.bind(this)}
                                keyboardHeader={this.renderKeyboardHeader}
                            />
                            {/*<TextInput*/}
                            {/*style={[styles.amountInput, AppStyles.baseText]}*/}
                            {/*autoCorrect={false}*/}
                            {/*returnKeyType='done'*/}
                            {/*placeholder={'Set the amount'}*/}
                            {/*keyboardType={this.getKeyboardType()}*/}
                            {/*placeholderTextColor={'#AFBCD8'}*/}
                            {/*underlineColorAndroid='transparent'*/}
                            {/*value={sendAmount.toString()}*/}
                            {/*onChangeText={this.onChangeAmount}*/}
                            {/*ref={(r) => { this.textInput = r; }}*/}
                            {/*/>*/}

                            <Spacer size={80} />
                        </View>

                        <Animated.View style={[styles.submitButtonContainer, { bottom: this.ConfirmFromBottom }]}>
                            <TouchableOpacity style={styles.buttonSubmit} onPress={this.sendTip}>
                                <Text style={[styles.buttonSubmitText]}>Confirm</Text>
                            </TouchableOpacity>
                        </Animated.View>
                    </Animated.View>
                );

            case 'sending':
                return (
                    <LinearGradient
                        style={[styles.mainContent]}
                        colors={['#13547a', '#80d0c7']}
                        start={{ x: 0, y: 0.1 }}
                        end={{ x: 0.1, y: 1 }}
                    >
                        <LottieView
                            source={require('../../assets/animation/spinner.json')}
                            style={{ width: 400, height: 400 }}
                            autoPlay
                            loop
                            resizeMode={'contain'}
                        />
                        <Text style={[AppStyles.h5, AppStyles.textCenterAligned, styles.whiteText]}>
                            Sending Tip ...
                        </Text>
                    </LinearGradient>
                );

            case 'error':
                return (
                    <LinearGradient
                        style={[styles.mainContent]}
                        colors={['#f77062', '#fe5196']}
                        start={{ x: 0, y: 0.1 }}
                        end={{ x: 0.1, y: 1 }}
                    >
                        <LottieView
                            source={require('../../assets/animation/error.json')}
                            style={{ width: AppSizes.screen.width * 0.5, height: AppSizes.screen.height * 0.5 }}
                            autoPlay
                            loop={false}
                            resizeMode={'cover'}
                        />

                        <Text style={[AppStyles.h5, AppStyles.textCenterAligned, styles.whiteText]}>{error}</Text>
                    </LinearGradient>
                );
            case 'success':
                return (
                    <LinearGradient
                        style={[styles.mainContent]}
                        colors={['#92fe9d', '#00c9ff']}
                        start={{ x: 0, y: 0.1 }}
                        end={{ x: 0.1, y: 1 }}
                    >
                        <LottieView
                            source={require('../../assets/animation/simple_tick.json')}
                            style={{ width: AppSizes.screen.width * 0.5, height: AppSizes.screen.height * 0.5 }}
                            autoPlay
                            loop={false}
                            resizeMode={'cover'}
                        />
                        <Text style={[AppStyles.h5, AppStyles.textCenterAligned, styles.whiteText]}>
                            Successfully Sent {sendAmount.startsWith('.') ? '0' + sendAmount : sendAmount} XRP{' '}
                            {sendTo.network === 'internal'
                                ? ''
                                : sendTo.network === 'discord'
                                ? `to ${sendTo.slug}`
                                : `to ${sendTo.username}`}
                        </Text>
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
        backgroundColor: '#ECF1FC',
    },
    button: {
        flex: 1,
    },
    textContainer: {
        flexDirection: 'row',
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingLeft: 10,
    },
    pickerContainer: {
        marginLeft: 10,
        marginRight: 10,
        marginBottom: 5,
        marginTop: 5,
        borderColor: '#c6c6c6',
        borderWidth: 1,
        flexDirection: 'row',
        borderRadius: 40,
        overflow: 'hidden',
        backgroundColor: AppColors.segmentButton.background,
        height: AppSizes.screen.height * 0.08,
        width: AppSizes.screen.width * 0.7,
    },
    buttonText: {
        textAlign: 'left',
        fontSize: AppFonts.base.size,
        color: AppColors.segmentButton.textColor,
        ...Platform.select({
            ios: {
                fontWeight: '500',
            },
        }),
    },
    buttonIcon: {
        tintColor: '#4476E1',
    },
    amountInput: {
        backgroundColor: '#FFF',
        justifyContent: 'center',
        width: AppSizes.screen.width * 0.7,
        height: AppSizes.screen.height * 0.08,
        color: '#5a5a5a',
        textAlign: 'center',
        borderWidth: 1,
        borderColor: '#c6c6c6',
        borderRadius: AppSizes.screen.width * 0.7 * AppSizes.screen.height * 0.1,
    },
    submitButtonContainer: {
        position: 'absolute',
        bottom: 50,
        left: 0,
        right: 0,
        alignItems: 'center',
    },
    buttonSubmit: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#41E196',
        height: AppSizes.screen.height * 0.08,
        width: AppSizes.screen.width * 0.7,
        zIndex: 100,
        borderRadius: AppSizes.screen.width * 0.7 * AppSizes.screen.height * 0.1,
    },
    buttonSubmitText: {
        fontFamily: AppFonts.h5.family,
        fontSize: AppFonts.h5.size,
        fontWeight: 'bold',
        color: 'white',
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
});

export default SendView;
