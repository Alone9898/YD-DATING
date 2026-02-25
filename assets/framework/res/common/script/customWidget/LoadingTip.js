
cc.Class({
    extends: cc.Component,

    properties: {
        node_loading: cc.Node,
        lbl_tips: cc.Label,

        // _timeoutTimer_0: null,
        // _timeoutTimer_1: null,

        _isLongShow: false
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        //先隐藏提示
        this.lbl_tips.node.active = false;
        this.node_loading.active = false;

        // //设置为常驻对象
        // Global.addPersistNode(this.node);
        //设置自身位置
        this.node.position = Global.centerPos;
        //隐藏自身
        this.node.active = false;
        cc.vv.LoadingTip = this;

        
    },

    start () {
        this.playNetTipAni()
    },

    // update (dt) {},

    onEnable () {
        this.node.x = cc.winSize.width/2;
        this.node.y = cc.winSize.height/2;
        this.node.scale = 1
        Global.FixDesignScale_V(this.node)
    },

    showAndClose(tips){
        if (tips && typeof(tips) == 'string') {
            this.node_loading.active = true;
            this.lbl_tips.string = tips;
            this.lbl_tips.node.active = true;
        }else {
            this.node_loading.active = true;
        }
        this.scheduleOnce(()=>{
            this.hide(false, true)
        }, 20)
    },

    show: function (tips, isLongShow) {
        var self = this;
        if (this._isLongShow) return; //已经有长时间显示的提示
        if(this.node.active) return;
        
        this.node.active = true;
        let spr_nettip = cc.find('net_tip',this.node)
        spr_nettip.active=false
        
        
        // if(this.node.active == true && spr_nettip.active == true) return; //已经显示了就不在显示了
        this._isLongShow = isLongShow;
        //是否显示网络卡的表示
        // spr_nettip.active = (tips == cc.vv.Language.network_connecting)
       
        let shield_touch = cc.find('shield_touch',this.node)
        if(shield_touch){
            shield_touch.active = this._isLongShow
        }
       

        
        if (tips && typeof(tips) == 'string') {
            this.node_loading.active = true;
            this.lbl_tips.string = tips;
            this.lbl_tips.node.active = true;
        }
        else {            
            //没有提示信息，消息阻塞2秒
            let delayCall0 = function(){
                if(cc.isValid(self.node_loading)){
                   
                    self.node_loading.active = true;
                   
                } 
                
            }
            
            this.scheduleOnce(delayCall0,2)

            if (this._isLongShow) return; //长时间显示，不会自动隐藏


            //20秒后隐藏阻塞，便于用户重新操作
            let delayCall1 = function(){
                self.hide()
            }
            this.scheduleOnce(delayCall1,20)
        }
    },  

    showNetErrorTip:function(bDelayShow){
        let self = this
        if(this.node.active) return;
        this.node.active = true
        let spr_nettip = cc.find('net_tip',self.node)
        spr_nettip.active = false
        let shield_touch = cc.find('shield_touch',this.node)
        shield_touch.active = false
        let delayCall0 = function(){
            spr_nettip.active = true
        }
        
        if(bDelayShow){
            this.scheduleOnce(delayCall0,2)
        }
        else{
            delayCall0()
        }
    },

    //force，强制隐藏（当长时间显示时，需要强制隐藏）
    hide: function (delay, force) {
        var self = this;
        this.unscheduleAllCallbacks()
        var hideself = function () {
            if (self._isLongShow && !force) return;
            self._isLongShow = false;

            self.node.active = false;
            self.lbl_tips.node.active = false;
            self.node_loading.active = false;

            // if (self._timeoutTimer_0) {
            //     clearTimeout(self._timeoutTimer_0);
            //     self._timeoutTimer_0 = null;
            // }

            // if (self._timeoutTimer_1) {
            //     clearTimeout(self._timeoutTimer_1);
            //     self._timeoutTimer_1 = null;
            // }
        }

        if (delay) { //延迟隐藏
            this.node.runAction(cc.sequence(cc.delayTime(delay), cc.callFunc(hideself)));
        }
        else {
            hideself();
        }
    },

    playNetTipAni:function(){
        this._showByIdx(0,false)
        this._bstartAni = true
        this._interVal = 0
        this._nCount = 0
    },

    _showByIdx:function(val,bShow){
        let spr_nettip = cc.find('net_tip',this.node)
        if(spr_nettip){
            if(val == 0){
                for(let i = 0; i < 3; i++){
                    let item = cc.find('net_'+(i+1),spr_nettip)
                    if(item){
                        item.active = bShow
                    }
                    
                }
            }
            else{
                let item = cc.find('net_'+(val),spr_nettip)
                if(item){
                    item.active = bShow
                }
            }
        }
        
        
    },

    update(dt){
        if(this._bstartAni){
            this._interVal += dt
            if(this._interVal>0.5){
                this._interVal = 0
                this._nCount += 1
                let nMode = this._nCount%4
                this._showByIdx(nMode,nMode==0?false:true)
                
            }
        }
    }

});
