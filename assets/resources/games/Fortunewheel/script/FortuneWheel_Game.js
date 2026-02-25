/**
 * Fortune Wheel
 */
let STATUS_TIME = {
    FREE: 2,
    BET: 18,
    RESULT: 12
}
cc.Class({
    extends: require("Table_Game_Base"),

    properties: {
        _wheel: null,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        this._wheel = cc.find("node_wheel", this.node).getComponent("FortuneWheel_Wheel")
        // Global.onClick("node_players/node_observers/btn", this.node, this.onClickWatchList, this)
        // cc.vv.NetManager.registerMsg(MsgId.REQ_OBSER_LIST, this.OnRcvNetObserList, this); //观众列表
    },

    onDestroy() {
        // cc.vv.NetManager.unregisterMsg(MsgId.REQ_OBSER_LIST, this.OnRcvNetObserList, false, this);
    },

    StartGame() {
        this._super()
    },

    showIdleStatu: function () {
        //更新桌上玩家
        this.updateTablePlayer()

        //清理桌面筹码
        this.clearAllBetChips()

        //设置是否可以下注
        this.setCanSelectChips(false)

        //隐藏结算等待
        this._showWaitResult(false)

        this._clearAreaWin()
        this._wheel.showResSymbol(false)
    },

    
    async showResultStatu() {
        this._super()

        let resultMsg = cc.vv.gameData.getResultMsg()
        if (resultMsg) {
            //保存记录:看这个是否可以公用
            let result = resultMsg.result
            let records = cc.vv.gameData.getGameRecords()
            records.push({ res: result.res })
            if (records.length > 10) {  //最大10个
                records.shift()
            }
            //有结果，播放结果
            this._showWaitResult(false)
            //显示最多押注区
            this.showMaxBetArea(true)
            //转动转盘
            await this._wheel.turnWheel(result.res)
            //隐藏特效
            this.showMaxBetArea(false)
            //方位赢表现
            await this._showAreanWin(result.winplace)
            //各自飞金币
            await this._flyWinCoin()
            //隐藏押注额

        }
        else {
            //没结果，显示等待
            this._showWaitResult(true)
        }

    },

    //方位赢动画
    _showAreanWin: function (winplace) {
        return new Promise((res, rej) => {
            let endCall = function () {
                res()
            }
            let area_scp = this._getBetAreaScript()
            let area_node = area_scp.getBetAreaNode(winplace)
            if (area_node) {
                let winFlag = cc.find("sel", area_node)
                winFlag.active = true
                Global.blinkAction(winFlag, 0.2, 0.2, 3, endCall)
            }
        })
    },

    //清理赢的表现
    _clearAreaWin: function () {
        let area_scp = this._getBetAreaScript()
        for (let i = 0; i < area_scp.AreaList.length; i++) {
            let item = area_scp.AreaList[i]
            let winFlag = cc.find("sel", item.node)
            winFlag.active = false
        }
    },

    //飞赢的金币
    _flyWinCoin: function () {
        return new Promise((res, rej) => {
            let resultMsg = cc.vv.gameData.getResultMsg()
            let winIdx = resultMsg.result.winplace
            let area_scp = this._getBetAreaScript()
            let win_aren = area_scp.getBetAreaNode(winIdx)

            //输的方位金币飞到赢的方位消失
            let losechips = []
            for (let i = 0; i < area_scp.AreaList.length; i++) {
                let item = area_scp.AreaList[i]
                if (item.idx !== winIdx) {
                    let itemchips = area_scp.getAreaChips(item.idx)
                    for (let j = 0; j < itemchips.length; j++) {
                        losechips.push(itemchips[j])
                    }
                }
            }

            let chipCon = cc.find("chip_container", win_aren)
            for (let i = 0; i < losechips.length; i++) {
                let item = losechips[i]

                let xPos = Global.random(-chipCon.width / 2, chipCon.width / 2)
                let yPos = Global.random(-chipCon.height / 2, chipCon.height / 2)

                let toOffSet = cc.v2(xPos, yPos)
                area_scp.moveChip(item.chipNode, item.chipNode, win_aren, null, false, toOffSet)

            }

            losechips = null
            this.scheduleOnce(() => {
                this._flyTableChips(resultMsg)

                this.doShowResultFinish()
                this.updateGameRecord()
                res()
                //最后清理所有的
                //area_scp.clearTableBet()
            }, 1)

        })

    },

    _showTextTipAni: function (bShow, nType) {
        let node = cc.find("node_change_status", this.node)
        node.active = bShow
        if (!bShow) return
        let spine = cc.find("spine", node)
        let spcmp = spine.getComponent(sp.Skeleton)
        if (nType == 1) {
            spcmp.setAnimation(0, "animation2", false)
            Global.TableSoundMgr.playCommonEff("startbet")
        }
        else {
            spcmp.setAnimation(0, "animation", false)
            Global.TableSoundMgr.playCommonEff("com_stopbet")
        }
        spcmp.setCompleteListener((tck) => {
            node.active = false
        })
    },

    _showReTime: function (bShow, endCall, showFormat, userPerCall) {
        return this._wheel.showReTime(bShow, endCall, showFormat, userPerCall)
    },

    showMaxBetArea(bShow) {
        let hytx = cc.find("BetAreas/hytx", this.node)
        if (bShow) {
            let area_scp = this._getBetAreaScript()
            let idx = 0
            let max = 0
            for (let i = 0; i < area_scp.AreaList.length; i++) {
                let item = area_scp.AreaList[i]
                let totalBet = cc.vv.gameData.getAreaTotalBet(item.idx)
                if (max < totalBet) {
                    max = totalBet
                    idx = item.idx
                }
            }
            if (idx > 0) {
                hytx.active = true
                hytx.getComponent(sp.Skeleton).setAnimation(0, "hytx" + idx, true)
            }
        } else {
            hytx.active = false
        }

    },

    //更新游戏记录
    updateGameRecord: function () {
        this._wheel.showRecord()
    },

    //获取观众的节点
    _getObserverNode: function () {
        return cc.find("node_players/node_observers", this.node)
    },

    // onClickWatchList: function () {
    //     Global.TableSoundMgr.playEffect("anniudianji")
    //     let req = { c: MsgId.REQ_OBSER_LIST }
    //     cc.vv.NetManager.send(req)
    // },

    // OnRcvNetObserList: function (msg) {
    //     if (msg.code == 200) {
    //         let url = "games/Fortunewheel/prefab/players"
    //         cc.loader.loadRes(url, cc.Prefab, (err, prefab) => {
    //             if (!err) {
    //                 let parent = cc.find("Canvas")
    //                 let old = parent.getChildByName('Obser_List')
    //                 if (!old) {
    //                     let node = cc.instantiate(prefab);
    //                     node.parent = parent;
    //                     node.getComponent("Table_Observers_List").init(msg.list)
    //                 }
    //             }
    //         })
    //     }
    // },
});
