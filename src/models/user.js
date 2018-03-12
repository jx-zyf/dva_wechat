import { fakeRegist, fakeLogin, fakeLogout, fakeEdit, getPersonalInfo, setPersonalInfo } from '../services/user'
import { message } from 'antd';
import localStorage from '../utils/localStorage';

export default {
  namespace: 'user',

  state: {
    status: undefined,
    login: undefined,
    curUser: localStorage.fetch('curUser'),
    loading: false,
    resetStatus: false,
    curUserInfo: {},
    clickUserInfo: {},
    setPersonalStatus: false,
  },

  effects: {
    *regist({ payload }, { call, put }) {
      yield put({
        type: 'changeLoading',
        payload: true
      });
      const response = (yield call(fakeRegist, payload)).data;
      if (response.success) {
        message.success(response.errMsg);
      } else {
        message.error(response.errMsg);
      }
      yield put({
        type: 'registHandle',
        payload: response.errMsg
      });
      yield put({
        type: 'changeLoading',
        payload: false
      });
    },
    *login({ payload }, { call, put }) {
      yield put({
        type: 'changeLoading',
        payload: true
      });
      const response = (yield call(fakeLogin, payload)).data;
      if (response.success) {
        message.success('登录成功！');
        yield put({
          type: 'curUser',
          payload: payload.userName
        });
        localStorage.save('curUser', payload.userName);
      } else {
        message.error(response.errMsg)
      }
      yield put({
        type: 'loginHandle',
        payload: response.errMsg
      });
      yield put({
        type: 'changeLoading',
        payload: false
      });
    },
    *logout({ payload }, { call, put }) {
      yield put({
        type: 'changeLoading',
        payload: true
      });
      const response = (yield call(fakeLogout, payload)).data;
      if (response.success) {
        message.success(response.errMsg)
        yield put({
          type: 'logoutHandle'
        });
      }
      yield put({
        type: 'changeLoading',
        payload: false
      });
    },
    *resetPassword({ payload }, { call, put }) {
      yield put({
        type: 'changeLodading',
        payload: true
      });
      const response = yield call(fakeEdit, payload);
      if (!response.data.success) {
        message.error(response.data.errMsg);
      } else {
        message.success('修改成功！请重新登录！');
        yield put({
          type: 'resetpwdHandle',
          payload: true
        });
      }
      yield put({
        type: 'changeLoading',
        payload: false
      });
    },
    *getPersonal({ payload }, { call, put }) {
      const response = yield call(getPersonalInfo, payload);
      if (response.data.success) {
        yield put({
          type: 'getPersonalHandle',
          payload: response.data.result
        });
      }
    },
    *setPersonal({ payload }, { call, put }) {
      yield put({
        type: 'changeLoading',
        payload: true
      });
      const response = yield call(setPersonalInfo, payload);
      if (response.data.success) {
        message.success('修改成功！');
        yield put({
          type: 'setPersonalHandle',
          payload: true
        });
      }
      yield put({
        type: 'changeLoading',
        payload: false
      });
    },
  },

  reducers: {
    loginHandle(state, action) {
      if (action.payload === '登录成功') {  // 登录成功
        return { ...state, login: 'true' }
      } else if (action.payload === '用户已登录') { // 用户已登录
        return { ...state, login: 'false' }
      } else if (action.payload === '密码错误') {  // 密码错误
        return { ...state, login: 'continue' }
      } else {
        return { ...state, login: undefined }
      }
    },
    registHandle(state, action) {
      if (action.payload === '该用户已存在') {  // 用户已存在
        return { ...state, status: 'fail' }
      } else if (action.payload === '注册成功') { // 注册成功
        return { ...state, status: 'success' }
      } else {
        return { ...state, status: undefined }
      }
    },
    toLogin(state, action) {
      return { ...state, login: action.payload.login }
    },
    toRegist(state, action) {
      return { ...state, status: action.payload.status }
    },
    curUser(state, action) {
      return { ...state, curUser: action.payload }
    },
    changeLoading(state, { payload }) {
      return { ...state, loading: payload }
    },
    logoutHandle(state) {
      return { ...state, login: undefined }
    },
    resetpwdHandle(state, { payload }) {
      return { ...state, resetStatus: payload }
    },
    getPersonalHandle(state, { payload }) {
      if (payload.userName === localStorage.fetch('curUser')) {
        return { ...state, curUserInfo: payload, clickUserInfo: payload }
      } else {
        return { ...state, clickUserInfo: payload }
      }
    },
    setPersonalHandle(state, { payload }) {
      return { ...state, setPersonalStatus: payload }
    },
  },
};
