import Slideshow3DItem from "./Slideshow3DItem";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Slideshow3D extends cc.Component {
    @property
    paddingAngle: number = 80; //角度
    @property
    radius: number = 500;
    @property
    speed: number = 5;  //移动到指定角度的角速度
    @property
    speedCoefficient: number = 0.3;  //移动系数
    @property
    autoTime: number = 7;

    itemList: Slideshow3DItem[] = [];
    indexAngle: number = 0; //与原本的位置偏移角度
    tempAngle: number = 0; //临时角度
    Angle: number = 0; //与原本的位置偏移角度
    circlePoint: cc.Vec3;
    running: boolean;



    @property(cc.Node)
    itemNodePrefab: cc.Node = null;

    updateFunc: Function;
    changeFunc: Function;

    set numItems(value) {
        // 生成节点
        for (let i = 0; i < value; i++) {
            let itemNode = cc.instantiate(this.itemNodePrefab);
            itemNode.parent = this.node;
            // 回调
            if (this.updateFunc) {
                this.updateFunc(itemNode, i);
            }
            let itemCpt = itemNode.addComponent(Slideshow3DItem);
            this.itemList.push(itemCpt);
        }
        // this.paddingAngle = 360 / this.node.children.length;
        // 初始化所有item
        for (let i = 0; i < this.itemList.length; i++) {
            const itemCpt = this.itemList[i];
            if (this.itemList[i - 1]) {
                itemCpt.left = this.itemList[i - 1];
            } else {
                itemCpt.left = this.itemList[this.itemList.length - 1];
            }
            if (this.itemList[i + 1]) {
                itemCpt.right = this.itemList[i + 1];
            } else {
                itemCpt.right = this.itemList[0];
            }
            itemCpt.angle = this.paddingAngle * i;
        }
    }


    onLoad() {
        this.itemNodePrefab.active = false;
        // 3D空间中的原点
        this.circlePoint = this.node.position.add(cc.v3(0, 0, -this.radius));
        this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.on(cc.Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
    }

    protected onEnable(): void {
        if (this.autoTime > 0) {
            // this.schedule(this.toNext, this.autoTime);
        }
    }
    protected onDisable(): void {
        // this.unschedule(this.toNext);
    }

    onTouchStart(event: cc.Event.EventTouch) {
        this.running = true;
        // 停止倒计时
        // this.unschedule(this.toNext);
    }
    onTouchMove(event: cc.Event.EventTouch) {
        this.indexAngle += event.getDeltaX() * this.speedCoefficient;
        // 插值计算
        // this.indexAngle = cc.misc.lerp(this.indexAngle, this.targetAngle, 7 * dt);
    }
    onTouchEnd(event: cc.Event.EventTouch) {
        cc.log("onTouchEnd ")
        // 启动计时器
        if (this.autoTime > 0) {
            // this.schedule(this.toNext, this.autoTime);
        }
        // this.runToAngle(0.3, Math.round(this.indexAngle / this.paddingAngle) * this.paddingAngle);
    }
    toNext() {
        // this.runToAngle(0.6, this.indexAngle + this.paddingAngle);
    }
    toPrev() {
        // this.runToAngle(0.6, this.indexAngle - this.paddingAngle)
    }
    runToAngle(time = 1, toAngle) {
        cc.tween(this)
            .call(() => {
                this.running = true;
            })
            .to(time, { indexAngle: toAngle }, { easing: 'quadOut' })
            .call(() => {
                this.running = false;
                // if (this.changeFunc) {
                //     this.changeFunc(itemNode, i);
                // }
            })
            .start();
    }
    update(dt) {
        // 判断显示与隐藏
        for (const item of this.itemList) {
            let showAngle = this.indexAngle + item.angle;
            this.updateItemAttr(item, showAngle);
            // if (Math.abs(showAngle % 360) < 60 || Math.abs(showAngle % 360) > 300) {
            //     item.node.active = true;
            //     this.updateItemAttr(item, showAngle);
            // } else {
            //     item.node.active = false;
            // }
        }
    }
    updateItemAttr(item: Slideshow3DItem, angle: number) {
        // 根据 padding radius 计算出 应该的位置与旋转
        item.node.position = this.circlePoint.add(cc.v3(Math.sin(angle * Math.PI / 180), 0, Math.cos(angle * Math.PI / 180)).mul(this.radius));
        item.node.eulerAngles = cc.v3(0, angle, 0);
        item.node.zIndex = item.node.position.z;
    }

    setUpdateFunc(updateFunc) {
        this.updateFunc = updateFunc;
    }
    setChangeFunc(changeFunc) {
        this.changeFunc = changeFunc;
    }
    skipPage(index) {
    }


}
