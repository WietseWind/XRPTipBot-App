import React, { Component } from 'react';
import { Animated, View, Image, TouchableWithoutFeedback, PixelRatio, Platform } from 'react-native';

import PropTypes from 'prop-types';
import { AppSizes } from '@theme';

export default class AvatarImage extends Component {
    static propTypes = {
        source: Image.propTypes.source,
        network: PropTypes.string,
        imgKey: PropTypes.string,
        size: PropTypes.number,
        onPress: PropTypes.func,
    };

    static defaultProps = {
        size: 36,
        imgKey: null,
        onPress: null,
    };

    constructor(props) {
        super(props);

        this.state = {
            thumbnailOpacity: new Animated.Value(1),
            completelyLoaded: false,
        };
    }

    componentDidMount() {
        Animated.timing(this.state.thumbnailOpacity, {
            toValue: 1,
            duration: 250,
        }).start();
    }

    onLoad() {
        Animated.timing(this.state.thumbnailOpacity, {
            toValue: 0,
            duration: 250,
        }).start();

        this.setState({
            completelyLoaded: true,
        });
    }

    renderNetwork = () => {
        const { network } = this.props;
        let backgroundColor = '#FFF';
        let Icon = null;

        const iconStyle = {
            width: AppSizes.screen.width * 0.025,
            height: AppSizes.screen.width * 0.025,
            tintColor: '#FFF',
        };

        switch (network) {
            case 'twitter':
                Icon = <Image style={iconStyle} source={require('../assets/images/twitter.png')} />;
                backgroundColor = '#1DA1F2';
                break;
            case 'discord':
                Icon = <Image style={iconStyle} source={require('../assets/images/discord.png')} />;
                backgroundColor = '#7289DA';
                break;
            case 'reddit':
                Icon = <Image style={iconStyle} source={require('../assets/images/reddit.png')} />;
                backgroundColor = '#ff4500';
                break;
            case 'internal':
                Icon = (
                    <Image style={iconStyle} resizeMode={'contain'} source={require('../assets/images/tipbot.png')} />
                );
                backgroundColor = '#1DA1F2';
                break;
            case 'coil':
                Icon = (
                    <Image
                        style={[
                            {
                                width: AppSizes.screen.width * 0.04,
                                height: AppSizes.screen.width * 0.04,
                            },
                        ]}
                        resizeMode={'contain'}
                        source={require('../assets/images/coil.png')}
                    />
                );
                break;
        }

        return (
            <View
                style={{
                    width: AppSizes.screen.width * 0.04,
                    height: AppSizes.screen.width * 0.04,
                    backgroundColor: backgroundColor,
                    borderRadius: 20,
                    position: 'absolute',
                    bottom: 0,
                    zIndex: 9999,
                    right: 5,
                    justifyContent: 'center',
                    alignItems: 'center',
                }}
            >
                {Icon}
            </View>
        );
    };

    render() {
        const { completelyLoaded } = this.state;

        return (
            <TouchableWithoutFeedback onPress={this.props.onPress ? this.props.onPress : null} key={this.props.imgKey}>
                <View
                    style={[
                        {
                            alignItems: 'center',
                            flexDirection: 'row',
                        },
                    ]}
                >
                    <View
                        style={{
                            marginRight: 10,
                            borderRadius: PixelRatio.getPixelSizeForLayoutSize(30),
                            zIndex: 1,
                            overflow: 'hidden',
                        }}
                    >
                        <Animated.Image
                            resizeMode="cover"
                            style={{
                                width: AppSizes.screen.width * 0.1,
                                height: AppSizes.screen.width * 0.1,
                                borderRadius: Platform.OS === 'android' ? PixelRatio.getPixelSizeForLayoutSize(30) : 0,
                            }}
                            source={
                                this.props.source ? this.props.source : require('../assets/images/placeholder.user.png')
                            }
                            onLoad={event => this.onLoad(event)}
                        />

                        <Animated.Image
                            resizeMode="cover"
                            style={{
                                position: 'absolute',
                                width: AppSizes.screen.width * 0.1,
                                height: AppSizes.screen.width * 0.1,
                                opacity: this.state.thumbnailOpacity,
                                borderRadius: Platform.OS === 'android' ? PixelRatio.getPixelSizeForLayoutSize(30) : 0,
                            }}
                            source={require('../assets/images/placeholder.user.png')}
                        />
                    </View>

                    {this.renderNetwork()}
                </View>
            </TouchableWithoutFeedback>
        );
    }
}
