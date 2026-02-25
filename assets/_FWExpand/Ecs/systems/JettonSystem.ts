import JettonCpt, { FrameAttr } from "../components/JettonCpt";
import JettonLayoutCpt, { JettonLayoutType } from "../components/JettonLayoutCpt";
import JettonActionInCpt from "../components/JettonActionInCpt";
import JettonActionOutCpt from "../components/JettonActionOutCpt";
import System from "../System";

// 筹码系统 system (用于操作常见的扑克牌操作, 发牌 开牌 等等)
const { ccclass, property, menu } = cc._decorator;

@ccclass
@menu('棋牌核心/筹码相关/筹码系统')
export default class JettonSystem extends System {
	//配置文件
	@property([FrameAttr])
	frameAttrList: FrameAttr[] = [];
	@property(cc.Prefab)
	jettonPrefab: cc.Prefab = null;

	parentNode: cc.Node = null;

	// ----------------------- 创建 和 销毁 ---------------------------------
	// 创建 一个筹码
	createJetton(chips?: number, parent?: cc.Node): JettonCpt {
		let node = cc.instantiate(this.jettonPrefab)
		node.parent = parent || this.parentNode;
		let cpt = node.getComponent(JettonCpt);
		cpt.frameAttrList = this.frameAttrList;
		if (chips != undefined) {
			cpt.chips = chips
		}
		return cpt;
	}
	// 创建 一组筹码
	createJettonList(chipsList, parent?: cc.Node): JettonCpt[] {
		let list = []
		for (const uint of chipsList) {
			let cpt = this.createJetton(uint, parent)
			list.push(cpt);
		}
		return list;
	}
	createJettonByConfig(chips, config, max?, parent?: cc.Node): JettonCpt[] {
		max = max || 40;
		let list: JettonCpt[] = []
		let index = config.length - 1;
		let betValue = config[index];
		let indexCount = 0;
		while (chips > 0 && betValue && indexCount <= max) {
			if (chips >= betValue) {
				list.push(this.createJetton(betValue, parent));
				indexCount++;
				chips -= betValue;
			} else {
				betValue = config[--index];
				if (!betValue) {
					cc.warn("找不到合适的筹码配置:", chips);
				}
			}
		}
		return list;
	}
	// 销毁 一张牌
	destroyJetton(cpt: JettonCpt | JettonLayoutCpt) {
		if (cpt instanceof JettonCpt) {
			if (cpt.layout) {
				let idx = cpt.layout.list.findIndex(item => item === cpt);
				if (idx >= 0) {
					cpt.layout.list.splice(idx, 1);
				}
				//cpt.layout.list = cpt.layout.list.filter(item => item !== cpt)
			}
			cpt.node.destroy();
		} else if (cpt instanceof JettonLayoutCpt) {
			this.destroyJettonList(cpt.list);
		}
	}
	// 销毁 一组牌
	destroyJettonList(cptList) {
		let len = cptList.length;
		for (let i = len - 1; i >= 0; i--) {
			this.destroyJetton(cptList[i]);
		}
	}
	// 销毁 指定牌组的牌
	destroyJettonByKey(key) {
		let layout = this.getCptByKey(JettonLayoutCpt, key)
		for (const cpt of layout.list) {
			this.destroyJetton(cpt);
		}
	}
	// 销毁 所有筹码
	destroyAllJetton() {
		// 遍历所有牌组 进行移除
		for (const layout of this.getCpts(JettonLayoutCpt)) {
			this.destroyJettonList(layout.list);
		}
		// 清楚没有绑定的牌
		for (const cpt of this.getCpts(JettonCpt, (cpt: JettonCpt) => { return !cpt.layout })) {
			this.destroyJetton(cpt);
		}
	}
	// ----------------------- 绑定 和 解除 ---------------------------------
	// 牌 和 牌组 绑定
	bindToLayout(list, layout) {
		for (const cpt of list) {
			cpt.layout = layout;
			layout.list.push(cpt);
		}
		return layout.list
	}
	// 解绑
	unBindToLayout(cpt: JettonCpt, layout?: JettonLayoutCpt) {
		if (cpt.layout) {
			layout = layout || cpt.layout;
			cpt.layout = null;
		}
		let idx = layout.list.findIndex(item => item === cpt);
		if (idx >= 0) {
			layout.list.splice(idx, 1);
		}
		//layout.list = layout.list.filter(item => item !== cpt)
		return layout.list;
	}

