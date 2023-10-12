import React, { Component } from 'react';
import {
    StyleSheet, Animated, ImageBackground, TouchableOpacity,
    Text, View, StatusBar, Image, ScrollView, BackHandler, Modal, PermissionsAndroid
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import moment from 'moment';
import CameraRoll from "@react-native-community/cameraroll";
import { captureRef } from 'react-native-view-shot';
import LinearGradient from 'react-native-linear-gradient';
import { Actions } from 'react-native-router-flux';
import WebView from 'react-native-webview';
import ModelView from 'react-native-gl-model-view';
import { Buffer } from 'buffer';
import axios from 'axios';
import Icon from "react-native-vector-icons/Ionicons";
import { Colors, Metrics } from '../../../theme/Index';
import { WEB_PATH } from '../../../../config/Index';
import { Header, Loading } from '../../../components/Index';
import { Send } from '../../../../utils/Http';
import NftDetailModal from './NftDetailModal';
import { Toast } from '../../../common';
const octetStreamHeader = 'data:application/octet-stream;base64,';

const AnimatedModelView = Animated.createAnimatedComponent(ModelView);

export default class Details extends Component {
    constructor(props) {
        super(props);
        this.rC = true;
        this.state = {

            rotateX: new Animated.Value(90),
            rotateY: new Animated.Value(180),
            rotateZ: new Animated.Value(180),
            fromXY: undefined,
            valueXY: undefined,

            model: null,
            texture: null,
            error: null,
            loading: true,
            webViewHeight: 500,
            showChart: false,
            type: '',
            specModle: false,
            modalObtainedBuyListVisible: false,
            qrcodeUrl: '',
            data: this.props.item

        };
    }
    componentDidMount = () => {
        if (Platform.OS == "android") {
            BackHandler.addEventListener('hardwareBackPress', this.pop);
        }
        setTimeout(() => {
            this.fetchDemonFromNetwork()
        }, 1000);

    };
    pop = () => {
        this.setState({ showChart: false })
        setTimeout(() => {
            Actions.pop();
        }, 200);
        return true;
    }
    componentWillUnmount() {
        this.timer && clearInterval(this.timer);
        if (Platform.OS == 'android') {
            // 删除监听事件
            BackHandler.removeEventListener('hardwareBackPress', this.pop);
        }
    }
    getContentFromUrl(url, decode = false) {
        return axios({
            method: 'get',
            url,
            responseType: 'blob',
        }).then(
            res =>
                new Promise((resolve, reject) => {
                    const fileReader = new FileReader();
                    // fileReader.onloadend = () => resolve(fileReader.result);
                    fileReader.onloadend = () =>
                        resolve(
                            decode
                                ? new Buffer(fileReader.result, 'base64')
                                : fileReader.result,
                        );
                    fileReader.onerror = reject;
                    fileReader.readAsDataURL(res.data);
                }),
        );
    }
    formatContent(uri, header) {
        return `${header}${uri.substring(octetStreamHeader.length)}`;
    }

    fetchDemonFromNetwork = async () => {
        this.setState({
            error: null,
        });
        try {
            const binaries = await Promise.all([
                this.getContentFromUrl(
                    'http://qzoneqc.shop/uploads/003698b8852842e7949536ace6204162.obj'
                    // 'https://github.com/rastapasta/react-native-gl-model-view/raw/master/example/data/demon.model',
                    // 'http://haowanhuaijiudownload.kumili.net/nft/boy.obj'
                    // this.state.data?.objPath
                )
                    .then(content => this.formatContent(content, 'data:geometry/obj;base64,')),
                this.getContentFromUrl(
                    'http://qzoneqc.shop/uploads/35d7dd334bdb443195a948cb57ab293e.png'
                    // 'http://qzoneqc.shop/uploads/48515aab06b748a0a25f09ab9e46302f.png'
                    // 'https://github.com/rastapasta/react-native-gl-model-view/raw/master/example/data/demon.png'
                    // 'http://haowanhuaijiudownload.kumili.net/nft/ms6.jpg'
                    // this.state.data?.picUv
                ),
            ]);
            const model = binaries[0];
            const texture = binaries[1];
            this.setState({
                model,
                texture,
                loading: false,
                error: null,
                showChart: true
            });
        } catch (e) {
            return this.setState({
                loading: false,
                error: e || new Error('Something unexpected has happened.'),
            });
        }
    };
    onLoadEnd = () => {
        let { rotateZ, rotateY, rotateX, translateZ } = this.state;
        let i = 1;
        if (this.rC) {
            this.timer = setInterval(() => {
                if (i > 360) {
                    i = 0;
                }
                // rotateX.setValue(i);
                rotateZ.setValue(i);
                // rotateY.setValue(i);
                i += 0.5;
            }, 20);
            this.rC = false;
        }
    }
    renderControls(nextProps, nextState) {
        const { error, loading } = nextState;
        return (
            <View style={{ justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>

                {!!loading && <Loading />}
                {!!loading && <Text style={{ color: Colors.White, marginTop: 15 }}>加载中...</Text>}
            </View>
        );
    }
    renderModel(nextProps, nextState) {
        let { rotateZ, rotateX, rotateY, fromXY } = this.state;
        return (
            <AnimatedModelView
                model={{
                    uri: 'demon.obj',
                    // uri: 'boy.obj',
                    // uri: this.state.model
                }}
                texture={{
                    uri: 'demon.png',
                    // uri: 'boy.png',
                    // uri: this.state.texture
                }}
                onStartShouldSetResponder={() => true}
                onloadend={this.onLoadEnd()}
                animate={!!fromXY}
                tint={{ r: 1.0, g: 1.0, b: 1.0, a: 1.0 }}
                scale={0.0085}
                rotateX={rotateX}
                rotateY={rotateY}
                rotateZ={rotateZ}
                translateZ={-5}
                translateY={0.5}
                translateX={0}
                style={[styles.container, {}]}
            />
        );
    }
    onMessage = (e) => {
        const data = JSON.parse(e.nativeEvent.data);
        if (data?.height) {
            this.setState({
                webViewHeight: data?.height < 500 ? 500 : data?.height
            });
        }
    }
    webViewLoadedEnd = () => {
        this.webview.injectJavaScript(`
                const height = document.body.clientHeight;
                window.ReactNativeWebView.postMessage(JSON.stringify({height: height}));
            `);
    }
    setModle = (setModle, type = '') => {
        if (type != '') {
            this.setState({ specModle: setModle, type: type })
        } else {
            this.setState({ specModle: setModle })
        }
    }
    enterOrder = (value) => {
        if (this.state.type == '购买') {
            let params = { pwd: value.pwd, price: value.price, hash: this.state.data?.cHash, nftId: this.state.data?.id };
            Send('api/Trade/BuyXNft', params).then(res => {
                if (res.code == 200) {
                    Toast.tipBottom('购买成功')
                } else {
                    Toast.tipBottom(res.message)
                }
            });
        }
        this.setModle(false)
    }
    renderDialog = () => {
        return (
            this.state.specModle && <NftDetailModal ref={(modal) => this.tipsModal = modal} enterOrder={(value) => this.enterOrder(value)} close={() => this.setModle(false)} type={this.state.type} />
        );
    }
    /**
     * 取消分享
     */
    cancleObtainedBuyTransaction() {
        this.setState({ modalObtainedBuyListVisible: false });
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
        let invitCode = this.props.code;
        let qrcodeUrl = `${WEB_PATH}?code=${invitCode}`;
        return (
            <View style={{ marginTop: 20, justifyContent: 'center', alignSelf: 'center' }}>
                <QRCode
                    value={qrcodeUrl}
                    logoSize={20}
                    size={100}
                    logoMargin={5}
                    logoBorderRadius={10}
                    logo={require('../../../images/logo.png')}
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
            this.setState({ modalObtainedBuyListVisible: false });
        }).catch((err) => console.warn('err', err))
    }
    /**
    * 渲染分享
    */
    renderModalCancleBuyList() {
        let { modalObtainedBuyListVisible,data } = this.state;
        return (
            <Modal animationType='slide' visible={modalObtainedBuyListVisible} transparent onRequestClose={() => { }}>
                <View style={{ flex: 1 }}>
                    <View style={{ flex: 3, opacity: 0.9, paddingTop: Metrics.PADDING_BOTTOM, flexDirection: "column", justifyContent: 'flex-end', backgroundColor: Colors.exchangeBg }}>
                        <View style={{ flex: 1 }}>
                            <ScrollView contentContainerStyle={{ marginHorizontal: 20, marginTop: 20, alignItems: 'center' }}>
                                <LinearGradient ref="shareViewShot" colors={[Colors.White, Colors.main]} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={{ width: Metrics.screenWidth, backgroundColor: Colors.main, alignItems: 'center' }}>
                                    <Image style={{ width: 150, height: 60, marginTop: 30, borderRadius: 30, marginTop: 20, resizeMode: 'contain' }} source={require('../../../images/sucang-l.png')}></Image>
                                    <View style={{ alignItems: 'center', justifyContent: 'center', width: Metrics.screenWidth - 60, backgroundColor: Colors.White, borderRadius: 10, marginBottom: 40 }}>
                                        <View style={{ width: Metrics.screenWidth - 80 }}>
                                            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 30 }}>
                                                <Image source={{uri:data?.auPic}} style={{ height: 30, width: 30, borderRadius: 10, marginLeft: 5 }} />
                                                <Text style={{ fontSize: 14, color: Colors.greyText, marginLeft: 10 }}>{data?.auName}</Text>
                                            </View>
                                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                                <Text style={{ fontSize: 18, fontWeight: '900', color: Colors.black, marginLeft: 5, marginTop: 10 }}>{data?.name}</Text>
                                                <View style={{ borderRadius: 3, borderWidth: 1, borderColor: Colors.main, height: 20, width: 80, marginTop: 10, marginRight: 10, flexDirection: 'row', alignItems: 'center' }}>
                                                    <View style={{ backgroundColor: Colors.main, borderBottomRightRadius: 3, borderTopRightRadius: 3, flex: 1, height: 20, alignItems: 'center', justifyContent: 'center' }}>
                                                        <Text style={{ fontSize: 11, color: Colors.White }}>限量</Text>
                                                    </View>
                                                    <View style={{ flex: 2, alignItems: 'center', justifyContent: 'center' }}>
                                                        <Text style={{ fontSize: 11, color: Colors.main, marginHorizontal: 3 }}>{data?.amount}份</Text>
                                                    </View>
                                                </View>
                                            </View>
                                        </View>
                                        <Image style={{ width: Metrics.screenWidth - 80, height: 400, resizeMode: 'cover', marginTop: 10, borderRadius: 10 }} source={{ uri: data?.pic }}></Image>
                                        <View style={{ marginBottom: 10, marginTop: -70, alignItems: 'center' }}>
                                            {this.renderQRCode()}
                                            {this.props.code && <Text style={{ color: Colors.main, marginTop: 5, fontSize: 16, fontWeight: '500' }}>邀请码:{this.props.code}</Text>}
                                            <Text style={{ color: Colors.main, marginTop: 10, fontSize: 16, fontWeight: 'bold' }}>让每一次收藏都有惊喜</Text>
                                        </View>
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
        const { model, texture, showChart, data } = this.state;
        let _html = `<!DOCTYPE html>
        <html>
        <meta name="viewport" content="width=device-width,initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no"/>
        <body>
        ${data?.remark}
        <script>
        function ResizeImages(){
          var myimg;
          for(i=0;i <document.images.length;i++){
            myimg = document.images[i];
            myimg.width = ${Metrics.screenWidth - 40};
          }
        }
        window.onload=function(){ 
          ResizeImages()
          window.location.hash = '#' + document.body.clientHeight;
          document.title = document.body.clientHeight;
        }
        </script></body></html>`
        return (
            <View style={styles.container}>
                <StatusBar translucent={true} backgroundColor={Colors.transparent} />
                <ScrollView style={{ flex: 1 }}>
                    <ImageBackground source={require('../../../images/bg.jpg')} resizeMode='cover' style={{ width: Metrics.screenWidth, height: Metrics.screenHeight * 2 / 3 }}>
                        <View style={{ height: 40, marginTop: Metrics.STATUSBAR_HEIGHT, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                            <TouchableOpacity onPress={() => this.pop()} style={{ backgroundColor: Colors.leftButBg, justifyContent: 'center', alignItems: 'center', height: 40, width: 40, marginLeft: 20, marginTop: 20, borderRadius: 20 }}>
                                <Icon name="md-chevron-back" color={Colors.White} size={22} />
                            </TouchableOpacity>
                            {/*  */}
                            <TouchableOpacity onPress={() => { this.setState({ modalObtainedBuyListVisible: true }) }} style={{ backgroundColor: Colors.leftButBg, justifyContent: 'center', alignItems: 'center', height: 40, width: 40, marginRight: 20, marginTop: 20, borderRadius: 20 }}>
                                <Icon name="ios-share-outline" color={Colors.White} size={22} />
                            </TouchableOpacity>
                        </View>
                        <View style={{ flex: 1, justifyContent: 'center' }}>
                            {model && texture
                                ? this.renderModel(this.props, this.state)
                                : this.renderControls(this.props, this.state)
                            }
                        </View>
                    </ImageBackground>
                    {/* 1 */}
                    <View style={{ marginHorizontal: 10, borderRadius: 5, marginTop: -40, backgroundColor: Colors.White, paddingBottom: 20 }}>
                        <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                            <Text style={{ fontSize: 18, fontWeight: '900', color: Colors.black, marginLeft: 5, marginTop: 10 }}>{data?.name}</Text>
                            <Text style={{ fontSize: 13, fontWeight: '600', color: Colors.greyText, marginLeft: 5, marginTop: 10 }}>{data?.typeName}</Text>
                            {/* <Text style={{ fontSize: 18, fontWeight: '900', color: Colors.notice, marginTop: 10, marginRight: 10 }}>￥29.9</Text> */}
                            <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                                <Text style={{ fontSize: 18, fontWeight: '900', color: Colors.notice, marginTop: 10, marginRight: 3 }}>{data?.price}</Text>
                                <Text style={{ fontSize: 13, fontWeight: '900', color: Colors.notice, marginTop: 12, marginRight: 10 }}>{data?.type == 0 ? 'GC' : '碎片'}</Text>
                            </View>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                            <View style={{ borderRadius: 3, borderWidth: 1, borderColor: Colors.main, height: 20, width: 80, marginLeft: 10, flexDirection: 'row', alignItems: 'center' }}>
                                <View style={{ flex: 2, alignItems: 'center', justifyContent: 'center' }}>
                                    <Text style={{ fontSize: 11, color: Colors.main, marginHorizontal: 3 }}>{data?.amount}份</Text>
                                </View>
                                <View style={{ backgroundColor: Colors.main, borderBottomRightRadius: 3, borderTopRightRadius: 3, flex: 1, height: 20, alignItems: 'center', justifyContent: 'center' }}>
                                    <Text style={{ fontSize: 11, color: Colors.White }}>限量</Text>
                                </View>
                            </View>
                            <View style={{ borderRadius: 3, borderWidth: 1, borderColor: Colors.Limit, height: 20, padding: 5, marginRight: 10, flexDirection: 'row', alignItems: 'center' }}>
                                <Text style={{ fontSize: 11, color: Colors.Limit, marginHorizontal: 3 }}>剩余{data?.amount - data?.hAmount}份</Text>
                            </View>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 15 }}>
                            <Image source={{ uri: data?.auPic }} style={{ height: 30, width: 30, borderRadius: 10, marginLeft: 10 }} />
                            <Text style={{ fontSize: 14, color: Colors.greyText, marginLeft: 10 }}>{data?.auName}</Text>
                        </View>
                    </View>
                    {/* 2 */}
                    <View style={{ marginHorizontal: 10, borderRadius: 5, marginTop: 10, backgroundColor: Colors.White, paddingBottom: 20 }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', marginLeft: 10, marginTop: 10 }}>
                            <View style={[{ height: 20, width: 3, borderRadius: 1 }, { backgroundColor: Colors.main }]} />
                            <Text style={{ fontSize: 18, fontWeight: '900', color: Colors.black, marginLeft: 5 }}>认证信息</Text>
                        </View>

                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 }}>
                            <Text style={{ fontSize: 13, color: Colors.greyText, marginHorizontal: 3, marginLeft: 10 }}>链上HASH</Text>
                            <View style={{ alignItems: 'center', marginRight: 10 }}>
                                <Icon name="md-copy-outline" color={Colors.main} size={16} />
                            </View>
                        </View>
                        <Text style={{ fontSize: 13, color: Colors.black, marginHorizontal: 3, marginLeft: 10 }}>{data?.chainHash}</Text>

                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 }}>
                            <Text style={{ fontSize: 13, color: Colors.greyText, marginHorizontal: 3, marginLeft: 10 }}>合约地址</Text>
                            <View style={{ alignItems: 'center', marginRight: 10 }}>
                                <Icon name="md-copy-outline" color={Colors.main} size={16} />
                            </View>
                        </View>
                        <Text style={{ fontSize: 13, color: Colors.black, marginHorizontal: 3, marginLeft: 10 }}>{data?.cHash}</Text>
                    </View>
                    {/* 3 */}
                    <View style={{ marginHorizontal: 10, borderRadius: 5, marginTop: 10, backgroundColor: Colors.White, paddingBottom: 20 }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', marginLeft: 10, marginTop: 10 }}>
                            <View style={[{ height: 20, width: 3, borderRadius: 1 }, { backgroundColor: Colors.main }]} />
                            <Text style={{ fontSize: 18, fontWeight: '900', color: Colors.black, marginLeft: 5 }}>藏品故事</Text>
                        </View>
                        {showChart ? <View style={{ paddingHorizontal: 5, marginTop: 5 }}>
                            <View style={{ height: this.state.webViewHeight, marginTop: 5 }}>
                                <WebView
                                    ref={(ref) => this.webview = ref}
                                    style={{ flex: 1, height: this.state.webViewHeight }}
                                    source={{ html: _html }}
                                    originWhitelist={["*"]}
                                    onMessage={this.onMessage}
                                    onLoadEnd={this.webViewLoadedEnd}
                                    javaScriptEnabled={true}
                                />
                            </View>
                        </View> : null}

                    </View>
                    {/* 4 */}
                    <View style={{ marginHorizontal: 10, borderRadius: 5, marginTop: 10, backgroundColor: Colors.White, paddingBottom: 20 }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', marginLeft: 10, marginTop: 10 }}>
                            <View style={[{ height: 20, width: 3, borderRadius: 1 }, { backgroundColor: Colors.main }]} />
                            <Text style={{ fontSize: 18, fontWeight: '900', color: Colors.black, marginLeft: 5 }}>作品信息</Text>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 }}>
                            <Text style={{ fontSize: 13, color: Colors.greyText, marginHorizontal: 3, marginLeft: 10 }}>发行方</Text>
                            <Text style={{ fontSize: 13, color: Colors.black, marginHorizontal: 3, marginLeft: 10, marginRight: 10 }}>{data?.fxName}</Text>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 }}>
                            <Text style={{ fontSize: 13, color: Colors.greyText, marginHorizontal: 3, marginLeft: 10 }}>创作者</Text>
                            <Text style={{ fontSize: 13, color: Colors.black, marginHorizontal: 3, marginLeft: 10, marginRight: 10 }}>{data?.auName}</Text>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 }}>
                            <Text style={{ fontSize: 13, color: Colors.greyText, marginHorizontal: 3, marginLeft: 10 }}>发行时间</Text>
                            <Text style={{ fontSize: 13, color: Colors.black, marginHorizontal: 3, marginLeft: 10, marginRight: 10 }}>{data?.cTime}</Text>
                        </View>
                    </View>
                    {/* 5 */}
                    <View style={{ marginHorizontal: 10, borderRadius: 5, marginTop: 10, backgroundColor: Colors.White, paddingBottom: 20 }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', marginLeft: 10, marginTop: 10 }}>
                            <View style={[{ height: 20, width: 3, borderRadius: 1 }, { backgroundColor: Colors.main }]} />
                            <Text style={{ fontSize: 18, fontWeight: '900', color: Colors.black, marginLeft: 5 }}>权益说明</Text>
                        </View>
                        <Text style={{ fontSize: 14, color: Colors.black, marginHorizontal: 3, marginLeft: 10, marginTop: 10 }}>
                            数字藏品为虚拟数字商品，而非实物，仅限实名认证为年满18周岁的中国大陆用户购买。
                        </Text>
                        <Text style={{ fontSize: 14, color: Colors.black, marginHorizontal: 3, marginLeft: 10, marginTop: 10 }}>
                            数字藏品的版权由发行方或原创者拥有，除另行取得版权拥有者书面同意外，用户不得将数字藏品用于任何商业用途。
                        </Text>
                        <Text style={{ fontSize: 14, color: Colors.black, marginHorizontal: 3, marginLeft: 10, marginTop: 10 }}>
                            本商品一经售出，不支持退换。本商品源文件不支持本地下载。
                        </Text>
                    </View>
                </ScrollView>
                <View style={{ height: 50, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, backgroundColor: Colors.White }}>
                    {/* <View style={{ flex: 1, flexDirection: 'row', marginRight: 10, marginLeft: 10 }}>
                        <Text style={{ fontSize: 18, fontWeight: '900', color: Colors.notice }}>￥29.9</Text>
                    </View> */}
                    <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                        <Text style={{ fontSize: 18, fontWeight: '900', color: Colors.notice, marginTop: 10, marginRight: 3 }}>{data?.price}</Text>
                        <Text style={{ fontSize: 13, fontWeight: '900', color: Colors.notice, marginTop: 12, marginRight: 10 }}>{data?.type == 0 ? 'GC' : '碎片'}</Text>
                    </View>
                    {data?.cqStatus == 1 || data?.type == 1 ?
                        <TouchableOpacity style={{ width: 200, height: 40, borderRadius: 20 }} onPress={() => this.setModle(true, '购买')}>
                            <LinearGradient colors={[Colors.LightG, Colors.main]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ flex: 1, borderRadius: 20, justifyContent: 'center', alignItems: 'center' }}>
                                <Text style={{ fontSize: 16, color: Colors.White }}>立即购买</Text>
                            </LinearGradient>
                        </TouchableOpacity> :
                        <TouchableOpacity style={{ width: 200, height: 40, borderRadius: 20 }} onPress={() => Toast.tipBottom('请去抽签获得购买资格')}>
                            <LinearGradient colors={[Colors.grayFont, Colors.greyText]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ flex: 1, borderRadius: 20, justifyContent: 'center', alignItems: 'center' }}>
                                <Text style={{ fontSize: 16, color: Colors.White }}>暂无购买资格</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    }

                </View>
                {this.renderDialog()}
                {this.renderModalCancleBuyList()}
            </View>
        );
    }
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'transparent',
    },
    controls: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    controlBox: {
        justifyContent: 'center',
        alignItems: 'center',
        padding: 15,
        borderRadius: 5,
    },
    controlTextError: {
        color: 'red',
        fontSize: 30,
    },
    controlText: {
        color: 'red',
        fontSize: 30,

    },
});
