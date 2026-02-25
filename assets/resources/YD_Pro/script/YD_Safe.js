/**
 * 保险箱
 */
cc.Class({
    extends: cc.Component,

    properties: {
       
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this._editInput = cc.find("node_editBox/editBox", this.node).getComponent(cc.EditBox);

        Global.btnClickEvent(cc.find("tog_select/toggle1",this.node),this.onClickSave,this);  // save
        Global.btnClickEvent(cc.find("tog_select/toggle2",this.node),this.onClickTake,this);   // take

        Global.btnClickEvent(cc.find("btn_reset",this.node),this.onClickReset,this);
        Global.btnClickEvent(cc.find("btn_yes",this.node),this.onClickYes,this);

        let btn_close = cc.find("btn_close",this.node)
        Global.btnClickEvent(btn_close,this.onClickClose,this)
    },

    start () {
        cc.vv.NetManager.send({ c: MsgId.REQ_ENTER_SAFE, passwd:888888 });

    },

    onEnable() {
        let netListener = this.node.addComponent("NetListenerCmp");
        netListener.registerMsg(MsgId.REQ_ENTER_SAFE, this.REQ_ENTER_SAFE, this);
        netListener.registerMsg(MsgId.REQ_SAFE_SAVE, this.REQ_SAFE_SAVE, this);
        netListener.registerMsg(MsgId.REQ_SAFE_TAKE, this.REQ_SAFE_TAKE, this);
    },

    onClickClose:function(){
        cc.vv.PopupManager.removePopup(this.node);
    },

    REQ_ENTER_SAFE(msg){
        if(msg.code == 200) {
            this._selfCoin = msg.coin;
            this._bankCoin = msg.bankcoin || 0;
            this._token = msg.token;
            this._canOpr = true;
            this.showPanel(1);
        }

        if(msg.spcode){
            this.showSpcode(msg.spcode);
        }
    },

    REQ_SAFE_SAVE(msg){
        if(msg.code == 200) {
            this._selfCoin = msg.coin;
            this._bankCoin = msg.bankcoin;
            this._editInput.string = "";
            this._canOpr = true;
            this.showPanel(this._panelType);
        }

        if(msg.spcode){
            this.showSpcode(msg.spcode);
        }
    },

    REQ_SAFE_TAKE(msg){
        if(msg.code == 200) {
            this._selfCoin = msg.coin;
            this._bankCoin = msg.bankcoin;
            this._editInput.string = "";
            this._canOpr = true;
            this.showPanel(this._panelType);
        }

        if(msg.spcode){
            this.showSpcode(msg.spcode);
        }
    },

    showSpcode(spcode){
        if(spcode == 614){  // 银行密码错误
            cc.vv.FloatTip.show("wrong password");
        } else if(spcode == 615){   // 银行密码错误超过次数,锁定10分钟
            cc.vv.FloatTip.show("Error exceeds the number of times, lock for 10 minutes");
        } else if(spcode == 616){   // 银行登录信息过期，请重启登录银行
            cc.vv.FloatTip.show("The login information has expired, please restart the login");
        } else if(spcode == 617){   // 银行可使用的金币不足
            cc.vv.FloatTip.show("Not enough coins to use");
        }
    },

    showPanel(type){
        this._panelType = type;

        let editTit = cc.find("node_editBox/title", this.node).getComponent(cc.Label);
        if(type == 1){  // 存钱
            editTit.string = "Transfer In";
            cc.find("jiantou", this.node).scaleX = -1;
        } else {   // 取钱
            editTit.string = "Transfer Out";
            cc.find("jiantou", this.node).scaleX = 1;
        }

        cc.find("node_safe/coin", this.node).getComponent(cc.Label).string = Global.FormatNumToComma(this._selfCoin);
        cc.find("node_cure/coin", this.node).getComponent(cc.Label).string = Global.FormatNumToComma(this._bankCoin);
    },

    showSavePanel(){

    },

    onClickSave(){
        let tog = cc.find("tog_select/toggle1",this.node);
        let bCheck = tog.getComponent(cc.Toggle).isChecked;
        this.showPanel(1);
    },

    onClickTake(){
        let tog = cc.find("tog_select/toggle2",this.node);
        let bCheck = tog.getComponent(cc.Toggle).isChecked;

        this.showPanel(2);
        this._canOpr = true;
    },

    onClickReset(){
        this._editInput.string = "";
    },

    onClickYes(){
        if(!this._canOpr){
            return;
        }

        let str = this._editInput.string;

        if(str){
            if(Number(str) == 0){
                cc.vv.FloatTip.show("Please enter the correct amount");
            }
            else if(Number(str)%1 !==0){
                cc.vv.FloatTip.show("Please fill in whole numbers");
            }
            else if( this._panelType == 1){

                if(Number(str) > this._selfCoin){
                    cc.vv.FloatTip.show("Please enter correct amount");
                } else {
                    this._canOpr = false;
                    cc.vv.NetManager.send({ c: MsgId.REQ_SAFE_SAVE, coin:Number(str), gameid:0, deskid:0, token: this._token});
                }
            } else {
                if(Number(str) > this._bankCoin){
                    cc.vv.FloatTip.show("Please enter correct amount");
                } else {
                    this._canOpr = false;
                    cc.vv.NetManager.send({ c: MsgId.REQ_SAFE_TAKE, coin:Number(str), gameid:0, deskid:0, token: this._token});
                }
            }
        } else {
            cc.vv.FloatTip.show("Please enter the amount");
        }
    }

    // update (dt) {},
});
