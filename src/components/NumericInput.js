import React, { Component } from 'react';
import {
    StyleSheet,
    View,
    Text,
    TouchableOpacity,
    Animated,
    DeviceEventEmitter,
    Platform,
    Dimensions,

} from 'react-native';

let basePx = Platform.OS === 'ios' ? 750 : 720;
let { width } = Dimensions.get('window');

function px2dp(px){
    return px / basePx * width;
}

const styles = StyleSheet.create({
    view:{
        width:'100%',
    },
    textInputWrap:{
        height:40,
        flexDirection:'row',
        justifyContent: 'center',
        alignItems:'center',
        paddingLeft:px2dp(10)
    },
    cursorWrap:{
        height:40,
        flexDirection:'row',
        alignItems:'center',
    },
    cursor:{
        color: '#3E77E6',
        fontSize:25,
        fontWeight:'300'
    },
    placeholder:{
        color:'#C4C4C4',
        fontSize:20,
        position:'absolute',
        textAlign: 'center',
        left:13
    },
    value:{
        fontWeight: "700",
    }
});


class NumericInput extends Component{

    constructor(props) {
        super(props);

        this.state = {
            fadeAnim: new Animated.Value(0),
            valueArr: props.value || []
        };
    }
    componentDidMount() {

        this.inputEvent();

        this.animation();
    }

    componentWillReceiveProps(nextProps){
        // this.animated.stopAnimation();
        if(nextProps.cursorLock == false){
            this.animation();
        }
    }

    static getDerivedStateFromProps(props, state) {
        if (props.value.split('') !== state.valueArr) {
            return {
                valueArr:props.value.split(''),
            };
        }
        return null;
    }


    inputEvent(){
        let that = this;
        that.subscription = DeviceEventEmitter.addListener('numericKeyboardInput',(data)=>{
            that.setState({
                valueArr:data
            })
        })
    }

    animation(){
        let that = this;
        this.animated = Animated.loop(
            Animated.sequence([
                Animated.timing(
                    that.state.fadeAnim,
                    {
                        toValue: 1,
                        duration:600,
                        seNativeDriver: true
                    }
                ),
                Animated.timing(
                    that.state.fadeAnim,
                    {
                        toValue: 0,
                        duration:600,
                        seNativeDriver: true
                    }
                )
            ]),
            {
                iterations:400
            }
        ).start();
    }

    componentWillUnmount(){
        this.subscription.remove();
    }

    renderValue(){
        if(this.props.secureTextEntry){
            return this.state.valueArr.map((item,index)=>{
                return(
                    <Text style={[styles.value,this.props.valueStyle]} key={index}>*</Text>
                )
            })
        }else{
            return this.state.valueArr.map((item,index)=>{
                return(
                    <Text style={[styles.value,this.props.valueStyle]} key={index}>{item}</Text>
                )
            })
        }
    }

    show(){
        if(this.props.disabled){
            return
        }
        this.props.show();
    }

    render() {
        return (
            <View style={[styles.view,this.props.style]}>
                <TouchableOpacity style={styles.textInputWrap} onPress={this.show.bind(this)}>
                    {this.renderValue()}
                    {
                        this.state.valueArr.length == 0 ?(
                            <Text style={[
                                styles.placeholder,
                                (this.props.valueStyle || {}),
                                {color: (this.props.placeholderTextColor || '#C4C4C4')}
                            ]}
                            >{this.props.placeholder || 'Place holder'}</Text>
                        ):(null)
                    }
                    {
                        !this.props.cursorLock && !this.props.caretHidden ? (
                            <Animated.View style={[styles.cursorWrap,{opacity: this.state.fadeAnim}]}>
                                <Text style={styles.cursor}>|</Text>
                            </Animated.View>
                        ): (null)
                    }
                </TouchableOpacity>
            </View>
        );
    }
}

export default NumericInput