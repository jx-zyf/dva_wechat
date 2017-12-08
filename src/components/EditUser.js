import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Card, Form, Input, Button, message, Spin } from 'antd';
import { routerRedux } from 'dva/router';
import PageHeaderLayout from '../layout/PageHeaderLayout';
import localStorage from '../utils/localStorage';
import io from 'socket.io-client';

const FormItem = Form.Item;

class EditUser extends PureComponent {
    state = {};
    componentWillReceiveProps(nextProps) {
        if (nextProps.user && nextProps.user.resetStatus === true) {
            const { dispatch, user } = this.props;
            dispatch(routerRedux.push('login'));
            localStorage.remove('curUser');
            dispatch({
                type: 'user/logout',
                payload: user.curUser
            });
            let socket = io.connect('http://localhost:8080');
            socket.emit('logout', user.curUser);
            dispatch({
                type: 'user/resetpwdHandle',
                payload: false
            });
        }
    }
    checkCertain = (rule, value, callback) => {
        const { form } = this.props;

        const newPwd = form.getFieldValue('new_pwd');

        if (value !== newPwd) {
            callback('两次密码输入不一致');
        }
        callback();
    }

    handleSubmit = () => {
        const { form, dispatch, user: { curUser } } = this.props;
        form.validateFields((err, values) => {
            if (err) {
                return false;
            }
            const result = {
                userName: curUser,
                old_pwd: values.old_pwd,
                new_pwd: values.new_pwd,
            };
            if (result.old_pwd !== result.new_pwd) {
                dispatch({
                    type: 'user/resetPassword',
                    payload: result,
                });
            } else {
                message.warning('新密码不能和旧密码一样！');
            }
        });
    }

    backUrl = () => {
        window.history.back();
    }

    render() {
        const { user: { loading }, form: { getFieldDecorator } } = this.props;
        const formItemConfig = {
            labelCol: {
                span: 6,
            },
            wrapperCol: {
                span: 12,
            },
        };

        return (
            <PageHeaderLayout defaultSelectedKeys={['3']}>
                <Card bordered={false} title="修改密码" extra={<Button onClick={this.backUrl}>返回</Button>}>
                    <Spin spinning={loading}>
                        <Form onSubmit={this.handleSubmit}>
                            <FormItem {...formItemConfig} label="旧密码" >
                                {getFieldDecorator('old_pwd', {
                                    rules: [
                                        { required: true, message: '请输入旧密码' },
                                        { min: 6, max: 16, message: '密码大于6位小于16位！' }
                                    ],
                                })(
                                    <Input type="password" placeholder="请输入旧密码" />
                                    )}
                            </FormItem>
                            <FormItem {...formItemConfig} label="新密码" extra="6-16个字符" >
                                {getFieldDecorator('new_pwd', {
                                    rules: [
                                        { required: true, message: '请输入新密码' },
                                        { min: 6, max: 16, message: '密码大于6位小于16位！' }
                                    ],
                                })(
                                    <Input type="password" placeholder="请输入新密码" />
                                    )}
                            </FormItem>
                            <FormItem {...formItemConfig} label="确认密码" extra="6-16个字符" >
                                {getFieldDecorator('certain_pwd', {
                                    rules: [
                                        { validator: this.checkCertain },
                                        { required: true, message: '请输入确认密码' },
                                    ],
                                })(
                                    <Input type="password" placeholder="请输入确认密码" />
                                    )}
                            </FormItem>
                            <FormItem wrapperCol={{ span: 18 }} style={{ textAlign: 'right' }} >
                                <Button type="primary" htmlType="submit" loading={loading}>提交</Button>
                            </FormItem>
                        </Form>
                    </Spin>
                </Card>
            </PageHeaderLayout>
        );
    }
}

const WrappedNormalEditUserForm = Form.create()(EditUser);

export default WrappedNormalEditUserForm;