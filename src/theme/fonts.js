/**
 * App Theme - Fonts
 */
import { Platform } from 'react-native';

import Sizes from './sizes';

const guidelineBaseWidth = 350;

const scale = size => Sizes.screen.width / guidelineBaseWidth * size;

const base = {
    size: scale(13),
    lineHeight: scale(25),
    ...Platform.select({
        ios: {
            family: 'System',
            familyBold: 'System',
        },
        android: {
            family: 'Roboto',
            familyBold: 'Roboto',
        },
    }),
};

export default {
    base: { ...base },
    subtext: { size: scale(10), family: base.family },
    p: { ...base, size: scale(17), family: base.family },
    h1: { ...base, size: scale(35), lineHeight: scale(35), family: base.familyBold },
    h2: { ...base, size: scale(30),  lineHeight: scale(30), family: base.familyBold },
    h3: { ...base, size: scale(25), lineHeight: scale(25),family: base.familyBold },
    h4: { ...base, size: scale(20), lineHeight: scale(20), family: base.familyBold },
    h5: { ...base, size: scale(15), family: base.familyBold },
    scale
};
