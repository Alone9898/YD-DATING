import PokerLayoutCpt from "../../../../_FWExpand/Ecs/components/PokerLayoutCpt";
import { PBPlayer } from "../../PokerBase/scripts/player/PBPlayer";
import DelphiCardTypeCpt from "./DelphiCardTypeCpt";
import JettonCpt from "../../../../_FWExpand/Ecs/components/JettonCpt";
import UserAvatar from "../../../../BalootClient/game_common/common_cmp/UserAvatar";


const { ccclass, property, requireComponent } = cc._decorator;

export enum DelphiSeatState {
	NONE = -1,    // 没有人坐下
	WAIT = 0, // 等待开始
	FOLD = 1, // 弃牌
	BET = 2, //下注   
	FILL = 3, // 跟注
	CHECK = 4, // 过牌
	FILLALL = 5, // ALLIN
	SMALLBET = 6, // 小盲注
	BIGBET = 7, // 大盲注
	BET_ADD = 8, // 自己第一次下注
}

@ccclass
export default class DelphiSeatCpt extends cc.Component {
	// 筹码组件
	jettonCpt: JettonCpt = null;
	@property(cc.Label)
	stateLabel: cc.Label = null;
	@property(cc.Node)
	betNode: cc.Node = null;
	@property(cc.Node)
	statusNode: cc.Node = null;
	@property(cc.Node)
	bankerNode: cc.Node = null;
	@property(cc.Node)
	coinNode: cc.Node = null;
	// 牌型组件
	cardTypeCpt: DelphiCardTypeCpt = null;
	// 附加座位状态
	private _state = DelphiSeatState.NONE;
	// 是否是庄家
	private _isViewCard = 1;
	oprViewnNode: cc.Node;
	seatAnimWinLost: cc.Node;
	winLostNode: cc.Node;
	winAnimNode: cc.Node;
	pokerTypeNode: cc.Node;
	allinAnimNode: cc.Node;
	initBetNodePos: cc.Vec3;
	worldNode: cc.Node;

	private _pbPlayer: PBPlayer = null;
	handPokerNode: cc.Node;
	get pbPlayer(): PBPlayer {
		if (!this._pbPlayer) {
			this._pbPlayer = this.getComponent(PBPlayer);
		}
		return this._pbPlayer;
	}
	// 座位数据
	set data(value) {
		if (value) {
			this.pbPlayer.playerInfoVo = value;
		} else {
			this.clear();
		}
	}
	get data() {
		let data = this.pbPlayer.playerInfoVo;
		return data;
	}
	get userInfoCmp() {
		return this.pbPlayer.userInfoCmp;
	}

