import { CDButtonProxy } from "../../../../BalootClient/game_common/common_cmp/CDButtonProxy";

const { ccclass, property } = cc._decorator;

@ccclass
export default class DebugPanel extends cc.Component {
    static PREFAB_PATH: string = "games/PokerBase/prefabs/debug_panel";
    @property(cc.Node)
    panel:cc.Node = null;
    @property(cc.ScrollView)
    sv:cc.ScrollView = null;
    @property(cc.Node)
    content_item:cc.Node = null;
    @property(cc.EditBox)
    editBox:cc.EditBox = null;
    @property(CDButtonProxy)
    btn_clean: CDButtonProxy = null;
    @property(CDButtonProxy)
    btn_exe: CDButtonProxy = null;
    @property(cc.Toggle)
    btn_switch:cc.Toggle = null;
    onLoad() {
        this.btn_switch.node.on("toggle", ()=>{
            this.panel.active = this.btn_switch.isChecked;
        })

        this.btn_clean.addClickHandler(()=>{
            this.clean();
        })

        this.btn_exe.addClickHandler(()=>{
            this.exeCmd();
        });
    }

    protected start(): void {
        let popMgr = cc.vv.PopupManager;
        // @ts-ignore
        if(popMgr.maskLayer) {
            // @ts-ignore
            popMgr.maskLayer.active = false;
        }
        // @ts-ignore
        if(popMgr.touchLayer) {
            // @ts-ignore
            popMgr.touchLayer.active = false;
        }
    }

    exeCmd() {
        let cmdStr = this.editBox.string.trim();
        if(!cmdStr) {
            return;
        }
        if(cmdStr == "close") {
            this.close();
            return;
        }else if(cmdStr == "clean") {
            this.clean()
            return;
        }
        try {
            let exeResult = eval(cmdStr);
            this.addAlog(exeResult)
        } catch (error) {
            this.addAlog(error.toString());
        }
    }

    addAlog(data:any) {
        let log = "";
        switch (typeof data) {
            case 'number':
            case 'string':
                log = data.toString();
                break;
            case 'object':
                log = JSON.stringify(data);
                break;
            default:
                break;
        }
        let item = cc.instantiate(this.content_item);
        item.active = true;
        item.parent = this.sv.content;
        item.getComponent(cc.Label).string = log;
        item.on(cc.Node.EventType.TOUCH_END, ()=>{
            cc.vv.PlatformApiMgr.Copy()
            cc.vv.FloatTip.show("消息复制成功");
        })
    }

    clean() {
        this.sv.content.removeAllChildren();
    }

    close() {
        cc.vv.PopupManager.removePopup(this.node)
    }
}
