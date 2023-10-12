import React, { Component } from 'react';
import { View, Text, BackHandler, ToastAndroid, Platform, ImageBackground, Modal, RefreshControl, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import Swiper from 'react-native-swiper';
import WebView from 'react-native-webview';
import { Actions } from 'react-native-router-flux';
import Icon from "react-native-vector-icons/Ionicons";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import { connect } from 'react-redux';
import { UPDATE_NOTICE_INFO, UPDATE_USER, UPDATE_NOTICE_STATUS, UPDATE_USER_LOCATION } from '../../../redux/ActionTypes';
import { Version } from '../../../config/Index';
import { Colors, Metrics } from '../../theme/Index';
import { Send } from '../../../utils/Http';
import { Toast } from '../../common';
import { onPressSwiper } from '../../../utils/CommonFunction';
import { ShopApi } from '../../../api';
import { RefreshState } from 'react-native-refresh-list-view';
import { Body, Card, CardItem } from 'native-base';
import { Header, CountDownReact } from '../../components/Index';
// 基本信息
let BASICINFO_BAR = [
    { key: "4", title: "邀请好友", router: 'Invitation', icon: 'qrcode' },
    { key: "2", title: "新手指南", router: 'College', icon: 'tachometer' },
    { key: "7", title: "个人资产", icon: 'btc', router: 'SelfZc' },
    { key: "5", title: "问题反馈", icon: 'bug', router: 'TaskApeal' },

];
class Home extends Component {
    constructor(props) {
        super(props);
        this.state = {
            bannerList: [],
            propagandaList: [],
            msgData: [],
            oneMsgData: {},
            webViewHeight: 500,
            refreshing: false,
            xnftsList: []
        }
    }

    componentDidMount() {
        if (Platform.OS == "android") {
            BackHandler.addEventListener('hardwareBackPress', this.onBackAndroid);
        }
        this.fetchBanner(1);
        this.reloadMessage()
        this.getXnftsList(0)
        if (Version >= this.props.warnVersion) {
            this.fetchMessage();
            return;
        }
    }
    onBackAndroid = () => {
        if (Actions.currentScene != "Index") {
            Actions.pop();
            return true;
        } else {
            let time = new Date();
            this.lastBackPressed = this.thisBackPressed;
            this.thisBackPressed = time.getTime();
            if (this.lastBackPressed && this.lastBackPressed + 2000 >= this.thisBackPressed) {
                BackHandler.exitApp();
                return false;
            }
            ToastAndroid.show('再按一次退出应用', ToastAndroid.SHORT);
            return true;
        }
    };
    //===
    getXnftsList = (index) => {
        const { pageSize } = this.state;
        ShopApi.getXNfts(index)
            .then((data) => {
                this.setState({
                    xnftsList: index == 0 ? data : this.state.xnftsList.concat(data),
                    refreshState: data.length < pageSize ? RefreshState.EmptyData : RefreshState.Idle
                })
            }).catch(() => {
                this.setState({
                    xnftsList: [],
                    refreshState: RefreshState.EmptyData
                })
            })
    }
    onHeaderRefresh = () => {
        this.setState({
            refreshState: RefreshState.HeaderRefreshing,
            pageIndex: 1
        }, () => {
            this.getXnftsList(0)
        });
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
    /**
     * 获取系统公告
     */
    fetchMessage() {
        let that = this;
        let d = { ceratedAt: "2021-08-13 12:01:47", content: "欢迎各位家人齐聚一堂，让我们一起Happy!", id: 1, title: "系统消息", updatedAt: "2021-08-13 12:01:47" }
        Send("api/system/OneNotice", {}, 'get').then(res => {
            if (res.code == 200) {
                that.setState({
                    oneMsgData: res.data == '' || res.data == undefined ? d : res.data,
                })
            }
        });
    }
    /**
     * 加载系统消息
     */
    reloadMessage() {
        let that = this;
        let params = {
            pageIndex: 1,
            type: 0,
        };
        Send("api/system/notices", params).then(res => {
            if (res.code == 200) {
                that.setState({
                    msgData: res.data,
                })
            } else {
                that.setState({
                    msgData: [],
                })
            }
        });
    }
    /**
     * 获取系统Banner列表
     * @param {*} source 
     */
    fetchBanner(source) {
        var that = this;
        let params = {
            pageIndex: 1,
            type: 0,
        };
        Send("api/system/banners?source=" + source, {}, 'GET').then(res => {
            if (res.code == 200) {
                that.setState({ bannerList: res.data, propagandaList: res.data })
            } else {
                Toast.tipBottom(res.message);
            }
        })
    }
    //===
    /**
     * 渲染系统公告Modal
     */
    renderNoticeModal() {
        let _html = `<!DOCTYPE html>
        <html>
        <meta name="viewport" content="width=device-width,initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no"/>
        <body>
        ${this.state.oneMsgData.content == undefined ? "" : this.state.oneMsgData.content}
        <script>
        function ResizeImages(){
          var myimg;
          for(i=0;i <document.images.length;i++){
            myimg = document.images[i];
            myimg.width = ${Metrics.screenWidth - 100};
          }
        }
        window.onload=function(){ 
          ResizeImages()
          window.location.hash = '#' + document.body.clientHeight;
          document.title = document.body.clientHeight;
        }
        </script></body></html>`
        return (
            <Modal animationType='slide' transparent visible={this.state.noticeModalVisible} onRequestClose={() => { }}>
                <View style={{ flex: 1, backgroundColor: "black", opacity: 0.3 }} />
                <View style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <View style={{ width: 280, height: 350, borderRadius: 10, backgroundColor: '#FFFFFF' }}>
                        <Text style={{ textAlign: 'center', fontSize: 16, color: Colors.main, fontWeight: 'bold', marginTop: 20, }}>{this.state.oneMsgData.title}</Text>
                        <Text style={{ fontSize: 12, padding: 10, paddingLeft: 15, color: "gray" }}>
                            发布时间: {this.state.oneMsgData.ceratedAt}
                        </Text>
                        <ScrollView contentContainerStyle={{ padding: 5, paddingLeft: 5, paddingRight: 5 }}>
                            <View style={{ height: this.state.webViewHeight, }}>
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
                        </ScrollView>
                        <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 20 }}>
                            <TouchableOpacity onPress={() => this.setState({ noticeModalVisible: false })}>
                                <View style={{ marginTop: 6, height: 30, width: 100, marginRight: 5, borderRadius: 10, backgroundColor: Colors.main, alignSelf: 'center', justifyContent: 'center', alignItems: 'center' }}>
                                    <Text style={{ fontSize: 14, color: Colors.C8 }}>关闭</Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        )
    }
    timeBtn = (time) => {
        let endStart = time.replace(/\-/g, "/");
        let jishi = new Date(endStart).getTime();//start + (end - start)
        return (
            <CountDownReact
                date={jishi}
                hours=':'
                mins=':'
                daysStyle={Styles.time}
                hoursStyle={Styles.time}
                minsStyle={Styles.time}
                secsStyle={Styles.time}
                firstColonStyle={Styles.colon}
                secondColonStyle={Styles.colon}
            />
        )

    }
    /**
     * 游戏插图
     */
    illustration(imgs) {
        if (imgs != undefined) {
            return (
                imgs.map((item, index) =>
                    <Card key={index}>
                        <CardItem>
                            <View key={index} style={{ flexDirection: 'column', width: 300, marginHorizontal: 10 }}>
                                <TouchableOpacity onPress={() => Actions.NftDetails({ item, code: this.props.rcode == "0" ? this.props.mobile : this.props.rcode })}>
                                    <ImageBackground
                                        source={{ uri: item['pic'] }}
                                        imageStyle={{ borderRadius: 10 }}
                                        style={{ height: 260, width: 300, borderRadius: 10, resizeMode: 'stretch', marginBottom: 5 }}
                                    >
                                        {new Date().getTime() > new Date(item.eTime).getTime() ?
                                            <View style={{ backgroundColor: Colors.black, marginHorizontal: 10, marginTop: 10, height: 30, width: 200, borderRadius: 10, opacity: 0.8, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                                                <Icon name="ios-alarm-outline" color={Colors.main} size={16} />
                                                <Text style={{ color: Colors.main, fontSize: 12, marginLeft: 3 }}>时间:{item.eTime}</Text>
                                            </View>
                                            : <View style={{ backgroundColor: Colors.black, marginHorizontal: 10, marginTop: 10, height: 30, width: 160, borderRadius: 10, opacity: 0.8, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                                                <Icon name="ios-alarm-outline" color={Colors.main} size={16} />
                                                <Text style={{ color: Colors.main, fontSize: 12, marginLeft: 3 }}>开售时间:</Text>
                                                {this.timeBtn(item.eTime)}
                                            </View>}

                                    </ImageBackground>
                                </TouchableOpacity>
                                <View>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 5 }}>
                                        <Image source={{ uri: item.auPic }} style={{ height: 30, width: 30, borderRadius: 10, marginLeft: 5 }} />
                                        <Text style={{ fontSize: 14, color: Colors.greyText, marginLeft: 10 }}>{item.auName}</Text>
                                    </View>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <Text style={{ fontSize: 18, fontWeight: '900', color: Colors.black, marginLeft: 5, marginTop: 10 }}>{item.name}</Text>
                                        <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                                            <Text style={{ fontSize: 18, fontWeight: '900', color: Colors.notice, marginTop: 10, marginRight: 3 }}>{item.price}</Text>
                                            <Text style={{ fontSize: 13, fontWeight: '900', color: Colors.notice, marginTop: 12, marginRight: 10 }}>{item.type == 0 ? 'GC' : '碎片'}</Text>
                                        </View>
                                    </View>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <Text style={{ fontSize: 16, fontWeight: '600', color: Colors.greyText, marginLeft: 5, marginTop: 10 }}>{item.typeName}</Text>


                                        <View style={{ borderRadius: 3, borderWidth: 1, borderColor: Colors.main, height: 20, width: 80, marginRight: 10, flexDirection: 'row', alignItems: 'center' }}>
                                            <View style={{ flex: 2, alignItems: 'center', justifyContent: 'center' }}>
                                                <Text style={{ fontSize: 11, color: Colors.main, marginHorizontal: 3 }}>{item.amount}份</Text>
                                            </View>
                                            <View style={{ backgroundColor: Colors.main, borderBottomRightRadius: 3, borderTopRightRadius: 3, flex: 1, height: 20, alignItems: 'center', justifyContent: 'center' }}>
                                                <Text style={{ fontSize: 11, color: Colors.White }}>限量</Text>
                                            </View>
                                        </View>
                                    </View>
                                </View>
                                {/* 
                            <ReadMore numberOfLines={1}>
                                <Text style={{ fontSize: 14, textAlign: 'left', color: 'gray' }}>
                                    {item.title}巴拉巴拉巴拉
                                </Text>
                            </ReadMore> 
                        */}
                            </View>
                        </CardItem>
                    </Card>
                )
            )
        }
        return <View />
    }
    renderAdContent() {
        return (
            <Card>
                {/* <CardItem header>
                </CardItem> */}
                <CardItem>
                    <Body>
                        <ScrollView horizontal={true}>
                            <View style={{ flex: 1, flexDirection: "row" }}>
                                {this.illustration(this.state.xnftsList)}
                            </View>
                        </ScrollView>
                    </Body>
                </CardItem>
                {/* <CardItem footer>
                </CardItem> */}
            </Card>
        );
    }
    renderAd(title) {
        return (
            <TouchableOpacity style={[Styles.bordercast, { marginHorizontal: 10, marginTop: 10 }]}>
                <Icon name="rocket-sharp" color={Colors.main} size={26} />
                <Text style={{ fontSize: 18, lineHeight: 21, color: Colors.main, marginLeft: 10 }}>{title}</Text>
            </TouchableOpacity>
        )
    }
    /** 
     * 基本信息
    */
    renderBasicInfoCard = () => {
        return (
            <View style={Styles.barContainer}>
                <View style={Styles.barBody}>
                    {BASICINFO_BAR.map(item =>
                        <TouchableOpacity style={[Styles.barBodyItem, { width: (Metrics.screenWidth - 10) / 4 }]} key={item['key']} onPress={() => {
                            Actions.push(this.props.logged ? (item['router'] == "Certification" && !this.props.isPay) ? "PayPage" : item['router'] : 'Login')
                        }}>
                            <View style={[Styles.barBodyItem, { width: (Metrics.screenWidth - 20) / 2 }]}>
                                {item['router'] == 'Task' || item['router'] == "JieDian" || item['router'] == 'MyTeam' ?
                                    <FontAwesome5 name={item['icon']} color={Colors.C6} size={28} brand /> :
                                    <FontAwesome name={item['icon']} color={Colors.C6} size={28} />
                                }
                                <Text style={Styles.barText}>{item['title']}</Text>
                            </View>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        )
    }
    /**
     * 渲染轮播图
     */
    renderSwiper() {
        return (
            <View style={Styles.wiper}>
                <Swiper
                    key={this.state.bannerList.length}
                    horizontal={true}
                    loop={true}
                    autoplay={true}
                    autoplayTimeout={16}
                    removeClippedSubviews={false}
                    paginationStyle={{ bottom: 20 }}
                    showsButtons={false}
                    activeDotStyle={{ width: 15, height: 3, backgroundColor: Colors.White, borderRadius: 1 }}
                    dotStyle={{ width: 15, height: 3, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 1 }}
                >
                    {this.state.bannerList.map((item, index) =>
                        <TouchableOpacity key={index} onPress={() => onPressSwiper(item, this.props.mobile, this.props.userId)}>
                            <Image style={Styles.banner} source={{ uri: item['imageUrl'] }} />
                        </TouchableOpacity>
                    )}
                </Swiper>
            </View >
        )
    }
    /**
     * 显示系统消息
     */
    renderBroadcast() {
        return (
            <TouchableOpacity style={[Styles.bordercast, { marginHorizontal: 10 }]} onPress={() => Actions.Message({ idx: 0 })}>
                <Text style={{ color: Colors.main }}>公告</Text>
                <Icon name="ios-volume-medium" color={Colors.main} size={20} />
                <Swiper
                    style={{ marginLeft: 10 }}
                    key={this.state.msgData.length}
                    height={20}
                    loop={true}
                    removeClippedSubviews={false}
                    horizontal={true}
                    autoplay={true}
                    autoplayTimeout={20}
                    showsPagination={false}
                    showsButtons={false}
                >
                    {this.state.msgData.map((item, key) =>
                        <Text key={key} style={{ fontSize: 14, lineHeight: 21, color: Colors.grayFont }}>{item.title}</Text>
                    )}
                </Swiper>
            </TouchableOpacity>
        )
    }
    listHeaderComponent = () => {
        return (
            <View style={{ flex: 1 }}>
                {this.renderSwiper()}
                {this.renderBroadcast()}
                {this.renderBasicInfoCard()}
                {this.renderAd('藏品一览')}
                {/* {this.renderAdContent()} */}
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    {this.illustration(this.state.xnftsList)}
                </View>
                {/* {this.renderAd('历史发售')}
                {this.renderAdContent()} */}
            </View>
        )
    }
    render() {
        return (
            <View style={{ flex: 1 }}>
                <View style={{ backgroundColor: Colors.White, height: Metrics.STATUSBAR_HEIGHT, width: Metrics.screenWidth }}></View>
                <Header leftImageHttpUrl={'1'} leftImgStyle={{ width: 130, height: 50, resizeMode: 'center' }} statusBarBackgroundColor={Colors.statusBar} backgroundColor={Colors.statusBar} />
                <ScrollView style={{ flex: 1 }} refreshControl={<RefreshControl refreshing={this.state.refreshing} onRefresh={this.onHeaderRefresh} />}>
                    {this.listHeaderComponent()}
                </ScrollView>
                {this.renderNoticeModal()}
            </View>
        );
    }
}
const mapStateToProps = state => ({
    logged: state.user.logged,
    userId: state.user.id,
    mobile: state.user.mobile,
    level: state.user.level,
    auditState: state.user.auditState,
    candyH: state.user.candyH || 0,
    candyP: state.user.candyP,
    candyNum: state.user.candyNum,
    gc: state.user.gc,
    gcx: state.user.gcx,
    location: state.user.location,
    warnVersion: state.router.warnVersion,
    isReaded: state.notice.isReaded,
    id: state.notice.id,
    uuid: state.user.uuid,
    isDoTask: state.user.isDoTask,
    dayNum: state.user.dayNum,
    rcode: state.user.rcode,
    title: state.notice.title,
    content: state.notice.content,
    userBalanceNormal: state.user.userBalanceNormal,
    userBalanceLock: state.user.userBalanceLock,
    taskSchedule: state.user.taskSchedule,
    taskEndTime: state.user.taskEndTime,
    taskStartTime: state.user.taskStartTime,
});

const mapDispatchToProps = dispatch => ({
    updateNoticeInfo: ({ id, title, content, ceratedAt }) => dispatch({ type: UPDATE_NOTICE_INFO, payload: { id, title, content, ceratedAt } }),
    updateNoticeStatus: () => dispatch({ type: UPDATE_NOTICE_STATUS }),
    updateUserLocatin: (location) => dispatch({ type: UPDATE_USER_LOCATION, payload: { location } }),
    updateUserInfo: (userInfo) => dispatch({ type: UPDATE_USER, payload: { userInfo } })

});
export default connect(mapStateToProps, mapDispatchToProps)(Home);

const Styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.White },
    wiper: { height: 160, overflow: "hidden", marginHorizontal: 3, borderRadius: 3 },
    banner: { height: 160, width: '100%' },
    bordercast: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 10,
        overflow: "hidden"
    },
    bordercast1: {
        // flex: 1,
        // marginBottom: 10,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: 'center',
    },
    options: {
        flexDirection: 'row',
        // marginTop: 10,
        marginHorizontal: 5,
        paddingBottom: 10,
        borderRadius: 5,
        flexWrap: 'wrap',
        // backgroundColor: Colors.White,
    },
    optionTouch: {
        justifyContent: 'center',
        alignItems: 'center',
        width: (Metrics.screenWidth - 20) / 4,
        marginTop: 10
    },
    optionTitle: { marginTop: 4, fontSize: 12 },
    task: {
        marginHorizontal: 10,
        flexDirection: 'row',
        alignItems: 'center'
    },
    taskGif: {
        width: 210,
        height: 74,
        borderRadius: 5
    },
    yieldText: { fontSize: 12, color: Colors.grayFont, marginTop: 5 },
    profileText: {
        fontSize: 16,
        color: Colors.main,
        includeFontPadding: false,
        textAlignVertical: 'center',
        maxWidth: 100
    },
    profileTitle: {
        marginTop: 2,
        fontSize: 13,
        color: Colors.fontColor,
    },
    itemView: {
        width: (Metrics.screenWidth - 25) / 2,
        borderRadius: 2,
        marginBottom: 5,
        backgroundColor: Colors.White,
    },


    yield: { marginRight: 40, marginTop: 10, flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center' },
    yieldInfo: { padding: 6, borderRadius: 6 },
    cdtPrompt: {
        height: 25,
        width: 40,
        borderTopRightRadius: 20,
        borderBottomRightRadius: 20,
        backgroundColor: Colors.C6,
        justifyContent: "center",
        marginLeft: 5,
        marginTop: 5,
        zIndex: 2,
    },
    yieldInfoText: { fontSize: 14, color: '#6b5a2e' },
    profile: {
        flex: 1,
        // flexWrap: 'wrap',
        // flexDirection: 'row',
        // alignItems: 'center',
        // paddingBottom: 5,
        marginTop: 20,
        // marginBottom: 80
    },
    profileItem: {
        justifyContent: 'center',
        alignItems: 'center',
        flex: 1
    },
    //时间文字
    time: {
        fontSize: 12,
        color: Colors.main,
    },
    //冒号
    colon: {
        fontSize: 12, color: Colors.main
    },
    item: {
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: Colors.C13,
        paddingHorizontal: 10
    },
    barBody: { flexDirection: 'row', flexWrap: 'wrap' },
    barBodyItem: { justifyContent: 'center', alignItems: 'center', marginVertical: 2 },
    barText: { marginTop: 6, fontSize: 12, color: Colors.fontColor },
    barContainer: { flex: 1, backgroundColor: Colors.C8, paddingTop: 5, marginHorizontal: 3, borderRadius: 3 },
    barHeader: { flex: 1, justifyContent: 'center', alignItems: 'center', marginVertical: 10 },
    barTitle: { fontSize: 14, color: Colors.fontColor, fontWeight: '600' },
});
