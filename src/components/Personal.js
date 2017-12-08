import React, { PureComponent } from 'react';
import { Card, Button, Spin, Form, Input, Radio, DatePicker, Cascader } from 'antd';
import moment from 'moment';
import PageHeaderLayout from '../layout/PageHeaderLayout';
import localStorage from '../utils/localStorage';
import { CITY_OPTIONS } from '../utils/constants';

const FormItem = Form.Item;
const RadioGroup = Radio.Group;
const dateFormat = 'YYYY/MM/DD';

class Personal extends PureComponent {
    state = {};

    componentDidUpdate() {
        const { user: { setPersonalStatus }, dispatch } = this.props;
        const curUser = localStorage.fetch('curUser');
        if (setPersonalStatus) {
            dispatch({
                type: 'user/getPersonal',
                payload: curUser
            });
            dispatch({
                type: 'user/setPersonalHandle',
                payload: false
            });
        }
    }

    componentDidMount() {
        const { dispatch, user: { curUserInfo } } = this.props;
        const curUser = localStorage.fetch('curUser');
        if(!curUserInfo.userName){
            dispatch({
                type: 'user/getPersonal',
                payload: curUser
            });
        }
    }

    backUrl = () => {
        window.history.back();
    }

    disabledDate(current) {
        return current && current.valueOf() > Date.now();
    }

    handleSubmit = (e) => {
        e.preventDefault();
        const { form, dispatch, user: { curUser } } = this.props;
        form.validateFields((err, values) => {
            if (err) {
                return false;
            }
            const result = {
                userName: curUser,
                sex: values.sex,
                birth: values.birth.format(dateFormat),
                city: values.city.join('/'),
                signature: values.signature
            };
            dispatch({
                type: 'user/setPersonal',
                payload: result
            });
        });
    }

    render() {
        const { user: { loading, curUser, curUserInfo }, form: { getFieldDecorator } } = this.props;
        const { sex, birth, city, signature } = curUserInfo;
        let showCity = []; 
        if (city){
            showCity = city.split('/');
        }
        const formItemConfig = {
            labelCol: {
                span: 6,
            },
            wrapperCol: {
                span: 12,
            },
        };

        return (
            <PageHeaderLayout defaultSelectedKeys={['4']}>
                <Card bordered={false} title="个人中心" extra={<Button onClick={this.backUrl}>返回</Button>}>
                    <Spin spinning={loading}>
                        <Form onSubmit={this.handleSubmit}>
                            <FormItem {...formItemConfig} label="用户名" >
                                <Input type="text" value={curUser} disabled />
                            </FormItem>
                            <FormItem {...formItemConfig} label="性别" >
                                {getFieldDecorator('sex', {
                                    initialValue: sex
                                })(
                                    <RadioGroup>
                                        <Radio value="male">男</Radio>
                                        <Radio value="female">女</Radio>
                                        <Radio value="secret">保密</Radio>
                                    </RadioGroup>
                                )}
                            </FormItem>
                            <FormItem {...formItemConfig} label="出生年月" >
                                {getFieldDecorator('birth', {
                                    initialValue: moment(birth, dateFormat)
                                })(
                                    <DatePicker disabledDate={this.disabledDate} format={dateFormat} />
                                )}
                            </FormItem>
                            <FormItem {...formItemConfig} label="所在城市">
                                {getFieldDecorator('city', {
                                    initialValue: showCity
                                })(
                                    <Cascader options={CITY_OPTIONS} changeOnSelect />
                                )}
                            </FormItem>
                            <FormItem {...formItemConfig} label="个性签名">
                                {getFieldDecorator('signature', {
                                    initialValue: signature
                                })(
                                    <Input type="text" placeholder="用一句话描述你自己..." />
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

const WrappedNormalEditUserForm = Form.create()(Personal);

export default WrappedNormalEditUserForm;