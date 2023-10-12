/*
 * @Author: top.brids 
 * @Date: 2019-12-20 09:37:22 
 * @Last Modified by: topbrids@gmail.com
 * @Last Modified time: 2022-06-20 23:32:21
 */
import { Dimensions, Platform, StatusBar } from 'react-native';


import { isIphoneX } from 'react-native-iphone-x-helper';
let { width, height } = Dimensions.get('window');

/**
 * px和rn长度单位转化
 * @param {*} uiElementPx
 */
function px2dp(uiElementPx, uiWidthPx = 750) {
	const length = uiElementPx * width / uiWidthPx;
	return Math.ceil(length);
}

module.exports = {
	screenWidth: width,
	screenHeight: height,
	uiWidthPx: 750,
	px2dp,
	mainPadding: px2dp(50),
	APPBAR_HEIGHT: Platform.OS === 'ios' ? 44 : 56,		// Header高度
	STATUSBAR_HEIGHT: Platform.OS === 'ios' ? (20 + (isIphoneX() ? 15 : 0)) : StatusBar.currentHeight,	// 状态栏高度
	HEADER_HEIGHT: Platform.OS === 'ios' ? (64 + (isIphoneX() ? 24 : 0)) : 44,
	PADDING_BOTTOM: isIphoneX() ? 15 : 0,
};