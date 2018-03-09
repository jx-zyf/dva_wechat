import React, { Component } from 'react';
import { Form, Icon, Input, Button, Spin } from 'antd';
import { Link, routerRedux } from 'dva/router';
import utils from 'utility';

import styles from './Regist.less';

const FormItem = Form.Item;

class Regist extends Component {
    componentWillReceiveProps(nextProps) {
        if (nextProps.user.status === 'success' || nextProps.user.status === 'fail' ) {
          this.props.dispatch(routerRedux.push('login'));
        }
    }

    handleSubmit = (e) => {
        e.preventDefault();
        const { dispatch } = this.props;
        this.props.form.validateFields((err, values) => {
            if (!err) {
                // console.log('Received values of form: ', values);
                dispatch({
                    type: 'user/regist',
                    payload: {
                        userName: values.userName,
                        password: this.myMd5(values.password1)
                    }
                });
            }
        });
    }

    myMd5(pwd) {
        let str = 'linxunzyf_is_a_goodBoy1996#$~~haha'
        return utils.md5(pwd + str)
    }

    checkPassword = (rule, value, callback) => {
        const form = this.props.form;
        if (value && value !== form.getFieldValue('password1')) {
            callback('两次密码输入不一致');
        } else {
            callback();
        }
    }

    changeToLogin = () => {
        const { dispatch } = this.props;
        dispatch({
            type: 'user/toLogin',
            payload: {
                login: undefined
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
                                rules: [
                                    { required: true, message: '请输入用户名！' },
                                    { min: 3, max: 10, message: '用户名大于3位小于10位！' }
                                ],
                            })(
                                <Input prefix={<Icon type="user" style={{ fontSize: 13 }} />} placeholder="用户名" />
                                )}
                        </FormItem>
                        <FormItem>
                            {getFieldDecorator('password1', {
                                rules: [
                                    { required: true, message: '请输入密码！' },
                                    { min: 6, max: 16, message: '密码大于6位小于16位！' }
                                ],
                            })(
                                <Input prefix={<Icon type="lock" style={{ fontSize: 13 }} />} type="password" placeholder="密码" />
                                )}
                        </FormItem>
                        <FormItem>
                            {getFieldDecorator('password2', {
                                rules: [
                                    { required: true, message: '请输入密码！' },
                                    { min: 6, max: 16, message: '密码大于6位小于16位！' },
                                    { validator: this.checkPassword }
                                ],
                            })(
                                <Input prefix={<Icon type="lock" style={{ fontSize: 13 }} />} type="password" placeholder="确认密码" />
                                )}
                        </FormItem>
                        <FormItem>
                            <Button type="primary" htmlType="submit" className={styles.login_form_button}>
                                注册
                            </Button>
                            已有账号？去 <Link to="login" onClick={this.changeToLogin}>登录</Link>
                        </FormItem>
                    </Form>
                </Spin>
            </div>

        );
    }
}
const WrappedNormalRegistForm = Form.create()(Regist);

export default WrappedNormalRegistForm;