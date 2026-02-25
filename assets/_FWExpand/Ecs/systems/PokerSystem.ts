import PokerCpt, { POKER_EVENT } from "../components/PokerCpt";
import PokerLayoutCpt, { PokerLayoutType } from "../components/PokerLayoutCpt";
import PokerActionInCpt from "../components/PokerActionInCpt";
import PokerActionOutCpt from "../components/PokerActionOutCpt";
import PokerActionChangeCpt from "../components/PokerActionChangeCpt";
import System from "../System";

// 扑克牌系统 system (用于操作常见的扑克牌操作, 发牌 开牌 等等)
const { ccclass, property, menu } = cc._decorator;

@ccclass
@menu('棋牌核心/牌相关/牌系统')
export default class PokerSystem extends System {

	@property(cc.Prefab)
	pokerPrefab: cc.Prefab = null;

	parentNode: cc.Node = null;

	// ----------------------- 创建 和 销毁 ---------------------------------
	// 创建 一张牌
	createPoker(cardUint?, parent?: cc.Node): PokerCpt {
		let pokerNode = cc.instantiate(this.pokerPrefab);
		if (parent) {
			pokerNode.parent = parent;
		} else if (this.parentNode) {
			pokerNode.parent = this.parentNode;
		} else {
			pokerNode.parent = this.node;
		}
		pokerNode.position = cc.v3(0, 2000);
		let cpt = pokerNode.addComponent(PokerCpt);
		cpt.init();
		if (cardUint != undefined) {
			cpt.uint = cardUint;
		}
		Global.dispatchEvent(POKER_EVENT.NEW, cpt);
		return cpt;
	}
	// 创建 一组组牌
	createPokerList(uintList, parent?: cc.Node): PokerCpt[] {
		let pokerList = [];
		for (const uint of uintList) {
			let cpt = this.createPoker(uint, parent);
			pokerList.push(cpt);
		}
		return pokerList;
	}
	// 销毁 一张牌 或是 一个牌组中的 一张固定下标的牌
	destroyPoker(poker: PokerCpt | PokerLayoutCpt, idx: number = -1) {
		if (poker instanceof PokerCpt) {
			if (poker.layout) {
				poker.layout.pokerList = poker.layout.pokerList.filter(item => item !== poker);
				poker.layout = null;
			}
			poker.node.destroy();
		} else if (poker instanceof PokerLayoutCpt) {
			let pokerLayout = poker;
			if (idx < 0) {//小于0的下标表示销毁所有牌
				for (let i = 0; i < pokerLayout.pokerList.length; ++i) {
					let card = pokerLayout.pokerList[i];
					card.layout = undefined;
					this.destroyPoker(card);
				}
				pokerLayout.pokerList = [];
			} else {//只销毁下标指向的牌
				let card = pokerLayout.pokerList[idx];
				if (!card.layout) {
					card.layout = pokerLayout;
				}
				this.destroyPoker(card);
			}
		}
	}
	// 销毁 一组牌 或是 一个牌组下面的所有牌
	destroyPokerList(pokerList: PokerCpt[] | PokerLayoutCpt) {
		if (Array.isArray(pokerList)) {
			for (const pokerCpt of pokerList) {
				this.destroyPoker(pokerCpt);
			}
		} else if (pokerList instanceof PokerLayoutCpt) {
			this.destroyPoker(pokerList, -1);
		}
	}
	// 销毁 指定牌组的牌
	destroyPokerByKey(key) {
		let layout = this.getCptByKey(PokerLayoutCpt, key);
		for (const pokerCpt of layout.pokerList) {
			this.destroyPoker(pokerCpt);
		}
	}
	// 销毁 所有牌
	destroyAllPoker() {
		// 遍历所有牌组 进行移除
		for (const layout of this.getCpts(PokerLayoutCpt)) {
			this.destroyPokerList(layout);
		}
		// 清楚没有绑定的牌
		for (const cpt of this.getCpts(PokerCpt, (cpt: PokerCpt) => { return !cpt.layout })) {
			this.destroyPoker(cpt);
		}
	}

