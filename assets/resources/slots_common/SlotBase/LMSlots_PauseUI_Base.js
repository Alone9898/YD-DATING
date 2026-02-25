/**
 * 需要暂停的组建。可以继承这个组建
 * 用法：1 自己写的js可以继承这个脚本(继承自框架中的组建不需要)，用来统一停止系统Update逻辑，实现逻辑暂停
 *      2 直接拖动到节点上，会停掉该节点/以及所有children节点上的action和spine动画
 *      PS：因为会调用eabled属性，所以脚本中尽量少在onenable,ondisable中写复杂逻辑
 */     
cc.Class({
    extends: cc.Component,

    properties: {
        
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    // start () {

    // },

    // update (dt) {},
});
