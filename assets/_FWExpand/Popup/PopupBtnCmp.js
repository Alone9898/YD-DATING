let PopupType = cc.Enum({
    Prefab: 1,
    Path: 2,
});

let AnimType = cc.Enum({
    None: 1,
    OpacityIn: 2,
    ScaleIn: 3,
    BottomIn: 4,
    RightIn: 5,
    LeftIn: 6,
});

let CloseAnimType = cc.Enum({
    None: 1,
    ScaleOut: 2,
    // OpacityIn: 2,
    BottomOut: 4,
    RightOut: 5,
    LeftOut: 6,
});

cc.Class({
    extends: cc.Component,

    editor: {
        menu: '弹窗相关/弹窗入口',
        requireComponent: cc.Button,
    },

    properties: {
        popupType: {
            default: PopupType.Prefab,
            type: PopupType,
        },
        path: {
            default: '',        // The default value will be used only when the component attaching
            // type: cc.String,    // optional, default is typeof default
            visible: function () {
                return this.popupType == PopupType.Path;
            },
        },
        prefab: {
            default: null,        // The default value will be used only when the component attaching
            type: cc.Prefab, // optional, default is typeof default
            visible: function () {
                return this.popupType == PopupType.Prefab;
            },
        },
        nodePath: {
            default: '',
            visible: function () {
                return this.setTabIndex;
            },
        },
        // 进入动画类型
        animType: {
            default: AnimType.None,
            type: AnimType,
        },
        // 关闭动画类型
        closeAnimType: {
            default: CloseAnimType.None,
            type: CloseAnimType,
        },
        // 关闭 关闭按钮提示
        noCloseHit: false,
        // 关闭黑色遮罩
        noMask: false,

        // 打开tabbar 对应index
        setTabIndex: false,
        index: {
            default: '',
            visible: function () {
                return this.setTabIndex;
            },
        },

        // 上报功能
        report: false,
        reportKey: {
            default: '',
            visible: function () {
                return this.report;
            },
        },

        // 点击背景关闭
        noTouchClose: false
    },

    onLoad() {
        this.initScale = this.node.scale;
        let button = this.node.getComponent(cc.Button)
        if (button) {
            this.node.on('click', this.onClick, this);
        }
    },

    onClick() {
        let tempPopup = null;
        if (this.popupType == PopupType.Path) {
            tempPopup = this.path;
        } else if (this.popupType == PopupType.Prefab) {
            tempPopup = this.prefab;
        }
        let args = {
            noCloseHit: this.noCloseHit,
            noTouchClose: this.noTouchClose,
            noMask: this.noMask,
            onShow: (node) => {
                if (this.setTabIndex) {
                    let tabbarNode = cc.find(this.nodePath, node);
                    if (tabbarNode) {
                        let tabbarCpt = tabbarNode.getComponent("Tabbar")
                        if (tabbarCpt) {
                            tabbarCpt.setPage(this.index);
                        }
                    }
                }
            },
        };
        if (this.animType == AnimType.OpacityIn) {
            args.opacityIn = true;
        } else if (this.animType == AnimType.ScaleIn) {
            args.scaleIn = true;
        } else if (this.animType == AnimType.BottomIn) {
            args.bottomIn = true;
        } else if (this.animType == AnimType.RightIn) {
            args.rightIn = true;
        } else if (this.animType == AnimType.LeftIn) {
            args.leftIn = true;
        }
        if (this.closeAnimType == CloseAnimType.ScaleOut) {
            args.scaleOut = true;
            let worldPos = this.node.convertToWorldSpaceAR(cc.v2(0, 0));
            let endPos = cc.find("Canvas").convertToNodeSpaceAR(worldPos);
            args.scaleOutParm = {
                toPos: endPos,
                node: this.node,
                scale: this.initScale,
            };
        } else if (this.closeAnimType == CloseAnimType.BottomOut) {
            args.bottomOut = true;
        } else if (this.closeAnimType == CloseAnimType.RightOut) {
            args.rightOut = true;
        } else if (this.closeAnimType == CloseAnimType.LeftOut) {
            args.leftOut = true;
        }
        cc.vv.PopupManager.addPopup(tempPopup, args);
    }

});
