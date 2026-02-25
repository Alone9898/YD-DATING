// 登录语言选择框
cc.Class({
    extends: cc.Component,
    properties: {
        label: cc.Label,
        hitIcon: cc.Node,
        prefab: cc.Prefab,
    },

    onLoad() {
        // cc.log("languageCode: ", cc.sys.languageCode)
        this.updateView();
        let button = this.getComponent(cc.Button);
        if (button) {
            this.node.on("click", () => {
                cc.vv.PopupManager.addPopup(this.prefab, {
                    noMask: true,
                    onShow: (node) => {
                        if (cc.isValid(this.hitIcon)) {
                            this.hitIcon.angle = 180;
                        }
                        // 拿到世界坐标
                        let worldPos = this.node.convertToWorldSpaceAR(cc.v2(0, -this.node.height / 2 - 10));
                        let endPos = cc.find("Canvas").convertToNodeSpaceAR(worldPos);
                        node.position = endPos.add(cc.v2(0, 100));
                        node.opacity = 100;
                        cc.tween(node).to(0.1, { position: endPos, opacity: 255 }).call(() => {
                            let cpt = node.getComponent("LangBoxCpt");
                            if (cpt) {
                                cpt.initView(() => {
                                    this.updateView();
                                });
                            }
                            let SettingLangBoxCpt = node.getComponent("SettingLangBoxCpt");
                            if (SettingLangBoxCpt) {
                                SettingLangBoxCpt.initView();
                            }
                        }).start();
                    },
                });
            }, this)
        }
    },


    updateView() {
        if (cc.isValid(this.label.node)) {
            this.label.string = cc.vv.i18nManager.getConfig().name;
        }
        if (cc.isValid(this.hitIcon)) {
            this.hitIcon.angle = 0;
        }
    },


});
