import { moveStatueData, chessDateArrType, chessInHomePos, chessScaleCfg, chessSuccessCfg, chessRoadData1, chessRoadData2, commonPos } from "../LudoMasterCommonData";
import chess from "./chess";
// import LudoMasterLogic from "../LudoMasterLogic";
import { LudoMasterPlayerInfoVO } from "./LudoMasterPlayerData";
import showLabel from "./showLabel";
import ImgSwitchCmpTS from "../../../../../BalootClient/game_common/common_cmp/ImgSwitchCmpTS";
import LudoMasterLogic = require("../LudoMasterLogic");

import GAME_ID = require("../../../../../BalootClient/GameIdMgr");

const { ccclass, property } = cc._decorator;
@ccclass
export default class LudoMasterTable extends cc.Component {
    @property(cc.Node)
    tableNode: cc.Node = null;
    @property(cc.Node)
    tableBg: cc.Node = null;
    @property(cc.SpriteAtlas)
    tableAtlas: cc.SpriteAtlas = null;
    @property(cc.Node)
    classic: cc.Node = null;
    @property(cc.Node)
    quick: cc.Node = null;
    @property(cc.Node)
    master: cc.Node = null;
    @property(sp.Skeleton)
    winSke: sp.Skeleton = null;

    @property(cc.Prefab)
    chessPrefab: cc.Prefab = null;
    @property(cc.Prefab)
    dicePanelPrefab: cc.Prefab = null;
    @property(cc.Prefab)
    moveHintPrefab: cc.Prefab = null;

    // 当前是否是在移动中
    _moveStatue: moveStatueData = { bMoveing: false, moveStep: 0 };
    _commonPosIdArr: any[] = []

    tableMap: Map<number, chess[]>;
    dicePanel: cc.Node;
    hintList: cc.Node[];

    get facade(): LudoMasterLogic {
        return facade as LudoMasterLogic;
    }
    onLoad() {
        this.hintList = [];
        this.dicePanel = cc.instantiate(this.dicePanelPrefab);
        this.dicePanel.parent = this.tableNode;
        this.dicePanel.active = false;
        this.dicePanel.zIndex = 1500;
        for (let i = 0; i < 4; i++) {
            let hintNode = cc.instantiate(this.moveHintPrefab);
            hintNode.active = false;
            hintNode.parent = this.tableNode;
            hintNode.zIndex = 1;
            // cc.tween(hintNode).repeatForever(cc.tween().by(2, { angle: 360 })).start();
            this.hintList.push(hintNode);
            hintNode.on("click", this.onClickMoveHint.bind(this, hintNode), this);
        }
    }
    // 设置房间类型
    showGameType(idx: number) {
        this.quick.active = idx == 1
        this.classic.active = idx == 2
        this.master.active = idx == 3
    }
    // 加载棋子, 关联棋子 与 玩家
    initChess() {
        //  生成map
        this.tableMap = new Map<number, chess[]>();
        for (let position = 0; position < 4; position++) {
            let chessCpts: chess[] = [];
            for (let j = 0; j < 4; j++) {
                // 设置路径配置
                let chessNode = cc.instantiate(this.chessPrefab);
                chessNode.parent = this.tableNode;
                chessNode.active = false;
                chessNode.zIndex = 100;
                let chessCpt = chessNode.getComponent(chess)
                let chessRoad = position % 2 == 1 ? chessRoadData2 : chessRoadData1;
                chessCpt.setChessRoad(chessRoad, position > 1);
                // 设置开始位置
                let homePos = chessInHomePos[position].pos[0]
                let _disY: number = j > 1 ? -140 : 0
                let _disX: number = j % 2 == 1 ? 140 : 0
                chessCpt.startPos = cc.v3(homePos.x + _disX, homePos.y + _disY);
                if (facade.dm.deskInfo.gameid === GAME_ID.POKER_LUDO_QUICK) {
                    if (j === 0) {
                        chessCpt.setStep(1);
                        chessCpt.updatePos();
                    }
                }

                // 终点配置
                if (position == 0) {
                    chessCpt.endPos = [cc.v3(0, -35), cc.v3(-50, -83), cc.v3(0, -83), cc.v3(50, -83)][j];
                } else if (position == 1) {
                    chessCpt.endPos = [cc.v3(-40, 0), cc.v3(-80, 45), cc.v3(-80, 0), cc.v3(-80, -45)][j];
                } else if (position == 2) {
                    chessCpt.endPos = [cc.v3(0, 35), cc.v3(-50, 80), cc.v3(0, 80), cc.v3(50, 80)][j];
                } else if (position == 3) {
                    chessCpt.endPos = [cc.v3(40, 0), cc.v3(80, 45), cc.v3(80, 0), cc.v3(80, -45)][j];
                }
                chessCpt.setId(j + 1);
                chessCpts.push(chessCpt);
            }
            // 初始位置
            this.tableMap.set(position, chessCpts);
        }
    }
    // 更新所有棋子
    updateAllChess(playerList: LudoMasterPlayerInfoVO[]) {
        this.closeAllChess()
        for (const playerInfo of playerList) {
            this.updateChess(playerInfo);
        }
        this.updateTableAngle();
        this.updateOverlapChess();
        this.updateStopIcon(playerList);
    }

