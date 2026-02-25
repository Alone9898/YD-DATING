/**充值/提现提示 */
cc.Class({
    extends: cc.Component,

    properties: {
        
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        let btn_left = cc.find("btn_no",this.node)
        Global.btnClickEvent(btn_left, this.onClickLeft, this);

        let btn_right = cc.find("btn_yes",this.node)
        Global.btnClickEvent(btn_right, this.onClickRight, this);
    },

    start () {

    },

    //显示消息类型
    //nType:1 提现 2充值
    showTipType:function(nType,param){
        this._showTipsType = nType

        let tips1 = cc.find("content_bg/tip1",this.node)
        let tips2 = cc.find("content_bg/tip2",this.node)
        tips1.active = (nType ==1)
        tips2.active = (nType ==2)

        let lbl_btnleft = "Deposit Later"
        let lbl_btnright = "Deposit Now"
        if(nType == 1){
            lbl_btnleft = "Withdraw Now"
            lbl_btnright = "Deposit Now"

            let cash_balance = "₹ "+cc.vv.UserManager.ecoin.toFixed(2)
            Global.setLabelString("lbl_win/val",tips1,cash_balance)


            let withdraw_balance = "₹ "+cc.vv.UserManager.dcoin.toFixed(2)
            Global.setLabelString("lbl_withdraw/val",tips1,withdraw_balance)

            let nLimit = param
            let package1 = cc.js.formatStr("<color=00ff90>Package 1.</c><br/>You can withdraw up to <color=#ffd56a>₹ %s</c> without deposit,then all your free winnings will be transfer to Cash Bonus(Not available for withdrawal).",nLimit)
            cc.find("package1",tips1).getComponent(cc.RichText).string = package1


            let package2 = cc.js.formatStr("<color=00ff90>Package 2.</c><br />You can deposit any amount to claim 100% free winnings back.")
            cc.find("package2",tips1).getComponent(cc.RichText).string = package2
        }
        else{
            let cash_balance = "₹ "+cc.vv.UserManager.ecoin.toFixed(2)
            Global.setLabelString("lbl_win/val",tips2,cash_balance)

            let package1 = cc.js.formatStr("<color=00ff90>Most Vaule Package:</c><br/>You can deposit your current free winnings <color=#ffd56a>%s</c> or any higher amount to claim 100% free winnings back.<br/><br/><color=00ff90>Most Popular Package:</c><br/>You can deposit any amount(<color=#ffd56a>Less than %s</c>) to unlock same amount free winnings,then remaining free winnings will be transferred to Cash Bonus (Not available for withdrawal).",cash_balance,cash_balance)
            cc.find("package1",tips2).getComponent(cc.RichText).string = package1
        }

        Global.setLabelString("btn_no/Background/lbl",this.node,lbl_btnleft)
        Global.setLabelString("btn_yes/Background/lbl",this.node,lbl_btnright)
        

    },

    onClickLeft:function(){
        if(this._showTipsType == 1){
            //提现
            cc.vv.PopupManager.showTopWin("YD_Pro/prefab/yd_charge", {
                onShow: (node) => {
                    node.getComponent("yd_charge").setURL(cc.vv.UserManager.drawUrl);

                    let cp = node.addComponent("NodeLifeCallBack")
                    cp.setDestroyCall(()=>{
                        //更新一下winning
                        cc.vv.NetManager.sendAndCache({ c: MsgId.PERSIONAL_INFO, otheruid: cc.vv.UserManager.uid }, true);
                    })
                }
            })

            this._doClose()
        }
        else{
            this._doClose()
        }
    },

    onClickRight:function(){
        cc.vv.PopupManager.showTopWin("YD_Pro/prefab/yd_charge", {
            onShow: (node) => {
                let amount = cc.vv.UserManager.ecoin.toFixed(2)
                node.getComponent("yd_charge").setURL(cc.vv.UserManager.payurl,null,amount);
            }
        })
        this._doClose()
    },

    _doClose:function(){
        this.node.destroy()
    }

    // update (dt) {},
});