	set state(value) {
		this._state = value;
		this.showPeopleStatus(value)
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
	// 金币
	set coin(value) {
		this.data.coin = value;
		this.data.winCoinShow = value;
		if (this.coinNode) {
			cc.find("label", this.coinNode).getComponent(cc.Label).string = Global.FormatNumToComma(value);
		}
	}
	get coin() {
		return this.data.coin;
	}
	// 押注了几轮
	private _betCnt = 0;
	set betCnt(value) {
		this._betCnt = value
	}
	get betCnt() {
		return this._betCnt
	}
	// 是否是庄家
	private _isBanker = false;
	set isBanker(value) {
		this._isBanker = value;
	}
	get isBanker() {
		return this._isBanker;
	}
	// 是否是庄家 非庄家也能看牌
	set isViewCard(value) {
		this._isViewCard = 1;
	}
	// 是否看牌
	get isViewCard() {
		return this._isViewCard;
	}
	// 是否已经弃牌
	set isLoser(value) {
		for (const pokerCpt of this.handLayout.pokerList) {
			pokerCpt.dark = value;
		}
		this.setHeadGray(value);
	}
	// 记录是否ALLIN
	isAllin: boolean = false;
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
	// show牌组件
	private _showLayout = null;
	get showLayout(): PokerLayoutCpt {
		if (!this._showLayout) {
			for (const layout of this.getComponentsInChildren(PokerLayoutCpt)) {
				if (layout.key == 'show') {
					this._showLayout = layout;
					break;
				}
			}
		}
		return this._showLayout;
	}
	// 手牌位置
	get pokerPos() {
		return this.handLayout.node.convertToWorldSpaceAR(cc.v2(0, 0));
	}

	set isOpr(value) {
		// cc.find("user_info_node", this.node).active = !value;
		// cc.find("peopleStatus", this.node).active = !value;
	}

	set isUnknown(value) {
		if (this.pbPlayer.playerInfoVo && cc.vv.UserManager.uid == this.pbPlayer.playerInfoVo.uid) {
			this.pbPlayer.userInfoCmp.hideAvatarName(false);
		} else if (!Global.isYDApp()) {
			this.pbPlayer.userInfoCmp.hideAvatarName(false);
		} else {
			this.pbPlayer.userInfoCmp.hideAvatarName(value, !!this.pbPlayer.playerInfoVo);
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
		// this.node.getChildByName('user_info_node').getChildByName('rp_node').active = false;
	}

	// 初始化座位
	init(worldNode: cc.Node, cardTypePrefab: cc.Node, allInAnimPrefab: cc.Node, winAnimPrefab: cc.Node, handPokerAnimPrefab: cc.Node) {
		this.worldNode = worldNode;
		// 改变CoinNode的层级
		let coinPos = worldNode.convertToNodeSpaceAR(this.coinNode.convertToWorldSpaceAR(cc.v3(0, 0)))
		this.coinNode.parent = worldNode;
		this.coinNode.zIndex = 140;
		this.coinNode.position = coinPos;
		this.coinNode.active = false;
		this.pbPlayer.exNodeList.push(this.coinNode);
		// 动态修改 PBPlayer方法
		this.pbPlayer.getNeedChangeChatBubbleUIIndex = () => {
			return [];
		}
		// 隐藏庄家图标 这里只是用了位置属性
		this.bankerNode.active = false;
		// 下注额的层级
		this.betNode.zIndex = 10;
		this.statusNode.zIndex = 9;
		// 牌型创建
		// allin动画创建
		this.allinAnimNode = cc.instantiate(allInAnimPrefab);
		this.allinAnimNode.parent = worldNode;
		this.allinAnimNode.active = false;
		this.allinAnimNode.position = this.node.position;
		this.allinAnimNode.zIndex = 30;
		// win动画创建
		this.winAnimNode = cc.instantiate(winAnimPrefab);
		this.winAnimNode.parent = worldNode;
		this.winAnimNode.active = false;
		this.winAnimNode.position = worldNode.convertToNodeSpaceAR(this.showLayout.worldCenterPoint.add(this.cardTypeOffset));
		this.winAnimNode.zIndex = 100;
		// 牌型
		let cardTypeNode = cc.instantiate(cardTypePrefab);
		cardTypeNode.parent = worldNode;
		cardTypeNode.zIndex = 200;
		cardTypeNode.position = worldNode.convertToNodeSpaceAR(this.showLayout.worldCenterPoint.add(this.cardTypeOffset));
		this.cardTypeCpt = cardTypeNode.getComponent(DelphiCardTypeCpt);
		// 手牌光效
		this.handPokerNode = cc.instantiate(handPokerAnimPrefab);
		this.handPokerNode.parent = worldNode;
		this.handPokerNode.zIndex = 20;
		this.handPokerNode.position = this.node.position;
		// 记录下注筹码位置
		this.initBetNodePos = this.betNode.position;

		return;
	}


	get cardTypeOffset() {
		return [
			cc.v3(0, 140),
			cc.v3(180, 0),
			cc.v3(180, 0),
			cc.v3(180, 0),

			cc.v3(180, 0),
			cc.v3(-180, 0),

			cc.v3(-180, 0),
			cc.v3(-180, 0),
			cc.v3(-180, 0)
		][this.pbPlayer.uiIndex];
	}


	clear() {
		this.state = DelphiSeatState.NONE;
		this.setHeadGray(false);
		this.betChips = 0;
		this.isBanker = false;
		this.isViewCard = 0;
		this.isLoser = false;
		this.isAllin = false;
		this.closeAllInAnim();
		this.closeWinAnim();
		this.closeCardType();
		this.hidePeopleAllStatus();
		this.jettonCpt = null;
		this.betNode.active = false;
		this.isOpr = false;
		this.userInfoCmp.showReadyTip(false, false);
		this.isUnknown = true;
		this.isWather = false;
		this.closePokerLight();
		// this.coinNode.active = false;
	}
	// 下注动画
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
				this.jettonCpt.node.scale = 0.35;
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
					cc.tween(this.jettonCpt.node).to(0.15, { position: cc.v2(0, 0) }).delay(0.3).call(() => { callback && callback(); }).start();
				}
			} else {
				this.jettonCpt.node.position = cc.v3();
			}
		} else {
			this.betNode.active = false;
			// 停止所有动作
			let node = this.betNode.getComponentInChildren(cc.Label).node;
			node.stopAllActions();
			if (this.jettonCpt && cc.isValid(this.jettonCpt.node)) {
				this.jettonCpt.node.stopAllActions();
				this.jettonCpt.node.position = cc.v3();
			}
		}
		this.betNode.position = this.initBetNodePos;
	}
	// 收钱动画
	getBetChips(value, getWorldPos) {
		this.setBetChips(value, false);
		this.betNode.stopAllActions();
		this.betNode.position = this.betNode.parent.convertToNodeSpaceAR(getWorldPos);
		cc.tween(this.betNode)
			.to(0.3, { position: this.betNode.parent.convertToNodeSpaceAR(this.headPos) }, { easing: 'sineOut' })
			.call(() => {
				this.setBetChips(0);
			}).start();
	}

	showPokerLight() {
		this.handPokerNode.position = this.worldNode.convertToNodeSpaceAR(this.showLayout.worldCenterPoint);
		this.handPokerNode.active = true;
		this.handPokerNode.getComponent(sp.Skeleton).setAnimation(0, "animation", true);
	}

	closePokerLight() {
		this.handPokerNode.active = false;
	}

	showCardType(cardType) {
		let endPos = this.worldNode.convertToNodeSpaceAR(this.showLayout.worldCenterPoint.add(this.cardTypeOffset));
		let startPst = this.worldNode.convertToNodeSpaceAR(this.showLayout.worldCenterPoint);
		this.cardTypeCpt.node.position = startPst;
		this.cardTypeCpt.setCardType(cardType);
		this.cardTypeCpt.node.stopAllActions();
		this.cardTypeCpt.node.opacity = 0;
		this.cardTypeCpt.node.scale = 0.8;
		cc.tween(this.cardTypeCpt.node).to(0.5, { position: endPos, opacity: 255 }, { easing: "sineOut" }).start();
	}

	setCardType(cardType, pos?) {
		this.cardTypeCpt.node.stopAllActions();
		pos = pos || this.worldNode.convertToNodeSpaceAR(this.showLayout.worldCenterPoint.add(this.cardTypeOffset));
		this.cardTypeCpt.node.position = pos;
		this.cardTypeCpt.node.scale = 0.8;
		this.cardTypeCpt.setCardType(cardType);
	}


	closeCardType() {
		this.cardTypeCpt.close();
	}

	hitCardType(cardType, pos, callback) {
		this.cardTypeCpt.setCardType(cardType);
		this.cardTypeCpt.setBgNode(false);
		this.cardTypeCpt.node.stopAllActions();
		this.cardTypeCpt.node.scale = 0.1;
		cc.tween(this.cardTypeCpt.node).to(0.5, { scale: 2, position: pos }, { easing: "sineOut" }).call(() => {
			callback && callback();
		}).start();
	}



	// 显示胜利动画
	showWinAnim() {
		this.winAnimNode.active = true;
		this.winAnimNode.getComponent(sp.Skeleton).setAnimation(0, "animation", false);
	}
	// 关闭胜利动画
	closeWinAnim() {
		this.winAnimNode.active = false;
	}
	//展示头像 allin
	showAllInAnim() {
		this.allinAnimNode.active = true;
		this.allinAnimNode.getComponent(sp.Skeleton).setAnimation(0, "animation", true);
	}
	// 关闭AllIn动画
	closeAllInAnim() {
		this.allinAnimNode.active = false;
	}
	// 隐藏所有状态
	hidePeopleAllStatus() {
		for (const _node of this.statusNode.children) {
			_node.active = false;
		}
	}

	nextState() {
		if (this.state == DelphiSeatState.FOLD) {
			return;
		}
		this.hidePeopleAllStatus();
	}

	// 设置状态
	showPeopleStatus(value) {
		this.hidePeopleAllStatus();
		let node = this.statusNode;
		if (!node) return;
		switch (value) {
			case DelphiSeatState.NONE:
				break;
			case DelphiSeatState.WAIT:
				break;
			case DelphiSeatState.BIGBET:
				node.getChildByName('bsBinld').getChildByName('Background').getChildByName('Label').getComponent(cc.Label).string = ___("大盲注");
				node.getChildByName('bsBinld').active = true;
				break;
			case DelphiSeatState.SMALLBET:
				node.getChildByName('bsBinld').active = true;
				node.getChildByName('bsBinld').getChildByName('Background').getChildByName('Label').getComponent(cc.Label).string = ___("小盲注");
				break;
			case DelphiSeatState.BET:
				node.getChildByName('Bet').active = true;
				node.getChildByName('Bet').getChildByName('Background').getChildByName('Label').getComponent(cc.Label).string = ___("跟注");
				break;
			case DelphiSeatState.BET_ADD:
				node.getChildByName('addBet').active = true;
				node.getChildByName('addBet').getChildByName('Background').getChildByName('Label').getComponent(cc.Label).string = ___("下注");
				break;
			case DelphiSeatState.FILL:
				node.getChildByName('addBet').active = true;
				node.getChildByName('addBet').getChildByName('Background').getChildByName('Label').getComponent(cc.Label).string = ___("加注");
				break;
			case DelphiSeatState.FILLALL: //并且播放动画 全压
				node.getChildByName('addBet').active = true;
				node.getChildByName('addBet').getChildByName('Background').getChildByName('Label').getComponent(cc.Label).string = ___("全押");
				break;
			case DelphiSeatState.CHECK: //过牌
				node.getChildByName('check').active = true;
				node.getChildByName('check').getChildByName('Background').getChildByName('Label').getComponent(cc.Label).string = ___("过牌");
				break;
			case DelphiSeatState.FOLD: //弃牌
				node.getChildByName('pass').active = true;
				node.getChildByName('pass').getChildByName('Background').getChildByName('Label').getComponent(cc.Label).string = ___("弃牌");
				break;
			default:
				break;
		}

	}

	// 头像置灰
	setHeadGray(value) {
		cc.find("user_info_node/head_icon/icon/graysp", this.node).active = value;
	}

	// // 金币是否显示
	// setCoinNodeActive(bShow){
	// 	this.coinNode.active = bShow;
	// }
}
