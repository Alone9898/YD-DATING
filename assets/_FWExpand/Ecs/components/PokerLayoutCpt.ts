import PokerCpt from "./PokerCpt";

const { ccclass, property, menu, executeInEditMode } = cc._decorator;

export enum PokerLayoutType {
	Rect,
	Circle,
	StartLeft,
	RectAuto,
	StartRight,
	LastPack,
	Multigroup,
}

@ccclass
@menu('棋牌核心/牌相关/牌组')
@executeInEditMode
export default class PokerLayoutCpt extends cc.Component {
	@property(cc.String)
	key: String = '';
	@property(cc.Integer)
	vId = 0;
	@property
	zOrder: number = 0
	//@property([PokerCpt])
	//pokerList: PokerCpt[] = [];
	@property([PokerCpt])
	private _pokerList: PokerCpt[] = [];

	jokerCards = [];

	@property([PokerCpt])
	public get pokerList(): PokerCpt[] {
		return this._pokerList;
	}
	public set pokerList(v: PokerCpt[]) {
		this._pokerList = v;
	}

	@property({
		type: cc.Enum(PokerLayoutType),
	})
	private _type: PokerLayoutType = PokerLayoutType.Rect;
	@property({
		type: cc.Enum(PokerLayoutType),
	})
	public get type(): PokerLayoutType {
		return this._type;
	}
	public set type(v: PokerLayoutType) {
		this._type = v;
		if (CC_EDITOR) {
			this.updateLayout();
		}
	}
	@property
	_cirPoint: cc.Vec2 = cc.v2(0, -100);
	@property({
		type: cc.Vec2,
		visible() { return this.type == PokerLayoutType.Circle },
	})
	public get cirPoint(): cc.Vec2 {
		return this._cirPoint;
	}
	public set cirPoint(v: cc.Vec2) {
		this._cirPoint = v;
		if (CC_EDITOR) {
			this.updateLayout();
		}
	}

	@property
	private _groupPadding: number = 50;
	@property({
		type: cc.Float,
		visible() { return this.type == PokerLayoutType.Multigroup },
	})
	public get groupPadding(): number {
		return this._groupPadding;
	}
	public set groupPadding(v: number) {
		this._groupPadding = v;
		if (CC_EDITOR) {
			this.updateLayout();
		}
	}

	@property({
		type: cc.Float,
		visible() { return this.type == PokerLayoutType.LastPack },
	})
	packCount: number = 3;
	// public get packCount(): number {
	// 	return this._packCount;
	// }
	// public set packCount(v: number) {
	// 	this._packCount = v;
	// }


	@property({
		type: cc.Float,
	})
	private _padding: number = 10;
	@property({
		type: cc.Float,
	})
	public get padding(): number {
		return this._padding;
	}
	public set padding(v: number) {
		this._padding = v;
		if (CC_EDITOR) {
			this.updateLayout();
		}
	}
	@property(cc.Vec2)
	selectOffset: cc.Vec2 = cc.Vec2.ZERO;

	@property({
		type: cc.Float,
	})
	private _scale: number = 1;
	@property({
		type: cc.Float,
	})
	public get scale(): number {
		return this._scale;
	}
	public set scale(v: number) {
		this._scale = v;
		if (CC_EDITOR) {
			this.updateLayout();
		}
	}
	get realWidth() {
		return Math.min((this.pokerList.length - 1) * this.padding, this.node.width);
	}
	get realPadding() {
		let realPadding = this.padding;
		let realWidth = (this.pokerList.length - 1) * this.padding;
		if (realWidth > this.node.width) {
			realPadding = this.node.width / (this.pokerList.length - 1)
		}
		return realPadding
	}
	get width() {
		return Math.min(((this.pokerList.length + 1) * this.padding), this.node.width + 120);
	}
	get height() {
		return this.node.height;
	}
	// 牌组的中心位置
	get centerPoint() {
		let point = this.node.position;
		if (this.type == PokerLayoutType.StartLeft) {
			point = this.startPoint.add(cc.v3(this.realWidth / 2, 0))
		} else if (this.type == PokerLayoutType.StartRight) {
			point = this.startPoint.add(cc.v3(-this.realWidth / 2, 0))
		}
		return point;
	}

	get worldCenterPoint() {
		return this.node.parent.convertToWorldSpaceAR(this.centerPoint);
	}

