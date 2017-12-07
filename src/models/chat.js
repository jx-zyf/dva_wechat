
export default {
  namespace: 'chat',

  state: {
        msgList: [],
  },

  effects: {
    
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
    }
  },
};