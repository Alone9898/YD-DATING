/**
 * 
 */

cc.Class({
    extends: cc.Component,

    properties: {
        win_font:cc.BitmapFont,
        lose_font:cc.BitmapFont,
        win_sprite:cc.SpriteFrame,
        lose_sprite:cc.SpriteFrame,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this._org_x = this.node.x;
        this._org_y = this.node.y;
        this._orgWorldPos = this.node.convertToWorldSpaceAR(cc.v2(0,0));
    },

    start () {

    },

    //设置分数
    setScore:function(val){
        this.node.stopAllActions()
        // if(this.node.getNumberOfRunningActions() == 0){
            let show_font = this.lose_font
            let show_sprite = this.lose_sprite
            let pre = ""
            if(val > 0){
                show_font = this.win_font
                show_sprite = this.win_sprite
                pre = "+"
            }
            let lbl = cc.find("val",this.node).getComponent(cc.Label)
            lbl.string = pre + Global.FormatNumToComma(val)
            lbl.font = show_font
            this.node.getComponent(cc.Sprite).spriteFrame = show_sprite
    
            this.node.active = true
            this.node.scale = 1.5
            this.node.y = this._org_y

            lbl._forceUpdateRenderData(true); // 这里调用一次手动渲染
            let nWidth = lbl.node.width * this.node.scale;
            let worldPos = this._orgWorldPos;
            if(worldPos.x - nWidth/2 < 0){
                this.node.x = this._org_x + Math.abs(worldPos.x - nWidth/2);
            } else if(worldPos.x + nWidth/2 > cc.winSize.width){
                this.node.x = this._org_x - Math.abs(cc.winSize.width - (worldPos.x + nWidth/2));
            } else {
                this.node.x = this._org_x;
            }
            
            cc.tween(this.node)
            .to(0.5,{y:this._org_y+60})
            .delay(1)
            .call(()=>{
                this.node.active = false
            })
            .start()
        // }
        
    }

    // update (dt) {},
});
