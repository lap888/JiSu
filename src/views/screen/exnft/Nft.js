import React, { Component } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, DeviceEventEmitter } from 'react-native';
import { connect } from 'react-redux';
import RefreshListView, { RefreshState } from 'react-native-refresh-list-view';
import FontAwesome from "react-native-vector-icons/FontAwesome";
import { Colors, Metrics } from '../../theme/Index';
import LinearGradient from 'react-native-linear-gradient';
import { Header, SelectTopTab2 } from '../../components/Index';
import { Send } from '../../../utils/Http';
import NftListItem from './NftListItem';
const TOPTABLIST = [
    { key: 0, name: '市场' },
    { key: 1, name: '我的' }
]
const TRANSACTION_SEQUENCE = [
    { key: 0, title: '价格' },
    { key: -1, title: '' },
    { key: 1, title: '时间' },
];

class Nft extends Component {
    constructor(props) {
        super(props);
        this.spinValue = new Animated.Value(0)
        this.state = {
            showNft: false,
            nftId: `${Date.now()}_${props.userId}_${parseInt(Math.random() * 100000)}`,
            fristCreatePeople: props.userId,
            attr: ['金', '木', '水', '土', '火'][parseInt(Math.random() * 4)],
            timespan: Date.now(),
            github: 'https://github.com/ndgchain/nft',
            nftPath: 'fire',
            lookPic: '',
            dataList: [],
            pageIndex: 1,
            pageSize: 20,
            type: 0,//价格/时间
            order: 0,//正序 / 倒序
            myType: 0//0 市场 / 我的

        };
    }

    componentDidMount() {
        this.onHeaderRefresh();
        this.listener = DeviceEventEmitter.addListener('refreshNft', () => {
            this.onHeaderRefresh()
        })
    }
    componentWillUnmount() {
        this.listener.remove()
    }
    onHeaderRefresh = () => {
        this.setState({ refreshState: RefreshState.HeaderRefreshing, pageIndex: 1, showNft: false })
        let params = {
            pageIndex: 1,
            pageSize: this.state.pageSize,
            order: this.state.order,
            myType: this.state.myType,
            type: this.state.type
        }        
        Send('api/Trade/GetMarketXNfts', params).then(res => {
            if (res.code == 200) {
                this.setState({
                    dataList: res.data,
                    totalPage: res.recordCount,
                    refreshState: res.data.length < 1 ? RefreshState.EmptyData : RefreshState.Idle
                })
            } else {
                this.setState({
                    dataList: [],
                    totalPage: 0,
                    refreshState: RefreshState.EmptyData
                })
            }
        });
    }

    onFooterRefresh = () => {
        let that = this;
        that.setState({
            refreshState: RefreshState.FooterRefreshing,
            pageIndex: this.state.pageIndex + 1
        }, () => {
            let params = {
                pageIndex: that.state.pageIndex,
                searchText: this.state.searchText,
                pageSize: that.state.pageSize,
                order: this.state.order,
                myType: this.state.myType,
                type: this.state.type
            }
            Send('api/Trade/GetMarketXNfts', params).then(res => {
                if (res.code == 200) {
                    this.setState({
                        dataList: that.state.dataList.concat(res.data),
                        totalPage: res.recordCount,
                        refreshState: this.state.dataList.length >= this.state.totalPage ? RefreshState.EmptyData : RefreshState.Idle,
                    })
                } else {
                    this.setState({
                        dataList: [],
                        refreshState: RefreshState.EmptyData
                    })
                }
            });
        });
    }
    selectTab = (item) => {
        this.setState({ myType: item.key, showNft: false }, () => {
            this.onHeaderRefresh()
        })
    }
    /**
     * 排序条件变更
     * @param {*} key 
     */
    onChangeSequence(key) {
        let { order, type } = this.state;
        let newType = type;
        let newOrder = order;
        if (type === key) {
            if (order === 1) {
                newOrder = 0;
            } else {
                newOrder = 1;
            }
        } else {
            newType = key;
            newOrder = 1;
        }
        this.setState({ order: newOrder, type: newType }, () => {
            this.onHeaderRefresh();
        });
    }


    renderBody() {
        let { order, type } = this.state;
        return (
            <View style={{ flex: 1, marginTop: -100, backgroundColor: Colors.White, marginHorizontal: 15, borderTopLeftRadius: 5, borderTopRightRadius: 5 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', margin: 10, marginTop: 15 }}>
                    {TRANSACTION_SEQUENCE.map(item => {
                        let { key, title } = item;
                        let itemSelected = type === key;
                        return (
                            <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }} key={key}>
                                {key != -1 &&
                                    <TouchableOpacity key={key} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }} onPress={() => this.onChangeSequence(key)}>
                                        <Text style={[{ fontSize: 14, color: Colors.C11, marginRight: 2 }, { color: itemSelected ? Colors.C0 : Colors.C11 }]}>{title}</Text>
                                        <View style={{ justifyContent: 'center', marginLeft: 3 }}>
                                            {(itemSelected && this.state.order === 1) ?
                                                <FontAwesome name="caret-up" color={Colors.C6} size={10} />
                                                :
                                                <FontAwesome name="caret-up" color={Colors.C10} size={10} />
                                            }
                                            {(itemSelected && this.state.order === 0) ?
                                                <FontAwesome name="caret-down" color={Colors.C6} size={10} />
                                                :
                                                <FontAwesome name="caret-down" color={Colors.C10} size={10} />
                                            }
                                        </View>
                                    </TouchableOpacity>
                                }

                            </View>
                        )
                    })}
                </View>
                <RefreshListView
                    data={this.state.dataList}
                    keyExtractor={(item, index) => index.toString()}
                    numColumns={2}
                    renderItem={({ item, index }) =>
                        <NftListItem
                            index={index}
                            data={item}
                        />
                    }
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

        )
    }
    render() {

        return (
            <View style={{ flex: 1, backgroundColor: Colors.White }}>
                <View style={{ backgroundColor: Colors.main, height: Metrics.STATUSBAR_HEIGHT, width: Metrics.screenWidth }}></View>
                <Header title="藏品" />
                <LinearGradient colors={[Colors.main, Colors.White]} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={{ height: 180, paddingHorizontal: 10 }}>
                    <SelectTopTab2 list={TOPTABLIST} onPress={this.selectTab} />
                    <View style={{ flexDirection: 'row' }}>


                    </View>
                </LinearGradient>
                <View style={{ flex: 1 }}>
                    {this.renderBody()}
                </View>
            </View>
        );
    }
}
const mapStateToProps = state => ({
    logged: state.user.logged,
    userId: state.user.id,
    mobile: state.user.mobile,
    level: state.user.level,
});

const mapDispatchToProps = dispatch => ({

});
export default connect(mapStateToProps, mapDispatchToProps)(Nft);

const styles = StyleSheet.create({
    bigBtn: {
        marginTop: 50,
        height: 50,
        borderRadius: 5,
        marginHorizontal: 80,
        backgroundColor: Colors.White,
        color: Colors.Alipay
    },
});