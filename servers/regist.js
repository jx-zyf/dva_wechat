var MongoClient = require('mongodb').MongoClient;
var DB_STR = "mongodb://localhost:27017/login";

function regist(req, res) {
    var qStr = '';
    req.addListener('data', function (datapart) {
        qStr += datapart;
    });
    req.addListener('end', function () {
        var obj = JSON.parse(qStr);
        // console.log(obj);
        // console.log(obj.userName);
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
                    collection.insert(obj);
                    res.send('1');
                    db.close();
                    res.end();
                } else {
                    // 用户已存在
                    res.send('0');
                    db.close();
                    res.end();
                }
            });
        });
    });
}

module.exports = regist;