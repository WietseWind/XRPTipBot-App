import React, { Component } from 'react';
// import PropTypes from 'prop-types';

import _ from 'lodash';

import { View, Text, StyleSheet, TouchableHighlight, FlatList, Alert, Platform, Animated } from 'react-native';

// Consts and Libs
import { AppStyles, AppColors, AppFonts } from '@theme/';

import { SearchBar, Error, Avatar } from '@components/';

/* Component ==================================================================== */
const styles = StyleSheet.create({
    avatar: {
        width: 20,
        height: 20,
        marginRight: 10,
        marginLeft: 25,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 10,
    },
    name: {
        fontSize: AppStyles.baseText.fontSize,
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
        color: '#478FD5',
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
class AddContactView extends Component {
    static componentName = 'AddContactView';

    static navigatorStyle = {
        tabBarHidden: Platform.OS !== 'ios',
    };

    constructor(props) {
        super(props);

        this.state = {
            lookingUp: false,
            searchText: '',
            dataSource: [],
        };

        this.lookupTimeout = null;
        this.shouldClearList = false;
        this.searched = false;
        this.sequence = 0;
    }

    componentDidMount() {
        this.props.navigator.setTitle({
            title: 'Add new contact',
        });
    }

    addToContacts = user => {
        const { accountState, persistContacts } = this.props;

        const contacts = accountState.contacts || [];

        // make old new contacts not new :D
        contacts.map(obj => {
            if (obj.new) {
                obj.new = false;
            }
        });

        const newList = [
            ...contacts,
            ...[
                {
                    u: user.username,
                    s: user.slug,
                    n: user.network,
                    new: true,
                },
            ],
        ];

        persistContacts(newList).then(() => {
            this.props.navigator.pop();
            this.props.onSuccessAdd(user.username);
        });
    };

    onItemPress = user => {
        Alert.alert(
            'Add Contact',
            `Add ${['discord', 'coil'].indexOf(user.network) !== -1 ? user.slug : user.username} to contact list ?`,
            [
                { text: 'Yes', onPress: () => this.addToContacts(user) },
                { text: 'No', onPress: () => null, style: 'cancel' },
            ],
            { cancelable: false },
        );
    };

    onSearchChange = text => {
        const { lookupUsers, accountState } = this.props;

        clearTimeout(this.lookupTimeout);

        this.setState({
            searchText: text,
            lookingUp: true,
        });

        this.lookupTimeout = setTimeout(() => {
            if (text && text.length > 0) {
                const me = accountState.uid;
                this.sequence += 1;
                const sequence = this.sequence;
                lookupUsers(text).then(res => {
                    if (sequence === this.sequence) {
                        this.setState({
                            dataSource: _.sortBy(
                                _.remove(res.data, function(u) {
                                    return (
                                        _.findIndex(accountState.contacts, function(o) {
                                            return o.u == u.username;
                                        }) < 0 && u.username !== me
                                    );
                                }),
                                [
                                    function(o) {
                                        return o._sort;
                                    },
                                ],
                            ),
                            lookingUp: false,
                        });
                    }
                });
            } else {
                this.shouldClearList = true;
                this.setState({
                    dataSource: [],
                    lookingUp: false,
                });
            }
        }, 500);
    };

    renderItem = user => {
        const { item, index } = user;

        return (
            <ListItem key={index} index={index}>
                <TouchableHighlight
                    onPress={() => {
                        this.onItemPress(item);
                    }}
                    underlayColor="rgba(154, 154, 154, 0.25)"
                >
                    <View style={styles.row}>
                        <Avatar
                            onPress={() => {
                                this.onItemPress(item);
                            }}
                            network={item.network}
                            source={
                                item.network === 'twitter'
                                    ? {
                                          uri: `https://www.xrptipbot.com/avatar/twitter/u:${item.username}`,
                                          cache: 'default',
                                      }
                                    : null
                            }
                        />
                        <Text style={styles.name}>
                            {['discord', 'coil'].indexOf(item.network) !== -1 ? item.slug : item.username}
                        </Text>
                    </View>
                </TouchableHighlight>
            </ListItem>
        );
    };

    render() {
        const { dataSource, lookingUp } = this.state;

        return (
            <View style={[AppStyles.container, AppStyles.containerCentered]}>
                <View style={[AppStyles.row]}>
                    <View style={[AppStyles.flex6]}>
                        <SearchBar
                            autoFocus={true}
                            lightTheme
                            isSearching={lookingUp}
                            onChangeText={this.onSearchChange}
                            containerStyle={{ backgroundColor: 'transparent' }}
                            placeHolder="Search TipBot users"
                        />
                    </View>
                </View>

                <View style={[AppStyles.flex1]}>
                    <FlatList
                        contentContainerStyle={{ flexGrow: 1 }}
                        keyExtractor={(item, index) => item.userid + index.toString()}
                        renderItem={user => this.renderItem(user)}
                        data={dataSource}
                        initialNumToRender={50}
                        ListEmptyComponent={
                            this.state.searchText && !this.state.lookingUp ? <Error text="No Result" /> : null
                        }
                    />
                </View>
            </View>
        );
    }
}

/* Export Component ==================================================================== */
export default AddContactView;
