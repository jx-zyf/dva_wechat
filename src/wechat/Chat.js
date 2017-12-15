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
            curUsers: [],
            clickUser: '',
            visible: false,
            imgSrc: '',
            infoVisible: false,
            visible2: false,
            fileName: '',
            file: '',
        }
    }
    componentDidMount() {
        const _this = this;
        if (localStorage.fetch('curUser') !== null) {
            const { user: { curUser }, dispatch, chat: { curChat, chatList } } = this.props;
            this.socket.emit('login', curUser);
            this.socket.on('login_success', (nickname) => {
                this.socket.on('system', function (nickname, userCount, type, users) {
                    let msg = nickname + (type === 'login' ? ' 加入了' : '离开了') + '房间！';
                    if (userCount !== _this.state.userCount) {
                        // 组件加载完毕再setState
                        if (_this.mountd) {
                            _this.setState({
                                userCount: userCount,
                                curUsers: users,
                            });
                            _this.sendMsg('系统', msg, '#999');
                        }
                    }
                });
            });
            // 接收消息
            this.socket.on('newMsg', function (userName, msg, color, type, toUser, fromUser) {
                if (toUser === 'all') {
                    dispatch({
                        type: 'chat/setCurChat',
                        payload: 'group'
                    });
                    _this.sendMsg(userName, msg, color, type, 'all');
                } else {
                    if (curUser === fromUser) {
                        if (!chatList.includes(toUser)) {
                            dispatch({
                                type: 'chat/addChat',
                                payload: toUser
                            });
                        }
                        dispatch({
                            type: 'chat/setCurChat',
                            payload: toUser
                        });
                    } else {
                        if (!chatList.includes(fromUser)) {
                            dispatch({
                                type: 'chat/addChat',
                                payload: fromUser
                            });
                        }
                        dispatch({
                            type: 'chat/setCurChat',
                            payload: fromUser
                        });
                    }
                    _this.sendMsg(userName, msg, color, type, toUser, fromUser);
                }
            });
            Notification.requestPermission(function(permission) {});    //询问浏览器是否允许通知
            this.socket.on('notification', function(user, msg){
                if (user !== curUser) {
                    let _notification;
                    if (/class="emoji"/.test(msg)) {
                        _notification= new Notification(`新消息`,{
                            body:`${user}：表情`,
                            icon:'http://localhost:8080/wechat.png'
                        });
                    } else {
                        _notification= new Notification(`新消息`,{
                            body:`${user}：${msg}`,
                            icon:'http://localhost:8080/wechat.png'
                        });
                    }
                    _notification.onclick = function(event) {
                        window.focus();
                    }
                    setTimeout(function(){
                        _notification.close(); //设置5秒后自动关闭通知框
                    },5000);
                }
            });
            // 从数据库获取历史消息
            dispatch({
                type: 'chat/getMsg'
            });
            dispatch({
                type: 'chat/getPrivateMsg'
            });
        }
    }
    componentWillUnmount() {
        this.mountd = false;
        const { dispatch, user: { curUser }, chat: { msgList } } = this.props;
        if (msgList.length > 0) {
            dispatch({
                type: 'chat/clearSystem'
            });
        }
        this.socket.emit('leave_room', curUser);
    }
    componentDidUpdate() {
        const { dispatch, chat: { newMsgList, newPrivateChat } } = this.props;
        // 将消息存到数据库
        if (newMsgList.user !== '系统' && newMsgList.msg) {
            dispatch({
                type: 'chat/saveMsg',
                payload: newMsgList
            });
        }
        if (newPrivateChat.user !== '系统' && newPrivateChat.msg) {
            dispatch({
                type: 'chat/savePrivateMsg',
                payload: newPrivateChat
            });
        }
        var showMsg = ReactDOM.findDOMNode(this.refs.showMsg);
        if (showMsg) {
            if (showMsg.getElementsByTagName('div')[1]) {
                showMsg.getElementsByTagName('div')[1].style.marginTop = '40px';
            }
            showMsg.scrollTop = showMsg.scrollHeight - showMsg.clientHeight;
        }
    }
    sendMsg = (user, msg, color, type, toUser, fromUser) => {
        const { dispatch } = this.props;
        var date = new Date().toLocaleDateString() + ' ' + new Date().toTimeString().substr(0, 8);
        var color = color || '#000';
        dispatch({
            type: 'chat/save',
            msg: {
                user: user,
                msg: msg,
                color: color,
                date: date,
                type: type,
                toUser: toUser,
                fromUser: fromUser,
            }
        });
        var showMsg = ReactDOM.findDOMNode(this.refs.showMsg);
        if (showMsg) {
            if (showMsg.getElementsByTagName('div')[1]) {
                showMsg.getElementsByTagName('div')[1].style.marginTop = '40px';
            }
            showMsg.scrollTop = showMsg.scrollHeight - showMsg.clientHeight;
        }
    }
    // 发消息
    send = (e) => {
        e.preventDefault();
        let msg = e.target.value.replace(/&nbsp;/g, '');
        let color = ReactDOM.findDOMNode(this.refs.fontColor).value;
        const { chat: { curChat }, user: { curUser } } = this.props;
        // 将表情转化成对应的img
        msg = this.showTusiji(msg);
        if (msg.trim().length > 0) {
            if (curChat === 'group') {
                this.socket.emit('sendMsg', msg, color, 'text');
            } else {
                this.socket.emit('sendMsg', msg, color, 'text', curChat);
            }
            this.socket.emit('notification', curUser, msg);
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
            if (file.type.includes('image')) {
                reader.onload = function (e) {
                    _this.showModal();
                    _this.setState({
                        imgSrc: e.target.result
                    });
                };
                reader.readAsDataURL(file);
            } else {
                message.error('文件类型有误！');
            }
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
        const { chat: { curChat }, user: { curUser } } = this.props;
        let msg = ReactDOM.findDOMNode(this.refs.img).src;
        let color = ReactDOM.findDOMNode(this.refs.fontColor).value;
        if (msg.src !== '') {
            if (curChat === 'group') {
                this.socket.emit('sendMsg', msg, color, 'image');
            } else {
                this.socket.emit('sendMsg', msg, color, 'image', curChat);
            }
            this.socket.emit('notification', curUser, '图片');
        } else {
            message.warning('请选择图片！');
        }
        this.setState({
            visible: false,
        });
    }
    // 选择文件
    sendFile = (e) => {
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
            if (!file.type.includes('image')) {
                reader.readAsDataURL(file);
                reader.onload = function (e) {
                    _this.showModal2();
                    _this.setState({
                        fileName: file.name,
                        file: e.target.result
                    });
                }
            } else {
                message.error('发送图片请选择图片按钮！');
            }
        };
    }
    showModal2 = () => {
        this.setState({
            visible2: true,
        });
    }
    hideModal2 = () => {
        this.setState({
            visible2: false,
        });
    }
    // 发送文件
    okHandle2 = () => {
        const { chat: { curChat }, user: { curUser } } = this.props;
        const { file, fileName } = this.state;
        if (file !== '') {
            if (curChat === 'group') {
                this.socket.emit('sendMsg', {file, fileName}, null, 'file');
            } else {
                this.socket.emit('sendMsg', {file, fileName}, null, 'file', curChat);
            }
            this.socket.emit('notification', curUser, '文件');
        } else {
            message.warning('请选择文件！');
        }
        this.setState({
            visible2: false,
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
    showTusiji(msg) {
        var match, result = msg,
            reg = /\[tusiji:\d+\]/g,
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
    // 查看用户资料
    showUserInfo = (e) => {
        const { dispatch, user: { curUserInfo, clickUserInfo } } = this.props;
        dispatch({
            type: 'user/getPersonal',
            payload: e.target.getAttribute('data-id')
        });
        this.setState({clickUser: e.target.getAttribute('data-id')});
        this.infoShowModal();
    }
    infoShowModal = () => {
        this.setState({
            infoVisible: true,
        });
    }
    infoHideModal = () => {
        this.setState({
            infoVisible: false,
        });
    }
    infoOkHandle = () => {
        const { clickUser } = this.state;
        const { dispatch, chat: { chatList } } = this.props;
        const curUser = localStorage.fetch('curUser');
        if (clickUser !== curUser && !chatList.includes(clickUser)) {
            dispatch({
                type: 'chat/addChat',
                payload: clickUser
            });
            dispatch({
                type: 'chat/setCurChat',
                payload: clickUser
            });
            this.infoHideModal();
        } else if (chatList.includes(clickUser)) {
            message.warning('该用户已在聊天列表！');
        } else {
            message.warning('不能发送消息给自己！');
        }
    }
    // 聊天列表
    chatWith = (e) => {
        const { dispatch } = this.props;
        dispatch({
            type: 'chat/setCurChat',
            payload: e.target.getAttribute('data-list')
        });
    }
    closeChat = (e) => {
        e.stopPropagation();
        const removeList = e.target.getAttribute('data-list');
        const { dispatch } = this.props;
        dispatch({
            type: 'chat/setCurChat',
            payload: 'group'
        });
        if (removeList !== 'group') {
            dispatch({
                type: 'chat/removeChat',
                payload: removeList
            });
            message.success('已删除该聊天！');
        } else {
            message.error('群组聊天不能删除！');
        }
    }
    render() {
        const { userCount, curUsers } = this.state;
        const { chat: { msgList, chatList, curChat, privateChat }, dispatch, user: { clickUserInfo, curUser } } = this.props;
        // 展示消息
        if (curChat === 'group' && msgList.length > 0) {
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
                                <span className={styles.userSpan} data-id={item.user} onClick={this.showUserInfo}>&nbsp;{item.user} </span>
                                <span className={styles.timeSpan}>：({item.date})</span>
                                {item.type === 'text' &&
                                    <span className={styles.msg} dangerouslySetInnerHTML={{ __html: item.msg }}></span>
                                }
                                {item.type === 'image' &&
                                    <img src={item.msg} />
                                }
                                {item.type === 'file' &&
                                    <span className={styles.msg}>
                                        文件：
                                        <a href={item.msg.file} download={item.msg.fileName} title="点击下载">{item.msg.fileName}</a>
                                    </span>
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
                                <span className={styles.userSpan} data-id={item.user} onClick={this.showUserInfo}> {item.user}&nbsp;</span>
                                <span className={styles.timeSpan}>({item.date})：</span>
                                {item.type === 'text' &&
                                    <span className={styles.msg} dangerouslySetInnerHTML={{ __html: item.msg }}></span>
                                }
                                {item.type === 'image' &&
                                    <img src={item.msg} />
                                }
                                {item.type === 'file' &&
                                    <span className={styles.msg}>
                                        文件：
                                        <a href={item.msg.file} download={item.msg.fileName} title="点击下载">{item.msg.fileName}</a>
                                    </span>
                                }
                            </p>
                        }
                        <br />
                    </div>
                );
            })
        } else if (curChat !== 'group' && privateChat.length > 0) {
            for (var i = privateChat.length - 1; i >= 0; i--) {
                if (i - 1 >= 0 && privateChat[i].date === privateChat[i - 1].date) {
                    privateChat.splice(i, 1);
                }
            }
            var filterPrivateChat = privateChat.filter((item) => 
                (item.fromUser === curUser || item.fromUser === curChat ) 
                && (item.toUser === curUser || item.toUser === curChat )
            );
            var ele = filterPrivateChat.map((item, index) => {
                return (
                    <div key={index} className={styles.msgList}>
                        {item.user === localStorage.fetch('curUser') &&
                            <p data-user={item.user} className={styles.msg_r} style={{ color: item.color }}>
                                <span className={styles.userSpan} data-id={item.user} onClick={this.showUserInfo}>&nbsp;{item.user} </span>
                                <span className={styles.timeSpan}>：({item.date})</span>
                                {item.type === 'text' &&
                                    <span className={styles.msg} dangerouslySetInnerHTML={{ __html: item.msg }}></span>
                                }
                                {item.type === 'image' &&
                                    <img src={item.msg} />
                                }
                                {item.type === 'file' &&
                                    <span className={styles.msg}>
                                        文件：
                                        <a href={item.msg.file} download={item.msg.fileName} title="点击下载">{item.msg.fileName}</a>
                                    </span>
                                }
                            </p>
                        }
                        {item.user !== '系统' && item.user !== localStorage.fetch('curUser') &&
                            <p data-user={item.user} className={styles.msg_l} style={{ color: item.color }}>
                                <span className={styles.userSpan} data-id={item.user} onClick={this.showUserInfo}> {item.user}&nbsp;</span>
                                <span className={styles.timeSpan}>({item.date})：</span>
                                {item.type === 'text' &&
                                    <span className={styles.msg} dangerouslySetInnerHTML={{ __html: item.msg }}></span>
                                }
                                {item.type === 'image' &&
                                    <img src={item.msg} />
                                }
                                {item.type === 'file' &&
                                    <span className={styles.msg}>
                                        文件：
                                        <a href={item.msg.file} download={item.msg.fileName} title="点击下载">{item.msg.fileName}</a>
                                    </span>
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
        for (var i = 0; i < 69; i++) {
            arr[i] = i + 1;
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
            <div className={styles.normal}>
                <Alert message={`当前在线人数：${userCount}`} type="info" style={{ textAlign: 'center' }} />
                <div className={styles.msgWrap}>
                    <div className={styles.showMsg} ref="showMsg">
                        <Alert message={`当前聊天：${curChat}`} type="info" className={styles.msgHeader} />
                        {ele}
                    </div>
                </div>
                <div className={styles.usersShow}>
                    <Alert message="在线用户列表" type="success" style={{ textIndent: '2em' }} />
                    {curUsers && curUsers.length > 0 &&
                        curUsers.map(item =>
                            <li key={item} onClick={this.showUserInfo} data-id={item}><a data-id={item}>{item}</a></li>
                        )
                    }
                    <Alert message="聊天列表" type="success" style={{ textIndent: '2em', marginTop: 15 }} />
                    <div>
                        {chatList && chatList.length > 0 &&
                            chatList.map(item => 
                                <li 
                                    key={item} 
                                    onClick={this.chatWith} 
                                    data-list={item}
                                    style={item===curChat ? { backgroundColor: '#ccc' } : { backgroundColor: '#eee' }}
                                >
                                    <a data-list={item}>{item}</a>
                                    <Icon type="close" className={styles.closeChat} data-list={item} onClick={this.closeChat} />
                                </li>
                            )
                        }
                    </div>
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
                    <Input type="file" title="文件 " className={styles.file} onChange={this.sendFile} />
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
                    style={{ textAlign: 'center' }}
                >
                    <img src={this.state.imgSrc} style={{ maxWidth: '99%' }} ref="img" />
                </Modal>
                <Modal
                    title="选择文件"
                    visible={this.state.visible2}
                    onOk={this.okHandle2}
                    onCancel={this.hideModal2}
                    okText="确认发送"
                    cancelText="取消发送"
                    style={{ textAlign: 'center' }}
                >
                    <p>{this.state.fileName}</p>
                </Modal>
                <Modal
                    title="查看资料"
                    visible={this.state.infoVisible}
                    onOk={this.infoOkHandle}
                    onCancel={this.infoHideModal}
                    okText="发消息"
                    className={styles.userinfo}
                    width={300}
                >
                    <p><label>用户名：</label> {clickUserInfo.userName}</p>
                    <p><label>性别：</label> {clickUserInfo.sex === 'male' ? '男' : (clickUserInfo.sex === 'female' ? '女' : '保密')}</p>
                    <p><label>出生日期：</label> {clickUserInfo.birth}</p>
                    <p><label>城市：</label> {clickUserInfo.city}</p>
                    <p><label>个性签名：</label> {clickUserInfo.signature}</p>
                </Modal>
                <TextArea
                    placeholder="enter to send"
                    className={styles.msgInput}
                    autosize={{ minRows: 2, maxRows: 6 }}
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