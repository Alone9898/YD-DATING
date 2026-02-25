
cc.Class({
    extends: require("LMSlots_Reel_Base"),

    properties: {

    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    //显示免费游戏加速效果
    //加速框的显示
    ShowAntiEffect:function(bShow,name){
        if (bShow == false) {
            if (this._cfg.reelStateInfo) {
                for (let info of this._cfg.reelStateInfo) {
                    let node = cc.find( cc.js.formatStr("reel%s_%s", this._reelIdx+1,info.antiNode),this.node.parent)
                    if(node && node.active){
                        node.active = false
                        // 既然不是循环的播放，就不需要主动停止
                        // 点立即停止的时候需要停止加速音效
                        if(this._stopRightNow){
                            cc.vv.AudioManager.stopEffectByName(info.antSound);
                        }

                    }
                }
            }
        }else{
            let node = cc.find( cc.js.formatStr("reel%s_%s", this._reelIdx+1, name),this.node.parent)
            if(node){
                node.active = bShow
            }
            else{
                cc.log("未找到加速节点：mask/node_anti");
            }
        }
    },


    // update (dt) {},
});
