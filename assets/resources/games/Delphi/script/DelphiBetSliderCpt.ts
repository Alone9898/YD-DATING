const { ccclass, property } = cc._decorator;
let CMD = {
    PLAYER_BET: 25735,  // 下注
    PLAYER_PACK: 25740,  // 弃牌
    PLAYER_CHECK: 25742,  // 过牌
}
@ccclass
export default class DelphiBetSliderCpt extends cc.Component {

    @property(cc.Slider)
    progressSlider: cc.Slider = null;

    @property(cc.Node)
    barMaskNode: cc.Node = null;
    @property(cc.Node)
    infoNode: cc.Node = null;

    @property(cc.Button)
    btn_pot: cc.Button = null;
    @property(cc.Button)
    btn_half: cc.Button = null;
    @property(cc.Button)
    btn_3bb: cc.Button = null;
    @property(cc.Button)
    btn_allin: cc.Button = null;


    @property(cc.Label)
    curBetLabel: cc.Label = null;
    @property(cc.Label)
    curBetLabel2: cc.Label = null;
    @property(cc.Label)
    minLabel: cc.Label = null;
    @property(cc.Label)
    maxLabel: cc.Label = null;

    max: number = 0;
    min: number = 0;
    potBet: number = 0;
    blind: number = 0;
    selectBet: number = 0;

    onLoad() {
        this.btn_allin.node.on("click", () => {
            cc.vv.NetManager.send({ c: CMD.PLAYER_BET, coin: this.max, isall: 1 });
        });
        this.btn_3bb.node.on("click", () => {
            cc.vv.NetManager.send({ c: CMD.PLAYER_BET, coin: this.blind * 3, isall: 0 });
        });
        this.btn_half.node.on("click", () => {
            cc.vv.NetManager.send({ c: CMD.PLAYER_BET, coin: this.potBet / 2, isall: 0 });
        });
        this.btn_pot.node.on("click", () => {
            cc.vv.NetManager.send({ c: CMD.PLAYER_BET, coin: this.potBet, isall: 0 });
        });

        this.progressSlider.handle.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this)
        this.progressSlider.handle.node.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this)
        this.progressSlider.handle.node.on(cc.Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this)
        this.infoNode.active = false;
    }

    onTouchStart() {
        this.infoNode.active = true;
    }
    onTouchEnd() {
        this.infoNode.active = false;
        cc.vv.NetManager.send({ c: CMD.PLAYER_BET, coin: this.selectBet, isall: this.selectBet == this.max ? 1 : 0 });
    }
    onSliderMove() {
        // this.progressSlider.progress
        this.updateSliderView();
        // 显示具体数值
    }

    updateSliderView() {
        this.selectBet = Math.floor((this.max - this.min) * this.progressSlider.progress + this.min);
        let str = this.selectBet >= this.max ? ___("ALL IN") : Global.FormatNumToComma(this.selectBet);
        this.curBetLabel.string = str;
        this.curBetLabel2.string = str;
        this.barMaskNode.height = 766 * this.progressSlider.progress;
        if (this.selectBet >= this.max) {
            this.infoNode.getComponent(sp.Skeleton).setAnimation(0, "animation", true);
        } else {
            this.infoNode.getComponent(sp.Skeleton).setAnimation(0, "animation2", false);
        }
    }

    open(needCoin, selfCoin, potCoin, currCoin, lastBet, blind) {
        this.node.active = true;
        this.infoNode.active = false;
        this.min = Math.max(needCoin, blind);
        this.max = selfCoin;
        this.blind = blind;
        this.btn_3bb.node.active = needCoin == 0;
        // 加注操作面板  POT计算规则: 跟注筹码 + 底池筹码 + 1倍的当前下注额度 
        this.potBet = potCoin + currCoin + needCoin + lastBet;
        cc.find("value", this.btn_pot.node).getComponent(cc.Label).string = Global.FormatNumToComma(this.potBet);
        cc.find("value", this.btn_half.node).getComponent(cc.Label).string = Global.FormatNumToComma(this.potBet / 2);
        cc.find("value", this.btn_allin.node).getComponent(cc.Label).string = Global.FormatNumToComma(this.max);
        cc.find("value", this.btn_3bb.node).getComponent(cc.Label).string = Global.FormatNumToComma(this.blind * 3);

        this.minLabel.string = Global.FormatNumToComma(this.min);
        this.maxLabel.string = Global.FormatNumToComma(this.max);
        this.progressSlider.progress = 0;
        this.updateSliderView();
    }

    close() {
        this.node.active = false;
        this.infoNode.active = false;
    }

}
