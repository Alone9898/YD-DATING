/**
 * 此组件依赖ScrollView组件
 * 用作在content节点较多时，修改透明度降低drawcall
 */
const { ccclass, property } = cc._decorator;

@ccclass
export default class ScrollViewDrawCallOpacity extends cc.Component {

    @property({
        type: cc.Node,
        tooltip: "可不传,默认是content,如果是别的节点,比如layout可以从这里传进来",
    })
    content: cc.Node = null;

    @property({
        tooltip: "刷新时间间隔",
    })
    interval: number = 0.1;

    // LIFE-CYCLE CALLBACKS:
    private scrollview: any = null; //
    private itemCount: any = null; //
    private svBBoxRect: cc.Rect = null; //

    onLoad() {
        this.scrollview = this.node.getComponent(cc.ScrollView) || this.node.getComponent(cc.PageView);

        if (this.scrollview == null || this.scrollview == undefined) return;

        this.schedule(this.scheduleCallback, this.interval || 0.1);
    }

    protected onEnable(): void {

    }

    start() {

    }

    /**
     * 定时器函数
     */
    scheduleCallback() {
        if (this.scrollview.isScrolling() || this.scrollview.isAutoScrolling()) {
            this.scrollViewDrawCallOpacity();
        } else {
            // console.log("滑动停止 scrollviewEnd>>>>>>>>");
        }
    }

    protected onDisable(): void {
    }

    // update (dt) {}

    /**
     * 修改透明度的方法函数
     */
    scrollViewDrawCallOpacity() {
        if (this.scrollview == null || this.scrollview == undefined) return;

        // 获取 ScrollView Node 的左下角坐标在世界坐标系中的坐标
        let svLeftBottomPoint = this.scrollview.node.parent.convertToWorldSpaceAR(
            cc.v2(
                this.scrollview.node.x - this.scrollview.node.anchorX * this.scrollview.node.width,
                this.scrollview.node.y - this.scrollview.node.anchorY * this.scrollview.node.height
            )
        );

        // 求出 ScrollView 可视区域在世界坐标系中的矩形（碰撞盒）
        this.svBBoxRect = cc.rect(
            svLeftBottomPoint.x,
            svLeftBottomPoint.y,
            this.scrollview.node.width,
            this.scrollview.node.height
        );

        this.itemCount = this.content || this.scrollview.content;

        for (let i = 0; i < this.itemCount.children.length; i++) {
            let item = this.itemCount.children[i];

            // 对每个子节点的包围盒做和 ScrollView 可视区域包围盒做碰撞判断
            // 如果相交了，那么就显示，否则就隐藏
            if (item.getBoundingBoxToWorld().intersects(this.svBBoxRect)) {
                if (item.opacity != 255) {
                    item.opacity = 255;
                    // childNode.emit("on_enter_scroll_view");
                }
            } else {
                if (item.opacity != 0) {
                    item.opacity = 0;
                    // childNode.emit("on_exit_scroll_view");
                }
            }

        }
    }

}
