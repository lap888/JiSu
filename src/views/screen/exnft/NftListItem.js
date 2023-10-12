import React, { Component } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Actions } from 'react-native-router-flux';
import { Colors, Metrics } from '../../theme/Index';
import { connect } from 'react-redux';
class NftListItem extends Component {
	constructor(props) {
		super(props);
		this.state = {
		};
	}

	render() {
		let { data, index } = this.props;
		return (
			<TouchableOpacity key={index} activeOpacity={0.8} style={[styles.itemView, { marginLeft: index % 2 == 1 ? 10 : 15 }]} onPress={() => { Actions.push('ExNftDetail', { data: data }) }}>
				<Image style={styles.img} source={{ uri: `${data.pic}` }} />
				<View style={{ paddingHorizontal: 5, paddingBottom: 5 }}>
					<Text style={{ marginTop: 5, fontSize: 12, color: Colors.grayFont, width: 100 }} numberOfLines={1}>编号:{data.hash}</Text>
					<Text style={{ marginTop: 5, fontSize: 12, color: Colors.grayFont, width: 100 }} numberOfLines={1}>作品:{data.name}</Text>
					<View style={{ flexDirection: 'row', alignItems: 'flex-end', marginTop: 5, marginBottom: 3 }}>
						<Text style={{ fontSize: 12, color: Colors.grayFont, }}>价格: <Text style={{ fontSize: 14, color: Colors.main }}>{data.price}</Text> GC</Text>
					</View>
					<Text style={{ fontSize: 12, color: Colors.grayFont, marginTop: 5 }}>状态:<Text style={{ fontSize: 12, color: Colors.main }}> {data.status == 0 ? '闲置' : data.status == 1 ? '出售中' : ''}</Text></Text>
					<Text style={{ fontSize: 12, color: Colors.main, width: 100,marginTop: 5 }} numberOfLines={1}>{data.uTime}</Text>
					<Text style={{ fontSize: 12, color: Colors.grayFont, marginTop: 5 }}>{'点击查看详情 >'}</Text>
				</View>
			</TouchableOpacity>
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
export default connect(mapStateToProps, mapDispatchToProps)(NftListItem);
const styles = StyleSheet.create({
	itemView: {
		width: (Metrics.screenWidth / 2),
		borderRadius: 2,
		marginBottom: 10,
		backgroundColor: Colors.White,
	},
	img: {
		width: (Metrics.screenWidth - 150) / 2,
		height: (Metrics.screenWidth - 150) / 2,
		borderTopRightRadius: 2,
		borderTopLeftRadius: 2,
		backgroundColor: Colors.main
	},
})
