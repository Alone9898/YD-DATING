let STATUS_TIME = {
    FREE:5,
    BET:15,
    RESULT:10
}
cc.Class({
    extends: require("Table_Game_Base"),

    properties: {

        itemGuns:cc.Node,

        delayTimeCount: 0.05,   //开始的时候延迟调用的时间(最小时间间隔)
        itemNodeIndex: 0,
        loopCount: 0,
        canCircleNum: 3,  //空转3圈
        indexCj: 0,           //特殊抽奖的普通索引

    },

    // LIFE-CYCLE CALLBACKS:

    Init:function(){
        this._super();


        this.itemGuns = cc.find("midNode/lababg/itemNodes", this.node);
        this.resultViewNode = cc.find("resultView", this.node);

        //动画播放结束
        this.itemGuns.parent.getChildByName('dengShenSpine').getComponent(sp.Skeleton).setCompleteListener((event) => {
            let animName1 = event.animation.name;
            if (animName1 == "dianji") {//攻击结束
                this.playAnim(this.itemGuns.parent.getChildByName('dengShenSpine'), "daiji", true);
                if (this.isShendengAnimOver == 1) {
                    this.isShowSpecTurn = 1;
                    let index = this.resIndex[0] - 1;
                    this.itemGuns.children[index].getChildByName('zhong').stopAllActions();
                    this.startSpecAnim2();
                }
            }
        });
    },

    _showReTime: function (bShow, endCall, showFormat, userPerCall) {
        showFormat = showFormat+"S";
        this._super(bShow, endCall, showFormat, userPerCall);
    },

    /**
     * 空闲阶段
     * 根据游戏逻辑重写 重写需要调用this._super()
     */
    showIdleStatu: function () {
        let self = this
        this._super()


        this._clearAreaWin()
        this.initAreaStuats(false);

        //显示牌背
        this.removeOpenRewardAnim()

    },

    /**
     * 下注阶段
     * 根据游戏逻辑重写 重写需要调用this._super()
     */
    showBetStatu: function () {
        let self = this
        this._super()

        //显示开始下注动画,中途进来的不现实此动画
        let nRemind = cc.vv.gameData.getStatusTime()
        this._showTextTipAni(nRemind>STATUS_TIME.BET-2, 1)

        this.initAreaStuats(true);
        //显示牌背
        this.removeOpenRewardAnim()
    },

    /**
     * 结算阶段
     * 根据游戏逻辑重写 重写需要调用this._super()
     */
    async showResultStatu() {
        this._super()

        this.removeOpenRewardAnim()
        let resultMsg = cc.vv.gameData.getResultMsg()
        if (resultMsg) {
            //保存记录:看这个是否可以公用
            cc.vv.gameData.addGameRecord(resultMsg.result.res)

            //有结果，播放结果
            this._showWaitResult(false)

            this.initAreaStuats(false);

            this.refreshData()

            // let users = cc.vv.gameData.getTablePlayers();
            let user = cc.vv.gameData.getMyInfo()
            this.resultViewNode.getComponent("AladingWheel_ResultView").setGameData(resultMsg.users, resultMsg.result.res, user, resultMsg.user);

            await this._playResultAnim(resultMsg.result)

            //方位赢表现
            // await this._showAreanWin(resultMsg.result.res)
            //各自飞金币
            // await this._flyWinCoin(resultMsg)

            // this.updateGameRecord()
            // this.doShowResultFinish()

        } else {
            //没结果，显示等待
            this._showWaitResult(true)
        }
    },


    //清理赢的表现
    _clearAreaWin: function () {
        let area_scp = this._getBetAreaScript()
        for (let i = 0; i < area_scp.AreaList.length; i++) {
            let item = area_scp.AreaList[i]
            let winFlag = cc.find("sel", item.node)
            winFlag.stopAllActions();
            winFlag.active = false
        }
    },

    //方位赢动画
    _showAreanWin: function (result) {
        let area_scp = this._getBetAreaScript()
        for (let i = 0; i < area_scp.AreaList.length; i++) {
            let sel = cc.find("sel", area_scp.AreaList[i].node);
            if (result == i + 1) {
                sel.active = true;
                cc.tween(sel)
                    .blink(0.5, 3)
                    .start()
            } else {
                sel.active = false;
            }
        }
    },

    //飞赢的金币
    _flyWinCoin:function(resultMsg){
        return new Promise(async(res, rej) => {
            // let resultMsg = cc.vv.gameData.getResultMsg();
            // let result = resultMsg.result.res;
            let area_scp = this._getBetAreaScript();
            let zhuang = cc.find("Canvas/safe_node/midNode/lababg/zhuang_pos");
            // let flyNode = cc.find("Canvas/safe_node/fly")

            // 所有的方位飞到庄家
            // Global.TableSoundMgr.playEffect("fly");
            let losechips = [];
            for(let i = 0; i < area_scp.AreaList.length; i++){
                let item = area_scp.AreaList[i];
                let itemchips = area_scp.getAreaChips(item.idx);
                for(let j = 0; j < itemchips.length; j++){
                    losechips.push(itemchips[j])
                }
            }
            let awaitT = 0;
            for(let i = 0; i < losechips.length; i++){
                let item = losechips[i];
                let toOffSet = cc.v2(0,0);
                awaitT = Math.max(awaitT,area_scp.moveChip(item.chipNode,item.chipNode,zhuang,null,true,toOffSet));
            }

            await cc.vv.gameData.awaitTime(awaitT);
            // this.showCardMask();
            //
            // let multLit = [9,9,9,9,9,9,9,9,9,9,2.3,4.5,2.3]
            // // 庄家飞到赢的方位
            // Global.TableSoundMgr.playEffect("fly");
            // for(let i = 0; i < result.length; i++){
            //     let idx = result[i];
            //     let totalbet = cc.vv.gameData.getAreaTotalBet(idx) * multLit[idx-1];
            //     let chipList = cc.vv.gameData.formatVal2Chiplist(totalbet);
            //
            //     chipList.forEach(bet=>{
            //         let chip = area_scp._create_chip(cc.vv.gameData.getChipValByIdx(bet),null,idx);
            //         chip.position = chip.parent.convertToNodeSpaceAR(zhuang.convertToWorldSpaceAR(cc.v2(0,0)));
            //
            //         let chipCon = cc.find("chip_container",area_scp.getBetAreaNode(idx))
            //         let xPos = Global.random(-chipCon.width/2,chipCon.width/2)
            //         let yPos = Global.random(-chipCon.height/2,chipCon.height/2)
            //
            //         cc.tween(chip)
            //             .delay(Math.random()*0.7)
            //             .call(()=>{
            //                 area_scp.moveChip(chip, zhuang, chipCon, null, false,cc.v2(xPos, yPos));
            //             })
            //             .start()
            //
            //     })
            // }

            // 飘分、刷新金币
            let nMyWin = resultMsg.user.wincoin;
            let toNode = this.getMyNode()
            //然后飘分
            this.flyScroe(toNode,nMyWin)
            cc.vv.gameData.refushMyCoin()

            res()
        })

    },

    //设置下注位置状态
    initAreaStuats(bBet) {
        let area_scp = this._getBetAreaScript()
        for (let i = 0; i < area_scp.AreaList.length; i++) {
            area_scp.AreaList[i].node.getChildByName('xiazhu').active = bBet;
            area_scp.AreaList[i].node.getChildByName('xiazhuqu').active = !bBet;

        }
    },

    removeOpenRewardAnim: function () {
        //隐藏所有的item
        this.initItemsGunStatus(false, null);

        this.indexCj = 0;
        this.delayTimeCount = 0.05;   //开始的时候延迟调用的时间(最小时间间隔)
        this.loopCount = 0;     //循环次数
        // this.resIndex2 = [];
        // this.resIndex = [];
        this.isStartOpenAnim = false;
        this.isStartPullBet = false;
        this.pullBetData = null;
        this.playAnim(this.itemGuns.parent.getChildByName('dengShenSpine'), 'daiji', true)
    },

    _playResultAnim: function (result) {
        //开始播放结果
        let res = result.res;
        this.isStartOpenAnim = true;
        //更新下注描述
        if (res.length > 1) { //特殊的
            this.resIndex = res[0];
            this.resIndex2 = res[1];
            this.openRewardAnim(this.itemNodeIndex, res[0][0] - 1, res[1]);
        } else {
            this.openRewardAnim(this.itemNodeIndex, res[0][0] - 1, null);
        }
        //转盘转动时的背景音效

        Global.TableSoundMgr.playEffect("laba_effect");
        this.isShowShendengSpine = result.sp;
        this.isShendengAnimOver = result.op2;
        //更新总金币
        // this.myCoinTotal = user.coin ? user.coin : 0;
        // this.coinPot = msg.coinPot ? msg.coinPot : 0;
        // this.resultViewNode.getComponent(ResultView).setGameData(msg.users, msg.result.res, this.dm.deskInfo.user, msg.user);

        // if (this.oprViewCpt) {
        //     this.oprViewCpt.hideRebetBtns()
        // }
    },

    refreshData() {
        this.indexCj = 0;
        this.delayTimeCount = 0.05;   //开始的时候延迟调用的时间(最小时间间隔)
        this.loopCount = 0;     //循环次数
        this.isShowSpecTurn = 0;
        this.resIndex2 = [];
        this.resIndex = [];
        let bets = [0, 0, 0, 0, 0, 0, 0, 0]
        let userbets = [0, 0, 0, 0, 0, 0, 0, 0]
        // this.initAreaStuats(bets, userbets);
    },

    /**
     * 普通抽奖
     * @param startIndex  开始的索引
     * @param resIndex    到达的目标 即开奖元素
     * @param resIndex2   开到神灯以后 开奖元素为多个 普通抽奖 参数为null
     */
    openRewardAnim(startIndex, resIndex, resIndex2) {
        this.scheduleOnce(() => {
            this.itemNodeIndex++;
            if (this.itemNodeIndex >= this.itemGuns.childrenCount) {
                this.itemNodeIndex = 0;
            }

            //总的运行次数 = 从n开始 + 空转n圈  + 抽奖结果
            this.count = (this.itemGuns.childrenCount - startIndex) + this.itemGuns.childrenCount * this.canCircleNum + resIndex;
            if (isNaN(this.count)) {
                this.initItemsGunStatus(false, null);
                this.refreshData();
                return;
            }
            if (this.loopCount >= 8 && this.loopCount <= this.count - 10) {
                this.delayTimeCount = 0.01;
            } else {
                this.delayTimeCount = 0.16;
            }

            let cfg = cc.vv.gameData.getGameCfg();

            //当前运行次数++
            this.loopCount++;
            //判断是不是运行完了
            if (this.loopCount > this.count) {//运行结束 闪烁光标
                let nodess = this.itemGuns.children[resIndex].getChildByName('zhong');
                let time = 1;
                let blinkTimes = 10;
                //设置音效
                if (resIndex2 && resIndex2.length > 0) {//播放音效
                    Global.TableSoundMgr.playEffect("zhuan_1");
                    time = 10;
                    blinkTimes = 100;
                    let isTrain = this.checkOverIsTrain();
                    if (isTrain && this.isShowShendengSpine == 1 && this.isShendengAnimOver == 1) {
                        //这种情况 暂时留着
                    } else {
                        Global.TableSoundMgr.playEffect("laba_zhong_lucky");
                    }
                } else if (cfg.Multiples[resIndex] >= 10) {
                    Global.TableSoundMgr.playEffect("laba_zhong_multy_times");
                } else if (cfg.Multiples[resIndex] == 2 || cfg.Multiples[resIndex] == 5) {
                    Global.TableSoundMgr.playEffect("kaijiang");
                } else {
                    Global.TableSoundMgr.playEffect("laba_unit_lottery_move");
                }

                nodess.active = true;
                nodess.opacity = 255;
                //item 闪烁
                cc.tween(nodess)
                    .blink(time, blinkTimes)
                    .start()
                cc.tween(this.node)
                    .delay(1.0)
                    .call(() => {
                        if (resIndex2 && resIndex2.length > 0) { //特殊处理 转到神灯以后
                            //播放神灯
                            if (this.isShowShendengSpine == 1) {
                                this.playAnim(this.itemGuns.parent.getChildByName('dengShenSpine'), 'dianji', false);
                                if (this.isShendengAnimOver == 0) {
                                    this.isShowSpecTurn = 1;
                                    this.startSpecAnim();
                                }
                            } else {
                                this.startSpecAnim();
                            }

                        } else {
                            Global.TableSoundMgr.playEffect("laba_zhong_special");
                            //桌子闪烁
                            let index = cc.vv.gameData.getGameCfg().Results[resIndex];
                            this._showAreanWin(index);
                            cc.tween(this.node)
                                .delay(1)
                                .call(() => {
                                    let resultMsg = cc.vv.gameData.getResultMsg()
                                    this._flyWinCoin(resultMsg);
                                })
                                .delay(1)
                                .call(() => {
                                    this.openReslutView();
                                })
                                .start()
                        }
                    })
                    .start()

                return;
            } else {
                //先将之前一次的隐藏
                this.initItemsGunStatus(false, null);

                //切换光环位置 抽奖结果那一圈只显示1个
                if (this.loopCount >= this.count - 10) {
                    Global.TableSoundMgr.playEffect("laba_unit_lottery_move");
                    this.AmimColorShow(false, this.itemNodeIndex);
                } else {
                    this.AmimColorShow(true, this.itemNodeIndex);
                }
                //重新调用本方法（因为schedule不能动态修改运行间隔时间）
                this.openRewardAnim(startIndex, resIndex, resIndex2);
            }
        }, this.delayTimeCount)
    },


    //spec 抽奖
    openRewardAnimSpec(startIndex, resIndex) {
        this.scheduleOnce(() => {
            this.itemNodeIndex++;
            //循环到最后一个值之后从0开始
            if (this.itemNodeIndex >= this.itemGuns.childrenCount) {
                this.itemNodeIndex = 0;
            }
            //当前运行次数++
            this.loopCount++;
            //总的运行次数 起始
            this.count = (resIndex - startIndex) >= 0 ? resIndex - startIndex : (this.itemGuns.childrenCount - startIndex) + resIndex
            //判断是不是运行完了
            if (this.loopCount > this.count) {//运行结束 直接下一个目标  运行完所有 所有的一起闪烁

                //在进行下一次抽奖
                this.indexCj++;
                if (this.indexCj >= this.resIndex2.length) {//结束抽奖
                    Global.TableSoundMgr.playEffect("laba_zhong_special");
                    //停止前前一个的闪烁
                    let index1 = this.resIndex2[this.indexCj - 2] - 1;
                    this.itemGuns.children[index1].getChildByName('zhong').stopAllActions();
                    this.allAnimSpecOver();
                    cc.tween(this.node)
                        .delay(1)
                        .call(() => {
                            let resultMsg = cc.vv.gameData.getResultMsg()
                            this._flyWinCoin(resultMsg);
                        })
                        .delay(1)
                        .call(() => {
                            this.openReslutView();
                        })
                        .start()
                } else {
                    //多次开奖延时0.3s
                    console.log('继续特殊抽奖');
                    Global.TableSoundMgr.stopEffectByName("laba_zhong_lucky");
                    let specTime = (this.isShowSpecTurn == 1) ? 1.0 : 0.3;
                    this.scheduleOnce(() => {
                        if (this.indexCj <= 1) { //停止上一次的item的闪烁
                            //神灯停止闪烁
                            let index = this.resIndex[0] - 1;
                            this.itemGuns.children[index].getChildByName('zhong').stopAllActions();
                        } else {
                            //前前一个停止闪烁
                            let index1 = this.resIndex2[this.indexCj - 2] - 1;
                            this.itemGuns.children[index1].getChildByName('zhong').stopAllActions();
                        }
                        this.itemNodeIndex = this.resIndex2[this.indexCj - 1] - 1; //获取上次结束停留的位置
                        let nodess = this.itemGuns.children[this.itemNodeIndex].getChildByName('zhong');
                        nodess.active = true;
                        nodess.opacity = 255;
                        cc.tween(nodess)
                            .blink(10, 100)
                            .start()
                        this.delayTimeCount = 0.12;   //开始的时候延迟调用的时间(最小时间间隔)
                        this.loopCount = 0;     //循环次数
                        if (this.isShowSpecTurn == 1) { //直接到点
                            this.itemNodeIndex = this.resIndex2[this.indexCj] - 2;
                            this.openRewardAnimSpec(this.resIndex2[this.indexCj] - 2, this.resIndex2[this.indexCj] - 1)
                        } else {
                            this.openRewardAnimSpec(this.itemNodeIndex, this.resIndex2[this.indexCj] - 1)
                        }

                    }, specTime)

                }
                return;
            } else {
                //先将之前一次的隐藏
                Global.TableSoundMgr.playEffect("laba_unit_lottery_move");
                this.initItemsGunStatus(true, this.indexCj);
                //切换光环位置 抽奖结果那一圈只显示1个
                this.AmimColorShow(false, this.itemNodeIndex, true);
                //重新调用本方法（因为schedule不能动态修改运行间隔时间）
                this.openRewardAnimSpec(startIndex, resIndex);
            }
        }, this.delayTimeCount)
    },

    openRewardAnim2(startIndex, resIndex, resIndex2) {
        this.scheduleOnce(() => {
            this.itemNodeIndex++;
            //循环到最后一个值之后从0开始
            if (this.itemNodeIndex >= this.itemGuns.childrenCount) {
                this.itemNodeIndex = 0;
            }
            //总的运行次数 = 从n开始 + 空转n圈  + 抽奖结果
            this.count = (this.itemGuns.childrenCount - startIndex) + this.itemGuns.childrenCount * 2 + resIndex;
            if (isNaN(this.count)) {
                this.initItemsGunStatus(false, null);
                this.refreshData();
                return;
            }
            if (this.loopCount >= 8 && this.loopCount <= this.count - 10) {
                //加速度，为最大时间间隔➗空转之外需要运行的间隔（空转之外需要运行的间隔是一圈➕抽奖的结果）
                this.delayTimeCount = 0.01;
            } else {
                this.delayTimeCount = 0.12;
            }

            //当前运行次数++
            this.loopCount++;
            //判断是不是运行完了
            if (this.loopCount > this.count) {//运行结束 闪烁光标
                Global.TableSoundMgr.stopEffectByName("laba_zhong_lucky");
                Global.TableSoundMgr.stopEffectByName('laba_train_start');
                this.indexCj++;
                let nodess = this.itemGuns.children[resIndex].getChildByName('zhong');
                let time = 1;
                let blinkTimes = 10;
                nodess.active = true;
                nodess.opacity = 255;
                this.delayTimeCount = 0.13;   //开始的时候延迟调用的时间(最小时间间隔)
                this.loopCount = 0;     //循环次数
                //item 闪烁
                cc.tween(nodess)
                    .blink(time, blinkTimes)
                    .start()
                this.scheduleOnce(() => {
                    this.itemNodeIndex = this.resIndex2[this.indexCj] - 2;
                    this.openRewardAnimSpec(this.resIndex2[this.indexCj] - 2, this.resIndex2[this.indexCj] - 1);
                }, 1.0)
                return;
            } else {
                //先将之前一次的隐藏
                this.initItemsGunStatus(false, null);
                //切换光环位置 抽奖结果那一圈只显示1个
                if (this.loopCount >= this.count - 10) {
                    this.AmimColorShow(false, this.itemNodeIndex);

                } else {
                    this.AmimColorShow(true, this.itemNodeIndex);
                }
                //重新调用本方法（因为schedule不能动态修改运行间隔时间）
                this.openRewardAnim2(startIndex, resIndex, resIndex2);
            }
        }, this.delayTimeCount)
    },

    /**神灯出后 会有3种 特殊开奖动画 */
    //开始特殊抽奖1  通过openRewardAnimSpec 里
    startSpecAnim() {
        this.scheduleOnce(() => {
            this.delayTimeCount = 0.1;   //开始的时候延迟调用的时间(最小时间间隔)
            this.loopCount = 0;     //循环次数
            this.itemNodeIndex = this.resIndex[0] - 1;
            this.openRewardAnimSpec(this.itemNodeIndex, this.resIndex2[this.indexCj] - 1)
        }, 0.3)
    },

    //开始特殊抽奖2
    startSpecAnim2() {
        this.scheduleOnce(() => {
            this.delayTimeCount = 0.1;   //开始的时候延迟调用的时间(最小时间间隔)
            this.loopCount = 0;     //循环次数
            this.itemNodeIndex = this.resIndex[0] - 1;
            let isTrain = this.checkOverIsTrain();
            if (isTrain) {
                Global.TableSoundMgr.playEffect("laba_train_start");
            }
            this.openRewardAnim2(this.itemNodeIndex, this.resIndex2[this.indexCj] - 1, this.resIndex2);
        }, 0.3)
    },

    //让索引之后的2个显示颜色
    AmimColorShow(isShow, nodeIndex, isSpec) {
        let prenodeIndex, prenodeIndex1 = 0;
        let arrNode = [];
        arrNode.push(nodeIndex);
        if (isShow) {//显示3个
            prenodeIndex = nodeIndex - 1;
            if (prenodeIndex < 0) {
                prenodeIndex = 23;
            }
            prenodeIndex1 = prenodeIndex - 1;
            if (prenodeIndex1 < 0) {
                prenodeIndex1 = 23;
            }
            arrNode.push(prenodeIndex)
            arrNode.push(prenodeIndex1);

            for (let i = 0; i < arrNode.length; i++) {
                this.showItemColor(this.itemGuns.children[arrNode[i]]);
            }
        } else {//显示一个 特殊情况 n个都不隐藏 n > 1
            let sign = false;
            if (isSpec) {
                for (let i = 0; i < this.indexCj; i++) {
                    const element = this.resIndex2[i] - 1;
                    if (element == arrNode[0]) {
                        sign = true;
                        break;
                    }
                }
            }
            if (!sign) {
                this.showItemColor(this.itemGuns.children[arrNode[0]]);
            }
        }
    },


    //item 显示一个颜色 其他的颜色隐藏
    showItemColor(itemNode) {
        if (!itemNode) return;
        itemNode.children[1].active = true;
        itemNode.getChildByName('zhong').active = true;
    },


    //抽中神灯后所有的抽中奖的元素 显示出来 元素集体闪烁 桌子也集体闪烁
    allAnimSpecOver() {
        //获取所有元素非重复的闪烁
        let arr1 = Array.from(new Set(this.resIndex2));
        let arr = arr1.concat(this.resIndex);
        for (let i = 0; i < arr.length; i++) {
            const element = arr[i];
            let nodess = this.itemGuns.children[element - 1].getChildByName('zhong');
            nodess.active = true;
            nodess.opacity = 255;
            cc.tween(nodess)
                .blink(1.5, 10)
                .start()
        }
        this.scheduleOnce(() => {
            for (let j = 0; j < arr1.length; j++) {
                const element = arr1[j];
                let index = cc.vv.gameData.getGameCfg().Results[element - 1];
                this._showAreanWin(index);
            }
        }, 1.5)

    },

    // /***桌子闪烁  筹码上飞  弹窗出来 */
    // chipAreaBlink(resIndex) {
    //     let nodess = this.areabgNode.children[resIndex - 1].getChildByName('light')
    //     if (nodess) {
    //         nodess.active = true;
    //         cc.tween(nodess)
    //             .blink(0.5, 3)
    //             .start()
    //     }
    // },

    //开始押注重置状态
    resetTable() {
        this.timeTotal = 0;
        this.updateTimeStatus = false;
        this.isOpenReward = true;
        //隐藏倒计时
        this.initTableCDView();
        //更新投注区的文字描述
        this.initAreaStuats(null, null, true);
    },

    //结束开奖
    async overRunPrize() {
        // let resultMsg = cc.vv.gameData.getResultMsg()
        // await this._flyWinCoin(resultMsg);


        // this.isStartOpenAnim = false;
        // // this.resOpenPullBet();
        // //弹窗
        // this.openReslutView();
        // //更新奖池和自己的金币数
        // this.myCoinsLabel.string = Global.FormatNumToComma(this.myCoinTotal);
        // this.initTotalPrize(this.coinPot)
        // //重置某些数据
        // this.refreshData();
    },

    //检测特殊中奖是否为连续的
    checkOverIsTrain() {
        let arr = this.resIndex2.concat(this.resIndex);
        arr.sort((a, b) => a - b);
        let sign = 0;
        for (let i = 0; i < arr.length - 1; i++) {
            const element = arr[i];
            const element1 = arr[i + 1];
            if (element + 1 === element1) {
                sign++;
            }
        }
        if (sign == arr.length - 1) {
            return true;
        }
        return false;
    },

    initItemsGunStatus(ispec, index) {
        for (let i = 0; i < this.itemGuns.childrenCount; i++) {
            const element = this.itemGuns.children[i];
            let sign = false;
            if (ispec) {

                //神灯也不隐藏
                if (i === this.resIndex[0] - 1) {
                    sign = true;
                }
                //不隐藏抽中的
                for (let j = 0; j < index; j++) {
                    const element1 = this.resIndex2[j];
                    if (element1 - 1 == i) {
                        sign = true;
                        break;
                    }
                }
            }
            if (!sign) {
                this.initItemGun(element);
            }
        }
    },

    initItemGun(node) {
        if (!node || !cc.isValid(node)) return;
        node.children[1].active = false;
        node.getChildByName('zhong').active = false;
    },

    playAnim(node, animName, isloop) {
        node.getComponent(sp.Skeleton).setAnimation(0, animName, isloop);
    },

    // //将等待的押注开始信息开始处理
    // resOpenPullBet() {
    //     if (this.isStartPullBet) {
    //         this.isStartPullBet = false;
    //         this.pullBetData.time -= Math.floor(this.pullBetDelayTime);
    //         this.pullBetDelayTime = 0;
    //         //调用开始下注消息
    //         if (this.pullBetData.time > 0) {
    //             this.PULL_BETTING_STATUE(this.pullBetData);
    //         }
    //         this.showWaitBet();
    //         this.pullBetData = null;
    //
    //     }
    // }

    //结果弹窗
    openReslutView() {
        this.resultViewNode.zIndex = 20;
        this.resultViewNode.active = true;
        this.resultViewNode.stopAllActions();
        this.resultViewNode.scale = 0.3;
        cc.tween(this.resultViewNode).to(0.2, { scale: 1 }, { easing: 'backOut' }).start();
    }

    // update(dt) {
    //     this.updateTableTime(dt);
    //     this.updatePullBetTime(dt);
    // }
});
