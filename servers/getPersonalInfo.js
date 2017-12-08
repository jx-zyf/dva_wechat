var MongoClient=require('mongodb').MongoClient;
var DB_STR="mongodb://localhost:27017/login";

function getPersonalInfo(req,res){
    var qStr='';
    req.addListener('data',function(datapart){
        qStr+=datapart;
    });
    req.addListener('end',function(){
        var userName=JSON.parse(qStr);
        MongoClient.connect(DB_STR,function(err,db){
            var collection=db.collection('user');
            if(err){
                console.log(err);
                return;
            }
            // 检测用户是否存在
            collection.find({userName: userName},{_id:0}).toArray(function(err,result){
                if (result!='') {
                    const { userName, sex, birth, city, signature } = result[0];
                    res.send({
                        success: true,
                        result: {
                            userName: userName,
                            sex: sex,
                            birth: birth,
                            city: city,
                            signature: signature
                        }
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

module.exports=getPersonalInfo;