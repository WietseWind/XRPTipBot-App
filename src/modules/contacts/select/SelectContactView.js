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
    Animated,
} from 'react-native';

// Consts and Libs
import { AppStyles, AppColors, AppFonts, AppSizes } from '@theme/';

import { SearchBar, Error, Alert, Avatar, LoadingIndicator } from '@components/';

/* Component ==================================================================== */
const styles = StyleSheet.create({
    avatar: {
        width: 36,
        height: 36,
        marginRight: 10,
        marginLeft: 10
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 8,
    },
    name: {
        fontSize: 16,
        fontWeight: Platform.OS === "ios" ? '500' : '400',
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

class ListItem extends Component{
    constructor(props) {
        super(props);

        this.state = {
            scaleValue: new Animated.Value(0)
        }
    }

    componentDidMount() {
        Animated.timing(this.state.scaleValue, {
            toValue: 1,
            duration : 300,
            delay: this.props.index * 150
        }).start();
    }

    render() {
        return (
            <Animated.View style={{ opacity: this.state.scaleValue }}>
                { this.props.children }
            </Animated.View>
        );
    }
}


/* Component ==================================================================== */
class SelectContactView extends Component {
    static componentName = 'ContactsView';

    static navigatorStyle = {
        navBarButtonColor: '#FFFFFF',
        statusBarTextColorScheme: 'light',
        drawUnderTabBar: true,
        tabBarHidden: Platform.OS !== "ios"
    };

    constructor(props) {
        super(props);
        this.state = {
            dataSource: this.convertContactsArrayToMap(),
            lookUpResult: [],
            lookingUp: false,
            searchText: '',
            keyboardShow: false,
            KeyboardHeight: 0  ,
        };

        this.lookupTimeout = null;
        this.shouldClearList = false;
        this.searched = false;
    }


    componentDidMount () {
        this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', this._keyboardDidShow);
        this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', this._keyboardDidHide);


        const {accountState} = this.props ;

        const contacts = accountState.contacts || [];

        if (_.isEmpty(contacts)){
            this.searchBar.focus()
        }

    }

    componentWillUnmount () {
        this.keyboardDidShowListener.remove();
        this.keyboardDidHideListener.remove();
    }


    _keyboardDidHide = () => {
        this.setState({
            keyboardShow: false
        })
    };


    _keyboardDidShow = (event) => {
        this.setState({
            keyboardShow: true,
            KeyboardHeight:  event.endCoordinates.height
        });
    };



    componentWillReceiveProps(nextProps) {
        if (nextProps.accountState.contacts !== this.props.accountState.contacts) {
            this.setState({
                dataSource: this.convertContactsArrayToMap(nextProps.accountState.contacts, []),
            });
        }
    }

    convertContactsArrayToMap = (contacts, searchResult) => {
        const {accountState} = this.props ;

        contacts = contacts ? contacts : (accountState.contacts ? accountState.contacts : []);

        if (_.isEmpty(contacts) && _.isEmpty(searchResult)){
            return []
        }

        if(_.isEmpty(contacts)){
            return  [
                {title: 'Contacts', data: [{empty: true}]},
                {title: 'Search results', data: searchResult || []},
            ];
        }

        if(_.isEmpty(searchResult)){
            return [
                {title: 'Contacts', data: contacts},
            ]
        }

        return  [
            {title: 'Contacts', data: contacts},
            {title: 'Search results', data: searchResult || []},
        ];
    };

    onItemPress = (item) => {
        this.props.navigator.pop();
        this.props.onSuccessRead({sendTo: {
                username: item.u || item.username,
                network: item.n || item.network,
                slug: item.s || item.slug
            }})
    };


    renderSectionHeader = ({section: {title}}) => {
        return(
            <View style={{backgroundColor: "#FFF", padding: 2}}>
                <Text style={styles.sectionHeaderText}>{title}</Text>
            </View>
        )
    };


    renderItem = user => {
        const { item, index } = user;

        if(item.empty){
            return (
                <View style={[AppStyles.centerAligned, AppStyles.paddingTop, AppStyles.paddingBottom]} key={index}>
                    <Text style={[ AppStyles.subtext, {fontSize: AppStyles.baseText.fontSize}]}>No matching contacts</Text>
                </View>
            )
        }


        let networkIcon = null;
        switch (item.n || item.network) {
            case "twitter" :
                networkIcon = <Avatar onPress={() => {this.onItemPress(item);}} network={"twitter"} source={{uri: `https://twitter.com/${item.u || item.username}/profile_image?size=original`}} />;
                break;
            case "discord":
                networkIcon = <Avatar  onPress={() => {this.onItemPress(item);}} network={"discord"} />;
                break;
            case "reddit":
                networkIcon = <Avatar  onPress={() => {this.onItemPress(item);}} network={"reddit"} />;
                break;
        }


        return(
            <ListItem key={index} index={ index } >
                <TouchableHighlight
                    onPress={() => {this.onItemPress(item);}}
                    underlayColor="#FFF"
                >
                    <View style={styles.row}>
                        {networkIcon}
                        <Text style={styles.name}>{item.n || item.network === 'discord' ? item.s || item.slug : item.u || item.username }</Text>
                    </View>
                </TouchableHighlight>
            </ListItem>
        )
    };

    onSearchChange = (text) => {
        const {lookupUsers, accountState} = this.props ;

        clearTimeout(this.lookupTimeout);

        this.setState({
            searchText: text,
        })
        const newFilter = [];

        accountState.contacts.forEach((item) => {
            if (item.u.toLowerCase().indexOf(text.toLowerCase()) !== -1 || item.s.toLowerCase().indexOf(text.toLowerCase()) !== -1) {
                newFilter.push(item);
            }
        });

        this.lookupTimeout = setTimeout(() => {
            if (text && text.length > 0 ){
                const me = accountState.uid;
                lookupUsers(text).then((res) => {
                    const  lookUpResult =  _.remove(res.data, function(u) {
                        return _.findIndex(accountState.contacts, function(o) { return (o.u == u.username); }) < 0 && u.username !== me;
                    });

                    this.setState({
                        dataSource: this.convertContactsArrayToMap(newFilter, lookUpResult),
                    });
                })
            }else{
                this.setState({
                    dataSource: this.convertContactsArrayToMap(newFilter, []),
                });
            }
        }, 500)



    };

    renderEmptyList = () => {
        const {searchText , dataSource, keyboardShow, KeyboardHeight } = this.state ;

        if(searchText && dataSource.length < 1 ){
            return(<Error keyboardShow={keyboardShow}  KeyboardHeight={KeyboardHeight} text="No Result" />)
        }

        if(!searchText && dataSource.length < 1){
            return(
                <Error
                    keyboardShow={keyboardShow}
                    KeyboardHeight={KeyboardHeight}
                    text="No contacts"
                    alterText="Or start typing..."
                    action={() => {
                    this.props.navigator.push({
                        screen: 'xrptipbot.ContactsAddScreen',
                        backButtonTitle: "Back",
                        title: 'Add new contact',
                    });
                    }} actionText={"Add new contact"}
                />
            )
        }
    }

    render() {
        const { dataSource } = this.state;

        return (
            <View style={[AppStyles.container]}>
                <View style={[AppStyles.row]}>
                    <View style={[AppStyles.flex6]}>
                        <SearchBar
                            ref={(s) => this.searchBar = s}
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
                        ListEmptyComponent = {this.renderEmptyList}
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