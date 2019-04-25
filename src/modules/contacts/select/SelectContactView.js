import React, { Component } from 'react';

import _ from 'lodash';

import {
    View,
    Text,
    StyleSheet,
    TouchableHighlight,
    SectionList,
    Keyboard,
    Platform,
    PermissionsAndroid,
    Alert as NativeAlert,
    InteractionManager,
} from 'react-native';

// Consts and Libs
import { AppStyles, AppColors, AppFonts, AppSizes } from '@theme/';

import { SearchBar, Error, Alert, Avatar, LoadingIndicator } from '@components/';

import Discovery from 'react-native-discovery';

import { requestLocationPermission } from '@libs/utils';

/* Component ==================================================================== */
const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
    },
    name: {
        fontSize: AppStyles.baseText.fontSize,
        fontWeight: Platform.OS === 'ios' ? '500' : '400',
        color: AppColors.textPrimary,
    },
    sectionHeaderText: {
        fontSize: AppFonts.base.size,
        fontFamily: AppFonts.familyBold,
        fontWeight: '400',
        paddingLeft: 8,
        color: '#696969',
    },
});

/* Component ==================================================================== */
class SelectContactView extends Component {
    static componentName = 'ContactsView';

    static navigatorStyle = {
        navBarButtonColor: '#FFFFFF',
        statusBarTextColorScheme: 'light',
        drawUnderTabBar: true,
        tabBarHidden: Platform.OS !== 'ios',
    };

    constructor(props) {
        super(props);
        this.state = {
            dataSource: [],
            lookUpResult: [],
            discoveredUsers: [],
            filteredDiscoveredUsers: [],
            contacts: props.accountState.contacts || [],
            lookingUp: false,
            searchText: '',
            keyboardShow: false,
            KeyboardHeight: 0,
        };

        this.lookupTimeout = null;
        this.shouldClearList = false;
        this.searched = false;
    }

    componentDidMount() {
        this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', this._keyboardDidShow);
        this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', this._keyboardDidHide);

        const { accountState } = this.props;

        const contacts = accountState.contacts || [];
        if (_.isEmpty(contacts)) {
            this.searchBar.focus();
        }

        this.updateDataSource();

        this.discoverNearby();
    }

    componentWillUnmount() {
        this.keyboardDidShowListener.remove();
        this.keyboardDidHideListener.remove();

        Discovery.setShouldDiscover(false).catch(() => {});
        Discovery.removeListener('discoveredUsers', this.handleDiscover);
    }

    _keyboardDidHide = () => {
        this.setState({
            keyboardShow: false,
        });
    };

    _keyboardDidShow = event => {
        this.setState({
            keyboardShow: true,
            KeyboardHeight: event.endCoordinates.height,
        });
    };

