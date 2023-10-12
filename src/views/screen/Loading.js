import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Actions } from 'react-native-router-flux';
import SplashScreen from 'react-native-splash-screen';

class Loading extends Component {

    componentDidMount() {
        this.show = false;
        this.timer = setTimeout(() => {
            SplashScreen.hide();
            if (!this.show) {
                // if (this.props.logged) {
                //     Actions.replace('Index');
                // } else {
                //     Actions.replace('Login');//{ type: 'replace' }
                // }
                
                Actions.replace('Index');
                this.show = true
            }

        }, 1000);
    }

    render() {
        return (
            <>
            </>
        );
    }
}
const mapStateToProps = state => ({
    logged: state.user.logged,
});
const mapDispatchToProps = dispatch => ({

});
export default connect(mapStateToProps, mapDispatchToProps)(Loading);