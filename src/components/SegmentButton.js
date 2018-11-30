import PropTypes from 'prop-types';
import React from 'react';
import {
    View,
    Text as NativeText,
    Text,
    Image,
    StyleSheet,
    ViewPropTypes,
    TouchableHighlight,
    Platform
} from 'react-native';

import {AppColors, AppSizes, AppFonts} from '@theme/';

const ButtonGroup = (props) => {
    const {
        component,
        buttons,
        onPress,
        selectedIndex,
        containerStyle,
        innerBorderStyle,
        lastBorderStyle,
        buttonStyle,
        textStyle,
        selectedTextStyle,
        selectedBackgroundColor,
        underlayColor,
        activeOpacity,
        onHideUnderlay,
        onShowUnderlay,
        setOpacityTo,
        containerBorderRadius,
        ...attributes
    } = props;

    const Component = component || TouchableHighlight;

    return (
        <View
            style={[styles.container, containerStyle && containerStyle]}
            {...attributes}
        >
            {buttons.map((button, i) => (
                <Component
                    activeOpacity={activeOpacity}
                    setOpacityTo={setOpacityTo}
                    onHideUnderlay={onHideUnderlay}
                    onShowUnderlay={onShowUnderlay}
                    underlayColor={underlayColor || '#ffffff'}
                    onPress={onPress ? () => onPress(i) : () => {}}
                    key={i}
                    style={[
                        styles.button,
                        i < buttons.length - 1 && {
                            borderRightWidth: (innerBorderStyle &&
                                innerBorderStyle.width) ||
                                1,
                            borderRightColor: (innerBorderStyle &&
                                innerBorderStyle.color) ||
                                AppColors.segmentButton.borderColor
                        },
                        i === buttons.length - 1 && {
                            ...lastBorderStyle,
                            borderTopRightRadius: containerBorderRadius || 3,
                            borderBottomRightRadius: containerBorderRadius || 3
                        },
                        i === 0 && {
                            borderTopLeftRadius: containerBorderRadius || 3,
                            borderBottomLeftRadius: containerBorderRadius || 3
                        },
                        selectedIndex === i && {
                            backgroundColor: selectedBackgroundColor || AppColors.segmentButton.selectedBackground
                        }
                    ]}
                >
                    <View style={[styles.textContainer, buttonStyle && buttonStyle]}>
                        <View style={{flex: 1,  justifyContent: 'center',
                            alignItems: 'center',}}>
                        {button === 'Send' ? (
                            <Image style={styles.qrInlineIcon} resizeMode={'stretch'} source={{uri: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADcAAABGCAYAAABopQwiAAAABGdBTUEAALGPC/xhBQAAAdZJREFUaAXt2L1OwzAQB/AzSRcqFngAGHiQrvQVWJiQGCPxGIiMSKhDF16hLAzMPAMDPABTxRRFwUG04sNNz/bZvoTrUik5n/37Xyu1URDpVZY3RxXAfARwVhQXLzG2VTE2+YI9NgCHesNXDZzEAAbHfYetgowFDIozwWICg+G6YLGAQXAYWAwgOc4GFhpIinOBhQSS4XxgoYAkOApYCKA3jhJGDfTChYBRAp1xIWFUQCdcDBgF0BoXE+YLtMKlgPkA0biUMFcgCscB5gLciuMEswV24jjCbIAbcZxhWKAR1wcYBvgH1yfYNuAPXB9hXcA1rs+wTcBP3BBgJqAaEuw3MNePuCf6SfB8dcPmXYE6bqA5tVljU6v73+n+zzZr2lrtgda1/s7ZNmjrr8rbkxrqhctazJoMsullcX6PqTXV7JguDuWa4Po6SZmcTI5hAvKxZDgU1JFkcqiYGBbJ5BgOBXUkmRwqJoZFMjmGQ0EdSSaHiolhkUyO4VBQR5LJoWJiWJT7nGlvt3l4z0YHPj261o7retl1X+5JApKAJCAJUCSgrmezfYpGHHvk1bJ643gwijPJzy+KFFP0kMmlSJ1iT5kcRYopeui/POopxcaypyTwTxP4ABki8qImwPJVAAAAAElFTkSuQmCC\n'}}/>
                        ) : (
                            <Image style={styles.qrInlineIcon} resizeMode={'stretch'} source={{uri: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADcAAABGCAYAAABopQwiAAAABGdBTUEAALGPC/xhBQAAAcxJREFUaAXt2jtOxDAQBmAPMRyAhjPALbaEAyAuAKKNxC1ARNCAYA+wJ4CSnhYJzrAFFR0hmGQlEJCNM37u2JqU8diab/5UVkA4PGfVzW4jmjuHI7RbC1HsnZRH99oizeKaZi35JcalGiEnx8kRnAB/lgRDQbXEyaHGRLCIkyMYCqolTg41JoJFnBzBUFAtcXKoMREs4uQIhoJqiZNDjYlgEZxeXO0rAVtWvSmxo5Q6ttqL2AQA1wLEM6K0VwJCzaX8lE/v0FwKpeyAvWP9vVgMTlmcBzBfV3IC3daqut1ugQ8Ugca0FrahiklZHr4scNkAf8E60w8ueeA/WA+XLHAJbCkuOeAAbBCXDFAD0+LIA0dgoziyQAQMhSMHRMLQODJAA5gRbuVAQ5gxbmVAC5gVLjrQEmaNiwZ0gDnhggMdYc64YEAPMC8470BPMG84b0CPMK84Z6BnmHecNTAALAjOGBgIFgyHBgaEBcWNAgPDguMGgRFgUXA9YCRYNNw3sIaPWXsTfNBdmHbvsnra6/E/96RZ4RjDE+AJ8ASSnQCcT6ebyXY/0ris3+rXkZpkl/lXjVSj4+Q4OYITyPqzlO3fGo8Eh84t8QRyncAXjB9EAVZ04n8AAAAASUVORK5CYII=\n'}}/>
                        )

                        }

                        </View>


                        <View style={{        flex:2,
                            alignItems: 'flex-start',}}>

                        {button.element
                            ? <button.element />
                            : <Text
                                style={[
                                    styles.buttonText,
                                    textStyle && textStyle,
                                    selectedIndex === i && {color: AppColors.segmentButton.selectedTextColor},
                                    selectedIndex === i && selectedTextStyle
                                ]}
                            >
                                {button}
                            </Text>}
                        </View>
                    </View>
                </Component>
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    button: {
        flex: 1
    },
    textContainer: {
        flexDirection: 'row',
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingLeft: 10
    },
    container: {
        marginLeft: 10,
        marginRight: 10,
        marginBottom: 5,
        marginTop: 5,
        borderColor: AppColors.segmentButton.borderColor,
        borderWidth: 1,
        flexDirection: 'row',
        borderRadius: 40,
        overflow: 'hidden',
        backgroundColor: AppColors.segmentButton.background,
        height: AppSizes.screen.height * 0.06
    },
    buttonText: {
        textAlign:'left',
        fontSize: AppFonts.base.size,
        color: AppColors.segmentButton.textColor,
        ...Platform.select({
            ios: {
                fontWeight: '500'
            }
        })
    },
    qrInlineIcon: {
        width: AppSizes.screen.width * 0.03,
        height: AppSizes.screen.width * 0.04,
        opacity: 0.8
    },
});

ButtonGroup.propTypes = {
    button: PropTypes.object,
    component: PropTypes.any,
    onPress: PropTypes.func,
    buttons: PropTypes.array,
    containerStyle: ViewPropTypes.style,
    textStyle: NativeText.propTypes.style,
    selectedTextStyle: NativeText.propTypes.style,
    underlayColor: PropTypes.string,
    selectedIndex: PropTypes.number,
    activeOpacity: PropTypes.number,
    onHideUnderlay: PropTypes.func,
    onShowUnderlay: PropTypes.func,
    setOpacityTo: PropTypes.any,
    innerBorderStyle: PropTypes.shape({
        color: PropTypes.string,
        width: PropTypes.number
    }),
    lastBorderStyle: PropTypes.oneOfType([
        ViewPropTypes.style,
        NativeText.propTypes.style
    ]),
    buttonStyle: ViewPropTypes.style,
    selectedBackgroundColor: PropTypes.string,
    containerBorderRadius: PropTypes.number
};

export default ButtonGroup;