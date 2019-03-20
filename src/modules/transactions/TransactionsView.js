import React, { Component } from 'react';
import PropTypes from 'prop-types';

import {
    View,
    StyleSheet,
    Text,
    InteractionManager,
    FlatList,
    TouchableHighlight,
    Platform,
    Linking,
} from 'react-native';

import { AppStyles, AppColors, AppSizes, AppFonts } from '@theme/';

import { LoadingIndicator, Spacer, Error, SearchBar, Avatar, Alert } from '@components';

import moment from 'moment';
import 'moment-timezone';

import _ from 'lodash';

import ActionSheet from '@expo/react-native-action-sheet';

import DeviceInfo from 'react-native-device-info';

const _goToURL = url => {
    Linking.canOpenURL(url).then(supported => {
        if (supported) {
            Linking.openURL(url);
        } else {
            console.log(`Don\'t know how to open URI: ${url}`);
        }
    });
};

moment.locale('en', {
    relativeTime: {
        future: 'in %s',
        past: '%s ago',
        s: 'seconds',
        ss: '%ss',
        m: 'a minute',
        mm: '%dm',
        h: 'an hour',
        hh: '%dh',
        d: 'a day',
        dd: '%dd',
        M: 'a month',
        MM: '%dM',
        y: 'a year',
        yy: '%dY',
    },
});

moment.tz.setDefault(DeviceInfo.getTimezone());

class TransactionsView extends Component {
    static displayName = 'TransactionsView';

    constructor(props) {
        super(props);

        this.state = {
            transactions: [],
            dataSource: [],
            isRefreshing: true,
            isLoadingMore: false,
            error: null,
        };
        this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
    }

    static navigatorStyle = {
        statusBarTextColorScheme: 'light',
    };

    static propTypes = {
        accountState: PropTypes.object,
        changeAppState: PropTypes.func,
    };

    onNavigatorEvent(event) {
        switch (event.type) {
            case 'ScreenChangedEvent':
                switch (event.id) {
                    case 'didAppear':
                        this.fetchTransactions(true);
                        break;
                    case 'willAppear':
                        if (Platform.OS === 'ios') this.props.navigator.toggleTabs({ to: 'shown' });
                        break;
                }
        }
    }

    componentDidMount() {
        InteractionManager.runAfterInteractions(() => {
            this.props.navigator.setTitle({
                title: 'History',
            });

            this.fetchTransactions();
        });
    }

    fetchTransactions = silence => {
        !silence ? this.setState({ isRefreshing: true, error: null }) : null;
        this.props
            .getTransactions()
            .then(res => {
                const { received, sent } = res.data.history;
                const transactions = _.sortBy(
                    [...received, ...sent],
                    [
                        function(o) {
                            return o.moment;
                        },
                    ],
                ).reverse();

                this.setState({
                    transactions: _.uniqBy(transactions.concat(this.state.transactions), 'id', true),
                    dataSource: _.uniqBy(transactions.concat(this.state.transactions), 'id', true),
                    isRefreshing: false,
                    error: null,
                });
            })
            .catch(() => {
                this.setState({
                    isRefreshing: false,
                });
            });
    };

    addToContacts = tx => {
        const { accountState, persistContacts } = this.props;
        const contacts = accountState.contacts ? accountState.contacts : [];
        const newList = [
            ...contacts,
            ...[
                {
                    u: accountState.uid !== tx.to_user ? tx.to_user : tx.from_user,
                    n: accountState.uid !== tx.to_user ? tx._details.to.n : tx._details.from.n,
                    s:
                        accountState.uid !== tx.to_user
                            ? tx._details.to.n === 'discord'
                                ? tx.userid
                                : tx.to_user
                            : tx._details.from.n === 'discord'
                            ? tx.userid
                            : tx.from_user,
                    new: true,
                },
            ],
        ];

        persistContacts(newList).then(() => {
            Alert.show('Successfully added to contacts', { type: 'success' });
        });
    };

    openProfile = tx => {
        const { accountState } = this.props;

        if (accountState.uid !== tx.to_user) {
            switch (tx._details.to.n) {
                case 'twitter':
                    _goToURL(`https://twitter.com/${tx.to_user}`);
                    break;
                case 'reddit':
                    _goToURL(`https://www.reddit.com/user/${tx.to_user}`);
                    break;
            }
        } else {
            switch (tx._details.from.n) {
                case 'twitter':
                    _goToURL(`https://twitter.com/${tx.from_user}`);
                    break;
                case 'reddit':
                    _goToURL(`https://www.reddit.com/user/${tx.from_user}`);
                    break;
            }
        }
    };

