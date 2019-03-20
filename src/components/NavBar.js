import React, { PureComponent } from 'react';
import { StyleSheet, Alert, Platform, TouchableWithoutFeedback, View, Animated } from 'react-native';

const DOUBLE_PRESS_DELAY = 300;
const VERSION = '1.4.1';

export default class NavBar extends PureComponent {
    constructor(props) {
        super(props);
        this.fadeIn = new Animated.Value(0);
    }

    componentDidMount() {
        Animated.timing(this.fadeIn, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
        }).start();
    }

    handleLogoPress = () => {
        const now = new Date().getTime();

        if (this.lastImagePress && now - this.lastImagePress < DOUBLE_PRESS_DELAY) {
            delete this.lastImagePress;
            this.handleLogoDoublePress();
        } else {
            this.lastImagePress = now;
        }
    };

    handleLogoDoublePress = () => {
        Alert.alert('Version', `XRPTipBot ${VERSION} Latest`);
    };

    render() {
        return (
            <View style={styles.container}>
                <TouchableWithoutFeedback onPress={this.handleLogoPress}>
                    <Animated.Image style={{ opacity: this.fadeIn }} source={require('../assets/images/logo.png')} />
                </TouchableWithoutFeedback>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'transparent',
        paddingLeft: Platform.OS === 'android' ? 40 : 0,
    },
});
