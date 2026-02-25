/**
 * 通用的弹框背景
 * 1 点背景可以关闭
 * 2 透明度180
 * 3 有点击关闭的动画
 */
cc.Class({
    extends: cc.Component,

    properties: {
        close_btn:{
            default:null,
            type:cc.Node,
            tooltip:'关闭按钮，此控件并不知道关闭要执行什么逻辑，只是点击了。就模拟点击对应关闭按钮的逻辑。如果不设置就不显示Tap to close'
        }
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        //背景透明度
        let laybg = cc.find('lay_out',this.node).getComponent(cc.Layout)
        laybg.opacity = 192
         
       

        Global.btnClickEvent(this.node, this.onClickClose, this)

        // Global.FixDesignScale_V(this.node)
    },

    

    uiWidgetChange(){
        this.node.getComponent(cc.Widget).updateAlignment();
        let allwidget = this.node.getComponentInChildren(cc.Widget)
        for(let i = 0; i < allwidget.length; i++){
            let item = allwidget[i]
            item.updateAlignment()
        }
    },

    start () {
        if(this.close_btn){
            //tap动画
            this.showTapAction()
        }
        

        this._bCanClose()
    },

    showTapAction:function(){
        let self = this
        cc.loader.loadRes('CashHero/prefab/tap_close_tip',cc.Prefab, (err, prefab) => {
            if(cc.isValid(self.node)){
                let spr_tap = cc.find('tap_close_tip',self.node)
                if(!cc.find('tap_close_tip',spr_tap)){
                    if(cc.isValid(spr_tap)){
                        let spinNode = cc.instantiate(prefab)
                        spinNode.parent = spr_tap
                        spinNode.position = cc.v2(0,0)

                        spr_tap.opacity = 0
                        cc.tween(spr_tap)
                        // .delay(0.8)
                        .to(0.5,{opacity:255})
                        .repeatForever(
                            cc.tween()
                            .delay(8)
                            .to(0.5,{opacity:0})
                            .to(0.5,{opacity:255})
                            
                        )
                        .start()
                            
                        
                        

                    }
                }
                
            }
            
        })
        
        
    },

    onClickClose:function(event){
        if(!this._bCanCloseUI){
            return
        }
        if(!this.close_btn){ //未设置关闭按钮的。说明不需要点空白关闭界面
            return
        }
        //
        let btnCmp = this.close_btn.getComponent(cc.Button)
        if(btnCmp){
            let clickEvents = btnCmp.clickEvents
            cc.Component.EventHandler.emitEvents(clickEvents, event);
        }
        
        this.close_btn.emit('click',event)
    },

    _bCanClose:function(){
        
        
        let self = this
        self._bCanCloseUI = false
        let delayCall = function(){
            
            self._bCanCloseUI = true
        }
        this.scheduleOnce(delayCall,0.5)
    }

    // update (dt) {},
});
