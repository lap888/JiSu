import React, { PureComponent } from 'react';
import { View, Image, Text, InteractionManager, ProgressViewIOS, ProgressBarAndroid, Platform, Modal, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { connect } from 'react-redux';
import { Root } from 'native-base';
import { Router, Scene } from 'react-native-router-flux';
import {
    upgrade
} from 'rn-app-upgrade';
import { UPDATE_VERSION } from './redux/ActionTypes';
import { Colors, Metrics } from './views/theme/Index';
import { Version, CodePushKey, CodePushKeyIos } from './config/Index';
import { Send } from './utils/Http';
import Loading from './views/screen/Loading';
//主页
import Index from './views/screen/Index';
import Invitation from './views/screen/home/Invitation';
import SelfZc from './views/screen/home/SelfZc';
import College from './views/screen/home/College';
import CollegeFAQ from './views/screen/home/CollegeFAQ';
import AdFlowDetails from './views/screen/home/AdFlowDetails';
import TaskApeal from './views/screen/home/TaskApeal';
import TaskApealList from './views/screen/home/TaskApealList';
import FeedbackDetails from './views/screen/home/FeedbackDetails';

//Cq
import NftDetails from './views/screen/home/nft/Details';
import Cq from './views/screen/home/Cq';
import CqDetails from './views/screen/home/nft/CqDetails';
import CqItem from './views/screen/home/nft/CqItem';
//nft
import ExNft from './views/screen/exnft/Nft';
import ExNftDetail from './views/screen/exnft/ExNftDetail';

//otc
import Otc from './views/screen/home/notc/Otc';
import BusinessPage from './views/screen/mine/BusinessPage';
import TransactionDetail from './views/screen/mine/TransactionDetail';
import BusinessCompDetail from './views/screen/mine/BusinessCompDetail';
import UserInfo from './views/screen/mine/userInfo/UserInfo';

import Certification from './views/screen/mine/Certification';
import CertificationManual from './views/screen/mine/CertificationManual';

//login
import Login from './views/screen/login/Login';
import Password from './views/screen/login/Password';
import InvitationCode from './views/screen/login/InvitationCode';
import SignUp from './views/screen/login/SignUp';
import SignUpPage from './views/screen/login/SignUpPage';
import UnLockDevice from './views/screen/login/UnLockDevice';
//userInfo
import EditUserInfo from './views/screen/mine/userInfo/EditUserInfo';
import EditSignInPwd from './views/screen/mine/userInfo/EditSignInPwd';
import BusinessPwd from './views/screen/mine/userInfo/BusinessPwd';
import ModifyAlipay from './views/screen/mine/userInfo/ModifyAlipay';
import EditInviterCode from './views/screen/mine/EditInviterCode';
//help
import Help from './views/screen/mine/help/Help';
import CommonRules from './views/screen/mine/CommonRules';
//team
import MyTeam from './views/screen/mine/MyTeam';
//xfq
import XfqScreen from './views/screen/xfq/XfqScreen';
//message
import Message from './views/screen/mine/Message';
import SystemMessage from './views/screen/mine/SystemMessage';
import MessageDetail from './views/screen/mine/MessageDetail';

//shop
import GoodsDetail from './views/screen/shop/GoodsDetail';
import ConfirmOrder from './views/screen/shop/ConfirmOrder';
import ClassfiyScreen from './views/screen/shop/ClassfiyScreen';
import OrderListScreen from './views/screen/shop/OrderListScreen';
import SearchGoods from './views/screen/shop/SearchGoods';
import ShopDetail from './views/screen/shop/ShopDetail';
import OrderDetail from './views/screen/shop/OrderDetail';


import CodePush from "react-native-code-push";

// 静默方式，app每次启动的时候，都检测一下更新 'ON_APP_RESUME'

class Routers extends PureComponent {
    constructor(props) {
        super(props)
        this.state = {
            updateModalVisible: false,
            updateInfo: {},
            updateProgressBarVisible: false,
            noticeModalVisible: true
        };
    }
    componentDidMount() {
        InteractionManager.runAfterInteractions(() => {
            CodePush.notifyAppReady();
            // this.fetchVersion();
        });
    }
    /**
     * 获取线上版本
     * updateContent
     * currentVersion: "1.0.1",
     * downloadUrl: "",
     */
    fetchVersion() {
        let systemName = Platform.OS.toLowerCase();
        Send(`api/system/ClientDownloadUrl?name=${systemName}`, {}, 'get').then(res => {
            if (res.code == 200) {
                this.checkUpdateApp(res.data);//{ currentVersion: '1.0.0', downloadUrl: 'http://app-1251750492.file.myqcloud.com/prod/x7game2.0.7.apk', updateContent: '118创富助手 喜普大奔 今日上线公测! 1.0.1' }
            }
        });
    }
    /**
     * 线上版本获取
     */
    checkUpdateApp(updateInfo) {
        let { currentVersion, isHotReload, isSilent } = updateInfo;
        this.props.updateVersion(currentVersion, true);
        if (Version >= currentVersion) {
            return;
        }
        this.setState({ updateInfo }, () => {
            if (isHotReload) {
                // 热更新强制弹框
                if (isSilent) {
                    // 静默更新
                    this.hotReload(CodePush.InstallMode.IMMEDIATE);
                } else {
                    this.setState({ updateModalVisible: true });
                }
            } else {
                if (Platform.OS === 'ios') {
                    // IOS升级ipa
                    this.setState({ updateModalVisible: true });
                } else {
                    this.setState({ updateModalVisible: true });
                }
            }
        });
    }
    /**
    * 热更新更新流程
    * @param {*} mode 
    */
    hotReload(mode) {
        if (!this.state.updateProgressBarVisible) this.setState({ updateProgressBarVisible: true });
        CodePush.sync(
            {
                installMode: CodePush.InstallMode.IMMEDIATE,
                mandatoryInstallMode: mode,
                deploymentKey: Platform.OS === 'ios' ? CodePushKeyIos : CodePushKey,
                updateDialog: false,
            }, (status) => {
                console.log("code-push status" + status);
                if ([0, 2, 3, 8].indexOf(status) !== -1) this.setState({ updateModalVisible: false });
            }, (process) => {
                let { totalBytes, receivedBytes } = process;
                console.log("code-push process" + processValue);
            }, (update) => {
                console.log("code-push update" + update);
            }
        );
    }
    /**
     * 应用商店更新流程
     */
    downloadApp() {
        let updateInfo = this.state.updateInfo;
        let that = this;
        if (Platform.OS === 'ios') {
            // var IPAInstall = NativeModules.IPAInstall2;
            // IPAInstall.itms_install(updateInfo['downloadUrl']);
            Linking.openURL(updateInfo.downloadUrl);
        } else {
            upgrade(updateInfo.downloadUrl);
        }
        if (!this.state.updateProgressBarVisible) this.setState({ updateProgressBarVisible: true });
    }
    /**
     * 渲染更新Bar
     */
    renderAppUpdateBar() {
        return (
            <TouchableOpacity onPress={() => this.downloadApp()}>
                <View style={styles.updateFooter}>
                    <Text style={styles.updateText}>立即更新</Text>
                </View>
            </TouchableOpacity>
        )
    }
    /**
     * 热更新进度条
     */
    renderAppUpdateProgress = () => {
        let progressValue = 0;
        return (
            <View style={{ paddingTop: 10, paddingBottom: Platform.OS === 'ios' ? 35 : 20 }}>
                {Platform.OS === 'ios' ?
                    <ProgressViewIOS progressTintColor={Colors.C6} trackTintColor={Colors.C6} progress={progressValue} />
                    :
                    <ProgressBarAndroid animating styleAttr="Horizontal" color={Colors.C6} progress={progressValue} />
                }
            </View>
        )
    }
    /**
     * 系统更新提示框
     */
    renderUpdateModal() {
        return (
            <Modal transparent visible={this.state.updateModalVisible} onRequestClose={() => { }}>
                <View style={styles.updateContainer}>
                    <View style={[styles.updateContainer, { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, backgroundColor: 'black', opacity: 0.5 }]} />
                    <View style={styles.updateHeader}>
                        <Image source={require('./views/images/lib_update_app_top_bg.png')} resizeMode="contain" style={{ width: Metrics.screenWidth * 0.75, height: Metrics.screenWidth * 0.75 * 0.454, marginTop: -30 }} />
                        <View style={{ paddingLeft: 20, paddingRight: 20 }}>
                            <Text style={styles.updateVersion}>{`是否升级到${this.state.updateInfo['currentVersion']}版本？`}</Text>
                            <Text style={styles.updateContent}>{this.state.updateInfo['updateContent']}</Text>
                            {this.state.updateProgressBarVisible ? this.renderAppUpdateProgress() : this.renderAppUpdateBar()}
                        </View>
                    </View>
                </View>
            </Modal>
        )
    }
    render() {
        return (
            <Root>
                <Router headerMode="none">
                    <Scene key="root">
                        <Scene key="NftDetails" component={NftDetails} />
                        <Scene key="Loading" component={Loading} />
                        <Scene key="Index" component={Index} />
                        {/* <Scene key="NftDetails" component={NftDetails} /> */}
                        <Scene key="Invitation" component={Invitation} />
                        <Scene key="College" component={College} />
                        <Scene key="CollegeFAQ" component={CollegeFAQ} />
                        <Scene key="SelfZc" component={SelfZc} />
                        <Scene key="AdFlowDetails" component={AdFlowDetails} />
                        <Scene key="Otc" component={Otc} />
                        <Scene key="BusinessPage" component={BusinessPage} />
                        <Scene key="TransactionDetail" component={TransactionDetail} />
                        <Scene key="BusinessCompDetail" component={BusinessCompDetail} />
                        <Scene key="TaskApeal" component={TaskApeal} />
                        <Scene key="TaskApealList" component={TaskApealList} />
                        <Scene key="FeedbackDetails" component={FeedbackDetails} />
                        <Scene key="Certification" component={Certification} />
                        <Scene key="CertificationManual" component={CertificationManual} />
                        
                        <Scene key="UserInfo" component={UserInfo} />
                        <Scene key="EditUserInfo" component={EditUserInfo} />
                        <Scene key="EditSignInPwd" component={EditSignInPwd} />
                        <Scene key="BusinessPwd" component={BusinessPwd} />
                        <Scene key="ModifyAlipay" component={ModifyAlipay} />
                        <Scene key="EditInviterCode" component={EditInviterCode} />
                        
                        <Scene key="Login" component={Login} />
                        <Scene key="Password" component={Password} />
                        <Scene key="InvitationCode" component={InvitationCode} />
                        <Scene key="SignUp" component={SignUp} />
                        <Scene key="SignUpPage" component={SignUpPage} />
                        <Scene key="UnLockDevice" component={UnLockDevice} />
                        <Scene key="Help" component={Help} />
                        <Scene key="CommonRules" component={CommonRules} />
                        
                        <Scene key="MyTeam" component={MyTeam} />
                        <Scene key="XfqScreen" component={XfqScreen} />
                        <Scene key="Message" component={Message} />
                        <Scene key="MessageDetail" component={MessageDetail} />
                        <Scene key="SystemMessage" component={SystemMessage} />
                        
                        <Scene key="Cq" component={Cq} />
                        <Scene key="CqDetails" component={CqDetails} />
                        <Scene key="CqItem" component={CqItem} />
                        <Scene key="ExNft" component={ExNft} />
                        <Scene key="ExNftDetail" component={ExNftDetail} />

                        <Scene key="Classfiy" component={ClassfiyScreen}/>
                        <Scene key="GoodsDetail" component={GoodsDetail}/>
                        <Scene key="ConfirmOrder" component={ConfirmOrder}/>
                        <Scene key="OrderList" component={OrderListScreen}/>
                        <Scene key="OrderDetail" component={OrderDetail}/>
                        <Scene key="SearchGoods" component={SearchGoods}/>
                        <Scene key="ShopDetail" component={ShopDetail}/>
                        
                        
                    </Scene>
                </Router>
                {this.renderUpdateModal()}
            </Root>
        );
    }
}
const mapStateToProps = state => ({
    showIndicator: state.user.showIndicator,
    warnVersion: state.router.warnVersion,
    isIgnored: state.router.isIgnored,
    userId: state.user.id || -1,
    id: state.notice.id,
    title: state.notice.title,
    content: state.notice.content,
    isReaded: state.notice.isReaded

});
const mapDispatchToProps = dispatch => ({
    updateVersion: (warnVersion, isIgnored) => dispatch({ type: UPDATE_VERSION, payload: { warnVersion, isIgnored } })
});
export default connect(mapStateToProps, mapDispatchToProps)(Routers);

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFFFFF' },
    updateContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    updateHeader: { width: Metrics.screenWidth * 0.75, backgroundColor: '#FFFFFF', borderRadius: 10 },
    updateVersion: { fontSize: 17, textAlign: 'left', marginTop: 20 },
    updateContent: { fontSize: 14, paddingTop: 15 },
    updateFooter: { marginTop: 15, marginBottom: 15, justifyContent: 'center', alignItems: 'center', alignSelf: 'center', height: 38, width: 180, backgroundColor: Colors.notice, opacity: 0.9, borderRadius: 17 },
    updateText: { fontSize: 14, color: '#FFFFFF' }
});
