
cc.Class({
    extends: cc.Component,

    properties: {
        gameBtnPrefab: cc.Prefab,
    },

    onLoad() {
        if (Global.isDurakApp()) {
            this.showDurakGameList()
        }
    },

    showDurakGameList () {
        let content = cc.find("view/content/content", this.node)
        //隐藏原有游戏列表
        let hideItems = ["btn_hall_game_265", "HallGameBtn", "btn_hall_game_poker"]
        for (let i=0; i<hideItems.length; i++) {
            let node = cc.find(hideItems[i], content)
            if (node) {
                node.active = false
            }
        }
        //增加durak有戏入口
        let durakGameIds = [278,277,276,275,274]
        for (let i=0; i<durakGameIds.length; i++) {
            let item = cc.instantiate(this.gameBtnPrefab)
            item.parent = content
            item.setSiblingIndex(0)
            item.getComponent("RoomTypeBtn").gameid = durakGameIds[i];
            item.getComponent("RoomTypeBtn").updateView();
        }
        //屏蔽share
        let share = cc.find("view/content/share", this.node)
        if (share) share.active = false
    },

});
