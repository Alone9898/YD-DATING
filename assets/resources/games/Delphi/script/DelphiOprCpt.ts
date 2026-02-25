const { ccclass, property } = cc._decorator;




let CMD = {
    PLAYER_BET: 25735,  // 下注
    PLAYER_PACK: 25740,  // 弃牌
    PLAYER_CHECK: 25742,  // 过牌
}

@ccclass
export default class DelphiOprCpt extends cc.Component {
    @property(cc.Node)
    preOprNode: cc.Node = null;             //预操作面板
    @property(cc.Node)
    oprNode: cc.Node = null;                //操作面板

    private btn1Node: cc.Node;
    private btn2Node: cc.Node;
    private btn3Node: cc.Node;
    private btnPackedNode: cc.Node;
    private btnCheckNode: cc.Node;
    private btnAddNode: cc.Node;

    preOprAction: number = 0;
    selfCoin: number = 0;
    isALL: number;
    callCoin: number;
    riseCoin: number;

    onLoad() {
        this.btn1Node = cc.find("btn_1", this.preOprNode);
        this.btn2Node = cc.find("btn_2", this.preOprNode);
        this.btn3Node = cc.find("btn_3", this.preOprNode);

        this.btnPackedNode = cc.find("btn_packed", this.oprNode);
        this.btnCheckNode = cc.find("btn_check", this.oprNode);
        this.btnAddNode = cc.find("btn_add", this.oprNode);

        // 预操作1
        this.btn1Node.on("click", () => {
            this.preOprAction = this.preOprAction == 1 ? 0 : 1;
            this.updatePreOprView();
        })
        // 预操作2
        this.btn2Node.on("click", () => {
            this.preOprAction = this.preOprAction == 2 ? 0 : 2;
            this.updatePreOprView();
        })
        // 预操作3
        this.btn3Node.on("click", () => {
            this.preOprAction = this.preOprAction == 3 ? 0 : 3;
            this.updatePreOprView();
        })
        // 弃牌
        this.btnPackedNode.on("click", this.onClickPacked, this);
        // 根据是否加注确认: 过或者跟平
        this.btnCheckNode.on("click", this.onClickCheck, this);
        // 加注 或者 ALLIN
        this.btnAddNode.on("click", this.onClickAdd, this);

    }

    updatePreOprView() {
        cc.find("select", this.btn1Node).active = this.preOprAction == 1;
        cc.find("select", this.btn2Node).active = this.preOprAction == 2;
        cc.find("select", this.btn3Node).active = this.preOprAction == 3;
    }
    // 清空所有操作
    clearPreOpr() {
        this.preOprAction = 0;
        this.updatePreOprView();
    }

