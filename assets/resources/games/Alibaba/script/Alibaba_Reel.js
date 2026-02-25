/**
 * @author Cui Guoyang
 * @date 2021/9/24
 * @description
 */

cc.Class({
    extends: require("LMSlots_Reel_Base"),

    properties: {

    },

    //旋转
    StartMove:function(){
        this._super();
    },

    //列停止
    OnReelSpinEnd:function(){
        this._super();
    },

    playReelStop() {
        this._super();

        let haveBonus = false;
        if (this._originResult) {
            for(let i = 0; i < this._originResult.length; i++){
                let item = this._symbols[i]
                if (item.GetShowId() === this._cfg.bonusId) {
                    haveBonus = true;
                    // item.playBonusStopAnimation();
                }

                if (item.GetShowId() === this._cfg.scatterId) {
                    cc.vv.gameData.scatterNum++;
                    Global.SlotsSoundMgr.playEffect(cc.vv.gameData.scatterNum <= 5 ? "scatter_" + cc.vv.gameData.scatterNum : "scatter_5");
                }
            }
        }

        if (haveBonus) {
            Global.SlotsSoundMgr.playEffect("nggold");
        }
    },

    //显示免费游戏加速效果
    //加速框的显示
    ShowAntiEffect:function(bShow,name){
        if (bShow == false) {
            if (this._cfg.reelStateInfo) {
                for (let info of this._cfg.reelStateInfo) {
                    let node = cc.find( cc.js.formatStr("reel%s_%s", this._reelIdx+1,info.antiNode),this.node.parent);
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
            let node = cc.find( cc.js.formatStr("reel%s_%s", this._reelIdx+1, name),this.node.parent);
            if(node){
                node.active = bShow
            }
            else{
                cc.log("未找到加速节点：mask/node_anti");
            }
        }
    },
});