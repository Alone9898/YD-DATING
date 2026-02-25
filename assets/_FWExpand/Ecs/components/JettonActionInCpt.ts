import PokerCpt from "./PokerCpt";
import JettonCpt from "./JettonCpt";
// 筹码加入 动作组件
const { ccclass, property, menu } = cc._decorator;
interface actionInType {
	fromNode: cc.Node, fromScale?: number, animTime: number, jettonCpt?: JettonCpt,
	onComplete?: Function, newChips?: number,
}
@ccclass
@menu('棋牌核心/筹码相关/筹码动作/加入')
export default class JettonActionInCpt extends cc.Component {
	@property(cc.String)
	key: String = '';
	// 牌初始位置
	@property(cc.Node)
	fromNode: cc.Node = null;
	// 动作执行前的Scale
	@property(cc.Float)
	fromScale: number = 1;
	// 动作时间
	@property(cc.Float)
	animTime: number = 1;
	// 需要移动筹码组件
	jettonCpt: JettonCpt = null;
	// 动作完成 回调
	onComplete: Function = null;

	newChips: number = 0;
	//
	getArgs(): actionInType {
		let ret: actionInType;
		ret = {
			fromNode: this.fromNode,
			fromScale: this.fromScale,
			animTime: this.animTime,
			jettonCpt: this.jettonCpt,
			onComplete: this.onComplete,
			newChips: this.newChips
		}
		return ret;
	}
}
