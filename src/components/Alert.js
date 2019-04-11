/* eslint-disable */
import React, { Component } from 'react';
import { Animated, TouchableOpacity, ViewPropTypes } from 'react-native';

import PropTypes from 'prop-types';

import RootSiblings from 'react-native-root-siblings';

import { AppFonts, AppSizes } from '@theme/';

const BAR_HEIGHT = AppSizes.screen.height * 0.05;
let BACKGROUND_COLOR = '#3DD84C';
let TOUCHABLE_BACKGROUND_COLOR = '#3DD84C';
const SLIDE_DURATION = 300;
const ACTIVE_OPACITY = 0.6;
const SATURATION = 0.9;

const durations = {
    LONG: 3500,
    SHORT: 2000,
};

const types = {
    ERROR: 'error',
    SUCCESS: 'success',
    INFO: 'info',
};

const styles = {
    view: {
        height: BAR_HEIGHT * 2,
        bottom: 0,
        right: 0,
        left: 0,
        position: 'absolute',
    },
    touchableOpacity: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    text: {
        height: BAR_HEIGHT,
        marginBottom: BAR_HEIGHT / 3,
        fontFamily: AppFonts.base.family,
        fontSize: AppFonts.base.size,
        textAlign: 'center',
        color: 'white',
    },
};

function saturate(color, percent) {
    let R = parseInt(color.substring(1, 3), 16);
    let G = parseInt(color.substring(3, 5), 16);
    let B = parseInt(color.substring(5, 7), 16);
    R = parseInt(R * percent);
    G = parseInt(G * percent);
    B = parseInt(B * percent);
    R = R < 255 ? R : 255;
    G = G < 255 ? G : 255;
    B = B < 255 ? B : 255;
    const r = R.toString(16).length === 1 ? `0${R.toString(16)}` : R.toString(16);
    const g = G.toString(16).length === 1 ? `0${G.toString(16)}` : G.toString(16);
    const b = B.toString(16).length === 1 ? `0${B.toString(16)}` : B.toString(16);
    return `#${r + g + b}`;
}

// Todo: Move component to another file
class AlertContainer extends Component {
    static propTypes = {
        ...ViewPropTypes,
        duration: PropTypes.number,
        delay: PropTypes.number,
        visible: PropTypes.bool,
        type: PropTypes.string,
    };

    static defaultProps = {
        visible: false,
        duration: durations.LONG,
        type: types.SUCCESS,
    };

    constructor(props) {
        super(props);

        this.state = {
            visible: this.props.visible,
            height: new Animated.Value(0),
            opacity: new Animated.Value(0),
            progress: new Animated.Value(0),
        };

        this.timer = null;
    }

    componentDidMount() {
        if (this.state.visible) {
            this._showTimeout = setTimeout(() => this._show(), this.props.delay);
        }
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        if (nextProps.visible !== prevState.visible) {
            if (nextProps.visible) {
                clearTimeout(this._showTimeout);
                clearTimeout(this._hideTimeout);
                this._showTimeout = setTimeout(() => this._show(), nextProps.delay);
            } else {
                this._hide();
            }
            return {
                visible: nextProps.visible,
            };
        } else return null;
    }

    componentWillUnmount() {
        this._hide();
    }

    shouldComponentUpdate = (nextProps, nextState) => this.state.visible !== nextState.visible;

    _animating = false;
    _root = null;
    _hideTimeout = null;
    _showTimeout = null;

    _show = () => {
        clearTimeout(this._showTimeout);
        if (!this._animating) {
            clearTimeout(this._hideTimeout);
            this._animating = true;
            if (this._root) {
                this._root.setNativeProps({
                    pointerEvents: 'auto',
                });
            }

            requestAnimationFrame(() => {
                Animated.parallel([
                    Animated.timing(this.state.height, {
                        toValue: BAR_HEIGHT * 2,
                        duration: SLIDE_DURATION,
                    }),
                    Animated.timing(this.state.opacity, {
                        toValue: 1,
                        duration: SLIDE_DURATION,
                    }),
                ]).start(({ finished }) => {
                    if (finished) {
                        this._animating = !finished;
                        if (this.props.duration > 0) {
                            this._hideTimeout = setTimeout(() => this._hide(), this.props.duration);
                        }
                    }
                });
            });

            Animated.timing(this.state.progress, {
                toValue: AppSizes.screen.width,
                duration: this.props.duration,
            }).start();
        }
    };

    _hide = () => {
        clearTimeout(this._showTimeout);
        clearTimeout(this._hideTimeout);
        if (!this._animating) {
            if (this._root) {
                this._root.setNativeProps({
                    pointerEvents: 'auto',
                });
            }

            requestAnimationFrame(() => {
                Animated.parallel([
                    Animated.timing(this.state.height, {
                        toValue: 0,
                        duration: SLIDE_DURATION,
                    }),
                    Animated.timing(this.state.opacity, {
                        toValue: 0,
                        duration: SLIDE_DURATION,
                    }),
                ]).start(({ finished }) => {
                    if (finished) {
                        this._animating = false;
                        this.props.instance.destroy();
                    }
                });
            });
        }
    };

    render() {
        const { props } = this;
        const alertType = props.type;

        if (alertType === 'error') {
            BACKGROUND_COLOR = '#C02827';
            TOUCHABLE_BACKGROUND_COLOR = '#FB6567';
        } else if (alertType === 'success') {
            BACKGROUND_COLOR = '#3CC29E';
            TOUCHABLE_BACKGROUND_COLOR = '#59DC9A';
        } else if (alertType === 'info') {
            BACKGROUND_COLOR = '#3b6976';
            TOUCHABLE_BACKGROUND_COLOR = '#8EDBE5';
        }
        return this.state.visible || this._animating ? (
            <Animated.View
                style={[
                    styles.view,
                    {
                        height: this.state.height,
                        opacity: this.state.opacity,
                        backgroundColor: saturate(BACKGROUND_COLOR, SATURATION),
                    },
                ]}
                pointerEvents="none"
                ref={ele => {
                    this._root = ele;
                }}
            >
                <TouchableOpacity
                    style={[
                        styles.touchableOpacity,
                        {
                            backgroundColor: saturate(TOUCHABLE_BACKGROUND_COLOR, SATURATION),
                        },
                    ]}
                    onPress={this._hide}
                    activeOpacity={ACTIVE_OPACITY}
                >
                    <Animated.Text
                        style={[
                            styles.text,
                            {
                                color: styles.text.color,
                                opacity: 1,
                            },
                        ]}
                        allowFontScaling={false}
                    >
                        {this.props.children}
                    </Animated.Text>
                    <Animated.View
                        style={{
                            height: 10,
                            backgroundColor: 'black',
                            opacity: 0.5,
                            width: this.state.progress,
                        }}
                    />
                </TouchableOpacity>
            </Animated.View>
        ) : null;
    }
}

class Alert extends Component {
    static displayName = 'Alert';
    static propTypes = AlertContainer.propTypes;
    static types = types;
    static durations = durations;
    _alert = null;

    static show = (message, options = { type: types.SUCCESS, duration: durations.LONG }) => {
        this._alert = new RootSiblings();

        this._alert.update(
            <AlertContainer {...options} visible instance={this._alert}>
                {message}
            </AlertContainer>,
        );

        return this._alert;
    };

    static hide = alert => {
        if (alert instanceof RootSiblings) {
            alert.destroy();
        } else {
            console.warn('Alert.hide expected a `RootSiblings` instance as argument.');
        }
    };

    componentWillUnmount() {
        this._alert.destroy();
    }

    render() {
        return null;
    }
}

export default Alert;
