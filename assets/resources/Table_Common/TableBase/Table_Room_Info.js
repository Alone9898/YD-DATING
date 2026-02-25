
cc.Class({
    extends: cc.Component,

    properties: {
        nameSpr:cc.Sprite,

        compettionNode:cc.Node,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        if(this.nameSpr){
            let gameid = cc.vv.gameData.getGameId();
            cc.vv.UserConfig.setGameTitleFrame(this.nameSpr, gameid);
        }

        if(this.compettionNode){
            this.compettionNode.active = false;
        }


        this.moveIn();
    },

    start () {

    },

    moveIn(){
        let s_Y = this.node.parent.convertToNodeSpaceAR(cc.v2(0, cc.winSize.height/2+200)).y;

        let panel = cc.find("bg", this.node);
        panel.y = s_Y;
        panel.opacity = 0;
        cc.tween(panel)
            .delay(0.3)
            .call(()=>{panel.opacity = 255;})
            .to(0.5,  {y: 0}, {easing:"backOut"})
            .start()
    }

    // update (dt) {},
});
