import React, { Component } from 'react';
import { StyleSheet, Platform, StatusBar, View, Text } from 'react-native';
import TabNavigator from 'react-native-tab-navigator';
import Icon from "react-native-vector-icons/Ionicons";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import { isIphoneX } from 'react-native-iphone-x-helper';
import { connect } from 'react-redux';
import Home from './home/Home';
import Cq from './home//Cq';
import Colors from '../theme/Colors';
import { Send } from '../../utils/Http';
import { UPDATE_USER } from '../../redux/ActionTypes';
import { Toast } from '../common/index';
import MineScreen from './mine/MineScreen';
import ClassfiyScreen from './shop/ClassfiyScreen';
import Cookie from 'cross-cookie';
import { Actions } from 'react-native-router-flux';

class Index extends Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedTab: "home",
            badgeValue: "···"
        };
    }

    componentDidMount() {
        this.updateUserInfo(-1);
    }

    /**
     * 刷新用户信息
     */
    updateUserInfo(key) {
        if (key !== -1) {
            if (["cq"].indexOf(key) > -1) return;
        }
        if (!this.props.logged) return;
        var that = this;
        Send(`api/InitInfo`, {}, 'GET').then(res => {
            if (res.code == 200) {
                that.props.updateUserInfo(res.data)
            } else {
                Toast.tipBottom(res.message)
            }
        });
    }
    /**
     * 切换Tab
     * @param {*} key 
     */
    switchTab(key) {
        // 修改状态栏样式
        this.changeStatusBar(key);
        this.updateUserInfo(key);
        this.setState({ selectedTab: key });
    }

    changeStatusBar(key) {
        if (key == 'mine') {
            StatusBar.setTranslucent(true);
            StatusBar.setBackgroundColor(Colors.main, true);
        } else {
            StatusBar.setTranslucent(true);
            // StatusBar.setBackgroundColor(Colors.statusBar, true);
            StatusBar.setBackgroundColor(Colors.transparent, true);
        }
    }

    /**
     * 渲染选项卡
     * @param {string} title 
     * @param {string} tabName 组件名字
     * @param {*} isBadge 
     */
    renderTabView(title, tabName, isBadge) {
        let tabPage;
        let iconPath;
        switch (tabName) {
            case 'home':
                iconPath = 'cube'
                tabPage = <Home />;
                break;
            case 'cq':
                iconPath = 'aperture-sharp'
                tabPage = <Cq />;
                break;
            case 'mine':
                iconPath = 'ios-person';
                tabPage = <MineScreen />;
                break;
            case 'shop':
                iconPath = 'md-cube-sharp'
                tabPage = <ClassfiyScreen />;
        }

        return (
            <TabNavigator.Item
                selected={this.state.selectedTab === tabName}
                title={title}
                titleStyle={styles.tabText}
                selectedTitleStyle={styles.tabTextSelected}
                renderIcon={() => <Icon name={`${iconPath}`} color={Colors.ubSelectBtn} size={22} />}
                renderSelectedIcon={() => <Icon name={`${iconPath}`} color={Colors.selectBtn} size={22} />}
                onPress={() => this.switchTab(tabName)}
                renderBadge={() => isBadge ? <View style={styles.badgeView}><Text style={styles.badgeText}>{this.state.badgeValue}</Text></View> : null}
            >
                {tabPage}
            </TabNavigator.Item>
        );
    }
    renderTabBarView() {
        return (
            <TabNavigator
                tabBarStyle={styles.tab}>
                {this.renderTabView('首页', 'home', false)}
                {this.renderTabView('竞拍', 'cq', false)}
                {this.renderTabView('乐购', 'shop', false)}
                {this.renderTabView('我的', 'mine', false)}
            </TabNavigator>
        );
    }
    render() {
        return (
            this.renderTabBarView()
        );
    }
}
const mapStateToProps = state => ({
    logged: state.user.logged,
    userId: state.user.id,
});

const mapDispatchToProps = dispatch => ({

    updateUserInfo: (userInfo) => dispatch({ type: UPDATE_USER, payload: { userInfo } })

});
export default connect(mapStateToProps, mapDispatchToProps)(Index);
const styles = StyleSheet.create({
    imagestyle: { width: 22, height: 22 },
    tabTextSelected: { color: Colors.C6, fontSize: 12, paddingTop: 0, fontWeight: 'bold' },
    tabText: { color: Colors.C10, fontSize: 12, fontWeight: 'bold' },
    tab: {
        flex: 1,
        // borderTopWidth: 1,
        borderColor: '#FFFFFF',
        backgroundColor: '#FFFFFF',
        overflow: 'visible',
        alignItems: 'center',
        justifyContent: 'center',
        height: 50 + (isIphoneX() ? 15 : 0),
        paddingBottom: isIphoneX() ? 15 : 0,
    },
    badgeView: {
        width: 14,
        height: 14,
        backgroundColor: Colors.main,
        borderWidth: 1,
        marginLeft: 10,
        marginTop: 3,
        borderColor: '#FFF',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 8,
    },
    badgeText: {
        color: '#ffffff',
        fontSize: 8,
    }
})