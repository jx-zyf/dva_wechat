import React, { Component } from 'react';
import { connect } from 'dva';
import { Layout, Menu, Icon, Breadcrumb, Dropdown, Modal } from 'antd';
import { routerRedux, Link } from 'dva/router';
import io from 'socket.io-client';
import localStorage from '../utils/localStorage';
import PageHeaderLayout from './PageHeaderLayout';
import styles from './index.less'

const { Header, Footer, Sider, Content } = Layout;

class MainLayout extends Component {
    constructor(props) {
        super(props);
    }
    render() {
        const curUser = localStorage.fetch('curUser');
        const { defaultSelectedKeys } = this.props;
        return (
            <Layout style={{ minHeight: '100vh' }}>
                <Sider
                    breakpoint="lg"
                    collapsedWidth="0"
                    style={{zIndex: 99}}
                >
                    <div className={styles.logo}>WeChat</div>
                    <Menu theme="dark" mode="inline" defaultSelectedKeys={defaultSelectedKeys}>
                        <Menu.Item key="1">
                            <Link to='/'>
                                <Icon type="message" />
                                <span className="nav-text">群聊</span>
                            </Link>
                        </Menu.Item>
                        <Menu.Item key="2">
                            <Link to='/about'>
                                <Icon type="fork" />
                                <span className="nav-text">关于</span>
                            </Link>
                        </Menu.Item>
                    </Menu>
                </Sider>
                <PageHeaderLayout defaultSelectedKeys={defaultSelectedKeys} children={this.props.children}></PageHeaderLayout>
            </Layout>
        );
    }
}

function mapStateToProps({ dispatch, user }) {
	return { dispatch, user };
}
export default connect(mapStateToProps)(MainLayout);