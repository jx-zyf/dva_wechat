import React from 'react';
import { Layout, Breadcrumb, Menu, Dropdown, Icon, Popconfirm } from 'antd';
import { connect } from 'dva';
import { routerRedux, Link } from 'dva/router';
import io from 'socket.io-client';
import localStorage from '../utils/localStorage';
import styles from './PageHeaderLayout.less';

const { Header, Footer, Content } = Layout;

class PageHeaderLayout extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            visible: false,
        }
        this.logout = this.logout.bind(this)
    }
    componentDidMount() {
        const { dispatch, user } = this.props;
        if (localStorage.fetch('curUser')) {
            dispatch({
                type: 'user/toLogin',
                payload: {
                    login: 'true'
                }
            });
            dispatch({
                type: 'user/curUser',
                payload: localStorage.fetch('curUser')
            });
        } else {
            dispatch(routerRedux.push('/user/login'));
        }
    }
    componentWillReceiveProps(nextProps) {
        const { dispatch } = this.props;
        if (nextProps.user.login !== 'true') {
            dispatch(routerRedux.push('/user/login'));
        }
    }
    handleVisibleChange = (flag) => {
        this.setState({ visible: flag });
    }
    handleMenuClick = (e) => {
        if(e.key === "item_3"){
            this.setState({ visible: true});
        }
    }
    getChildMenu() {
        const curUser = localStorage.fetch('curUser');
        return (
            <Menu onClick={this.handleMenuClick}>
                <Menu.Item title="当前账号">
                    <div>
                        <span>当前账号：</span>
                        <Link to="/" style={{ marginRight: 10 }}>{curUser}</Link>
                    </div>
                </Menu.Item>
                <Menu.Item title="个人中心">
                    <div style={{ textAlign: 'center' }}>
                        <Link to="/user/personal"><Icon type="user" style={{ marginRight: 10 }} />个人中心</Link>
                    </div>
                </Menu.Item>
                <Menu.Item title="修改密码">
                    <div style={{ textAlign: 'center' }}>
                        <Link to="/user/edit"><Icon type="edit" style={{ marginRight: 10 }} />修改密码</Link>
                    </div>
                </Menu.Item>
                <Menu.Item title="退出登录">
                    <Popconfirm placement="bottom" title="确定退出登录吗？" onConfirm={this.logout} okText="确定" cancelText="取消">
                        <div style={{ textAlign: 'center' }}>
                            <a><Icon type="logout" style={{ marginRight: 10 }} />退出登录</a>
                        </div>
                    </Popconfirm>
                </Menu.Item>
                <Menu.Divider></Menu.Divider>
            </Menu>
        );
    }
    //退出登录
    logout() {
        const { dispatch, user } = this.props;
        localStorage.remove('curUser');
        dispatch({
            type: 'user/logout',
            payload: user.curUser
        });
        let socket = io.connect('http://localhost:8080');
        socket.emit('logout', user.curUser);
        this.setState({ visible: false});
    }
    render() {
        const curUser = localStorage.fetch('curUser');
        const { defaultSelectedKeys } = this.props;
        const { visible } = this.state;
        return (
            <Layout style={{ minHeight: '100vh' }}>
                <Header style={{ background: '#fff', padding: 0, margin: '24px 16px 0', position: 'relative' }}>
                    <Breadcrumb style={{ margin: '0 24px' }}>
                        <Breadcrumb.Item>Home</Breadcrumb.Item>
                        {defaultSelectedKeys[0] === '1' &&
                            <Breadcrumb.Item>WeChat</Breadcrumb.Item>
                        }
                        {defaultSelectedKeys[0] === '2' &&
                            <Breadcrumb.Item>About Me</Breadcrumb.Item>
                        }
                        {defaultSelectedKeys[0] === '3' &&
                            <Breadcrumb.Item>EditUser</Breadcrumb.Item>
                        }
                        {defaultSelectedKeys[0] === '4' &&
                            <Breadcrumb.Item>Personal</Breadcrumb.Item>
                        }
                    </Breadcrumb>
                    <Menu mode="horizontal" className={styles.right_menu} selectedKeys={null}>
                        <Menu.Item key="user">
                            <Dropdown 
                                overlay={this.getChildMenu()} 
                                trigger={['click']} 
                                placement="bottomRight" 
                                visible={visible}
                                onVisibleChange={this.handleVisibleChange}
                            >
                                <div><Icon type="user" />{curUser}<Icon type="down" /></div>
                            </Dropdown>
                        </Menu.Item>
                    </Menu>
                </Header>
                <Content style={{ margin: '24px 16px 0' }}>
                    <div style={{ padding: 24, background: '#fff' }}>
                        {this.props.children}
                    </div>
                </Content>
                <Footer style={{ textAlign: 'center' }}>
                    WeChat ©2016 LinXun
        </Footer>
            </Layout>
        );
    }
}


function mapStateToProps({ dispatch, user }) {
    return { dispatch, user };
}
export default connect(mapStateToProps)(PageHeaderLayout);
