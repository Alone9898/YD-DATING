
import { PBInteractiveEmotionPanel } from "../../games/PokerBase/scripts/interactive_emoticons/PBInteractiveEmotionPanel";
import { PBPostCmd } from "../../games/PokerBase/scripts/net/PBMsgCmd";
const {ccclass, property} = cc._decorator;

@ccclass
export default class PBInteractiveEmotionPanel_ex extends PBInteractiveEmotionPanel {

    // @property(cc.Label)
    // label: cc.Label = null;

    // @property
    // text: string = 'hello';

    // // LIFE-CYCLE CALLBACKS:

    // // onLoad () {}

    // start () {

    // }

    // update (dt) {}

    _reqCharmInfo(){
        cc.vv.NetManager.send({
            c: PBPostCmd.QUERY_TIMES_EMOTION_INFO,
            uid: cc.vv.UserManager.uid
        }, true);
    }

    //获取玩家信息
    getPlayerInfo(uid){
         
        // return facade.dm.playersDm.getPlayerByUid(uid)
        let info = cc.vv.gameData.getPlayByUid(uid)
        if(info){
            info.uinfo = info.uinfo || {}
            info.uinfo.icon = info.usericon
            info.uinfo.gender = 1
            info.uinfo.uname = info.playername
        }
        
        return info
    }

    getTableInfo(){
        // return facade.dm.tableInfo
        return cc.vv.gameData.getDeskInfo()
    }

    getMyInfo(){
        // return facade.dm.playersDm.selfAbsInfo
        let myInfo = cc.vv.gameData.getMyInfo()
        myInfo.isSeated = true
        return myInfo
    }

    sendChatMsg(type,param){
        let logic = cc.find("Canvas").getComponent("Table_Logic_Base")
        logic.sendRetransmissionMsg(type, JSON.stringify(param));
    }
}
