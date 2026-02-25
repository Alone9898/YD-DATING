

cc.Class({
    extends: require("LMSlots_Logic_Base"),

    properties: {

    },

    onLoad () {
        let TheLegendOfDragon = {};
        Global.TheLegendOfDragon = TheLegendOfDragon;
        TheLegendOfDragon.playEffect = function(fn) {
            cc.vv.AudioManager.playEff("games/TheLegendOfDragon/", fn, true);
        };
        TheLegendOfDragon.stopEffect = function(fn) {
            cc.vv.AudioManager.stopEffectByName(fn);
        };

        TheLegendOfDragon.Logic = this;
        TheLegendOfDragon.Pick = this.node.getComponent("TheLegendOfDragon_Pick");
        TheLegendOfDragon.Collect = this.node.getComponent("TheLegendOfDragon_Collect");
        TheLegendOfDragon.Wheel = this.node.getComponent("TheLegendOfDragon_Wheel");
        TheLegendOfDragon.Pop = this.node.getComponent("TheLegendOfDragon_Pop");

        this._super();
        TheLegendOfDragon.Slots = cc.find("safe_node/slots", this.node).getComponent("TheLegendOfDragon_Slots");
        this.StartSlot();
    },

    start () {
    },

    onDestroy() {
        Global.TheLegendOfDragon = null;
    },

    //qieping1: 抽卡过场
    //qieping2：免费游戏过场
    showTransition(name, callback) {
        let node = cc.find("safe_node/"+name, this.node);
        node.active = true;
        let ske = node.getComponent(sp.Skeleton);
        ske.setAnimation(0, "animation", false);
        ske.setCompleteListener(()=>{
            if (callback) callback();
            node.active = false;
        });
    },

});
