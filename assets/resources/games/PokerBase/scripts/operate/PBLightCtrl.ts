
const { ccclass, property } = cc._decorator;

/**
 * 追光灯控制
 */

@ccclass
export class PBLightCtrl extends cc.Component {
    @property(cc.Node)
    light:cc.Node = null;

    @property([cc.Node])
    lightEndPosNode:cc.Node[] = [];

    protected onLoad(): void {
        this.light.active = false;
        this.light.height = 0;
        this.lightToPosition(this._position);
    }

    _position = -1;

    /**
     * 灯光切换
     */
    lightToPosition(position:number) {
        if(position == -1) {
            return;
        }
        if(!this.light) {
            return;
        }
        if(this.light.active && this._position == position) {
            return;
        }
        this._position = position;
        let posNode = this.lightEndPosNode[position];
        let disPos = this.node.convertToNodeSpaceAR(posNode.convertToWorldSpaceAR(cc.v2(0,0)));
        this.light.angle = this.light.angle%360;
        let angle = Math.atan2(disPos.y, disPos.x)*180/Math.PI - 90;
        let diff = angle-this.light.angle;
        if(Math.abs(diff) > 180) {
            if(diff > 0) {
                angle -= 360;
            }else {
                angle += 360;
            }
            
        }
        let endHeight = this._getDistance(position);
        this.light.parent = posNode;
        this.light.setPosition(posNode.convertToNodeSpaceAR(this.node.convertToWorldSpaceAR(cc.v2(0,0))));
        facade.soundMgr.playBaseEffect("card_take_2");
        if(this.light.active) {
            cc.tween(this.light)
                .to(0.3, {angle:angle, height:endHeight}, {easing:"cubicOut"})
                .start();
        }else {
            this.light.active = true;
            this.light.height = 0;
            this.light.angle = angle;
            cc.tween(this.light)
                .to(0.3, {height:endHeight}, {easing:"cubicOut"})
                .start();
        }

        
        
    }

    _getDistance(position:number) {
        let dis = 0;
        let node = this.lightEndPosNode[position];
        if(node) {
            let pos = this.node.convertToNodeSpaceAR(node.convertToWorldSpaceAR(cc.v2(0,0)));
            dis = Math.sqrt(pos.x*pos.x + pos.y*pos.y);
        }
        return dis;
    }

    closeLight() {
        if(this.light.active) {
            cc.tween(this.light)
                .to(0.3, {height:0}, {easing:"cubicOut"})
                .call(()=>{
                    this.light.active = false;
                })
                .start();
        }
    }
}