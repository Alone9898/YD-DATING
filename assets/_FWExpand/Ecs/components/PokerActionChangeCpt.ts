import PokerCpt from "./PokerCpt";
import PokerLayoutCpt from "./PokerLayoutCpt";

// 牌组移动牌 动作组件
const { ccclass, property, menu } = cc._decorator;
interface actionChangeType {
	animTime: number,
	delayTime: number,
	waitTime: number,
	rotate: number,
	pokerCpt: PokerCpt,
	toLayout: PokerLayoutCpt,
}
@ccclass
@menu('棋牌核心/牌相关/牌动作/移动')
export default class PokerActionChangeCpt extends cc.Component {
	@property(cc.String)
	key: String = '';
	// 动作时间
	@property(cc.Float)
	animTime: number = 1;
	// 等待时间
	waitTime: number;
	// 延迟时间
	delayTime: number = 0;
	@property(cc.Float)
	rotate: number = 0;
	// 需要移动的卡牌
	pokerCpt: PokerCpt = null;
	// 动作完成 回调
	onComplete: Function = null;
	// 加入的layout
	toLayout: PokerLayoutCpt = null;
	//获取动作执行必要参数
	getArgs(): actionChangeType {
		let ret: actionChangeType = {
			animTime: this.animTime,
			delayTime: this.delayTime,
			waitTime: this.waitTime,
			rotate: this.rotate,
			pokerCpt: this.pokerCpt,
			toLayout: this.toLayout,
		};
		return ret;
	}
}
