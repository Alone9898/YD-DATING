//弹框管理器
cc.Class({
    extends: cc.Component,
    properties: {},
    statics: {
        baseZIndex: 50,
        //初始化
        init() {
            // 已经弹框堆栈
            this.popupStack = [];
            // 等待队列
            this.waitingQueue = [];
            // 加载新场景只后 删除所有的弹窗
            cc.director.on(cc.Director.EVENT_BEFORE_SCENE_LAUNCH, () => {
                this.removeAll();
            }, this);
            // 定时检测当前弹窗是否还存在
            setInterval(this.checkPopupStack.bind(this), 100);
        },
        // 检测弹窗堆栈
        checkPopupStack() {
            // 如果堆栈已经空 则处理等待队列
            if (this.popupStack.length <= 0) {
                if (this.waitingQueue.length > 0) {
                    let popupObj = this.waitingQueue.pop()
                    this.createPopup(popupObj.path, popupObj.args);
                }
            }
        },
        // 添加一个弹框根据资源路径
        //add: args.delayCloseTime 延迟关闭时间(单位s)，有些窗口需要窗口动作做完才能点击空白关闭
        addPopup(path, args) {
            if (!path) return;
            args = args || {};
            args.path = path;
            args.weight = args.weight || 1;
            // 是否开启多例模式
            args.multiple = args.multiple || false;
            if (args.isWait) {
                // 加入新的等待
                this.waitingQueue.push({ path: path, args: args })
                //根据权重排序
                this.waitingQueue.sort(function (o1, o2) {
                    return (o1.args.weight - o2.args.weight);
                })
            } else {
                this.createPopup(path, args);
            }
        },
        createPopup(path, args) {
            // 判断是否已经存在
            if (!args.multiple && this.checkIsAddedByPath(path)) return;
            // 加入堆栈
            this.popupStack.push(args)
            // 处理弹窗
            if (typeof path === 'string') {
                cc.loader.loadRes(path, cc.Prefab, function (err, prefab) {
                    if (!err) {
                        //是否制定了父节点，指定了父节点，如果父节点销毁，就不添加了
                        let bNeedadd = true
                        if (args && args.parent) {
                            if (cc.isValid(args.parent, true)) {
                                bNeedadd = true
                            }
                            else {
                                bNeedadd = false
                            }
                        }
                        if (!bNeedadd) return
                        if (this.popupStack.indexOf(args) >= 0) {
                            var node = cc.instantiate(prefab)     //创建弹框
                            this.handlePopup(node, args)
                        }
                    }
                }.bind(this));
            } else if (path instanceof cc.Prefab) {
                var node = cc.instantiate(path)     //创建弹框
                if (node)
                    this.handlePopup(node, args)
            } else {
                this.handlePopup(path, args)
            }
        },
        // 添加一个弹框,根据对象
        handlePopup(node, args) {
            // 单例只允许出现一次 不用Node检测 在这个位置检测来不及
            // if (!args.multiple && this.checkIsAdded(node)) return;
            // 记录node
            args.node = node;
            args.name = node.name;
            node["popupArgs"] = args;
            //弹框位置设置
            let endPos = args.pos || cc.v2(0, 0);
            // 节点销毁 回调
            var popupLifeCmp = node.addComponent("PopupLifeCmp");
            // 弹窗节点销毁回调
            popupLifeCmp.setOnDestroy(() => {
                for (var i = 0; i < this.popupStack.length; i++) {
                    if (this.popupStack[i].node == node) {
                        this.popupStack.splice(i, 1); 		//移除堆栈
                        this.updateStack();
                        break;
                    }
                }
            });
            //在onload直接前调用
            if (args.addBeforeCall) {
                args.addBeforeCall(node)
            }
            node.parent = cc.find("Canvas");
            // 弹窗添加音效
            if (!args.closeInSound) {
                cc.vv.EventManager.emit("EVENT_BTN_CLICK_2_SOUNDS");
            }
            // 设置Zindex
            node.zIndex = this.baseZIndex + this.popupStack.length * 3 + 1;
            args.zIndex = node.zIndex;
            node.position = args.pos || cc.v2(0, 0);
            // 更新mask
            this.updateStack()
            // 弹框后回调
            if (args.onShow) {
                args.onShow(node, this);
            }
            StatisticsMgr.reqReportNow(ReportConfig.POPUP_OPEN, args.name);
            let nodeWidget = node.getComponent(cc.Widget);
            // 具有动画
            if (args.scaleIn) {
                //记录原始值
                let orgScale = node.scale
                node.scale = 0.4;
                node.opacity = 0;
                cc.tween(node)
                    .to(args.animTime || 0.3, { scale: orgScale, opacity: 255 }, { easing: 'backOut' })
                    .call(() => {
                        if (args.onShowEnd) {
                            args.onShowEnd(node, this);
                        }
                    }).start();
                if (this.maskLayer) {
                    this.maskLayer.stopAllActions();
                    cc.tween(this.maskLayer)
                        .to(args.animTime || 0.3, { scale: 1, opacity: 255 }, { easing: 'quadOut' })
                        .start();
                }
            } else if (args.opacityIn) {
                node.opacity = 0;
                cc.tween(node).to(args.animTime || 0.3, { opacity: 255 }, { easing: 'quadOut' }).call(() => {
                    if (args.onShowEnd) {
                        args.onShowEnd(node, this);
                    }
                }).start();
                if (this.maskLayer) {
                    this.maskLayer.stopAllActions();
                    cc.tween(this.maskLayer).to(args.animTime || 0.3, { opacity: 255 }, { easing: 'quadOut' }).start();
                }
            } else if (args.bottomIn) {
                if (nodeWidget) {
                    nodeWidget.updateAlignment();
                    nodeWidget.enabled = false;
                }
                node.position = endPos.add(cc.v3(0, -cc.winSize.height));
                cc.tween(node).to(args.animTime || 0.3, { position: endPos }, { easing: 'quadOut' }).call(() => {
                    if (nodeWidget) nodeWidget.enabled = true;
                    if (args.onShowEnd) {
                        args.onShowEnd(node, this);
                    }
                }).start();
                if (this.maskLayer) {
                    this.maskLayer.stopAllActions();
                    // this.maskLayer.opacity = 0;
                    cc.tween(this.maskLayer).to(args.animTime || 0.3, { opacity: 255 }, { easing: 'quadOut' }).start();
                }
            } else if (args.rightIn) {
                if (nodeWidget) {
                    nodeWidget.updateAlignment();
                    nodeWidget.enabled = false;
                }
                node.position = endPos.add(cc.v3(cc.winSize.width, 0));
                cc.tween(node)
                    .to(args.animTime || 0.3, { position: endPos }, { easing: 'quadOut' }).call(() => {
                        if (nodeWidget) nodeWidget.enabled = true;
                        if (args.onShowEnd) {
                            args.onShowEnd(node, this);
                        }
                    }).start();
                if (this.maskLayer) {
                    this.maskLayer.stopAllActions();
                    // this.maskLayer.opacity = 0;
                    cc.tween(this.maskLayer).to(args.animTime || 0.3, { opacity: 255 }, { easing: 'quadOut' }).start();
                }
            } else if (args.leftIn) {
                if (nodeWidget) {
                    nodeWidget.updateAlignment();
                    nodeWidget.enabled = false;
                }
                node.position = endPos.add(cc.v3(-cc.winSize.width, 0));
                cc.tween(node).to(args.animTime || 0.3, { position: endPos }, { easing: 'quadOut' }).call(() => {
                    if (nodeWidget) nodeWidget.enabled = true;
                    if (args.onShowEnd) {
                        args.onShowEnd(node, this);
                    }
                }).start();
                if (this.maskLayer) {
                    this.maskLayer.stopAllActions();
                    // this.maskLayer.opacity = 0;
                    cc.tween(this.maskLayer).to(args.animTime || 0.3, { opacity: 255 }, { easing: 'quadOut' }).start();
                }
            } else {
                this.maskLayer.stopAllActions();
                this.maskLayer.opacity = 255;
                if (args.onShowEnd) {
                    args.onShowEnd(node, this);
                }
            }

        },
        // 检测弹窗是否已经添加过了
        checkIsAdded(node) {
            for (let i = 0; i < this.popupStack.length; i++) {
                let obj = this.popupStack[i]
                if (obj && obj.node) {
                    if (node.name == obj.name) {
                        return true;
                    }
                }
            }
            return false;
        },
        // 通过Path来检查是否已经添加
        checkIsAddedByPath(path) {
            for (let i = 0; i < this.popupStack.length; i++) {
                let itemPath = this.popupStack[i].path;
                if (typeof itemPath === 'string') {
                    if (path == itemPath) return true;
                } else if (itemPath instanceof cc.Prefab) {
                    if (path._name == itemPath._name) return true;
                } else {
                    if (path.name == itemPath.name) return true;
                }
            }
            return false;
        },
        //移除顶部弹框
        removeTop() {
            if (this.popupStack.length <= 0) return false;
            this.removePopup(this.popupStack[this.popupStack.length - 1].node);
            return true;
        },
        // 判断弹窗位置
        isTop(node) {
            if (this.popupStack.length <= 0) return true;
            if (node == this.popupStack[this.popupStack.length - 1].node) {
                return true;
            }
            return false;
        },
        // 获取第一个弹窗
        getTop() {
            if (this.popupStack.length > 0) {
                return this.popupStack[this.popupStack.length - 1].node;
            }
            return null;
        },
        // 根据弹窗堆栈的数据 控制弹窗 是否能关闭 是否需要遮黑
        updateStack() {
            if (!cc.find("Canvas")) return;
            // 更新所有弹窗的zindex
            for (let i = 0; i < this.popupStack.length; i++) {
                const popupObj = this.popupStack[i];
                if (popupObj.node) {
                    popupObj.node.zIndex = this.baseZIndex + (i + 1) * 3 + 1;
                    popupObj.zIndex = popupObj.node.zIndex;
                }
            }
            // cc.log('cc.find("Canvas")', cc.director.getScene().name, cc.find("Canvas"))
            // 底部黑色遮罩层 如果不存在 或者 已经被销毁了 就重新创建
            if (!this.maskLayer || !cc.isValid(this.maskLayer, true)) {
                this.maskLayer = new cc.Node();
                this.maskLayer.parent = cc.find("Canvas")
                this.maskLayer.width = cc.winSize.width;
                this.maskLayer.height = cc.winSize.height;
                let graphics = this.maskLayer.addComponent(cc.Graphics);
                graphics.fillColor = new cc.Color(0, 0, 0, 200)
                graphics.rect(-cc.winSize.width * 3 / 2, -cc.winSize.height * 3 / 2, cc.winSize.width * 3, cc.winSize.height * 3);
                graphics.fill();
            }
            // 找到最上面一层的需要mask的弹窗的弹窗
            let needMaskPopupIdx = -1;
            for (let i = this.popupStack.length - 1; i >= 0; i--) {
                if (!this.popupStack[i].noMask) { //需要mask
                    needMaskPopupIdx = i;
                    break;
                }
            }
            if (needMaskPopupIdx >= 0) {
                // 有弹窗需要mask
                let popupData = this.popupStack[needMaskPopupIdx]
                this.maskLayer.active = true;
                this.maskLayer.zIndex = popupData.zIndex - 2;
            } else {
                // 无弹窗需要mask
                this.maskLayer.active = false;
            }
            // 弹窗底部的一个透明触摸节点
            if (!this.touchLayer || !cc.isValid(this.touchLayer, true)) {
                this.touchLayer = new cc.Node();
                this.touchLayer.parent = cc.find("Canvas")
                this.touchLayer.width = cc.winSize.width * 3;
                this.touchLayer.height = cc.winSize.height * 3;

                // 点击到touchLayer后,判断是否可以关闭弹窗
                this.touchLayer.addComponent(cc.Button);
                // 添加一个提示图片预制体
                this.closeNode = null;
                cc.loader.loadRes("BalootClient/BaseRes/prefabs/popup_close", cc.Prefab, (err, prefab) => {
                    if (err) return;
                    this.closeNode = cc.instantiate(prefab);
                    this.closeNode.parent = this.touchLayer;
                    // this.closeNode.y = -cc.winSize.height / 2 + 300;
                    this.closeNode.y = -905;
                    this.closeNode.on("click", () => { this.removeTop() }, this)
                    if (this.popupStack.length > 0) {
                        this.closeNode.active = !this.popupStack[this.popupStack.length - 1].noCloseHit;
                    } else {
                        this.closeNode.active = false;
                    }
                })
                this.touchLayer.on("click", () => {
                    let top = this.popupStack[this.popupStack.length - 1];
                    if (!top.noTouchClose) {
                        this.removeTop();
                    }
                });
            }

            if (this.closeNode) {
                if (this.popupStack.length > 0) {
                    this.closeNode.active = !this.popupStack[this.popupStack.length - 1].noCloseHit;
                } else {
                    this.closeNode.active = false;
                }
            }

            // 设置是否生效
            if (this.popupStack.length > 0) {
                let top = this.popupStack[this.popupStack.length - 1]
                if (top.touchThrough) {
                    this.touchLayer.active = false;
                } else {
                    this.touchLayer.zIndex = top.zIndex - 1;
                    this.touchLayer.active = true;
                }
            } else {
                this.touchLayer.active = false;
            }

            //当前的窗口是否有延迟关闭配置
            let curWinParam = this.popupStack[this.popupStack.length - 1];
            if (curWinParam && curWinParam.delayCloseTime) {
                if (this.touchLayer.active) {
                    let btnCmp = this.touchLayer.getComponent(cc.Button)
                    btnCmp.enabled = false
                    cc.tween(this.touchLayer)
                        .delay(curWinParam.delayCloseTime)
                        .call(() => {
                            let btnCmp = this.touchLayer.getComponent(cc.Button)
                            btnCmp.enabled = true
                        })
                        .start()
                }
            }
        },
        // 移除一个弹框
        removePopup(popup, froce) {
            if (!popup) return;
            if (!cc.isValid(popup)) return;
            for (var i = 0; i < this.popupStack.length; i++) {
                if (this.popupStack[i].node == popup) {
                    if (!this.popupStack[i].closeOutSound) {
                        cc.vv.EventManager.emit("EVENT_BTN_CLOSE_SOUNDS");
                    }
                    let removePopup = () => {
                        if (this.popupStack[i].onClose) {
                            this.popupStack[i].onClose(this.popupStack[i].node, this);
                        }
                        this.onClosePopup(this.popupStack[i]);
                        this.popupStack[i].node.destroy()	//移除弹框节点
                        this.popupStack.splice(i, 1); 		//移除堆栈
                        this.updateStack()
                    };
                    if (!froce && this.popupStack[i].onCloseBefore) {
                        this.popupStack[i].onCloseBefore(this.popupStack[i].node, removePopup);
                    } else {
                        removePopup();
                    }
                    break;
                }
            }
            this.updateStack()
        },
        // 移除所有弹框
        removeAll() {
            for (let i = 0; i < this.popupStack.length; i++) {
                let obj = this.popupStack[i]
                if (obj && obj.node && obj.node.destroy) {
                    if (obj.onClose) {
                        obj.onClose(obj.node, this);
                    }
                    this.onClosePopup(obj)
                    obj.node.destroy();
                }
            }
            this.popupStack = [];//清楚当前显示堆栈
            this.waitingQueue = [];//清楚预加队列
            // 移除touchlayer 与 masklayer
            if (this.touchLayer && cc.isValid(this.touchLayer, true)) {
                this.touchLayer.destroy();
            }
            if (this.maskLayer && cc.isValid(this.maskLayer, true)) {
                this.maskLayer.destroy();
            }
            this.maskLayer = null;
            this.touchLayer = null;
        },
        // 获取弹窗
        getPopupByName(name) {
            for (let i = 0; i < this.popupStack.length; i++) {
                let obj = this.popupStack[i]
                if (obj && obj.node) {
                    if (name == obj.name) {
                        return obj.node;
                    }
                }
            }
            return null;
        },
        onClosePopup(args) {
            let node = args.node;

            let bottomOut = args.bottomOut;

            let leftOut = args.leftOut;
            let rightOut = args.rightOut;

            let scaleOut = args.scaleOut;
            let scaleOutParm = args.scaleOutParm;
            StatisticsMgr.reqReportNow(ReportConfig.POPUP_CLOSE, args.name);
            if (bottomOut) {
                // let tempNode = this.createTempPopup(node);
                // cc.tween(tempNode)
                //     .to(0.3, { position: node.position.add(cc.v3(0, -cc.winSize.height)) }, { easing: 'quadIn' })
                //     .call(() => {
                //         tempNode.destroy();
                //     })
                //     .start();
            } else if (scaleOut && scaleOutParm) {
                let tempNode = this.createTempPopup(node);
                cc.tween(tempNode)
                    .to(0.1, { scale: 0.5 })
                    .to(0.2, { scale: 0.03, position: scaleOutParm.toPos }, { easing: 'quadOut' })
                    .call(() => {
                        if (scaleOutParm.node) {
                            cc.tween(scaleOutParm.node).to(0.05, { scale: scaleOutParm.scale * 1.1 }).to(0.05, { scale: scaleOutParm.scale }).start();
                        }
                        tempNode.destroy();
                    })
                    .start();
            } else if (rightOut) {
                // let tempNode = this.createTempPopup(node);
                // cc.tween(tempNode)
                //     .to(0.3, { position: node.position.add(cc.v3(cc.winSize.width, 0)) }, { easing: 'quadIn' })
                //     .call(() => {
                //         tempNode.destroy();
                //     })
                //     .start();
            } else if (leftOut) {
                // let tempNode = this.createTempPopup(node);
                // cc.tween(tempNode)
                //     .to(0.3, { position: node.position.add(cc.v3(-cc.winSize.width, 0)) }, { easing: 'quadIn' })
                //     .call(() => {
                //         tempNode.destroy();
                //     })
                //     .start();
            }
        },
        // 创建临时弹窗
        createTempPopup(node) {
            for (const cpt of node.getComponentsInChildren(cc.Component)) {
                if (cpt instanceof cc.Sprite) {
                } else if (cpt instanceof cc.Label) {
                } else if (cpt instanceof sp.Skeleton) {
                } else if (cpt instanceof cc.Mask) {
                } else {
                    cpt.enabled = false;
                }
            }
            for (const cpt of node.getComponentsInChildren("Tabbar")) {
                cpt.node.active = false;
            }
            for (const cpt of node.getComponentsInChildren("List")) {
                cpt.node.active = false;
            }
            for (const cpt of node.getComponentsInChildren("ListView")) {
                cpt.node.active = false;
            }
            for (const cpt of node.getComponentsInChildren("NetListenerCmp")) {
                cpt.clear();
            }
            for (const cpt of node.getComponentsInChildren("EventListenerCmp")) {
                cpt.clear();
            }
            for (const cpt of node.getComponents("NetListenerCmp")) {
                cpt.clear();
            }
            for (const cpt of node.getComponents("EventListenerCmp")) {
                cpt.clear();
            }
            let tempNode = cc.instantiate(node);

            // for (const iterator of tempNode.getComponentsInChildren(cc.Component)) {
            //     iterator.onLoad = () => { };
            //     iterator.onEnable = () => { };
            //     iterator.start = () => { };
            //     iterator.onDisable = () => { };
            //     iterator.onDestroy = () => { };
            // }
            // for (const cpt of tempNode.getComponentsInChildren("List")) {
            //     cpt.node.active = false;
            // }
            // for (const cpt of tempNode.getComponentsInChildren("ListView")) {
            //     cpt.node.active = false;
            // }
            // // TODO 目前还没想好如何更好的实现 临时处理
            // for (const cpt of tempNode.getComponentsInChildren("PopupMailView")) {
            //     cpt.enabled = false;
            // }
            // for (const cpt of tempNode.getComponentsInChildren("RoomListView")) {
            //     cpt.enabled = false;
            // }

            tempNode.parent = node.parent;
            tempNode.position = node.position;
            tempNode.zIndex = 1000;
            return tempNode;
        },
        //显示一个层级可控的窗口,不会进入弹窗队列中
        showTopWin(url, args, zIndex = 10000) {
            cc.loader.loadRes(url, cc.Prefab, (err, prefab) => {
                if (!err) {
                    let node_win = cc.instantiate(prefab)
                    node_win.zIndex = zIndex
                    node_win.parent = cc.director.getScene()//cc.find("Canvas")
                    if (args.onShow) {
                        args.onShow(node_win, this);
                    }
                }
            })
        }
    },
    log() {
        cc.log(this.popupStack)
    },

});