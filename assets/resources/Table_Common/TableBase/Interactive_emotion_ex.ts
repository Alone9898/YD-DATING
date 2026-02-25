/**
 * 
 */
import { PBInteractiveCtrl } from "../../games/PokerBase/scripts/interactive_emoticons/PBInteractiveCtrl";
const {ccclass, property} = cc._decorator;

@ccclass
export default class Interactive_emotion_ex extends PBInteractiveCtrl {

    // @property(cc.Label)
    // label: cc.Label = null;

    // @property
    // text: string = 'hello';

    // // LIFE-CYCLE CALLBACKS:

    // // onLoad () {}

    // start () {

    // }

    // update (dt) {}

    getPlayerPos(uid, posKey) {
        let playInfo = this.getPlayer(uid)
        if(playInfo){
            if(playInfo.getGlobalPos){
                return this.getPlayer(uid).getGlobalPos(posKey)
            }
            else{
                let headNode = playInfo.node.getComponentInChildren("UserAvatar")
                if(headNode){
                    return headNode.node.convertToWorldSpaceAR(cc.v2(0, 0));
                }
                return  playInfo.node.convertToWorldSpaceAR(cc.v2(0, 0));
            }
            
        }
        else{
            let objNode = cc.vv.gameData.getObserveNode()
            if(objNode){
                return objNode.convertToWorldSpaceAR(cc.v2(0, 0));
            }
            return cc.v2(0,0)
        }
        
    }

    getPlayer(uid){
        let script = cc.vv.gameData.getScriptGame()
        if(script){
            let playlist = script._getPlayerListScript()
            if(playlist){
                let node_player = playlist.getPlayerNode(uid)
                if(node_player){ //是否是桌上的玩家
                    return node_player.getComponent("Table_Player_Base")
                }
                else{
                    let bMySelf = cc.vv.UserManager.isMySelf(uid)
                    if(bMySelf){
                        //是否是我自己
                        let node_player = cc.vv.gameData.getMyNode()
                        if(node_player){
                            return node_player.getComponent("Table_Player_Base")
                        }
                    }
                    else{
                        //是否是观众列表
                    }
                }
                
            }
        }
        // return facade.playersCtrl.getPlayerByUid(uid)
    }

    playEmotionSound(url){
        let logic = cc.find("Canvas").getComponent("Table_Logic_Base")
        if(logic && logic.soundMgr){
            logic.soundMgr.playBaseEffect(url);
        }
        
    }
}
