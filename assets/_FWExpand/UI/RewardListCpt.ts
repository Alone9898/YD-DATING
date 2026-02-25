import RewardItemCpt from "./RewardItemCpt";

// 通用奖励组件
const { ccclass, property, menu } = cc._decorator;

@ccclass
@menu("UI/奖励列表")
export default class RewardListCpt extends cc.Component {
    // 奖励Item
    @property(cc.Node)
    itemNode: cc.Node = null;
    // 容器节点
    @property(cc.Node)
    contentNode: cc.Node = null;

    private nodeMap = {};

    updateView(config, parms?) {
        parms = parms || [];
        // 数据处理
        let tempList = [];
        if (config instanceof Array) {
            tempList = config;
        } else {
            let coin = config.addCoin || config.coin;
            if (coin) {
                tempList.push({ type: 1, count: coin })
            }
            let diamond = config.addDiamond || config.diamond;
            if (diamond) {
                tempList.push({ type: 25, count: diamond })
            }
        }
        // 关闭所有节点
        this.closeAll();
        this.nodeMap = {};
        for (let i = 0; i < tempList.length; i++) {
            let item = tempList[i];
            // for (const item of tempList) {
            if (item.type == 2) {
                this.nodeMap[item.type] = { data: item };
                continue;
            }
            let node = this.contentNode.children[i];
            if (!node) {
                node = cc.instantiate(this.itemNode);
                node.parent = this.contentNode;
            }
            node.active = true;
            // 设置大小
            for (const info of parms) {
                if (info.type == item.type) {
                    if (cc.find("icon", node)) cc.find("icon", node).scale = info.scale;
                    if (cc.find("avatar", node)) cc.find("avatar", node).scale = info.scale;
                    if (cc.find("hddj", node)) cc.find("hddj", node).scale = info.scale;
                }
            }
            this.nodeMap[item.type] = {
                node: node,
                data: item,
                icon: cc.find("icon", node),
                avatar: cc.find("avatar", node),
                hddj: cc.find("hddj", node),
                value: cc.find("value", node),
            };
            node.getComponent(RewardItemCpt).updateView(item);
        }
        return this.nodeMap;
    }

    closeAll() {
        for (let i = 0; i < this.contentNode.children.length; i++) {
            this.contentNode.children[i].active = false;
        }
    }

    showAll() {
        for (let i = 0; i < this.contentNode.children.length; i++) {
            this.contentNode.children[i].active = true;
        }
    }

    runHintAnim(delay, padding) {
        for (let i = 0; i < this.contentNode.children.length; i++) {
            const item = this.contentNode.children[i];
            item.active = true;
            item.stopAllActions();
            let oldPos = item.position;
            item.position = oldPos.add(cc.v3(0, 100));
            item.opacity = 0;
            cc.tween(item).delay(delay + padding * i).to(0.3, { position: oldPos, opacity: 255 }, { easing: "backOut" }).start();
        }
    }

}