	// 第一张牌的位置
	get startPoint() {
		let point = this.node.position;
		if (this.type == PokerLayoutType.StartLeft) {
			point.addSelf(cc.v3(-this.node.width / 2, 0))
		} else if (this.type == PokerLayoutType.StartRight) {
			point.addSelf(cc.v3(this.node.width / 2, 0))
		} else if (this.type == PokerLayoutType.RectAuto) {
			point.addSelf(cc.v3(-this.realWidth / 2, 0))

		}
		return point;
	}
	// 最右边一张牌的位置
	get rightPoint() {
		let point = this.node.position;
		if (this.type == PokerLayoutType.StartLeft) {
			point.addSelf(cc.v3(-this.node.width / 2, 0)).addSelf(cc.v3(this.realWidth, 0));
		} else if (this.type == PokerLayoutType.StartRight) {
			point.addSelf(cc.v3(this.node.width / 2, 0));
		} else if (this.type == PokerLayoutType.RectAuto) {
			point.addSelf(cc.v3(this.realWidth / 2, 0))
		}
		return point;
	}
	// 所有组的ID
	get groupIdList() {
		let groupIdList = [];
		for (const tempPoker of this.pokerList) {
			if (groupIdList.indexOf(tempPoker.groupId) < 0) {
				groupIdList.push(tempPoker.groupId)
			}
		}
		groupIdList.sort((a, b) => {
			return a - b;
		})
		return groupIdList
	}

	get groupPokerMap() {
		let pokerMap = [];
		for (const groupId of this.groupIdList) {
			let tempList = []
			for (const tempPoker of this.pokerList) {
				if (tempPoker.groupId == groupId) {
					tempList.push(tempPoker)
				}
			}
			// tempList.sort((a: PokerCpt, b: PokerCpt) => {
			// 	// 判断特殊牌
			// 	if (a.isJoker) {
			// 		return 1;
			// 	} else if (b.isJoker) {
			// 		return -1;
			// 	} else if (a.isJoker && b.isJoker) {
			// 		return a.uint - b.uint;
			// 	}
			// 	// 花色相同
			// 	if (a.variety == a.variety) {
			// 		// 特殊处理A
			// 		if (a.value == 14) {
			// 			return -1;
			// 		} else if (b.value == 14) {
			// 			return 1;
			// 		} else if (a.value == 14 && b.value == 14) {
			// 			return a.variety - b.variety;
			// 		}
			// 		return a.value - b.value;
			// 	} else {
			// 		return a.variety - b.variety;
			// 	}
			// 	// // 先比值 再比花色
			// 	// return a.uint - b.uint;
			// })
			pokerMap.push(tempList)
		}
		return pokerMap;
	}

	getGroupPokers(groupId): PokerCpt[] {
		let tempPokers = [];
		for (const poker of this.pokerList) {
			if (groupId == poker.groupId) {
				tempPokers.push(poker)
			}
		}
		return tempPokers;
	}

	getMultiGroupCards(pokers: PokerCpt[]) {
		if (this.type == PokerLayoutType.Multigroup) {
			let tempMap = [];
			for (const pokerList of this.groupPokerMap) {
				let list = [];
				for (const poker of pokerList) {
					// 排除传入的pokers
					if (pokers.indexOf(poker) < 0) {
						list.push(poker.uint)
					}
				}
				if (list.length > 0) {
					tempMap.push(list)
				}
			}
			return JSON.stringify(tempMap);
		} else {
			return null;
		}
	}

	getUnSelectMultiGroupCards() {
		if (this.type == PokerLayoutType.Multigroup) {
			let tempMap = [];
			for (const pokerList of this.groupPokerMap) {
				let list = [];
				for (const poker of pokerList) {
					if (!poker.isSelect) {
						list.push(poker.uint)
					}
				}
				if (list.length > 0) {
					tempMap.push(list)
				}
			}
			return JSON.stringify(tempMap);
		} else {
			return null;
		}
	}
	//根据牌值获取牌
	getCard(value?: any, key: string = "uint") {
		switch (key) {
			case "uint":
				return this.getCardByUint(value);
			case "key":
				return this.getCardByKey(value);
			case "index":
			case "idx":
				return this.getCardByIndex(value);
			default:
			//NOPE
		}
	}

	getCardByUint(uint: number) {
		for (let i in this._pokerList) {
			if (this._pokerList[i].uint == uint) {
				return this.pokerList[i];
			}
		}
	}
	// 倒序寻找
	getCardByUintReversal(uint: number) {
		for (let i = this._pokerList.length - 1; i >= 0; i++) {
			if (this._pokerList[i].uint == uint) {
				return this.pokerList[i];
			}
		}
	}

