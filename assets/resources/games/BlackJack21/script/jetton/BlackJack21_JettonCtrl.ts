
const {ccclass, property} = cc._decorator;

@ccclass
export default class BlackJack21JettonCtrl extends cc.Component {

    @property(cc.Prefab)
    jettonPre: cc.Prefab = null;

    panel1: cc.Node = null;
    // jettonList1: cc.Node[] = [];
    cntNode1: cc.Node = null;
    cntLbl1: cc.Label = null;
    jettonNode1: cc.Node = null;
    betcoin1:number = 0;

    panel2: cc.Node = null;
    // jettonList2: cc.Node[] = [];
    cntNode2: cc.Node = null;
    cntLbl2: cc.Label = null;
    jettonNode2: cc.Node = null;
    betcoin2:number = 0;

    @property(cc.Node)
    extrajetton:cc.Node = null;

    @property([cc.Float])
    panelScale:number[] = [1,0.7];

    init(){
        this.panel1 = cc.find("panel1", this.node);
        this.cntNode1 = cc.find("bet_cnt", this.panel1);
        this.cntLbl1 = cc.find("bet_cnt/lbl", this.panel1).getComponent(cc.Label);
        this.cntNode1.active = false;
        this.jettonNode1 = cc.find("list", this.panel1);
        this.panel1.active = false;

        this.panel2 = cc.find("panel2", this.node);
        this.cntNode2 = cc.find("bet_cnt", this.panel2);
        this.cntLbl2 = cc.find("bet_cnt/lbl", this.panel2).getComponent(cc.Label);
        this.cntNode2.active = false;
        this.jettonNode2 = cc.find("list", this.panel2);
        this.panel2.active = false;
    }

    splitJettonFirst(betcoin){
        this.panel2.active = true;
        this.panel1.scale = this.panelScale[1];
        this.panel2.scale = this.panelScale[1];

        let chipList = this.creatorJetton(betcoin);
        for (let i = 0; i < chipList.length; i++){
            chipList[i].parent = this.jettonNode2;
            chipList[i].x = 0;
            chipList[i].y = 15*i;
        }
        this.cntLbl2.string = Global.FormatNumToComma(betcoin);
        this.betcoin2 = betcoin;
        this.cntNode2.active = true;

    }

    creatorJetton(betcoin){
        // let list = [5,10,50,100,500,1000,5000,10000,50000,100000];
        //
        let chipList = [];
        // let rem = betcoin
        // for (let i = list.length-1; i >= 0; i--){
        //     let curC =  Math.floor(rem / list[i]);
        //     rem = rem%list[i];
        //
        //     if(curC > 0){
        //         for (let c = 0;c < curC; c++){
        //             let jetton = cc.instantiate(this.jettonPre);
        //             jetton.getComponent("Table_BetChip_Base").init(list[i]);
        //             chipList.push(jetton)
        //         }
        //     }
        // }
        chipList.push(cc.instantiate(this.jettonPre))
        return chipList;
    }

    /**
     * 断线重连
     * @param betcoin
     */
    reconnectJetton(betcoin){

        if(betcoin[0]){
            this.panel1.active = true
            this.panel1.scale = this.panelScale[0];
            let chipList = this.creatorJetton(betcoin[0]);
            for (let i = 0; i < chipList.length; i++){
                chipList[i].parent = this.jettonNode1;
                chipList[i].x = 0;
                chipList[i].y = 15*i;
            }
            this.cntLbl1.string = Global.FormatNumToComma(betcoin[0]);
            this.betcoin1 = betcoin[0];
            this.cntNode1.active = true;
        }

        if(betcoin[1]){
            this.panel2.active = true
            this.panel1.scale = this.panelScale[1];
            this.panel2.scale = this.panelScale[1];
            let chipList = this.creatorJetton(betcoin[1]);
            for (let i = 0; i < chipList.length; i++){
                chipList[i].parent = this.jettonNode2;
                chipList[i].x = 0;
                chipList[i].y = 15*i;
            }
            this.cntLbl2.string = Global.FormatNumToComma(betcoin[1]);
            this.betcoin2 = betcoin[1];
            this.cntNode2.active = true;
        }

    }

