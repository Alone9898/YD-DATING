import DelphiSeatCpt from "./DelphiSeatCpt";

const { ccclass, property } = cc._decorator;

let CMD = {
    PLAYER_BET: 25735,  // 下注
    PLAYER_PACK: 25740,  // 弃牌
    PLAYER_CHECK: 25742,  // 过牌
}

@ccclass
export default class DelphiRoundOprCpt extends cc.Component {
    @property(cc.Node)
    btn1Node: cc.Node = null;
    @property(cc.Node)
    btn2Node: cc.Node = null;
    @property(cc.Node)
    btn3Node: cc.Node = null;
    @property(cc.Node)
    btnPackedNode: cc.Node = null;
    @property(cc.Node)
    btnCheckNode: cc.Node = null;
    @property(cc.Node)
    btnAddNode: cc.Node = null;
    @property(cc.Node)
    prePackedNode: cc.Node = null;
    @property(cc.Node)
    preCheckNode: cc.Node = null;
    @property(cc.Sprite)
    timeMask: cc.Sprite = null;
    @property(cc.Node)
    sliderBetNode: cc.Node = null;
    @property(cc.Slider)
    progressSlider: cc.Slider = null;
    @property(cc.Label)
    maxBetLabel: cc.Label = null;
    @property(cc.Label)
    curBetLabel: cc.Label = null;
    @property(cc.SpriteAtlas)
    textureOpr: cc.SpriteAtlas = null;

    selfCoin: number = 0;
    riseCoin: number = 0;
    preOprAction: number = 0;
    potBet: number = 0;
    max: number = 0;
    min: number = 0;
    selectBet: number = 0;
    oprTime: number = 0;
    // indexTime: number = 0;
    seatCpt: DelphiSeatCpt;
    pot3_3: number;
    pot2_3: number;
    pot1_3: number;
    lastRiseCoin: number = 0;

