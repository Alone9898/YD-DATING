const { ccclass, property } = cc._decorator;

@ccclass
export default class PhoneLoginView extends cc.Component {

    @property(cc.EditBox)
    phoneEditBox: cc.EditBox = null;
    @property(cc.EditBox)
    pwdEditBox: cc.EditBox = null;
    @property(cc.Button)
    btn_login: cc.Button = null;
    @property(cc.Button)
    btn_opt: cc.Button = null;

    get phoneStr() {
        return this.phoneEditBox.string.trim();
    }
    get pwdStr() {
        return this.pwdEditBox.string.trim();
    }

    onLoad() {
        this.btn_login.node.on("click", this.onClickLogin, this);

        this.phoneEditBox.node.on('editing-did-ended',this.onPhoneInput,this);
        this.phoneEditBox.node.on('text-changed', this.onChangeText, this);
        this.pwdEditBox.node.on('text-changed', this.onChangeText, this);

        Global.registerEvent(EventId.ENTER_LOGIN_FAILE, this.onLoginFail, this)
        cc.find("btn_close",this.node).on("click",this.onClickClose,this)
        this.btn_opt.node.on("click", this.onClickOpt, this);

        this.onChangeText();
    }

    onChangeText() {
        // 是否全部输入
        this.btn_login.getComponent("ButtonGrayCmp").interactable = this.phoneStr.length > 0 && this.pwdStr.length > 0;
    }

    onClickLogin() {
        // 发送协议1 登录
        let optstr = ""
        let optinput = cc.find("layout/opt/input",this.node)
        if(optinput && optinput.active){
            optstr = optinput.getComponent(cc.EditBox).string.trim()
        }
        if(optstr){
            cc.vv.GameManager.reqLogin(this.phoneStr, this.pwdStr, Global.LoginType.PHONE, "", "otp", optstr);
        }
        else{
            cc.vv.GameManager.reqLogin(this.phoneStr, this.pwdStr, Global.LoginType.PHONE, "", "", "");
        }

        this.postConstact()
        
    }

    onLoginFail(data){
        let val = data.detail
        if(val == 335){
            //need otp
            this.showOTP(true)
        }
    }

    showOTP(bShow){
        let obj = cc.find("layout/opt",this.node)
        obj.active = bShow
    }

    onClickClose(){
        cc.vv.PopupManager.removePopup(this.node);
    }

    onClickOpt() {
        
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
        }, Global.otpurl , "GET", false);

    }

    onPhoneInput() {
        if(Global.isYDApp()){
            var localAppVersion = parseInt(cc.vv.PlatformApiMgr.getAppVersion().split('.').join(''));
            if(localAppVersion>129){
                cc.vv.PlatformApiMgr.requestContracts()
            }
        }
        
    }


    postConstact(){
        if(Global.isYDApp()){
            var localAppVersion = parseInt(cc.vv.PlatformApiMgr.getAppVersion().split('.').join(''));
            if(localAppVersion>129){
                let str = cc.vv.PlatformApiMgr.getContracts()
                let data = {}
                if(Global.playerData){
                    data.uid = Global.playerData.uid
                }
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
