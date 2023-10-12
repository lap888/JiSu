import React, { Component } from 'react';
import { View, Text } from 'react-native';
import RefreshListView, { RefreshState } from 'react-native-refresh-list-view';
import { Colors, Metrics } from '../../../theme/Index';
import { Header } from '../../../components/Index';
import { Send } from '../../../../utils/Http';
export default class CqItem extends Component {
    constructor(props) {
        super(props);
        this.state = {
            detaList: [],
            pageSize: 20,
            pageIndex: 1,
            totalPage:0,
            refreshState: true,
            moreData: true,
            haveBm: 0,
            luckNum: 0,
            myNum: 0,


        };
    }
    componentDidMount = () => {
        this.onHeaderRefresh()
    };
    onHeaderRefresh = () => {
        this.setState({ refreshState: RefreshState.HeaderRefreshing, pageIndex: 1 }, () => {
            Send('api/Trade/GetCqXNfts', { NftId: this.props.data.id, PageIndex: this.state.pageIndex, PageSize: this.state.pageSize }).then(res => {
                if (res.code == 200) {
                    this.setState({
                        detaList: res.data.luckUsers,
                        haveBm: res.data.haveBm,
                        luckNum: res.data.luckNum,
                        myNum: res.data.myNum,
                        totalPage: res.recordCount,
                        candyHList: res.data.recordCount,
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
        })
    }

    onFooterRefresh = () => {
        this.setState({ pageIndex: this.state.pageIndex + 1, refreshState: RefreshState.FooterRefreshing }, () => {
            Send('api/Trade/GetCqXNfts', { NftId: this.props.data.id, PageIndex: this.state.pageIndex, PageSize: this.state.pageSize }).then(res => {
                if (res.code == 200) {
                    this.setState({
                        detaList: this.state.detaList.concat(res.data.luckUsers),
                        haveBm: res.data.haveBm,
                        luckNum: res.data.luckNum,
                        myNum: res.data.myNum,
                        totalPage: res.recordCount,
                        refreshState: this.state.detaList.length >= this.state.totalPage ? RefreshState.EmptyData : RefreshState.Idle,
                    })
                } else {
                    this.setState({
                        detaList: [],
                        totalPage: 0,
                        refreshState: RefreshState.EmptyData
                    })
                }
            });
        })
    }
    renderItem = ({ item, index }) => {
        return (
            <View key={index} style={[{ paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: Colors.C13, paddingHorizontal: 10 }, { flex: 1 }]}>
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
    }
    render() {
        return (
            <View style={{ flex: 1, backgroundColor: Colors.White }}>
                <View style={{ backgroundColor: Colors.White, height: Metrics.STATUSBAR_HEIGHT, width: Metrics.screenWidth }}></View>
                <Header leftIconColor={Colors.black} title={'中签名单'} titleStyle={{ color: Colors.black }} statusBarBackgroundColor={Colors.statusBar} backgroundColor={Colors.statusBar} />
                <RefreshListView
                    data={this.state.detaList}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={this.renderItem}
                    refreshState={this.state.refreshState}
                    onHeaderRefresh={this.onHeaderRefresh}
                    onFooterRefresh={this.onFooterRefresh}
                    // 可选
                    footerRefreshingText='正在玩命加载中...'
                    footerFailureText='我擦嘞，居然失败了 =.=!'
                    footerNoMoreDataText='暂无更多数据...'
                    footerEmptyDataText='暂无更多数据...'
                />
            </View>
        );
    }
}