    /**
     * 押注
     */
    addJetton(betcoin, fPos){
        if(betcoin){
            facade.soundMgr.playEffect("qq_xiazhu_jinbi");

            this.panel1.active = true
            let chipList = this.creatorJetton(betcoin);
            for (let i = 0; i < chipList.length; i++){
                chipList[i].parent = this.jettonNode1;

                chipList[i].position = this.jettonNode1.convertToNodeSpaceAR(fPos);
                cc.tween(chipList[i])
                    .delay(i*0.03)
                    .to(0.2,{position:cc.v2(0, 15*i)})
                    .start()
            }
            this.cntLbl1.string = Global.FormatNumToComma(betcoin);
            this.betcoin1 = betcoin;
            this.cntNode1.active = true;

            // await facade.delayTime(chipList.length*0.03 + 0.3)
        }
    }

    /**
     * 双倍押注
     */
    addJettonDouble(betcoin, fPos, tileid=1){
        facade.soundMgr.playEffect("qq_xiazhu_jinbi");
        let chipList = this.creatorJetton(betcoin/2);
        let parNode = tileid == 1 ? this.jettonNode1 : this.jettonNode2;
        let norCnt = parNode.childrenCount;
        for (let i = 0; i < chipList.length; i++){
            chipList[i].parent = parNode;

            chipList[i].position = parNode.convertToNodeSpaceAR(fPos);
            cc.tween(chipList[i])
                .delay(i*0.03)
                .to(0.2,{position:cc.v2(0, 15*(i+norCnt+1))})
                .start()
        }
        if(tileid == 1){
            this.cntLbl1.string = ""+Global.FormatNumToComma(betcoin);
            this.betcoin1 = betcoin;
        } else {
            this.cntLbl2.string = ""+Global.FormatNumToComma(betcoin);
            this.betcoin2 = betcoin;
        }
        // await facade.delayTime(chipList.length*0.03 + 0.3);
    }

    /**
     * 额外投保
     */
    addExtraJetton(betcoin, fPos){
        let chipList = this.creatorJetton(betcoin);
        for (let i = 0; i < chipList.length; i++){
            chipList[i].parent = this.extrajetton;

            chipList[i].position = this.extrajetton.convertToNodeSpaceAR(fPos);
            cc.tween(chipList[i])
                .delay(i*0.03)
                .to(0.2,{position:cc.v2(0, 15*i)})
                .start()
        }
        // await facade.delayTime(chipList.length*0.03 + 0.3)
    }

    /**
     * 结算- 投保结算  庄家有blackJ：猜中赢押注+投保；没猜输押注。 庄家没有blackJ:扣除投保
     * @param betcoin
     * @param tPos
     * @param bBlackJ 庄家是否赢了blackJ
     */
    settlementInsure(betcoin, bBlackJ, tPos){
        if(betcoin > 0){
            facade.soundMgr.playEffect("qq_xiazhu_jinbi");
            let maxNum = this.jettonNode1.childrenCount;
            for (let i = 0; i < this.extrajetton.childrenCount; i++){
                let jetton = this.extrajetton.children[i];
                let endPos = this.extrajetton.convertToNodeSpaceAR(tPos);
                cc.tween(jetton)
                    .delay((this.extrajetton.childrenCount-1-i)*0.03)
                    .to(0.2,{position:endPos})
                    .call(()=>{
                        jetton.destroy();
                    })
                    .start()
            }
            for (let i = 0; i < this.jettonNode1.childrenCount; i++){
                let jetton = this.jettonNode1.children[i];
                let endPos = this.jettonNode1.convertToNodeSpaceAR(tPos);
                cc.tween(jetton)
                    .delay(( this.jettonNode1.childrenCount-1-i)*0.03)
                    .to(0.2,{position:endPos})
                    .call(()=>{
                        jetton.destroy();
                    })
                    .start()
            }

            return (maxNum*0.03 + 0.3)
        } else {
            facade.soundMgr.playEffect("qq_xiazhu_jinbi");
            let maxNum = this.extrajetton.childrenCount;
            for (let i = 0; i < this.extrajetton.childrenCount; i++){
                let jetton = this.extrajetton.children[i];
                let endPos = this.extrajetton.convertToNodeSpaceAR(tPos);
                cc.tween(jetton)
                    .delay((this.jettonNode1.childrenCount-1-i)*0.03)
                    .to(0.2,{position:endPos})
                    .call(()=>{
                        jetton.destroy();
                    })
                    .start()
            }
            if(bBlackJ){
                maxNum = this.jettonNode1.childrenCount;
                for (let i = 0; i < this.jettonNode1.childrenCount; i++){
                    let jetton = this.jettonNode1.children[i];
                    let endPos = this.jettonNode1.convertToNodeSpaceAR(tPos);
                    cc.tween(jetton)
                        .delay((this.jettonNode1.childrenCount-1-i)*0.03)
                        .to(0.2,{position:endPos})
                        .call(()=>{
                            jetton.destroy();
                        })
                        .start()
                }
            }

            return (maxNum*0.03 + 0.3)
        }
    }

