import { PBMenu } from "../../../PokerBase/scripts/widgetplus/PBMenu";
import { CommonStyle } from "../../../../../BalootClient/game_common/CommonStyle";

const {ccclass, property} = cc._decorator;

@ccclass
export default class LudoMasterRule extends PBMenu {


    onLoad () {
        super.onLoad()
        this.btnHelp.node.active = false
    }

    start () {

    }

    close() {
        this.close_layer && (this.close_layer.active = false);
        CommonStyle.fastHide(this.menu_btns_node);
        this.btnHelp.node.active = false;
    }

    open() {
        this.close_layer && (this.close_layer.active = true);
        CommonStyle.fastShow(this.menu_btns_node);
        this.btnHelp.node.active = false;
    }

    // update (dt) {}
}
