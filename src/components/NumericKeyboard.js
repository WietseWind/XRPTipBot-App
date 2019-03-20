import React, { Component } from 'react';
import {
    StyleSheet,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Animated,
    Modal,
    Button,
    DeviceEventEmitter,
    Image,
    Platform,
    Dimensions,
    TouchableHighlight,
    BackHandler,
    Alert,
} from 'react-native';

import NumericInput from './NumericInput';

import { AppSizes, AppColors } from '@theme';

import PropTypes from 'prop-types';

class NumericKeyboard extends Component {
    static propTypes = {
        keyboardHeader: PropTypes.func,
        value: PropTypes.any,
        placeholder: PropTypes.string,
        placeholderTextColor: PropTypes.string,
        disabled: PropTypes.bool,
        caretHidden: PropTypes.bool,
        secureTextEntry: PropTypes.bool,
        style: PropTypes.any,
        valueStyle: PropTypes.any,
        regs: PropTypes.func,
        onChangeText: PropTypes.func,
        onFocus: PropTypes.func,
        onBlur: PropTypes.func,
    };
    constructor(props) {
        super(props);
        this.state = {
            modalVisible: false,
            caretHidden: false,
            secureTextEntry: false,
            valueArr: [],
            numArr: [1, 2, 3, 4, 5, 6, 7, 8, 9, '.', 0, 'X'],
            cursorLock: true,
        };
    }

    componentDidMount() {
        let that = this;

        this.props.secureTextEntry &&
            this.setState({
                secureTextEntry: true,
            });
        this.props.caretHidden &&
            this.setState({
                caretHidden: true,
            });
    }

    shouldComponentUpdate(nextProps, nextState) {
        return (
            this.state.modalVisible != nextState.modalVisible ||
            this.state.cursorLock != nextState.cursorLock ||
            this.props.disabled != nextProps.disabled ||
            this.props.value != nextProps.value
        );
    }

    static getDerivedStateFromProps(props, state) {
        if (props.value.split('') !== state.valueArr) {
            return {
                valueArr: props.value.split(''),
            };
        }
        return null;
    }

    clear() {
        this.removeAll();
    }

    isFocused() {
        if (this.state.cursorLock) {
            return false;
        } else {
            return true;
        }
    }

    blur() {
        this.hide();
    }

    focus() {
        this.show();
    }

    show() {
        this.setState({
            modalVisible: true,
            cursorLock: false,
        });
        this.onFocus();
    }

    hide() {
        this.setState({
            modalVisible: false,
            cursorLock: true,
        });
        this.onBlur();
    }

    inputEvent(value) {
        DeviceEventEmitter.emit('numericKeyboardInput', value);
        this.onChangeText(value);
    }

    onChangeText(value) {
        if (value == undefined || value == null) return false;
        this.props.onChangeText && this.props.onChangeText(value.join(''));
    }

    onFocus() {
        this.props.onFocus && this.props.onFocus();
    }

    onBlur() {
        this.props.onBlur && this.props.onBlur();
    }

    regs(valueArr) {
        if (!this.props.regs) {
            return valueArr;
        }
        valueArr = this.props.regs(valueArr.join(''));
        valueArr = valueArr.split('');
        return valueArr;
    }

    add(value) {
        let valueArr = this.state.valueArr;
        valueArr.push(value);
        if (valueArr == '' || valueArr == undefined || valueArr == null) {
            return;
        }
        valueArr = this.regs(valueArr);
        this.setState({
            valueArr: valueArr,
        });
        this.inputEvent(valueArr);
    }

    remove() {
        let valueArr = this.state.valueArr;
        if (valueArr.length == 0) {
            return;
        }
        valueArr.pop();
        this.setState({
            valueArr: valueArr,
        });
        this.inputEvent(valueArr);
    }

    removeAll() {
        let valueArr = this.state.valueArr;
        if (valueArr.length == 0) {
            return;
        }
        valueArr = [];
        this.setState({
            valueArr: valueArr,
        });
        this.inputEvent(valueArr);
    }

