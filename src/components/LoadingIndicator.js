import React from 'react';
import PropTypes from 'prop-types';

import { ActivityIndicator, ViewPropTypes, Platform } from 'react-native';

const LoadingIndicator = ({ style, color, size }) => (
    <ActivityIndicator size={size} animating color={color} style={style} />
);

LoadingIndicator.propTypes = {
    style: ViewPropTypes.style,
    color: PropTypes.string,
    size: PropTypes.string,
};

LoadingIndicator.defaultProps = {
    color: '#3D7CD2',
    size: 'small',
    style: {
        paddingVertical: 20,
    },
};

export default LoadingIndicator;
