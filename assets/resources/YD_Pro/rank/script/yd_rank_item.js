
cc.Class({
    extends: cc.Component,

    properties: {

    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start () {

    },

    updateView(data, isSelf, bgIdx = 0){
        this.node.getComponent("ImgSwitchCmp").setIndex(isSelf ? 1+bgIdx : 0+bgIdx);

        if(isSelf){
            if(!data.ord){
                this.showRank("--")
            } else {
                this.showRank(data.ord);
            }
            cc.find("name", this.node).getComponent(cc.Label).string = cc.vv.UserManager.nickName;
            cc.find("node_head", this.node).getComponent('HeadCmp').setHead(cc.vv.UserManager.uid, cc.vv.UserManager.userIcon);
            cc.find("node_head", this.node).getComponent('HeadCmp').setAvatarFrame(cc.vv.UserManager.avatarframe);
        } else {
            this.showRank(data.ord);
            cc.find("name", this.node).getComponent(cc.Label).string = data.playername;
            cc.find("node_head", this.node).getComponent('HeadCmp').setHead(data.uid, data.usericon);
            cc.find("node_head", this.node).getComponent('HeadCmp').setAvatarFrame(data.avatarframe);
        }

        cc.find("prize", this.node).getComponent(cc.Label).string = Global.FormatNumToComma(data.reward_coin || 0);
        cc.find("points", this.node).getComponent(cc.Label).string = Global.FormatNumToComma(data.score || 0);
    },

    showRank(ord){
        cc.find("icon_rank1", this.node).active = ord == 1;
        cc.find("icon_rank2", this.node).active = ord == 2;
        cc.find("icon_rank3", this.node).active = ord == 3;
        cc.find("rank", this.node).active = ord > 3 || typeof ord == "string";
        cc.find("rank", this.node).getComponent(cc.Label).string = ord;
    },



    // update (dt) {},
});