    renderNumText(flag) {
        return this.state.numArr.slice(flag, flag + 3).map((item, index) => {
            let styleLine = item == 'X' || item == '.' ? styles.toolLine : styles.line;
            let styleNumText = item == 'X' || item == '.' ? styles.specialNumText : styles.numText;
            if (item == 'X') {
                return (
                    <TouchableHighlight
                        underlayColor={'#ECF1FD'}
                        style={styleLine}
                        valueStyle={this.props.valueStyle}
                        key={index}
                        onPress={this.remove.bind(this)}
                        onLongPress={this.removeAll.bind(this)}
                    >
                        <Image style={styles.removeIcon} source={require('../assets/images/icon-delete.png')} />
                    </TouchableHighlight>
                );
            }
            return (
                <TouchableHighlight
                    underlayColor={'#ECF1FD'}
                    style={styleLine}
                    activeOpacity={0.7}
                    key={index}
                    onPress={this.add.bind(this, item)}
                >
                    <Text style={styleNumText}>{item}</Text>
                </TouchableHighlight>
            );
        });
    }
    renderNum() {
        return this.state.numArr.map((item, index) => {
            if (index % 3 == 0) {
                return (
                    <View style={styles.numWrap} key={index}>
                        {this.renderNumText(index)}
                    </View>
                );
            }
        });
    }

    render() {
        return (
            <View>
                <NumericInput
                    disabled={this.props.disabled}
                    caretHidden={this.state.caretHidden}
                    secureTextEntry={this.state.secureTextEntry}
                    value={this.props.value}
                    cursorLock={this.state.cursorLock}
                    style={this.props.style}
                    valueStyle={this.props.valueStyle}
                    show={this.show.bind(this)}
                    placeholder={this.props.placeholder}
                    placeholderTextColor={this.props.placeholderTextColor}
                />
                <Modal
                    animationType={'slide'}
                    hardwareAccelerated={true}
                    presentationStyle={'overFullScreen'}
                    transparent={true}
                    visible={this.state.modalVisible}
                    onRequestClose={() => {
                        this.hide();
                    }}
                >
                    <View style={styles.root}>
                        <Text
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                bottom: 0,
                                right: 0,
                                backgroundColor: 'rgba(0,0,0,0)',
                            }}
                            onPress={this.hide.bind(this)}
                        />
                        <View style={styles.keyboardWrap}>
                            <View style={styles.headerWrap}>
                                {this.props.keyboardHeader ? (
                                    this.props.keyboardHeader()
                                ) : (
                                    <Image style={styles.headerImage} source={require('../assets/images/logo.png')} />
                                )}
                                {/*<TouchableOpacity onPress={this.hide.bind(this)} style={styles.closeIconWrap}>*/}
                                {/*<Image style={styles.closeIcon} source={require('../assets/images/icon-down.png')}/>*/}
                                {/*</TouchableOpacity>*/}
                            </View>
                            {this.renderNum()}
                        </View>
                    </View>
                </Modal>
            </View>
        );
    }
}

let basePx = Platform.OS === 'ios' ? 750 : 720;
let { height, width } = Dimensions.get('window');
function px2dp(px) {
    return (px / basePx) * width;
}

const styles = StyleSheet.create({
    textInputWrap: {
        borderWidth: 1,
        height: 40,
        borderColor: '#999999',
        borderRadius: 5,
        flexDirection: 'row',
        alignItems: 'center',
        paddingLeft: px2dp(10),
    },
    cursorWrap: {
        height: 40,
        flexDirection: 'row',
        alignItems: 'center',
    },
    cursor: {
        fontSize: 30,
        fontWeight: '300',
    },
    root: {
        flex: 1,
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
    },
    defaultHeader: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerWrap: {
        height: 42,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerText: {
        fontSize: 14,
        color: '#5FBF9F',
    },
    headerImage: {
        tintColor: '#3E77E6',
        width: px2dp(260),
        resizeMode: 'contain',
    },
    closeIconWrap: {
        flex: 1,
        backgroundColor: '#fff',
    },
    closeIcon: {
        width: px2dp(40),
        resizeMode: 'contain',
    },
    removeIcon: {
        width: px2dp(50),
        resizeMode: 'contain',
    },
    keyboardWrap: {
        height: AppSizes.screen.height * 0.425,
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#ffffff',
        borderWidth: 0,
        borderTopWidth: 1,
        borderTopColor: '#cccccc',
    },
    numWrap: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    toolLine: {
        borderTopColor: '#cccccc',
        borderRightColor: '#cccccc',
        borderTopWidth: 1,
        borderRightWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
        height: AppSizes.screen.height * 0.09,
        backgroundColor: '#F5F8FC',
    },
    line: {
        borderTopColor: '#cccccc',
        borderRightColor: '#cccccc',
        borderTopWidth: 1,
        borderRightWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
        height: AppSizes.screen.height * 0.09,
    },
    specialNumText: {
        paddingBottom: px2dp(15),
        color: '#000000',
        fontSize: 26,
        fontWeight: '900',
    },
    numText: {
        color: '#000000',
        fontSize: 26,
        fontWeight: Platform.OS === 'ios' ? '500' : '400',
    },
    bottomWrap: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
});

export default NumericKeyboard;
