import { PermissionsAndroid, Platform } from 'react-native';

export const requestLocationPermission = () => {
    return new Promise((resolve, reject) => {
        if (Platform.OS === 'android' && Platform.Version >= 23) {
            PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION)
                .then(granted => {
                    if (granted) {
                        return resolve(granted);
                    } else
                        PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION, {
                            title: 'Location Permission',
                            message:
                                'XRPTipBot needs access to your location ' + 'so you can use nearby discovery feature.',
                            buttonPositive: 'Ok',
                        }).then(granted => {
                            if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                                return resolve(true);
                            } else {
                                return reject('User refuse ACCESS_COARSE_LOCATION permission!');
                            }
                        });
                })
                .catch(err => reject(err));
        } else {
            return resolve(true);
        }
    });
};

export const requestExternalStoragePermission = () => {
    return new Promise(async (resolve, reject) => {
        if (Platform.OS === 'android') {
            PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE).then(granted => {
                if (granted) {
                    return resolve(granted);
                } else
                    PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE, {
                        title: 'Storage Permission',
                        message: 'XRPTipBot needs access to your storage so you can save the QRCode',
                        buttonPositive: 'Ok',
                    }).then(granted => {
                        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                            return resolve(true);
                        } else {
                            return reject('User refuse WRITE_EXTERNAL_STORAGE permission!');
                        }
                    });
            });
        } else {
            resolve(true);
        }
    });
};
