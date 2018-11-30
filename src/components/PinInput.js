import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, Text, TouchableOpacity, View, Image, Animated } from 'react-native';

import { AppFonts, AppColors } from '@theme';
import  { LoadingIndicator } from '@components' ;

const MAX_LENGTH = 6;

function makeDots(num) {
    let ret = '';
    let number = num;
    while (number > 0) {
        ret += ' ○ ';
        number--;
    }
    return ret;
}

/* Styles ==================================================================== */

const styles = StyleSheet.create({
    row: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    pad: {
        flex: 1,
        marginRight: 20,
        marginLeft: 20,
        marginBottom: 20,
    },
    button: {
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        paddingVertical: 10,
        paddingHorizontal: 35,
        margin: 10,
    },
    buttonText: {
        fontFamily: AppFonts.h2.familyBold,
        color: AppColors.brand.light,
        fontSize: AppFonts.h2.size,
        lineHeight: AppFonts.h2.lineHeight,
        textAlign: 'center',
    },
    buttonTextSecondary: {
        fontFamily: AppFonts.base.familyBold,
        color: AppColors.brand.light,
        fontSize: AppFonts.base.size * 0.80,
        textAlign: 'center',
    },
    pin: {
        fontFamily: AppFonts.base.familyBold,
        color: AppColors.brand.light,
        fontSize: AppFonts.h2.size,
        fontWeight: '500',
    },
    backspaceIcon: {
        tintColor: AppColors.brand.grey,
    },

});

/* Component ==================================================================== */
export default class PinInput extends Component {
    static propTypes = {
        middleText: PropTypes.string,
        onDone: PropTypes.func,
        onSubmit: PropTypes.func,
    };

    static defaultProps = {
        middleText: null,
        wrongCode: false,
        onClear: null
    };

    constructor(props) {
        super(props);

        this.state = {
            value: '',
        };
    }

    componentWillMount() {
        this.shake = new Animated.Value(0);
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.wrongCode) {
            this.shakePIN();
        }
    }

    shakePIN = () => {
        this.shake.setValue(0);
        Animated.spring(this.shake, {
            toValue: 1,
            friction: 100,
            tension: 100,
        }).start(() => {
            this.shake.setValue(0);
        });
    };

    handleClear() {
        this.setState({ value: '' });

        if(this.props.onClear ) {
            this.props.onClear()
        }
    }

    handlePress(num) {
        let { value } = this.state;
        const { lodaing } = this.props

        if (lodaing) return


        value += String(num);

        this.setState({ value });

        if (value.length === MAX_LENGTH) {
            this.props.onSubmit(value);
            this.setState({ value: '' });
        }
    }

    handleRemove = () => {
        const { value } = this.state;
        this.setState({ value: value.substr(0, value.length - 1) });
    };

    renderButton(num, alphabet) {
        return (
            <TouchableOpacity onPress={() => this.handlePress(num)} style={styles.button}>
                <Text style={styles.buttonText}>{num}</Text>
                {!!alphabet &&
                <Text style={styles.buttonTextSecondary}>{alphabet}</Text>
                }
            </TouchableOpacity>
        );
    }

    render() {
        const { value } = this.state;
        const { middleText, loading } = this.props;
        const marks = value.replace(/./g, ' ● ');
        const dots = makeDots(MAX_LENGTH - value.length);
        const animatedStyle = {
            transform: [
                {
                    translateY: this.shake.interpolate({
                        inputRange: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1],
                        outputRange: [0, 10, -15, 12, -9, 18, -7, 10, -11, 5, 0],
                    }),
                },
                {
                    translateX: this.shake.interpolate({
                        inputRange: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1],
                        outputRange: [0, 2, -3, 4, -4, 3, -3, 4, -5, 2, 0],
                    }),
                },
            ],
        };

        return (
            <View style={styles.pad}>
                <View style={styles.row}>
                    {loading ? (
                        <LoadingIndicator color={AppColors.brand.light}/>
                    ) : (
                        <Animated.Text style={[styles.pin, animatedStyle]}>
                            {marks}
                            {dots}
                        </Animated.Text>
                    )}


                </View>

                {!!middleText && (
                    <View style={styles.row}>
                        <Text style={{color: AppColors.brand.light}}>{middleText}</Text>
                    </View>
                )}
                <View style={styles.row}>
                    {this.renderButton(1, '-')}
                    {this.renderButton(2, 'ABC')}
                    {this.renderButton(3, 'DEF')}
                </View>

                <View style={styles.row}>
                    {this.renderButton(4, 'GHI')}
                    {this.renderButton(5, 'JKL')}
                    {this.renderButton(6, 'MNO')}
                </View>

                <View style={styles.row}>
                    {this.renderButton(7, 'PQRS')}
                    {this.renderButton(8, 'TUV')}
                    {this.renderButton(9, 'WXYZ')}
                </View>

                <View style={styles.row}>
                    <TouchableOpacity onPress={() => this.handleClear()} style={styles.button}>
                        <Text style={[styles.buttonText, {fontSize: AppFonts.h2.size}]}>
                            C
                        </Text>
                    </TouchableOpacity>
                    {this.renderButton(0)}
                    <TouchableOpacity onPress={() => this.handleRemove()} style={styles.button}>
                        <Image
                            source={require('../assets/images/backspace.png')}
                            resizeMode="contain"
                            style={styles.backspaceIcon}
                        />
                    </TouchableOpacity>
                </View>
            </View>
        );
    }
}
