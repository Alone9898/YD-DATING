import {PBOperate} from "../../PokerBase/scripts/operate/PBOperate";
import {BlackJack21PlayerState} from "./BlackJack21_CommonData";
import {getPBCardVal} from "../../PokerBase/scripts/card/PBCardData";

const {ccclass, property} = cc._decorator;

@ccclass
export default class BlackJack21Operate extends PBOperate {

    // LIFE-CYCLE CALLBACKS:
    @property(cc.Node)
    minBtn: cc.Node = null;
    @property(cc.Node)
    maxBtn: cc.Node = null;
    @property(cc.Node)
    raiseBtn: cc.Node = null;
    @property(cc.Node)
    splitBtn: cc.Node = null;
    @property(cc.Node)
    doubleBtn: cc.Node = null;
    @property(cc.Node)
    standBtn: cc.Node = null;
    @property(cc.Node)
    hitBtn: cc.Node = null;
    @property(cc.Node)
    dontBtn: cc.Node = null;
    @property(cc.Node)
    insuranceBtn: cc.Node = null;

    @property(cc.Node)
    betPanel: cc.Node = null;
    @property(cc.Slider)
    betSlider: cc.Slider = null;
    @property(cc.Label)
    betCntLbl: cc.Label = null;

    minBet:number;
    maxBet:number;
    listBet:number;
    _sliderBet:number;

    canClick:boolean;   // 防止重复点击

    // @property(cc.Button)
    // changeBtn:cc.Button = null;


    onLoad() {
        super.onLoad();

        this.showChangeBtn(false);
        this.setBtnEvent();
        this.hideAllOprBtn()
    }

    setBtnEvent(){
        this.canClick = false;
        this.minBtn.active = false;
        this.minBtn.on("click", () => {
            if(!this.canClick){
                return
            }
            // facade.soundMgr.playEffect("click");
            this.canClick = false;
            facade.dm.msgWriter.sendBet(this.minBet);
        }, this);

        this.maxBtn.active = false;
        this.maxBtn.on("click", () => {
            if(!this.canClick){
                return
            }
            // facade.soundMgr.playEffect("click");
            this.canClick = false;
            facade.dm.msgWriter.sendBet(this.maxBet);
        }, this);

        // 打开加注面板
        this.raiseBtn.on(cc.Node.EventType.TOUCH_START, this.onTouchAddStart, this);
        this.raiseBtn.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchAddMove, this);
        this.raiseBtn.on(cc.Node.EventType.TOUCH_END, this.onTouchAddEnd, this);
        this.raiseBtn.on(cc.Node.EventType.TOUCH_CANCEL, this.onTouchAddEnd, this);

        this.splitBtn.active = false;
        this.splitBtn.on("click", () => {
            if(!this.canClick){
                return
            }
            // facade.soundMgr.playEffect("click");
            this.canClick = false;
            facade.dm.msgWriter.sendSplit();
        }, this);

        this.doubleBtn.active = false;
        this.doubleBtn.on("click", () => {
            if(!this.canClick){
                return
            }
            // facade.soundMgr.playEffect("click");
            this.canClick = false;
            facade.dm.msgWriter.sendDouble();
        }, this);

        this.standBtn.active = false;
        this.standBtn.on("click", () => {
            if(!this.canClick){
                return
            }
            // facade.soundMgr.playEffect("click");
            this.canClick = false;
            facade.dm.msgWriter.sendStand();
        }, this);

        this.hitBtn.active = false;
        this.hitBtn.on("click", () => {
            if(!this.canClick){
                return
            }
            // facade.soundMgr.playEffect("click");
            this.canClick = false;
            facade.dm.msgWriter.sendHit();
        }, this);

        this.dontBtn.active = false;
        this.dontBtn.on("click", () => {
            if(!this.canClick){
                return
            }
            // facade.soundMgr.playEffect("click");
            this.canClick = false;
            facade.dm.msgWriter.sendDont();
        }, this);

        this.insuranceBtn.active = false;
        this.insuranceBtn.on("click", () => {
            if(!this.canClick){
                return
            }
            // facade.soundMgr.playEffect("click");
            this.canClick = false;
            facade.dm.msgWriter.sendInsurance();
        }, this);

