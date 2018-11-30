import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Keyboard, StyleSheet, TouchableOpacity, Text, Animated, Platform} from 'react-native';

// Consts and Libs
import { AppStyles, AppColors, AppFonts, AppSizes } from '@theme/';

// Components
import { Spacer } from '@components/';

/* Style ==================================================================== */
const styles = StyleSheet.create({
    buttonTry: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: AppColors.brand.grey,
        padding: 5,
        height: AppSizes.screen.height * 0.06,
        width: AppSizes.screen.width * 0.50,
        borderRadius: AppSizes.screen.width * 0.70 * AppSizes.screen.height * 0.10
    },
    buttonTryText: {
        fontFamily: AppFonts.h5.family,
        fontSize: AppFonts.h5.size,
        fontWeight: 'bold',
        color: 'white',
        backgroundColor: 'transparent'
    },
    icon: {
        tintColor: '#fff',
    },
});


export default class Error extends Component {

    constructor(props){
        super(props);

        this.state = {
            KeyboardShow:false,
            KeyboardHeight: 0
        }
        this.fromBottom = new Animated.Value(0)
    }

    static propTypes = {
        text: PropTypes.string,
        action: PropTypes.func,
        actionText: PropTypes.string,
    };

    static defaultProps = {
        text: "Error",
        action: null,
        actionText: null
    };

    _pushUP = () => {
        const { KeyboardHeight } = this.props ;
        Animated.spring(this.fromBottom , {
            toValue: KeyboardHeight,
            friction: 7,
            tension: 40,
        }).start()
    };


    _pushDown = () => {
        Animated.spring(this.fromBottom , {
            toValue: 0
        }).start()
    };



    static getDerivedStateFromProps(nextProps, prevState){
        if (nextProps.keyboardShow && !prevState.KeyboardShow ) {
            // this._pushUP();
            return {
                KeyboardShow: nextProps.KeyboardShow,
            };
        }
        else return null;
    }


    render(){
        const {text,action, actionText,keyboardShow, alterText } = this.props ;

        if(keyboardShow){
            this._pushUP()
        }else{
            this._pushDown()
        }

        return(
            <Animated.View style={[AppStyles.container,AppStyles.flex1 ,AppStyles.centerAligned, { paddingBottom: this.fromBottom}]}>

                <Text style={[AppStyles.baseText, AppStyles.textCenterAligned, { color: AppColors.textSecondary }]}>
                    {text}
                </Text>

                <Spacer size={30} />

                {!!action && (
                    <TouchableOpacity style={styles.buttonTry} onPress={action} activeOpacity={1}>
                        <Text style={[styles.buttonTryText]}>{actionText}</Text>
                    </TouchableOpacity>
                )}

                <Spacer size={30} />

                {!!alterText &&
                <Text style={[AppStyles.baseText, AppStyles.textCenterAligned, { color: AppColors.textSecondary }]}>
                    {alterText}
                </Text>
                }
            </Animated.View>
        )
    }



}