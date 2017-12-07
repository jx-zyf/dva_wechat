var MongoClient=require('mongodb').MongoClient;
var DB_STR="mongodb://localhost:27017/login";

function logout(req,res){
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
            collection.find({userName:userName},{_id:0}).toArray(function(err,result){
                // console.log(result);
                if(result!=''){
                    collection.update({userName:userName}, { $set: { isLogin: false } } );
                    res.send('1');
                    db.close();
                    res.end();
                }
            });
        });
    });
}

module.exports=logout;