import React, { Component } from 'react';
import MainLayout from '../layout';
import Chat from '../wechat/Chat';

class WeChat extends Component {
    render() {
        return (
            <MainLayout defaultSelectedKeys={['1']}>
                <Chat />
            </MainLayout>
        );
    }
}

export default WeChat;