import React, { Component } from 'react';
import { View, Text, ImageBackground, RefreshControl, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import Swiper from 'react-native-swiper';
import { Actions } from 'react-native-router-flux';
import Icon from "react-native-vector-icons/Ionicons";
import { connect } from 'react-redux';
import { UPDATE_NOTICE_INFO, UPDATE_USER, UPDATE_NOTICE_STATUS, UPDATE_USER_LOCATION } from '../../../redux/ActionTypes';
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
class Cq extends Component {
    constructor(props) {
        super(props);
        this.state = {
            bannerList: [],
            propagandaList: [],
            msgData: [],
            oneMsgData: {},
            webViewHeight: 500,
            xnftsList: [],
            refreshing: false,
        }
    }

    componentDidMount() {
        this.fetchBanner(1);
        this.getXnftsList(1);
    }
    //===
    getXnftsList = (index) => {
        const { pageSize } = this.state;
        ShopApi.getXNfts(index)
            .then((data) => {
                this.setState({
                    xnftsList: index == 1 ? data : this.state.xnftsList.concat(data),
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
            this.getXnftsList(1)
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
     * 获取系统Banner列表
     * @param {*} source 
     */
    fetchBanner(source) {
        var that = this;
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
     * 游戏插图
     */
    illustration(imgs) {
        if (imgs != undefined) {
            return (
                imgs.map((item, index) =>
                    <Card key={index}>
                        <CardItem>
                            <View key={index} style={{ flexDirection: 'column', width: 300, marginHorizontal: 10 }}>
                                <View>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                                        <Text style={{ fontSize: 18, fontWeight: '900', color: Colors.black, marginLeft: 5, marginTop: 10 }}>「{item.name}」</Text>
                                        <Text style={{ fontSize: 18, fontWeight: '900', color: Colors.notice, marginTop: 10, marginRight: 10 }}>抽签</Text>
                                    </View>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginVertical: 10,marginTop:20 }}>
                                        <View style={{ borderRadius: 3, borderWidth: 1, borderColor: Colors.main, height: 20, width: 120, marginRight: 10, flexDirection: 'row', alignItems: 'center' }}>
                                            <View style={{ backgroundColor: Colors.main, borderBottomRightRadius: 3, borderTopRightRadius: 3, flex: 2, height: 20, alignItems: 'center', justifyContent: 'center' }}>
                                                <Text style={{ fontSize: 11, color: Colors.White }}>已报名</Text>
                                            </View>
                                            <View style={{ flex: 3, alignItems: 'center', justifyContent: 'center' }}>
                                                <Text style={{ fontSize: 11, color: Colors.main, marginHorizontal: 3 }}>.*.*.*. 人</Text>
                                            </View>

                                        </View>
                                    </View>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', marginBottom: 10, }}>
                                        <Text style={{ fontSize: 13, fontWeight: '900', color: Colors.greyText, marginTop: 10, marginRight: 3 }}>报名:</Text>
                                        <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                                            <Text style={{ fontSize: 13, fontWeight: '900', color: Colors.greyText, marginTop: 10, marginLeft: 3 }}>{item.bTime}至{item.eTime}</Text>
                                        </View>
                                    </View>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', marginBottom: 10, }}>
                                        <Text style={{ fontSize: 13, fontWeight: '900', color: Colors.greyText, marginTop: 10, marginRight: 3 }}>抽签:</Text>
                                        <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                                            <Text style={{ fontSize: 13, fontWeight: '900', color: Colors.greyText, marginTop: 10, marginLeft: 3 }}>{item.eTime}</Text>
                                        </View>
                                    </View>
                                </View>
                                <TouchableOpacity onPress={() => Actions.CqDetails({ item, code: this.props.rcode == "0" ? this.props.mobile : this.props.rcode })}>
                                    <ImageBackground
                                        source={{ uri: item['pic'] }}
                                        imageStyle={{ borderRadius: 10 }}
                                        style={{ height: 260, width: 300, borderRadius: 10, resizeMode: 'stretch', marginBottom: 5 }}
                                    >
                                        {/* <View style={{ backgroundColor: Colors.black, marginHorizontal: 10, marginTop: 10, height: 30, width: 160, borderRadius: 10, opacity: 0.8, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                                            <Icon name="ios-alarm-outline" color={Colors.main} size={16} />
                                            <Text style={{ color: Colors.main, fontSize: 12, marginLeft: 3 }}>开售时间:</Text>
                                        </View> */}
                                    </ImageBackground>
                                </TouchableOpacity>
                                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                                        <Text style={{ fontSize: 18, fontWeight: '900', color: Colors.notice, marginTop: 10, marginRight: 3 }}>{item.price}</Text>
                                        <Text style={{ fontSize: 13, fontWeight: '900', color: Colors.notice, marginTop: 12, marginRight: 10 }}>{item.type == 0 ? 'GC' : '碎片'}</Text>
                                    </View>
                                </View>
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
            <TouchableOpacity style={[Styles.bordercast, { marginHorizontal: 10, marginTop: 10, justifyContent: 'center' }]}>
                <Icon name="md-finger-print" color={Colors.main} size={26} />
                <Text style={{ fontSize: 18, lineHeight: 21, color: Colors.main, marginLeft: 10 }}>{title}</Text>
            </TouchableOpacity>
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

    listHeaderComponent = () => {
        return (
            <View style={{ flex: 1 }}>
                {this.renderSwiper()}
                {this.renderAd('申请抽签')}
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    {this.illustration(this.state.xnftsList)}
                </View>
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
export default connect(mapStateToProps, mapDispatchToProps)(Cq);

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
