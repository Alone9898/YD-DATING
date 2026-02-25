import { chessScaleInit, chessScaleDis, chessMoveDisY, chessMoveDisX, diceScaleTime, moveDisTime, leaveHomeTime, killedTime, commonPos, stepTotal, chessDateArrType, CHESSSTATUE, chessInHomePos, chessMoveDis, chessScaleCfg, chessSuccessDis, chessSuccessCfg, chessRoadData1, chessRoadData2, chessSafePos, luckyNum } from "../LudoMasterCommonData";
import LudoMasterLogic = require("../LudoMasterLogic");
// import LudoMasterLogic from "../LudoMasterLogic";

const { ccclass, property } = cc._decorator;
@ccclass
export default class chess extends cc.Component {
    @property(cc.Sprite)
    spr: cc.Sprite = null;
    @property(cc.SpriteAtlas)
    chessAtlas: cc.SpriteAtlas = null;
    @property(sp.Skeleton)
    beKilled: sp.Skeleton = null;
    @property(sp.Skeleton)
    killed: sp.Skeleton = null;
    //当前是第几步
    _curStep: number = 0;
    _chessRoad: any;
    id: number;
    startPos: cc.Vec3;
    endPos: cc.Vec3;
    //位置坐标是否需要转换
    _bChange: boolean = false;
    skin: number;

    get facade(): LudoMasterLogic {
        return facade as LudoMasterLogic;
    }

    get xy() {
        return this.getRoadData(this._curStep - 1);
    }

    onLoad() {
    }

    setId(id) {
        this.id = id;
    }

    // 设置颜色
    setChessSkin(skin: number) {
        this.spr.spriteFrame = this.chessAtlas.getSpriteFrame('qizi_' + skin + '_5');
        this.skin = skin;
    }
    setStep(step: number) {
        this._curStep = step;
    }
    // 设置路径
    setChessRoad(chessRoad: any, bChange: boolean) {
        this._chessRoad = chessRoad
        this._bChange = bChange
    }
    // 获取路径数据
    getRoadData(step: number) {
        let road: commonPos = { x: 0, y: 0 }
        if (this._chessRoad[step]) {
            road.x = this._bChange ? -this._chessRoad[step].x : this._chessRoad[step].x
            road.y = this._bChange ? -this._chessRoad[step].y : this._chessRoad[step].y
            return road
        }
        return null
    }
    // 设置棋子大小
    setChessScale(scale: number) {
        this.node.scale = scale;
    }

    getPos() {
        return this.stepToPos(this._curStep);
    }

    updatePos() {
        this.node.position = this.getPos();
    }

    // 获取位置
    stepToPos(step: number) {
        if (step == 0) return this.startPos;
        if (step == 57) return this.endPos;
        let moveData = this.getRoadData(step - 1);
        let _isMinusX = 0
        if (Math.abs(moveData.x) > 1) { _isMinusX = moveData.x > 0 ? 1 : -1 }
        let curPos = cc.v3();
        curPos.x = moveData.x * chessMoveDis + chessMoveDisX * _isMinusX
        curPos.y = moveData.y * chessMoveDis + chessMoveDisY;
        return curPos;
    }
    // 设置层级
    setNodeZindex(bMax: boolean) {
        cc.log("id, bmax", this.id, bMax);
        if (bMax) {
            this.node.zIndex = 999;
        } else {
            if (this._curStep == 0) {
                this.node.zIndex = 100;
            } else if (this._curStep == 57) {
                this.node.zIndex = 200;
            } else {
                let moveData = this.getRoadData(this._curStep - 1);
                this.node.zIndex = bMax ? 999 : 100 + 10 - moveData.y;
            }
        }
        cc.log("bmax", this.node.zIndex);
    }
    // step:移动完后的位置 addstep:此次移动的步数
    async diceAction(step: number, addstep: number) {
        return new Promise(async (resolve, reject) => {
            // 更新数据
            this._curStep = step;
            let seqs = [];
            seqs.push(cc.callFunc(() => {
                this.setNodeZindex(true);
                this.setChessScale(chessScaleCfg.home);
            }))

            // 生成移动动画
            for (let i = addstep - 1; i >= 0; i--) {
                let toStpe = step - i;
                if (step < addstep) {
                    if (toStpe < 0) {
                        toStpe += 52;
                    } else if (toStpe === 0) {
                        toStpe = 58;
                    }
                }
                // if (toStpe === 0 && step < addstep) {
                //     toStpe = 58;
                // }
                if (step === 58) {
                    if (i !== 0) {
                        toStpe = step - 6 - i;
                    } else {
                        toStpe = 58;
                    }
                }
                let toPos = this.stepToPos(toStpe);
                seqs.push(cc.spawn(cc.moveTo(moveDisTime, cc.v2(toPos)), cc.callFunc(() => {
                    this.facade.soundMgr.playEffect("chessStep")
                })));
                // }), cc.scaleTo(diceScaleTime, chessScaleInit + chessScaleDis)));
                // seqs.push(cc.scaleTo(diceScaleTime, chessScaleInit))
                if (toStpe == 57) {
                    seqs.push(cc.callFunc(() => {
                        this.setChessScale(chessScaleCfg.other)
                        this.facade.soundMgr.playEffect("toLastPos")
                        this.facade.tableCtrl.playSpin()
                    }))
                }
            }
            seqs.push(cc.callFunc(() => {
                if (step !== 57) {
                    this.setChessScale(chessScaleCfg.move);
                }
                this.setNodeZindex(false)
                resolve(true);
            }))
            this.node.stopAllActions();
            this.node.runAction(cc.sequence(seqs))
        })
    }
    // 棋子被杀死
    async killedChess() {
        return new Promise(async (resolve, reject) => {
            this.beKilled.node.active = true;
            this.beKilled.setAnimation(0, "animation", false);
            this.beKilled.setCompleteListener(() => {
                this.beKilled.setCompleteListener(null);
                this.beKilled.node.active = false;
                this.setNodeZindex(false)
            });

            this._curStep = 0
            this.setNodeZindex(true)
            cc.tween(this.node).to(killedTime, { position: this.stepToPos(0) }).call(() => {
                this.setChessScale(chessScaleCfg.home);
                resolve(true);
            }).start();
        })
    }

    playKilled() {
        this.killed.node.active = true;
        this.killed.setAnimation(0, "animation", false);
        this.killed.setCompleteListener(() => {
            this.killed.setCompleteListener(null);
            this.killed.node.active = false;
        });
    }

}