        // this.changeBtn.node.on("click", ()=>{
        //     this.changeBtn.interactable = false;
        //     facade.dm.msgWriter.sendChange();
        //     console.log("======**====换桌")
        // }, this)
    }

    cleanRound(){
        this.hideAllOprBtn();
        this.showChangeBtn(false);
        this.reset();
    }

    onTouchAddStart(event: cc.Event.EventTouch) {
        this.betPanel.active = true;
        this.betSlider.progress = 0;
        this.betSliderChange();
    }
    onTouchAddMove(event: cc.Event.EventTouch) {
        // 计算移动的位置
        let toMove = event.getLocation().sub(event.getStartLocation());
        // 设置进度条
        if (toMove.y < -200) {
            this.betPanel.active = false;
        } else {
            this.betPanel.active = true;
            let progress = Math.min(toMove.y / this.betPanel.height, 1);
            progress = Math.max(progress, 0);
            this.betSlider.progress = progress;
            this.betSliderChange();
        }
    }
    onTouchAddEnd(event: cc.Event.EventTouch) {
        this.betPanel.active = false;
        // 计算移动的位置
        let toMove = event.getLocation().sub(event.getStartLocation());
        // 设置进度条
        if (toMove.y >= -200) {
            // 进行下注
            // cc.vv.NetManager.send({ c: CMD.PLAYER_BET, coin: this.selectBet, isall: this.selectBet == this.max ? 1 : 0 });

            facade.dm.msgWriter.sendBet(this._sliderBet);
        }
    }

    betSliderChange(){
        // this.confirmBetBtn.node.active = true;
        this._sliderBet = Math.floor((this.maxBet - this.minBet) * this.betSlider.progress + this.minBet);
        this.betCntLbl.string = "" + this._sliderBet;
        // this.betSliderLight.height = this.betSlider.node.height * this.betSlider.progress;
    }

    setBtnCnt(minbet, maxbet, betlist){
        console.log("facade.dm.playersDm.selfInfo:",facade.dm.playersDm.selfInfo)
        console.log("facade.dm.playersDm:",facade.dm.playersDm)
        let selfCoin = facade.dm.playersDm.selfInfo.coin;

        this.minBet = minbet;
        this.maxBet = Math.min(maxbet, selfCoin);
        this.listBet = betlist;

        cc.find("Background/number", this.minBtn).getComponent(cc.Label).string = Global.FormatNumToComma(this.minBet);
        cc.find("Background/number", this.maxBtn).getComponent(cc.Label).string = Global.FormatNumToComma(this.maxBet);

        // cc.find("Slider/cntMin/lbl", this.betPanel).getComponent(cc.Label).string = Global.FormatNumToComma(this.minBet);
        cc.find("Slider/cntMax/lbl", this.betPanel).getComponent(cc.Label).string = Global.FormatNumToComma(this.maxBet);

        this.betCntLbl.string = Global.FormatNumToComma(minbet);
    }

    setBtnClick(btn, bClick){
        btn.getComponent(cc.Button).interactable = bClick;
        cc.find("Background/mask", btn).active = !bClick;
    }

    // showChangeBtn(bShow){
    //     this.changeBtn.node.active = bShow;
    //     this.changeBtn.interactable = bShow;
    // }

    // 关闭
    close() {
        this.node.active = false;
    }

    _indexTime: number = 0;
    set indexTime(val){
        this._indexTime = val
    }
    get indexTime(){
        return this._indexTime
    }
    oprTime: number = 0;

    // timeMask: cc.Sprite = null;
    //
    // // 倒计时处理
    // protected update(dt: number): void {
    //     if (this.indexTime > 0) {
    //         this.indexTime -= dt;
    //         this.timeMask.fillRange = this.indexTime / this.oprTime;
    //         if (this.indexTime <= 0) {
    //             // if (this.seatCpt) this.seatCpt.isOpr = false;
    //             this.hideAllOprBtn();
    //         }
    //     }
    // }

    hideAllOprBtn(){
        let panel = cc.find("operate_panel", this.node);
        panel.children.forEach(node=>{
            node.active = false;
        })
    }

    // 更新操作面板
    updateOprView(state, oprTime = 0, animation = false) {
        this.hideAllOprBtn();

        let player = facade.playersCtrl.getPlayerByPosition(0);
        let cards = player.handCardCtrl.cardData;
        let activeTile = player.handCardCtrl.activeTile;
        let selfCoin = player.playerInfoVo.coin;
        let betCoin = player.betCoin;

        let showNodeList = [];
        if(state == BlackJack21PlayerState.Bet){
            showNodeList.push(this.minBtn);
            showNodeList.push(this.raiseBtn);
            showNodeList.push(this.maxBtn);
            // this.timeMask = cc.find("Background/mask", this.minBtn).getComponent(cc.Sprite);
        }
        else if(state == BlackJack21PlayerState.Insurance){
            showNodeList.push(this.dontBtn);

            if(selfCoin >= betCoin/2){
                showNodeList.push(this.insuranceBtn);
            } else {
                // showNodeList.push(null);
            }
            // this.timeMask = cc.find("Background/mask", this.dontBtn).getComponent(cc.Sprite);
        }
        else if(state == BlackJack21PlayerState.Play){

            showNodeList.push(this.standBtn);

            if(selfCoin < betCoin){ // 钱不够
                // showNodeList.push(null)
            } else if(cards[activeTile-1].length > 2){     // 手牌>2张
                // showNodeList.push(null)
            } else if(cards.length > 1) {   // 已分牌
                // showNodeList.push(null)
            } else {
                let cardValue1 = getPBCardVal(cards[0][0]);
                let cardValue2 = getPBCardVal(cards[0][1]);
                if(cardValue1 == cardValue2 ||
                    ((cardValue1 >= 10 && cardValue1 <= 13) && (cardValue2 >= 10 && cardValue2 <= 13))){    // 牌值相等
                    showNodeList.push(this.splitBtn);
                } else {
                    // showNodeList.push(null)
                }
            }

            if(cards[activeTile-1].length <= 2 && selfCoin >= betCoin){
                cc.find("Background/number", this.doubleBtn).getComponent(cc.Label).string = Global.FormatNumToComma(betCoin);
                showNodeList.push(this.doubleBtn);
            }

            showNodeList.push(this.hitBtn);
            // this.timeMask = cc.find("Background/mask", this.standBtn).getComponent(cc.Sprite);
        } else {
            this.hideAllOprBtn();
            // player.isOpr = false;
            return;
        }
        this.canClick = true;

        // 位置配置
        let showPosCfg = {
            [0]: [],
            [1]: [cc.v3(0, 0)],
            [2]: [cc.v3(-120, 0), cc.v3(120, 0)],
            [3]: [cc.v3(-260, -47), cc.v3(0, 0), cc.v3(260, -47)],
            [4]: [cc.v3(-300, -47), cc.v3(-100, 0), cc.v3(100, 0), cc.v3(300, -47)],
        }

        // 是否需要动画
        if (animation) {
            // 设置按钮位置
            for (let i = 0; i < showNodeList.length; i++) {
                const btnNode = showNodeList[i];
                if(btnNode){
                    btnNode.active = true;
                    btnNode.position = cc.v3();
                    btnNode.opacity = 0;
                    btnNode.stopAllActions();
                    cc.tween(btnNode).to(0.1, { position: showPosCfg[showNodeList.length][i], opacity: 255 }).start();
                }
            }
        } else {
            // 设置按钮位置
            for (let i = 0; i < showNodeList.length; i++) {
                const btnNode = showNodeList[i];
                if(btnNode){
                    btnNode.active = true;
                    btnNode.stopAllActions();
                    btnNode.position = showPosCfg[showNodeList.length][i];
                    btnNode.opacity = 255;
                }
            }
        }
        // if (oprTime > 0) {
        //     player.isOpr = showNodeList.length > 0;
        //
        //     this.timeMask.node.active = true
        //     this.timeMask.fillRange = 1;
        //     cc.tween(this.timeMask).to(oprTime, { fillRange: 0 }).start();
        // }

    }
}
