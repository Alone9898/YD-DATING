/**
 * 资源管理
 */
cc.Class({
    extends: cc.Component,
    statics: {
        _prefabURL:[],

        loadAllRes: function () {
            //加载字体资源
            this.loadAllBitMapFont();
        },

        //Bitmap字体资源
        loadAllBitMapFont: function () {
            cc.loader.loadResDir('font/', cc.BitmapFont, function (err, fonts) {
                var bitFonts = {};
                for (var i in fonts) {
                    bitFonts[fonts[i]._name] = fonts[i];
                }
                window.BitMapFont = bitFonts;
            }.bind(this));
        },

        //加载精灵帧
        loadResSpriteFrame: function (pathName, callback) {
            cc.loader.loadRes(pathName, cc.SpriteFrame, (err, spriteFrame) => {
                if (!err) {
                    callback(spriteFrame);
                }
            });
        },

        //预制加载
        //url:预制路径
        //callback(data) 成功后，会带预制数据出去
        loadResPrefab:function(url,callback){
            cc.loader.loadRes(url, cc.Prefab, (err, data) => {
                if (!err) {
                    this._addPrefab(url)
                    callback(data);
                }
                
            });
        },
        //添加一个到内存管理中
        _addPrefab:function(data){
            let bIn = false
            for(let i = 0; i < this._prefabURL.length; i++){
                if(data == this._prefabURL[i]){
                    bIn = true
                    break;
                }
            }
            if(!bIn){
                this._prefabURL.push(data)
            }
            
        },

        //释放所有预制
        releasePrefabs:function(){
            for(let i = 0; i < this._prefabURL.length; i++){
                cc.loader.releaseRes(this._prefabURL[i], cc.Prefab);
            }
            this._prefabURL = []
        },


    },
});
