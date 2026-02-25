/**
 * 子游戏下载进度的显示
 */
cc.Class({
    extends: cc.Component,

    properties: {
        gameInEdit:0,
        _gameId:null,
    },

    // LIFE-CYCLE CALLBACKS:

    initGameId(gameid){
        this._gameId = gameid
        
        let bLock = false//cc.vv.UserManager.isGameLock(gameid)

        if(bLock){
            //显示未解锁
            this._showUIStage(1)
        }
        else{
            let bWait = cc.vv.SubGameUpdateNode.getComponent('subGameMgr')._isWaitToDownload(gameid)
            if(bWait){
                this._showUIStage(5)
                return
            }
            let bDown = cc.vv.UserManager.isDownloadSubGame(gameid)
            let bInnerGame = cc.vv.UserManager.isNoNeedDownGame(gameid)
            if(bInnerGame){ //内置游戏，不需要下载
                //隐藏
                this._showUIStage(4)
            }
            else{
                if(!bDown){
                    //没有下载
                    this._showUIStage(2)
                }
                else{
                    //是否需要更新
                    let bNeedUpdate = cc.vv.SubGameUpdateNode.getComponent('subGameMgr').isInCheckDownlist(gameid)
                    if(bNeedUpdate){
                        //需要更新
                        this._showUIStage(2)
                    }
                    else{
                        //隐藏
                        this._showUIStage(4)
                    }
                    
                }
            }
            
            
        }
        
        

    },


    onLoad () {
        
        //监听进度
        cc.vv.SubGameUpdateNode.on("update_subgame_pro",this.downloadingPro.bind(this))
        //监听是否完成
        Global.registerEvent("checkSubStart", this.downloadingStart, this);
        Global.registerEvent("checkSubFinish", this.downloadingFinish, this);
        Global.registerEvent("SubGameWaiting", this.downloadWaiting, this);
        Global.registerEvent("update_subgame_fail", this.downloadFail, this);
        Global.registerEvent(EventId.SHOW_LOCK_TIP, this.showLocktip, this);
        
        if(this.gameInEdit){
            this.initGameId(this.gameInEdit)
        }
    },

    start () {

    },

    //下载开始
    downloadingStart:function(data){
        if(cc.isValid(this.node)){
            let gameid = data.detail
            if(gameid == this._gameId){
                this._showUIStage(3)
                let pro = 0
                this.setProVal(pro)
                this.setLblVal(Math.floor(pro)+'%')
            }
        }
    },

    //
    downloadingPro:function(data){
        if(cc.isValid(this.node)){
            let gameid = data.gameId
            let pro = data.per
            
            if(gameid == this._gameId){
                
                this._showUIStage(3)
                this.setProVal(pro)
                this.setLblVal(Math.floor(pro)+'%')
            }
            
        }
    },

    downloadingFinish:function(data){
        if(cc.isValid(this.node)){
            let gameid = data.detail
            if(gameid == this._gameId){
                this._showUIStage(4)
                // Global.playCashEff("hall/download_finish");
                //下载完成表现
                this._showTipText('Download Success!')

            }
        }
        
    },

    downloadWaiting:function(data){
        let gameid = data.detail
        
        if(gameid == this._gameId){
            cc.log('下载等待：'+gameid)
            this._showUIStage(5)
            
        }
    },

    //下载失败
    downloadFail:function(data){
        let info = data.detail
        if(info){
            let gameid = info.id
            if(gameid == this._gameId){
                //提示，然后清理进度条
                this._showUIStage(4)
                //下载失败提示
                if(info.code){
                    this._showTipText(cc.js.formatStr('Download Failed!(%s)',info.code))
                }
                
            }
        }
        
    },

    //设置进度条
    setProVal:function(val){
        let pro = cc.find('node_mask/pro', this.node)
        let bar = cc.find('bar', pro)
        val = Math.max(0.01, val/100)
        bar.width = val*(pro.width-10)
    },

    //设置lbl文字
    setLblVal:function(str){
        let lblPro = cc.find('node_mask/pro/lbl_pro', this.node)
        if(lblPro){
            lblPro.getComponent(cc.Label).string = str
        }
    },

    

    //1 未解锁 2 已解锁未下载 3 正在下载 4 已下载，隐藏 5 下载等待
    _showUIStage:function(nStage){
        if(!cc.isValid(this.node)){
            return
        }
        let nodeMask = this.node.getChildByName('node_mask')
        nodeMask.active = true
        let spr_down = cc.find('icon/spr_down_icon', this.node)
        let spr_lock = cc.find('icon/spr_lock_icon', this.node)
        let spr_wait = cc.find('icon/spr_wait_icon', this.node)
        spr_wait.active = false
        let spr_tips = this.node.getChildByName('spr_tip_bg')
        spr_tips.active = false

        if(nStage == 1){
            spr_lock.active = true
            spr_down.active = false
            nodeMask.active = false
            this.setProVal(0)
            let gData = cc.vv.UserManager.getGameListById(this._gameId)
            if(gData){
                let str = 'Unlock at LV.'+gData.level
                cc.find('text_tip',spr_tips).getComponent(cc.Label).string = str
                // this.setLblVal(str)
            }
            
        }
        else if( nStage == 2){
            spr_down.active = true
            spr_lock.active = false
            nodeMask.active = false
            this.setProVal(0)
            this.setLblVal(0)
        }
        else if(nStage == 3){
            spr_lock.active = false
            spr_down.active = true
            let val = Global.random(0,100)
            this.setProVal(val)
            this.setLblVal(val)
        }
        else if(nStage == 4){
            nodeMask.active = false
            spr_down.active = false
            spr_lock.active = false
        }
        else if(nStage == 5){
            spr_lock.active = false
            spr_down.active = false
            spr_wait.active = true
            this.setProVal(0)
            this.setLblVal('0%')
        }
    },

    

    //显示未解锁提示
    showLocktip:function(data){
        let gameId = data.detail

        if(gameId == this._gameId){
            this._showUIStage(1)
            //显示解锁等级提示
            this._showTipText()
            
        }
        
    },

    _showTipText:function(str){
        Global.playCashEff("hall/game_lock");

        let tipBg = cc.find('spr_tip_bg',this.node)
        if(str){
            cc.find('text_tip',tipBg).getComponent(cc.Label).string = str
        }
        tipBg.stopAllActions()
        tipBg.active = true
        tipBg.opacity = 0
        cc.tween(tipBg)
        .to(0.2,{opacity:255})
        .delay(3.5)
        .to(0.2,{opacity:0})
        .start()
    },

    // update (dt) {},
});
