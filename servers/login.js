var MongoClient=require('mongodb').MongoClient;
var DB_STR="mongodb://localhost:27017/login";

function login(req,res){
    var qStr='';
    req.addListener('data',function(datapart){
        qStr+=datapart;
    });
    req.addListener('end',function(){
        var obj=JSON.parse(qStr);
        // console.log(obj.userName);
        MongoClient.connect(DB_STR,function(err,db){
            var collection=db.collection('user');
            if(err){
                console.log(err);
                return;
            }
            // 检测用户是否存在
            collection.find({userName:obj.userName},{_id:0}).toArray(function(err,result){
                // console.log(result);
                if(result==''){
                    // 用户不存在
                    res.send('1');
                    db.close();
                    res.end();
                }else{
                    // 登录
                    if( result[0].isLogin ){
                        res.send('-2');
                        db.close();
                        res.end();
                    } else {
                        if(result[0].password!==obj.password){
                            res.send('-1');
                            db.close();
                            res.end();
                        }else{
                            res.send('0');
                            collection.update({userName:obj.userName}, { $set: { isLogin: true } } );
                            db.close();
                            res.end();
                        }
                    }
                }
            });
        });
    });
}

module.exports=login;