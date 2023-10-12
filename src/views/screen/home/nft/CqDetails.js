import React, { Component } from 'react';
import {
    StyleSheet, Animated, ImageBackground, TouchableOpacity,
    Text, View, StatusBar, ScrollView, BackHandler
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { RefreshState } from 'react-native-refresh-list-view';
import { Actions } from 'react-native-router-flux';
import ModelView from 'react-native-gl-model-view';
import { Buffer } from 'buffer';
import axios from 'axios';
import Icon from "react-native-vector-icons/Ionicons";
import { Colors, Metrics } from '../../../theme/Index';
import { Loading } from '../../../components/Index';
import { Send } from '../../../../utils/Http';
import NftDetailModal from './NftDetailModal';
import { Toast } from '../../../common';
const octetStreamHeader = 'data:application/octet-stream;base64,';

const AnimatedModelView = Animated.createAnimatedComponent(ModelView);

export default class CqDetails extends Component {
    constructor(props) {
        super(props);
        this.rC = true;
        this.state = {

            rotateX: new Animated.Value(180),
            rotateY: new Animated.Value(0),
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
            data: this.props.item,
            detaList: [],
            pageSize: 5,
            pageIndex: 1,
            refreshState: true,
            moreData: true,
            haveBm: 0,
            luckNum: 0,
            myNum: 0

        };
    }
    componentDidMount = () => {
        if (Platform.OS == "android") {
            BackHandler.addEventListener('hardwareBackPress', this.pop);
        }
        setTimeout(() => {
            this.fetchDemonFromNetwork()
            this.getCqXNfts(1)
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
    //获取抽签数据
    getCqXNfts = (pageIndex) => {
        Send('api/Trade/GetCqXNfts', { NftId: this.state.data.id, PageIndex: pageIndex, PageSize: this.state.pageSize }).then(res => {
            if (res.code == 200) {
                this.setState({
                    detaList: this.state.pageIndex == 1 ? res.data.luckUsers : this.state.detaList.concat(res.data.luckUsers),
                    haveBm: res.data.haveBm,
                    luckNum: res.data.luckNum,
                    myNum: res.data.myNum,
                    refreshState: res.data.luckUsers.length < 1 ? RefreshState.EmptyData : RefreshState.Idle
                })
            } else {
                this.setState({
                    detaList: [],
                    totalPage: 0,
                    refreshState: RefreshState.EmptyData
                })
            }
        });
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
                    // 'https://github.com/rastapasta/react-native-gl-model-view/raw/master/example/data/demon.model',
                    // 'http://haowanhuaijiudownload.kumili.net/nft/boy.obj'
                    this.state.data.objPath
                )
                    .then(content => this.formatContent(content, 'data:geometry/obj;base64,')),
                this.getContentFromUrl(
                    // 'https://github.com/rastapasta/react-native-gl-model-view/raw/master/example/data/demon.png'
                    // 'http://haowanhuaijiudownload.kumili.net/nft/ms6.jpg'
                    this.state.data.picUv
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
                // rotateZ.setValue(i);
                rotateY.setValue(i);
                i += 0.5;
            }, 10);
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
                    // uri: 'boy.obj',
                    uri: this.state.model
                }}
                texture={{
                    // uri: 'boy.png',
                    uri: this.state.texture
                }}
                onStartShouldSetResponder={() => true}
                onloadend={this.onLoadEnd()}
                animate={!!fromXY}
                tint={{ r: 1.0, g: 1.0, b: 1.0, a: 1.0 }}
                scale={0.015}
                rotateX={rotateX}
                rotateY={rotateY}
                rotateZ={rotateZ}
                translateZ={-5}
                translateY={1}
                translateX={0}
                style={[styles.container, {}]}
            />
        );
    }
    onMessage = (e) => {
        const data = JSON.parse(e.nativeEvent.data);
        if (data.height) {
            this.setState({
                webViewHeight: data.height < 500 ? 500 : data.height
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
        if (this.state.type == '抽签') {
            let params = { pwd: value.pwd, price: value.price, hash: this.state.data.cHash, nftId: this.state.data.id };
            Send('api/Trade/CqXNft', params).then(res => {
                if (res.code == 200) {
                    Toast.tipBottom('抽签成功')
                    this.getCqXNfts(1)
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

    renderItemZj = (data) => {
        if (data != undefined && data.length > 0) {
            return (
                data.map((item, index) =>
                    <View key={index} style={[styles.item, { flex: 1 }]}>
                        <View style={{ flexDirection: 'row', flex: 1 }}>
                            <View style={{ alignItems: 'center', justifyContent: 'center', flex: 1 }}>
                                <Text style={{ fontSize: 12, color: Colors.C10, }}>中签序列:  </Text>
                                <Text style={{ fontSize: 12, color: Colors.C12 }}>{item.luckNum}</Text>
                            </View>
                            <View style={{ alignItems: 'center', justifyContent: 'center', flex: 1 }}>
                                <Text style={{ fontSize: 12, color: Colors.C10, }}>中签人:  </Text>
                                <Text style={{ fontSize: 12, color: Colors.C12 }}>{item.name}</Text>
                            </View>
                            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                                <Text style={{ fontSize: 12, color: Colors.C10, }}>手机号</Text>
                                <Text style={{ fontSize: 12, color: Colors.C12, marginTop: 3 }}>{item.mobile}</Text>
                            </View>
                        </View>
                    </View>
                )
            )
        }

    }
    render() {
        const { model, texture, showChart, data, detaList } = this.state;
        let _html = `<!DOCTYPE html>
        <html>
        <meta name="viewport" content="width=device-width,initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no"/>
        <body>
        ${data.remark}
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
                        </View>
                        <View style={{ flex: 1, justifyContent: 'center' }}>
                            {model && texture
                                ? this.renderModel(this.props, this.state)
                                : this.renderControls(this.props, this.state)
                            }
                        </View>
                    </ImageBackground>
                    {/* 1 */}
                    <View style={{ marginHorizontal: 10, borderRadius: 5, marginTop: -50, backgroundColor: Colors.White, paddingBottom: 20 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                            <Text style={{ fontSize: 18, fontWeight: '900', color: Colors.black, marginLeft: 5, marginTop: 10 }}>「{data.name}」</Text>
                            <Text style={{ fontSize: 18, fontWeight: '900', color: Colors.notice, marginTop: 10, marginRight: 10 }}>抽签</Text>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', marginBottom: 10, marginTop: 10, marginLeft: 10 }}>
                            <Text style={{ fontSize: 13, fontWeight: '900', color: Colors.greyText, marginTop: 10, marginRight: 3 }}>报名:</Text>
                            <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                                <Text style={{ fontSize: 13, fontWeight: '900', color: Colors.greyText, marginTop: 10, marginLeft: 3 }}>{data.bTime}至{data.eTime}</Text>
                            </View>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', marginBottom: 10, marginLeft: 10 }}>
                            <Text style={{ fontSize: 13, fontWeight: '900', color: Colors.greyText, marginTop: 10, marginRight: 3 }}>抽签:</Text>
                            <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                                <Text style={{ fontSize: 13, fontWeight: '900', color: Colors.greyText, marginTop: 10, marginLeft: 3 }}>{data.eTime}</Text>
                            </View>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginVertical: 10, marginTop: 20, marginLeft: 10 }}>
                            <View style={{ borderRadius: 3, borderWidth: 1, borderColor: Colors.main, height: 20, width: 120, marginRight: 10, flexDirection: 'row', alignItems: 'center' }}>
                                <View style={{ backgroundColor: Colors.main, borderBottomRightRadius: 3, borderTopRightRadius: 3, flex: 2, height: 20, alignItems: 'center', justifyContent: 'center' }}>
                                    <Text style={{ fontSize: 11, color: Colors.White }}>已报名</Text>
                                </View>
                                <View style={{ flex: 3, alignItems: 'center', justifyContent: 'center' }}>
                                    <Text style={{ fontSize: 11, color: Colors.main, marginHorizontal: 3 }}>{this.state.haveBm} 人</Text>
                                </View>
                            </View>
                            <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                                <Text style={{ fontSize: 16, fontWeight: '900', color: Colors.notice, marginRight: 3 }}>{data.price}</Text>
                                <Text style={{ fontSize: 13, fontWeight: '900', color: Colors.notice, marginTop: 1, marginRight: 10 }}>{data.type == 0 ? 'GC' : '碎片'}</Text>
                            </View>
                        </View>
                    </View>
                    {/* 2 */}
                    <View style={{ marginHorizontal: 10, borderRadius: 5, marginTop: 10, backgroundColor: Colors.White, paddingBottom: 20 }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', marginLeft: 10, marginTop: 10 }}>
                            <View style={[{ height: 20, width: 3, borderRadius: 1 }, { backgroundColor: Colors.main }]} />
                            <Text style={{ fontSize: 18, fontWeight: '900', color: Colors.black, marginLeft: 5 }}>幸运数字</Text>
                        </View>

                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 }}>
                            <Text style={{ fontSize: 13, color: Colors.greyText, marginHorizontal: 3, marginLeft: 10 }}>本轮幸运数字:</Text>
                            <View style={{ alignItems: 'center', marginRight: 10 }}>
                                <Icon name="md-copy-outline" color={Colors.main} size={16} />
                            </View>
                        </View>
                        <Text style={{ fontSize: 13, color: Colors.greyText, marginHorizontal: 3, marginLeft: 10 }}>{this.state.luckNum == 0 || this.state.luckNum == -1 ? '暂未公布' : this.state.luckNum}</Text>

                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 }}>
                            <Text style={{ fontSize: 13, color: Colors.greyText, marginHorizontal: 3, marginLeft: 10 }}>我的签名:</Text>
                            <View style={{ alignItems: 'center', marginRight: 10 }}>
                                <Icon name="md-copy-outline" color={Colors.main} size={16} />
                            </View>
                        </View>
                        <Text style={{ fontSize: 13, color: Colors.greyText, marginHorizontal: 3, marginLeft: 10 }}>{this.state.myNum == 0 || this.state.myNum == -1 ? '未抽签' : this.state.myNum}</Text>
                    </View>
                    {/* 3 */}
                    <View style={{ marginHorizontal: 10, borderRadius: 5, marginTop: 10, backgroundColor: Colors.White, paddingBottom: 20 }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', marginLeft: 10, marginTop: 10 }}>
                            <View style={[{ height: 20, width: 3, borderRadius: 1 }, { backgroundColor: Colors.main }]} />
                            <Text style={{ fontSize: 18, fontWeight: '900', color: Colors.black, marginLeft: 5 }}>中奖名单</Text>
                        </View>
                        {this.renderItemZj(this.state.detaList)}
                        <TouchableOpacity onPress={() => Actions.CqItem({ data: this.state.data })} style={[styles.item, { flex: 1, justifyContent: 'center', alignItems: 'center' }]}>
                            <Text style={{ color: Colors.greyText }}>查看全部</Text>
                        </TouchableOpacity>
                    </View>
                    {/* 4 */}
                    <View style={{ marginHorizontal: 10, borderRadius: 5, marginTop: 10, backgroundColor: Colors.White, paddingBottom: 20 }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', marginLeft: 10, marginTop: 10 }}>
                            <View style={[{ height: 20, width: 3, borderRadius: 1 }, { backgroundColor: Colors.main }]} />
                            <Text style={{ fontSize: 18, fontWeight: '900', color: Colors.black, marginLeft: 5 }}>活动简介</Text>
                        </View>
                        <Text style={{ fontSize: 14, color: Colors.black, marginHorizontal: 3, marginLeft: 10, marginTop: 10 }}>
                            1.抽签报名时间截止后,系统会在0-9之间,随机生成一个幸运数字。
                        </Text>
                        <Text style={{ fontSize: 14, color: Colors.black, marginHorizontal: 3, marginLeft: 10, marginTop: 10 }}>
                            2.参与抽签用户抽到的签名的尾号和幸运数字一致,则获得此藏品的购买资格。
                        </Text>
                        <Text style={{ fontSize: 14, color: Colors.black, marginHorizontal: 3, marginLeft: 10, marginTop: 10 }}>
                            3.举例,本轮幸运数字是[3],小明抽到了[1003],小王抽到了[203],小李抽到了[306],则小明和小王为中签,小李未中签。
                        </Text>
                    </View>
                    {/* 5 */}
                    <View style={{ marginHorizontal: 10, borderRadius: 5, marginTop: 10, backgroundColor: Colors.White, paddingBottom: 20 }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', marginLeft: 10, marginTop: 10 }}>
                            <View style={[{ height: 20, width: 3, borderRadius: 1 }, { backgroundColor: Colors.main }]} />
                            <Text style={{ fontSize: 18, fontWeight: '900', color: Colors.black, marginLeft: 5 }}>规则说明</Text>
                        </View>
                        <Text style={{ fontSize: 14, color: Colors.black, marginHorizontal: 3, marginLeft: 10, marginTop: 10 }}>
                            1.每一轮抽签，一个账号，只能抽签一次。
                        </Text>
                        <Text style={{ fontSize: 14, color: Colors.black, marginHorizontal: 3, marginLeft: 10, marginTop: 10 }}>
                            2.抽签一次需要消耗1GC。
                        </Text>
                        <Text style={{ fontSize: 14, color: Colors.black, marginHorizontal: 3, marginLeft: 10, marginTop: 10 }}>
                            3.抽签结果公布后,请及时去购买藏品。
                        </Text>
                    </View>
                </ScrollView>

                <View style={{ height: 50, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, backgroundColor: Colors.White }}>
                    <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                        <Text style={{ fontSize: 18, fontWeight: '900', color: Colors.notice, marginTop: 10, marginRight: 3 }}>{data.price}</Text>
                        <Text style={{ fontSize: 13, fontWeight: '900', color: Colors.notice, marginTop: 12, marginRight: 10 }}>{data.type == 0 ? 'GC' : '碎片'}</Text>
                    </View>
                    {data.status == 0 ?
                        <TouchableOpacity style={{ width: 200, height: 40, borderRadius: 20 }} onPress={() => this.setModle(true, '抽签')}>
                            <LinearGradient colors={[Colors.LightG, Colors.main]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ flex: 1, borderRadius: 20, justifyContent: 'center', alignItems: 'center' }}>
                                <Text style={{ fontSize: 16, color: Colors.White }}>抽签</Text>
                            </LinearGradient>
                        </TouchableOpacity> :
                        <TouchableOpacity style={{ width: 200, height: 40, borderRadius: 20 }} onPress={() => Toast.tipBottom('活动已结束')}>
                            <LinearGradient colors={[Colors.grayFont, Colors.greyText]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ flex: 1, borderRadius: 20, justifyContent: 'center', alignItems: 'center' }}>
                                <Text style={{ fontSize: 16, color: Colors.White }}>活动已结束</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    }

                </View>
                {this.renderDialog()}
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
    item: {
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: Colors.C13,
        paddingHorizontal: 10
    },
});
