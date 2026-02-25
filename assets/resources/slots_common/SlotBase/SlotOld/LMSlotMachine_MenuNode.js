/**
 * 弹出一级的菜单
 */
 let eff_cfg = {path: 'slots_common/SlotRes/' , filename:'common_click', common: true}; 
cc.Class({
    extends: cc.Component,

    properties: {
        
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.registerEvent()

        

        //关闭
        Global.btnClickEvent(cc.find("btn_close", this.node), this.onBtnMenuClose, this);
        
        
        //sound开关
        let btn_sound = cc.find("btn_sound", this.node);
        Global.btnClickEvent(btn_sound, this.onMenuSoundClicked, this);

        //music开关
        let btn_music = cc.find("btn_music",this.node);
        Global.btnClickEvent(btn_music, this.onMenuMusicClicked, this);

        this.checkSoundVal()

        //帮助
        Global.btnClickEvent(cc.find("btn_help", this.node), this.onMenuHelpClicked, this);
        // //联系我们
        // Global.btnClickEvent(cc.find("btn_rate", this.node), this.onMenuRateClicked, this);
        // //隐私协议
        // Global.btnClickEvent(cc.find("btn_privacyPolicy", this.node), this.onMenuPolicyClicked, this);
        
        //退出
        Global.btnClickEvent(cc.find("btn_exit", this.node), this.onMenuExit, this);
    },

    start () {
        //点击空白部分
        let node_out = new cc.Node('node_out')
        node_out.addComponent(cc.Button)
        node_out.parent = this.node
        node_out.width = cc.winSize.width*10
        node_out.height = cc.winSize.height*10
        //let convas = cc.find('Canvas/safe_node')
        //let worldPos = convas.convertToWorldSpaceAR(cc.v2(0,0))
        let pos = this.node.convertToNodeSpaceAR(cc.v2(cc.winSize.width/2,cc.winSize.height/2))
        node_out.x = pos.x
        node_out.y = pos.y
        node_out.zIndex = -1;
        Global.btnClickEvent(node_out, this.onBtnMenuClose, this);

        let help = cc.find('btn_help',this.node)
        
        // let policy = cc.find('btn_privacyPolicy',this.node)
        help.active = !this._bInHall
    
        // policy.active = this._bInHall && !Global.isAndroidReview;;
    },

    onDestroy:function(){
        if(this._endCall){
            this._endCall()
        }
    },

    registerEvent:function(){
        if(cc.vv.gameData && cc.vv.gameData._EventId.SLOT_HIDE_MENU){
            Global.registerEvent(cc.vv.gameData._EventId.SLOT_HIDE_MENU,this.onEventHideMenu,this);
        }
        
    },

    setCloseCall:function(endCall){
        this._endCall = endCall
    },

    setIsInHall:function(val){
        this._bInHall = val
    },

    //检查声音设置
    checkSoundVal:function(){
        let btn_sound = cc.find("btn_sound", this.node);
        btn_sound.getChildByName("on").active = cc.vv.AudioManager.getEffVolume()>0;
        btn_sound.getChildByName("off").active = !btn_sound.getChildByName("on").active;

        let btn_music = cc.find("btn_music",this.node);
        let music_on = btn_music.getChildByName("on")
        let music_off = btn_music.getChildByName("off")
        music_on.active = cc.vv.AudioManager.getBgmVolume()>0;
        music_off.active = !music_on.active;
    },

    // onMenuRateClicked(){
    //     cc.vv.AudioManager.playEff(eff_cfg.path, eff_cfg.filename, eff_cfg.common)
    //     cc.vv.PlatformApiMgr.openURL(Global.fackbookLink);
    // },

    // onMenuPolicyClicked(){

    //     let self = this
    //     cc.loader.loadRes("common/prefab/privacy_policy",cc.Prefab, (err, prefab) => {
    //         if (!err) {
    //             let node = cc.instantiate(prefab);
    //             node.parent = cc.find('Canvas');
    //         }
    //         self.node.destroy()
    //     })
    // },

    //音效
    onMenuSoundClicked (event, customEventData) {
        cc.vv.AudioManager.playEff(eff_cfg.path, eff_cfg.filename, eff_cfg.common)
        let btn_sound = cc.find("btn_sound", this.node);
        btn_sound.getChildByName("on").active = !btn_sound.getChildByName("on").active;
        btn_sound.getChildByName("off").active = !btn_sound.getChildByName("on").active;

        let volume = btn_sound.getChildByName("on").active?1:0;
        cc.vv.AudioManager.setEffVolume(volume);
        StatisticsMgr.reqReport(volume?StatisticsMgr.REQ_HALL_EFFECT_OPEN:StatisticsMgr.REQ_HALL_EFFECT_CLOSE);
    },

    //背景音
    onMenuMusicClicked:function(){
        cc.vv.AudioManager.playEff(eff_cfg.path, eff_cfg.filename, eff_cfg.common)
        let btn_music = cc.find("btn_music", this.node);
        btn_music.getChildByName("on").active = !btn_music.getChildByName("on").active;
        btn_music.getChildByName("off").active = !btn_music.getChildByName("on").active;

        let volume =btn_music.getChildByName("on").active?1:0;
        cc.vv.AudioManager.setBgmVolume(volume);
        StatisticsMgr.reqReport(volume?StatisticsMgr.REQ_HALL_BGM_OPEN:StatisticsMgr.REQ_HALL_BGM_CLOSE);
    },

    onMenuHelpClicked (event, customEventData) {
        
        // if(Global.isIOSReview()){
        //     this.onMenuPolicyClicked()
        //     return
        // }

        let self = this

        if(cc.vv.gameData){
            let cfg 
            let help_script
            let help_prefab_url
            // let slotConfig = cc.vv.SlotGameCfg[cc.vv.gameData._gameId]
            // if(slotConfig){//旧框架
            //     cfg = require(slotConfig.cfgCmp);
            //     help_prefab_url = cfg.help_prefab
            //     help_script = 'LMSlotMachine_Help'
                
            // }
            // else{ //新框架
                cfg = cc.vv.gameData.getGameCfg()
                help_prefab_url = cfg.help_prefab
                if(!help_prefab_url){//没配置就使用默认的
                    help_prefab_url = "slots_common/SlotRes/prefab/LMSlots_Help_prefab"
                }
                help_script = cfg.help_prefab_cfg
                if(!help_script){
                    help_script = 'LMSlots_Help_Base'
                }
            // }
            
            if(!help_prefab_url){
                console.log("未在cfg中配置help预制的路径");
                return
            }
            cc.loader.loadRes(help_prefab_url,cc.Prefab, (err, prefab) => {
                if (!err) {
                    let old = self.node.parent.getChildByName('help_node')
                    if(!old){
                        old = cc.instantiate(prefab)
                        
                        let script = old.getComponent(help_script)
                        if(!script){
                            old.addComponent(help_script)
                        }
                        old.name = 'help_node'
                        old.parent = self.node.parent
                        old.active = true
                    }
                    else{
                        old.active = true
                    }
                    
                }
                self.node.destroy()
            })
        }
        

        
    },

    SetBackLobby:function(bEnable){
        let menu = cc.find("btn_exit", this.node) 
        menu.getComponent(cc.Button).interactable = bEnable
    },

    //返回大厅
    onMenuExit:function(){
        cc.vv.AudioManager.playEff(eff_cfg.path, eff_cfg.filename, eff_cfg.common)
        if(cc.vv.gameData){
            if(this._bSendExist) return
            this._bSendExist = true
            let self = this
            let delayCal = function(){
                self._bSendExist = false
            }
            this.scheduleOnce(delayCal,2)
            cc.vv.gameData.ReqBackLobby()
        }
        
    },

    // onMenuSettingClicked (event, customEventData) {
    //     let self = this
    //     if(Global.isIOSReview()){
    //         cc.vv.GameManager.GameLogoout()
    //         return

    //     }
    //     cc.loader.loadRes("slots_common/SlotRes/prefab/LMSlots_Setting",cc.Prefab, (err, prefab) => {
    //         if (!err) {
    //             let parentNode = cc.find("Canvas")
    //             let old = parentNode.getChildByName('LMSlots_Setting')
    //             if(!old){
    //                 old = cc.instantiate(prefab)
    //                 old.name = 'LMSlots_Setting'
    //                 old.parent = parentNode
    //             }
                    
    //                 old.active = true;
    //                 old.zIndex = 1
    //                 let gameId = null
    //                 if(cc.vv.gameData){
    //                     gameId = cc.vv.gameData.getGameId()
    //                 }
                    
    //                 if(cc.isValid(self.node)){
    //                     self.node.destroy()
    //                 }
                    
    //         }
    //     })
        
    // },

    onEventHideMenu:function(){
        //按cash,只有自己关闭其它不能关
        this.node.destroy()
    },

    onBtnMenuClose:function(){
        cc.vv.AudioManager.playEff(eff_cfg.path, eff_cfg.filename, eff_cfg.common)

        this.node.destroy()
    },


    // update (dt) {},
});
