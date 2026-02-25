import PokerCpt from "./PokerCpt";
import PokerLayoutCpt from "./PokerLayoutCpt";

// 牌组移动牌 动作组件
const { ccclass, property, menu } = cc._decorator;
interface actionInType {
	fromNode: cc.Node, fromScale: number, isNew: number, rotate: number,
	animTime: number,
	waitTime: number,
	delayTime: number, pokerCpt: PokerCpt,
	toLayout: PokerLayoutCpt, toIndex?: number
}
@ccclass
@menu('棋牌核心/牌相关/牌动作/加入')
export default class PokerActionInCpt extends cc.Component {
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
	// 延迟时间
	delayTime: number = 0;
	@property(cc.Float)
	rotate: number = 0;
	// 需要创建的牌值
	isNew = 0;
	// 需要移动的组件
	pokerCpt: PokerCpt = null;
	// 加入的layout
	toLayout: PokerLayoutCpt = null;
	// 加入的index
	toIndex: number;
	waitTime: number = 0;
	getArgs(): actionInType {
		let ret: actionInType = {
			fromNode: this.fromNode,
			fromScale: this.fromScale,
			animTime: this.animTime,
			delayTime: this.delayTime,
			waitTime: this.waitTime,
			isNew: this.isNew,
			rotate: this.rotate,
			pokerCpt: this.pokerCpt,
			toLayout: this.toLayout,
			toIndex: this.toIndex,
		};
		return ret;
	}
}
