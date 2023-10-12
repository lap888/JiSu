import React, { Component } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Header, Loading } from '../../components/Index';
import { Metrics, Colors } from '../../theme/Index';
import TDetailContent from '../digg/TDetailContent';
import { connect } from 'react-redux'
import { FQAMock } from '../../../config/Constants';
class CollegeFAQ extends Component {
    constructor(props) {
        super(props);
        this.state = {
            topicData: null,
            isLoad: true
        };
    }
    UNSAFE_componentWillMount() {
        this.reloadTopicData();
    }

    reloadTopicData() {
        let that = this;
        that.setState({
            topicData: this.props.info,
            isLoad: false
        })
    }
    dispalyLoading() {
        if (this.state.topicData === null) {
            return (
                <View style={{ alignItems: "center", marginTop: 20 }}>
                    <Text>暂无数据</Text>
                </View>
            )
        }
        if (this.state.isLoad) {
            return (
                <Loading />
            )
        } else {
            return (
                <View>
                    {/* <View style={{ backgroundColor: Colors.White, height: Metrics.STATUSBAR_HEIGHT, width: Metrics.screenWidth }}></View> */}
                    {/* <Header title={this.state.topicData.title} /> */}
                    <View style={{ backgroundColor: Colors.White, height: Metrics.STATUSBAR_HEIGHT, width: Metrics.screenWidth }}></View>
                    <Header leftIconColor={Colors.black} title={this.state.topicData.title} titleStyle={{ color: Colors.black }} statusBarBackgroundColor={Colors.statusBar} backgroundColor={Colors.statusBar} />
                    <View style={{ alignItems: "center", height: Metrics.screenHeight }}>
                        <TDetailContent TDContent={this.state.topicData.content} />
                    </View>
                </View>
            )
        }
    }
    render() {
        return (
            <View style={styles.container}>
                {this.dispalyLoading()}
            </View>
        );
    }
}
const mapStateToProps = state => ({
    userId: state.user.id
});
const mapDispatchToProps = dispatch => ({

})
export default connect(mapStateToProps, mapDispatchToProps)(CollegeFAQ)
// 样式
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFFFFF' },
})