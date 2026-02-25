
cc.Class({
    extends: cc.Component,

    properties: {

    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.netListener = this.node.addComponent("NetListenerCmp");

        Global.btnClickEvent(cc.find("ui/tog_menu/toggle1",this.node),this.onClickToggle1,this);
        Global.btnClickEvent(cc.find("ui/tog_menu/toggle2",this.node),this.onClickToggle2,this);

        Global.btnClickEvent(cc.find("ui/btn_return",this.node),this.onClickBack,this);

        Global.registerEvent("Close_Rank_View",this.onEventCloseRank,this)
    },

    onEnable (){
        this.netListener.registerMsg(MsgId.EVENT_GET_RANK_CONFIG, this.EVENT_GET_RANK_CONFIG, this);  // 获取排行榜配置
        this.netListener.registerMsg(MsgId.EVENT_GET_RANK_INFO, this.EVENT_GET_RANK_INFO, this);  // 获取排行榜信息

    },

    onDisable() {
        this.netListener.clear();
    },

    start () {

    },

    EVENT_GET_RANK_CONFIG(msg){
        if(msg.code == 200){
            this.pics  = msg.pics;
            this.coinfig = msg.config;
            let openType = this.checkRankOpen()
            if(openType == 2){
                this._openPageType = 4
            }
            if(this._openPageType > 3){
                this.showPanel(2);
            } else {
                this.showPanel(1, this._openPageType);
            }

        }
    },

    checkRankOpen:function(){
        let reffcfg = this.getConfigByType(4)
        let togg1 = cc.find("ui/tog_menu/toggle1",this.node)
        let togg2 = cc.find("ui/tog_menu/toggle2",this.node)
        let daycfg = this.getConfigByType(1)
        let weekcfg = this.getConfigByType(2)
        let monthcfg = this.getConfigByType(3)
        let gameOpen = daycfg.open || weekcfg.open || monthcfg.open

        cc.find("node_lock",togg2).active = (reffcfg.open?false:true)
        cc.find("node_lock",togg1).active = (gameOpen?false:true)
        if(gameOpen){
            return 1
        }
        else{
            return 2
        }
    },

    getConfigByType(type){
        if(this.coinfig){
            for (let i = 0; i < this.coinfig.length; i++){
                if(this.coinfig[i].rtype == type){
                    return this.coinfig[i]
                }
            }
        }
    },

    EVENT_GET_RANK_INFO(msg){
        if(msg.code == 200){
            if(msg.rtype){
                let ggSpr = cc.find("ui/gg", this.node).getComponent(cc.Sprite);

                let pic = '';
                if(this.pics){
                    if(msg.rtype == 1){
                        pic =  this.pics.leaderpic1;
                    } else if(msg.rtype == 2){
                        pic =  this.pics.leaderpic2;
                    } else if(msg.rtype == 3){
                        pic =  this.pics.leaderpic3;
                    } else if(msg.rtype == 4){
                        pic =  this.pics.leaderpic4;
                    }
                }

                if (pic && pic.indexOf('http') > -1) {
                    this._reqHandle && this._reqHandle.rejectFunc();
                    this._reqHandle = cc.vv.ResManager.loadImage(pic, (err, res) => {
                        if (cc.isValid(ggSpr) && cc.isValid(ggSpr.node)) {
                            if (res) {
                                ggSpr.spriteFrame = new cc.SpriteFrame(res);
                            }
                        }
                        // 请求结束后删除请求句柄
                        this._reqHandle = null;
                    })
                } else {
                    ggSpr.node.getComponent("ImgSwitchCmp").setIndex(msg.rtype-1);
                }
            }
        }
    },

    //从外部打开某一页 1-daily 2-weekly 3-monthly 4-referrals
    initPage(page){
        this._openPageType = page || 1;
        cc.vv.NetManager.sendAndCache({ c: MsgId.EVENT_GET_RANK_CONFIG });
    },

    onClickToggle1(){
        this.showPanel(1)

    },

    onClickToggle2(){
        this.showPanel(2)
    },

    showPanel(type,openPageType){
        cc.find("ui/panel_cash", this.node).active = type == 1;
        cc.find("ui/tog_menu/toggle1",this.node).getComponent(cc.Toggle).isChecked = type == 1;
        cc.find("ui/panel_referrals", this.node).active = type == 2;
        cc.find("ui/tog_menu/toggle2",this.node).getComponent(cc.Toggle).isChecked = type == 2;

        if(type == 1){
            cc.find("ui/panel_cash", this.node).getComponent("yd_rank_cashgame").updatePanel(this.coinfig, openPageType)
        } else if(type == 2){
            cc.find("ui/panel_referrals", this.node).getComponent("yd_rank_referrals").updatePanel(this.coinfig)
        }
    },

    onClickBack(){
        cc.vv.PopupManager.removePopup(this.node);
    },

    onEventCloseRank(){
        cc.vv.PopupManager.removePopup(this.node);
    }

    // update (dt) {},
});
