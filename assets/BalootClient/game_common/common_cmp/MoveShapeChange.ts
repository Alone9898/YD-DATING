const { ccclass, property } = cc._decorator;

@ccclass
export class MoveShapeChange extends cc.Component {
    @property()
    _enabledShapeChange:boolean = false;
    @property(cc.Boolean)
    get enabledShapeChange():boolean {
        return this._enabledShapeChange;
    }
    set enabledShapeChange(boo:boolean) {
        if(this._enabledShapeChange == boo) {
            return;
        }
        this._enabledShapeChange = boo;
        this._shapChangeVector.x = 0;
        this._shapChangeVector.y = 0;
        this.shapeNode.skewX = 0;
        this.shapeNode.skewY = 0;
        if(boo) {
            this._prePos.x = this.posRefNode.x;
            this._prePos.y = this.posRefNode.y;
            this._shapOriginScale.scaleX = this.shapeNode.scaleX;
            this._shapOriginScale.scaleY = this.shapeNode.scaleY;
        }else {
            this.shapeNode.scaleX = this._shapOriginScale.scaleX;
            this.shapeNode.scaleY = this._shapOriginScale.scaleY;
        }
    }
    
    @property({
        type:cc.Node,
        tooltip:"用于形变动画的节点"
    })
    shapeNode:cc.Node = null;
    @property({
        type:cc.Node,
        tooltip:"用于坐标计算的节点"
    })
    posRefNode:cc.Node = null;

    _shapOriginScale = {scaleX:1, scaleY:1};
    _shapChangeVector:cc.Vec2 = cc.v2(0, 0); // 形变的向量
    _prePos:cc.Vec2 = cc.v2(0,0);   // 上次更新事件节点的位置

    protected onLoad(): void {
        if(!this.shapeNode) {
            this.shapeNode = this.node;
        }
        if(!this.posRefNode) {
            this.posRefNode = this.node;
        }
        if(this._enabledShapeChange) {
            this._prePos.x = this.posRefNode.x;
            this._prePos.y = this.posRefNode.y;
        }
    }

    update() {
        if(!this._enabledShapeChange) {
            return;
        }
        let currPos = this.posRefNode.getPosition();
        let delta = currPos.sub(this._prePos);
        delta.mulSelf(0.1);
        this._shapChangeVector.addSelf(delta);
        this._prePos = currPos;

        let maxSkewX = 5;
        let maxSkewY = 15;
        let attenuation = cc.v2(0.3, 0.9); // 衰减值
        if(this._shapChangeVector.x > 0) {
            attenuation.x = -attenuation.x;
        }
        if(this._shapChangeVector.y > 0) {
            attenuation.y = -attenuation.y;
        }
        this._shapChangeVector.addSelf(attenuation);
        if(Math.abs(this._shapChangeVector.x) <= Math.abs(attenuation.x)) {
            this._shapChangeVector.x = 0;
        }
        if(Math.abs(this._shapChangeVector.y) <= Math.abs(attenuation.y)) {
            this._shapChangeVector.y = 0;
        }
        this._shapChangeVector = this._shapChangeVector.clampf(cc.v2(-maxSkewX, -maxSkewY), cc.v2(maxSkewX, maxSkewY));
        if((this._shapChangeVector.x * this._shapChangeVector.y >= 0)) {
            this.shapeNode.skewX = -Math.abs(this._shapChangeVector.x);
            this.shapeNode.skewY = -Math.abs(this._shapChangeVector.y);   
        }else {
            this.shapeNode.skewX = Math.abs(this._shapChangeVector.x);   
            this.shapeNode.skewY = Math.abs(this._shapChangeVector.y);   
        }
        this.shapeNode.scaleX = this._shapOriginScale.scaleX - Math.abs(this.shapeNode.skewX*(0.2/maxSkewX));
        this.shapeNode.scaleY = this._shapOriginScale.scaleX - Math.abs(this.shapeNode.skewY*(0.2/maxSkewY));
    }
}
