import React, { Component } from 'react';
import { connect } from 'dva';
import RegistComponent from '../components/Regist';

function Regist({ dispatch, user }) {
    return (
        <RegistComponent dispatch={dispatch} user={user} />
    );
}

function mapStateToProps({ dispatch, user }) {
    return { dispatch, user };
}
export default connect(mapStateToProps)(Regist);