    // 打开操作面板
    openOpr(needCoin, selfCoin, bindCoin) {
        this.node.active = true;
        this.preOprNode.active = false;
        this.oprNode.active = true;

        this.selfCoin = selfCoin;
        this.callCoin = 0;
        this.riseCoin = 0;

        let btnLabel1 = cc.find("label", this.btnPackedNode).getComponent(cc.Label);
        let btnLabel2 = cc.find("label", this.btnCheckNode).getComponent(cc.Label);
        let btnLabel3 = cc.find("label", this.btnAddNode).getComponent(cc.Label);
        // 不同情况不同显示
        if (needCoin <= 0) {
            this.callCoin = 0;
            this.riseCoin = bindCoin;
            this.btnCheckNode.active = true;
            btnLabel1.string = ___("FOLD");
            btnLabel2.string = ___("CHECK");
            btnLabel3.string = ___("BET ({1})", Global.FormatNumToComma(this.riseCoin));
        } else {
            btnLabel1.string = ___("FOLD");
            if (selfCoin > needCoin * 2) {
                this.btnCheckNode.active = true;
                this.callCoin = needCoin;
                this.riseCoin = needCoin * 2;
                btnLabel2.string = ___("CALL ({1})", Global.FormatNumToComma(this.callCoin));
                btnLabel3.string = ___("RISE ({1})", Global.FormatNumToComma(this.riseCoin));
            } else if (selfCoin > needCoin) {
                this.btnCheckNode.active = true;
                this.callCoin = needCoin;
                this.riseCoin = selfCoin;
                btnLabel2.string = ___("CALL ({1})", Global.FormatNumToComma(this.callCoin));
                btnLabel3.string = ___("ALLIN ({1})", Global.FormatNumToComma(this.riseCoin));
            } else {
                this.btnCheckNode.active = false;
                this.callCoin = selfCoin;
                this.riseCoin = selfCoin;
                btnLabel3.string = ___("ALLIN ({1})", Global.FormatNumToComma(this.riseCoin));
            }
        }

    }
    // 打开预操作面板
    openPre(needCoin, selfCoin, bindCoin) {
        this.node.active = true;
        this.preOprNode.active = true;
        this.oprNode.active = false;
        this.updatePreOprView();
        this.callCoin = 0;
        this.riseCoin = 0;
        let btnLabel1 = cc.find("label", this.btn1Node).getComponent(cc.Label);
        let btnLabel2 = cc.find("label", this.btn2Node).getComponent(cc.Label);
        let btnLabel3 = cc.find("label", this.btn3Node).getComponent(cc.Label);
        if (needCoin <= 0) {
            btnLabel1.string = ___("FOLD/CHECK");
            btnLabel2.string = ___("CHECK");
            btnLabel3.string = ___("CALL ANY");
        } else {
            this.callCoin = needCoin;
            btnLabel1.string = ___("FOLD");
            btnLabel2.string = ___("CALL {1}", Global.FormatNumToComma(this.callCoin));
            btnLabel3.string = ___("CALL ANY");
            // btnLabel1.string = ___("FOLD");
            // if (selfCoin > needCoin * 2) {
            //     this.btn2Node.active = true;
            //     this.callCoin = needCoin;
            //     this.riseCoin = needCoin * 2;
            //     btnLabel2.string = ___("CALL ({1})", Global.FormatNumToComma(this.callCoin));
            //     btnLabel3.string = ___("RISE ({1})", Global.FormatNumToComma(this.riseCoin));
            // } else if (selfCoin > needCoin) {
            //     this.btn2Node.active = true;
            //     this.callCoin = needCoin;
            //     this.riseCoin = selfCoin;
            //     btnLabel2.string = ___("CALL ({1})", Global.FormatNumToComma(this.callCoin));
            //     btnLabel3.string = ___("ALLIN ({1})", Global.FormatNumToComma(this.riseCoin));
            // } else {
            //     this.btn2Node.active = false;
            //     this.callCoin = selfCoin;
            //     this.riseCoin = selfCoin;
            //     btnLabel3.string = ___("ALLIN ({1})", Global.FormatNumToComma(this.riseCoin));
            // }
        }
    }
    // 处理预操作
    handlePreOpr(needCoin, selfCoin, bindCoin) {
        if (this.preOprAction == 1) {
            this.onClickPacked();
            this.clearPreOpr();
            this.close();
            // this.openPre(needCoin, selfCoin, bindCoin);
        } else if (this.preOprAction == 2) {
            this.onClickCheck();
            this.clearPreOpr();
            this.openPre(needCoin, selfCoin, bindCoin);
        } else if (this.preOprAction == 3) {
            // this.onClickAdd();
            this.onClickCheck();
            this.clearPreOpr();
            this.openPre(needCoin, selfCoin, bindCoin);
        } else {
            this.openOpr(needCoin, selfCoin, bindCoin);
        }
    }

    close() {
        this.node.active = false;
    }


    onClickPacked() {
        cc.vv.NetManager.send({ c: CMD.PLAYER_PACK });
    }
    onClickCheck() {
        if (this.callCoin > 0) {
            // 过牌
            cc.vv.NetManager.send({ c: CMD.PLAYER_BET, coin: this.callCoin, isall: 0 });
        } else {
            // 过牌
            cc.vv.NetManager.send({ c: CMD.PLAYER_CHECK });
        }
    }
    onClickAdd() {
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
