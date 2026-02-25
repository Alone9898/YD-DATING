cc.Class({
    extends: cc.Component,

    properties: {
        staticNode: cc.Node,
        layoutNode: cc.Node,
        typetNode: cc.Node,
        data: null,
    },

    onLoad() {
        let netListener = this.node.addComponent("NetListenerCmp");
        netListener.registerMsg(MsgId.REQ_LABAGAME_LIST, this.REQ_LABAGAME_LIST, this);
    },

    start() {
        cc.vv.NetManager.send({c: MsgId.REQ_LABAGAME_LIST})
    },

    //获取游戏记录
    REQ_LABAGAME_LIST(msg) {
        if (msg.code != 200) return;
        this.setData(msg.records);
        this.initAllDeskUI();
        this.scheduleOnce(() => {
            this.initResult();
        }, 0)
    },

    setData(data) {
        this.data = data;
    },

    /***分二部分 */
    //显示做桌面
    initAllDeskUI() {
        if (this.layoutNode.childrenCount > 0) {
            this.layoutNode.destroyAllChildren();
        }

        let len = this.data.length > 10 ? 10 : this.data.length;
        for (let i = 0; i < len; i++) {
            let nodess = this.getStaticNodeItem(i, this.data[i].type)
            this.layoutNode.addChild(nodess);

            nodess.children[0].getChildByName('num').getComponent(cc.Label).string = "x" + this.data[i].mult;
            //设置图片
            let imgNode = nodess.children[0].getChildByName('img');
            let place = this.data[i].place;
            if (place == 1 || place == 2) {
                imgNode.scale = 0.75;
            } else {
                imgNode.scale = 1;
            }

            imgNode.getComponent(cc.Sprite).spriteFrame = cc.vv.gameData.getAtlas(0).getSpriteFrame(`laba_bet_${place - 1}`);
        }
    },
    //显示内容
    initResult() {
        if (this.typetNode.childrenCount > 0) {
            this.typetNode.destroyAllChildren();
        }
        let vector = [];
        let len = this.data.length > 10 ? 10 : this.data.length;
        //先加点 在连线
        for (let i = 0; i < len; i++) {
            let nodess = this.getStaticSignItem(this.data[i].type)
            this.typetNode.addChild(nodess);
            //获取位置
            let place = this.data[i].place;
            let nodess1 = this.layoutNode.children[i];
            let nodess2 = nodess1.children[place]; //获取这个位置
            nodess.position = cc.v2(nodess2.x, nodess1.y);
            nodess.zIndex = 10;
            vector.push(nodess.position);
        }
        //开始连线
        for (let j = 0; j < vector.length - 1; j++) {
            const element = vector[j];
            let angle = this.getAngle(element, vector[j + 1]);
            let dis = this.getDistance(element, vector[j + 1])
            let nodss = this.getStaticSignItem(0);
            this.typetNode.addChild(nodss);
            nodss.angle = angle;
            nodss.scaleX = dis / 106;
            nodss.position = element;
        }
    },


    //返回对应的item
    /**
     *
     * @param index 结果数组索引
     * @param onedata 结果数组索引
     * @returns
     */
    getStaticNodeItem(index, type) {
        let childIndex = 0;
        if (index == 0 && type == 1) {//普通的
            childIndex = 2;
        } else if (index == 0 && type !== 1) {
            childIndex = 3;
        } else if (type == 1) {
            childIndex = 1;
        } else {
            childIndex = 0;
        }
        let nodess = this.staticNode.children[childIndex];
        if (nodess) {
            return cc.instantiate(nodess);
        }
        return null;
    },

    getStaticSignItem(type) {
        let childIndex = 0;
        if (type == 1) {//普通的
            childIndex = 5;
        } else if (type == 2) {
            childIndex = 6;
        } else if (type == 3) {
            childIndex = 7;
        } else if (type == 4) {//老虎*4
            childIndex = 8;
        } else if (type == 5) {//火车*3
            childIndex = 9;
        } else if (type == 6) {//火车*4
            childIndex = 10;
        } else if (type == 7) {//火车*5
            childIndex = 11;
        } else if (type == 8) {//四叶草
            childIndex = 12;
        } else {
            childIndex = 4; //线
        }
        let nodess = this.staticNode.children[childIndex];
        if (nodess) {
            return cc.instantiate(nodess);
        }
        return null;
    },
    //获得距离
    getDistance(start, end) {
        let pos = cc.v2(start.x - end.x, start.y - end.y);
        let dis = Math.sqrt(pos.x * pos.x + pos.y * pos.y);
        return dis;
    },

    //获得角度
    getAngle(start, end) {
        //计算出朝向
        let dx = end.x - start.x;
        let dy = end.y - start.y;
        let dir = cc.v2(dx, dy);
        //根据朝向计算出夹角弧度
        var angle = dir.signAngle(cc.v2(1, 0));
        //将弧度转换为欧拉角
        var degree = angle / Math.PI * 180;
        return -degree
    },

    // update (dt) {},
});
