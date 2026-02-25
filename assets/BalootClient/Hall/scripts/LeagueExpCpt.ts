const { ccclass, property } = cc._decorator;

@ccclass
export default class LeagueExpCpt extends cc.Component {

    @property(cc.Sprite)
    icon: cc.Sprite = null;
    @property(cc.Label)
    label: cc.Label = null;
    @property(cc.ProgressBar)
    progress: cc.ProgressBar = null;
    @property(cc.Node)
    animNode: cc.Node = null;


    private _gameId: number;
    private _gameLeuExp: number;
    private _nIterval: number;
    private _nCount: number;

    onLoad() {
        // this._svipexp = cc.vv.UserManager.svipexp
        let netListener = this.node.addComponent("NetListenerCmp");
        netListener.registerMsg(MsgId.LEAGUE_EXP_CHANGE, this.onNet_LEAGUE_EXP_CHANGE, this);

        // let eventListener = this.node.addComponent("EventListenerCmp");
        // // 经验值变动
        // eventListener.registerEvent("USER_LEAGUEXP_CHANGE", this.onEvent_USER_LEAGUEXP_CHANGE, this);
    }

    /**
     * 游戏内需要自己设置下这个信息
     * @param gameid 
     * @param exp 
     */
    setGameId(gameid, exp) {
        this._gameId = gameid
        this._gameLeuExp = exp
        this._nIterval = 0
        this._nCount = 0
        this._setExpVal(exp)
    }

    // 更新VIP进度条
    updateView() {
        this._setExpVal(cc.vv.UserManager.leagueexp)
    }

    _setExpVal(exp) {
        let rankData = cc.vv.UserConfig.getRank(exp)
        cc.vv.UserConfig.setRankFrame(this.icon, rankData.stage);
        // this.label.string = rankData.text;
        if (rankData.next) {
            let curExp = exp - rankData.score;
            let maxExp = rankData.next.score - rankData.score;
            this.progress.progress = curExp / maxExp;
            this.label.string = Global.FormatNumToComma(curExp) + "/" + Global.FormatNumToComma(maxExp);
        } else {
            this.progress.progress = 1;
            // let curExp = exp - rankData.score;
            this.label.string = Global.FormatNumToComma(exp);
            // this.label.string = rankData.text;
        }
    }

    updateProgress(nBegin, nEnd) {

        let nTime = 1.2
        let rankData = cc.vv.UserConfig.getRank(nEnd)

        if (rankData.next) {
            let curExp = nEnd - rankData.score;
            let maxExp = rankData.next.score - rankData.score;
            let proVal = curExp / maxExp
            Global.doRoallNumEff(this.label.node, nBegin, nEnd, nTime, () => {
            }, null, 0, true, null, "%s/" + Global.FormatNumToComma(rankData.next.score))

            if (proVal < this.progress.progress) {//倒退
                let initScale = this.icon.node.scale;
                // 图标更换
                cc.tween(this.icon.node)
                    .to(0.2, { scale: initScale * 1.2 })
                    .call(() => {
                        cc.vv.UserConfig.setRankFrame(this.icon, rankData.stage);
                    })
                    .to(0.2, { scale: initScale * 1 })
                    .start()
            }
            else {
                cc.vv.UserConfig.setRankFrame(this.icon, rankData.stage);
            }
            cc.tween(this.progress)
                .call(() => {
                    this.animNode.active = true
                })
                .to(nTime, { progress: proVal }, {
                    progress: (start, end, current, ratio) => {
                        this.animNode.x = -this.progress.node.width / 2 + this.progress.node.width * current;
                        return start + (end - start) * ratio;
                    }
                })
                .call(() => {
                    this.animNode.active = false
                })
                .start()
        }
        else {
            this.progress.progress = 1;
            this.label.string = Global.FormatNumToComma(nEnd);
        }

    }

    // onEvent_USER_LEAGUEXP_CHANGE(data){
    //     let val = data.detail
    //     if(val){
    //         this.updateProgress(val.old,val.new)
    //     }

    // }

    onNet_LEAGUE_EXP_CHANGE(msg) {
        if (msg.code == 200) {
            if (msg.gameid == this._gameId) {

                let oldVal = this._gameLeuExp
                this._gameLeuExp = msg.exp

                this.updateProgress(oldVal, this._gameLeuExp)
            }
        }
    }

    //切换剩余时间
    updateTimeShow() {
        if (this._gameId) {
            //在游戏内
            let lbl_time = cc.find("lbl_time", this.node)
            if (lbl_time) {
                let nRemind = cc.vv.UserManager.leagueRmindTime
                if (nRemind > 0) {
                    lbl_time.getComponent(cc.Label).string = ___("结束剩余时间") + ": " + Global.formatSecond(nRemind, "hh:mm:ss")
                }
            }

        }
    }

    update(dt: number): void {
        this._nIterval += dt
        if (this._nIterval > 1) {
            this._nIterval = 0
            this._nCount += 1
            this.updateTimeShow()

            if (this._nCount % 3 == 0) {
                if (this.label.node.active == true) {
                    if (this.label.node.getNumberOfRunningActions() == 0) {
                        if (cc.vv.UserManager.leagueRmindTime > 0) {
                            let lbl_time = cc.find("lbl_time", this.node)
                            if (lbl_time) {
                                lbl_time.active = true
                                this.label.node.active = false
                            }
                        }


                    }
                }
                else {
                    let lbl_time = cc.find("lbl_time", this.node)
                    if (lbl_time) {
                        lbl_time.active = false
                        this.label.node.active = true
                    }
                }

            }
        }



    }
}
