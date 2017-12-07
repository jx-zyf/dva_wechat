export default{
    save:function(key,item){
        window.localStorage.setItem(key,JSON.stringify(item));
    },
    fetch:function(key){
        return JSON.parse(window.localStorage.getItem(key))
    },
    remove:function(key){
        window.localStorage.removeItem(key)
    },
    clear:function(){
        window.localStorage.clear();
    }
}