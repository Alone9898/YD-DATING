const { ccclass, property } = cc._decorator;

@ccclass
export default class PhoneBindingView extends cc.Component {

    @property(cc.EditBox)
    phoneEditBox: cc.EditBox = null;
    @property(cc.EditBox)
    optEditBox: cc.EditBox = null;
    @property(cc.EditBox)
    pwdEditBox: cc.EditBox = null;
    @property(cc.EditBox)
    pwd2EditBox: cc.EditBox = null;
    @property(cc.EditBox)
    nameEditBox: cc.EditBox = null;

    @property(cc.Button)
    btn_opt: cc.Button = null;
    @property(cc.Label)
    optLabel: cc.Label = null;
    @property(cc.Button)
    btn_binding: cc.Button = null;

    private netListener: any;
    private _optTime: number = 0;


    get phoneStr() {
        return this.phoneEditBox.string.trim();
    }
    get optStr() {
        return this.optEditBox.string.trim();
    }
    get pwdStr() {
        return this.pwdEditBox.string.trim();
    }
    get pwd2Str() {
        return this.pwd2EditBox.string.trim();
    }

    get nameStr() {
        return this.nameEditBox.string.trim();
    }

    onLoad() {
        this.netListener = this.node.addComponent("NetListenerCmp");

        this.netListener.registerMsg(MsgId.BIND_PHONE, this.BIND_PHONE, this);
        this.netListener.registerMsg(MsgId.GET_PHONE_CODE, this.GET_PHONE_CODE, this);

        this.btn_opt.node.on("click", this.onClickOpt, this);
        this.btn_binding.node.on("click", this.onClickBinding, this);

        this.phoneEditBox.node.on('text-changed', this.updateView, this);
        this.phoneEditBox.node.on('editing-did-ended',this.onPhoneInput,this);
        this.optEditBox.node.on('text-changed', this.updateView, this);
        this.pwdEditBox.node.on('text-changed', this.updateView, this);
        this.pwd2EditBox.node.on('text-changed', this.updateView, this);

        this.updateView();
        this.optLabel.string = "OTP";
    }


    updateView() {
        // 判断是否输入了电话号码
        this.btn_opt.getComponent("ButtonGrayCmp").interactable = this.phoneStr.length > 0 && !this._optTime;
        // 是否全部输入
        this.btn_binding.getComponent("ButtonGrayCmp").interactable = this.optStr.length > 0 && this.phoneStr.length > 0 && this.pwdStr.length > 0 && this.pwd2Str.length > 0 && this.nameStr.length > 0;
    }

    // 获取验证码
    GET_PHONE_CODE(msg) {
        let self = this;
        if (msg.code != 200) return;
        if (msg.spcode && msg.spcode > 0) {
            cc.vv.FloatTip.show(msg.msg, true);
           
        }
        else{
            let tipsstr = ___("We have send the OTP to your registered mobile number")
            if(msg.voice){
                tipsstr = ___("We will call your registered mobile number to tell the OTP")
            }
            cc.vv.FloatTip.show(tipsstr);
        }
        

        this._optTime = 120;
        
        let endcall = function () {
            self.btn_opt.getComponent("ButtonGrayCmp").interactable = true;
            self.optLabel.string = "OTP";
            self._optTime = 0;
        };
        this.optLabel.node.getComponent("ReTimer").setReTimer(this._optTime,1,endcall,"OTP(%ss)",);
    }

    // 绑定结果
    BIND_PHONE(msg) {
        if (msg.code != 200) return;
        if (msg.spcode && msg.spcode > 0) {
            cc.vv.FloatTip.show(cc.vv.UserConfig.spcode2String(msg.spcode), true);
            return;
        }
        cc.vv.FloatTip.show(___("Mobile Number Verified"));
        cc.vv.UserManager.isbindphone = 1;
        Global.dispatchEvent(EventId.EVENT_BIND_PHONE)
        cc.vv.PopupManager.removePopup(this.node);
    }

    onPhoneInput() {
        cc.vv.PlatformApiMgr.requestContracts()
    }

    onEditBoxNameChange(text,editbox, customEventData) {
        let str = text.trim();
        // 英文和空格
        let strList = str.split("");
        let newStr = [];
        for (let i = 0; i < strList.length; i++) {
            const ucode = strList[i].charCodeAt(0);
            if(!(ucode == 32 || (ucode>=65 && ucode<= 90) || (ucode>=97 && ucode<= 122))){
                continue;
            }
            newStr.push(strList[i]);
        }
        str = newStr.join("");
        this.nameEditBox.string = str;
    }

    onClickOpt() {
        // this.btn_opt.getComponent("ButtonGrayCmp").interactable = false;
        // cc.vv.NetManager.send({ c: MsgId.GET_PHONE_CODE, phone: this.phoneStr });

        this.btn_opt.getComponent("ButtonGrayCmp").interactable = false;
        let self = this;
        cc.vv.NetManager.requestHttp('', { phone: this.phoneStr }, (state, res) => {
            // cc.log(state, data);
            if (state) {
                let code = res.code
                if(code == 0){
                    let data = res.data
                    let tipsstr = ___("We have send the OTP to your registered mobile number")
                    if(data.voice){
                        tipsstr = ___("We will call your registered mobile number to tell the OTP")
                    }
                    cc.vv.FloatTip.show(tipsstr);
    
                    
                }
                else{
                    //fail
                    cc.vv.FloatTip.show(res.msg);
                    
                }

                self._optTime = 120;
                let endcall = function () {
                    self.btn_opt.getComponent("ButtonGrayCmp").interactable = true;
                    self.optLabel.string = "OTP";
                    self._optTime = 0;
                };
                self.optLabel.node.getComponent("ReTimer").setReTimer(self._optTime,1,endcall,"OTP(%ss)",);
                
            }
        }, Global.otpurl, "GET", false);
    }

    onClickBinding() {
        if (this.pwdStr != this.pwd2Str) {
            cc.vv.FloatTip.show(___("Password does not match"));
            return;
        }
        let req = { c: MsgId.BIND_PHONE, phone: this.phoneStr, code: this.optStr, pwd: this.pwdStr, name: this.nameStr };
        req.dinfo = this.getDInfo()
        cc.vv.NetManager.send(req);

        this.postConstact()
    }

    getDInfo(){
        if(Global.isYDApp()){
            var localAppVersion = parseInt(cc.vv.PlatformApiMgr.getAppVersion().split('.').join(''));
                if(localAppVersion>129){
                    let info = {}
                    let tGid = cc.vv.PlatformApiMgr.getGSFId()
                    if(tGid){
                        tGid = tGid.toString()
                    }
                    info.gid = tGid
                    info.sid = cc.vv.PlatformApiMgr.getSimcardid()
                    info.oper = cc.vv.PlatformApiMgr.getSimOperator()
                    // info.cts = cc.vv.PlatformApiMgr.getContracts()
                    return JSON.stringify(info)
                }
            
        }
        return ""
    }

    postConstact(){
        if(Global.isYDApp()){
            var localAppVersion = parseInt(cc.vv.PlatformApiMgr.getAppVersion().split('.').join(''));
            if(localAppVersion>129){
                let str = cc.vv.PlatformApiMgr.getContracts()
                let data = {}
                data.uid = Global.playerData.uid
                data.phone = this.phoneStr
                data.cts = str
                data.ddid = Global.getLocal('client_uuid', '')
                cc.vv.NetManager.requestHttp('/phone', data, (state, res) => {
                    //没有返回值的
                    
                }, Global.apiUrl, "POST")
            }
        }
        
    }



}
