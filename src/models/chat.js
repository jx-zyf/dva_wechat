import { saveChatMsg, getChatMsg, savePrivateChatMsg, getPrivateChatMsg } from '../services/chat';

export default {
  namespace: 'chat',

  state: {
    msgList: [],
    newMsgList: {},
    chatList: ['group'],
    curChat: 'group',
    privateChat: [],
    newPrivateChat: {},
  },

  effects: {
    *saveMsg({ payload }, { call, put }){
        yield call(saveChatMsg, payload);
    },
    *getMsg({ payload }, { call, put }){
        const response = yield call(getChatMsg);
        yield put({
            type: 'getHistoryChatMsg',
            payload: response.data.result
        });
    },
    *savePrivateMsg({ payload }, { call, put }){
        yield call(savePrivateChatMsg, payload);
    },
    *getPrivateMsg({ payload }, { call, put }){
        const response = yield call(getPrivateChatMsg);
        yield put({
            type: 'getHistoryPrivateChatMsg',
            payload: response.data.result
        });
    },
  },

  reducers: {
    save(state, action) {
        if (state.curChat === 'group') {
            return {
                ...state,
                msgList: state.msgList.concat(action.msg),
                newMsgList: action.msg,
            }
        } else {
            return {
                ...state,
                privateChat: state.privateChat.concat(action.msg),
                newPrivateChat: action.msg,
            }
        }
    },
    clearSystem(state) {
        return {
            ...state,
            msgList: state.msgList.filter(item => item.user !== '系统')
        }
    },
    clearScreen(state) {
        return { ...state, msgList: []}
    },
    getHistoryChatMsg(state, { payload }) {
        return { ...state, msgList: payload}
    },
    addChat(state, { payload }) {
        state.chatList.push(payload);
        return { ...state }
    },
    removeChat(state, { payload }) {
        state.chatList.splice(state.chatList.indexOf(payload), 1);
        return { ...state }
    },
    setCurChat(state, { payload }) {
        return { ...state, curChat: payload }
    },
    getHistoryPrivateChatMsg(state, { payload }) {
        return { ...state, privateChat: payload}
    },
  },
};