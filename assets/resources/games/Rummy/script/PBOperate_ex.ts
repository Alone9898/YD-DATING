/**
 * 邀请按钮
 */
import { PBOperate } from "../../PokerBase/scripts/operate/PBOperate";
const {ccclass, property} = cc._decorator;

@ccclass
export default class PBOperate_ex extends PBOperate {


    sendReadyReq(){
        // 
        cc.vv.gameData.sendReadyReq()
    }

    sendChangeReq(){
        // facade.dm.msgWriter.sendChange();
    }

    isWatcher(){
        // return facade.dm.tableInfo.isViewer === 1
        return false
    }

    showInviteNode(){
        cc.vv.PopupManager.addPopup("BalootClient/GameInvite/CafeGameInvite", { noMask: true, opacityIn: true, noCloseHit: true ,onShow:(node) => {
            let gameid = cc.vv.gameData.getGameId()
            let tableid = cc.vv.gameData.getTableId()
            let pwd = cc.vv.gameData.getTablePwd()
            node.getComponent("CafeGameInvite").setInviteInfo(gameid,tableid,pwd)
        }});
    }
    
}
