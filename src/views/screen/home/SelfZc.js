/*
 * @Author: top.brids 
 * @Date: 2019-12-01 21:55:56 
 * @Last Modified by: topbrids@gmail.com
 * @Last Modified time: 2022-06-29 23:35:00
 */

import React, { Component } from 'react';
import { View, Text, BackHandler, ToastAndroid, Platform, RefreshControl, StyleSheet, ScrollView, Image, TouchableOpacity, StatusBar } from 'react-native';
import Swiper from 'react-native-swiper';
import { Actions } from 'react-native-router-flux';
import Icon from "react-native-vector-icons/Ionicons";
import { connect } from 'react-redux';
import Cookie from 'cross-cookie';
import { UPDATE_NOTICE_INFO, UPDATE_USER, UPDATE_NOTICE_STATUS, UPDATE_USER_LOCATION } from '../../../redux/ActionTypes';
import Clipboard from '@react-native-community/clipboard';
import { ReadMore } from '../../components/Index';
import { Colors, Metrics } from '../../theme/Index';
import { HOME_OPTIONS, PROFILE_BAR } from '../../../config/Constants';
import { Send } from '../../../utils/Http';
import { Toast } from '../../common';
import { onPressSwiper } from '../../../utils/CommonFunction';
import { ShopApi } from '../../../api';
import { RefreshState } from 'react-native-refresh-list-view';
import Advert from '../advert/Advert';
import { Body, Card, CardItem } from 'native-base';
import { Header } from '../../components/Index';
class Home extends Component {
	constructor(props) {
		super(props);
		this.state = {
			isRefreshing: false,
			refreshing: false,
			progress: 0,
			webViewHeight: 300,
			msgData: [],
			oneMsgData: {},
			bannerList: [],
			profileProgressList: [],
			noticeModalVisible: true,
			propagandaList: [],
			YokaAndChongzhiList: [],
			goodsList: [],
			pageIndex: 1,
			pageSize: 20,
			taskSchedule: props.taskSchedule,
			startTime: props.taskStartTime,
			endTime: props.taskEndTime,
			clipboardWarnText: '复制'
		};
	}

	getGoodsList = (index) => {
		const { pageSize } = this.state;
		ShopApi.getHomeShops(index, pageSize)
			.then((data) => {
				this.setState({
					goodsList: index == 1 ? data : this.state.goodsList.concat(data),
					refreshState: data.length < pageSize ? RefreshState.EmptyData : RefreshState.Idle
				})
			}).catch(() => {
				this.setState({
					goodsList: [],
					refreshState: RefreshState.EmptyData
				})
			})
	}
	onHeaderRefresh = () => {
		this.setState({
			refreshState: RefreshState.HeaderRefreshing,
			pageIndex: 1
		}, () => {
			this.getGoodsList(1)
		});
	}
	onFooterRefresh = () => {
		this.setState({
			refreshState: RefreshState.FooterRefreshing,
			pageIndex: this.state.pageIndex + 1
		}, () => {
			this.getGoodsList(this.state.pageIndex)
		});
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
					item.balance = value;
					return (
						<TouchableOpacity key={key} style={Styles.item} onPress={() => this.onProfileOptionPress(item)}>
							<View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
								<Text style={{ fontSize: 13, color: Colors.main }}>{item.title}</Text>
								<Icon name="chevron-forward" color={Colors.C11} size={20} />
							</View>
							<View style={{ flexDirection: 'row', marginTop: 10, flex: 1 }}>
								<View style={{ flex: 1, justifyContent: 'center' }}>
									<Text style={{ fontSize: 12, color: Colors.C10, }}>可用</Text>
									<Text style={{ fontSize: 12, color: Colors.C12, marginTop: 3 }}>{' ---'}</Text>
								</View>
								<View style={{ flex: 1 }}></View>
								<View style={{ flex: 1, justifyContent: 'center', }}>
									<Text style={{ fontSize: 12, color: Colors.C10, }}>冻结</Text>
									<Text style={{ fontSize: 12, color: Colors.C12, marginTop: 3 }}>{' ---'}</Text>
								</View>
							</View>
						</TouchableOpacity>
					)
				})}
			</View>
		)
	}

	listHeaderComponent = () => {
		let gc = this.props.gc == undefined || this.props.gc == '' ? 0 : this.props.gc;
		return (
			<View style={{ flex: 1 }}>
				<View style={{ backgroundColor: Colors.main, height: 150, justifyContent: 'center', alignItems: 'center' }}>
					<View style={{ flex: 1 }}>
						<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', flexDirection: 'row' }}>
							<Text style={{ color: Colors.White }}>当前GC资产价值</Text>
							{/* <Text style={{ color: Colors.White, fontSize: 10 }}> 1GC≈{(1 / 6.5).toFixed(2)}USD</Text> */}
						</View>
						<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', flexDirection: 'row' }}>
							{/* <Text style={{ color: Colors.White, fontSize: 20, fontWeight: 'bold' }}>{(gc * 1 / 6.5).toFixed(2)}</Text> */}
							<Text style={{ color: Colors.White, fontSize: 16 }}> 1GC≈{(1 / 6.5).toFixed(2)}</Text> 
							<Text style={{ color: Colors.White }}> USD</Text>
						</View>
						{(this.props.uuid == '' || this.props.uuid == undefined) && <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
							<Text style={{ color: Colors.White }}>登录</Text>
						</View>}

						<View style={{ flex: 2, justifyContent: 'center', alignItems: 'center', flexDirection: 'row' }}>
							<Text style={{ color: Colors.White }}>{this.props.uuid}</Text>
							<TouchableOpacity onPress={() => {
								Clipboard.setString(this.props.uuid);
								Toast.tipBottom(`复制成功`)
							}}>
								<Text style={{ color: Colors.White }}>  {this.state.clipboardWarnText}</Text>
							</TouchableOpacity>
						</View>
					</View>
				</View>
				{this.renderProfile()}
			</View>
		)
	}

	render() {
		return (
			<View style={Styles.container}>
				<View style={{ backgroundColor: Colors.main, height: Metrics.STATUSBAR_HEIGHT, width: Metrics.screenWidth }}></View>
				<Header title="个人资产" leftIconColor={Colors.White} statusBarBackgroundColor={Colors.White} />
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
export default connect(mapStateToProps, mapDispatchToProps)(Home);
const Styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: Colors.White },
	wiper: { height: 160, overflow: "hidden", margin: 5, borderRadius: 5 },
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
		fontSize: 14,
		color: '#000',
	},
	//冒号
	colon: {
		fontSize: 12, color: '#000'
	},
	item: {
		paddingVertical: 10,
		borderBottomWidth: 1,
		borderBottomColor: Colors.C13,
		paddingHorizontal: 10
	},
});