    clearChessScale(exceptChess: number, position: number) {
        let chessCpts = this.tableMap.get(position);
        for (let chessCpt of chessCpts) {
            if (chessCpt.id !== exceptChess) {
                if (chessCpt._curStep <= 0) {
                    chessCpt.setChessScale(chessScaleCfg.home);
                } else if (chessCpt._curStep >= 57 && chessCpt._curStep !== 58) {
                    chessCpt.setChessScale(chessScaleCfg.other);
                } else {
                    chessCpt.setChessScale(chessScaleCfg.move);
                }
            }
        }
    }

    // 更新玩家对应棋子
    updateChess(playerInfo: LudoMasterPlayerInfoVO) {
        if (!playerInfo) return;
        if (!playerInfo.round) return;
        if (!playerInfo.round.steps) return;
        let chessList = this.tableMap.get(playerInfo.position);
        // 找到对应的棋子,设置对应的位置
        for (let i = 0; i < playerInfo.round.steps.length; i++) {
            // 设置颜色 根据seatId设置颜色
            chessList[i].setChessSkin(playerInfo.seatId - 1);
            const step = playerInfo.round.steps[i];
            chessList[i].node.active = true;
            chessList[i].node.stopAllActions();
            chessList[i].node.position = chessList[i].stepToPos(step);
            chessList[i].setStep(step);
            // 判断状态
            if (step <= 0) {
                chessList[i].setChessScale(chessScaleCfg.home);
            } else if (step >= 57 && step !== 58) {
                chessList[i].setChessScale(chessScaleCfg.other);
            } else {
                chessList[i].setChessScale(chessScaleCfg.move);
            }
        }
    }
    // 设置棋牌旋转位置
    updateTableAngle() {
        // 判断自己是否有坐下
        let imgList = [0, 1, 2, 3];
        let angle = 0;
        if (this.facade.dm.playersDm.selfAbsInfo.isSeated) {
            // 旋转到对应的位置
            if (this.facade.dm.playersDm.selfAbsInfo.seatId == 2) {
                angle = 90;
                imgList = [1, 2, 3, 0]
            } else if (this.facade.dm.playersDm.selfAbsInfo.seatId == 3) {
                angle = 180;
                imgList = [2, 3, 0, 1]
            } else if (this.facade.dm.playersDm.selfAbsInfo.seatId == 4) {
                angle = 270;
                imgList = [3, 0, 1, 2]
            } else if (this.facade.dm.playersDm.selfAbsInfo.seatId == 1) {
                angle = 0;
                imgList = [0, 1, 2, 3]
            }
        }
        cc.find("table_fg", this.tableBg).angle = angle;
        for (let i = 0; i < imgList.length; i++) {
            const value = imgList[i];
            cc.find("table_home_" + i, this.tableBg).getComponent(cc.Sprite).spriteFrame = this.tableAtlas.getSpriteFrame("table_home_" + value);
            cc.find("table_home_" + i, this.tableBg).angle = angle;
        }
    }

    updateStopIcon(playerList: LudoMasterPlayerInfoVO[]) {
        if (this.facade.dm.deskInfo.gameid === GAME_ID.POKER_LUDO_QUICK) {
            for (let i = 0; i < 4; i++) {
                cc.find("icon_stop_" + i, this.tableBg).active = true;
            }

            for (const player of playerList) {
                if (player && player.round && player.round.kill > 0) {
                    cc.find("icon_stop_" + player.position, this.tableBg).active = false;
                }
            }
        } else {
            for (let i = 0; i < 4; i++) {
                cc.find("icon_stop_" + i, this.tableBg).active = false;
            }
        }
    }

    setStopIconVisible(position: number, isVisible: boolean) {
        cc.find("icon_stop_" + position, this.tableBg).active = isVisible;
    }

