
cc.Class({
    extends: require('LMSlots_Logic_Base'),

    properties: {

    },

    onLoad () {
        window.SlotsFacade = this; // 创建个全局变量，以便子模块方便访问
        this.dm = cc.vv.gameData;

        this.InitCommComponent();
        this.mainPanel = cc.find("safe_node", this.node);
        // 自定义模块索引
        this.energyCollect = cc.find("slots/node_energy", this.mainPanel).getComponent("LampOfAladdin_Energy");
        this.energyFreeGame = cc.find("node_energy_free_game", this.mainPanel).getComponent("LampOfAladdin_Energy_FreeGame");
        this.gameWheel = cc.find("gameWheel", this.mainPanel).getComponent("LampOfAladdin_GameWheel");
        this.map = cc.find("map_game", this.mainPanel).getComponent("LampOfAladdin_Map");
        this.pickBonus = cc.find("gamePickBonus", this.mainPanel).getComponent("LampOfAladdin_PickBonus");
        // this.prizePool = cc.find("pool_layout/LMSlots_PrizePool_1", this.mainPanel).getComponent("LampOfAladdin_PrizePool");
        // this.logo = cc.find("spine_logo", this.mainPanel).getComponent("LMSlots_Logo_Adapt");

        // 设置基类快捷索引
        this.topCmp = cc.vv.gameData.GetTopScript();
        this.bottomCmp = cc.vv.gameData.GetBottomScript();
        this.slots = cc.vv.gameData.GetSlotsScript();
    },

    onDestroy() {
        window.SlotsFacade = null;
        this.dm = null;
    },

    delayTime(time) {
        return new Promise((res, rej) => {
            this.scheduleOnce(()=>{res()}, time);
        });
    },

    start () {
        this._super();
    },


});
