import { saveChatMsg, getChatMsg } from '../services/chat';

export default {
  namespace: 'chat',

  state: {
        msgList: []
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
  },

  reducers: {
    save(state, action) {
        return {
            ...state,
            msgList: state.msgList.concat(action.msg)
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
  },
};