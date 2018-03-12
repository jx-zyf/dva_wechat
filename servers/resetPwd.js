var MongoClient = require('mongodb').MongoClient;
var DB_STR = "mongodb://localhost:27017/login";

function resetPwd(req, res) {
    var qStr = '';
    req.addListener('data', function (datapart) {
        qStr += datapart;
    });
    req.addListener('end', function () {
        var obj = JSON.parse(qStr);
        MongoClient.connect(DB_STR, function (err, db) {
            var collection = db.collection('user');
            if (err) {
                console.log(err);
                return;
            }
            // 检测用户是否存在
            collection.find({ userName: obj.userName }, { _id: 0 }).toArray(function (err, result) {
                if (result != '') {
                    if (result[0].password === obj.old_pwd) {
                        if (obj.old_pwd !== obj.new_pwd) {
                            collection.update({ userName: obj.userName }, { $set: { password: obj.new_pwd } });
                            res.send({
                                success: true
                            })
                        } else {
                            res.send({
                                success: false,
                                errMsg: '新密码不能和旧密码一样！'
                            })
                        }
                        db.close();
                        res.end();
                    } else {
                        res.send({
                            success: false,
                            errMsg: '原密码输入有误，请核对后输入'
                        });
                        db.close();
                        res.end();
                    }
                } else {
                    res.send({
                        success: false,
                        errMsg: '该用户不存在'
                    });
                    db.close();
                    res.end();
                }
            });
        });
    });
}

module.exports = resetPwd;