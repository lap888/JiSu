import React, { Component } from 'react';
import {
    StyleSheet, Animated, TouchableOpacity,
    Text, View, Image, ScrollView, Modal, PermissionsAndroid
} from 'react-native';

import QRCode from 'react-native-qrcode-svg';
import CameraRoll from "@react-native-community/cameraroll";
import { captureRef } from 'react-native-view-shot';
import LinearGradient from 'react-native-linear-gradient';
import { Actions } from 'react-native-router-flux';
import { connect } from 'react-redux';
import Icon from "react-native-vector-icons/Ionicons";
import { Colors, Metrics } from '../../theme/Index';
import { WEB_PATH } from '../../../config/Index';
import { Toast } from '../../common';



class Invitation extends Component {
    constructor(props) {
        super(props);
        this.state = {
            qrcodeUrl: `${WEB_PATH}down?code=${this.props.code == "0" ? this.props.mobile : this.props.code}`,
            bottom: new Animated.Value(-156),
            opacity: new Animated.Value(0)
        }
    }
    /**
    * 取消分享
    */
    cancleObtainedBuyTransaction() {
        Actions.pop()
        Toast.tipBottom('取消分享')
    }
    /**
     * 保存
     */
    confirmObtainedBuyTransaction() {
        this.saveImage()
    }
    /**
     * 
     * @param {*} num 星期
     * @returns 
     */
    getWeek = (num) => {
        let week = '';
        if (num == 1) {
            week = '星期一'
        } else if (num == 2) {
            week = '星期二'
        } else if (num == 3) {
            week = '星期三'
        } else if (num == 4) {
            week = '星期四'
        } else if (num == 5) {
            week = '星期五'
        } else if (num == 6) {
            week = '星期六'
        } else {
            week = '星期日'
        }
        return week;
    }

