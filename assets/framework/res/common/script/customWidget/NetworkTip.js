/**
 * 网络卡的提示
 */
cc.Class({
    extends: require('UI_popwin_interface'),

    properties: {
        _clickCall:null,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        let btn_conn = cc.find('btn_connect',this.node)
        btn_conn.on('click',this.onClickReconnect,this)
    },

    start () {

    },

    showUI:function(clickCall){
        this._clickCall = clickCall
    },

    //断线重连
    onClickReconnect:function(){
        if(this._clickCall){
            this._clickCall()
        }
        this.node.destroy()
    },

    // update (dt) {},
});
