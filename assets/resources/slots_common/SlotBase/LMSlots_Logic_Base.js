/**
 * 游戏入口，配置加载的组件
 * 挂在Canvas节点上
 */
cc.Class({
    extends: cc.Component,

    properties: {
       
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        
        this.InitCommComponent()
    },

    //初始化公共组件
    InitCommComponent:function(){
        this.FitIPad()
        //BigWin
        this.node.addComponent("BigWin")
        //资源加载脚本
        let assetScp = cc.find("Canvas").getComponent("LMSlots_Asset_Base")
        cc.vv.gameData.SetAssetScript(assetScp)

        let safe_node = cc.find('safe_node',this.node)
        let cfg = cc.vv.gameData.getGameCfg()
        //sound
        let defSoundCmp = 'LMSlots_Sound'
        if (cfg.scripts.Sound) {
            defSoundCmp = cfg.scripts.Sound
        }
        this.node.addComponent(defSoundCmp)

        //顶部
        let node_top = cc.find('LMSlots_Top',safe_node)
        let script_top = node_top.addComponent(cfg.scripts.Top)
        script_top.Init()
        //底部
        let node_bottom = cc.find('LMSlots_Bottom',safe_node)
        let script_bottom = node_bottom.addComponent(cfg.scripts.Bottom)
        script_bottom.Init()
        //存到gamedata里面
        cc.vv.gameData.SetTopBottomScript(script_top,script_bottom)

        //slots
        let node_slots = cc.find('slots',safe_node)
        if(node_slots){
            let script_slots = node_slots.addComponent(cfg.scripts.Slots)
            //存到gamedata里面
            cc.vv.gameData.SetSlotsScript(script_slots)
        }
        

        //slot外的系统功能组建
        this.node.addComponent('LMSots_OtherSys')

        // 拼图功能
        if (cfg.puzzleCfg) {
            this.node.addComponent("LMSlots_Puzzle");
        }
    },

    //开始游戏
    StartSlot:function(){
        let script_slots = cc.vv.gameData.GetSlotsScript()
        if(script_slots){
            script_slots.Init()
        }
        
    },

    start () {
        this.StartSlot()
        
    },

    FitIPad:function(){
        
        
        Global.autoAdaptDevices(false);

        
    },

    

    // update (dt) {},
});