    openSendScreen = tx => {
        const { accountState } = this.props;
        const network = accountState.uid !== tx.to_user ? tx._details.to.n : tx._details.from.n;

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
                    username: accountState.uid !== tx.to_user ? tx.to_user : tx.from_user,
                    network: accountState.uid !== tx.to_user ? tx._details.to.n : tx._details.from.n,
                    slug:
                        accountState.uid !== tx.to_user
                            ? network === 'internal'
                                ? 'Paper Account'
                                : network === 'discord'
                                ? tx.userid
                                : tx.to_user
                            : network === 'internal'
                            ? 'Paper Account'
                            : network === 'discord'
                            ? tx.userid
                            : tx.from_user,
                },
            },
        });
    };

    onItemClick = tx => {
        const { accountState } = this.props;

        const contacts = accountState.contacts ? accountState.contacts : [];
        const network = accountState.uid !== tx.to_user ? tx._details.to.n : tx._details.from.n;
        let options = ['Send Tip'];
        let openProfileIndex = 0;
        let addToContactsIndex = 0;

        let searchFor = accountState.uid !== tx.to_user ? tx.to_user : tx.from_user;
        if (
            !_.find(contacts, function(o) {
                return o.u === searchFor;
            }) &&
            network !== 'internal'
        ) {
            options.push('Add to contacts');
            addToContactsIndex = options.length - 1;
        }
        if (network !== 'discord' && network !== 'internal') {
            options.push('Open profile (browser)');
            openProfileIndex = options.length - 1;
        }

        options.push('Cancel');

        const cancelButtonIndex = options.length - 1;
        this.actionSheetRef.showActionSheetWithOptions(
            {
                options,
                cancelButtonIndex,
            },
            buttonIndex => {
                switch (buttonIndex) {
                    case 0:
                        this.openSendScreen(tx);
                        break;
                    case openProfileIndex:
                        this.openProfile(tx);
                        break;
                    case addToContactsIndex:
                        this.addToContacts(tx);
                        break;
                }
            },
        );
    };

    onSearchChange = text => {
        const { transactions } = this.state;

        const newFilter = [];
        transactions.forEach(item => {
            if (
                item.to_user.toLowerCase().indexOf(text.toLowerCase()) !== -1 ||
                item.from_user.toLowerCase().indexOf(text.toLowerCase()) !== -1
            ) {
                newFilter.push(item);
            }
        });

        this.setState({
            dataSource: newFilter,
        });
    };

    renderItem = obj => {
        const { accountState } = this.props;
        const tx = obj.item;

        let networkIcon = null;
        let balanceChange = null;
        let BOTTOM_BORDER_COLOR = null;

        if (accountState.uid !== tx.to_user) {
            // Outcome Transaction
            const amount = tx.amount;
            balanceChange = (
                <Text style={[AppStyles.baseText, styles.outcomeAmount]}>
                    -{amount} <Text style={[AppStyles.subtext]}>XRP</Text>
                </Text>
            );
            BOTTOM_BORDER_COLOR = 'rgba(192,40,39, 0.4)';

            switch (tx._details.to.n) {
                case 'twitter':
                    networkIcon = (
                        <Avatar
                            onPress={() => {
                                this.onItemClick(tx);
                            }}
                            network={'twitter'}
                            source={{ uri: `https://twitter.com/${tx.to_user}/profile_image?size=original` }}
                        />
                    );
                    break;
                case 'discord':
                    networkIcon = (
                        <Avatar
                            onPress={() => {
                                this.onItemClick(tx);
                            }}
                            network={'discord'}
                        />
                    );
                    break;
                case 'reddit':
                    networkIcon = (
                        <Avatar
                            onPress={() => {
                                this.onItemClick(tx);
                            }}
                            network={'reddit'}
                        />
                    );
                    break;
                case 'internal':
                    networkIcon = (
                        <Avatar
                            onPress={() => {
                                this.onItemClick(tx);
                            }}
                            network={'internal'}
                        />
                    );
                    break;
            }
        } else {
            // Income Transaction
            const amount = tx.amount;
            balanceChange = (
                <Text style={[AppStyles.baseText, styles.incomeAmount]}>
                    +{amount} <Text style={[AppStyles.subtext]}>XRP</Text>
                </Text>
            );
            BOTTOM_BORDER_COLOR = 'rgba(60, 194, 158, 0.6)';

            switch (tx._details.from.n) {
                case 'twitter':
                    networkIcon = (
                        <Avatar
                            onPress={() => {
                                this.onItemClick(tx);
                            }}
                            network={'twitter'}
                            source={{ uri: `https://twitter.com/${tx.from_user}/profile_image?size=original` }}
                        />
                    );
                    break;
                case 'discord':
                    networkIcon = (
                        <Avatar
                            onPress={() => {
                                this.onItemClick(tx);
                            }}
                            network={'discord'}
                        />
                    );
                    break;
                case 'reddit':
                    networkIcon = (
                        <Avatar
                            onPress={() => {
                                this.onItemClick(tx);
                            }}
                            network={'reddit'}
                        />
                    );
                    break;
                case 'internal':
                    networkIcon = (
                        <Avatar
                            onPress={() => {
                                this.onItemClick(tx);
                            }}
                            network={'internal'}
                        />
                    );
                    break;
            }
        }

        const network = accountState.uid !== tx.to_user ? tx._details.to.n : tx._details.from.n;
        const showName =
            accountState.uid !== tx.to_user
                ? network === 'internal'
                    ? 'Paper Account'
                    : network === 'discord'
                    ? tx.userid
                    : tx.to_user
                : network === 'internal'
                ? 'Paper Account'
                : network === 'discord'
                ? tx.userid
                : tx.from_user;

        return (
            <TouchableHighlight
                style={[styles.rowContainer, { borderBottomColor: BOTTOM_BORDER_COLOR }]}
                underlayColor={'#d9e7ea'}
                onPress={() => {
                    this.onItemClick(tx);
                }}
            >
                <View style={styles.rowContent}>
                    <View style={[styles.row, AppStyles.flex3]}>
                        {networkIcon}
                        <View>
                            <Text numberOfLines={0} ellipsizeMode="head" style={[styles.name]}>
                                {showName}
                            </Text>
                            <Text style={[AppStyles.subtext, AppStyles.textLeftAligned, { marginBottom: -10 }]}>
                                {moment(tx.moment).fromNow()}
                            </Text>
                        </View>
                    </View>
                    <View style={[styles.labelTextWrap, AppStyles.flex2]}>{balanceChange}</View>
                </View>
            </TouchableHighlight>
        );
    };

    render() {
        const { isRefreshing, dataSource, error } = this.state;

        if (isRefreshing) {
            if (dataSource.length < 1) {
                return (
                    <ActionSheet
                        ref={component => {
                            this.actionSheetRef = component;
                        }}
                    >
                        <View style={AppStyles.container}>
                            <View style={[AppStyles.flex3, AppStyles.centerAligned]}>
                                <LoadingIndicator />

                                <Spacer size={10} />

                                <Text style={AppStyles.h5}>Loading ...</Text>
                            </View>
                        </View>
                    </ActionSheet>
                );
            }
        }

        return (
            <ActionSheet
                ref={component => {
                    this.actionSheetRef = component;
                }}
            >
                <View style={AppStyles.container}>
                    <View style={[AppStyles.row]}>
                        <View style={[AppStyles.flex6]}>
                            <SearchBar
                                lightTheme
                                onChangeText={this.onSearchChange}
                                containerStyle={{ backgroundColor: 'transparent' }}
                                placeHolder="Filter history "
                            />
                        </View>
                    </View>
                    <View style={[AppStyles.flex1]}>
                        <FlatList
                            contentContainerStyle={{ flexGrow: 1 }}
                            renderItem={transaction => this.renderItem(transaction)}
                            data={dataSource}
                            refreshing={isRefreshing}
                            ListEmptyComponent={<Error text="No Transactions" />}
                            onRefresh={() => {
                                this.fetchTransactions();
                            }}
                            // onEndReached={this.LoadMore} //TODO: FIX ME
                            keyExtractor={item => item.id}
                            // ListFooterComponent={() => isLoadingMore && <LoadingIndicator />}
                        />
                    </View>
                </View>
            </ActionSheet>
        );
    }
}

