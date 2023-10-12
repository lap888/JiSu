import React, { Component } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableWithoutFeedback, Image, TouchableOpacity, SafeAreaView } from 'react-native';
import { connect } from 'react-redux';
import { Actions } from 'react-native-router-flux';
import FontAwesome from "react-native-vector-icons/FontAwesome";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";


import Toast from '../../common/Toast';
import * as WeChat from 'react-native-wechat-lib';

import { Colors, Metrics } from '../../theme/Index';
import { LOGOUT, UPDATE_USER, UPDATE_NOTICE_STATUS } from '../../../redux/ActionTypes';
import { Env, Version } from '../../../config/Index';
import { PROFILE_BAR } from '../../../config/Constants';
import { Send } from '../../../utils/Http';
import { OtherApi } from '../../../api';
import LinearGradient from 'react-native-linear-gradient';
import Advert from '../advert/Advert';
import Icon from "react-native-vector-icons/Ionicons";

// 实名认证
const AUTHENTICATION_STATUS = [
	{ key: 0, value: "未实名认证", title: "未认证" },
	{ key: 1, value: "提交人工审核", title: "审核中" },
	{ key: 2, value: "审核通过", title: "已认证" },
	{ key: 3, value: "审核未通过", title: "认证失败" },
];

// 交易
let TRANSACTION_BAR = [
	{ key: "0", title: "买单", icon: 'buysellads', businessType: 0, router: "BuyOrder" },
	{ key: "1", title: "卖单", icon: 'buysellads', businessType: 1, router: "SellOrder" },
	{ key: "2", title: "交易中", icon: 'exchange', businessType: 2, router: "BuyingOrder" },
	{ key: "3", title: "已完成", icon: 'snapchat', businessType: 3, router: "BuyedOrder" }
];
// 基本信息
let BASICINFO_BAR = [
	{ key: "0", title: "任务商店", router: 'Task', icon: 'sketch' },
	{ key: "2", title: "新手指南", router: 'College', icon: 'affiliatetheme' },
	{ key: "4", title: "邀请好友", router: 'BitCoinNews', icon: 'qrcode' },
	{ key: "3", title: "我的团队", router: 'MyTeam', icon: 'reddit-square' },
	{ key: "10", title: "实名认证", icon: 'pencil-square', router: 'Certification' },
	// { key: "8", title: "新人券", icon: 'stack-overflow', router: 'NewTicket', pic: require('../../images/mine/newm/quan.png') },
	// { key: "6", title: "资产录入", icon: 'diamond', router: 'EditUserCoin' },
	{ key: "7", title: "资产浏览", icon: 'internet-explorer', router: 'Browser' },
	{ key: "9", title: "社区节点", icon: 'teamspeak', router: 'JieDian' },
	{ key: "5", title: "问题反馈", icon: 'bug', router: 'YoTaskApeal' },

];


let HUODONG_BAR = [
	// { key: "0", title: "NFT", icon: 'btc', router: 'Nft' },
	// { key: "1", title: "认证", icon: 'ribbon', router: 'Certification' },
	{ key: "1", title: "认证", icon: 'ribbon', router: 'CertificationManual' },
	{ key: "2", title: "团队", router: 'MyTeam', icon: 'people' },
	{ key: "3", title: "签到", icon: 'pencil-square', router: 'XfqScreen' },
	{ key: "4", title: "游戏", icon: 'game-controller', router: 'QuanMinTask' },
	// router: 'Classfiy' router: 'Classfiy'
	// { key: "5", title: "商城", icon: 'shopping-cart' },
	{ key: "6", title: "藏品", icon: 'biohazard', router: 'ExNft' },
	{ key: "7", title: "OTC", icon: 'md-color-filter-sharp', router: 'Otc' },
	// { key: "8", title: "抽奖", icon: 'barcode', router: 'ZpLuck' },
	// { key: "9", title: "量化", icon: 'unity', router: 'Information' },
];

class Mine extends Component {
	constructor(props) {
		super(props);
		this.state = {
			agreed: false,
			webViewHeight: 300,
			content: '',
			douyinH5: ''
		};
	}

