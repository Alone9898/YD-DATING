/**
 * 大厅激活显示UI动画
 */

cc.Class({
    extends: cc.Component,

    properties: {
        _org_top_y: null,
        _org_diamond_x: null,
        _org_coin_x: null,
        _org_nick_x: null,
        _org_vip_x: null,
        _org_head_scale: null,
        _org_rank_x: null,
        _org_bg_scale: null,
        node_top: cc.Node,
        node_bg: cc.Node,
        node_mid: cc.Node,
        node_rank: cc.Node,
        node_close: cc.Node,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        this._initOrg()
    },

    onEnable() {

        this.showUIAni()
    },

    showUIAni() {
        //top
        let top = this.node_top
        // let top = cc.find("UserinfoBar",this.node)
        if (top) {
            // if (this._org_top_y != null) {
            //     top.y += 100
            //     top.scale = 1.1
            //     cc.tween(top)
            //         .to(0.3, { y: this._org_top_y, scale: 1 }, { easing: "quintOut" })
            //         .start()
            // }
            let bgNode = cc.find("bg", top);
            if (bgNode) {
                let endY = bgNode.y
                bgNode.y += 200;
                cc.tween(bgNode)
                    .to(0.3, { y: endY, scale: 1 }, { easing: "quintOut" })
                    .start()
            }

            // //diamond
            // if (this._org_diamond_x != null) {
            //     let diamondNode = cc.find("diamond", top)
            //     let coinNode = cc.find("coin", top)
            //     let nickNode = cc.find("league", top)
            //     let vipNode = cc.find("vip", top)
            //
            //     let leftNodes = []
            //     leftNodes.push({ node: coinNode, org_x: this._org_coin_x })
            //     leftNodes.push({ node: diamondNode, org_x: this._org_diamond_x })
            //     leftNodes.push({ node: nickNode, org_x: this._org_nick_x })
            //     leftNodes.push({ node: vipNode, org_x: this._org_vip_x })
            //
            //
            //     for (let i = 0; i < leftNodes.length; i++) {
            //         let item = leftNodes[i]
            //         let dir = item.org_x > 0 ? -1 : 1
            //         item.node.x -= 100 * dir
            //         cc.tween(item.node)
            //             .delay((i % 2) * 0.1 + 0.05)
            //             .to(0.2, { x: item.org_x }, { easing: "quintOut" })
            //             .start()
            //     }
            // }

            //head
            if (this._org_head_scale) {
                let head_node = cc.find("head", top)
                if (head_node) {
                    head_node.scale = this._org_head_scale + 0.1
                    cc.tween(head_node)
                        .delay(0.3)
                        .to(0.1, { scale: this._org_head_scale })
                        .start()
                }
            }

        }

        //侧边按钮
        let rightMenu = cc.find("BtnLayout", this.node)
        if (rightMenu) {
            let allChilds = rightMenu.children
            for (let i = 0; i < allChilds.length; i++) {
                let item = allChilds[i]
                if (item.active) {
                    item.opacity = 0
                    cc.tween(item)
                        .delay(i * 0.05)
                        .to(0.1, { opacity: 255 })
                        .start()
                }

            }
        }
        //侧边rank
        let rankMenu = this.node_rank || cc.find("SimpleRank", this.node)
        if (rankMenu && this._org_rank_x) {
            rankMenu.x = this._org_rank_x + 100
            cc.tween(rankMenu)
                .to(0.4, { x: this._org_rank_x }, { easing: "backOut" })
                .start()
        }

        //侧边rank
        let node_close = this.node_close || cc.find("SimpleRank", this.node)
        if (node_close && this._org_close_x) {
            node_close.x = this._org_close_x + 100
            cc.tween(node_close)
                .to(0.5, { x: this._org_close_x }, { easing: "backOut" })
                .start()
        }


        //游戏列表
        let gamelist = this.node_mid || cc.find("Games", this.node)
        if (gamelist) {
            gamelist.scale = 1.05
            cc.tween(gamelist)
                // .delay(0.1)
                .to(0.8, { scale: 1 }, { easing: "quintOut" })
                .start()
        }
        //BG
        let bg = this.node_bg || cc.find("bg_img", this.node)
        if (bg && this._org_bg_scale) {
            let bgWidget = bg.getComponent(cc.Widget)
            bgWidget.enabled = false
            bg.scale = this._org_bg_scale + 0.05
            cc.tween(bg)
                .to(0.8, { scale: this._org_bg_scale }, { easing: "quintOut" })
                .call(() => {
                    bgWidget.enabled = true
                })
                .start()
        }
    },

    _initOrg() {
        // let top = cc.find("UserinfoBar",this.node)
        let top = this.node_top || cc.find("Canvas/UserinfoBar")
        if (top) {
            if (!this._org_top_y) {
                this.reWidgetNode(top)
                this._org_top_y = top.y


            }

            // let diamondNode = cc.find("diamond", top)
            // if (!this._org_diamond_x) {
            //     this._org_diamond_x = diamondNode.x
            // }

            let coinNode = cc.find("coin", top)
            if (!this._org_coin_x) {
                this._org_coin_x = coinNode.x
            }

            // let nickNode = cc.find("league", top)
            // if (!this._org_nick_x) {
            //     this._org_nick_x = nickNode.x
            // }

            let vipNode = cc.find("vip", top)
            if (!this._org_vip_x) {
                this._org_vip_x = vipNode.x
            }

            let head_node = cc.find("head", top)
            if (head_node && !this._org_head_scale) {
                this._org_head_scale = head_node.scale
            }


        }

        let rankMenu = this.node_rank || cc.find("SimpleRank", this.node)
        if (rankMenu && !this._org_rank_x) {
            this.reWidgetNode(rankMenu)
            this._org_rank_x = rankMenu.x
        }

        if (this.node_close) {
            this.reWidgetNode(this.node_close)
            this._org_close_x = this.node_close.x
        }

        let bg = this.node_bg || cc.find("bg_img", this.node)
        if (bg && !this._org_bg_scale) {
            this.reWidgetNode(bg)
            this._org_bg_scale = bg.scale
        }
    },

    reWidgetNode(node) {
        let widgetScp = node.getComponent(cc.Widget)
        if (widgetScp) {
            widgetScp.updateAlignment()
        }
    },

    // update (dt) {},
});