    showLocationAlert = permRequest => {
        const { accountState, saveSettings } = this.props;
        if (accountState.locationAlert === undefined || accountState.locationAlert) {
            NativeAlert.alert(
                'Nearby user discovery',
                'To find other TipBot users around you, you need to have Location Services turned on, and grant the Location Services to the TipBot app.',
                [
                    {
                        text: 'Ok',
                        onPress: () => {
                            PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION, {
                                title: 'Location Permission',
                                message:
                                    'XRPTipBot needs access to your location ' +
                                    'so you can use nearby discovery feature.',
                                buttonPositive: 'Ok',
                            });
                        },
                        style: 'default',
                    },
                    {
                        text: "Don't remind me",
                        onPress: () => saveSettings('locationAlert', false),
                        style: 'destructive',
                    },
                ],
            );
        }
    };

    discoverNearby = () => {
        // run with delay
        setTimeout(() => {
            if (Platform.OS === 'android') {
                PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION)
                    .then(granted => {
                        if (granted) {
                            Discovery.isLocationEnabled()
                                .then(status => {
                                    if (!status) {
                                        this.showLocationAlert(false);
                                    }
                                })
                                .catch(() => {});
                        } else {
                            this.showLocationAlert(true);
                        }
                    })
                    .catch(err => console.log(err));
            }

            // enable discovering
            Discovery.setShouldDiscover(true).catch(() => {});
            Discovery.on('discoveredUsers', this.handleDiscover);
        }, 1000);
    };

    updateDataSource = () => {
        const { accountState } = this.props;
        const { lookUpResult, discoveredUsers, filteredDiscoveredUsers, contacts, searchText } = this.state;

        let dataSource = [
            { title: 'Contacts', data: contacts || [] },
            { title: 'Search results', data: lookUpResult || [] },
        ];

        if (searchText && searchText.length > 0) {
            dataSource.splice(0, 0, { title: 'Nearby', data: filteredDiscoveredUsers });
        } else {
            dataSource.splice(0, 0, { title: 'Nearby', data: discoveredUsers || [] });
        }

        dataSource = _.remove(dataSource, function(n) {
            return !_.isEmpty(n.data);
        });

        this.setState({
            dataSource,
        });
    };

    handleDiscover = data => {
        const { discoveredUsers } = this.state;
        const { lookupUsers, accountState } = this.props;

        if (data.users.length > 0) {
            let uuids = [];
            let uuidv4s = [];
            data.users.forEach(u => {
                if (u.uuid.toLowerCase() !== accountState.uuidv4) {
                    uuids.push(u.uuid.toLowerCase());
                    uuidv4s.push({ uuidv4: u.uuid.toLowerCase() });
                }
            });

            const diff = _.differenceBy(uuidv4s, discoveredUsers, 'uuidv4');

            if (diff.length > 0) {
                lookupUsers(uuids).then(res => {
                    let { data } = res;
                    this.setState({
                        discoveredUsers: data || [],
                    });

                    this.updateDataSource();
                });
            }
        } else {
            this.setState({
                discoveredUsers: [],
            });

            this.updateDataSource();
        }
    };

    onItemPress = item => {
        this.props.navigator.pop();
        this.props.onSuccessRead({
            sendTo: item,
        });
    };

    renderSectionHeader = ({ section: { title } }) => {
        return (
            <View style={{ backgroundColor: '#f6f6f6', padding: 6 }}>
                <Text style={styles.sectionHeaderText}>{title.toUpperCase()}</Text>
            </View>
        );
    };

    renderItem = user => {
        const { item, index } = user;

        if (item.empty) {
            return (
                <View style={[AppStyles.centerAligned, AppStyles.paddingTop, AppStyles.paddingBottom]} key={index}>
                    <Text style={[AppStyles.subtext, { fontSize: AppStyles.baseText.fontSize }]}>
                        No matching found
                    </Text>
                </View>
            );
        }

        let network = item.n || item.network;
        let slug = '';

        if (['coil', 'internal'].indexOf(network) !== -1) {
            switch (network) {
                case 'internal':
                    slug = 'Paper Account';
                    break;
                case 'coil':
                    slug = 'Coil Account';
                    break;
            }
        } else {
            slug = network === 'discord' ? item.s || item.slug : item.u || item.username;
        }

        return (
            <TouchableHighlight
                onPress={() => {
                    this.onItemPress({
                        username: item.u || item.username,
                        network: item.n || item.network,
                        slug,
                    });
                }}
                underlayColor="#FFF"
            >
                <View style={styles.row}>
                    <Avatar
                        onPress={() => {
                            this.onItemPress({
                                username: item.u || item.username,
                                network: item.n || item.network,
                                slug,
                            });
                        }}
                        network={network}
                        source={
                            network === 'twitter'
                                ? {
                                      uri: `https://twitter.com/${item.u || item.username}/profile_image?size=original`,
                                      cache: 'default',
                                  }
                                : null
                        }
                    />
                    <Text style={styles.name}>{slug}</Text>
                </View>
            </TouchableHighlight>
        );
    };

    onSearchChange = text => {
        const { lookupUsers, accountState } = this.props;
        const { discoveredUsers } = this.state;

        clearTimeout(this.lookupTimeout);

        this.setState({
            searchText: text,
            lookingUp: true,
        });

        const newFilteredContacts = [];
        const newFilteredDiscoverd = [];

        accountState.contacts.forEach(item => {
            if (
                item.u.toLowerCase().indexOf(text.toLowerCase()) !== -1 ||
                item.s.toLowerCase().indexOf(text.toLowerCase()) !== -1
            ) {
                newFilteredContacts.push(item);
            }
        });

        discoveredUsers.forEach(item => {
            if (
                item.username.toLowerCase().indexOf(text.toLowerCase()) !== -1 ||
                item.slug.toLowerCase().indexOf(text.toLowerCase()) !== -1
            ) {
                newFilteredDiscoverd.push(item);
            }
        });

        this.lookupTimeout = setTimeout(() => {
            if (text && text.length > 0) {
                const me = accountState.uid;
                lookupUsers(text).then(res => {
                    const lookUpResult = _.remove(res.data, function(u) {
                        return (
                            _.findIndex(accountState.contacts, function(o) {
                                return o.u == u.username;
                            }) < 0 && u.username !== me
                        );
                    });

                    this.setState({
                        contacts: newFilteredContacts,
                        lookUpResult: lookUpResult,
                        filteredDiscoveredUsers: newFilteredDiscoverd,
                        lookingUp: false,
                    });

                    this.updateDataSource();
                });
            } else {
                this.setState({
                    contacts: newFilteredContacts,
                    filteredDiscoveredUsers: newFilteredDiscoverd,
                    lookUpResult: [],
                    lookingUp: false,
                });

                this.updateDataSource();
            }
        }, 500);
    };

    renderEmptyList = () => {
        const { searchText, dataSource, keyboardShow, KeyboardHeight } = this.state;

        if (searchText && dataSource.length < 1) {
            return <Error keyboardShow={keyboardShow} KeyboardHeight={KeyboardHeight} text="No Result" />;
        }

        if (!searchText && dataSource.length < 1) {
            return (
                <Error
                    keyboardShow={keyboardShow}
                    KeyboardHeight={KeyboardHeight}
                    text="No contacts"
                    alterText="Or start typing..."
                    action={() => {
                        this.props.navigator.push({
                            screen: 'xrptipbot.ContactsAddScreen',
                            backButtonTitle: 'Back',
                            title: 'Add new contact',
                        });
                    }}
                    actionText={'Add new contact'}
                />
            );
        }
    };

    render() {
        const { dataSource, lookingUp } = this.state;

        return (
            <View style={[AppStyles.container]}>
                <View style={[AppStyles.row]}>
                    <View style={[AppStyles.flex6]}>
                        <SearchBar
                            ref={s => (this.searchBar = s)}
                            isSearching={lookingUp}
                            lightTheme
                            onChangeText={this.onSearchChange}
                            containerStyle={{ backgroundColor: 'transparent' }}
                            placeHolder="Search contacts or all users"
                        />
                    </View>
                </View>

                <View style={[AppStyles.flex1]}>
                    <SectionList
                        contentContainerStyle={{ flexGrow: 1 }}
                        sections={dataSource}
                        ListEmptyComponent={this.renderEmptyList}
                        renderItem={this.renderItem}
                        renderSectionHeader={this.renderSectionHeader}
                        keyExtractor={(item, index) => item.u || item.username + index}
                    />
                </View>
            </View>
        );
    }
}

/* Export Component ==================================================================== */
export default SelectContactView;