    /**
     * 赢钱-从庄家飞筹码到筹码池上
     */
    addJetton2(betcoin, fPos,  bSplit){
        if(betcoin){
            facade.soundMgr.playEffect("qq_xiazhu_jinbi");
            let chipList = this.creatorJetton(betcoin);
            let parentNode = bSplit?this.jettonNode2:this.jettonNode1;

            let count = parentNode.childrenCount;
            for (let i = 0; i < chipList.length; i++){
                chipList[i].parent = parentNode;

                chipList[i].position = parentNode.convertToNodeSpaceAR(fPos);
                cc.tween(chipList[i])
                    .delay(i*0.03)
                    .to(0.2,{position:cc.v2(0, 15*(i+ count))})
                    .start()
            }
            return (0.2+chipList.length*0.03+0.3);
        }
    }

    /**
     * 结算- 正常结算：  赢钱：赢押注*2；输钱：扣投保+押注
     * @param betcoin
     * @param pPos 玩家位置
     * @param bPos 庄家位置
     * @param bSplit 分牌后的那摞牌
     */
    settlement(betcoin, pPos, bPos, bSplit){
        if(betcoin > 0){
            let cntLbl = bSplit?this.cntLbl2:this.cntLbl1;
            let curbetcoin = bSplit?this.betcoin2:this.betcoin1;
            let dt = 0;
            if(betcoin > curbetcoin){
                dt = this.addJetton2(betcoin-curbetcoin, bPos, bSplit)
                cntLbl.string = Global.FormatNumToComma(betcoin);
            }
            facade.soundMgr.playEffect("qq_xiazhu_jinbi");

            let parentNode = bSplit ? this.jettonNode2 : this.jettonNode1;
            let tCount= parentNode.childrenCount;
            for (let i = 0; i < tCount; i++){
                let jetton = parentNode.children[i];
                let endPos = parentNode.convertToNodeSpaceAR(pPos);
                cc.tween(jetton)
                    .delay((tCount-1-i)*0.03 + dt)
                    .to(0.2,{position:endPos})
                    .call(()=>{
                        jetton.destroy()
                    })
                    .start()
            }

            return (0.2+tCount*0.03+0.1 + dt);
        }
        else {
            facade.soundMgr.playEffect("qq_xiazhu_jinbi");
            let parentNode = bSplit ? this.jettonNode2 : this.jettonNode1;

            let tCount= parentNode.childrenCount;
            for (let i = 0; i < tCount; i++){
                let jetton = parentNode.children[i];
                let endPos = parentNode.convertToNodeSpaceAR(bPos);
                cc.tween(jetton)
                    .delay((tCount-1-i)*0.03)
                    .to(0.2,{position:endPos})
                    .call(()=>{
                        jetton.destroy()
                    })
                    .start()
            }
            return (0.2+tCount*0.03+0.1);
        }
    }

    cleanRound(){
        this.panel1.active = false;
        this.panel2.active = false;
        this.panel1.scale = this.panelScale[0];
        this.panel2.scale = this.panelScale[1];
        this.cntNode1.active = false;
        this.cntNode2.active = false;
        // this.jettonList1.forEach(node=>{
        //     node.destroy()
        // })
        // this.jettonList2.forEach(node=>{
        //     node.destroy()
        // })
        this.jettonNode1.removeAllChildren();
        this.jettonNode2.removeAllChildren();
        this.betcoin1 = 0;
        this.betcoin2 = 0;
    }

    // update (dt) {}
}
