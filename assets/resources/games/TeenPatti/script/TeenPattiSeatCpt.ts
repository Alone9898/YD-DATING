import PokerLayoutCpt from "../../../../_FWExpand/Ecs/components/PokerLayoutCpt";
import { PBPlayer } from "../../PokerBase/scripts/player/PBPlayer";
import TeenPattiCardTypeCpt from "./TeenPattiCardTypeCpt";
import JettonCpt from "../../../../_FWExpand/Ecs/components/JettonCpt";
import UserAvatar from "../../../../BalootClient/game_common/common_cmp/UserAvatar";


const { ccclass, property, requireComponent } = cc._decorator;

export enum TeenPattiSeatState {
	NONE = -1,    // 没有人坐下
	WAIT = 0, // 等待开始
	POKER = 1, // 发牌          
	DARKBET = 2, // 跟暗注       
	LIGHTBET = 3, // 跟明注     
	CHECK = 4, // 看牌          
	COMPARE = 5, // 跟上家比牌  
	REFUSE = 6, // 拒绝比牌     
	FOLD = 7, // 弃牌
	SHOW = 8, // 开牌
}

@ccclass
export default class TeenPattiSeatCpt extends cc.Component {
	// 筹码组件
	jettonCpt: JettonCpt = null;

	@property(cc.Label)
	stateLabel: cc.Label = null;
	@property(cc.Node)
	betNode: cc.Node = null;
	@property(cc.Node)
	bankerNode: cc.Node = null;
	@property(cc.Node)
	coinNode: cc.Node = null;

	@property(cc.Node)
	cardTypePrefab: cc.Node = null;
	cardTypeCpt: TeenPattiCardTypeCpt = null;

	@property(cc.Node)
	seenPrefab: cc.Node = null;
	seenNode: cc.Node;

	@property(cc.Node)
	packedPrefab: cc.Node = null;
	packedNode: cc.Node;

	@property(cc.Node)
	compareAnimPrefab: cc.Node = null;
	compareAnimNode: cc.Node;

	// 附加座位状态
	private _state = TeenPattiSeatState.NONE;
	seatAnimWinLost: cc.Node;
	winLostNode: cc.Node;
	initBetNodePos: cc.Vec3;
	set state(value) {
		this._state = value;
		// // 更具状态显示
		// if (value == TeenPattiSeatState.CHECK) {
		// 	this.isViewCard = 1;
		// 	this.isLoser = false;
		// } else if (value == TeenPattiSeatState.FOLD) {
		// 	this.isViewCard = 0;
		// 	this.isLoser = true;
		// } else {
		// 	this.closeCardType();
		// 	this.isViewCard = 0;
		// 	this.isLoser = false;
		// }
	}
	get state() {
		return this._state;
	}
	// 下注筹码
	private _betChips = 0;
	set betChips(value) {
		this._betChips = value;
	}
	get betChips() {
		return this._betChips;
	}

	setBetChips(value, anim = true, callback?) {
		this.betChips = value;
		// 进行了下注
		if (value > 0) {
			this.betNode.active = true;
			if (this.jettonCpt && cc.isValid(this.jettonCpt.node)) {
				this.jettonCpt.chips = value;
			} else {
				this.jettonCpt = facade.jettonSystem.createJetton(value, this.betNode);
				this.jettonCpt.node.position = cc.v3(0, 0);
				this.jettonCpt.node.scale = 0.5;
				this.jettonCpt.node.zIndex = 100;
			}
			this.betNode.getComponentInChildren(cc.Label).string = Global.FormatNumToComma(value);
			// 文本动画
			if (anim) {
				let node = this.betNode.getComponentInChildren(cc.Label).node;
				cc.tween(node).to(0.15, { scale: 1.2 }).to(0.1, { scale: 1 }).start();
				if (this.jettonCpt && cc.isValid(this.jettonCpt.node)) {
					this.jettonCpt.node.stopAllActions();
					this.jettonCpt.node.position = cc.v3(this.jettonCpt.node.parent.convertToNodeSpaceAR(this.headPos));
					cc.tween(this.jettonCpt.node).to(0.15, { position: cc.v2(0, 0) }).delay(0.3).call(() => { callback && callback() }).start();
				}
			}
		} else {
			this.betNode.active = false;
			// 停止所有动作
			let node = this.betNode.getComponentInChildren(cc.Label).node;
			node.stopAllActions();
			if (this.jettonCpt && cc.isValid(this.jettonCpt.node)) {
				this.jettonCpt.node.stopAllActions();
			}
		}
		this.betNode.position = this.initBetNodePos;
	}

