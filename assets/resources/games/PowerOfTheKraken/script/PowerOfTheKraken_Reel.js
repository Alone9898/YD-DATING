
cc.Class({
    extends:  require("LMSlots_Reel_Base"),

    properties: {

    },

    // LIFE-CYCLE CALLBACKS:

    playReelStop(){
        //判断 是否播放停止动画
        //TODO 停止动画，其实不应该和加速的配置有关系。再次最好写成一个接口
        if (this._originResult) {
            for(let i = 0; i < this._originResult.length; i++){
                let item = this._symbols[i]
                for (let info of this._reelState) {
                    if (info.isStop && info.id.includes(item.GetShowId())) {
                        item.playStopAnimation()
                    }
                }
            }
        }

        //判断播放音效
        if (this._cfg.reelStateInfo && this._cfg.reelStateInfo[0]) {
            let reelStopEffect = ''
            let symbolEffect = ''
            let hasSymbol = false
            for (let info of this._reelState) {
                if (info.isStop) {
                    if(info.type == "free"){
                        symbolEffect = info.symbolStopSound ? info.symbolStopSound[this._reelIdx] : ''
                    } else {
                        symbolEffect = info.symbolStopSound ? info.symbolStopSound : ''
                    }
                    hasSymbol = true
                }else{
                    reelStopEffect = info.reelStopSound ? info.reelStopSound : ''
                }
            }
            if (hasSymbol) {
                reelStopEffect = symbolEffect
            }

            //有配置的话用配置的音效路径，没有的话，用默认的
            let soundPath = this._cfg.reelStateInfo[0].path
            if(!soundPath){
                soundPath = cc.vv.gameData.getGameDir()
            }
            cc.vv.AudioManager.playEff(soundPath, reelStopEffect, true);
        }
    },

    //显示免费游戏加速效果
    //加速框的显示
    ShowAntiEffect:function(bShow,name){
        if (bShow == false) {
            if (this._cfg.reelStateInfo) {
                for (let info of this._cfg.reelStateInfo) {
                    let node = cc.find(info.antiNode+(this._reelIdx+1) ,this.node.parent)
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
            let node = cc.find(name+(this._reelIdx+1) ,this.node.parent)
            if(node){
                node.active = bShow
            }
            else{
                cc.log("未找到加速节点：mask/node_anti");
            }
        }
    },

});
