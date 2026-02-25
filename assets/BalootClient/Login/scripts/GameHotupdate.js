/**
 * Cash hero hotupdate
 */
cc.Class({
    extends: require('hotupdate'),

    properties: {

    },
    onLoad () {
        // 重写，主要是为了修改适配方式
    },
    start () {

    },

    // 在登录场景 开始执行的热更新检测逻辑
    startUpdate() {
        this.initHotupdate()
        this.checkForceAppUpdate();
    },

    // 重写 进度条逻辑
    SetUpdateProcess: function (val,nDownByte,nTotalByte) {
        cc.vv.AppData.setHotupdateStart(true)
        
        let showVal = val 
        

        if(cc.isValid(this.progressBar,true)){
            let oldVal = this.progressBar.progress
            showVal = val > oldVal ?val:oldVal
            this.progressBar.progress = showVal
        }
        if(cc.isValid(this.lblTips,true)){
            let byteStr = cc.js.formatStr("(%sMB/%sMB)",((nDownByte/1024)/1024).toFixed(2),((nTotalByte/1024)/1024).toFixed(2)) 
            this.lblTips.string = Math.floor(showVal*100) + "%" + byteStr
        }

    },

});