	private _pbPlayer: PBPlayer = null;
	get pbPlayer(): PBPlayer {
		if (!this._pbPlayer) {
			this._pbPlayer = this.getComponent(PBPlayer);
		}
		return this._pbPlayer;
	}

	// 金币
	private _coin = 0;
	set coin(value) {
		this._coin = value;
		if (this.coinNode) {
			cc.find("label", this.coinNode).getComponent(cc.Label).string = Global.FormatNumToComma(value);
		}
	}
	get coin() {
		return this._coin
	}

	// 是否是庄家
	private _isBanker = false;
	set isBanker(value) {
		this._isBanker = value;
		if (this.bankerNode) this.bankerNode.active = value;
	}
	get isBanker() {
		return this._isBanker;
	}
	// 是否看牌
	private _isViewCard = 0;
	set isViewCard(value) {
		this._isViewCard = value;
		if (this.seenNode && value < 2) {
			this.seenNode.active = value > 0;
			this.seenNode.position = this.seenNode.parent.convertToNodeSpaceAR(cc.v3(this.handLayout.worldCenterPoint)).add(cc.v3(0, 0));
		}
	}
	// 是否看牌
	get isViewCard() {
		return this._isViewCard;
	}

	set isPacked(value) {
		if (this.packedNode) {
			this.packedNode.active = value;
		}
	}

	// 是否已经弃牌
	set isLoser(value) {
		for (const pokerCpt of this.handLayout.pokerList) {
			pokerCpt.dark = value;
		}
	}
	// 座位数据
	set data(value) {
		if (value) {
			this.getComponent(PBPlayer).playerInfoVo = value;
		} else {
			this.clear();
		}
	}
	get data() {
		let data = this.getComponent(PBPlayer).playerInfoVo;
		return data;
	}

	get userInfoCmp() {
		return this.getComponent(PBPlayer).userInfoCmp;
	}

	// 头像位置
	get headPos() {
		return this.getComponentInChildren(UserAvatar).node.convertToWorldSpaceAR(cc.v2(0, 0));
	}
	// 庄家位置
	get bankerPos() {
		if (this.bankerNode) return this.bankerNode.convertToWorldSpaceAR(cc.v3(0, 0));
		return cc.v3(0, 0);
	}
	// 手牌组件
	private _handLayout = null;
	get handLayout(): PokerLayoutCpt {
		if (!this._handLayout) {
			for (const layout of this.getComponentsInChildren(PokerLayoutCpt)) {
				if (layout.key == 'hand') {
					this._handLayout = layout;
					break;
				}
			}
		}
		return this._handLayout;
	}

	get pokerPos() {
		return this.handLayout.node.convertToWorldSpaceAR(cc.v2(0, 0));
	}

	set isOpr(value) {
		// cc.find("user_info_node", this.node).active = !value;
	}

	set isUnknown(value) {
		if (this.pbPlayer.playerInfoVo && cc.vv.UserManager.uid == this.pbPlayer.playerInfoVo.uid) {
			this.pbPlayer.userInfoCmp.hideAvatarName(false);
		} else if (!Global.isYDApp()) {
			this.pbPlayer.userInfoCmp.hideAvatarName(false);
		} else {
			this.pbPlayer.userInfoCmp.hideAvatarName(value);
		}
	}

	set isWather(value){
		if (this.pbPlayer.playerInfoVo && cc.vv.UserManager.uid == this.pbPlayer.playerInfoVo.uid) {
			this.pbPlayer.userInfoCmp.showWather(false);
		} else if (!Global.isYDApp()) {
			this.pbPlayer.userInfoCmp.showWather(false);
		} else {
			this.pbPlayer.userInfoCmp.showWather(value);
		}
	}

	onLoad() {
	}

