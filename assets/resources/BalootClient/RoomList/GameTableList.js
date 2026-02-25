
cc.Class({
    extends: cc.Component,

    properties: {
        _gameid: 0,
        _gamename: '',
        _rooms: [],
    },

    onLoad () {
        this.netListener = this.node.addComponent("NetListenerCmp");
        this.netListener.registerMsg(MsgId.GAME_ROOM_LIST, this.GAME_ROOM_LIST, this, false);
        this._pool = new cc.NodePool()
        this._time = 0
    },

    onDestroy() {
        this._pool.clear()
    },

    requestRoomList() {
        if (this._gameid > 0) {
            cc.vv.NetManager.sendAndCache({ c: MsgId.GAME_ROOM_LIST, gameid: this._gameid }, true)
        }
        this._time = 0
    },

    onInit(gameid) {
        if (this._gameid == gameid) return
        this._gameid = gameid
        this._gamename = cc.vv.UserConfig.getGameName(gameid)
        this._rooms = []
        this.requestRoomList()

        
        
    },

    GAME_ROOM_LIST(msg) {
        if (msg.code != 200) return;
        if (msg.spcode && msg.spcode > 0) return;
        if (msg.gameid != this._gameid) return;
        if (msg.rooms) this._rooms = msg.rooms;
        this.updateView();
    },

    updateView() {
        let itemtmp = cc.find("view/table_item", this.node)
        let content = cc.find("view/content", this.node)
        let pool = this._pool
        
        let children = content.children
        for (let i=children.length-1; i>=0; i--) {
            pool.put(children[i])
        }
        
        for (let i = 0; i<this._rooms.length; i++) {
            let info = this._rooms[i]
            let item = pool.get()
            if (!item) {
                item = cc.instantiate(itemtmp)
            }
            content.addChild(item)
            item.active = true

            Global.setLabelString("title", item, this._gamename)
            Global.setLabelString("blind", item, info.basecoin)
            Global.setLabelString("player/value", item, info.pnum)
            // let btnPlay = cc.find("btn_play", item)
            item.off("click")
            item.on("click", this.onClickPlay, this)
            cc.log("===2.1")
        }
        
    },

    onClickPlay(event) {
        cc.vv.EventManager.emit("EVENT_BTN_CLICK_2_SOUNDS");
        let content = cc.find("view/content", this.node)
        let index = content.children.indexOf(event.node)
        if (index >= 0) {

            let bInnerGame = cc.vv.UserManager.isNoNeedDownGame(this._gameid)
            let bNew = cc.vv.SubGameUpdateNode.getComponent('subGameMgr')._isAreadyNew(this._gameid)
            if(cc.sys.isBrowser ||  bNew || bInnerGame){
                let room = this._rooms[index]
                let data = {deskid:room.deskid}
                cc.vv.GameManager.EnterGame(this._gameid, 0, data)
            }
            else{
                let tips = cc.js.formatStr('You need to download the latest resources of 【%s】 first',cc.vv.UserConfig.getGameName(this._gameid))
                cc.vv.AlertView.show(tips,()=>{
                    this._waitgameId = this._gameid
                    cc.vv.SubGameUpdateNode.emit("check_subgame", this._gameid);
                    cc.vv.FloatTip.show("start download")
                },()=>{

                })
            }
            
        }
    },

    update(dt) {
        this._time += dt
        if (this._time > 15) {
            this.requestRoomList()
            this._time = 0
        }
    }
});