	// ----------------------- 绑定 和 解除 ---------------------------------
	// 牌 和 牌组 绑定
	bindToLayout(pokerList: PokerCpt[] | PokerCpt, layout: PokerLayoutCpt, idx?: number) {
		if (Array.isArray(pokerList)) {
			if (idx == undefined)
				idx = layout.pokerList.length;
			for (const pokerCpt of pokerList) {
				this.bindToLayout(pokerCpt, layout, idx);
				idx++;
			}
		} else if (pokerList) {
			let pokerCpt = pokerList;
			//如果已经有了所属的布局,需要先解除布局绑定
			if (pokerCpt.layout && pokerCpt.layout != layout) {
				this.unBindToLayout(pokerCpt);
			}
			if (layout.pokerList.indexOf(pokerCpt) < 0) {
				if (idx == undefined || idx == null) {
					layout.pokerList.push(pokerCpt);
				} else {
					// idx = layout.pokerList.length;
					idx = Math.min(idx, layout.pokerList.length);
					layout.pokerList.splice(idx, 0, pokerCpt);
				}
				pokerCpt.layout = layout;
			}
		}
		return layout.pokerList
	}
	// 解绑
	unBindToLayout(pokerCpt: PokerCpt) {
		if (pokerCpt.layout) {
			pokerCpt.layout.pokerList = pokerCpt.layout.pokerList.filter(item => item !== pokerCpt)
			pokerCpt.layout = null;
		}
	}

