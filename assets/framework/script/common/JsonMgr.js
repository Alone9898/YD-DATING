/**
 * Json读取
 * 1 已经读取过的会缓存起来
 * 2 json存放在： resources/common/Json/
 */
cc.Class({
    extends: cc.Component,

    properties: {
        _data:[],
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start () {

    },

    Init:function(){
        this._jsonPath = "common/Json/"
    },

    /**
     * 
     * @param {string} fileName json文件名
     */
    async LoadJson(fileName){
        let self = this
        if(self._data[fileName]){ //已经加载了就直接使用
            return self._data[fileName]
        }
        else{
            let url = self._jsonPath + fileName
            await new Promise((resolve,reject) => {
                cc.loader.loadRes(url, function (err, object) {
                    if (err) {
                        cc.log(cc.js.formatStr('LoadJson %s error',fileName))
                    }
                    else{
                        self._data[fileName] = object.json
                    }
                    resolve()
                })
            })
            return self._data[fileName]
        }
        
        
    },

    GetJson(fileName){
        return this._data[fileName]
    }

    // update (dt) {},
});
