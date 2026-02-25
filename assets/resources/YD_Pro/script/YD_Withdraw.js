/**
 * 
 */
cc.Class({
    extends: cc.Component,

    properties: {
       _curTab:1
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        let tab_bank = cc.find("tog_select/toggle1",this.node)
        Global.btnClickEvent(tab_bank,this.onClickTabBank,this)

        let tab_upi = cc.find("tog_select/toggle2",this.node)
        Global.btnClickEvent(tab_upi,this.onClickTabUpi,this)

        let tab_usdt = cc.find("tog_select/toggle3",this.node)
        Global.btnClickEvent(tab_usdt,this.onClickTabUsdt,this)

        let btn_draw = cc.find("btn_withdraw",this.node)
        Global.btnClickEvent(btn_draw,this.onClickDraw,this)


        this._way_bank = cc.find("node_bank",this.node)
        this._way_upi = cc.find("node_upi",this.node)
        this._way_usdt = cc.find("node_usdt",this.node)

        let btn_addBtn = cc.find("btn_add",this._way_bank)
        Global.btnClickEvent(btn_addBtn,this.onClickAddBank,this)

        let btn_addupi = cc.find("btn_add",this._way_upi)
        Global.btnClickEvent(btn_addupi,this.onClickAddUpi,this)

        let btn_addusdt = cc.find("btn_add",this._way_usdt)
        Global.btnClickEvent(btn_addusdt,this.onClickAddusdt,this)

        let btn_record = cc.find("btn_record",this.node)
        Global.btnClickEvent(btn_record,this.onClickRecord,this)

        let btn_rule = cc.find("btn_rule",this.node)
        Global.btnClickEvent(btn_rule,this.onClickRule,this)

        // this._way_s

        cc.vv.NetManager.registerMsg(MsgId.YD_WITHDRAW_GET, this.OnRcvWithDrawInfo, this);
        cc.vv.NetManager.registerMsg(MsgId.YD_WITHDRAW_DRAW, this.OnRcvDrawAction, this);

        Global.registerEvent("draw_way_change",this.onEventDrawWayChange,this)
        
    },

    onDestroy(){
        cc.vv.NetManager.unregisterMsg(MsgId.YD_WITHDRAW_GET, this.OnRcvWithDrawInfo,false, this);
        cc.vv.NetManager.unregisterMsg(MsgId.YD_WITHDRAW_DRAW, this.OnRcvDrawAction,false, this);
        
    },

    start () {
        let req = {c:MsgId.YD_WITHDRAW_GET}
        cc.vv.NetManager.send(req)

        //默认
        this._curTab = 1
        this._showTab()
    },

    onClickRule:function(){
        let url = "YD_Pro/withdraw/yd_withdraw_rule"
        cc.vv.PopupManager.addPopup(url, {
            weight: 998,
            // isWait: true,
            scaleIn: true,
        })
    },


    onClickRecord:function(){
        let url = "YD_Pro/withdraw/yd_withdraw_record"
        cc.vv.PopupManager.addPopup(url, {
            weight: 998,
            // isWait: true,
            scaleIn: true,
        })
    },

    onClickTabBank:function(){
        this._curTab = 1
        this._showTab()
    },

    onClickTabUpi:function(){
        this._curTab = 2
        this._showTab()
    },  
    onClickTabUsdt:function(){
        this._curTab = 3
        this._showTab()
    },  

    onClickAddBank:function(){
        let url = "YD_Pro/withdraw/yd_withdraw_addBank"
        cc.vv.PopupManager.addPopup(url, {
            weight: 998,
            // isWait: true,
            scaleIn: true,
        })
    },

    onClickAddUpi:function(){
        let url = "YD_Pro/withdraw/yd_withdraw_addupi"
        cc.vv.PopupManager.addPopup(url, {
            weight: 998,
            // isWait: true,
            scaleIn: true,
        })
    },

    onClickAddusdt:function(){
        let url = "YD_Pro/withdraw/yd_withdraw_addusdt"
        cc.vv.PopupManager.addPopup(url, {
            weight: 998,
            // isWait: true,
            scaleIn: true,
        })
    },

    _showTab(){
        this._way_bank.active = this._curTab == 1
        this._way_upi.active = this._curTab == 2
        this._way_usdt.active = this._curTab == 3
    },

    _showChips(){
        if(this._baseInfo){
            let nTotal = Global.FormatNumToComma(this._baseInfo.coin)
            let nDraw = Global.FormatNumToComma(this._baseInfo.dcoin)
            Global.setLabelString("node_have/chip_total/val",this.node,nTotal)
            Global.setLabelString("node_have/chip_withdraw/val",this.node,nDraw)
        }
    },

    showUI:function(){
        if(this._baseInfo){
            //bank
            let bank_bind = this._baseInfo.bankList
            if(bank_bind){
                this._setBankInfo(bank_bind[bank_bind.length-1])
            }
            //upi
            let upi_bind = this._baseInfo.upiList
            if(upi_bind){
                this._setUpiInfo(upi_bind[upi_bind.length-1])
            }
            //usdt
            let usdt_bind = this._baseInfo.usdtList
            if(usdt_bind){
                this._setUsdtInfo(usdt_bind[usdt_bind.length-1])
            }

            this._showChips()
        }
    },

    onEventDrawWayChange:function(data){
        let val = data.detail
        if(val.type == 1){
            if(this._baseInfo){
                this._baseInfo.bankList = val.val
            }
        }
        if(val.type == 2){
            if(this._baseInfo){
                this._baseInfo.upiList = val.val
            }
        }
        if(val.type == 3){
            if(this._baseInfo){
                this._baseInfo.usdtList = val.val
            }
        }

        this.showUI()

    },

    // onClickClose:function(){

    // },

    _setBankInfo:function(info){
        if(info){
            Global.setLabelString("via_way/val",this._way_bank,info.bankname)
            Global.setLabelString("via_account/val",this._way_bank,info.account)
        }
        
        
    },

    _setUpiInfo:function(info){
        if(info){
            Global.setLabelString("via_way/val",this._way_upi,info.upi)
            Global.setLabelString("via_account/val",this._way_upi,info.username)
        }
    },

    _setUsdtInfo:function(info){
        if(info){
            Global.setLabelString("via_account/val",this._way_usdt,info.addr)
            // Global.setLabelString("via_account/val",this._way_usdt,info.account)
        }
    },

    OnRcvWithDrawInfo:function(msg){
        if(msg.code == 200){
            this._baseInfo = msg
            this.showUI()
        }
    },

    onClickDraw:function(){
        let id
        if(this._curTab == 1){
            //bank
            if(this._baseInfo && this._baseInfo.bankList.length==0){
                cc.vv.FloatTip.show("Bind bank account first!")
                return
            }
            else{
                let nLen = this._baseInfo.bankList.length
                id = this._baseInfo.bankList[nLen-1].id
            }
        }
        else if(this._curTab == 2){
            //upi
            if(this._baseInfo && this._baseInfo.upiList.length==0){
                cc.vv.FloatTip.show("Bind UPI first!")
                return
            }
            else{
                let nLen = this._baseInfo.upiList.length
                id = this._baseInfo.upiList[nLen-1].id
            }
        }
        else if(this._curTab == 3){
            //usdt
            if(this._baseInfo && this._baseInfo.usdtList.length==0){
                cc.vv.FloatTip.show("Bind USTD first!")
                return
            }
            else{
                let nLen = this._baseInfo.usdtList.length
                id = this._baseInfo.usdtList[nLen-1].id
            }
        }

        let amount = cc.find("node_amount/edit",this.node)
        let inputVal = amount.getComponent(cc.EditBox).string
        if(!inputVal){
            cc.vv.FloatTip.show("Input Withdraw number !")
            return
        }
        else{
            if(Number(inputVal) > this._baseInfo.dcoin){
                cc.vv.FloatTip.show("Withdraw more than own !")
                return
            }
        }

        let req = {c:MsgId.YD_WITHDRAW_DRAW}
        req.coin = inputVal
        req.bankid = id
        cc.vv.NetManager.send(req)

    },

    OnRcvDrawAction:function(msg){
        if(msg.code == 200){
            if(msg.spcode){
                cc.vv.FloatTip.show("Draw:"+msg.spcode)
                return
            }

            cc.vv.FloatTip.show("Withdraw Success!")
            let amount = cc.find("node_amount/edit",this.node)
            amount.getComponent(cc.EditBox).string = "0"
            //更新
            this._baseInfo.coin = msg.coin
            this._baseInfo.dcoin = msg.dcoin
            this._showChips()
            
        }
    }



    // update (dt) {},
});
