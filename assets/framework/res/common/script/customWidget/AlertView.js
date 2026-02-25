// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html

cc.Class({
    extends: cc.Component,

    properties: {
        btn_close: cc.Button,
        btn_sure: cc.Button,
        btn_cancel: cc.Button,
        lbl_content: cc.Label,
        // btn_sure2:cc.Button,

        _sure_btn_posx: 0,
        _cancel_btn_posx: 0,
        _center_posx: 0,

        _sureBtnCb: null,
        _cancelBtnCb: null,
        _closeBtnCb: null,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        this.node.zIndex = Global.CONST_NUM.HIGHT_ZORDER;
        this.autoAdaptSize();
    },

    start() {
        // //根据不同的设计分辨率，采用不同的缩放
        // //本来是采用1024*720来的，但是有些场景中用了800*600的方式
        // var canvasNode = cc.find('Canvas');

        // var frameWidth = canvasNode.width;
        // var frameHeight = canvasNode.height;
        // // var canvas = canvasNode.getComponent(cc.Canvas);
        // // var designWidth = canvas.designResolution.width;
        // // var designHeight = canvas.designResolution.height;

        // // let curDesignSize = cc.view.getDesignResolutionSize ()
        // let xScale = frameWidth / Global.designSize.width
        // let yScale = frameHeight / Global.designSize.height
        // if (frameWidth < frameHeight) {
        //     //xScale = frameWidth / Global.designSize.height
        //     //yScale = frameHeight / Global.designSize.width
        //     if(xScale < yScale){
        //         yScale = xScale
        //     }
        //     else{
        //         xScale = yScale
        //     }
        // }
        // let scaleNode = this.node.getChildByName('ui_bg')
        // //scaleNode.scaleX = xScale
        // //scaleNode.scaleY = yScale

    },

    autoAdaptSize() {
        Global.FixDesignScale_V(this.node)

        // //根据不同的设计分辨率，采用不同的缩放
        // //本来是采用1024*720来的，但是有些场景中用了800*600(1560*720)的方式
        // let canvasNode = cc.find('Canvas');
        // var canvasDesignWidth = canvasNode.getComponent(cc.Canvas).designResolution.width;
        // var canvasDesignHeight = canvasNode.getComponent(cc.Canvas).designResolution.height;
        // if (canvasNode) {
        //     var designWidth = 1560;
        //     var designHeight = 720;
        //     let xScale = canvasDesignWidth/designWidth;
        //     let yScale = canvasDesignHeight/designHeight;
        //     this.node.scale = Math.min(xScale, yScale); //按照较小的缩放
        // }

        // //横竖屏适配
        // if (canvasDesignHeight > canvasDesignWidth) { //竖屏
        //     let width = canvasNode.width;
        //     let ui = this.node.getChildByName("spr_ui_bg");
        //     if(ui){
        //         let ui_width = ui.width*this.node.scale;
        //         ui.setScale((width - 60)/ui_width);
        //     }
        // }
    },

    //update (dt) {},
    // init(){
    //     //保存按钮位置
    //     this._sure_btn_posx = this.btn_sure.node.x;
    //     this._cancel_btn_posx = this.btn_cancel.node.x;
    //     this._center_posx = this._cancel_btn_posx + (this._sure_btn_posx - this._cancel_btn_posx)*0.5;
    // },


    onEnable() {
        this.node.x = cc.winSize.width / 2;
        this.node.y = cc.winSize.height / 2;

        let scale = this.node.scale
        Global.showAlertAction(this.node, true, 0.1, scale, null)
    },

    //显示一个单独的确定按钮
    showTips: function (tips, sureCb, strTitle, strBtnText) {
        // this.init();
        this.hideBtns();
        this.lbl_content.string = (tips && tips.length > 0) ? tips : '';

        this.btn_sure.node.active = true;
        // this.btn_sure.node.x = this._center_posx;
        // this.btn_sure.node.y = this.btn_close.node.y
        if (sureCb) {
            this._sureBtnCb = sureCb
        }

        this._setTitle(strTitle)
        this._setBtnText(this.btn_sure.node, strBtnText)

        Global.playComEff("ch_notification");
    },

    /**
     * 
     * @param {*} tips 提示内容
     * @param {*} sureCb 确定回调
     * @param {*} cancelCb 取消回调，如果是个空函数，相当于一个关闭按钮
     * @param {*} isShowCloseBtn 
     * @param {*} closeCb 
     */
    show: function (tips, sureCb, cancelCb, isShowCloseBtn, closeCb, strTitle, strLeftBtnText, strRightBtnText, autoCloseTime = 0, autoCloseCb) {
        // this.init();
        this.hideBtns();
        this.lbl_content.string = (tips && tips.length > 0) ? tips : '';
        this.unscheduleAllCallbacks();
        let sureBtn = null
        if (sureCb) {
            this._sureBtnCb = sureCb;
            // let bShowSure2 = cancelCb ? false : true;
            // sureBtn = bShowSure2?this.btn_sure2:this.btn_sure
            this.btn_sure.node.active = true
            // this.btn_sure2.node.active = bShowSure2

        }

        if (cancelCb) {
            this._cancelBtnCb = cancelCb;
            this.btn_cancel.node.active = true;
            // this.btn_cancel.node.x = this._cancel_btn_posx;
        }

        // //不显示取消按钮的时候，确认按钮和关闭按钮对其
        // if(this.btn_sure.node.active && !this.btn_cancel.node.active){
        //     this.btn_sure.node.y = this.btn_close.node.y
        // }

        if (isShowCloseBtn) {
            this.btn_close.node.active = true;
            if (closeCb) {
                this._closeBtnCb = closeCb;
            }
        }
        else {
            // if(!cancelCb){
            //     sureBtn.node.x = this._center_posx;
            // }
        }
        strTitle && this._setTitle(strTitle)
        this._setBtnText(this.btn_cancel.node, strLeftBtnText)
        this._setBtnText(this.btn_sure.node, strRightBtnText)

        Global.playComEff("ch_notification");

        if (autoCloseTime > 0) {
            this.scheduleOnce(() => {
                if (autoCloseCb) {
                    this._autoCb = autoCloseCb;
                    this.onAutoFunc();
                } else {
                    this.onCloseBtnClicked();
                }
            }, autoCloseTime);
        }
    },

    hideBtns: function () {
        this.btn_close.node.active = false;
        this.btn_cancel.node.active = false;
        this.btn_sure.node.active = false;
        // this.btn_sure2.node.active = false

        //事件也重置
        this._closeBtnCb = null
        this._sureBtnCb = null
        this._cancelBtnCb = null

    },

    onCloseBtnClicked: function () {
        // Global.playEff(Global.SOUNDS.eff_ui_close);
        cc.vv.EventManager.emit("EVENT_BTN_CLICK_SOUNDS");
        if (this._closeBtnCb) {
            this._closeBtnCb();
        }
        this.node.destroy();
    },

    onSureBtnClicked: function () {
        // Global.playEff(Global.SOUNDS.eff_click);
        cc.vv.EventManager.emit("EVENT_BTN_CLICK_SOUNDS");
        if (this._sureBtnCb) {
            this._sureBtnCb();
        }
        this.node.destroy();
    },

    onCancelBtnClicked: function () {
        // Global.playEff(Global.SOUNDS.eff_click);
        cc.vv.EventManager.emit("EVENT_BTN_CLICK_SOUNDS");

        if (this._cancelBtnCb) {
            this._cancelBtnCb();
        }
        this.node.destroy();
    },

    onAutoFunc() {
        if (this._autoCb) {
            this._autoCb();
        }
        this.node.destroy();
    },

    _setTitle: function (strTitle) {
        strTitle = strTitle || "TIPS"
        let lblTitle = cc.find('lbl_title', this.node)
        lblTitle.getComponent(cc.Label).string = strTitle || "TIPS"
        let i18nLabel = lblTitle.getComponent("i18nLabel")
        if (i18nLabel) {
            i18nLabel.string = strTitle
        }
    },

    _setBtnText: function (btnObj, strText) {
        if (btnObj && strText) {
            cc.find("btn_text", btnObj).getComponent(cc.Label).string = strText
            let i18nLabel = cc.find("btn_text", btnObj).getComponent("i18nLabel")
            if (i18nLabel) {
                i18nLabel.string = strText
            }
        }
    },
});
