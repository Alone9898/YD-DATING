/**
 * 拖动节点
 */
cc.Class({
    extends: cc.Component,

    properties: {
        bCanOutScreen:{
            default:false,
            tooltip:'是否允许拖动超出屏幕'
        }
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},
    onEnable() {
        this.node.on(cc.Node.EventType.TOUCH_MOVE, this._onTouchMove, this);
        this.node.on(cc.Node.EventType.TOUCH_END, this._onTouchEnd, this);
    },

    onDisable() {
        this.node.off(cc.Node.EventType.TOUCH_MOVE, this._onTouchMove, this);
        this.node.off(cc.Node.EventType.TOUCH_END, this._onTouchEnd, this);
    },

    _onTouchMove(touchEvent) {
        let location = touchEvent.getLocation();
        if(!this.bCanOutScreen){
            let nWinWidth = cc.winSize.width
            let nWinHeight = cc.winSize.height
            
            
            let newPos = location

            let nodeWidth = this.node.width
            let nodeHeight = this.node.height
            //cc.log('屏幕width：'+nWinWidth + ' 节点width:'+nodeWidth)
            //不允许超出屏幕
            if(newPos.x + nodeWidth/2 > nWinWidth) newPos.x = nWinWidth - nodeWidth/2
            if(newPos.x - nodeWidth/2 < 0) newPos.x = nodeWidth/2
            if(newPos.y + nodeHeight/2 > nWinHeight) newPos.y = nWinHeight - nodeHeight/2
            if(newPos.y - 2*nodeHeight/2 < 0) newPos.y = 2*nodeHeight/2
            this.node.position = this.node.parent.convertToNodeSpaceAR(newPos); // 确定位置
        }
        else{
            this.node.position = this.node.parent.convertToNodeSpaceAR(location); // 确定位置
        }
        
    },

    _onTouchEnd(touchEvent) {
        // 放下
    },

    start () {

    },

    // update (dt) {},
});