	// 初始化座位
	init(worldNode: cc.Node) {
		this.getComponent(PBPlayer).getNeedChangeChatBubbleUIIndex = () => {
			return [];
		}

		this.initBetNodePos = this.betNode.position;
		let cardTypeNode = cc.instantiate(this.cardTypePrefab);
		cardTypeNode.parent = worldNode;
		cardTypeNode.zIndex = 200;
		this.cardTypeCpt = cardTypeNode.getComponent(TeenPattiCardTypeCpt);

		this.cardTypeCpt.close();
		if (this.seenPrefab) {
			this.seenNode = cc.instantiate(this.seenPrefab);
			this.seenNode.parent = worldNode;
			this.seenNode.zIndex = 100;
			this.seenNode.active = false;
		}

		if (this.packedPrefab) {
			this.packedNode = cc.instantiate(this.packedPrefab);
			this.packedNode.parent = worldNode;
			this.packedNode.zIndex = 100;
			this.packedNode.active = false;
			this.packedNode.position = this.packedNode.parent.convertToNodeSpaceAR(cc.v3(this.handLayout.worldCenterPoint)).add(cc.v3(0, -30));
		}
		if (this.seatAnimWinLost) {
			this.winLostNode = cc.instantiate(this.seatAnimWinLost);
			this.winLostNode.parent = worldNode;
			this.winLostNode.zIndex = 200;
			this.winLostNode.active = false;
			this.winLostNode.getComponent(sp.Skeleton).setCompleteListener((tck) => {
				if (tck.animation) {
					this.setWinLostAnim(0);
				}
			})
			this.winLostNode.position = this.node.position;
		}
		if (this.compareAnimPrefab) {
			this.compareAnimNode = cc.instantiate(this.compareAnimPrefab);
			this.compareAnimNode.parent = worldNode;
			this.compareAnimNode.position = this.node.position;
			this.compareAnimNode.zIndex = 100;
			this.compareAnimNode.active = false;
			let ske = this.compareAnimNode.getComponent(sp.Skeleton)
			ske.setCompleteListener((trackEntry: sp.spine.TrackEntry) => {
				if (trackEntry.animation.name == 'win_bipai') {
					this.compareAnimNode.active = false;
				}
			});
		}

		if (this.bankerNode) this.bankerNode.active = false;
	}

	setCardType(cardType, showJdt?) {
		this.cardTypeCpt.setCardType(cardType, showJdt);
		let offset = this.data.uid == cc.vv.UserManager.uid ? cc.v3(-10, -50) : cc.v3(-10, -35);
		this.cardTypeCpt.node.position = this.cardTypeCpt.node.parent.convertToNodeSpaceAR(cc.v3(this.handLayout.worldCenterPoint)).add(offset);
	}

	closeCardType() {
		this.cardTypeCpt.close();
	}

	clear() {
		this.state = TeenPattiSeatState.NONE;
		this.setBetChips(0);
		this.jettonCpt = null;
		this.closeCompareAnim();
		this.isBanker = false;
		this.closeCardType();
		this.isViewCard = 0;
		this.isLoser = false;
		this.isPacked = false;
		this.setWinLostAnim(0);
		this.isOpr = false;
		// this.userInfoCmp.showReadyTip(false, false);
		this.isUnknown = false;
	}

	setReqCompareAnim() {
		this.compareAnimNode.active = true;
		let ske = this.compareAnimNode.getComponent(sp.Skeleton)
		ske.setAnimation(0, 'bipai', true);
	}

	setWinCompareAnim() {
		this.compareAnimNode.active = true;
		let ske = this.compareAnimNode.getComponent(sp.Skeleton)
		ske.setAnimation(0, "win_bipai", false);
	}

	closeCompareAnim() {
		this.compareAnimNode.active = false;
		let ske = this.compareAnimNode.getComponent(sp.Skeleton)
		ske.clearTracks();
	}

	closePackedNode() {
		this.packedNode.active = false;
	}

	// opr:0 直接关闭 opr:1 胜利动画 opr:2 失败动画 3:拒绝动画
	setWinLostAnim(opr) {
		if (opr == 1) {
			this.winLostNode.active = true;
			this.winLostNode.getComponent(sp.Skeleton).setAnimation(0, "animation1", false);
		} else if (opr == 2) {
			this.winLostNode.active = true;
			this.winLostNode.getComponent(sp.Skeleton).setAnimation(0, "animation2", false);
		} else if (opr == 3) {
			this.winLostNode.active = true;
			this.winLostNode.getComponent(sp.Skeleton).setAnimation(0, "animation3", false);
		} else {
			this.winLostNode.active = false;
			this.winLostNode.getComponent(sp.Skeleton).setAnimation(0, "animation0", false);
		}
	}

	// // 金币是否显示
	// setCoinNodeActive(bShow){
	// 	this.coinNode.active = bShow;
	// }

}
