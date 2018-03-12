var MongoClient = require('mongodb').MongoClient;
var DB_STR = "mongodb://localhost:27017/login";

function regist(req, res) {
    var qStr = '';
    req.addListener('data', function (datapart) {
        qStr += datapart;
    });
    req.addListener('end', function () {
        var obj = JSON.parse(qStr);
        obj.isLogin = false;
        MongoClient.connect(DB_STR, function (err, db) {
            var collection = db.collection('user');
            if (err) {
                console.log(err);
                return;
            }
            // 检测用户是否存在
            collection.find({ userName: obj.userName }, { _id: 0 }).toArray(function (err, result) {
                if (result == '') {
                    // 新用户
                    collection.insert({
                        ...obj,
                        sex: 'secret',
                        birth: '1996/01/01',
                        city: '北京市/北京市/朝阳区',
                        signature: '一句话描述你自己...'
                    });
                    res.send({
                        success: true,
                        errMsg: '注册成功'
                    });
                    db.close();
                    res.end();
                } else {
                    // 用户已存在
                    res.send({
                        success: false,
                        errMsg: '该用户已存在'
                    });
                    db.close();
                    res.end();
                }
            });
        });
    });
}

module.exports = regist;