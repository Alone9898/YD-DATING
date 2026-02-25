
cc.Class({
    extends: cc.Component,

    properties: {

    },

    onLoad() {
        if (cc.vv.gameData && cc.vv.gameData.getGameId && cc.vv.gameData.getGameId() > 600) {
            cc.vv.gameData.PauseSlot()
        }
        let btn_confirm = cc.find("bg/btn_confirm", this.node);
        btn_confirm.on("click", this.onClickConfirm, this);

        Global.FixDesignScale_V(this.node)
    },

    start() {
        this.showEnterAction()
        Global.playComEff("ch_notification");
    },

    onDestroy() {
        if (cc.vv.gameData && cc.vv.gameData.getGameId && cc.vv.gameData.getGameId() > 600) {
            cc.vv.gameData.ResumeSlot()
        }
    },



    show(data) {
        //title
        let titleStr = data.title || "NOTICE"
        cc.find('bg/lbl_title', this.node).getComponent(cc.Label).string = titleStr
        //msg
        let str = data.msg
        cc.find("bg/content/lbl_content", this.node).getComponent(cc.RichText).string = "<img src='horn' /> : " + str;

        //显示时间
        let nShowtime = data.close || 5

        //是否可以关闭
        let closebtn = cc.find("bg/btn_confirm", this.node);
        let closebg = cc.find('comm_pop_ui_bg', this.node)

        let closetype = data.type
        if (closetype == 1) {
            //不可以关闭
            closebtn.active = false
            closebg.active = true
            nShowtime = 0
        }
        else if (closetype == 2) {
            //可以关闭-手动
            closebtn.active = true
            closebg.active = true
            nShowtime = 0
        }
        else if (closetype == 3) {
            //自动关闭-自动
            closebtn.active = false
            closebg.active = false

        }
        else if (closetype == 4) {
            //自动+点击关闭
            closebtn.active = true
            closebg.active = false
        }

        //是否可以自动关闭
        if (nShowtime) {
            this.node.stopAllActions()
            cc.tween(this.node)
                .delay(nShowtime)
                .call(()=>{
                    this.node.destroy();
                })
                .start()
        }

    },

    //进入动作
    showEnterAction: function () {
        let bg = cc.find('bg', this.node)
        bg.active = false
        bg.y = cc.winSize.height
        let targetY = cc.winSize.height / 2 - this.node.scale * bg.height / 2 - cc.winSize.height * 0.1
        bg.active = true
        cc.tween(bg)
            .to(0.6, { y: targetY }, { easing: "backIn" })
            .start()
    },


    onClickConfirm() {
        Global.playComEff("ch_btn_click");

        this.node.stopAllActions();
        this.node.runAction(cc.sequence(cc.fadeOut(0.5), cc.destroySelf()));
    },
});
