import React from 'react';
import { Router, Route, Switch, Redirect } from 'dva/router';
import { LocaleProvider } from 'antd';
import WeChat from './components/WeChat';
import About from './components/About';
import Login from './routes/Login';
import Regist from './routes/Regist';
import EditUser from './routes/EditUser';

function RouterConfig({ history }) {
  return (
    <Router history={history}>
      <Switch>
        <Route path="/user/regist" component={Regist} />
        <Route path="/user/login" component={Login} />
        <Route path="/user/edit" component={EditUser} />
        <Route path="/about" component={About} />
        <Route path="/" component={WeChat} />
        <Redirect to="/" />
      </Switch>
    </Router>
  );
}

export default RouterConfig;