	// ----------------------- 动作 和 动画 ---------------------------------
	// 执行poker动作
	async runNodeAction(action) {
		let node: cc.Node = action.node;
		if (action.preCallback) {
			action.preCallback(action)
		}
		if (action.waitTime) {
			// cc.log(action.waitTime)
			await this.delay(action.waitTime);
		}
		node.stopAllActions();
		if (action.zorder != undefined) {
			node.zIndex = action.zorder;
		}
		if (action.animTime) {
			// let seqArr = [];
			// if (action.delayTime != undefined) {
			// 	seqArr.push(cc.delayTime(action.delayTime))
			// }
			// if (action.startCallback) {
			// 	seqArr.push(cc.callFunc(() => {
			// 		if (action.startCallback) {
			// 			action.startCallback(action)
			// 		}
			// 	}))
			// }
			// let spaArr = [];
			// if (action.pos != undefined) {
			// 	spaArr.push(cc.moveTo(action.animTime, action.pos));
			// }
			// if (action.scale != undefined) {
			// 	spaArr.push(cc.scaleTo(action.animTime, action.scale));
			// }
			// if (action.rotate != undefined) {
			// 	spaArr.push(cc.rotateTo(action.animTime, action.rotate));
			// }
			// if (action.opacity != undefined) {
			// 	spaArr.push(cc.fadeTo(action.animTime, action.opacity));
			// }
			// seqArr.push(cc.spawn(spaArr))
			// seqArr.push(cc.callFunc(() => {
			// 	if (action.completeCallback) {
			// 		action.completeCallback(action)
			// 	}
			// }))
			// node.runAction(cc.sequence(seqArr));
			let actionArgs: any = {}
			if (action.pos != undefined) {
				actionArgs.position = action.pos;
			}
			if (action.scale != undefined) {
				actionArgs.scale = action.scale;
			}
			if (action.rotate != undefined) {
				actionArgs.angle = -action.rotate;
			}
			if (action.opacity != undefined) {
				actionArgs.opacity = action.opacity;
			}
			cc.tween(node)
				.delay(action.delayTime)
				.call(() => {
					if (action.startCallback) {
						action.startCallback(action)
					}
				})
				.to(action.animTime, actionArgs, { easing: "sineOut" })
				.call(() => {
					if (action.completeCallback) {
						action.completeCallback(action)
					}
				}).start();
		} else {
			if (action.pos != undefined) {
				node.position = action.pos;
			}
			if (action.scale != undefined) {
				node.scale = action.scale;
			}
			if (action.rotate != undefined) {
				node.angle = -action.rotate;
			}
		}
	}
	// 获取对应的牌动作
	getAttrTByLayout(pokerCpt: PokerCpt, attr?) {
		attr = attr || {}
		attr.node = pokerCpt.node;
		let layoutCpt = pokerCpt.layout;
		if (layoutCpt) {
			return layoutCpt.getAttrTByLayout(pokerCpt, attr);
		}
	}
	// 刷新牌组所有牌的位置
	updateLayout(layout: PokerLayoutCpt, args?) {
		args = args || {}
		// 刷新牌组位置
		let index = 0;
		for (const cpt of layout.pokerList) {
			// 监听最后一张牌动作结束
			let parm = Global.deepClone(args)
			if (parm.onFinallyComplete) {
				if (++index == layout.pokerList.length) {
					parm.completeCallback = parm.onFinallyComplete
				}
			}
			// 执行poker动作
			this.runNodeAction(this.getAttrTByLayout(cpt, parm));
		}
	}
	// 牌组 创建 切换 其他牌加入 牌组
	pokerInLayout(layoutAction: PokerActionInCpt, listeners?) {
		listeners = listeners || {}
		let actArgs = layoutAction.getArgs();
		let layout: PokerLayoutCpt = actArgs.toLayout;
		if (!layout) return;
		let inPoker = null;
		if (actArgs.pokerCpt) {
			if (actArgs.pokerCpt.layout) {
				let oldLayout = actArgs.pokerCpt.layout
				// 解绑
				this.unBindToLayout(actArgs.pokerCpt);
				// 刷新离开牌组位置
				for (const cpt of oldLayout.pokerList) {
					// 执行poker动作
					this.runNodeAction(this.getAttrTByLayout(cpt, { animTime: actArgs.animTime }));
				}
			}
			inPoker = actArgs.pokerCpt;
		} else {
			return;
		}
		//if (!inPoker) return;
		let idx = actArgs.toIndex;
		// 绑定牌
		this.bindToLayout(inPoker, layout, idx);
		// 刷新牌组位置
		this.updateLayout(layout, { animTime: actArgs.animTime })
		// 新牌执行动作
		this.runNodeAction(this.getAttrTByLayout(inPoker, {
			animTime: actArgs.animTime,
			delayTime: actArgs.delayTime,
			waitTime: actArgs.waitTime,
			preCallback: (action) => {
				if (actArgs.fromNode) {
					let worldPos: cc.Vec2 = actArgs.fromNode.convertToWorldSpaceAR(cc.Vec2.ZERO);
					action.node.setPosition(cc.v2(action.node.parent.convertToNodeSpaceAR(worldPos)));
				}
				if (actArgs.fromScale) {
					action.node.scale = actArgs.fromScale;
				}
				listeners.onPre && listeners.onPre(action)
			},
			completeCallback: (action) => {
				listeners.onComplete && listeners.onComplete(action)
			}
		}));
	}
	// 切换牌组动作
	pokerChangeLayout(layoutAction: PokerActionChangeCpt, listeners?) {
		listeners = listeners || {}
		let actArgs = layoutAction.getArgs();
		let layout: PokerLayoutCpt = actArgs.toLayout;
		if (!layout) return;
		let movePoker = null;
		// 如果是牌组件
		if (actArgs.pokerCpt) {
			if (actArgs.pokerCpt.layout) {
				let oldLayout = actArgs.pokerCpt.layout
				// 解绑
				this.unBindToLayout(actArgs.pokerCpt);
				// 刷新离开牌组位置
				for (const cpt of oldLayout.pokerList) {
					// 执行poker动作
					this.runNodeAction(this.getAttrTByLayout(cpt, {
						animTime: actArgs.animTime,
					}));
				}
			}
			movePoker = actArgs.pokerCpt;
		}
		if (!movePoker) return;
		// 绑定牌
		this.bindToLayout([movePoker], layout);
		// 刷新牌组位置
		for (const cpt of layout.pokerList) {
			// 执行poker动作
			this.runNodeAction(this.getAttrTByLayout(cpt, {
				animTime: actArgs.animTime,
				delayTime: actArgs.delayTime,
				rotate: actArgs.rotate,
				waitTime: actArgs.waitTime,
				preCallback: (action) => {
					listeners.onPre && listeners.onPre(action)
				},
				completeCallback: (action) => {
					listeners.onComplete && listeners.onComplete(action)
				}
			}));
		}
	}
	// 移除一张牌动作
	pokerOutLayout(layoutAction: PokerActionOutCpt, listeners?) {
		listeners = listeners || {}
		let actArgs = layoutAction.getArgs();
		let layout = null;
		let removePokerCpt = null //layoutAction.pokerCpt
		if (actArgs.pokerCpt) {
			removePokerCpt = actArgs.pokerCpt;
			layout = actArgs.pokerCpt.layout;
		}
		if (!removePokerCpt) return;
		// 找到需要移除的牌, 移除牌组
		this.unBindToLayout(removePokerCpt);
		// 保证位置准确
		let worldPos = actArgs.toNode.convertToWorldSpaceAR(cc.Vec2.ZERO);
		let endPos = cc.v3(removePokerCpt.node.parent.convertToNodeSpaceAR(worldPos));
		// 执行动作
		this.runNodeAction({
			node: removePokerCpt.node,
			pos: endPos, //actArgs.toNode.position,
			scale: actArgs.toScale,
			rotate: actArgs.rotate,
			animTime: actArgs.animTime,
			delayTime: actArgs.delayTime,
			preCallback: (action) => {
				listeners.onPre && listeners.onPre(action)
			},
			completeCallback: (action) => {
				listeners.onComplete && listeners.onComplete(action)
				this.destroyPoker(removePokerCpt);
			}
		});
		// 刷新牌组位置
		if (layout) {
			this.updateLayout(layout, { animTime: actArgs.animTime })
		}
	}

