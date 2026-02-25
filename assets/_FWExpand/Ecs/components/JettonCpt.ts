import PokerLayoutCpt from "./PokerLayoutCpt";
import JettonLayoutCpt from "./JettonLayoutCpt";
import Utils from "../Utils";

const { ccclass, property } = cc._decorator;
@ccclass('FrameAttr')
export class FrameAttr {
	// 纹理
	@property({ type: cc.SpriteFrame, displayName: '纹理' })
	frame: cc.SpriteFrame = null;
	// 范围
	@property({ type: cc.Integer, displayName: '范围' })
	range = 0;
}
@ccclass
export default class JettonCpt extends cc.Component {
	@property(cc.Sprite)
	bodySprite: cc.Sprite = null;
	// @property({
	// 	type: [FrameAttr],
	// })
	frameAttrList: FrameAttr[] = [];

	@property(cc.Label)
	chipLabel: cc.Label = null;

	@property(cc.Float)
	_chips = 0;
	@property({ type: cc.Float, displayName: '筹码值' })
	get chips() {
		return this._chips;
	}
	set chips(value) {
		this._chips = value;
		if (!this.frameAttrList) {
			return;
		}
		let attr_: FrameAttr;
		for (let i = 0; i < this.frameAttrList.length; ++i) {
			let attr = this.frameAttrList[i];
			attr_ = attr;
			if (value <= attr.range) {
				break;
			}
		}
		if (attr_) {
			if (this.bodySprite)
				this.bodySprite.spriteFrame = attr_.frame;
		}

		if (this.chipLabel) {
			this.chipLabel.string = Utils.formatBigNum(value, 3);
		}
	}

	layout: JettonLayoutCpt = null;
}
