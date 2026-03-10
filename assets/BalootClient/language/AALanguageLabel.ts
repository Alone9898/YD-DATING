
const { ccclass, property } = cc._decorator;
@ccclass
export default class AALanguageLabel extends cc.Component {
    @property({ type: cc.String })
    private dataID: string = "";
    // LIFE-CYCLE CALLBACKS:
    private _needUpdate: boolean = false;
    // onLoad () {}
    onLoad() {
        this._needUpdate = true;
    }
    get dataIDS(): string {
        return this.dataID || "";
    }
    set dataIDS(value: string) {
        this.dataID = value;
        this._needUpdate = true;
    }
    update(dt: number): void {
        if (this._needUpdate) {
            this.updateContent();
            this._needUpdate = false;
        }
    }
    updateContent() {
        const label = this.getComponent(cc.Label);
        const richtext = this.getComponent(cc.RichText);
        if (label) {
            label.string = this.getLangByID(this.dataIDS);
        }
        else if (richtext) {
            richtext.string = this.getLangByID(this.dataIDS);
        }
    }
    getLangByID(labId: string): string {
        try {
            const excelObj = cc.vv.LanguageData.language.get("Excel");
            if (!excelObj || !excelObj[labId]) return "";
            const lang = cc.vv.LanguageData.current || "en";
            return excelObj[labId][lang] || labId;
        } catch (error) {
            console.log(cc.vv.LanguageData.current + '-' + labId);
        }
        return labId;
    }
}
