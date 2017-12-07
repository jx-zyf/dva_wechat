import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'dva';
import { Alert, Input, message, Button, Icon, Modal, Popconfirm, Popover } from 'antd';
import io from 'socket.io-client';
import localStorage from '../utils/localStorage';

const { TextArea } = Input;
import styles from './Chat.less';

class Chat extends Component {
    constructor(props) {
        super(props);
        this.mountd = true;
        // 建立连接
        this.socket = io.connect('http://localhost:8080');
        this.state = {
            userCount: 0,
            visible: false,
            imgSrc: '',
        }
    }
    componentDidUpdate() {
        const _this = this;
        if (localStorage.fetch('curUser') !== null) {
            const { curUser } = this.props.user;
            this.socket.emit('login', curUser);
            this.socket.on('login_success', () => {
                this.socket.on('system', function (nickname, userCount, type) {
                    let msg = nickname + (type === 'login' ? ' 加入了' : '离开了') + '聊天！';
                    if (userCount !== _this.state.userCount) {
                        // 组件加载完毕再setState
                        if (_this.mountd) {
                            _this.setState({
                                userCount: userCount
                            });
                            _this.sendMsg('系统', msg, '#999');
                        }
                    }
                });
            });
            // 接收消息
            this.socket.on('newMsg', function (userName, msg, color, type) {
                _this.sendMsg(userName, msg, color, type);
            });
        }
    }
    componentWillUnmount() {
        this.mountd = false;
        const { chat: { msgList }, dispatch } = this.props;
        if (msgList.length > 0) {
            dispatch({
                type: 'chat/clearSystem'
            });
        }
    }
    sendMsg = (user, msg, color, type) => {
        const { dispatch } = this.props;
        var date = new Date().toTimeString().substr(0, 8);
        var date_old = date;
        var color = color || '#000';
        dispatch({
            type: 'chat/save',
            msg: {
                user: user,
                msg: msg,
                color: color,
                date: date,
                type: type
            }
        });
        var showMsg = ReactDOM.findDOMNode(this.refs.showMsg);
        if (showMsg) {
            showMsg.scrollTop = showMsg.scrollHeight - showMsg.clientHeight;
        }
    }
    // 发消息
    send = (e) => {
        e.preventDefault();
        // let user = localStorage.fetch('curUser');
        let msg = e.target.value.replace(/&nbsp;/g, '');
        let color = ReactDOM.findDOMNode(this.refs.fontColor).value;
        // 将表情转化成对应的img
        msg = this.showTusiji(msg);
        if (msg.trim().length > 0) {
            this.socket.emit('sendMsg', msg, color, 'text');
        } else {
            message.warning('不能发送空消息');
        }
        e.target.value = '';
    }
    // 选择图片
    sendImg = (e) => {
        const _this = this;
        const target = e.target;
        //检查是否有文件被选中
        if (target.files.length !== 0) {
            //获取文件并用FileReader进行读取
            let file = target.files[0],
                reader = new FileReader();
            if (!reader) {
                _this.sendMsg('系统', '!your browser doesn\'t support fileReader', 'red');
                target.value = '';
                return;
            };
            reader.onload = function (e) {
                _this.showModal();
                _this.setState({
                    imgSrc: e.target.result
                });
            };
            reader.readAsDataURL(file);
        };
    }
    showModal = () => {
        this.setState({
            visible: true,
        });
    }
    hideModal = () => {
        this.setState({
            visible: false,
        });
    }
    // 发送图片
    okHandle = () => {
        let msg = ReactDOM.findDOMNode(this.refs.img).src;
        let color = ReactDOM.findDOMNode(this.refs.fontColor).value;
        if (msg.src !== '') {
            this.socket.emit('sendMsg', msg, color, 'image');
        } else {
            message.warning('请选择图片！');
        }
        this.setState({
            visible: false,
        });
    }
    // 兔斯基表情包
    sendTsj = (e) => {
        if (e.target.nodeName.toLowerCase() === 'img') {
            let tsjIndex = e.target.getAttribute('title');
            ReactDOM.findDOMNode(this.refs.msgInput).value += `[tusiji:${tsjIndex}]`;
            ReactDOM.findDOMNode(this.refs.msgInput).focus();
        }
    }
    // 表情字符串转化成img
    showTusiji (msg) {
        var match, result = msg,
            reg =  /\[tusiji:\d+\]/g,
            emojiIndex;
        while (match = reg.exec(msg)) {
            emojiIndex = match[0].slice(8, -1);
            if (emojiIndex > 69) {
                result = result.replace(match[0], '[X]');
            } else {
                result = result.replace(match[0], `<img class="emoji" src="${require(`../assets/tusiji/${emojiIndex}.gif`)}" />`);
            };
        };
        return result;
    }
    // 清屏
    clearScreen = () => {
        const { dispatch } = this.props;
        dispatch({
            type: 'chat/clearScreen'
        });
        message.success('清屏成功！');
    }
    render() {
        const { userCount } = this.state;
        const { chat: { msgList }, dispatch } = this.props;
        // 展示消息
        if (msgList.length > 0) {
            for (var i = msgList.length - 1; i >= 0; i--) {
                if (i - 1 >= 0 && msgList[i].date === msgList[i - 1].date) {
                    msgList.splice(i, 1);
                }
            }
            var ele = msgList.map((item, index) => {
                return (
                    <div key={index} className={styles.msgList}>
                        {item.user === localStorage.fetch('curUser') &&
                            <p data-user={item.user} className={styles.msg_r} style={{ color: item.color }}>
                                <span className={styles.timeSpan}>：({item.date}) {item.user}</span>
                                {item.type === 'text' &&
                                    <span className={styles.msg} dangerouslySetInnerHTML={{__html:item.msg}}></span>
                                }
                                {item.type === 'image' &&
                                    <img src={item.msg} />
                                }
                            </p>
                        }
                        {item.user === '系统' &&
                            <p data-user={item.user} className={styles.msg_c} style={{ color: item.color }}>
                                <span className={styles.timeSpan}>{item.user} ({item.date})：</span>
                                <span className={styles.msg}>{item.msg}</span>
                            </p>
                        }
                        {item.user !== '系统' && item.user !== localStorage.fetch('curUser') &&
                            <p data-user={item.user} className={styles.msg_l} style={{ color: item.color }}>
                                <span className={styles.timeSpan}>{item.user} ({item.date})：</span>
                                {item.type === 'text' &&
                                    <span className={styles.msg} dangerouslySetInnerHTML={{__html:item.msg}}></span>
                                }
                                {item.type === 'image' &&
                                    <img src={item.msg} />
                                }
                            </p>
                        }
                        <br />
                    </div>
                );
            })
        }
        // 初始化兔斯基表情包
        let arr = [];
        for(var i=0; i<69; i++) {
            arr[i]=i+1;
        }
        const content = (
            <div className={styles.tusijiWrap} onClick={this.sendTsj}>
                {
                    arr.map(item => 
                        <img key={item} title={item} src={require(`../assets/tusiji/${item}.gif`)} />
                    )
                }
            </div>
        );
        return (
            <div>
                <Alert message={`当前在线人数：${userCount}`} type="info" style={{ textAlign: 'center' }} />
                <div className={styles.showMsg} ref="showMsg">
                    {ele}
                </div>
                <div style={{ marginTop: 20 }} className={styles.control}>
                    <Input
                        type="color"
                        title="字体颜色"
                        style={{ width: 36, height: 32, cursor: 'pointer' }}
                        placeholder="#000"
                        ref="fontColor"
                    />
                    <Input type="file" title="图片" className={styles.pic} onChange={this.sendImg} />
                    <Popover content={content} title="选择表情">
                        <Button shape="circle" icon="smile" className={styles.btn} title="表情"></Button>
                    </Popover>
                    <Popconfirm 
                        title="确定清屏吗？" 
                        onConfirm={this.clearScreen} 
                        okText="确定" 
                        cancelText="取消"
                    >
                        <Button shape="circle" icon="delete" className={styles.btn} title="清屏"></Button>
                    </Popconfirm>
                </div>
                <Modal
                    title="选择图片"
                    visible={this.state.visible}
                    onOk={this.okHandle}
                    onCancel={this.hideModal}
                    okText="确认发送"
                    cancelText="取消发送"
                    style={{textAlign: 'center'}}
                >
                    <img src={this.state.imgSrc} style={{maxWidth: '99%'}} ref="img" />
                </Modal>
                <TextArea
                    placeholder="enter to send"
                    className={styles.msgInput}
                    autosize={{minRows: 2, maxRows: 6}}
                    onPressEnter={this.send}
                    ref="msgInput"
                />
            </div>
        );
    }
}
function mapStateToProps({ dispatch, user, chat }) {
    return { dispatch, user, chat };
}
export default connect(mapStateToProps)(Chat);