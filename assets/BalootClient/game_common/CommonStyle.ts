/**
 * 通用风格
 */

class _CommonStyle {
    /**
     * 快速显示 0.1 显示node scale:0.9->1 opacity:1->0xff  easing:"backOut"
    */
    fastShow(node:cc.Node, cbHandler:Function=null) {
        node.active = true;
        node.scale = 0.9;
        node.opacity = 0x1;
        node.stopAllActions();
        cc.tween(node)
            .to(0.1, {opacity:0xff, scale:1}, {easing:"backOut"})
            .call(()=>{
                if(cbHandler) {
                    cbHandler();
                }
            })
            .start();
    }

    /**
     * 快速隐藏 0.1 显示node scale:1->0.9 opacity:0xff->0  easing:"backIn"
    */
    fastHide(node:cc.Node, cbHandler:Function=null) {
        node.stopAllActions();
        if(!node.active) {
            return;
        }
        cc.tween(node)
            .to(0.1, {opacity:0, scale:0.9}, {easing:"backIn"})
            .call(()=>{
                node.active = false;
                if(cbHandler) {
                    cbHandler();
                }
            })
            .start();
    }
}

export let CommonStyle = new _CommonStyle();