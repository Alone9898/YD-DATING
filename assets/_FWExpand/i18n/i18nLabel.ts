import { Golf } from "../../framework/script/language/ChineseCfg";
import { i18nManager } from "./i18nManager";
const { ccclass, property, executeInEditMode, disallowMultiple, requireComponent, menu } = cc._decorator;

@ccclass
@executeInEditMode
@requireComponent(cc.Label)
@disallowMultiple
@menu("多语言/i18nLabel")
export class i18nLabel extends cc.Component {

    @property({ visible: false })
    private _srcKey: string = "";

    onLoad() {
        // i18nManager.addOrDelLabel(this, true);
        i18nManager.register(this);
        if (!this._srcKey) {
            this._srcKey = this.getComponent(cc.Label).string;
        }
        this.updateView();
    }

    @property({ type: cc.String, multiline: true })
    get string() {
        return this._srcKey;
    }

    set string(value: string) {
        this._srcKey = value;
        let label = this.getComponent(cc.Label);
        if (!Global.noI18n && cc.isValid(label)) {
            label.string = i18nManager.getLabel(value);
        }
    }

    updateView() {
        this.string = this._srcKey;
    }

    // updateView() {
    //     this.string = this._srcKey;
    // }

    onDestroy() {
        // i18nManager.addOrDelLabel(this, false);
        i18nManager.unregister(this);
    }
}

