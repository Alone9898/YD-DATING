/**
 * reward详情-item
 */
cc.Class({
    extends: cc.Component,

    properties: {
        
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start () {

    },

    setInfo:function(data){
        this._showHead(data.uid,data.usericon,data.avatarframe,data.playername)
        //date
        Global.setLabelString("lbl_date",this.node,Global.getFullDateStr(data.create_time))
        
        let ac_bet = cc.find("lay_action/lbl_bet",this.node)
        if(data.bet){
            ac_bet.active = true
            //bet
            ac_bet.getComponent(cc.Label).string = "Bet:"+Global.FormatNumToComma(data.bet)
        }
        else{
            ac_bet.active = false
        }
        
        //charge
        let ac_charge = cc.find("lay_action/lbl_charge",this.node)
        if(data.recharge){
            ac_charge.active = true
            ac_charge.getComponent(cc.Label).string = "Desposit:"+Global.FormatNumToComma(data.recharge)
        }
        else{
            ac_charge.active = false
        }
        
        //registion
        let ac_reg = cc.find("lay_action/lbl_reg",this.node)
        if(data.reg){
            ac_reg.active = true
            ac_reg.getComponent(cc.Label).string = "Registration:"+Global.FormatNumToComma(data.reg)
        }
        else{
            ac_reg.active = false
        }

        //cash balance
        let pfix = ""
        if(data.cash){
            pfix = "+"
        }
        Global.setLabelString("lbl_cashbalance",this.node,pfix + Global.FormatNumToComma(data.cash))

        //cash bonus
        let bfix = ""
        let nBonus = data.coin - data.cash
        if(nBonus){
            bfix = "+"
        }
        Global.setLabelString("lbl_cashbonus",this.node,bfix + Global.FormatNumToComma(nBonus))
        
    },

    _showHead(uid,icon,avat,nick){
        // let uid = uid
        let headIcon = icon
        let avatarframe = avat || 0;
        let node_my = this.node
        let node_head = cc.find("head",node_my)
        node_head.getComponent("HeadCmp").setHead(uid, headIcon)
        node_head.getComponent("HeadCmp").setAvatarFrame(avatarframe)

        //name
        Global.setLabelString("lbl_name",node_my,nick)
        // //uid
        // Global.setLabelString("lbl_id",node_my,"ID:"+uid)
        

    },

    // update (dt) {},
});
