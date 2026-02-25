/**
 * Rummy logic
 */

cc.Class({
    extends: require("Table_Logic_Base"),

    properties: {
        
    },

    // LIFE-CYCLE CALLBACKS:

    

    start () {
        
        this._super()
        // this.skinMgr = this.loadSkinMgr()
        
        this.chat = this.loadChat()
        
    },

    async loadChat() {
        // if (Global.isSingle()) return;
        if (Global.isIOSAndroidReview()) return;
        let chatNode = cc.find("chat", this.panel);
        if (!chatNode) {
            let prefab = await cc.vv.ResManager.loadPrefab("games/PokerBase/prefabs/chat");
            if (!!prefab) {
                chatNode = cc.instantiate(prefab)
                chatNode.name = "chat"
                chatNode.parent = this.panel
                chatNode.zIndex = 100;
            }
        }
        if (!!chatNode) {
            this.chat = chatNode.getComponent("PBChat");
            this.chat && this.chat.init({
                sendMsg: (type, content) => {
                    this.sendRetransmissionMsg(type, content);
                }
            });
            this.chat.showWorldChat(false)
            if(this.skinMgr){
                this.skinMgr.updateEmotionSkin();
            }
            
        }
    },
    // /**
    //  * 皮肤管理组件
    //  */
    //  loadSkinMgr() {
    //     let cmp = this.panel.getComponent("PBSkinMgr");
    //     return cmp;
    // },

    updateCoin() {
        let myInfo = cc.vv.gameData.getMyInfo();
        myInfo.coin = cc.vv.UserManager.coin;
        Global.dispatchEvent("PBEvent.USER_COIN_CHANGE", { uid: cc.vv.UserManager.uid, coin: cc.vv.UserManager.coin});
    },

    

    

     

    

    // update (dt) {},
});
