import RuleViewCpt from "./RuleViewCpt";

const { ccclass, property, menu, requireComponent } = cc._decorator;

@ccclass
@menu("Web规则按钮")
@requireComponent(cc.Button)
export default class RuleBtnCpt extends cc.Component {
    @property
    key = "";
    @property
    height = 1148;

    onLoad() {
        let button = this.node.getComponent(cc.Button)
        if (button) {
            this.node.on('click', this.onClick, this);
        }
    }

    onClick() {
        if (!this.key) return;
        let lanConfig = cc.vv.i18nManager.getConfig();
        let URL = `https://inter.sekiengame.com/fb/ruleimg/${this.key}_${lanConfig.lang}.png`;
        cc.vv.PopupManager.addPopup("BalootClient/BaseRes/prefabs/PopupRuleCommon", {
            scaleIn: true,
            onShow: (node) => {
                node.getComponent(RuleViewCpt).onInit(URL, {
                    height: this.height,
                });
            }
        });
    }

}
