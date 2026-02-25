const { ccclass, property } = cc._decorator;

@ccclass
export default class PageChatRoomItem extends cc.Component {
    private data: any;

    @property(cc.SpriteAtlas)
    textureAtlas: cc.SpriteAtlas = null;

    onLoad() {
        cc.find("friend_invite", this.node).on("click", this.onClickDesk, this);
        cc.find("friend_invite/userNodes/item0/btn_join", this.node).on("click", this.onClickDesk, this);
        cc.find("friend_invite/userNodes/item1/btn_join", this.node).on("click", this.onClickDesk, this);
        cc.find("friend_invite/userNodes/item2/btn_join", this.node).on("click", this.onClickDesk, this);
        cc.find("friend_invite/userNodes/item3/btn_join", this.node).on("click", this.onClickDesk, this);
        cc.find("friend_invite/userNodes/item4/btn_join", this.node).on("click", this.onClickDesk, this);
        cc.find("friend_invite/userNodes/item5/btn_join", this.node).on("click", this.onClickDesk, this);
    }

    updateView(data) {
        this.data = data;
        let gameid = data.gameid;
        let inviteNode = cc.find("friend_invite", this.node)
        let headCmp = cc.find("node_head", this.node).getComponent("HeadCmp")
        let nameLabel = cc.find("lbl_name", this.node).getComponent(cc.Label)
        let levelLabel = cc.find("lbl_lv", this.node).getComponent(cc.Label)
        let uiType = cc.vv.UserManager.uid == data.onwer_info.uid ? 1 : 2;
        // 设置头像
        headCmp.setHead(data.onwer_info.uid, data.onwer_info.avatar || data.onwer_info.usericon);
        let _avatarframe = data.onwer_info.avatarframe.toString();
        _avatarframe = _avatarframe.indexOf("avatarframe_") >= 0 ? _avatarframe : "avatarframe_0";
        headCmp.setAvatarFrame(_avatarframe);
        // 名字设置
        nameLabel.string = data.onwer_info.name || data.onwer_info.playername;
        // 等级设置
        levelLabel.string = "LV." + data.onwer_info.level;
        // 邀请的房间ID
        cc.find("roomid/value", inviteNode).getComponent(cc.Label).string = data.deskid;
        cc.find("coin/value", inviteNode).getComponent(cc.Label).string = Global.formatNumber(Math.floor(data.entry || 0), { threshold: 100000 });
        // 设置图标 TODO
        cc.vv.UserConfig.setGameCafeFrame(cc.find("icon_game/icon", inviteNode).getComponent(cc.Sprite).spriteFrame, gameid);

        // 设置名称
        cc.find("icon_game/name", inviteNode).getComponent(cc.Label).string = cc.vv.UserConfig.getGameName(gameid);

        // 左右差异
        if (uiType == 1) {
            headCmp.node.x = 440;
            nameLabel.node.x = 240;
            nameLabel.node.anchorX = 1;
            levelLabel.node.x = 332;
            levelLabel.node.anchorX = 1;
        } else {
            headCmp.node.x = -440;
            nameLabel.node.x = -240;
            nameLabel.node.anchorX = 0;
            levelLabel.node.x = -332;
            levelLabel.node.anchorX = 0;
        }

        // 布局设置1:自己 2:别人
        if (uiType == 1) {
            // 邀请设置
            inviteNode.x = -346;
            inviteNode.anchorX = -1;
            cc.find("bg", inviteNode).scaleX = 1;
            cc.find("bg", inviteNode).x = -8;
            cc.find("bg_ex", inviteNode).scaleX = 1;
            cc.find("bg_ex", inviteNode).x = -11;
            cc.find("lbl_msg", inviteNode).x = 27
            cc.find("lbl_msg", inviteNode).anchorX = 0
            // cc.find("lbl_msg", inviteNode).getComponent(cc.RichText).horizontalAlign = cc.macro.TextAlignment.LEFT;
            cc.find("roomid", inviteNode).x = 107
            cc.find("coin", inviteNode).x = 107
            // cc.find("btn_join", inviteNode).x = 587
            cc.find("icon_game", inviteNode).x = 104
            cc.find("userNodes", inviteNode).x = 457
        } else {
            // 邀请设置()
            inviteNode.x = 346;
            inviteNode.anchorX = 1;
            cc.find("bg", inviteNode).scaleX = -1;
            cc.find("bg", inviteNode).x = 8;
            cc.find("bg_ex", inviteNode).scaleX = -1;
            cc.find("bg_ex", inviteNode).x = 11;
            cc.find("lbl_msg", inviteNode).x = -27
            cc.find("lbl_msg", inviteNode).anchorX = 1
            // cc.find("lbl_msg", inviteNode).getComponent(cc.RichText).horizontalAlign = cc.macro.TextAlignment.RIGHT;
            cc.find("roomid", inviteNode).x = -107
            cc.find("coin", inviteNode).x = -107
            // cc.find("btn_join", inviteNode).x = -587
            cc.find("icon_game", inviteNode).x = -104
            cc.find("userNodes", inviteNode).x = -457
        }
        // 更新房间人数
        for (let i = 0; i < cc.find("userNodes", inviteNode).children.length; i++) {
            const userNode = cc.find("userNodes", inviteNode).children[i];
            userNode.active = i < data.seat;
            if (data.users[i]) {
                // cc.find("btn_join", userNode).active = false;
                cc.find("node_head", userNode).active = true;
                cc.find("label_name", userNode).active = true;
                let userInfo = data.users[i];
                cc.find("label_name", userNode).getComponent(cc.Label).string = userInfo.playername;
                cc.find("node_head", userNode).getComponent("HeadCmp").setHead(userInfo.uid, userInfo.avatar || userInfo.usericon);
                cc.find("node_head", userNode).getComponent("HeadCmp").setAvatarFrame(userInfo.avatarframe);
            } else {
                // cc.find("btn_join", userNode).active = true;
                cc.find("node_head", userNode).active = false;
                cc.find("label_name", userNode).active = false;
            }
        }
    }

    // 点击牌桌 加入游戏
    onClickDesk(event) {
        let data = this.data;
        // 请求加入房间
        cc.vv.NetManager.send({
            c: MsgId.FRIEND_ROOM_JOIN,
            deskid: data.deskid,
            gameid: data.gameid,
        }, true);
    }

}