	// ----------------------- 动作 和 动画 ---------------------------------
	// 执行poker动作
	runNodeAction(action) {
		if (action.preCallback) {
			action.preCallback(action.node)
		}
		action.node.stopAllActions()
		if (action.animTime) {
			// let spaArr = [
			// 	cc.moveTo(action.animTime, action.pos),
			// 	cc.scaleTo(action.animTime, action.scale)
			// ]
			// let seq = cc.sequence(
			// 	cc.spawn(spaArr),
			// 	// cc.moveTo(action.animTime, action.pos),
			// 	cc.callFunc(() => {
			// 		if (action.completeCallback) {
			// 			action.completeCallback(action.node)
			// 		}
			// 	})
			// );
			// action.node.runAction(seq);
			cc.tween(action.node)
				.to(action.animTime, { position: action.pos, scale: action.scale, angle: Math.random() * 360 }, { easing: 'sineOut' })
				.call(() => {
					if (action.completeCallback) {
						action.completeCallback(action.node)
					}
				})
				.start();

		} else {
			action.node.position = action.pos;
			action.node.scale = action.scale;
		}
	}
	// 获取相对于的位置
	getAttrTByLayout(layoutCpt: JettonLayoutCpt, cpt: JettonCpt, attr?) {
		attr = attr || {}
		if (!cpt.isValid) return;
		attr.node = cpt.node;
		if (layoutCpt.type == JettonLayoutType.Rect) {
			let box = layoutCpt.node.getBoundingBoxToWorld();
			// 局部位置
			let pos = cc.v2(box.x, box.y).add(cc.v2(Math.random() * box.width, Math.random() * box.height))
			// 世界位置
			attr.pos = cpt.node.parent.convertToNodeSpaceAR(pos);
			// 大小控制
			attr.scale = layoutCpt.scale;
		}
		return attr;
	}
	// 牌组 创建 切换 其他牌加入 牌组
	jettonInLayout(layout: JettonLayoutCpt, layoutAction: JettonActionInCpt, listeners?) {
		listeners = listeners || {}
		let inJetton = null;
		let actArgs = layoutAction.getArgs();
		// 如果是牌组件
		if (actArgs.jettonCpt) {
			if (actArgs.jettonCpt.layout) {
				// 解绑
				this.unBindToLayout(actArgs.jettonCpt, actArgs.jettonCpt.layout);
			}
			inJetton = actArgs.jettonCpt;
		} else if (actArgs.newChips) {
			inJetton = this.createJetton(actArgs.newChips)
		}

		if (!inJetton || !inJetton.isValid) return;
		// 绑定牌
		this.bindToLayout([inJetton], layout);
		// 新牌执行动作
		this.runNodeAction(this.getAttrTByLayout(layout, inJetton, {
			animTime: actArgs.animTime || 0.5,
			preCallback: (node: cc.Node) => {
				node.zIndex = 100;
				if (actArgs.newChips || actArgs.fromNode) {
					let worldPos = actArgs.fromNode.convertToWorldSpaceAR(cc.Vec2.ZERO);
					node.position = cc.v3(node.parent.convertToNodeSpaceAR(worldPos));
				}
				if (actArgs.fromScale) {
					node.scale = actArgs.fromScale;
				}
				listeners.onPre && listeners.onPre(node)
			},
			completeCallback: (node: cc.Node) => {
				node.zIndex = 1;
				listeners.onComplete && listeners.onComplete(node)
				if (actArgs.onComplete) {
					actArgs.onComplete();
				}
			}
		}));
	}
	// 移除一个筹码
	jettonOutLayout(layoutAction: JettonActionOutCpt) {
		let outJetton = null //layoutAction.pokerCpt
		let layout = null
		let actArgs = layoutAction.getArgs();
		if (actArgs.jettonCpt) {
			outJetton = actArgs.jettonCpt;
			layout = actArgs.jettonCpt.layout;
		} else if (actArgs.newChips) {
			outJetton = this.createJetton(actArgs.newChips);
			layout = actArgs.layout;
		}
		if (!outJetton || !outJetton.isValid) return;
		//if (!layout) return;
		// 解绑
		if (layout) {
			this.unBindToLayout(outJetton, layout);
		}
		// 保证位置准确
		let worldPos = actArgs.toNode.convertToWorldSpaceAR(cc.Vec2.ZERO);
		let endPos = cc.v3(outJetton.node.parent.convertToNodeSpaceAR(worldPos));
		// 执行动作
		this.runNodeAction({
			node: outJetton.node,
			pos: endPos,
			scale: actArgs.toScale,
			animTime: actArgs.animTime,
			preCallback: (node: cc.Node) => {
				node.zIndex = 100;
			},
			completeCallback: (node: cc.Node) => {
				node.zIndex = 1;
				if (actArgs.onComplete) {
					actArgs.onComplete();
				}
				this.destroyJetton(outJetton);
			}
		});
	}

}