    /**
     * 渲染二维码
     */
    renderQRCode() {
        let invitCode = this.props.rcode;
        let qrcodeUrl = `${WEB_PATH}?code=${invitCode}`;
        return (
            <View style={{ marginTop: 20, justifyContent: 'center', alignSelf: 'center' }}>
                <QRCode
                    value={qrcodeUrl}
                    logoSize={20}
                    size={100}
                    logoMargin={5}
                    logoBorderRadius={10}
                    logo={require('../../images/logo.png')}
                />
            </View>
        )
    }
    saveImage = async () => {
        if (Platform.OS == 'ios') {
            this.snapshot()
        } else {
            try {
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
                    {
                        title: "极速速藏想要使用您的相册存储权限",
                        message:
                            "没有您的存储权限将不能保存到相册",
                        buttonNeutral: "以后询问",
                        buttonPositive: "好的"
                    }
                );
                if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                    console.log("允许");
                    this.snapshot()
                } else {
                    console.log("不允许");
                }
            } catch (err) {
                console.warn(err);
            }
        }

    };

    snapshot = () => {
        if (!this.refs.shareViewShot) return;
        captureRef(
            this.refs.shareViewShot, {
            format: 'jpg',
            quality: 1,
            result: "tmpfile"
        }).then((uri) => {
            return CameraRoll.save(uri)
        }).then((res) => {
            Toast.tipBottom('已保存到相册，快去分享吧')
            Actions.pop()
        }).catch((err) => console.warn('err', err))
    }
    /**
    * 渲染分享
    */
    renderModalCancleBuyList() {
        return (
            <Modal animationType='slide' transparent onRequestClose={() => { }}>
                <View style={{ flex: 1 }}>
                    <View style={{ flex: 3, opacity: 0.9, paddingTop: Metrics.PADDING_BOTTOM, flexDirection: "column", justifyContent: 'flex-end', backgroundColor: Colors.exchangeBg }}>
                        <View style={{ flex: 1 }}>
                            <ScrollView contentContainerStyle={{ marginHorizontal: 20, marginTop: 20, alignItems: 'center' }}>
                                <LinearGradient ref="shareViewShot" colors={[Colors.White, Colors.main]} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={{ width: Metrics.screenWidth, backgroundColor: Colors.main, alignItems: 'center' }}>

                                    <Image style={{ width: 150, height: 60, marginTop: 30, borderRadius: 30, marginTop: 20, resizeMode: 'contain' }} source={require('../../images/sucang-l.png')}></Image>
                                    <View style={{ alignItems: 'center', justifyContent: 'center', width: Metrics.screenWidth - 60, backgroundColor: Colors.White, borderRadius: 10, marginBottom: 10 }}>
                                        <View style={{ width: Metrics.screenWidth - 80 }}>
                                            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 30 }}>
                                                <Image source={require('../../images/logo.png')} style={{ height: 30, width: 30, borderRadius: 10, marginLeft: 5 }} />
                                                <Text style={{ fontSize: 14, color: Colors.greyText, marginLeft: 10 }}>极速数藏·拉新</Text>
                                            </View>
                                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                                <Text style={{ fontSize: 18, fontWeight: '900', color: Colors.black, marginLeft: 5, marginTop: 10 }}>创世魔兽空投</Text>
                                                <View style={{ borderRadius: 3, borderWidth: 1, borderColor: Colors.main, height: 20, width: 80, marginTop: 10, marginRight: 10, flexDirection: 'row', alignItems: 'center' }}>
                                                    <View style={{ backgroundColor: Colors.main, borderBottomRightRadius: 3, borderTopRightRadius: 3, flex: 1, height: 20, alignItems: 'center', justifyContent: 'center' }}>
                                                        <Text style={{ fontSize: 11, color: Colors.White }}>限量</Text>
                                                    </View>
                                                    <View style={{ flex: 2, alignItems: 'center', justifyContent: 'center' }}>
                                                        <Text style={{ fontSize: 11, color: Colors.main, marginHorizontal: 3 }}>10000份</Text>
                                                    </View>
                                                </View>
                                            </View>
                                        </View>
                                        <Image style={{ width: Metrics.screenWidth - 80, height: 400, resizeMode: 'cover', marginTop: 10, borderRadius: 10 }} source={require('../../images/ms.jpg')}></Image>
                                        <View style={{ marginBottom: 10, marginTop: -70, alignItems: 'center' }}>
                                            {this.renderQRCode()}
                                            {this.props.code && <Text style={{ color: Colors.main, marginTop: 10, fontSize: 16, fontWeight: '500' }}>邀请码:{this.props.code}</Text>}
                                            <Text style={{ color: Colors.main, marginTop: 20, fontSize: 16, fontWeight: 'bold' }}>让每一次收藏都有惊喜</Text>
                                        </View>
                                    </View>
                                    <View style={{ alignItems: 'flex-start', justifyContent: 'center', paddingHorizontal: 40 }}>
                                        <Text style={{ color: Colors.White, fontSize: 14, fontWeight: 'bold' }}>1.拉新送极速数藏「创世魔兽」空投</Text>
                                        <Text style={{ color: Colors.White, marginTop: 10, marginBottom: 40, fontSize: 14, fontWeight: 'bold' }}>2.限量10000份先到先得</Text>
                                    </View>
                                </LinearGradient>
                            </ScrollView>
                        </View>
                    </View>
                    <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
                        <View style={{ marginTop: 1, alignItems: 'center' }}>
                            <Text style={{ color: Colors.main, fontSize: 18, fontWeight: 'bold', marginTop: 10 }}>分享</Text>
                            <TouchableOpacity onPress={() => this.confirmObtainedBuyTransaction()}>
                                <View style={{ alignItems: 'center', marginTop: 10 }}>
                                    <Icon name="arrow-down-circle-sharp" style={{ fontSize: 40, height: 40, color: Colors.Alipay }} />
                                    <Text style={{ color: Colors.lineColor }}>保存</Text>
                                </View>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => this.cancleObtainedBuyTransaction()}>
                                <View style={[{ height: 40, width: Metrics.screenWidth * 0.4, borderRadius: 5, justifyContent: 'center', alignItems: 'center' }, { backgroundColor: Colors.main, marginTop: 10 }]}>
                                    <Text style={{ fontSize: 16, color: Colors.White, fontWeight: 'bold' }}>取消</Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        )
    }
    render() {
        return (
            <View style={Styles.container}>
                {this.renderModalCancleBuyList()}
            </View>
        );
    }
}
const mapStateToProps = state => ({
    logged: state.user.logged,
    mobile: state.user.mobile,
    name: state.user.name,
    avatarUrl: state.user.avatarUrl,
    rcode: state.user.rcode
});
const mapDispatchToProps = dispatch => ({

});
export default connect(mapStateToProps, mapDispatchToProps)(Invitation);

const Styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.White },
    layout: { flexDirection: "row", paddingLeft: 10 },
    userPhoto: { width: 80, height: 80, borderRadius: 40, marginRight: 10 },
    layoutFont: { marginTop: 6, color: '#ffffff', fontSize: 17 },
    shareContainer: { position: 'absolute', backgroundColor: '#FFFFFF', height: 156, left: 0, right: 0, borderTopLeftRadius: 10, borderTopRightRadius: 10 },
    shareHeader: { alignSelf: 'center', padding: 20, fontSize: 16, fontWeight: "400" },
    shareBody: { flexDirection: 'row', paddingTop: 20 },
    shareItem: { justifyContent: 'center', alignItems: 'center', paddingLeft: 20 },
    shareImage: { justifyContent: 'center', alignItems: 'center', width: 50, height: 50 },
    shareText: { marginTop: 6 },
    shareFooter: { alignSelf: 'center', padding: 20 },
    shareFooterText: { fontSize: 16, fontWeight: "400" },
});
