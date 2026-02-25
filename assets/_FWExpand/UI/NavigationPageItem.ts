const { ccclass, property, menu, requireComponent } = cc._decorator;

export enum NavigationPageItemType {
    NODE = 1,
    PREFAB,
}

@ccclass
@menu("UI/NavigationPageView")
export default class NavigationPageItem extends cc.Component {
    // 节点容器
    @property(cc.Node)
    headNode: cc.Node = null;
    // 节点容器
    @property(cc.Node)
    bgNode: cc.Node = null;
    @property({ type: cc.Enum(NavigationPageItemType) })
    cType: NavigationPageItemType = NavigationPageItemType.NODE;
    // 内容预制体
    @property({ type: cc.Node, visible() { return this.cType == NavigationPageItemType.NODE; } })
    pageNode: cc.Node = null;
    // 内容预制体
    @property({ type: cc.Prefab, visible() { return this.cType == NavigationPageItemType.PREFAB; } })
    pagePrefab: cc.Prefab = null;
    // 内容预制体
    @property({ visible() { return this.cType == NavigationPageItemType.PREFAB; } })
    pageOnLoad: boolean = false;
    // 控制开关
    @property(cc.Button)
    btnSwtich: cc.Button = null;
    // 是否打开
    isOpen: boolean = false;


    // 状态切换时候的回调
    @property(cc.Component.EventHandler)
    changeEvent: cc.Component.EventHandler = null;


    onInit() {
        this.btnSwtich.node.on("click", this.onSwitch, this);
        if (this.cType == NavigationPageItemType.PREFAB && this.pagePrefab) {
            this.pageNode = cc.instantiate(this.pagePrefab);
            this.pageNode.active = this.pageOnLoad;
            this.node.addChild(this.pageNode);
            this.pageNode.x = 0;
        }
        if (this.pageNode) {
            this.pageNode.on(cc.Node.EventType.SIZE_CHANGED, this.onPageNodeSizeChange, this);
        }
        this.reset();
    }
    // 重置
    reset() {
        if (this.pageNode) {
            this.pageNode.y = -1 * (this.pageNode.height * (1 - this.pageNode.anchorY) + this.headNode.height);
            this.pageNode.active = false;
        }
        this.node.height = this.headNode.height;
        if (this.bgNode) {
            this.bgNode.y = -this.headNode.height;
            this.bgNode.height = 0;
            this.bgNode.active = false;
        }
        this.setSwitch(false, 0);
    }
    // 切换开关
    onSwitch() {
        this.isOpen = !this.isOpen;
        this.setSwitch(this.isOpen);
    }
    setSwitch(value, animTime = 0.1) {
        this.isOpen = value;
        if (this.pageNode) {
            if (value) {
                this.onOpenPage(animTime);
            } else {
                this.onClosePage(animTime);
            }
        }
        cc.Component.EventHandler.emitEvents([this.changeEvent], this);
    }
    // 打开界面
    onOpenPage(animTime) {

        if (this.bgNode) {
            this.bgNode.active = true;
            this.bgNode.stopAllActions();
        }

        this.node.stopAllActions();
        if (animTime <= 0) {
            this.pageNode.active = true;
            if (this.bgNode) {
                this.bgNode.height = this.pageNode.height;
            }
            this.node.height = this.headNode.height + this.pageNode.height;
        } else {
            if (this.bgNode) {
                cc.tween(this.bgNode)
                    .to(animTime, { height: this.pageNode.height })
                    .start();
            }
            cc.tween(this.node)
                .to(animTime, { height: this.headNode.height + this.pageNode.height })
                .call(() => {
                    if (this.pageNode) {
                        this.pageNode.active = true;
                    }
                }).start();
        }

    }
    // 关闭界面
    onClosePage(animTime) {
        if (this.pageNode) {
            this.pageNode.active = false;
        }
        if (this.bgNode) {
            this.bgNode.stopAllActions();
        }
        this.node.stopAllActions();
        if (animTime <= 0) {
            if (this.bgNode) this.bgNode.height = 0;
            this.node.height = this.headNode.height;
        } else {
            if (this.bgNode) {
                cc.tween(this.bgNode)
                    .to(animTime, { height: 0 })
                    .call(() => {
                        this.bgNode.active = true;
                    }).start();
            }
            cc.tween(this.node).to(animTime, { height: this.headNode.height }).start();
        }
    }
    // Page节点的size发生变换
    onPageNodeSizeChange() {
        this.updateSize();
    }
    // 更新Node的Height
    updateSize() {
        if (this.isOpen) {
            this.node.height = this.headNode.height + this.pageNode.height;
        }
    }
}
