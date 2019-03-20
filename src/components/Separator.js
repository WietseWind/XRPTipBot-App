import React from 'react';
import { StyleSheet, View, ViewPropTypes } from 'react-native';

const Separator = ({ style }) => <View style={[styles.container, style]} />;

Separator.propTyes = {
    style: ViewPropTypes.style,
};

const styles = StyleSheet.create({
    container: {
        height: 0.5,
        backgroundColor: 'grey',
    },
});

export default Separator;