    closeChess(positionId: number) {
        let list = this.tableMap.get(positionId);
        if (list) {
            for (const chessCpt of list) {
                chessCpt.node.stopAllActions();
                chessCpt.node.active = false;
            }
        }
    }

    closeAllChess() {
        this.tableMap.forEach((chessCpts, position) => {
            for (const chessCpt of chessCpts) {
                chessCpt.node.stopAllActions();
                chessCpt.node.active = false;
            }
        });
    }

    // 胜利动画
    playSpin() {
        this.winSke.node.active = true
        this.winSke.setAnimation(0, 'animation', true);
        this.winSke.setCompleteListener((tck) => {
            if (tck.animation && tck.animation.name == "animation") {
                this.winSke.node.active = false
            }
        })
    }
    // 获取最终位置
    getInitLastPos(type: number) {
        let _pos: commonPos = { x: 0, y: 0 }
        let _symX: number = type == 1 ? -1 : 1
        let _symY: number = type < 1 ? -1 : 1
        _pos.x = type % 2 == 1 ? _symX * chessSuccessCfg[type % 2].posX : chessSuccessCfg[type % 2].posX
        _pos.y = type % 2 == 1 ? chessSuccessCfg[type % 2].posY : chessSuccessCfg[type % 2].posY * _symY
        return _pos
    }
    // 移动棋子
    async moveChessAct(msg: any) {
        return new Promise(async (resolve, reject) => {
            let positionId = this.facade.dm.playersDm.getPlayerByUid(msg.uid).position;
            let chessCpt = this.tableMap.get(positionId)[msg.chessid - 1]
            this.clearChessScale(chessCpt.id, positionId);
            await chessCpt.diceAction(msg.step, msg.addStep);
            if (msg.step == 57) this.playSpin();
            // 处理被杀死的棋子
            if (msg.killed.length > 0) {
                this.setStopIconVisible(positionId, false);
                chessCpt.playKilled();
                this.facade.soundMgr.playEffect("killed");
                // 执行回退动画
                let killPositionId = this.facade.dm.playersDm.getPlayerBySeatId(msg.killed[0].seatid).position;
                let killChessCpt = this.tableMap.get(killPositionId)[msg.killed[0].chessid - 1]
                await killChessCpt.killedChess();
            }
            // 判断是否产生防御效果
            let toPos = chessCpt.stepToPos(msg.step);
            if (msg.defend && msg.defend > 0) {
                cc.loader.loadRes('games/Nudo/prefab/anim_def', cc.Prefab, (err, prefab) => {
                    if (err) { cc.warn(err); return; }
                    let node = cc.instantiate(prefab);
                    node.parent = this.node;
                    node.position = toPos;
                    node.scale = 0.7;
                    cc.tween(node).to(1, { scale: 1.5 }).call(() => {
                        node.destroy();
                    }).start();
                });
            }
            this.updateOverlapChess();
            resolve(true);
        })
    }
    // 更新重复的棋子
    updateOverlapChess() {
        let tempMap = {};
        this.tableMap.forEach((chessCpts, position) => {
            for (const chessCpt of chessCpts) {
                if (chessCpt._curStep > 0 && (chessCpt._curStep < 57 || chessCpt._curStep === 58)) {
                    let key = chessCpt.xy.x.toString() + chessCpt.xy.y.toString()
                    if (tempMap[key]) {
                        tempMap[key].push(chessCpt)
                    } else {
                        tempMap[key] = [chessCpt];
                    }
                }
            }
        })
        let paddingX = 25;
        for (const key in tempMap) {
            if (tempMap[key].length > 1) {
                // 遍历该组相同的Chess
                let basePos = tempMap[key][0].getPos();
                let startPos = cc.v3(-((tempMap[key].length - 1) / 2) * paddingX, 0)
                for (let i = 0; i < tempMap[key].length; i++) {
                    const chessCpt = tempMap[key][i];
                    chessCpt.setChessScale(chessScaleCfg.overlay);
                    chessCpt.node.position = basePos.add(startPos.add(cc.v3(paddingX * i, 0)));
                }
            } else {
                for (const chessCpt of tempMap[key]) {
                    chessCpt.setChessScale(chessScaleCfg.move);
                    chessCpt.updatePos();
                }
            }
        }
    }
    // 关闭所有的
    closeAllLight() {
        for (const hintNode of this.hintList) {
            hintNode.active = false;
        }
        this.dicePanel.active = false;
    }
    // 高亮可以操作的棋子
    lightChessCtrl(diceList: number[]) {
        this.closeAllLight();
        if (diceList.length == 3 && diceList[0] == 6 && diceList[1] == 6 && diceList[2] == 6) {
            return;
        }
        // 找到自己的棋子
        if (!!this.facade.dm.playersDm.selfAbsInfo) {
            let chessCpts = this.tableMap.get(this.facade.dm.playersDm.selfAbsInfo.position);
            for (const chessCpt of chessCpts) {
                let hintNode = this.hintList[chessCpt.id - 1];
                hintNode["chessCpt"] = chessCpt;
                let tempDiceList = [];
                // 判断是否显示
                let spine = cc.find("spine", hintNode).getComponent(sp.Skeleton);
                if (chessCpt._curStep <= 0 && diceList.indexOf(6) >= 0) {
                    hintNode.active = true;
                    spine.clearTracks();
                    spine.setAnimation(0, "animation", true);
                    // hintNode.scale = 1.5;
                    tempDiceList.push(6);
                    // hintNode.position = chessCpt.node.position.add(cc.v3(0, -20));
                    hintNode.position = chessCpt.node.position;
                    chessCpt.setChessScale(chessScaleCfg.home);
                    chessCpt.setNodeZindex(true);
                } else if (chessCpt._curStep > 0 && (chessCpt._curStep < 57 || chessCpt._curStep === 58)) {
                    // 是否超标
                    for (const dice of diceList) {
                        if ((chessCpt._curStep + dice <= 57) || chessCpt._curStep === 58) {
                            tempDiceList.push(dice);
                        }
                    }
                    if (tempDiceList.length > 0) {
                        hintNode.active = true;
                        hintNode.scale = 1;
                        spine.clearTracks();
                        spine.setAnimation(0, "animation", true);
                        // hintNode.position = chessCpt.node.position.add(cc.v3(0, -10));
                        hintNode.position = chessCpt.node.position
                        chessCpt.setChessScale(chessScaleCfg.home);
                        chessCpt.setNodeZindex(true);
                    } else {
                        hintNode.active = false;
                    }
                } else {
                    hintNode.active = false;
                }
                hintNode["diceList"] = tempDiceList;
            }
        }
    }
    // 点击
    onClickMoveHint(hintNode) {
        let chessCpt = hintNode["chessCpt"];
        let diceList = hintNode["diceList"];
        if (diceList.length <= 0) return;
        // 判断是否有多个选择
        this.facade.soundMgr.playEffect("clickchess");
        if (diceList.length > 1) {
            // 弹出骰子选择
            let cptList = this.dicePanel.getComponentsInChildren(showLabel)
            for (let i = 0; i < cptList.length; i++) {
                cptList[i].dice = diceList[i] || 0;
                cptList[i].id = chessCpt.id;
                cptList[i].node.getComponent(ImgSwitchCmpTS).setIndex(chessCpt.skin);
            }
            let showPos = hintNode.position.add(cc.v3(0, 100));
            this.dicePanel.getChildByName("layout").getComponent(ImgSwitchCmpTS).setIndex(chessCpt.skin);
            cc.find("arrow", this.dicePanel).getComponent(ImgSwitchCmpTS).setIndex(chessCpt.skin);
            // 判断是否超出边界 258
            showPos.x = Math.min(showPos.x, 540 - 129);
            showPos.x = Math.max(showPos.x, -540 + 129);
            this.dicePanel.position = showPos;
            this.dicePanel.active = true;
            // if (showPos.x === (540 - 129)) {
            //     // 到达右边界
            //     cc.find("arrow", this.dicePanel).x = cc.find("layout", this.dicePanel).width / 2 - 35;
            // } else if (showPos.x === (-540 + 129)) {
            //     // 到达左边界
            //     cc.find("arrow", this.dicePanel).x = -cc.find("layout", this.dicePanel).width / 2 + 35;
            // } else {
            //     cc.find("arrow", this.dicePanel).x = 0;
            // }
            cc.find("arrow", this.dicePanel).x = this.dicePanel.convertToNodeSpaceAR(chessCpt.node.convertToWorldSpaceAR(cc.v2(0, 0))).x;
        } else if (diceList.length = 1) {
            this.facade.dm.msgWriter.sendMoveDice(cc.vv.UserManager.uid, chessCpt.id, diceList[0]);
            this.closeAllLight();
            let chessCpts = this.tableMap.get(cc.vv.UserManager.uid);
            if (chessCpts) {
                for (let chessCpt of chessCpts) {
                    chessCpt.setNodeZindex(false);
                }
            }

        }
    }
}
