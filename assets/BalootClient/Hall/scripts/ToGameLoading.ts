const { ccclass, property } = cc._decorator;

@ccclass
export default class ToGameLoading extends cc.Component {

    @property(cc.Sprite)
    spriteCpt: cc.Sprite = null;

    @property(cc.Node)
    loadingNode: cc.Node = null;

    onLoad() {
        let gameid
        if(cc.vv.gameData){
            gameid = cc.vv.gameData.getGameId()
        }
        if(gameid){
            let gameCfg = cc.vv.UserConfig.getGameMapInfo(gameid)
            if(gameCfg.bBetSelect){
                this.loadingNode.active = true;
                this.spriteCpt.spriteFrame = "";
                // cc.loader.loadRes(`BalootClient/BaseRes/images/poker_desk/${cc.vv.UserManager.tableskin}`, cc.SpriteFrame, (err, spriteFrame) => {
                //     if (!err) {
                //         if(this.spriteCpt){
                //             this.spriteCpt.spriteFrame = "";//spriteFrame;
                //         }
                //         if(this.loadingNode){
                //             this.loadingNode.active = true;
                //             let skeCpt = cc.find('label', this.loadingNode).getComponent(sp.Skeleton);
                //             if (skeCpt) {
                //                 let animStr = cc.vv.i18nManager.getLanguage() == cc.vv.i18nLangEnum.AR ? "animation2" : "animation1";
                //                 skeCpt.setAnimation(0, animStr, true);
                //             }
                //         }
                       
                //     }
                // })
            }
            else{
                this.loadingNode.active = true;
            }
        }
        
        // 启用定时器
        this.scheduleOnce(() => {
            // 提示进入游戏失败
            cc.vv.FloatTip.show(___("进入房间失败"));
            // 关闭自己
            cc.vv.PopupManager.removePopup(this.node);
        }, 12);
    }

    // update (dt) {}
}