	getCardsByUint(uint: number) {
		let tempArr = []
		for (let i in this._pokerList) {
			if (this._pokerList[i].uint == uint) {
				tempArr.push(this.pokerList[i]);
			}
		}
		return tempArr;
	}

	getCardByKey(key: string) {
		for (let i in this._pokerList) {
			if (this._pokerList[i].key == key) {
				return this.pokerList[i];
			}
		}
	}

	getCardByIndex(idx: number) {
		return this.pokerList[idx];
	}

	start() {
		if (CC_EDITOR) {
			this.updateLayout();
		}
	}

	updateLayout() {
		for (const cpt of this.pokerList) {
			if (cpt) {
				//刷新poker属性
				cpt.node.stopAllActions();
				let attr = this.getAttrTByLayout(cpt);
				if (attr.scale != undefined) {
					cpt.node.scale = attr.scale;
				}
				if (attr.pos != undefined) {
					cpt.node.setPosition(attr.pos);
				}
				if (attr.rotate != undefined) {
					cpt.node.angle = -attr.rotate;
				}
				if (attr.zorder != undefined) {
					cpt.node.zIndex = attr.zorder;
				}
			}
		}
	}

	getAttrTByLayout(pokerCpt: PokerCpt, attr?: any) {
		attr = attr || {};
		let layoutCpt = this;
		// 设置大小
		if (attr.scale == undefined) {
			attr.scale = layoutCpt.scale;
		}
		if (attr.node == undefined) {
			attr.node = pokerCpt.node;
		}
		let index = layoutCpt.pokerList.indexOf(pokerCpt);
		let length = layoutCpt.pokerList.length;
		// 牌的位置 和 方向
		if (layoutCpt.type == PokerLayoutType.Rect) {
			// 局部位置
			let cardWidth = pokerCpt.node.width * attr.scale;
			let tempWidth = (length - 1) * layoutCpt.padding + cardWidth;
			let realPadding = layoutCpt.padding;
			let startLocalPos = cc.v2(-tempWidth / 2, 0);
			let startWorldPos = layoutCpt.node.convertToWorldSpaceAR(startLocalPos)
			// 世界位置
			let startPos = pokerCpt.node.parent.convertToNodeSpaceAR(startWorldPos);
			// 设置位置
			attr.pos = startPos.add(cc.v2(realPadding * index + (cardWidth / 2), 0));
			attr.zorder = index + this.zOrder;
			attr.rotate = 0;
		} else if (layoutCpt.type == PokerLayoutType.RectAuto) {
			// 局部位置
			let startLocalPos = cc.v2(-this.realWidth / 2, 0);
			let startWorldPos = layoutCpt.node.convertToWorldSpaceAR(startLocalPos)
			// 世界位置
			let startPos = pokerCpt.node.parent.convertToNodeSpaceAR(startWorldPos);
			// 设置位置
			attr.pos = startPos.add(cc.v2(this.realPadding * index, 0));
			attr.zorder = index + this.zOrder;
			attr.rotate = 0;
		} else if (layoutCpt.type == PokerLayoutType.StartLeft) {
			// 局部位置
			let startLocalPos = cc.v2(-this.node.width / 2, 0);
			let startWorldPos = layoutCpt.node.convertToWorldSpaceAR(startLocalPos)
			// 世界位置
			let startPos = pokerCpt.node.parent.convertToNodeSpaceAR(startWorldPos);
			// 设置位置
			attr.pos = startPos.add(cc.v2(this.realPadding * index, 0));
			attr.zorder = index + this.zOrder;
			attr.rotate = 0;
		} else if (layoutCpt.type == PokerLayoutType.StartRight) {
			// 局部位置
			let startLocalPos = cc.v2(this.node.width / 2, 0);
			let startWorldPos = layoutCpt.node.convertToWorldSpaceAR(startLocalPos)
			// 世界位置
			let startPos = pokerCpt.node.parent.convertToNodeSpaceAR(startWorldPos);
			// 设置位置
			attr.pos = startPos.add(cc.v2(-this.realPadding * index, 0));
			attr.zorder = this.zOrder + layoutCpt.pokerList.length - index;
			attr.rotate = 0;
		} else if (layoutCpt.type == PokerLayoutType.LastPack) {
			// 局部位置
			let cardWidth = pokerCpt.node.width * attr.scale;
			let tempWidth = (Math.min(length, this.packCount) - 1) * layoutCpt.padding + cardWidth;
			let realPadding = layoutCpt.padding;
			let startLocalPos = cc.v2(-tempWidth / 2, 0);
			let startWorldPos = layoutCpt.node.convertToWorldSpaceAR(startLocalPos)
			// 世界位置
			let startPos = pokerCpt.node.parent.convertToNodeSpaceAR(startWorldPos);
			attr.pos = startPos.add(cc.v2(realPadding * Math.min(index, this.packCount - 1) + (cardWidth / 2), 0));
			if (index >= this.packCount) {
				attr.zorder = 0;
			} else {
				attr.zorder = index + this.zOrder;
			}
			attr.rotate = 0;
		} else if (layoutCpt.type == PokerLayoutType.Circle) {
			// 放牌位置
			let startWorldPos = layoutCpt.node.convertToWorldSpaceAR(layoutCpt.cirPoint)
			let cPos = pokerCpt.node.parent.convertToNodeSpaceAR(startWorldPos);
			let padding = layoutCpt.padding * Math.PI / 180; // Math.min(totalRot, 360) / length;;
			// 圆心指向牌位置的向量
			let baseDir = cc.Vec2.ZERO.sub(layoutCpt.cirPoint);
			// 计算牌的角度(需要对准圆心)
			baseDir.rotateSelf(padding * ((length - 1) * 0.5 - index))
			// 计算角度
			attr.rotate = baseDir.signAngle(cc.Vec2.UP) * 180 / Math.PI;
			// 计算位置
			attr.pos = cPos.add(baseDir);
			attr.zorder = index + this.zOrder;
		} else if (layoutCpt.type == PokerLayoutType.Multigroup) { // 多组布局
			let groupIdList = this.groupIdList;
			// 计算 总宽度 和 padding  this.groupPadding
			let tempPadding = this.padding;
			let totalCount = this.pokerList.length - 1
			let groupWidth = (groupIdList.length - 1) * this.groupPadding;
			let realWidth = totalCount * this.padding + groupWidth;
			if (realWidth > this.node.width) {
				tempPadding = Math.max(this.node.width - groupWidth, 0) / totalCount
				realWidth = this.node.width;
			}
			// 自己在第几组
			let gourpIndex = groupIdList.indexOf(pokerCpt.groupId)
			// 找到在所有组的位置
			let pokerIndex = 0;
			for (let i = 0; i < this.groupPokerMap.length; i++) {
				if (i <= gourpIndex) {
					for (const poker of this.groupPokerMap[i]) {
						if (poker == pokerCpt) {
							break;
						} else {
							pokerIndex++;
						}
					}
				}
			}
			// cc.log(gourpIndex, pokerIndex)
			// 位置计算
			let startLocalPos = cc.v2(-realWidth / 2, 0);
			let startWorldPos = layoutCpt.node.convertToWorldSpaceAR(startLocalPos)
			let startPos = pokerCpt.node.parent.convertToNodeSpaceAR(startWorldPos);
			attr.pos = startPos.add(cc.v2(tempPadding * pokerIndex + gourpIndex * this.groupPadding, 0));
			attr.zorder = pokerIndex + this.zOrder;
			attr.rotate = 0;
		}
		// 选中以后的位置处理
		if (pokerCpt.isSelect) {
			attr.pos.addSelf(this.selectOffset)
		}
		return attr;
	}

