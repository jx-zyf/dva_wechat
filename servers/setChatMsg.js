var MongoClient = require('mongodb').MongoClient;
var DB_STR = "mongodb://localhost:27017/login";

function setChatMsg(req, res) {
    var qStr = '';
    req.addListener('data', function (datapart) {
        qStr += datapart;
    });
    req.addListener('end', function () {
        var obj = JSON.parse(qStr);
        MongoClient.connect(DB_STR, function (err, db) {
            var collection = db.collection('chat');
            if (err) {
                console.log(err);
                return;
            }
            collection.find({
                user: obj.user, 
                date: obj.date, 
                msg: obj.msg, 
                type: obj.type,
                date: obj.date,
                toUser: obj.toUser
            }, {_id: 0}).toArray(function(err,result){
                if(result == ''){
                    collection.insert(obj);
                    res.send({ success: true });
                } else {
                    res.send({ success: false });
                }
                db.close();
                res.end();
            });
        });
    });
}

module.exports = setChatMsg;