    init() {
        // 弃牌
        this.btnPackedNode.on("click", this.onClickPacked, this);
        // 看牌
        this.btnCheckNode.on("click", this.onClickCheck, this);
        // 1/3
        this.btn1Node.on("click", () => {
            cc.vv.NetManager.send({ c: CMD.PLAYER_BET, coin: this.pot1_3, isall: 0 });
        })
        // 2/3
        this.btn2Node.on("click", () => {
            cc.vv.NetManager.send({ c: CMD.PLAYER_BET, coin: this.pot2_3, isall: 0 });
        })
        // pot
        this.btn3Node.on("click", () => {
            cc.vv.NetManager.send({ c: CMD.PLAYER_BET, coin: this.pot3_3, isall: 0 });
        })
        // 预操作1
        this.prePackedNode.on("click", () => {
            this.preOprAction = this.preOprAction == 1 ? 0 : 1;
            this.updatePreOprView();
        })
        // 预操作2
        this.preCheckNode.on("click", () => {
            this.preOprAction = this.preOprAction == 2 ? 0 : 2;
            this.updatePreOprView();
        })
        // 打开加注面板
        this.btnAddNode.on(cc.Node.EventType.TOUCH_START, this.onTouchAddStart, this);
        this.btnAddNode.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchAddMove, this);
        this.btnAddNode.on(cc.Node.EventType.TOUCH_END, this.onTouchAddEnd, this);
        this.btnAddNode.on(cc.Node.EventType.TOUCH_CANCEL, this.onTouchAddEnd, this);
        // 记录所有操作按钮的位置
        this.markNodePos(this.btnPackedNode);
        this.markNodePos(this.btnCheckNode);
        this.markNodePos(this.btnAddNode);
        this.markNodePos(this.btn1Node);
        this.markNodePos(this.btn2Node);
        this.markNodePos(this.btn3Node);
        this.markNodePos(this.prePackedNode);
        this.markNodePos(this.preCheckNode);
    }
    // 记录按钮初始位置
    markNodePos(node: cc.Node) {
        node["init_pos"] = node.position;
    }
    // 显示操作按钮动作
    showOprNode(node: cc.Node, pos?) {
        node.stopAllActions();
        node.position = cc.v3();
        node.opacity = 0;
        node.active = true;
        let endPos = pos || node["init_pos"];
        cc.tween(node).to(0.15, { position: endPos, opacity: 255 }).start();
    }
    // 打开操作面板
    open(toMe, needCoin, selfCoin, bindCoin, userBetCoin?, userCurrBet?, seatCpt?, oprTime?) {
        // 关闭所有操作按钮
        this.btnPackedNode.active = false;
        this.btnCheckNode.active = false;
        this.btnAddNode.active = false;
        this.btn1Node.active = false;
        this.btn2Node.active = false;
        this.btn3Node.active = false;
        this.prePackedNode.active = false;
        this.preCheckNode.active = false;

        this.sliderBetNode.active = false;
        this.node.active = true;

        this.selfCoin = selfCoin;
        this.riseCoin = 0;
        this.seatCpt = seatCpt;

        if (toMe) {
            // 计算pot
            this.potBet = userBetCoin + userCurrBet + needCoin + userCurrBet;
            this.pot3_3 = Math.floor(this.potBet);
            this.pot2_3 = Math.floor(this.potBet / 3 * 2);
            this.pot1_3 = Math.floor(this.potBet / 3 * 1);
            cc.find("label", this.btn1Node).getComponent(cc.Label).string = Global.FormatNumToComma(this.pot1_3);
            cc.find("label", this.btn2Node).getComponent(cc.Label).string = Global.FormatNumToComma(this.pot2_3);
            cc.find("label", this.btn3Node).getComponent(cc.Label).string = Global.FormatNumToComma(this.pot3_3);
            // 计算需要显示的快速下注按钮
            let showPotBtn = [];
            let showPosCfg = {
                [0]: [],
                [1]: [cc.v3(0, 332)],
                [2]: [cc.v3(-75, 332), cc.v3(75, 332)],
                [3]: [cc.v3(-150, 332), cc.v3(0, 332), cc.v3(150, 332)],
            }
            //推荐押注额，不能小于最小押注额
            if (selfCoin < this.pot1_3) {
            } else if (selfCoin < this.pot2_3) {
                if (this.pot1_3 > 0 && this.pot1_3 >= needCoin) showPotBtn.push(this.btn1Node);
            } else if (selfCoin < this.pot3_3) {
                if (this.pot1_3 > 0 && this.pot1_3 >= needCoin) showPotBtn.push(this.btn1Node);
                if (this.pot2_3 > 0 && this.pot2_3 >= needCoin) showPotBtn.push(this.btn2Node);
            } else {
                if (this.pot1_3 > 0 && this.pot1_3 >= needCoin) showPotBtn.push(this.btn1Node);
                if (this.pot2_3 > 0 && this.pot2_3 >= needCoin) showPotBtn.push(this.btn2Node);
                if (this.pot3_3 > 0 && this.pot3_3 >= needCoin) showPotBtn.push(this.btn3Node);
            }
            // 不同情况不同显示
            if (needCoin <= 0) {
                this.riseCoin = 0;
                this.showOprNode(this.btnPackedNode);
                this.showOprNode(this.btnCheckNode);
                // 显示快速下注按钮
                for (let i = 0; i < showPotBtn.length; i++) {
                    this.showOprNode(showPotBtn[i], showPosCfg[showPotBtn.length][i]);
                }
                // 更新右侧按钮
                cc.find("label", this.btnCheckNode).getComponent(cc.Label).string = ___("CHECK");
                cc.find("icon", this.btnCheckNode).active = true;
                cc.find("number", this.btnCheckNode).active = false;
                this.btnCheckNode.getComponent(cc.Sprite).spriteFrame = this.textureOpr.getSpriteFrame("btn_opr_btn_green");
                if (selfCoin > bindCoin) {
                    // 设置加注拖拽配置
                    cc.find("label", this.btnAddNode).getComponent(cc.Label).string = ___("BET");
                    this.showOprNode(this.btnAddNode);
                    this.max = selfCoin;
                    this.min = bindCoin;
                    this.maxBetLabel.string = Global.FormatNumToComma(this.max);
                    // 关闭头像
                    // this.seatCpt.isOpr = true;
                    // 关闭玩家状态
                    this.seatCpt.hidePeopleAllStatus();
                }
            } else {
                cc.find("icon", this.btnCheckNode).active = false;
                cc.find("number", this.btnCheckNode).active = true;
                if (selfCoin > needCoin) {
                    this.riseCoin = needCoin;
                    this.showOprNode(this.btnPackedNode);
                    this.showOprNode(this.btnCheckNode);
                    // 显示快速下注按钮
                    for (let i = 0; i < showPotBtn.length; i++) {
                        this.showOprNode(showPotBtn[i], showPosCfg[showPotBtn.length][i]);
                    }
                    // 更新右侧按钮
                    cc.find("number", this.btnCheckNode).getComponent(cc.Label).string = Global.FormatNumToComma(this.riseCoin);
                    cc.find("label", this.btnCheckNode).getComponent(cc.Label).string = ___("CALL");
                    this.btnCheckNode.getComponent(cc.Sprite).spriteFrame = this.textureOpr.getSpriteFrame("btn_opr_btn_green");
                    // 设置加注拖拽配置
                    cc.find("label", this.btnAddNode).getComponent(cc.Label).string = ___("RAISE");
                    this.showOprNode(this.btnAddNode);
                    this.max = selfCoin;
                    this.min = this.riseCoin;
                    this.maxBetLabel.string = Global.FormatNumToComma(this.max);
                    // 关闭头像
                    // this.seatCpt.isOpr = true;
                    // 关闭玩家状态
                    this.seatCpt.hidePeopleAllStatus();
                } else {
                    this.riseCoin = selfCoin;
                    this.showOprNode(this.btnPackedNode);
                    this.showOprNode(this.btnCheckNode);
                    cc.find("number", this.btnCheckNode).getComponent(cc.Label).string = Global.FormatNumToComma(this.riseCoin);
                    cc.find("label", this.btnCheckNode).getComponent(cc.Label).string = ___("ALLIN");
                    this.btnCheckNode.getComponent(cc.Sprite).spriteFrame = this.textureOpr.getSpriteFrame("btn_opr_btn_yellow");
                }
            }
            // 显示弃牌按钮上面的倒计时
            // this.timeMask.fillRange = 1;
            this.oprTime = oprTime;
            // this.indexTime = oprTime;
        } else {
            // this.indexTime = 0;
            this.prePackedNode.active = true;
            this.preCheckNode.active = true;
            if (needCoin <= 0) {
                this.riseCoin = 0;
                // 预操作更新
                cc.find("label", this.prePackedNode).getComponent(cc.Label).string = ___("FOLD/CHECK");
                this.preCheckNode.getComponent(cc.Sprite).spriteFrame = this.textureOpr.getSpriteFrame("btn_opr_btn_green");
                cc.find("label", this.preCheckNode).getComponent(cc.Label).string = ___("CHECK");
                cc.find("icon", this.preCheckNode).active = true;
                cc.find("number", this.preCheckNode).active = false;
            } else {
                cc.find("label", this.prePackedNode).getComponent(cc.Label).string = ___("FOLD");
                // 是否足够下注
                if (selfCoin > needCoin) {
                    this.riseCoin = needCoin;
                    this.preCheckNode.getComponent(cc.Sprite).spriteFrame = this.textureOpr.getSpriteFrame("btn_opr_btn_green");
                    cc.find("label", this.preCheckNode).getComponent(cc.Label).string = ___("CALL");
                    cc.find("icon", this.preCheckNode).active = false;
                    cc.find("number", this.preCheckNode).active = true;
                    cc.find("number", this.preCheckNode).getComponent(cc.Label).string = Global.FormatNumToComma(this.riseCoin);
                } else {
                    this.riseCoin = selfCoin;
                    this.preCheckNode.getComponent(cc.Sprite).spriteFrame = this.textureOpr.getSpriteFrame("btn_opr_btn_yellow");
                    cc.find("label", this.preCheckNode).getComponent(cc.Label).string = ___("ALLIN");
                    cc.find("icon", this.preCheckNode).active = false;
                    cc.find("number", this.preCheckNode).active = true;
                    cc.find("number", this.preCheckNode).getComponent(cc.Label).string = Global.FormatNumToComma(this.riseCoin);
                }
            }
            if (this.riseCoin > this.lastRiseCoin) {
                this.clearPreOpr();
            }
            this.lastRiseCoin = this.riseCoin;
        }

    }
    // 关闭
    close() {
        this.node.active = false;
    }
    // 倒计时处理
    protected update(dt: number): void {
        // if (this.indexTime > 0) {
        //     this.indexTime -= dt;
        //     this.timeMask.fillRange = this.indexTime / this.oprTime;
        //     if (this.indexTime <= 0) {
        //         if (this.seatCpt) this.seatCpt.isOpr = false;
        //         this.close();
        //     }
        // }
    }
    // 更新拖拽下注界面
    updateSliderView() {
        if (this.progressSlider.progress >= 1) {
            this.selectBet = this.max;
            this.curBetLabel.string = ___("ALL IN");
        } else {
            this.selectBet = parseInt(((this.max - this.min) * this.progressSlider.progress + this.min).toFixed(1));
            let str = this.selectBet >= this.max ? ___("ALL IN") : Global.FormatNumToComma(this.selectBet);
            this.curBetLabel.string = str;
        }
    }
    onTouchAddStart(event: cc.Event.EventTouch) {
        this.sliderBetNode.active = true;
        this.progressSlider.progress = 0;
        this.updateSliderView();
    }
    onTouchAddMove(event: cc.Event.EventTouch) {
        // 计算移动的位置
        let toMove = event.getLocation().sub(event.getStartLocation());
        // 设置进度条
        if (toMove.y < -200) {
            this.sliderBetNode.active = false;
        } else {
            this.sliderBetNode.active = true;
            let progress = Math.min(toMove.y / this.sliderBetNode.height, 1);
            progress = Math.max(progress, 0);
            this.progressSlider.progress = progress;
            this.updateSliderView();
        }
    }
    onTouchAddEnd(event: cc.Event.EventTouch) {
        this.sliderBetNode.active = false;
        // 计算移动的位置
        let toMove = event.getLocation().sub(event.getStartLocation());
        // 设置进度条
        if (toMove.y >= -200) {
            // 进行下注
            cc.vv.NetManager.send({ c: CMD.PLAYER_BET, coin: this.selectBet, isall: this.selectBet == this.max ? 1 : 0 });
        }
    }
    // 清空所有操作
    clearPreOpr() {
        this.preOprAction = 0;
        this.updatePreOprView();
    }
    updatePreOprView() {
        cc.find("mask", this.preCheckNode).active = this.preOprAction == 2 ? false : true;
        cc.find("mask", this.prePackedNode).active = this.preOprAction == 1 ? false : true;

        // this.openPre(needCoin, selfCoin, bindCoin);
        cc.find("label", this.preCheckNode).color = this.preOprAction == 2 ? new cc.Color(255, 255, 255) : new cc.Color(122, 122, 122);
        cc.find("label", this.prePackedNode).color = this.preOprAction == 1 ? new cc.Color(255, 255, 255) : new cc.Color(122, 122, 122);
    }
    // 处理预操作
    handlePreOpr(needCoin, selfCoin, bindCoin) {
        if (this.preOprAction == 1) {
            this.onClickPacked();
            this.clearPreOpr();
            this.close();
        } else if (this.preOprAction == 2) {
            this.onClickCheck();
            this.clearPreOpr();
            this.open(false, needCoin, selfCoin, bindCoin);
        } else {
            this.open(true, needCoin, selfCoin, bindCoin);
        }
    }
    // 点击弃牌操作
    onClickPacked() {
        cc.vv.NetManager.send({ c: CMD.PLAYER_PACK });
    }
    // 点击加注或者过牌
    onClickCheck() {
        if (this.riseCoin <= 0) {
            cc.vv.NetManager.send({ c: CMD.PLAYER_CHECK });
        } else if (this.riseCoin < this.selfCoin) {
            cc.vv.NetManager.send({ c: CMD.PLAYER_BET, coin: this.riseCoin, isall: 0 });
        } else {
            // 加注
            cc.vv.NetManager.send({ c: CMD.PLAYER_BET, coin: this.riseCoin, isall: 1 });
        }
    }
}
