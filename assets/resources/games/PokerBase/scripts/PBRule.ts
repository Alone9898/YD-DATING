import { CommonStyle } from "../../../../BalootClient/game_common/CommonStyle";

const { ccclass, property } = cc._decorator;

@ccclass
export class PBRule extends cc.Component {
    @property(cc.Node)
    bg: cc.Node = null;
    @property(cc.Node)
    panel: cc.Node = null;
    @property(cc.Button)
    closeBtn: cc.Button = null;
    @property(cc.ToggleContainer)
    tabContainer: cc.ToggleContainer = null;
    @property([cc.Node])
    pages: cc.Node[] = [];

    _tabs: cc.Toggle[] = null;

    onLoad() {
        this.bg.active = false;
        let btn = this.bg.getComponent(cc.Button)
        if (!btn) {
            this.bg.addComponent(cc.Button)

        }
        this.bg.on("click", () => {
            this.close();
        })
        this.panel.active = false;
        let blockcmp = this.panel.getComponent(cc.BlockInputEvents)
        if (!blockcmp) {
            this.panel.addComponent(cc.BlockInputEvents)
        }
        this._tabs = this.tabContainer.toggleItems;
        this._tabs.forEach((v, i) => {
            v.node.on("toggle", () => {
                this.onTab(i)
            });
        })

        this.closeBtn.node.on("click", () => {
            this.close();
        })
    }

    onTab(index: number) {
        this.pages.forEach(p => {
            p.active = false;
        })
        this.pages[index].active = true;
    }

    open() {
        this.bg.active = true;
        CommonStyle.fastShow(this.panel);
        this.onTab(0);
        this._tabs[0].check();
    }

    close() {
        this.bg.active = false;
        CommonStyle.fastHide(this.panel);
    }
}