	// 强制全量刷新牌组
	forceUpdateLayout(layout: PokerLayoutCpt, cardList: any[], parent?: cc.Node) {
		// 保留之前的牌 ,移除不要的牌, 新增牌
		let newCards = []
		for (const uint of cardList) {
			let isNew = true;
			for (const pokerCpt of layout.pokerList) {
				if (uint == pokerCpt.uint) {
					isNew = false;
				}
			}
			if (isNew) {
				newCards.push(uint);
			}
		}
		this.bindToLayout(this.createPokerList(newCards, parent), layout);
		let removePokers = []
		layout.pokerList.forEach(cpt => {
			let isRemove = true
			for (const uint of cardList) {
				if (cpt.uint == uint) {
					isRemove = false;
				}
			}
			if (isRemove) {
				removePokers.push(cpt);
			}
		})
		// 移除被删除的的poker
		this.destroyPokerList(removePokers);
		// 进行排序 把新增的牌放到后面
		// let tempPokerList = []
		// for (const uint of cardList) {
		// 	tempPokerList = tempPokerList.concat(layout.pokerList.filter(cpt => cpt.uint == uint))
		// }
		// cc.log(layout.pokerList)
		// cc.log(tempPokerList)
		// layout.pokerList = tempPokerList;
	}

	// 获得自己手牌中选中的牌值数组
	getSelectCards(layout: PokerLayoutCpt) {
		let cards = [];
		for (const poker of layout.pokerList) {
			if (poker.isSelect) {
				cards.push(poker.uint)
			}
		}
		return cards;
	}
	getSelectPokers(layout: PokerLayoutCpt) {
		let cards = [];
		for (const poker of layout.pokerList) {
			if (poker.isSelect) {
				cards.push(poker)
			}
		}
		return cards;
	}

}

