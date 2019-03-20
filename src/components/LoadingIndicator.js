import React from 'react';
import PropTypes from 'prop-types';

import { ActivityIndicator, ViewPropTypes } from 'react-native';

const LoadingIndicator = ({ style, color }) => (
    <ActivityIndicator size="small" animating color={color} style={{ paddingVertical: 20 }} />
);

LoadingIndicator.propTypes = {
    style: ViewPropTypes.style,
    color: PropTypes.string,
};

LoadingIndicator.defaultProps = {
    color: '#3D7CD2',
};

export default LoadingIndicator;
