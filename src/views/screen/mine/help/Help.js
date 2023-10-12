import React, { Component } from 'react';
import { View, Text, ScrollView, StyleSheet,Linking, TouchableOpacity } from 'react-native';
import { Header } from '../../../components/Index';
import Icon from 'react-native-vector-icons/Ionicons';
import { Colors, Metrics } from '../../../theme/Index';
import { Send } from '../../../../utils/Http';
import { Actions } from 'react-native-router-flux';

export default class Help extends Component {
    constructor(props) {
        super(props);
        this.state = {

        };
    }

    onClickQQ() {
        let url = "mqqwpa://im/chat?chat_type=wpa&uin=3120917946";//调用QQ
        Linking.canOpenURL(url).then(supported => {
            if (supported) {
                Linking.openURL(url);
            }
        });
    }

    onServicePress() {
        Send(`api/system/CopyWriting?type=sw`, {}, 'get').then(res => {
            Actions.push('CommonRules', { title: '商务合作', rules: res.data });
        });
    }

    render() {
        return (
            <View style={styles.container}>
                <View style={{ backgroundColor: Colors.main, height: Metrics.STATUSBAR_HEIGHT, width: Metrics.screenWidth }}></View>
                <Header title="帮助中心" />
                <ScrollView>
                    <TouchableOpacity style={styles.labelContainer} onPress={this.onClickQQ}>
                        <Text style={styles.lableTxt}>联系我们</Text>
                        <Icon name="ios-chevron-forward" size={20} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.labelContainer} onPress={this.onServicePress}>
                        <Text style={styles.lableTxt}>商务合作</Text>
                        <Icon name="ios-chevron-forward" size={20} />
                    </TouchableOpacity>
                </ScrollView>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFFFFF' },
    labelContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        height: 52,
        marginLeft: 10,
        paddingRight: 10,
        alignItems: 'center',
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderColor: Colors.C7
    },
    lableTxt: { fontSize: 16, color: Colors.C11 },
})