	onProfileOptionPress = (item) => {
		if (!this.props.logged) {
			Actions.push('Login')
		}
		Actions.push('AdFlowDetails', { data: item })
	}
	/**
	   * 渲染用户收益
	   */
	renderProfile() {
		return (
			<View style={Styles.profile}>
				{PROFILE_BAR.map(item => {
					let { key, keyname, title, router } = item;
					let value = (this.props[keyname] == 'undefined' || this.props[keyname] == null) ? 0 : this.props[keyname];
					value = value.toFixed(2);
					return (
						<TouchableOpacity style={{ flex: 1, }} key={key} onPress={() => this.onProfileOptionPress(item)}>
							<View style={Styles.profileItem}>
								<Text style={[Styles.profileText]}>{value}</Text>
								<Text style={Styles.profileTitle}>{title}</Text>
							</View>
						</TouchableOpacity>
					)
				})}
			</View>
		)
	}
	getSubmmitButtonText(auditState) {
		let element = AUTHENTICATION_STATUS.filter(item => auditState === item['key']);
		return element[0]['title'];
	}
	onClickLevelBar() {
		if (this.props.logged) {
			Actions.push('Level');
		} else {
			Actions.push('Login');
		}
	}
	/**
		 * 交易Bar 点击事件
		 */
	handleTransactionBar(item) {
		if (this.props.logged) {
			if (item.hasOwnProperty('businessType')) {
				Actions.push('BusinessPage', { businessType: item['businessType'] });
			} else {
				Actions.push(item['router']);
			}
		} else {
			Actions.push('Login');
		}
	}
	/**
		 * 联系QQ客服
		 */
	onClickQQ() {
		Send(`api/system/CopyWriting?type=call_me`, {}, 'get').then(res => {
			Actions.push('CommonRules', { title: '联系我们', rules: res.data });
		});
	}
	/**
		 * 服务Bar 点击事件
		 */
	handleServiceBar(item) {
		if (this.props.logged) {
			if (item.hasOwnProperty('router')) {
				if (item['router'] === 'CommonRules') {
					this.onServicePress()
				} else if (item['router'] === 'qq') {
					this.onClickQQ();
				} else {
					Actions.push(item['router']);
				}
			} else {
				if (item['key'] === '0') this.onClickQQ();
			}
		} else {
			Actions.push('Login');
		}
	}
	onServicePress() {
		Send(`api/system/CopyWriting?type=day_q`, {}, 'get').then(res => {
			Actions.push('CommonRules', { title: '常见问题', rules: res.data });
		});
	}
	onQuantPress() {
		Send(`api/system/CopyWriting?type=quant_q`, {}, 'get').then(res => {
			Actions.push('CommonRules', { title: '量化', rules: res.data });
		});
	}


	/**
	 * 进入隐私政策界面
	 */
	privacyPolicy1 = () => {
		Send(`api/system/CopyWriting?type=y_s_rule`, {}, 'get').then(res => {
			this.setState({ content: res.data[0].text })
			// Actions.push('CommonRules', { title: '隐私政策', rules: res.data });
		});
	}
	privacyPolicy = () => {
		Send(`api/system/CopyWriting?type=y_s_1_rule`, {}, 'get').then(res => {
			Actions.push('CommonRules', { title: '隐私政策和用户协议', rules: res.data });
		});
	}

