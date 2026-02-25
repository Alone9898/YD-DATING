import BroadcastCpt from "./BroadcastCpt";

export class BroadcastManager {
    // 走马灯
    public static broadcastPrefabPath = "";
    public static broadcastPrefabPath2 = "BalootClient/BaseRes/prefabs/newBroadcast";
    public static broadcastStack = [];
    public static broadcastQueue = [];
    // 礼物动画
    public static giftAnimPrefabPath = "";
    public static giftAnimStack = [];
    public static giftAnimQueue = [];

    public static isRun = false;

    static timer: any;


    public static init() {
        // 加载新场景只后 删除所有的弹窗
        cc.director.on(cc.Director.EVENT_BEFORE_SCENE_LAUNCH, () => {
            let giftAnimNode = cc.find("Canvas/GiftAnim");
            if (!giftAnimNode) {
                cc.loader.loadRes(cc.vv.BroadcastManager.giftAnimPrefabPath, function (err, prefab) {
                    if (!err) {
                        var node = cc.instantiate(prefab)     //创建弹框
                        node.active = false;
                        node.parent = cc.find("Canvas");
                        node.zIndex = 200;
                        node.position = cc.v2(0, 400)
                    }
                }.bind(this));
            }
        }, this);
    }

    public static run() {
        if (this.isRun) return;
        // 启动定时器,检测走马灯是否可以播放下一条
        this.isRun = true;
        this.timer = setInterval(this.checkQueue.bind(this), 100);
    }
    public static stop() {
        // 启动定时器,检测走马灯是否可以播放下一条
        this.isRun = false;
        clearInterval(this.timer);
    }
    // 检测等待队列
    public static checkQueue() {

        // if (!cc.find("Canvas")) return;
        if (this.broadcastStack.length <= 0) {
            if (this.broadcastQueue.length > 0) {
                // 播放广播
                this.handleBroadcast();
            }
        }
        if (this.giftAnimStack.length <= 0) {
            if (this.giftAnimQueue.length > 0) {
                // 播放广播
                this.handleGiftAnim();
            }
        }
    }

    // 添加一条走马灯
    public static addBroadcast(broadcastItem) {
        if (!this.isRun) return;
        this.broadcastQueue.push(broadcastItem);
        // 进行排序
        this.broadcastQueue.sort((a, b) => {
            return b.level - a.level;
        });
    }
    // 添加一条走马灯
    public static addGiftAnim(broadcastItem) {
        if (!this.isRun) return;
        this.giftAnimQueue.push(broadcastItem);
    }

    // 播放一条广播
    public static handleBroadcast() {
        if (!this.broadcastPrefabPath) return;
        let _item = this.broadcastQueue.shift();
        this.broadcastStack.push(_item);
        //判断类型枚举
        let broadEnum = cc.Enum({
            SLIVER: 4,//银喇叭
            GOLD: 5,//金喇叭
        });
        let broadcastPath = this.broadcastPrefabPath;
        if (_item.type == broadEnum.SLIVER || _item.type == broadEnum.GOLD) {
            broadcastPath = this.broadcastPrefabPath2;
        }
        // 动态加载
        cc.loader.loadRes(broadcastPath, function (err, prefab) {
            if (!err) {
                let nParent = cc.find("Canvas")
                if (!cc.isValid(nParent)) return
                let node: cc.Node = cc.instantiate(prefab)
                let broadcastCpt = node.getComponent(BroadcastCpt);
                if (_item.type == broadEnum.SLIVER || _item.type == broadEnum.GOLD) {
                    broadcastCpt.initUI(_item);
                }
                broadcastCpt.rewardListCpt.closeAll();
                node.position = cc.v3(0, cc.winSize.height / 2 - 220);
                node.scaleY = 0;
                node.zIndex = 101;
                nParent.addChild(node);
                cc.tween(node)
                    .to(0.5, { scaleY: node.scaleX })
                    .call(() => {
                        broadcastCpt.run({
                            direction: _item.direction || 1,
                            content: _item.content,
                            rewards: _item.rewards,
                            count: _item.count,
                            closeFunc: () => {
                                this.broadcastStack = this.broadcastStack.filter(item => item !== _item);
                            }
                        });
                    })
                    .start();
            }
        }.bind(this));
    }
    // 播放一条礼物动画
    public static handleGiftAnim() {
        if (!this.giftAnimPrefabPath) return;
        let _item = this.giftAnimQueue.shift();
        this.giftAnimStack.push(_item);
        let giftAnimNode = cc.find("Canvas/GiftAnim");
        if (giftAnimNode) {
            let cpt = giftAnimNode.getComponent("GiftAnimCpt");
            if (cpt) {
                giftAnimNode.active = true;
                cpt.onInit(_item, () => {
                    this.giftAnimStack = this.giftAnimStack.filter(item => item !== _item);
                });
            }
        } else {
            cc.loader.loadRes(cc.vv.BroadcastManager.giftAnimPrefabPath, function (err, prefab) {
                if (!err) {
                    let nParent = cc.find("Canvas")
                    if (!cc.isValid(nParent)) return
                    var node = cc.instantiate(prefab)     //创建弹框
                    node.parent = nParent;
                    node.zIndex = 200;
                    node.position = cc.v2(0, 400)
                    let cpt = node.getComponent("GiftAnimCpt")
                    if (cpt) {
                        cpt.onInit(_item, () => {
                            this.giftAnimStack = this.giftAnimStack.filter(item => item !== _item);
                        });
                    }
                }
            }.bind(this));
        }
    }
}
