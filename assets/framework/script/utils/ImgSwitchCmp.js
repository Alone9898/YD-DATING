/**
 * @class ImgSwitchCmp
 */
cc.Class({
    extends:cc.Component,

    editor: {
        requireComponent:cc.Sprite,
        executeInEditMode: true,
    },

    properties: {
        frames: {
            default:[],
            type:[cc.SpriteFrame],
            tooltip:"图片列表"
        },

        currIndex: {
            default:0,
            type:cc.Integer,
            tooltip: "默认显示图片在列表中的下标",

            notify(oldValue) {
                // if(oldValue == this._currIndex) {
                //     return;
                // }
                this._currIndex = this.currIndex;
                this.showSprite();
            }
        }
    },

    onload() {
        this.showSprite();
    },

    showSprite() {
        if(this.frames.length>0) { 
            this.node.getComponent(cc.Sprite).spriteFrame = this.frames[this._currIndex];
        }
    },

    /**
     * 通过纹理名字显示图片
     * @param {string} name
     */
    showSpriteByName(name) {
        this.frames.forEach(frame => {
            if(frame.name == name){
                this.node.getComponent(cc.Sprite).spriteFrame = frame;
            }
        });
    },

    /**
     * 设置下表
     * @param index
     */
    setIndex(index) {
        this._currIndex = index;
        this.showSprite();
    },

    getIndex() {
        return this._currIndex;
    }
})