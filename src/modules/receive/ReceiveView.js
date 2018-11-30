import React, {Component} from 'react';
import PropTypes from 'prop-types';

import {
    View,
    StyleSheet,
    Text,
    Platform,
    Alert,
    TouchableOpacity,
    PermissionsAndroid,
    CameraRoll,
    Image,
    ScrollView,
    RefreshControl,
    TouchableHighlight,
    Linking
} from 'react-native';

import {AppStyles, AppColors, AppSizes, AppFonts} from '@theme/';

import ActionSheet from '@expo/react-native-action-sheet';

import Share from 'react-native-share';
import firebase from 'react-native-firebase';


import {LoadingIndicator, SegmentButton, QRCode} from '@components';

const TIPBOT_REGEX = RegExp("(xrptipbot:\\/\\/)(twitter|reddit|discord|internal)(\\/)((?!activate)[^\\/\\?]+)");

class ReceiveView extends Component {
    static displayName = 'ReceiveView';

    constructor(props) {
        super(props);

        this.state = {
            loadingBalance: false,
            showBalance: true
        };

        this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
    }

    static navigatorButtons = {
        rightButtons: [{
            icon: require('../../assets/images/settings.png'),
            id: 'settings'
        }]
    };

    static navigatorStyle = {
        statusBarTextColorScheme: 'light',
    };

    static propTypes = {
        accountState: PropTypes.object,
        changeAppState: PropTypes.func
    };

    onNavigatorEvent(event) {
        switch ((event.type)){
            case 'NavBarButtonPress':
                if (event.id === 'settings') {
                    this.showSettingsDialog();
                    break;
                }
                break;
            case 'ScreenChangedEvent':
                switch (event.id){
                    case 'willAppear':
                        if(Platform.OS === 'ios') this.props.navigator.toggleTabs({to: 'shown',});
                        break
                }

        }
    }

    componentWillMount(){
        // this.props.logout();


        setTimeout(() => {
            this.props.navigator.setStyle({
                navBarCustomView: 'xrptipbot.NavBar',
                navBarCustomViewInitialProps: {
                    ts: (new Date).getTime(),
                },
            });
        }, 100);


        if (Platform.OS === "ios"){
            Linking.getInitialURL().then((url) => {
                if (url) {
                    return this._handleDeepLink({url});
                }
            }).catch(err => console.error('An error occurred', err));
        }
        Linking.addEventListener('url', this._handleDeepLink);
    }


    componentDidMount() {
        const { accountState } = this.props;

        this.props.navigator.setTabButton({
            tabIndex: 1,
            label: accountState.network === "internal" ? "TipBot" : accountState.slug
        });


        this.fetchBalance();

        // request permission for notifications
        this.requestPermission();
    }


    findGetParameter = (text, parameterName) => {
        let result = null,
            tmp = [];
        let items = text.split("?");
        for (let index = 0; index < items.length; index++) {
            tmp = items[index].split("=");
            if (tmp[0] === parameterName) result = decodeURIComponent(tmp[1]);
        }

        return result || '';
    };



    _handleDeepLink = (event) => {
        const { url } = event;
        if(TIPBOT_REGEX.test(url)){
            const username = url.split(TIPBOT_REGEX)[4];
            const network = url.split(TIPBOT_REGEX)[2];
            const sendAmount = this.findGetParameter(url, "amount");
            switch (network) {
                case "discord":
                    this.props.lookupUsers(username).then((res) => {
                        if (res.data.length === 1) {
                            const user = res.data[0];
                            this.showSendScreen(
                                {
                                    sendTo: {username: user.username, slug: user.slug, network: user.network},
                                    sendAmount
                                }
                            );
                        }
                    });
                    break;
                case "internal":
                    this.showSendScreen(
                        {
                            sendTo: {username, network, slug: "Paper Account"},
                            sendAmount
                        }
                    );
                    break;
                default:
                    this.showSendScreen(
                        {sendTo: {username, network}, sendAmount }
                    );
            }
        }
    };

    async requestPermission() {
        try {
            await firebase.messaging().requestPermission();

        } catch (error) {
            // User has rejected permissions
            console.log('permission rejected');
        }
    }


    fetchBalance = () => {
        this.setState({
            loadingBalance: true
        });
        this.props.getBalance()
            .then(() => {
                this.setState({
                    loadingBalance: false
                })
            }).catch((error) => {
                // check if token expired or invalid
            if(error == "Invalid token: invalid, removed or expired"){
                setTimeout(() => {
                    this.props.logout();
                    this.props.disconnect()
                }, 3000)
            }
        });

    };

