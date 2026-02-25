import {PBPlayer} from "../../../PokerBase/scripts/player/PBPlayer";
import BlackJack21HandCardCtrl from "../card/BlackJack21_HandCardCtrl";
import BlackJack21JettonCtrl from "../jetton/BlackJack21_JettonCtrl";
import BlackJack21UserInfoCmp from "./BlackJack21_UserInfoCmp";
import {facade} from "../../../PokerBase/scripts/PBLogic";

const {ccclass, property} = cc._decorator;

@ccclass
export default class BlackJack21Player extends PBPlayer {
    _userInfoCmp:BlackJack21UserInfoCmp = null;
    handCardCtrl:BlackJack21HandCardCtrl = null;
    jettonCtrl:BlackJack21JettonCtrl = null;

    _bSplit:boolean=false;
    _betCoin:number=0;  // 每局押注金额

    set bSplit(bSplit:boolean){
        this._bSplit = bSplit
    }
    get bSplit():boolean{
        return this._bSplit
    }
    set betCoin(betcoin:number){
        this._betCoin = betcoin
    }
    get betCoin():number{
        return this._betCoin
    }

    _order:number = 0;
    set order(order){
        this._order = order;
    }
    get order(){
        return this._order;
    }

    // _isOpr:false;
    // set isOpr(val){
    //     this._isOpr = val;
    //     this._userInfoCmp.node.active = !val;
    //     this.showSeatId(val?false:this.order);
    // }
    // get isOpr(){
    //     return this._isOpr
    // }

    onLoad() {
        super.onLoad()
        this.showSeatId(false);
    }

    loadVoiceToggle(){
        return null
    }

    show() {
        if (this.playerInfoVo) {
            this.node.active = true;
            this._userInfoCmp.show(this.playerInfoVo);
            // this.voiceToggle.init(this.playerInfoVo.uid);
            // this.voiceToggle.updateView();
        } else {
            this.node.active = false;
            this._userInfoCmp.showReadyTip(false);
            this.showSeatId(false);
        }
    }

    showSeatId(order){
        let seatNode = cc.find("seat_node", this.node);
        seatNode.active = order;
        if(order){
            this.order = order;
            seatNode.active = true;
            seatNode.getChildByName("lbl").getComponent(cc.Label).string = ""+order;
        }
    }

    playAddCoin(addcoin){
        this._userInfoCmp.playAddCoin(addcoin)
    }

    hideAvatarName(bHide){
        this._userInfoCmp.hideAvatarName(bHide);
    }

    showWather(bShow){
        this._userInfoCmp.showWather(bShow);
    }

    getNeedChangeChatBubbleUIIndex(){
        return []
    }

    // /**
    //  * 监听事件
    //  */
    // addEvent() {
    //     cc.find("user_info_node/head_icon", this.node).on(cc.Node.EventType.TOUCH_END, () => {
    //         // if (this.playerInfoVo == facade.dm.playersDm.selfInfo) {
    //         //     return;
    //         // }
    //         // cc.vv.EventManager.emit("EVENT_BTN_CLICK_SOUNDS");
    //         // facade.interactiveEmotionCtrl.openEmotionPanel(this.playerInfoVo.uid);
    //     }, this);
    // }
}
