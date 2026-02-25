
cc.Class({
    extends: require("LMSlots_Reel_Base"),

    properties: {

    },

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
                    symbolEffect = info.symbolStopSound ? info.symbolStopSound[info.stopIdx] : ''
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

    //播放加速动画
    playAntiAnimation(){
        let isPlayAniti = false
        if (this._cfg.reelStateInfo && this._cfg.reelStateInfo[0]) {
            for (let info of this._reelState) {
                if (info.isAnt && info.antiNode) {
                    this.ShowAntiEffect(true,info.antiNode)
                    let soundPath = info.path
                    if(!soundPath){
                        soundPath = cc.vv.gameData.getGameDir()
                    }
                    cc.vv.AudioManager.playEff(soundPath, info.antSound[info.antIdx], true);

                    //考虑到加速倍率
                    let cfgAntSpeed = info.antSpeed
                    if(cfgAntSpeed){
                        cfgAntSpeed = cfgAntSpeed * this.GetTimeScale()
                    }
                    this._speed = cfgAntSpeed ? cfgAntSpeed : this._speed
                    isPlayAniti = true
                }
            }
        }
        return isPlayAniti
    },

    // update (dt) {},
});