/* Styles ==================================================================== */
const styles = StyleSheet.create({
    qrCodeContainer: {
        borderRadius: 4,
        borderWidth: 0.5,
        borderColor: 'grey',
        alignSelf: 'center',
        alignItems: 'center',
        padding: 10,
        margin: 10,
        backgroundColor: '#fefeff',
    },
    container: {
        flex: 1,
        backgroundColor: AppColors.background,
    },
    name: {
        fontSize: AppStyles.baseText.fontSize,
        fontWeight: Platform.OS === 'ios' ? '500' : '400',
        color: AppColors.textPrimary,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    rowContainer: {
        padding: 10,
        paddingLeft: 20,
        paddingRight: 20,
        justifyContent: 'space-between',
        borderBottomWidth: 0.5,
        borderBottomColor: '#cfcfcf',
        backgroundColor: AppColors.background,
    },
    rowContent: {
        justifyContent: 'space-between',
        flexDirection: 'row',
    },
    labelTextWrap: {
        justifyContent: 'center',
    },
    incomeAmount: {
        color: '#3CC29E',
        textAlign: 'right',
    },
    outcomeAmount: {
        color: '#FB6567',
        textAlign: 'right',
    },
    addressLabel: {
        fontSize: 17,
    },
});

export default TransactionsView;
