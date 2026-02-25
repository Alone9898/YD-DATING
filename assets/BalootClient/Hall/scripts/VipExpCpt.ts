const { ccclass, property } = cc._decorator;

@ccclass
export default class VipExpCpt extends cc.Component {

    @property(cc.Sprite)
    icon: cc.Sprite = null;
    @property(cc.Label)
    label: cc.Label = null;
    @property(cc.ProgressBar)
    progress: cc.ProgressBar = null;
    @property(cc.Node)
    animNode: cc.Node = null;


    private _svip: number;
    private _svipexp: number;
    private _nextvipexp: number;

    onLoad() {
        this._svip = cc.vv.UserManager.svip;
        this._svipexp = cc.vv.UserManager.svipexp
        this._nextvipexp = cc.vv.UserManager.nextvipexp
        
    }

    updateVipNoAnim() {
        // let vipLv = Math.min(cc.vv.UserConfig.max_vip, cc.vv.UserManager.getVip() + 1);
        // let config = cc.vv.UserConfig.vipInfoConfig[vipLv];
        // let perExpUp = cc.vv.UserConfig.vipInfoConfig[vipLv - 1].expup;
        // // 当前经验总值
        // let curExp = cc.vv.UserManager.svipexp;
        // 在当前等级进度计算
        let need = this._nextvipexp;
        let cur = this._svipexp;
        let per = need ? cur / need : 1;
        per = Math.min(per, 1);
        per = Math.max(per, 0);
        if (!need) {
            this.label.string = Global.FormatNumToComma(cur);
        } else {
            this.label.string = Global.formatNumShort(cur) + "/" + Global.formatNumShort(need);
        }
        cc.vv.UserConfig.setVipFrame(this.icon, cc.vv.UserManager.svip);
        this.progress.progress = per;
    }


    // 更新VIP进度条
    updateVipExp() {
        if (this._svipexp == undefined) {
            this._svipexp = cc.vv.UserManager.svipexp;
        }
        // if (this.progress) {
        // if (cc.vv.UserManager.svip <= 0) {
        //     this.progress.progress = 0;
        //     this.label.string = ___("未激活");
        //     cc.vv.UserConfig.setVipFrame(this.icon, cc.vv.UserManager.svip);
        //     return;
        // }
        // 计算进度
        // cc.vv.UserConfig.vipExp2Level(cc.vv.UserManager.svipexp);
        let lock = cc.find("lock", this.icon.node)
        if(lock){
            lock.active = cc.vv.UserManager.svip <= 0;
        }
        
        // let vipLv = Math.min(cc.vv.UserConfig.max_vip, cc.vv.UserManager.getVip() + 1)
        // let config = cc.vv.UserConfig.vipInfoConfig[vipLv];
        // let perExpUp = cc.vv.UserConfig.vipInfoConfig[vipLv - 1].expup;
        // // 当前经验总值
        // let curExp = cc.vv.UserManager.svipexp;
        // 在当前等级进度计算
        let need = cc.vv.UserManager.nextvipexp;
        let cur = cc.vv.UserManager.svipexp;
        let per = cur / need;
        per = Math.min(per, 1);
        per = Math.max(per, 0);
        // 数字调整
        let sNum = Global.FormatCommaNumToNum(this.label.string);
        Global.doRoallNumEff(this.label.node, Math.max(sNum, 0), cur, 1.2, () => {
            // this.diamondCpt.node.active = false;
            Global.dispatchEvent("USER_VIP_EXP_CHANGE_END");
            // if (vipLv >= cc.vv.UserConfig.max_vip) {
            //     this.label.string = Global.FormatNumToComma(cur);
            // } else {
                this.label.string = Global.FormatNumToComma(cur) + "/" + Global.FormatNumToComma(need);
            // }
        }, (num) => {
            // 更新Label
            // if (vipLv >= cc.vv.UserConfig.max_vip) {
            //     this.label.string = Global.FormatNumToComma(parseInt(num));
            // } else {
                this.label.string = Global.FormatNumToComma(parseInt(num)) + "/" + Global.FormatNumToComma(need);
            // }
        }, 0, true)
        // 如果任何改变都没有则不执行
        if (cc.vv.UserManager.svip == this._svip && cc.vv.UserManager.svipexp == this._svipexp) {
            cc.vv.UserConfig.setVipFrame(this.icon, cc.vv.UserManager.svip);
            this.progress.progress = per;
            return;
        }
        if (this.animNode && this.icon) {
            let toPreTween = cc.tween()
                .call(() => {
                    this.animNode.active = true;
                })
                .to(1, { progress: per }, {
                    progress: (start, end, current, ratio) => {
                        this.animNode.position = this.progress.barSprite.node.position.add(cc.v3(this.progress.barSprite.node.width * current, 0));
                        return start + (end - start) * ratio;
                    }
                })
                .call(() => {
                    this.animNode.active = false;
                });
            // 判断是否有升级
            let upTween = null;
            if (cc.vv.UserManager.svip > this._svip) {
                upTween = cc.tween()
                    .call(() => {
                        this.animNode.active = true;
                    })
                    .to(0.5, { progress: 1 }, {
                        progress: (start, end, current, ratio) => {
                            this.animNode.position = this.progress.barSprite.node.position.add(cc.v3(this.progress.barSprite.node.width * current, 0));
                            return start + (end - start) * ratio;
                        }
                    })
                    .call(() => {
                        this.progress.progress = 0;
                        let initScale = this.icon.node.scale;
                        // 图标更换
                        cc.tween(this.icon.node)
                            .to(0.1, { scale: initScale * 1.2 })
                            .call(() => {
                                cc.vv.UserConfig.setVipFrame(this.icon, cc.vv.UserManager.svip);
                            })
                            .to(0.1, { scale: initScale * 1 })
                            .start()
                    })
                    .call(() => {
                        this.animNode.active = false;
                    });
            }
            if (upTween) {
                cc.tween(this.progress).then(upTween).then(toPreTween).start();
            } else {
                cc.tween(this.progress).then(toPreTween).start();
                cc.vv.UserConfig.setVipFrame(this.icon, cc.vv.UserManager.svip);
            }
        }
        else if(this.icon){
            cc.vv.UserConfig.setVipFrame(this.icon, cc.vv.UserManager.svip);
            this.progress.progress = per;
        }
        // }
        this._svip = cc.vv.UserManager.svip;
        this._svipexp = cc.vv.UserManager.svipexp;
        this._nextvipexp = cc.vv.UserManager.nextvipexp;
    }

    // update (dt) {}
}
