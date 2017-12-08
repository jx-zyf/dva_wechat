import React, { Component } from 'react';
import { connect } from 'dva';
import PersonalComponent from '../components/Personal';

function Personal ({dispatch, user}) {
    return (
        <PersonalComponent dispatch={dispatch} user={user} />
    );
}

function mapStateToProps({ dispatch, user }) {
	return { dispatch, user };
}
export default connect(mapStateToProps)(Personal);