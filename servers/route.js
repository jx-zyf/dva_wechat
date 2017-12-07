const login = require('./login.js');
const regist = require('./regist.js');
const logout = require('./logout.js');
const edit = require('./edit.js');

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
        default: break;
    }
}

module.exports = route;