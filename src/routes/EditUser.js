import React, { Component } from 'react';
import { connect } from 'dva';
import EditUserComponent from '../components/EditUser';

function EditUser ({dispatch, user}) {
    return (
        <EditUserComponent dispatch={dispatch} user={user} />
    );
}

function mapStateToProps({ dispatch, user }) {
	return { dispatch, user };
}
export default connect(mapStateToProps)(EditUser);