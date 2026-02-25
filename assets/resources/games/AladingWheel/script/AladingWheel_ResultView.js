cc.Class({
    extends: cc.Component,

    properties: {
        itemPeopleNode: cc.Node,
        photoNode: cc.Node,
        resultNode: cc.Node,
        content: cc.Node,
        resItem: cc.Node,
        resItem1: cc.Node,
        moneyNode: cc.Node,
        LabelNode: cc.Node,
        Scroll: cc.ScrollView,
        playData: null,
        result: null,
        photoStr: "",
        useCoin: null,
    },

    onLoad() {
    },

    start() {

    },
    setGameData(playData, result, data, useCoin) {
        this.playData = playData;
        this.result = result;
        this.photoStr = data;
        this.useCoin = useCoin;
    },


    initView(playData, result, photoStr) {
        if (!playData || !result) return;
        //移除节点
        if (this.content.childrenCount > 0) {
            this.content.destroyAllChildren();
        }
        if (this.resultNode.childrenCount > 0) {
            this.resultNode.destroyAllChildren();
        }

        //每次移动到最上端
        if (this.Scroll) {
            this.Scroll.scrollToTop(0);
        }
        this.initButtomUI();
        //加载人物排行
        let len = playData.length;
        for (let index = 0; index < len; index++) {
            const element = playData[index];
            this.initPeopleItem(element.wincoin, element.playername, index + 1, element)
        }
        //加载结果
        if (result.length > 1) {
            this.initResultItem(result[1], this.resItem)
        } else {
            this.initResultItem(result[0], this.resItem1)
        }

        if (this.useCoin && this.useCoin.wincoin > 0) {
            this.selfReward(this.useCoin.wincoin);
        }


        //加载头像
        this.photoNode.getComponent("HeadCmp").setHead(cc.vv.UserManager.uid, photoStr.usericon)
        let _avatarframe = photoStr.avatarframe.toString();
        _avatarframe = _avatarframe.indexOf("avatarframe_") >= 0 ? _avatarframe : "avatarframe_0";
        this.photoNode.getComponent("HeadCmp").setAvatarFrame(_avatarframe);

    },


    initPeopleItem(goldNum, playerName, rank, allUserData) {
        let itemNode = cc.instantiate(this.itemPeopleNode);
        itemNode.active = true;
        this.content.addChild(itemNode);
        let uid = allUserData.uid;
        if (uid === cc.vv.UserManager.uid) { //自己中奖了
            itemNode.getChildByName('bg').active = true;
            itemNode.getChildByName('Layout').children[0].getChildByName('label1').color = new cc.Color(200, 0, 0, 255)
            itemNode.getChildByName('Layout').children[1].getChildByName('label2').color = new cc.Color(200, 0, 0, 255);
            itemNode.getChildByName('Layout').children[2].getChildByName('label3').color = new cc.Color(200, 0, 0, 255);
        }
        itemNode.x = 0;
        itemNode.y = 0;
        itemNode.getChildByName('Layout').children[0].getChildByName('label1').getComponent(cc.Label).string = rank.toString()
        itemNode.getChildByName('Layout').children[1].getChildByName('label2').getComponent(cc.Label).string = playerName;
        itemNode.getChildByName('Layout').children[2].getChildByName('label3').getComponent(cc.Label).string = Global.FormatNumToComma(goldNum);
    },

    initResultItem(resultArr, itemNode) {
        for (let i = 0; i < resultArr.length; i++) {
            let resultIndex = resultArr[i]
            let nodess = cc.instantiate(itemNode);
            nodess.active = true;
            this.resultNode.addChild(nodess);
            nodess.x = 0;
            nodess.y = 0;
            let mul = cc.vv.gameData.getGameCfg().Multiples[resultIndex - 1];
            let icon = cc.vv.gameData.getGameCfg().Results[resultIndex - 1];
            nodess.getChildByName('num').getComponent(cc.Sprite).spriteFrame = cc.vv.gameData.getAtlas(0).getSpriteFrame(`x${mul}`);
            nodess.getChildByName('bg').getComponent(cc.Sprite).spriteFrame = cc.vv.gameData.getAtlas(0).getSpriteFrame(`laba_bet_${icon - 1}`);
        }


    },

    onEnable() {
        this.initView(this.playData, this.result, this.photoStr)
        this.scheduleOnce(() => {
            this.node.active = false;
        }, 3)
    },

    onClickClose() {
        this.unscheduleAllCallbacks();
        this.node.active = false;
    },


    //自己中奖
    /**
     * 隐藏 祝福语
     * 显示金额
     */
    selfReward(coinsNum) {
        this.LabelNode.active = false;
        this.moneyNode.active = true;
        this.moneyNode.getChildByName('goldLabel').getComponent(cc.Label).string = Global.FormatNumToComma(coinsNum);
    },

    initButtomUI() {
        this.LabelNode.active = true;
        this.moneyNode.active = false;
    }
    // update (dt) {},

})

