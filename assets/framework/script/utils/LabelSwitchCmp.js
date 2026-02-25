/**
 * @class LabelSwitchCmp
 */
cc.Class({
    extends:cc.Component,

    editor: {
        requireComponent:cc.Label,
        executeInEditMode: true,
    },

    properties: {
        fonts: {
            default:[],
            type:[cc.Font],
            tooltip:"bmf字体列表"
        },

        currIndex: {
            default:0,
            type:cc.Integer,
            tooltip: "默认显示字体在列表中的下标",

            notify(oldValue) {
                // if(oldValue == this._currIndex) {
                //     return;
                // }
                this._currIndex = this.currIndex;
                this.showLabel();
            }
        }
    },

    onload() {
        this.showLabel();
    },

    showLabel() {
        if(this.fonts.length>0) {
            this.node.getComponent(cc.Label).font = this.fonts[this._currIndex];
        }
    },

    /**
     * 通过bmf名字设置字体
     * @param {string} name
     */
    showLabelByName(name) {
        this.fonts.forEach(f => {
            if(f.name == name){
                this.node.getComponent(cc.Label).font = f;
            }
        });
    },

    /**
     * 设置下标
     * @param index
     */
    setIndex(index) {
        this._currIndex = index;
        this.showLabel();
    },

    getIndex() {
        return this._currIndex;
    },

    /**
     * 设置文本的值
     * @param val
     */
    setContent(val) {
        this.node.getComponent(cc.Label).string = val + "";
    }
})