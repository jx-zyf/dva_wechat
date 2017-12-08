var MongoClient=require('mongodb').MongoClient;
var DB_STR="mongodb://localhost:27017/login";

function setPersonalInfo(req,res){
    var qStr='';
    req.addListener('data',function(datapart){
        qStr+=datapart;
    });
    req.addListener('end',function(){
        var obj=JSON.parse(qStr);
        MongoClient.connect(DB_STR,function(err,db){
            var collection=db.collection('user');
            if(err){
                console.log(err);
                return;
            }
            // 检测用户是否存在
            collection.find({userName: obj.userName},{_id:0}).toArray(function(err,result){
                if (result!='') {
                    collection.update({ userName: obj.userName }, {
                        $set: {
                            sex: obj.sex, 
                            birth: obj.birth, 
                            city: obj.city, 
                            signature: obj.signature
                        }
                    });
                    res.send({
                        success: true
                    });
                    db.close();
                    res.end();
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

module.exports=setPersonalInfo;