import PokerCpt from "./PokerCpt";

// 牌组移动牌 动作组件
const { ccclass, property, menu } = cc._decorator;
interface actionOutType {
	toNode: cc.Node,
	toScale: number
	rotate: number
	animTime: number, delayTime: number, pokerCpt: PokerCpt,
}
@ccclass
@menu('棋牌核心/牌相关/牌动作/移除')
export default class PokerActionOutCpt extends cc.Component {
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
	// 延迟执行时间
	delayTime: number = 0;
	@property(cc.Float)
	rotate: number = 0;
	// 需要移除的卡牌
	pokerCpt: PokerCpt = null;
	//
	getArgs(): actionOutType {
		let ret: actionOutType = {
			toNode: this.toNode,
			toScale: this.toScale,
			animTime: this.animTime,
			delayTime: this.delayTime,
			rotate: this.rotate,
			pokerCpt: this.pokerCpt,
		}
		return ret;
	}
}
