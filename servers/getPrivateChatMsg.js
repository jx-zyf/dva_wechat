var MongoClient = require('mongodb').MongoClient;
var DB_STR = "mongodb://localhost:27017/login";

function getChatMsg(req, res) {
    const { curUser } = req.query
    MongoClient.connect(DB_STR, function (err, db) {
        var collection = db.collection('privateChat');
        if (err) {
            console.log(err);
            return;
        }
        collection.find({ $or: [{ user: curUser }, { toUser: curUser }] }, { _id: 0 }).toArray(function (err, result) {
            if (err) {
                console.log(err);
                return;
            }
            res.send({
                success: true,
                result: result
            });
            db.close();
            res.end();
        });
    });
}

module.exports = getChatMsg;