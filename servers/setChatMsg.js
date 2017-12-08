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
            collection.remove({});
            obj.forEach((item) => {
                collection.insert(item);
            });
            res.send({
                success: true
            });
            db.close();
            res.end();
        });
    });
}

module.exports = setChatMsg;