cc.Class({
    extends: cc.Component,

    properties: {
        inputEdit: cc.EditBox,
        button: cc.Button,
        // rewardNode: cc.Node,
    },

    onLoad() {
        this.button.getComponent("ButtonGrayCmp").interactable = false;
        this.button.node.on("click", this.onClickSave, this)
        let netListener = this.node.addComponent("NetListenerCmp");
        netListener.registerMsg(MsgId.UPDATE_USER_INFO, this.UPDATE_USER_INFO, this);
        netListener.registerMsg(MsgId.USER_NEW_GIFT, this.USER_NEW_GIFT, this);
        // let nodeMap = this.rewardNode.getComponent("RewardListCpt").updateView(cc.vv.UserManager.namerewards);
        // if (nodeMap[1]) nodeMap[1].icon.scale = 0.4;
        // if (nodeMap[25]) nodeMap[25].icon.scale = 0.4;
        // if (nodeMap[53]) nodeMap[53].icon.scale = 0.3;
        // if (nodeMap[51]) nodeMap[51].icon.scale = 0.5;
        // if (nodeMap[40]) nodeMap[40].icon.scale = 0.35;
    },

    onChangeText(text, editbox, customEventData) {
        let str = text.trim()

        // 只保留印度文,数字和英文
        let strList = str.split("");
        let newStr = [];
        for (let i = 0; i < strList.length; i++) {
            const ucode = strList[i].charCodeAt(0);
            if ((ucode > 127 && ucode < 0x0900) || ucode > 0x097F) {
                continue;
            }
            newStr.push(strList[i]);
        }
        str = newStr.join("");
        this.inputEdit.string = str;
        this.button.getComponent("ButtonGrayCmp").interactable = str.length > 0;
    },


    onClickSave() {
        let nameinput = this.inputEdit.string.trim()

        //打点
        let val = {}
        val['$RoleClass'] = "NewPlayer"
        val['$RoleName'] = nameinput
        val['$FirstCreate'] = 1
        val['$RoleGender'] = cc.vv.UserManager.sex
        val['$Server'] = 1
        cc.vv.PlatformApiMgr.KoSDKTrackEvent('$CreateRole', JSON.stringify(val))

        // 发送请求
        cc.vv.NetManager.send({ c: MsgId.UPDATE_USER_INFO, nickname: nameinput });
        // 关闭自己
        // cc.vv.PopupManager.removePopup(this.node);
    },

    USER_NEW_GIFT(msg) {
        if (msg.code != 200) return;
        if (msg.spcode && msg.spcode > 0) {
            cc.vv.FloatTip.show(cc.vv.UserConfig.spcode2String(msg.spcode), true);
            return;
        }
        // 奖励
        Global.RewardFly(msg.rewards, this.button.node.convertToWorldSpaceAR(cc.v2(0, 0)));
        cc.vv.PopupManager.removePopup(this.node);
    },


    UPDATE_USER_INFO(msg) {
        if (msg.code != 200) return;
        if (msg.spcode && msg.spcode > 0) {
            cc.vv.FloatTip.show(cc.vv.UserConfig.spcode2String(msg.spcode), true);
            return;
        }
        // let data = msg.user;
        // if (data.playername != undefined) {
        //     // 请求获得新手奖励 TODO
        //     cc.vv.NetManager.send({ c: MsgId.USER_NEW_GIFT });
        // }
        cc.vv.PopupManager.removePopup(this.node);
    },
});
