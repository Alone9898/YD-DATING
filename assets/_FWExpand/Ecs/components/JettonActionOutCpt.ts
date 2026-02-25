import JettonCpt from "./JettonCpt";
import JettonLayoutCpt from "./JettonLayoutCpt";

// 筹码移除 动作组件
const { ccclass, property, menu } = cc._decorator;
interface actionOutType {
	toNode: cc.Node, toScale: number, animTime: number, onComplete?: Function,
	jettonCpt: JettonCpt, newChips?: number, layout: JettonLayoutCpt
}
@ccclass
@menu('棋牌核心/筹码相关/筹码动作/移除')
export default class JettonActionOutCpt extends cc.Component {
	@property(cc.String)
	key: String = '';
	// 牌初始位置
	@property(cc.Node)
	toNode: cc.Node = null;
	// 最终大小
	@property(cc.Float)
	toScale: number = 1;
	// 动作时间
	@property(cc.Float)
	animTime: number = 1;
	// 需要移除的筹码组件
	jettonCpt: JettonCpt = null;
	// 动作完成 回调
	onComplete: Function = null;

	layout: JettonLayoutCpt = null;
	newChips: number = 0;
	//获取动作参数副本
	getArgs(): actionOutType {
		let ret: actionOutType;
		ret = {
			toNode: this.toNode,
			toScale: this.toScale,
			animTime: this.animTime,
			onComplete: this.onComplete,
			jettonCpt: this.jettonCpt,
			newChips: this.newChips,
			layout: this.layout,
		}
		return ret;
	}
}
