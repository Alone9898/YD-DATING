/**
 * 飘字提示框
 */
cc.Class({
    extends: require("FloatTip"),

    show: function (tips, isTop, color) {
        if (this._tips === tips) return;
        this._tips = tips
        if (this._floatTipPrefab) {
            let node = null;
            if (isTop) {
                for (let i = 0; i < this._topList.length; ++i) {
                    if (!this._topList[i].active) {
                        node = this._topList[i];
                        break;
                    }
                }
            } else {

                for (let i = 0; i < this._list.length; ++i) {
                    if (!this._list[i].active) {
                        node = this._list[i];

                        if (!cc.isValid(node, true)) this._list.splice(i, 1)

                        break;
                    }
                }
            }
            if (node === null || !cc.isValid(node, true)) {
                node = cc.instantiate(this._floatTipPrefab);
                if (isTop) this._topList.push(node);
                else this._list.push(node);
            }
            if (isTop) {
                if (node.parent === null) cc.game.addPersistRootNode(node);
                let canvas = cc.find("Canvas");
                let size = canvas.getComponent(cc.Canvas).designResolution;
                node.position = cc.v2(size.width / 2, size.height / 2);
            } else {
                let canvas = cc.find("Canvas");
                if (cc.isValid(canvas, true)) {
                    node.parent = canvas;
                    node.position = cc.v2(0, 0);
                }
            }
            node.zIndex = Global.CONST_NUM.HIGHT_ZORDER;
            node.active = true;

            tips = tips + "";
            if (tips && typeof (tips) == 'string') {
                let content = cc.find("spr_bg/lbl_content", node).getComponent(cc.RichText);
                content.string = `<b>${tips}</b>`;
                // 添加自动适应大小 TODO
                // cc.log(content.node.width, content.node.height);
                if (content.node.width > 800) {
                    content.maxWidth = 800;
                }
                if (color) {
                    content.node.color = color;
                } else {
                    content.node.color = cc.Color.WHITE;
                }
            }
            var anim = node.getChildByName("spr_bg").getComponent(cc.Animation);
            if (anim) {
                anim.play('FloatTipMoveAndFade');
                anim.on("stop", () => {
                    node.active = false;
                    this._tips = "";
                });
            }
            else {
                node.runAction(cc.sequence(cc.delayTime(1.0), cc.callFunc(() => {
                    node.active = false;
                    this._tips = "";
                })))
            }
        }
    },
});
