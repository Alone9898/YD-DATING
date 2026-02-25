/**
 * 不依赖节点生命周期的定时器
 */
cc.Class({
    extends: cc.Component,

    

    statics: {
        _count1000:0,//毫秒
        _count100:0,//毫秒
        _nInter:50,//50毫秒执行一次

        //初始化
        init(){
            setInterval(this.update.bind(this),this._nInter);
        },

        update(){
            this._count1000 += this._nInter
            this._count100 += this._nInter

            if(this._count1000 >= 1000){
                //1s刷新
                this._count1000 = 0
                if(cc.vv.UserManager){
                    if(cc.vv.UserManager.update){
                        cc.vv.UserManager.update(1)
                    }

                    if(cc.vv.UserManager.updateTimer){
                        cc.vv.UserManager.updateTimer(1)
                    }
                    
                }
                if(cc.vv.gameData){
                    cc.vv.gameData.update(1)
                }
            }

            //50毫秒执行一次
            if(cc.vv.PlatformApiMgr){
                cc.vv.PlatformApiMgr.update()
            }
            if(cc.vv.NetManager){
                cc.vv.NetManager.updateTimer(this._nInter)
            }
            if(cc.vv.NetCacheMgr){
                cc.vv.NetCacheMgr.update(this._nInter)
            }
        }
    },

    
});
