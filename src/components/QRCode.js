'use strict';

import {Image, StyleSheet} from "react-native";
import ViewShot from "react-native-view-shot";

import {AppColors} from "@theme"

var React = require('react');
var PropTypes = require('prop-types');
var createReactClass = require('create-react-class');
var Canvas = require('./Canvas.js');
var qr = require('qr.js');
var {
    View,
} = require('react-native');


function renderCanvas(canvas) {
    var ctx = canvas.getContext('2d');
    var size = this.size;
    var fgColor = this.fgColor;
    var bgColor = this.bgColor;
    canvas.width = size;
    canvas.height = size;
    canvas.style.left = (window.innerWidth - size) / 2 + 'px';
    if(window.innerHeight > size) canvas.style.top = (window.innerHeight - size) / 2 + 'px';
    ctx.fillRect(0, 0, size, size);
    var cells = this.cells;
    var cellWidth = this.size / cells.length;
    var cellHeight = this.size / cells.length;
    var nRoundedWidth = Math.round(cellWidth);
    var nRoundedHeight = Math.round(cellHeight);
    cells.forEach(function(row, rowIndex) {
        row.forEach(function(column, columnIndex) {
            var nLeft = columnIndex * cellWidth;
            var nTop = rowIndex * cellHeight;
            ctx.fillStyle = ctx.strokeStyle = column ? bgColor : fgColor;
            ctx.lineWidth = 1;
            ctx.fillRect(nLeft, nTop, cellWidth, cellHeight);
            ctx.strokeRect(
                Math.floor(nLeft) + 0.5,
                Math.floor(nTop) + 0.5,
                nRoundedWidth,
                nRoundedHeight
            );
            ctx.strokeRect(
                Math.ceil(nLeft) - 0.5,
                Math.ceil(nTop) - 0.5,
                nRoundedWidth,
                nRoundedHeight
            );
        });
    });
}

var QRCode = createReactClass({
    PropTypes: {
        value: PropTypes.string,
        size: PropTypes.number,
        bgColor: PropTypes.string,
        fgColor: PropTypes.string,
        onLoad: PropTypes.func,
        onLoadEnd: PropTypes.func,
    },

    getDefaultProps: function() {
        return {
            value: '',
            fgColor: '#FFF',
            bgColor: '#000' ,
            size: 128,
            onLoad: () => {},
            onLoadEnd: () => {},
        }
    },

    utf16to8: function(str) {
        var out, i, len, c;
        out = "";
        len = str.length;
        for (i = 0; i < len; i++) {
            c = str.charCodeAt(i);
            if ((c >= 0x0001) && (c <= 0x007F)) {
                out += str.charAt(i);
            } else if (c > 0x07FF) {
                out += String.fromCharCode(0xE0 | ((c >> 12) & 0x0F));
                out += String.fromCharCode(0x80 | ((c >>  6) & 0x3F));
                out += String.fromCharCode(0x80 | ((c >>  0) & 0x3F));
            } else {
                out += String.fromCharCode(0xC0 | ((c >>  6) & 0x1F));
                out += String.fromCharCode(0x80 | ((c >>  0) & 0x3F));
            }
        }
        return out;
    },

    renderLogo: function(size){
        return (
            <View style={[styles.logoContainer]}>
                <View style={{ backgroundColor:"#fff",paddingLeft: 4, paddingRight: 4 , paddingTop: 4, paddingBottom: 4}}>
                    <Image style={[styles.logo, { width: size * 0.25, height: size * 0.25  }]}  source={require('../assets/images/icon-jar.png')} />
                </View>
            </View>
        )
    },


    render: function() {
        const size = this.props.size;
        const value = this.utf16to8(this.props.value);
        return (
            <ViewShot ref = {ref => this.viewRef = ref} style={{ backgroundColor:"#FFF", width: size + 10  , height: size + 10  }} >
                <View style={{paddingLeft: 0, paddingRight: 0 , paddingTop: 0, paddingBottom: 0, borderRadius: 15, borderWidth: 5, borderColor: AppColors.brand.light, overflow: 'hidden' }}>
                    <Canvas
                            context={{
                                size: size,
                                value: this.props.value,
                                bgColor: this.props.bgColor,
                                fgColor: this.props.fgColor,
                                cells: qr(value).modules,
                            }}
                            render={renderCanvas}
                            onLoad={this.props.onLoad}
                            onLoadEnd={this.props.onLoadEnd}
                            style={{height: size, width: size}}
                        />
                </View>

                {this.props.logo &&
                    this.renderLogo(size)
                }

            </ViewShot>
        );
    }
});



const styles = StyleSheet.create({
    logoContainer: {
        position: 'absolute',
        zIndex: 9999,
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center'
    },
    logo: {
        paddingLeft: 10,
        paddingRight: 10 ,
        paddingTop: 10,
        paddingBottom: 10,
        backgroundColor: '#fff'
    },

})


module.exports = QRCode;