	// 获取牌组属性
	getGroupBox(groupId) {
		let box = new cc.Rect();
		if (this.type == PokerLayoutType.Multigroup) {
			let groupPokers: PokerCpt[] = [];
			for (const pokerCpt of this.pokerList) {
				if (pokerCpt.groupId == groupId) {
					groupPokers.push(pokerCpt)
				}
			}
			groupPokers.sort((a: PokerCpt, b: PokerCpt) => {
				return a.node.position.x - b.node.position.x;
			})
			let leftBox = groupPokers[0].node.getBoundingBoxToWorld();
			let leftIsSelect = groupPokers[0].isSelect;
			let rightBox = groupPokers[groupPokers.length - 1].node.getBoundingBoxToWorld();
			let width = leftBox.center.sub(rightBox.center).mag() + leftBox.width
			box = new cc.Rect(leftBox.x, leftBox.y - (leftIsSelect ? this.selectOffset.y : 0), width, leftBox.height);
		}
		return box;
	}
	// 根据GroupId 再次排序
	sortPokerListByGroupId() {
		let tempList = [];
		for (const groupId of this.groupIdList) {
			for (const tempPoker of this.pokerList) {
				if (tempPoker.groupId == groupId) {
					tempList.push(tempPoker)
				}
			}
		}
		this.pokerList = tempList;
	}
}
