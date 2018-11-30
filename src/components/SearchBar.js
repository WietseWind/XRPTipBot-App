import React, { Component } from 'react';
import {StyleSheet, TextInput, View, Image, PixelRatio} from 'react-native';
import PropTypes from 'prop-types';

// Consts and Libs
import { AppStyles, AppColors, AppSizes } from '@theme/';

const styles = StyleSheet.create({
    input: {
        height: AppSizes.screen.width * 0.14,
        paddingHorizontal: 10,
        paddingRight: 30,
        fontSize: AppStyles.h5.fontSize
    },
    icon: {
        tintColor: '#AFBCD8',
        width: AppSizes.screen.width * 0.05,
        height: AppSizes.screen.width * 0.05,
    },
});

// Components
export default class SearchBar extends Component {
    constructor() {
        super();
        this.state = {
            text: '',
        };
    }

    componentDidMount(){
        const { autoFocus } = this.props;
        if(autoFocus){
            setTimeout(() => this.focus() , 250)
        }
    }

    focus = () => {
        this.text.focus()
    };

    render() {
        const { placeHolder, backgroundColor, innerBackground, border, radius, onChangeText, inputStyle } = this.props;
        return (
            <View style={[AppStyles.row, AppStyles.paddingLeftSml, { backgroundColor }]}>
                <View style={[AppStyles.flex1, AppStyles.centerAligned]}>
                    <Image
                        source={require('../assets/images/search.png')}
                        style={styles.icon}
                    />
                </View>
                <View style={AppStyles.flex6}>
                    <TextInput
                        ref={(r) => this.text = r }
                        autoCorrect={false}
                        style={[
                            {...styles.input, ...inputStyle},
                            {
                                backgroundColor: innerBackground,
                                borderRadius: radius,
                                borderWidth: border ? 1 : 0,
                            },

                        ]}
                        onChangeText={text => {
                            this.setState({ text });
                            onChangeText(text);
                        }}
                        value={this.state.text}
                        placeholder={placeHolder}
                        placeholderTextColor="#9197A3"
                        selectionColor={'#3E77E6'}
                        underlineColorAndroid="rgba(0,0,0,0)"
                    />
                </View>
            </View>
        );
    }
}
SearchBar.defaultProps = {
    placeHolder: 'SearchBar messages',
    backgroundColor: "#F7F9FE",
    innerBackground: "#F7F9FE",
    radius: 5,
    border: false,
    onChangeText: null,
    autoFocus: false
};
SearchBar.propTypes = {
    onChangeText: PropTypes.func,
    placeHolder: PropTypes.string,
    backgroundColor: PropTypes.string,
    innerBackground: PropTypes.string,
    radius: PropTypes.number,
    borderColor: PropTypes.string,
    border: PropTypes.bool,
    iconColor: PropTypes.string,
};
