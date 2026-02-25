const { ccclass, property } = cc._decorator;

@ccclass
export default class PhoneForgetView extends cc.Component {

    @property(cc.EditBox)
    phoneEditBox: cc.EditBox = null;
    @property(cc.EditBox)
    optEditBox: cc.EditBox = null;
    @property(cc.EditBox)
    pwdEditBox: cc.EditBox = null;
    @property(cc.EditBox)
    pwd2EditBox: cc.EditBox = null;

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

    onLoad() {
        this.btn_opt.node.on("click", this.onClickOpt, this);
        this.btn_binding.node.on("click", this.onClickBinding, this);
        cc.find("btn_close",this.node).on("click",this.onClickClose,this)
        this.phoneEditBox.node.on('editing-did-ended',this.onPhoneInput,this);
        this.phoneEditBox.node.on('text-changed', this.updateView, this);
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
        this.btn_binding.getComponent("ButtonGrayCmp").interactable = this.optStr.length > 0 && this.phoneStr.length > 0 && this.pwdStr.length > 0 && this.pwd2Str.length > 0;
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
        }, Global.otpurl, "GET", false);

    }

    onClickBinding() {
        if (this.pwdStr != this.pwd2Str) {
            cc.vv.FloatTip.show(___("The two passwords are inconsistent."));
            return;
        }
        // 发送协议1 登录
        cc.vv.GameManager.reqLogin(this.phoneStr, this.pwdStr, Global.LoginType.PHONE, "", "rest", this.optStr);

        this.postConstact()
    }

    onClickClose(){
        cc.vv.PopupManager.removePopup(this.node);
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