    logout = () => {
        Alert.alert(
            'Disconnect',
            'Are you sure you want to disconnect from the XRPTipBot (you will need to activate the app again)?',
            [
                {text: 'Yes', onPress: () => { this.props.logout(); this.props.disconnect()}  },
                {text: 'No', onPress: () => null, style: 'cancel'},
            ],
            { cancelable: false }
        )
    };


    showQRCodeDialog = () => {
        const options = ['Share', 'Save', 'Cancel'];
        const cancelButtonIndex = options.length - 1;
        this.actionSheetRef.showActionSheetWithOptions(
            {
                options,
                cancelButtonIndex
            },
            (buttonIndex) => {
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


    requestExternalStoragePermission = async () => {
        return new Promise(async(resolve, reject) => {
            Platform.OS === "ios" ? resolve() : null;
            try {
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
                    {
                        title: 'XRPTIPBot Storage Permission',
                        message: 'XRPTIPBot needs access to your storage so you can save the QRCode',
                    },
                );
                return resolve(granted);
            } catch (err) {
                return reject('Failed to request permission');
            }
        })
    };

    saveQRToDisk() {
        this.qr.viewRef.capture().then(uri => {
            this.requestExternalStoragePermission().then(() => {
                CameraRoll.saveToCameraRoll(uri, 'photo')
                    .then(() => {
                        Alert.alert(
                            'Success',
                            'QRCode successfully saved into the gallery'
                        );
                    })
                    .catch((e) => {
                        Alert.alert(
                            'Oh..',
                            'We can not save the QR code to the gallery'
                        );
                    });
            }).catch(() => {
                Alert.alert(
                    'Oh..',
                    'XRPTIPBot need to have permission to save QRCode'
                );
            })


        });
    }

    shareQRCode = () => {
        const { accountState } = this.props ;
        this.qr.viewRef.capture().then(uri => {
            Share.open({
                title: 'XRPTipBot',
                message: `xrptipbot://${accountState.network}/${accountState[accountState.network === "discord" ? 'uid' : 'slug'].replace('@', '').replace('/u/', '')}`,
                url: uri,
                subject: 'XRPTipBot QRCode' // for email
            }).then((res) => { console.log(res) })
                .catch((err) => { err && console.log(err); });
        })

    };


    showSendScreen = (props) => {
        this.props.navigator.switchToTab({
            tabIndex: 1
        });

        if(Platform.OS === 'ios') this.props.navigator.toggleTabs({to: 'hidden',});

        this.props.navigator.push({
            screen: "xrptipbot.SendScreen",
            backButtonTitle: "Cancel",
            title: "Send a tip",
            navigatorStyle: {
                drawUnderTabBar: true
            },
            passProps: props || {}
        })
    };

    toggleBalance = () => {
        this.state.showBalance ? (
            this.setState({ showBalance: false })
        ) : (
            this.setState({ showBalance: true })
        )
    };


    webSignin = () => {
        if(Platform.OS === 'ios') this.props.navigator.toggleTabs({to: 'hidden',});

        this.props.navigator.push({
            screen: 'xrptipbot.WebSigninScreen',
            backButtonTitle: "Cancel",
            title: "Scan code",
            navigatorStyle: {
                drawUnderTabBar: true
            },
        });
    };

    showSettingsDialog = () => {
        const { accountState } = this.props ;

        const options = ['Disconnect app'];

        let webSigninIndex = null;

        if(accountState.network === "internal"){
            options.push('Web (desktop) sign in');
            webSigninIndex = options.length - 1
        }

        options.push( 'Cancel');

        const cancelButtonIndex = options.length - 1;
        this.actionSheetRef.showActionSheetWithOptions(
            {
                options,
                cancelButtonIndex
            },
            (buttonIndex) => {
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
        const {accountState} = this.props;
        const { loadingBalance, showBalance } = this.state;
        return(
            <ActionSheet ref={(component) => { this.actionSheetRef = component; }}>
                <ScrollView contentContainerStyle={[AppStyles.container]}
                            refreshControl={
                                <RefreshControl
                                    onRefresh={() => this.fetchBalance()}
                                    refreshing={this.state.loadingBalance}
                                />
                            }
                >
                    <View style={[AppStyles.flex2, AppStyles.centerAligned, {backgroundColor: AppColors.brand.light}]}>
                        <View style={[AppStyles.flex2, AppStyles.containerCentered]}>

                            <Text style={[AppStyles.textCenterAligned, AppStyles.h5, AppStyles.strong]}>My TipBot Balance</Text>

                            <View style={[styles.pickerContainer, AppStyles.centerAligned]}>
                                <View style={[AppStyles.flex1, {paddingLeft: 22 , paddingTop: 2}]}>
                                    <Image style={{height:AppSizes.screen.width * 0.2, width:AppSizes.screen.width * 0.05 }} resizeMode="contain" source={require('../../assets/images/xrp.png')} />
                                </View>
                                <View style={[AppStyles.flex6, AppStyles.centerAligned]}>
                                    { loadingBalance ? ( <LoadingIndicator/> ) : (
                                        showBalance ? (
                                            <Text style={styles.balanceText}>{ accountState.balance.XRP }</Text>
                                        ) : (
                                            <Text style={[ styles.balanceText , { color: AppColors.brand.grey}]}>*********</Text>
                                        )
                                    )
                                    }
                                </View>
                                <View style={[AppStyles.flex1, {alignItems: "flex-end", paddingRight: 20}]}>
                                    <TouchableOpacity onPress={this.toggleBalance}>
                                        { showBalance ? (
                                            <Image style={{ width:AppSizes.screen.width * 0.05 ,  height: AppSizes.screen.width * 0.05, tintColor: AppColors.brand.secondary }} resizeMode="contain" source={require('../../assets/images/eye-open.png')}/>
                                        ) : (
                                            <Image style={{ width:AppSizes.screen.width * 0.05 ,  height: AppSizes.screen.width * 0.05, tintColor: AppColors.brand.grey }} resizeMode="contain" source={require('../../assets/images/eye-shut.png')}/>
                                        )
                                        }
                                    </TouchableOpacity>
                                </View>
                            </View>

                        </View>
                    </View>
                    <View style={[AppStyles.flex3, AppStyles.centerAligned, AppStyles.containerCentered]}>

                        <TouchableHighlight style={styles.buttonTip} onPress={() => {this.showSendScreen()}} activeOpacity={0.8} underlayColor="#3BD48C">
                            <Text style={[styles.buttonTipText]}>Send a tip   <Image style={{width: AppSizes.screen.width * 0.04 ,  height: AppSizes.screen.width * 0.04  }} resizeMode="contain" source={require('../../assets/images/arrow-right.png')}/></Text>
                        </TouchableHighlight>
                        <View style={[AppStyles.flex1, AppStyles.centerAligned, {marginTop: 25}]}>
                            <Text style={[AppStyles.baseText,AppStyles.strong, AppStyles.textCenterAligned]}>This is your personal TipBot QR</Text>
                            <Text style={[AppStyles.subtext, AppStyles.textCenterAligned]}>Have it scanned to receive XRP</Text>
                            <TouchableOpacity  onPress={this.showQRCodeDialog} style={{marginTop: 20}}>
                            <QRCode
                                ref = {ref => this.qr = ref}
                                logo = {true }
                                value={`xrptipbot://${accountState.network}/${accountState[accountState.network === "discord" ? 'uid' : 'slug'].replace('@', '').replace('/u/', '')}`}
                                size={AppSizes.screen.height / 4}
                                bgColor='black'
                                fgColor='white'
                            />
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>

            </ActionSheet>
        )
    }
}


/* Styles ==================================================================== */
const styles = StyleSheet.create({
    balanceText:{
        fontFamily: AppFonts.h4.family,
        fontSize: AppFonts.h4.size,
        fontWeight: Platform.OS === "ios" ? '600': '500',
        color: AppColors.brand.primary,
    },
    pickerContainer: {
        marginLeft: 10,
        marginRight: 10,
        marginBottom: 5,
        marginTop: 5,
        borderColor: "#c6c6c6",
        borderWidth: 1,
        flexDirection: 'row',
        borderRadius: 40,
        overflow: 'hidden',
        backgroundColor: AppColors.segmentButton.background,
        height: AppSizes.screen.height * 0.08,
        width: AppSizes.screen.width * 0.70
    },
    buttonTip: {
        position: "absolute",
        top: -28,
        left: (AppSizes.screen.width / 2) - AppSizes.screen.width * 0.35,
        right: 0,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#41E196',
        height: AppSizes.screen.height * 0.08,
        width: AppSizes.screen.width * 0.70,
        zIndex: 1,
        borderRadius: AppSizes.screen.width * 0.70 * AppSizes.screen.height * 0.10,
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
