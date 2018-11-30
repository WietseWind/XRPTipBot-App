/**
 * App Theme - Colors
 */

const app = {
    background: '#ffffff',
};

const brand = {
    brand: {
        primary: '#3E77E6', // Blue
        secondary: '#2E3542', // Dark
        green: '#41E196',
        red: '#F75858',
        grey: '#AFBDD8',
        light: '#ECF1FD'
    },
};

const text = {
    textPrimary: brand.brand.secondary,
    textSecondary: brand.brand.grey
};

const buttons = {
    buttonPrimary: '#0896d6',
    buttonSecondary: 'transparent',
};

const borders = {
    border: '#dedfe3',
    buttonPrimaryBorder: '#0896d6',
    buttonSecondaryBorder: '#0896d6',
};

const segment = {
    segmentButton: {
        selectedTextColor: '#516EC9',
        textColor: '#898F97',
        background: '#FCFCFA',
        selectedBackground: '#AFBCD8',
        borderColor: '#516EC9',
    },
};

export default {
    ...app,
    ...brand,
    ...text,
    ...buttons,
    ...borders,
    ...segment,
};
