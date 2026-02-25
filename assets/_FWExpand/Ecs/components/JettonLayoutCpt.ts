import PokerCpt from "./PokerCpt";
import JettonCpt from "./JettonCpt";
import Utils from "../Utils";

const { ccclass, property, menu } = cc._decorator;


export enum JettonLayoutType {
	Rect,
}

@ccclass
@menu('棋牌核心/筹码相关/筹码组')
export default class JettonLayoutCpt extends cc.Component {
	@property(cc.String)
	key: String = '';

	list: JettonCpt[] = [];

	@property({
		type: cc.Enum(JettonLayoutType)    // call cc.Enum
	})
	type: JettonLayoutType = JettonLayoutType.Rect;

	@property
	scale: number = 1;

	//获取范围内的随机散列位置
	get hashPos(): cc.Vec2 {
		let ret: cc.Vec2;
		let rx = Utils.randomBy(-this.node.width / 2, this.node.width / 2, false);
		let ry = Utils.randomBy(-this.node.height / 2, this.node.height / 2, false);
		ret = cc.v2(rx, ry);
		return ret;
	}
	//获取随机散列角度
	get hashAngle(): number {
		return Utils.randomBy(-10, 10);
	}

	getJetton(chip) {
		for (const jetton of this.list) {
			if (jetton.chips == chip) {
				return jetton;
			}
		}
	}
}
