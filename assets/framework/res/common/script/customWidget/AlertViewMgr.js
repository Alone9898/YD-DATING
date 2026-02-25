// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html
cc.Class({
    extends: cc.Component,

    properties: {
        // foo: {
        //     // ATTRIBUTES:
        //     default: null,        // The default value will be used only when the component attaching
        //                           // to a node for the first time
        //     type: cc.SpriteFrame, // optional, default is typeof default
        //     serializable: true,   // optional, default is true
        // },
        // bar: {
        //     get () {
        //         return this._bar;
        //     },
        //     set (value) {
        //         this._bar = value;
        //     }
        // },
        _prefab: null,
        _prefaburl: null,
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    init(url) {
        this._prefaburl = url
        this._loadCommPrefab(url)

    },

    showTips: function (tips, sureCb, strTitle, strBtnText) {
        let self = this
        if (cc.director.getScene() && tips) {
           
            let callback = function () {
                let preNode = cc.director.getScene().getChildByName("node_alterview")
                if (preNode) {
                    preNode.destroy()
                }

                let node = cc.instantiate(self._prefab);
                node.name = "node_alterview"
                node.getComponent("AlertView").showTips(tips, sureCb, strTitle, strBtnText);
                cc.director.getScene().addChild(node)
            }
            if (this._prefab) {
                callback()
            }
            else {
                this._loadCommPrefab(this._prefaburl, callback)
            }
        }
    },

    show: function (tips, sureCb, cancelCb, isShowCloseBtn, closeCb, strTitle, strLeftBtnText, strRightBtnText, autoCloseTime,autoCloseCb) {
        let self = this
        if (tips) {
            
            let callback = function () {
                let preNode = cc.director.getScene().getChildByName("node_alterview")
                if (preNode) {
                    preNode.destroy()
                }
                let node = cc.instantiate(self._prefab);
                node.name = "node_alterview"
                node.getComponent("AlertView").show(tips, sureCb, cancelCb, isShowCloseBtn, closeCb, strTitle, strLeftBtnText, strRightBtnText, autoCloseTime,autoCloseCb);
                cc.director.getScene().addChild(node)
            }
            if (this._prefab) {
                callback()
            }
            else {
                this._loadCommPrefab(this._prefaburl, callback)
            }
        }

    },

    //显示简易类型的确认提示框
    showSimple: function (tips, sureCb, cancelCb, isShowCloseBtn, closeCb, strTitle, strLeftBtnText, strRightBtnText) {
        cc.loader.loadRes("common/prefab/cashhero_AlterView", cc.Prefab, (err, prefab) => {
            if (!err) {
                let preNode = cc.director.getScene().getChildByName("simple_alterview")
                if (!preNode) {
                    let node = cc.instantiate(prefab);
                    node.name = "simple_alterview"
                    node.getComponent("AlertView").show(tips, sureCb, cancelCb, isShowCloseBtn, closeCb, strTitle, strLeftBtnText, strRightBtnText);
                    cc.director.getScene().addChild(node)
                }

            }
        });
    },

    hide: function () {
        let preNode = cc.director.getScene().getChildByName("node_alterview")
        if (preNode) {
            preNode.destroy()
        }
    },


    _loadCommPrefab: function (url, callback) {
        let self = this
        cc.loader.loadRes(url, cc.Prefab, (err, prefab) => {
            if (!err) {
                self._prefab = prefab
                if (callback) {
                    callback()
                }
            }
        });

    },

    start() {

    },

    // update (dt) {},
});
