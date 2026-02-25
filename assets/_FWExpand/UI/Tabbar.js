const TabbarItemType = cc.Enum({
    'NODE': 1,
    'PREFAB': 2,
});

let TabbarItem = cc.Class({
    name: "TabbarItem",
    properties: {
        selectNode: {
            displayName: "选中节点",
            default: null,
            type: cc.Node
        },
        unSelectNode: {
            displayName: "未选中节点",
            default: null,
            type: cc.Node
        },
        pageType: {
            displayName: "内容类型",
            default: TabbarItemType.NODE,
            type: TabbarItemType,
        },
        pageNode: {
            displayName: "内容节点",
            default: null,
            type: cc.Node,
            visible: function () { return this.pageType == TabbarItemType.NODE },
        },
        pagePrefab: {
            displayName: "内容预制体",
            default: null,
            type: cc.Prefab,
            visible: function () { return this.pageType == TabbarItemType.PREFAB },
        },
        pageParent: {
            displayName: "预制体父节点",
            default: null,
            type: cc.Node,
            visible: function () { return this.pageType == TabbarItemType.PREFAB },
        },
        pageOnLoad: {
            displayName: "是否直接加载",
            default: false,
            visible: function () { return this.pageType == TabbarItemType.PREFAB },
        },
        scale: 1,
        pagePrefab_review: {
            displayName: "提审内容预制体",
            default: null,
            type: cc.Prefab,
            visible: function () { return this.pageType == TabbarItemType.PREFAB },
        },
        pageParent_review: {
            displayName: "提审内容预制体父节点",
            default: null,
            type: cc.Node,
            visible: function () { return this.pageType == TabbarItemType.PREFAB },
        },
    }
})

// 选项卡组件
let Tabbar = cc.Class({
    extends: cc.Component,
    editor: {
        disallowMultiple: false,
        menu: '通用/选项卡',
    },
    properties: {
        tabs: {
            default: [],
            type: [TabbarItem]
        },
        defaultIndex: -1,
        _index: -1,
        index: {
            get() {
                return this._index;
            }
        },
        indexItem: {
            visible: false,
            get() {
                return this.tabs[this._index];
            }
        },
        useSound: true,
    },
    onLoad() {
        for (const tabItem of this.tabs) {
            tabItem.selectNode.active = false;
            tabItem.unSelectNode.active = true;
            // 创建节点
            if (tabItem.pagePrefab && tabItem.pageParent) {
                let prefabUrl = tabItem.pagePrefab
                let partNode = tabItem.pageParent
                if (Global.isIOSAndroidReview()) {
                    if (tabItem.pagePrefab_review) {
                        prefabUrl = tabItem.pagePrefab_review
                        partNode = tabItem.pageParent_review
                    }
                }
                tabItem.pageNode = cc.instantiate(prefabUrl)
                tabItem.pageNode.active = tabItem.pageOnLoad;
                partNode.addChild(tabItem.pageNode);
            }
            // 控制节点
            if (tabItem.pageNode) {
                tabItem.pageNode.active = false;
                tabItem.pageNode.scale = tabItem.scale;
            }
            if (tabItem.unSelectNode) {
                let button = tabItem.unSelectNode.addComponent(cc.Button);
                if (button) {
                    button.node.on("click", () => {
                        // 点击声音
                        if (this.useSound) {
                            cc.vv.EventManager.emit("EVENT_BTN_CLICK_SOUNDS");
                        }
                        this.onSelectPage(tabItem, false);
                    })
                }
            }
        }
        this.setPage(this.defaultIndex)
    },
    // 设置回调函数
    setChangeCallback(callback) {
        this.callback = callback;
    },
    // 设置Change前函数(在函数中return true 可以阻断切换tabbar)
    setPreChangeCallback(callback) {
        this.preCallback = callback;
    },
    // 页面选择
    onSelectPage(tabItem, noPreCheck) {
        if (!noPreCheck && this.preCallback && this.preCallback(this.tabs.indexOf(tabItem), tabItem, this.tabs)) {
            return;
        }
        // 先计算index 为了保证打点正确
        this._index = this.tabs.indexOf(tabItem);
        // 切换显示
        for (const item of this.tabs) {
            item.selectNode.active = item == tabItem;
            item.unSelectNode.active = item != tabItem;
            if (item.pageNode) item.pageNode.active = item == tabItem;
        }
        // 回调
        if (tabItem.pageNode) {
            StatisticsMgr.reqReportNow(ReportConfig.TABBAR_OPEN, tabItem.pageNode.name);
        }
        if (this.callback) {
            this.callback(this._index, tabItem, this.tabs)
        }
    },
    // 设置选择页面
    setPage(index, noPreCheck) {
        if (this.index == index) return;
        if (this.tabs[index]) {
            this.onSelectPage(this.tabs[index], noPreCheck)
        }
    },

});


module.exports = Tabbar;