const { ccclass, property } = cc._decorator;

@ccclass
export default class FriendRoomItem extends cc.Component {

    // @property(cc.SpriteAtlas)
    // textureAtlas: cc.SpriteAtlas = null;

    private data: any;
    onLoad() {
        // 添加引导
        cc.loader.loadRes("BalootClient/NewerGuide/NewGuideHint", (err, prefab) => {
            if (!err) {
                var guideNode: cc.Node = cc.instantiate(prefab);
                guideNode.position = cc.v3(100, 0, 0);
                let guideCpt = guideNode.getComponent("NewGuideHintCpt");
                if (guideCpt) {
                    guideCpt.key = "salon";
                    guideCpt.step = 2;
                    let btn = this.node.getComponent(cc.Button);
                    if (btn) guideCpt.buttons.push(btn);
                    for (let i = 0; i < 6; i++) {
                        let itemNode = cc.find(`item${i}`, this.node);
                        let btn_join = itemNode.getChildByName("btn_join").getComponent(cc.Button);
                        if (btn_join) guideCpt.buttons.push(btn_join);
                    }
                }
                guideNode.parent = this.node;
            }
        });
    }

    // 更新界面
    updateView(data) {
        this.data = data;
        // cc.vv.UserConfig.setGameCafeFrame(cc.find("icon", this.node).getComponent(cc.Sprite), data.gameid);

        cc.find("gamename", this.node).getComponent(cc.Label).string = cc.vv.UserConfig.getGameName(data.gameid);
        cc.find("name/label", this.node).getComponent(cc.Label).string = "ID:" + data.deskid;
        cc.find("coin/label", this.node).getComponent(cc.Label).string = Global.formatNumber(data.entry || 0, { threshold: 100000 });
        cc.find("lock", this.node).active = (data.pwd && data.pwd.length > 0);
        let uCnt = data.users.length;
        for (let i = 0; i < 6; i++) {
            let itemNode = cc.find(`item${i}`, this.node);
            if(data.gameid == 269 && data.maxSeat){
                itemNode.active = i < data.maxSeat;
            } else {
                itemNode.active = i < data.seat;
            }
            let btn_join = itemNode.getChildByName("btn_join").getComponent(cc.Button);
            let headCmp = itemNode.getChildByName("node_head").getComponent("HeadCmp");
            let autoIcon = cc.find("node_head/icon_salon_auto", itemNode);
            if (uCnt > i && (i!=5 || uCnt<6 || data.maxSeat<=6 || uCnt==data.maxSeat)) { // 桌子座位数>6，玩家没坐满，空出最后一个位子
                btn_join.node.active = false;
                headCmp.node.active = true;
                headCmp.setHead(data.users[i].uid, data.users[i].usericon);
                headCmp.setAvatarFrame(data.users[i].avatarframe);
                autoIcon.active = data.users[i].auto && data.users[i].auto > 0;
            } else {
                btn_join.node.active = true;
                headCmp.node.active = false;
                headCmp.node.active = false;
                autoIcon.active = false;
            }
        }
        let fireNode = cc.find("selfNode", this.node);
        if (fireNode) fireNode.active = data.onwer_info.uid == cc.vv.UserManager.uid;
        cc.find("btnDissolve", this.node).active = data.onwer_info.uid == cc.vv.UserManager.uid;
    }

    // 点击牌桌 加入游戏
    onClickDesk(event) {
        // let data = this.data;
        cc.vv.EventManager.emit("EVENT_BTN_CLICK_2_SOUNDS");
        Global.dispatchEvent("EVENT_FRIEND_JOIN_ROOM", this.data);
    }


    // 点击解散
    onClickDissolveRoom() {
        cc.vv.EventManager.emit("EVENT_BTN_CLICK_2_SOUNDS");
        let data = this.data;
        cc.vv.NetManager.send({
            c: MsgId.FRIEND_ROOM_DISSOLVE,
            deskid: data.deskid,
            gameid: data.gameid,
        }, true);
    }

}
