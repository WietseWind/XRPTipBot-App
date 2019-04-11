/**
 * App Styles
 */

import Colors from './colors';
import Fonts from './fonts';
import Sizes from './sizes';

export default {
    // App style
    appStyle: {
        topBarElevationShadowEnabled: false,
        screenBackgroundColor: Colors.background,
        navBarTitleTextCentered: true,
        navBarBackgroundColor: Colors.brand.primary,
        tabFontSize: Fonts.h1.size,
        orientation: 'portrait',
        navBarButtonColor: '#ffffff',
        navBarTextColor: '#ffffff',
        statusBarColor: '#4476f4',
    },
    // Tabbar styles
    tabsStyle: {
        tabBarBackgroundColor: '#FFF',
        tabBarButtonColor: Colors.brand.grey,
        tabBarHideShadow: false,
        tabBarSelectedButtonColor: Colors.brand.primary,
        tabFontFamily: Fonts.base.familyBold,
        tabFontSize: Fonts.h1.size,
        navBarTextFontFamily: Fonts.base.familyBold,
        initialTabIndex: 1,
    },
    // Default
    container: {
        position: 'relative',
        flex: 1,
        flexDirection: 'column',
        backgroundColor: Colors.background,
    },
    containerCentered: {
        justifyContent: 'center',
    },
    windowSize: {
        height: Sizes.screen.height,
        width: Sizes.screen.width,
    },

    // Aligning items
    leftAligned: {
        alignItems: 'flex-start',
    },
    centerAligned: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    rightAligned: {
        alignItems: 'flex-end',
    },

    // Text Styles
    baseText: {
        color: Colors.textPrimary,
        fontFamily: Fonts.base.family,
        fontSize: Fonts.base.size,
    },
    p: {
        fontFamily: Fonts.p.family,
        fontSize: Fonts.p.size,
        lineHeight: Fonts.p.lineHeight,
        color: Colors.textPrimary,
        marginBottom: 8,
    },
    h1: {
        fontFamily: Fonts.h1.family,
        fontSize: Fonts.h1.size,
        lineHeight: Fonts.h1.lineHeight,
        color: Colors.textPrimary,
        margin: 0,
        marginBottom: 4,
        left: 0,
        right: 0,
    },
    h2: {
        fontFamily: Fonts.h2.family,
        fontSize: Fonts.h2.size,
        lineHeight: Fonts.h2.lineHeight,
        color: Colors.textPrimary,
        margin: 0,
        marginBottom: 4,
        left: 0,
        right: 0,
    },
    h3: {
        fontFamily: Fonts.h3.family,
        fontSize: Fonts.h3.size,
        color: Colors.textPrimary,
        lineHeight: Fonts.h3.lineHeight,
        margin: 0,
        marginBottom: 4,
        left: 0,
        right: 0,
    },
    h4: {
        fontFamily: Fonts.h4.family,
        fontSize: Fonts.h4.size,
        color: Colors.textPrimary,
        lineHeight: Fonts.h4.lineHeight,
        margin: 0,
        marginBottom: 4,
        left: 0,
        right: 0,
    },
    h5: {
        fontFamily: Fonts.h5.family,
        fontSize: Fonts.h5.size,
        lineHeight: Fonts.h5.lineHeight,
        color: Colors.textPrimary,
        margin: 0,
        marginTop: 4,
        marginBottom: 4,
        left: 0,
        right: 0,
    },
    strong: {
        fontWeight: '600',
    },
    link: {
        textDecorationLine: 'underline',
    },
    subtext: {
        fontFamily: Fonts.subtext.family,
        fontSize: Fonts.subtext.size,
        lineHeight: Fonts.subtext.lineHeight,
        color: Colors.textSecondary,
    },

    // Helper Text Styles
    textLeftAligned: {
        textAlign: 'left',
    },
    textCenterAligned: {
        textAlign: 'center',
    },
    textRightAligned: {
        textAlign: 'right',
    },

    // Give me padding
    padding: {
        paddingVertical: Sizes.padding,
        paddingHorizontal: Sizes.padding,
    },
    paddingHorizontal: {
        paddingHorizontal: Sizes.padding,
    },
    paddingLeft: {
        paddingLeft: Sizes.padding,
    },
    paddingRight: {
        paddingRight: Sizes.padding,
    },
    paddingVertical: {
        paddingVertical: Sizes.padding,
    },
    paddingTop: {
        paddingTop: Sizes.padding,
    },
    paddingBottom: {
        paddingBottom: Sizes.padding,
    },
    paddingSml: {
        paddingVertical: Sizes.paddingSml,
        paddingHorizontal: Sizes.paddingSml,
    },
    paddingHorizontalSml: {
        paddingHorizontal: Sizes.paddingSml,
    },
    paddingLeftSml: {
        paddingLeft: Sizes.paddingSml,
    },
    paddingRightSml: {
        paddingRight: Sizes.paddingSml,
    },
    paddingVerticalSml: {
        paddingVertical: Sizes.paddingSml,
    },
    paddingTopSml: {
        paddingTop: Sizes.paddingSml,
    },
    paddingBottomSml: {
        paddingBottom: Sizes.paddingSml,
    },

    // General HTML-like Elements
    hr: {
        left: 0,
        right: 0,
        borderBottomWidth: 1,
        borderBottomColor: '#cbd9dc',
        height: 1,
        backgroundColor: 'transparent',
    },

    // Grid
    row: {
        left: 0,
        right: 0,
        flexDirection: 'row',
    },
    flex1: {
        flex: 1,
    },
    flex2: {
        flex: 2,
    },
    flex3: {
        flex: 3,
    },
    flex4: {
        flex: 4,
    },
    flex5: {
        flex: 5,
    },
    flex6: {
        flex: 6,
    },

    // Button
    primaryButtonStyle: {
        borderColor: Colors.buttonPrimaryBorder,
        backgroundColor: Colors.buttonPrimary,
    },

    secondaryButtonStyle: {
        borderColor: Colors.buttonSecondaryBorder,
        backgroundColor: Colors.buttonSecondary,
    },

    // Others
    overlayHeader: {
        flex: 1,
        flexDirection: 'row',
        position: 'absolute',
        zIndex: 2,
        top: 0,
        left: 0,
        width: Sizes.screen.width,
        padding: 10,
    },
};
