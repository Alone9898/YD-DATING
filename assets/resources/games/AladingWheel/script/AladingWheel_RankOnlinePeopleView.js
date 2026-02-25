
cc.Class({
    extends: cc.Component,

    properties: {
        ContentNode: cc.Node,
        itemRank: cc.Node,
        buttomNode: cc.Node,

        rankData: [],
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        let netListener = this.node.addComponent("NetListenerCmp");
        netListener.registerMsg(MsgId.REQ_OBSER_LIST, this.REQ_OBSER_LIST, this);
    },

    start () {
        cc.vv.NetManager.send({ c: MsgId.REQ_OBSER_LIST });
    },

    //获取玩家列表
    REQ_OBSER_LIST(msg) {
        if (msg.code != 200) return;
        this.rankData = msg;
        this.initAllRank(this.rankData.list, this.ContentNode);
        this.initButtomNode(this.rankData.myself);
    },
    //
    initAllRank(data, parentNode) {
        if (parentNode.childrenCount > 0) return;
        for (let i = 0; i < data.length; i++) {
            const element = data[i];
            this.initRankItem(parentNode, element, i)
        }
    },

    initRankItem(parentNode, data, index) {
        let nodess1 = cc.instantiate(this.itemRank);
        nodess1.active = true;
        let nodess = nodess1.getChildByName('Layout');
        parentNode.addChild(nodess1);
        nodess.getChildByName('rankNode').getChildByName('rankicon1').active = false;
        nodess.getChildByName('rankNode').getChildByName('rankicon2').active = false;
        nodess.getChildByName('rankNode').getChildByName('rankicon3').active = false;
        nodess.getChildByName('rankNode').getChildByName('rankLabel').active = false;
        nodess1.getChildByName('rank1').active = false;
        nodess1.getChildByName('rank2').active = false;
        nodess1.getChildByName('rank3').active = false;
        nodess1.getChildByName('rank4').active = false;
        //显示自己的排行
        if (index == 0) {
            nodess.getChildByName('rankNode').getChildByName('rankicon1').active = true;
            nodess1.getChildByName('rank1').active = true;

        } else if (index == 1) {
            nodess.getChildByName('rankNode').getChildByName('rankicon2').active = true;
            nodess1.getChildByName('rank2').active = true;

        } else if (index == 2) {
            nodess.getChildByName('rankNode').getChildByName('rankicon3').active = true;
            nodess1.getChildByName('rank3').active = true;

        } else {
            nodess.getChildByName('rankNode').getChildByName('rankLabel').active = true;
            nodess1.getChildByName('rank4').active = true;
            nodess.getChildByName('rankNode').getChildByName('rankLabel').getComponent(cc.Label).string = (index + 1).toString();
        }

        nodess.getChildByName('UserHead').getComponent("HeadCmp").setHead(data.uid, data.usericon)
        let _avatarframe = data.avatarframe.toString();
        _avatarframe = _avatarframe.indexOf("avatarframe_") >= 0 ? _avatarframe : "avatarframe_0";
        nodess.getChildByName('UserHead').getComponent("HeadCmp").setAvatarFrame(_avatarframe);
        //名字 uid
        nodess.getChildByName('infoLabel').getChildByName('nameLabel').getComponent(cc.Label).string = data.playername
        nodess.getChildByName('infoLabel').getChildByName('uidLabel').getComponent(cc.Label).string = "UID:" + data.uid

        //金币数
        nodess.getChildByName('numSP').getChildByName('goldLabel').getComponent(cc.Label).string = Global.FormatNumToComma(data.betCoin);

    },

    initButtomNode(myself) {
        let item2Node = this.buttomNode.getChildByName('item2');
        let rankNode = cc.find("item1/Layout1/rankNode", this.buttomNode);
        let UserHeadNode = cc.find("item1/Layout1/UserHead", this.buttomNode);
        let infoNode = cc.find("item1/Layout1/infoNode", this.buttomNode);
        rankNode.getChildByName('rankicon1').active = false;
        rankNode.getChildByName('rankicon2').active = false;
        rankNode.getChildByName('rankicon3').active = false;
        rankNode.getChildByName('rankLabel').active = false;
        //显示自己的排行
        if (myself.ord == -1 || myself.ord > 30) {
            rankNode.getChildByName('rankLabel').active = true;
            rankNode.getChildByName('rankLabel').getComponent(cc.Label).string = "30+";
        } else if (myself.ord == 1) {
            rankNode.getChildByName('rankicon1').active = true;
        } else if (myself.ord == 2) {
            rankNode.getChildByName('rankicon2').active = true;
        } else if (myself.ord == 3) {
            rankNode.getChildByName('rankicon3').active = true;
        } else {
            rankNode.getChildByName('rankLabel').active = true;
            rankNode.getChildByName('rankLabel').getComponent(cc.Label).string = myself.ord;
        }

        UserHeadNode.getComponent("HeadCmp").setHead(myself.uid, myself.usericon)
        let _avatarframe = myself.avatarframe.toString();
        _avatarframe = _avatarframe.indexOf("avatarframe_") >= 0 ? _avatarframe : "avatarframe_0";
        UserHeadNode.getComponent("HeadCmp").setAvatarFrame(_avatarframe);

        //名字 uid
        infoNode.getChildByName('nameLabel').getComponent(cc.Label).string = myself.playername
        infoNode.getChildByName('uidLabel').getComponent(cc.Label).string = "UID:" + myself.uid 
        //金币数
        item2Node.children[0].getChildByName('goldLabel').getComponent(cc.Label).string = Global.FormatNumToComma(myself.betCoin);

    },

    // update (dt) {},
});
