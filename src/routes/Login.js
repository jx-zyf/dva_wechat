import React, { Component } from 'react';
import { connect } from 'dva';
import LoginComponent from '../components/Login';

function Login ({dispatch, user}) {
    return (
        <LoginComponent dispatch={dispatch} user={user} />
    );
}

function mapStateToProps({ dispatch, user }) {
	return { dispatch, user };
}
export default connect(mapStateToProps)(Login);