
cc.Class({
    extends: require('LMSlots_Logic_Base'),

    properties: {
        bg:cc.Sprite,
        gameBg:[cc.SpriteFrame],
    },

    onLoad () {
        Global.playHSMusic = function(fn, loop) {
            cc.vv.AudioManager.playBgm("games/G_Cleopatra/", fn, true, loop);
        };
        Global.playHSEffect = function(fn, loop, callback, volume) {
            cc.vv.AudioManager.playEff("games/G_Cleopatra/", fn, true, loop, callback, volume);
        };
    
        Global.stopHSEffect = function(fn) {
            cc.vv.AudioManager.stopEffectByName(fn)
        };
        
         //免费游戏脚本
         let script_freegame = this.node.addComponent('G_Cleopatra_FreeGame');
         cc.vv.gameData.SetGameScript(script_freegame);
         
         let script_collectFree = this.node.addComponent('G_Cleopatra_CollectFree');
         cc.vv.gameData.SetCollectFreeScript(script_collectFree);

         cc.vv.gameData.SetGameLogicScript(this);
         this._super();
    },

    //改变游戏背景
    changeGameBg(index){
        this.bg.spriteFrame = this.gameBg[index];

        // cc.find("Canvas/safe_node/bg_base").active = index === 5;
    },

});
