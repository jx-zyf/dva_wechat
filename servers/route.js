const login = require('./login.js');
const regist = require('./regist.js');
const logout = require('./logout.js');
const edit = require('./edit.js');
const getPersonalInfo = require('./getPersonalInfo.js');
const setPersonalInfo = require('./setPersonalInfo.js');

var route = function (req, res, operation) {
    switch (operation) {
        case 'login':
            login(req, res);
            break;
        case 'regist':
            regist(req, res);
            break;
        case 'logout':
            logout(req, res);
            break;
        case 'edit':
            edit(req, res);
            break;
        case 'getPersonalInfo':
            getPersonalInfo(req, res);
            break;
        case 'setPersonalInfo':
            setPersonalInfo(req, res);
            break;
        default: break;
    }
}

module.exports = route;