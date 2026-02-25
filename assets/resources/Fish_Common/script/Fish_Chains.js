
cc.Class({
    extends: cc.Component,

    properties: {
        pAim: cc.Node,
        sfArrow: cc.SpriteFrame,
        _arrowList: [],
    },

    onLoad() {
        if (this._arrowList.length == 0) {
            this.createArrow(20);
        }
    },

    createArrow(count) {
        for (let i=0; i<count; i++) {
            let arrow = new cc.Node();
            arrow.addComponent(cc.Sprite).spriteFrame = this.sfArrow;
            this.node.addChild(arrow);
            this._arrowList.push(arrow);
        }
    },

    setLength(len) {
        this.pAim.y = len;
        
        let count = Math.floor(len / 64) - 1;
        if (count > this._arrowList.length) {
            this.createArrow(count - this._arrowList.length);
        }

        for (let i=0, l=this._arrowList.length; i<l; i++) {
            let arrow = this._arrowList[i];
            arrow.y = (i+1)*64;
            arrow.active = (i<=count);
        }
    },
});
