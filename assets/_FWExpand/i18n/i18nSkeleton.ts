import { i18nManager } from "./i18nManager";
const { ccclass, property, executeInEditMode, disallowMultiple, requireComponent, menu } = cc._decorator;

@ccclass
@executeInEditMode
@requireComponent(sp.Skeleton)
@disallowMultiple
@menu("多语言/i18nSkeleton")
export class i18nSkeleton extends cc.Component {
    ske: sp.Skeleton;

    onLoad() {
        i18nManager.register(this);
        this.ske = this.getComponent(sp.Skeleton);
        this.updateView();
    }

    onDestroy() {
        i18nManager.unregister(this);
    }

    updateView() {
        let langStr = i18nManager.getConfig().lang;
        let tempStr = langStr[0].toUpperCase() + langStr.substr(1)
        if (this.ske && cc.isValid(this.ske)) {
            this.ske.setSkin(tempStr);
        }
    }
}
