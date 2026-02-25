cc.Class({
    extends: cc.Component,

    properties: {
        contentNode: cc.Node,
        content: "",
    },

    onLoad() {
        let netListener = this.node.addComponent("NetListenerCmp");
        netListener.registerMsg(MsgId.CHECK_DESK_INFO, this.CHECK_DESK_INFO, this);

        Global.registerEvent("checkSubFinish", this.downloadingFinish, this);
    },

    initData(gameid) {
        this.gameid = gameid;
    },

    // 点击小键盘
    onClickKeyboard(event, key) {
        if (key == 're_enter') {
            this._doJoin(this.content)
        } else if (key == 'delete') {
            this.content = this.content.substring(0, this.content.length - 1);
            this.upadteView();
        } else {
            if (this.content.length < 6) {
                this.content += key;
                this.upadteView();
                if (this.content.length >= 6) {
                    this._doJoin(this.content)
                    
                }
            }
        }
    },

    _doJoin(roomid){
        if(roomid){
            cc.vv.NetManager.send({
                c: MsgId.CHECK_DESK_INFO,
                deskid: roomid.trim(),
            });

            
            
        }
        
    },

    upadteView() {
        for (let i = 0; i < this.contentNode.children.length; i++) {
            let node = this.contentNode.children[i]
            const num = this.content[i];
            if (num != undefined || num != null) {
                cc.find("value", node).getComponent(cc.Label).string = num;
            } else {
                cc.find("value", node).getComponent(cc.Label).string = "-";
            }
        }
    },

    CHECK_DESK_INFO:function(msg){
        if(msg.code == 200){
            if(msg.spcode){
                cc.vv.FloatTip.show(cc.vv.UserConfig.spcode2String(msg.spcode), true);
                return
            }
            this.gameid = msg.gameid
            let roomid  = this.content
            let bInnerGame = cc.vv.UserManager.isNoNeedDownGame(this.gameid)
            let bNew = cc.vv.SubGameUpdateNode.getComponent('subGameMgr')._isAreadyNew(this.gameid)
            if(cc.sys.isBrowser || bNew || bInnerGame){
                cc.vv.NetManager.send({
                    c: MsgId.FRIEND_ROOM_JOIN,
                    gameid: this.gameid,
                    deskid: roomid.trim(),
                });
            }
            else{
                //提示更新
                let gameid = this.gameid
                if(gameid){
                    let tips = cc.js.formatStr('You need to download the latest resources of 【%s】 first',cc.vv.UserConfig.getGameName(gameid))
                    cc.vv.AlertView.show(tips,()=>{
                        this._waitgameId = gameid
                        cc.vv.SubGameUpdateNode.emit("check_subgame", gameid);
                        cc.vv.FloatTip.show("start download")
                    },()=>{
    
                    })
                }
                
                
            }
        }
    },

    downloadingFinish(data){
        if(cc.isValid(this.node)){
            let gameid = data.detail
            if(this._waitgameId && gameid == this._waitgameId){

                //下载完成表现
                cc.vv.FloatTip.show('Download Success!')

                this._waitgameId = null
            }
        }
    },

});
