import React, { Component } from 'react';

import _ from 'lodash';

import { View, Text, StyleSheet, TouchableHighlight, SectionList, Keyboard, Platform, Animated } from 'react-native';

// Consts and Libs
import { AppStyles, AppColors, AppFonts, AppSizes } from '@theme/';

import { SearchBar, Error, Alert, Avatar, LoadingIndicator } from '@components/';

import Discovery from 'react-native-discovery';

import { requestLocationPermission } from '@libs/utils';

/* Component ==================================================================== */
const styles = StyleSheet.create({
    avatar: {
        width: 36,
        height: 36,
        marginRight: 10,
        marginLeft: 10,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 8,
    },
    name: {
        fontSize: 16,
        fontWeight: Platform.OS === 'ios' ? '500' : '400',
        color: AppColors.textPrimary,
    },
    address: {
        fontSize: 11,
        color: AppColors.textSecondary,
    },
    sectionHeaderText: {
        fontFamily: AppFonts.familyBold,
        fontWeight: '700',
        paddingLeft: 8,
        color: '#000',
    },
});

/* Component ==================================================================== */

class ListItem extends Component {
    constructor(props) {
        super(props);

        this.state = {
            scaleValue: new Animated.Value(0),
        };
    }

    componentDidMount() {
        Animated.timing(this.state.scaleValue, {
            toValue: 1,
            duration: 300,
            delay: this.props.index * 150,
        }).start();
    }

    render() {
        return <Animated.View style={{ opacity: this.state.scaleValue }}>{this.props.children}</Animated.View>;
    }
}

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

        Discovery.setShouldDiscover(false);
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

    componentWillReceiveProps(nextProps) {
        if (nextProps.accountState.contacts !== this.props.accountState.contacts) {
            this.setState({
                dataSource: this.convertContactsArrayToMap(nextProps.accountState.contacts, []),
            });
        }
    }

    discoverNearby = () => {
        // location permission
        requestLocationPermission()
            .then(() => {
                Discovery.setShouldDiscover(true);
                Discovery.on('discoveredUsers', this.handleDiscover);
            })
            .catch(e => {});
    };

    updateDataSource = () => {
        const { accountState } = this.props;
        const { lookUpResult, discoveredUsers } = this.state;

        const contacts = accountState.contacts || [];

        if (_.isEmpty(contacts) && _.isEmpty(lookUpResult) && _.isEmpty(discoveredUsers)) {
            this.setState({
                dataSource: [],
            });
        } else {
            let dataSource = [
                { title: 'Nearby', data: discoveredUsers || [] },
                { title: 'Contacts', data: contacts || [] },
                { title: 'Search results', data: lookUpResult || [] },
            ];

            if (_.isEmpty(lookUpResult)) {
                dataSource = _.remove(dataSource, function(n) {
                    return n.title !== 'Search results';
                });
            }

            if (_.isEmpty(discoveredUsers)) {
                dataSource = _.remove(dataSource, function(n) {
                    return n.title !== 'Nearby';
                });
            }

            this.setState({
                dataSource,
            });
        }
    };

    handleDiscover = data => {
        const { discoveredUsers } = this.state;
        const { lookupUsers, accountState } = this.props;

        if (data.users.length > 0) {
            let uuids = [];
            let uuidv4s = [];
            data.users.forEach(u => {
                console.log(accountState.uuidv4)
                console.log(u.uuid.toLowerCase())
                if (u.uuid.toLowerCase() !== accountState.uuidv4) {
                    uuids.push(u.uuid.toLowerCase());
                    uuidv4s.push({ uuidv4: u.uuid.toLowerCase() });
                }
            });

            const diff = _.differenceBy(uuidv4s, discoveredUsers, 'uuidv4');

            if (diff.length > 0) {
                console.log('Has different update');
                lookupUsers(uuids).then(res => {
                    this.setState({
                        discoveredUsers: res.data,
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
            sendTo: {
                username: item.u || item.username,
                network: item.n || item.network,
                slug: item.s || item.slug,
            },
        });
    };

    renderSectionHeader = ({ section: { title } }) => {
        return (
            <View style={{ backgroundColor: '#FFF', padding: 2 }}>
                <Text style={styles.sectionHeaderText}>{title}</Text>
            </View>
        );
    };

    renderItem = user => {
        const { item, index } = user;

        if (item.empty) {
            return (
                <View style={[AppStyles.centerAligned, AppStyles.paddingTop, AppStyles.paddingBottom]} key={index}>
                    <Text style={[AppStyles.subtext, { fontSize: AppStyles.baseText.fontSize }]}>
                        No matching contacts
                    </Text>
                </View>
            );
        }

        let networkIcon = null;
        switch (item.n || item.network) {
            case 'twitter':
                networkIcon = (
                    <Avatar
                        onPress={() => {
                            this.onItemPress(item);
                        }}
                        network={'twitter'}
                        source={{ uri: `https://twitter.com/${item.u || item.username}/profile_image?size=original` }}
                    />
                );
                break;
            case 'discord':
                networkIcon = (
                    <Avatar
                        onPress={() => {
                            this.onItemPress(item);
                        }}
                        network={'discord'}
                    />
                );
                break;
            case 'reddit':
                networkIcon = (
                    <Avatar
                        onPress={() => {
                            this.onItemPress(item);
                        }}
                        network={'reddit'}
                    />
                );
                break;
        }

        return (
            <ListItem key={index} index={index}>
                <TouchableHighlight
                    onPress={() => {
                        this.onItemPress(item);
                    }}
                    underlayColor="#FFF"
                >
                    <View style={styles.row}>
                        {networkIcon}
                        <Text style={styles.name}>
                            {item.n || item.network === 'discord' ? item.s || item.slug : item.u || item.username}
                        </Text>
                    </View>
                </TouchableHighlight>
            </ListItem>
        );
    };

    onSearchChange = text => {
        const { lookupUsers, accountState } = this.props;

        clearTimeout(this.lookupTimeout);

        this.setState({
            searchText: text,
        });
        const newFilter = [];

        accountState.contacts.forEach(item => {
            if (
                item.u.toLowerCase().indexOf(text.toLowerCase()) !== -1 ||
                item.s.toLowerCase().indexOf(text.toLowerCase()) !== -1
            ) {
                newFilter.push(item);
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
                        contacts: newFilter,
                        lookUpResult: lookUpResult,
                    });

                    this.updateDataSource();
                });
            } else {
                this.setState({
                    contacts: newFilter,
                    lookUpResult: [],
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
        const { dataSource } = this.state;

        return (
            <View style={[AppStyles.container]}>
                <View style={[AppStyles.row]}>
                    <View style={[AppStyles.flex6]}>
                        <SearchBar
                            ref={s => (this.searchBar = s)}
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
