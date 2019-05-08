import React, { Component } from 'react';
import PropTypes from 'prop-types';

import _ from 'lodash';

import {
    View,
    Text,
    StyleSheet,
    TouchableHighlight,
    SectionList,
    Animated,
    Platform,
    TouchableOpacity,
} from 'react-native';

// Consts and Libs
import { AppStyles, AppColors, AppFonts, AppSizes } from '@theme/';

import { Spacer, SearchBar, Error, Alert, Avatar, LoadingIndicator } from '@components/';

import Interactable from 'react-native-interactable';

/* Component ==================================================================== */
const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 10,
        paddingHorizontal: 8,
        paddingVertical: 8,
    },
    name: {
        fontSize: AppStyles.baseText.fontSize,
        fontWeight: Platform.OS === 'ios' ? '500' : '400',
        color: AppColors.textPrimary,
    },
    sectionHeaderText: {
        fontFamily: AppFonts.familyBold,
        fontSize: AppFonts.base.size,
        fontWeight: '700',
        paddingLeft: 8,
        color: '#696969',
    },
    trashHolder: {
        position: 'absolute',
        top: 0,
        left: AppSizes.screen.width - 155,
        width: AppSizes.screen.width,
        height: AppSizes.screen.width * 0.14,
        paddingLeft: 18,
        backgroundColor: '#f84600',
        justifyContent: 'center',
    },
});

/* Component ==================================================================== */
class Row extends Component {
    constructor(props) {
        super(props);
        this._deltaX = new Animated.Value(0);
    }

    static propTypes = {
        onPressDelete: PropTypes.func.isRequired,
    };

    componentWillMount() {
        this._visibility = new Animated.Value(this.props.new ? 1 : 0);

        if (this.props.new) {
            Animated.sequence([
                Animated.timing(this._visibility, {
                    duration: 1000,
                    toValue: 0,
                }),
                Animated.timing(this._visibility, {
                    duration: 500,
                    toValue: 1,
                }),
                Animated.timing(this._visibility, {
                    duration: 500,
                    toValue: 0,
                }),
            ]).start();
        }
    }

    render() {
        return (
            <View style={{ backgroundColor: '#FFF' }}>
                <View
                    style={{ position: 'absolute', left: 0, right: 0, height: AppSizes.screen.width * 0.14 }}
                    pointerEvents="box-none"
                >
                    <Animated.View
                        style={[
                            styles.trashHolder,
                            {
                                transform: [
                                    {
                                        translateX: this._deltaX.interpolate({
                                            inputRange: [-155, 0],
                                            outputRange: [0, 155],
                                        }),
                                    },
                                ],
                            },
                        ]}
                    >
                        <TouchableOpacity onPress={this.props.onPressDelete}>
                            <Text style={[AppStyles.baseText, { color: '#FFF' }]}>Remove</Text>
                        </TouchableOpacity>
                    </Animated.View>
                </View>

                <Interactable.View
                    horizontalOnly={true}
                    snapPoints={[
                        { x: 78, damping: 1 - 1 - 0.7, tension: 150 },
                        { x: 0, damping: 1 - 1 - 0.7, tension: 150 },
                        { x: -AppSizes.screen.width * 0.25, damping: 1 - 1 - 0.7, tension: 150 },
                    ]}
                    boundaries={{ left: -AppSizes.screen.width * 0.3, right: 0, bounce: 0 }}
                    animatedValueX={this._deltaX}
                >
                    <Animated.View
                        style={[
                            {
                                left: 0,
                                right: 0,
                                height: AppSizes.screen.width * 0.14,
                                backgroundColor: this._visibility.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: ['rgba(231,174,60,0)', 'rgba(231,174,60,1)'],
                                }),
                            },
                            AppStyles.centerA,
                        ]}
                    >
                        {this.props.children}
                    </Animated.View>
                </Interactable.View>
            </View>
        );
    }
}

/* Component ==================================================================== */
class ContactsView extends Component {
    static componentName = 'ContactsView';

    static navigatorStyle = {
        navBarButtonColor: '#FFFFFF',
        statusBarTextColorScheme: 'light',
    };

    constructor(props) {
        super(props);
        this.state = {
            dataSource: this.convertContactsArrayToMap(),
            isRefreshing: true,
        };
        this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
    }

