import React, { Component } from 'react';
import { Form, Icon, Input, Button, Checkbox, Spin } from 'antd';
import { Link, routerRedux } from 'dva/router';

import styles from './Login.less';

const FormItem = Form.Item;

class Login extends Component {
    componentWillReceiveProps(nextProps) {
        const { dispatch } = this.props;
        if (nextProps.user.login === 'true') {
            dispatch(routerRedux.push('/'));
        }
        if (nextProps.user.login === 'false') {
            dispatch(routerRedux.push('regist'));
            dispatch({
                type: 'user/toLogin',
                payload: {
                    login: undefined
                }
            });
        }
    }

    handleSubmit = (e) => {
        e.preventDefault();
        const { dispatch } = this.props;
        this.props.form.validateFields((err, values) => {
            if (!err) {
                // console.log('Received values of form: ', values);
                dispatch({
                    type: 'user/login',
                    payload: {
                        userName: values.userName,
                        password: values.password
                    }
                });
            }
        });
    }

    changeToRegist = () => {
        const { dispatch } = this.props;
        dispatch({
            type: 'user/toRegist',
            payload: {
                status: undefined
            }
        });
    }

    render() {
        const { getFieldDecorator } = this.props.form;
        const { loading } = this.props.user;
        return (
            <div className={styles.normal}>
                <h1>WeChat</h1>
                <Spin spinning={loading}>
                    <Form onSubmit={this.handleSubmit} className={styles.login_form}>
                        <FormItem>
                            {getFieldDecorator('userName', {
                                rules: [{ required: true, message: '请输入用户名！' }],
                            })(
                                <Input prefix={<Icon type="user" style={{ fontSize: 13 }} />} placeholder="Username" />
                                )}
                        </FormItem>
                        <FormItem>
                            {getFieldDecorator('password', {
                                rules: [{ required: true, message: '请输入密码！' }],
                            })(
                                <Input prefix={<Icon type="lock" style={{ fontSize: 13 }} />} type="password" placeholder="Password" />
                                )}
                        </FormItem>
                        <FormItem>
                            {getFieldDecorator('remember', {
                                valuePropName: 'checked',
                                initialValue: true,
                            })(
                                <Checkbox>Remember me</Checkbox>
                                )}
                            <a className={styles.login_form_forgot} href="#">忘记密码？</a>
                            <Button type="primary" htmlType="submit" className={styles.login_form_button}>
                                登录
                            </Button>
                            还没有账号？现在 <Link to="regist" onClick={this.changeToRegist}>注册</Link>
                        </FormItem>
                    </Form>
                </Spin>
            </div>
        );
    }
}
const WrappedNormalLoginForm = Form.create()(Login);

export default WrappedNormalLoginForm;