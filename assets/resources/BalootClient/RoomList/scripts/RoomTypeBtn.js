cc.Class({
    extends: cc.Component,

    properties: {
        gameid: 0,
        leagueexp: 0,
        big: false,
        viewPrefab: cc.Prefab,
        textureGameInfo: cc.SpriteAtlas,
    },

    onLoad() {
        let netListener = this.node.addComponent("NetListenerCmp");
        netListener.registerMsg(MsgId.LEAGUE_EXP_CHANGE, this.LEAGUE_EXP_CHANGE, this);

        Global.registerEvent("GO_ROOMGAME_ID",this.onEventGoGame,this)

        let button = this.node.getComponent(cc.Button);
        if (button) {
            button.node.on('click', () => {
                this._enterFunc(this.gameid)

                // let gameCfg = cc.vv.UserConfig.getGameMapInfo(this.gameid)
                // if(gameCfg && gameCfg.bBetSelect){
                //     cc.vv.PopupManager.addPopup(this.viewPrefab, {
                //         opacityIn: true,
                //         onShowEnd: (node) => {
                //             let cpt = node.getComponent("RoomListView")
                //             if (cpt) {
                //                 cpt.onInit(this.gameid);
                //             }
                //         }
                //     });
                // }
                // else{
                //     // 不需要选择押注界面
                //     cc.vv.GameManager.EnterGame(this.gameid)
                // }
                
            })
        }
        this.gameAnimNode = cc.find("spine", this.node)
        this.gameIconNode = cc.find("icon", this.node)
        this.gameTilteNode = cc.find("label", this.node)
        this.updateView();
    },

    onEventGoGame:function(data){
        let id = data.detail
        if(id == this.gameid){
            this._enterFunc(id)
        }
        
    },

    _enterFunc:function(gameId){
        if(gameId == 9999){
            cc.vv.FloatTip.show(___("Stay tuned!"))
            return
        }
        //下载好了再弹分档押注
        
        let bInnerGame = cc.vv.UserManager.isNoNeedDownGame(gameId) //是否是内置游戏
        if (cc.sys.isNative && Global.openUpdate && !bInnerGame) { // 手机平台需要检测更新
            //是否已经是更新到最新了
            let bNew = cc.vv.SubGameUpdateNode.getComponent('subGameMgr')._isAreadyNew(gameId)
            if(bNew){
                this._loadBetSelect()
            }
            else{
                cc.vv.SubGameUpdateNode.emit("check_subgame", gameId);
            }
            
        } else {
            // Global.dispatchEvent("enter_game", gameId);
            this._loadBetSelect()
        }
    },


    _loadBetSelect:function(){
        if(Global.isIOSAndroidReview()){
            // 不需要选择押注界面
            // cc.vv.GameManager.EnterGame(this.gameid)
            let tempcfg = {"292":21,"265":11,"291":31,"269":41,"287":51,"255":61}
            cc.vv.NetManager.send({ c: MsgId.GAME_ENTER_MATCH, ssid: tempcfg[this.gameid], gameid: this.gameid }, true);
            return
        }
        let gameCfg = cc.vv.UserConfig.getGameMapInfo(this.gameid)
        if(gameCfg){
            cc.vv.PopupManager.addPopup(this.viewPrefab, {
                opacityIn: true,
                onShowEnd: (node) => {
                    let cpt = node.getComponent("RoomListView")
                    if (cpt) {
                        cpt.onInit(this.gameid);
                    }
                }
            });
        }
        else{
            // 不需要选择押注界面
            cc.vv.GameManager.EnterGame(this.gameid)
        }
                
    },


    updateView() {
        this.gameIconNode = cc.find("icon", this.node)
        this.leagueexp = this.getLeagueExp(this.gameid);
        this.updateLeagueView();

        let countryHeartBtn = cc.find("CountryHeartBtn", this.node)
        if (countryHeartBtn) {
            let cpt = countryHeartBtn.getComponent("CountryHeartBtn")
            cpt.gameid = this.gameid;
            cpt.countryId = this.getCountry(this.gameid);
        }
        if (this.gameAnimNode) this.gameAnimNode.active = false;
        if (this.gameIconNode) this.gameIconNode.active = false;

        let newGuideCpt = this.node.getComponentInChildren("NewGuideHintCpt")
        if (this.gameAnimNode && newGuideCpt && this.big && !Global.isDurakApp()) { // 使用大图动画
            this.gameAnimNode.active = true;
            this.gameAnimNode.getComponent(sp.Skeleton).setAnimation(0, this.gameid + "_", true);
        } else if (this.gameAnimNode && [256, 257, 262, 264].indexOf(this.gameid) >= 0 && !Global.isDurakApp()) { //使用小图动画
            this.gameAnimNode.active = true;
            this.gameAnimNode.getComponent(sp.Skeleton).setAnimation(0, this.gameid + "", true);
        } else if (this.gameIconNode) {  // 使用图片
            this.gameIconNode.active = true;
            if(this.textureGameInfo){
                let spriteFrame = this.textureGameInfo.getSpriteFrame(`btn_hall_game_${this.gameid}`);
                if (spriteFrame) {
                    this.gameIconNode.getComponent(cc.Sprite).spriteFrame = spriteFrame
                }
                
                let lanConfig = cc.vv.i18nManager.getConfig();
                this.gameTilteNode.getComponent(cc.Sprite).spriteFrame = this.textureGameInfo.getSpriteFrame(`text_hall_game_${this.gameid}_${lanConfig.lang}`);
            }else {
                cc.vv.ResManager.setSpriteFrame(this.gameIconNode.getComponent(cc.Sprite), `BalootClient/GameIcon/${this.gameid}`, null, null);

                //触发Debug
                if(!CC_BUILD){
                    let gameCfg = cc.vv.UserConfig.getGameMapInfo(this.gameid)
                    let lbl_debug = cc.find("lbl_debug",this.node)
                    if(lbl_debug){
                        lbl_debug.active = true
                        lbl_debug.getComponent(cc.Label).string = gameCfg.title
                    }
                   
                }
            }
        }         

        //下载组件
        let nodeDown = cc.find('node_downing',this.node);
        if(nodeDown){
            // if(this._itemData.status == 2){
            //     nodeDown.active = false
            // }
            // else{
                let bShowDownload = true
                if(this.gameid == 9999){
                    bShowDownload = false
                }
                nodeDown.active = bShowDownload
                nodeDown.getComponent('node_downing').initGameId(this.gameid);
            // }
        }

        // //是否参与排行榜
        // let node_lp = cc.find("node_lepord",this.node)
        // if(node_lp){
        //     node_lp.active = cc.vv.UserManager.isInLepGames(this.gameid)
        // }
    },

    getCountry(gameid) {
        for (const info of cc.vv.UserManager.gameList) {
            if (info.id == gameid) {
                return info.country > 0 ? info.topCountry : info.country;
            }
        }
    },

    getLeagueExp(gameid) {
        for (const info of cc.vv.UserManager.gameList) {
            if (info.id == gameid) {
                return info.leagueexp;
            }
        }
    },

    updateLeagueView() {
        // 联赛数据
        let leagueNode = cc.find("league", this.node);
        if (leagueNode) {
            let rankData = cc.vv.UserConfig.getRank(this.leagueexp);
            cc.vv.UserConfig.setRankFrame(cc.find("icon", leagueNode).getComponent(cc.Sprite), rankData.stage);
        }
    },

    LEAGUE_EXP_CHANGE(msg) {
        if (msg.code == 200) {
            if (msg.gameid == this.gameid) {
                this.leagueexp = msg.exp;
                this.updateLeagueView();
            }
        }
    },

    showExitState(bShow){
        let node = cc.find("exitState", this.node);
        node.stopAllActions();
        if(bShow){
            node.active = true;
            node.getComponent(sp.Skeleton).setAnimation(0, "aniamaton", true);

            // cc.tween(node)
            //     .delay(15)
            //     .call(()=>{
            //         node.active = false;
            //     })
            //     .start()
        } else {
            node.active = false;
        }
    },
});