    onNavigatorEvent(event) {
        switch (event.type) {
            case 'NavBarButtonPress':
                if (event.id === 'addContact') {
                    if (Platform.OS === 'ios') this.props.navigator.toggleTabs({ to: 'hidden' });

                    this.props.navigator.push({
                        screen: 'xrptipbot.ContactsAddScreen',
                        backButtonTitle: 'Back',
                        title: 'Add new contact',
                        navigatorStyle: {
                            drawUnderTabBar: true,
                        },
                        passProps: {
                            onSuccessAdd: this.onSuccessAdd,
                        },
                    });
                }
                break;
            case 'ScreenChangedEvent':
                switch (event.id) {
                    case 'willAppear':
                        if (Platform.OS === 'ios') this.props.navigator.toggleTabs({ to: 'shown' });
                        break;
                }
        }
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.accountState.contacts !== this.props.accountState.contacts) {
            this.setState({
                dataSource: this.convertContactsArrayToMap(nextProps.accountState.contacts),
            });
        }
    }

    componentDidMount() {
        this.fetchContacts();
    }

    convertContactsArrayToMap = contacts => {
        const { accountState } = this.props;
        const contactsCategoryMap = [];

        contacts = contacts ? contacts : accountState.contacts ? accountState.contacts : [];

        contacts.forEach((item, index) => {
            let firstLetter = '';
            if (['discord', 'coil'].indexOf(item.n) !== -1) {
                firstLetter = item.s.charAt(0).toUpperCase();
            } else {
                firstLetter = item.u.charAt(0).toUpperCase();
            }

            if (
                contactsCategoryMap.filter(function(r) {
                    return r.title === firstLetter;
                }).length < 1
            ) {
                contactsCategoryMap.push({ title: firstLetter, data: [] });
            }
            contactsCategoryMap
                .filter(function(r) {
                    return r.title === firstLetter;
                })[0]
                .data.push(item);
        });

        // Sort
        return _(contactsCategoryMap)
            .sortBy(function(o) {
                return o.title;
            })
            .value();
    };

    onItemPress = item => {
        if (Platform.OS === 'ios') this.props.navigator.toggleTabs({ to: 'hidden' });

        this.props.navigator.push({
            screen: 'xrptipbot.SendScreen',
            backButtonTitle: 'Cancel',
            title: 'Send a tip',
            navigatorStyle: {
                drawUnderTabBar: true,
            },
            passProps: {
                sendTo: {
                    username: item.u,
                    network: item.n,
                    slug: item.s,
                },
            },
        });
    };

    onPressDelete = i => {
        const { accountState, persistContacts } = this.props;

        let newArray = accountState.contacts.filter(function(item) {
            return item.u !== i.u;
        });

        persistContacts(newArray.asMutable());
    };

    renderSectionHeader = ({ section: { title } }) => {
        return (
            <View style={{ backgroundColor: '#f6f6f6', padding: 3 }}>
                <Text style={styles.sectionHeaderText}>{title}</Text>
            </View>
        );
    };

    onSuccessAdd = username => {
        const { dataSource } = this.state;

        const firstLetter = username.charAt(0).toUpperCase();

        dataSource.forEach((item, sectionIndex) => {
            if (item.title === firstLetter) {
                item.data.forEach((item, index) => {
                    if (item.u == username) {
                        this.list.scrollToLocation({
                            itemIndex: index,
                            viewPosition: 0.5,
                            animated: true,
                            sectionIndex: sectionIndex,
                        });
                    }
                });
            }
        });
    };

    fetchContacts = () => {
        this.setState({ isRefreshing: true });
        this.props
            .getContacts()
            .then(() => {
                this.setState({
                    isRefreshing: false,
                });
            })
            .catch(() => {
                this.setState({
                    isRefreshing: false,
                });
            });
    };

    renderItem = user => {
        const { item } = user;

        return (
            <Row new={item.new} onPressDelete={() => this.onPressDelete(item)}>
                <TouchableHighlight
                    onPress={() => {
                        this.onItemPress(item);
                    }}
                    underlayColor="#FFF"
                >
                    <View style={styles.row}>
                        <Avatar
                            onPress={() => {
                                this.onItemPress(item);
                            }}
                            network={item.n}
                            source={
                                item.n === 'twitter'
                                    ? {
                                          uri: `https://www.xrptipbot.com/avatar/twitter/u:${item.u}`,
                                          cache: 'default',
                                      }
                                    : null
                            }
                        />
                        <Text style={styles.name}>{['discord', 'coil'].indexOf(item.n) !== -1 ? item.s : item.u}</Text>
                    </View>
                </TouchableHighlight>
            </Row>
        );
    };

    render() {
        const { isRefreshing, dataSource } = this.state;

        if (isRefreshing) {
            if (dataSource.length < 1) {
                return (
                    <View style={AppStyles.container}>
                        <View style={[AppStyles.flex3, AppStyles.centerAligned]}>
                            <LoadingIndicator />

                            <Spacer size={10} />

                            <Text style={AppStyles.h5}>Loading ...</Text>
                        </View>
                    </View>
                );
            }
        }

        return (
            <View style={[AppStyles.container]}>
                {!dataSource ? (
                    <Error text="No Contact" />
                ) : (
                    <View style={[AppStyles.flex1]}>
                        <SectionList
                            contentContainerStyle={{ flexGrow: 1 }}
                            ref={ref => {
                                this.list = ref;
                            }}
                            refreshing={isRefreshing}
                            onRefresh={() => {
                                this.fetchContacts();
                            }}
                            ListEmptyComponent={<Error text={'No contacts'} />}
                            sections={this.state.dataSource}
                            renderItem={this.renderItem}
                            renderSectionHeader={this.renderSectionHeader}
                            keyExtractor={(item, index) => item.u + index}
                        />
                    </View>
                )}
            </View>
        );
    }
}

/* Export Component ==================================================================== */
export default ContactsView;
