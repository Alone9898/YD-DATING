/**
 * delphi playerctrl
 */

import { PBPlayersCtrl } from "../../PokerBase/scripts/player/PBPlayersCtrl";

const {ccclass, property} = cc._decorator;

@ccclass
export default class DelphiPlayerCtrl extends PBPlayersCtrl {

    // @property(cc.Label)
    // label: cc.Label = null;

    // @property
    // text: string = 'hello';

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    // start () {

    // }

    /**
     * 玩家站起来. 
     * 重写目的：站起来后，不立马清理数据，待结算完再清理，此处只是打一个离开标签
     */
    standUp(position: number){
        let p = this.getPlayerByPosition(position);
        if (p) {
            p.setPlayerStandup(true)
            // p.playerInfoVo = null;
            p.left();
            
        }
    }

    hideAllEmptySeat(){
        this.activePlayers.forEach(p => {
            if (p) {
                if (!p.playerInfoVo) {
                    this.showEmptySeat(p.uiIndex, false);
                }
                else{
                    //如果是已经离座的玩家也需要清理掉
                    let bStandup = p.getPlayerStandup()
                    if(bStandup){
                        
                        p.playerInfoVo = null
                        p.show()
                        this.showEmptySeat(p.uiIndex, false);
                    }
                }
            }
        })
    }

    // update (dt) {}
}