	/**
		 * 渲染我的服务
		 */
	renderService() {
		return (
			<View>
				<TouchableOpacity
					onPress={() => Actions.push('Help')}
					style={{ height: 50, backgroundColor: Colors.White, marginTop: 10, paddingLeft: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
					<Text style={{ marginLeft: 5, fontSize: 14, color: '#333' }}>帮助中心</Text>
					<View style={{ marginRight: 10 }}>
						<Icon name={'md-chevron-forward'} color={Colors.greyText} size={20} />
					</View>
					{/* <Text style={{ marginLeft: 5, fontSize: 13, color: '#333', marginRight: 20 }}>转增记录</Text> */}
				</TouchableOpacity>
			</View>
		)
	}
	/**
	 * 服务Bar 点击事件
	 */
	handleServiceYoBang(item) {
		if (this.props.logged) {
			if (item.hasOwnProperty('router')) {
				if (item['router'] === 'CommonRules') {
					this.onServicePress()
				} else if (item['router'] === 'GoodLuck') {
					Toast.tipBottom('暂未开放')
				} else if (item['router'] === 'BindWeChat') {
					WeChat.sendAuthRequest('snsapi_userinfo', 'wechat_sdk_demo')
						.then((responseCode) => {
							let code = responseCode.code;
							return OtherApi.getWechatToken(code)
						})
						.then((data) => {
							return OtherApi.getWechatUser(data.access_token, data.openid)
						})
						.then((userinfo) => {
							console.log('userinfo', userinfo);
						}).catch((err) => console.log('err', err))
				} else if (item['router'] == 'Classfiy1') {
					Toast.tipBottom('暂未开放...')
				} else if (item['router'] == 'QuanMinTask') {
					Advert.jumpAdList(this.props.userId)
				} else if (item['router'] == 'PlayGame') {
					if (this.props.logged) {
						let url = 'https://haowanhuaijiuapi.kumili.net/api/Game/GenAuthSdwUrl2?id={YoyoUserID}';
						//处理url
						let p1 = '{YoyoUserMobilePhone}';
						let p2 = '{YoyoUserID}';
						if (url.indexOf(p1) > 0) {
							url = url.replace(p1, this.props.mobile)
						}
						if (url.indexOf(p2) > 0) {
							url = url.replace(p2, this.props.userId)
						}
						Actions.AdH5({ url: url, ty: 4, title: '畅玩游戏', thumbImage: '', bannerId: 1 });
					} else {
						Actions.push('Login')
					}
				} else if (item['router'] == 'JiaYouSheng') {
					if (this.props.logged) {
						let url = 'https://open.czb365.com/redirection/todo?platformType=98639778&platformCode={YoyoUserMobilePhone}';
						//处理url
						let p1 = '{YoyoUserMobilePhone}';
						let p2 = '{YoyoUserID}';
						if (url.indexOf(p1) > 0) {
							url = url.replace(p1, this.props.mobile)
						}
						if (url.indexOf(p2) > 0) {
							url = url.replace(p2, this.props.userId)
						}
						Actions.AdH5({ url: url, ty: 4, title: '加油省', thumbImage: '', bannerId: 1 });
					} else {
						Actions.push('Login')
					}
				} else if (item['router'] == 'AiDouYin') {
					if (this.props.logged) {
						let url = `${this.state.douyinH5}&type=H5`;
						Actions.AdH5({ url: url, ty: 4, title: '趣抖音', thumbImage: '', bannerId: 1 });
					} else {
						Actions.push('Login')
					}
				} else if (item['router'] == 'Information') {
					this.onQuantPress()
				} else if (item['router'] == 'CertificationManual') {
					if (this.props.auditState == 0) {
						Actions.push('CertificationManual', { auditState: this.props.auditState });
					} else if (this.props.auditState == 2) {
						Actions.push('Certification');
					} else {
						Toast.tipBottom('审核中')
					}

				}
				else {
					Actions.push(item['router']);
				}
			} else {
				Toast.tipBottom('暂未开放')
			}
		} else {
			Actions.push('Login');
		}
	}
	/**
	 * 头部背景
	 *  */
	renderHeaderCard = () => {
		return (
			<LinearGradient colors={[Colors.main, Colors.White]} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={{ height: 133, paddingHorizontal: 10 }}>
				<View style={{ height: 80, flexDirection: 'row', justifyContent: 'space-between', paddingTop: 5 }}>
					<Text style={Styles.version}>{`版本号：${Env === 'dev' ? Env : ''}${Version}`}</Text>
					<TouchableOpacity style={{ marginRight: 10, flexDirection: 'row', marginTop: 2 }} onPress={() => Actions.push(this.props.logged ? 'UserInfo' : 'Login')}>
						<FontAwesome name={'cog'} color={Colors.White} size={20} />
					</TouchableOpacity>
				</View>
			</LinearGradient>
		)
	}
	/**
	 * 用户信息板块
	 *  */
	renderUserCard = () => {
		let { nickname, rcode, level } = this.props;
		return (
			<View style={{ backgroundColor: Colors.transparent, marginHorizontal: 10, marginTop: -80, paddingTop: 12 }}>
				<View style={{ flex: 1, backgroundColor: Colors.White, borderTopLeftRadius: 2, borderTopRightRadius: 2, paddingBottom: 30 }}>
					{this.props.logged ?
						<View style={{ flex: 1, flexDirection: 'row', }}>
							<View style={{ flex: 1, marginLeft: 85, marginTop: 10 }}>
								<Text style={Styles.nickname} numberOfLines={2}>{nickname || "该用户很懒，还没有修改昵称"}</Text>
								<TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center' }} onPress={() => Actions.push('EditInviterCode')}>
									<Text style={Styles.inviteCode} numberOfLines={2}>{rcode == "0" ? `邀请码:${this.props.mobile}` : `邀请码:${rcode}`}</Text>
									<View style={{ backgroundColor: Colors.main, justifyContent: 'center', alignItems: 'center', borderRadius: 5, paddingVertical: 2, marginLeft: 5, marginTop: 10, paddingHorizontal: 10 }}><Text style={{ color: Colors.White, fontSize: 12 }}>修改</Text></View>
								</TouchableOpacity>
							</View>
						</View>
						:
						<View style={{ flex: 1 }}>
							<TouchableWithoutFeedback onPress={() => Actions.push('Login')}>
								<View style={{ flex: 1, marginLeft: 25, marginTop: 10 }}>
									<Text style={{ fontSize: 20, fontWeight: '600', }} numberOfLines={2}>{"登录"}</Text>
								</View>
							</TouchableWithoutFeedback>
						</View>
					}
				</View>
				{this.props.logged ? <TouchableOpacity style={{ position: 'absolute', height: 60, width: 60, marginLeft: 15, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', borderRadius: 30, overflow: 'hidden' }} onPress={() => Actions.push('UserInfo')}>
					<Image source={require('../../images/logo.png')} style={Styles.avatar} />
					<View style={{ backgroundColor: Colors.main, justifyContent: 'center', alignItems: 'center', borderRadius: 5, paddingVertical: 3, marginTop: -15, paddingHorizontal: 15 }}><Text style={{ color: Colors.White, fontSize: 10 }}>{this.getSubmmitButtonText(this.props.auditState)}</Text></View>
				</TouchableOpacity> : null}
			</View>
		)
	}
	/**
	 * ——活动——
	 */
	renderHuoDong = () => {
		return (
			<View style={Styles.yoContainer}>
				<View style={Styles.barHeader}>
					<Text style={Styles.barTitle}>——应用中心——</Text>
				</View>
				<View style={Styles.barBody}>
					{HUODONG_BAR.map(item =>
						<TouchableWithoutFeedback key={item['key']} onPress={() => this.handleServiceYoBang(item)}>
							<View style={[Styles.barBodyItem, { width: (Metrics.screenWidth - 20) / 3, marginTop: 5 }]}>
								{item['router'] == 'ExNft' || item['router'] == 'Information' ?
									<FontAwesome5 name={item['icon']} color={Colors.C6} size={28} brand />
									: item['router'] == 'QuanMinTask' || item['router'] == 'Otc' || item['router'] == 'MyTeam' || item['router'] == 'CertificationManual' ?
										<Icon name={item['icon']} color={Colors.C6} size={28} />
										:
										<FontAwesome name={item['icon']} color={Colors.C6} size={28} />
								}
								{/* <FontAwesome name={item['icon']} color={Colors.C6} size={28} /> */}
								<Text style={Styles.barText}>{item['title']}</Text>
							</View>
						</TouchableWithoutFeedback>
					)}
				</View>
			</View>
		)
	}

	render() {
		return (
			<SafeAreaView style={{ flex: 1, backgroundColor: Colors.backgroundColor }}>
				<View style={{ backgroundColor: Colors.main, height: Metrics.STATUSBAR_HEIGHT, width: Metrics.screenWidth }}></View>
				<ScrollView contentContainerStyle={{ paddingBottom: 10 }}>
					{this.renderHeaderCard()}
					{this.renderUserCard()}
					{this.renderHuoDong()}
					{this.renderService()}
				</ScrollView>
			</SafeAreaView>
		);
	}
}
const mapStateToProps = state => ({
	name: state.user.name,
	isPay: state.user.isPay,
	alipayUid: state.user.alipayUid,
	auditState: state.user.auditState,
	logged: state.user.logged,
	userId: state.user.id,
	level: state.user.level,
	rcode: state.user.rcode,
	golds: state.user.golds,
	mobile: state.user.mobile,
	nickname: state.user.name,
	isReaded: state.notice.isReaded,
	avatar: state.user.avatarUrl,
	balance: state.dividend.userBalance,
	candyH: state.user.candyH || 0,
	candyP: state.user.candyP,
	candyNum: state.user.candyNum,
	gc: state.user.gc,
	gcx: state.user.gcx,
	userBalanceNormal: state.dividend.userBalanceNormal,
	userBalanceLock: state.dividend.userBalanceLock
});
const mapDispatchToProps = dispatch => ({
	logout: () => dispatch({ type: LOGOUT }),
	updateNoticeStatus: () => dispatch({ type: UPDATE_NOTICE_STATUS }),
	updateUserInfo: (userInfo) => dispatch({ type: UPDATE_USER, payload: { userInfo } })
});
export default connect(mapStateToProps, mapDispatchToProps)(Mine);

const Styles = StyleSheet.create({
	gradient: { padding: 15, paddingTop: 10, paddingBottom: 20 },
	avatar: { width: 52, height: 52, borderRadius: 26, overlayColor: '#fff' },
	nickname: { fontSize: 16, color: "#333", fontWeight: '500' },
	inviteCode: { fontSize: 14, color: "#666", marginTop: 10 },
	setting: { alignItems: 'flex-end' },
	version: { marginTop: 2, fontSize: 12, color: Colors.C8, marginLeft: 10, },
	profile: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.White, borderBottomLeftRadius: 2, borderBottomRightRadius: 2 },
	profileItem: { flex: 1, alignItems: 'center', justifyContent: 'center', height: 60 },
	profileTitle: { marginTop: 2, fontSize: 12, color: Colors.grayFont },
	profileText: { fontSize: 14, color: Colors.C6 },
	level: { flexDirection: 'row', marginTop: 10, alignItems: 'center' },
	levelText: { fontSize: 12, color: Colors.main, fontWeight: 'bold' },
	contributionValueText: { fontSize: 13, color: Colors.main },
	levelPropaganda: { fontSize: 12, color: Colors.White },
	icon: { width: 30, height: 30 },
	barContainer: { flex: 1, backgroundColor: Colors.C8, marginTop: 10, paddingBottom: 10 },
	yoContainer: { backgroundColor: Colors.White, marginTop: 10, paddingBottom: 10 },
	barHeader: { flex: 1, justifyContent: 'center', alignItems: 'center', marginVertical: 10 },
	barTitle: { fontSize: 14, color: Colors.fontColor, fontWeight: '600' },
	barHeaderRight: { flex: 1 },
	barMore: { textAlign: 'right', fontSize: 14, color: Colors.C10 },
	barBody: { flexDirection: 'row', flexWrap: 'wrap' },
	transactionBody: { flexDirection: 'row', height: 60, backgroundColor: Colors.White, marginTop: 10, paddingVertical: 10 },
	barBodyItem: { justifyContent: 'center', alignItems: 'center', marginVertical: 2 },
	barText: { marginTop: 6, fontSize: 12, color: Colors.fontColor },
	badge: { position: 'absolute', left: 20, top: -2 },
});