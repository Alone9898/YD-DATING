
cc.Class({
    extends: cc.Component,

    properties: {
        _data:null,
        _movenode:null,
        _wheel:null,
        _reels:[],
        _rounds:[],
        _res:null,
        _spining: false,
        _xjl: null,
        _show: false,

        _onSpinEndCallBack: null,
    },

    onLoad () {
        this._movenode = cc.find("safe_node/layout/move_node", this.node);
        this._wheel = cc.find("wheel_game", this._movenode);
        this._xjl = cc.find("safe_node/xiaojinlong", this.node);
        for (let i=1; i<=3; i++) {
            let reel = this._wheel.getChildByName("reel"+i);
            let holder_ = cc.find("mask/holder", reel);
            let symbols_ = [];
            for (let j=1; j<=2; j++) {
                let symbol = holder_.getChildByName("symbol"+j);
                symbols_.push(symbol);
            }
            this._reels.push({
                holder: holder_,
                symbols: symbols_,
                anim1: cc.find("title_bg/anim", reel),
                anim2: cc.find("frame/anim", reel)
            });
        }
    },

    showXiaoJinLong(anim, sx) {
        //小金龙动画
        this._xjl.active = true;
        this._xjl.scaleX = sx || 1;
        this._xjl.getComponent(sp.Skeleton).setAnimation(0, anim, false);
        this._xjl.getComponent(sp.Skeleton).setCompleteListener(()=>{
            this._xjl.active = false;
        });
    },

    showSpin(res, callback) {
        if (this._spining) return;
        this._show = true;
        //图标复原
        this._reels[1].symbols[0].getChildByName("what").active = true;
        this._reels[1].symbols[0].getChildByName("icon").scale = 0;
        this._reels[2].symbols[0].getChildByName("what").active = true;
        this._reels[2].symbols[0].getChildByName("lbl_multipler").scale = 0;;
        //位置复原
        for (let i=0; i<3; i++) {
            this._reels[i].holder.y = 0;
            this._reels[i].symbols[0].y = 0;
            this._reels[i].symbols[1].y = 180;
        }

        this._res = res;
        this._onSpinEndCallBack = callback;
        this._rounds = [21, 31, 41];
        this._rounds[res.idx-1] += 1;

        //移入屏幕
        cc.tween(this._movenode)
            .by(2, {position:cc.v2(-1008,0)})
            .delay(0.5)
            .call(()=>{
                this._spining = true;
                Global.TheLegendOfDragon.playEffect("base/wheel");
            })
            .start();
        //小金龙动画
        this.showXiaoJinLong("animation1", -1);
        Global.TheLegendOfDragon.playEffect("base/dragon_fly");
    },

    showEnd() {
        if (!this._show) return;
        this._show = false;
        //移出屏幕
        cc.tween(this._movenode)
            .call(()=>{
                for (let i=0;i<3; i++) {
                    this._reels[i].anim1.active = false;
                    this._reels[i].anim2.active = false;
                }
            })
            .by(1.8, {position:cc.v2(1008,0)})
            .start();
        
        //小金龙动画
        this.showXiaoJinLong("animation1");
        Global.TheLegendOfDragon.playEffect("base/jp_move");
    },


    //旋转停止
    async onSpinEnd(idx){
        Global.TheLegendOfDragon.playEffect("base/wheel_stop");
        if (idx == this._res.idx-1) {
            let reel = this._reels[idx];
            reel.anim1.active = true;
            reel.anim2.active = true;
        }
        if (idx==2) {
            Global.TheLegendOfDragon.stopEffect("base/wheel");
            Global.TheLegendOfDragon.playEffect("base/wheel_wild");

            this._spining = false;
            //小金龙
            let res = this._res;
            let delayTime = 0;
            let anim = "animation2";
            let dir = 1;
            if (res.idx == 1) {   //加wild
                anim = "animation2";
                delayTime = 0.1;
            } else if (res.idx == 2) {    //替换符号
                let symbol = this._reels[res.idx-1].symbols[0];
                symbol.getChildByName("what").active = false;
                
                let icon = symbol.getChildByName("icon");
                let atlas = cc.vv.gameData.GetAtlasByName("base");
                //card 3,4,5,6 粉紫蓝绿
                icon.getComponent(cc.Sprite).spriteFrame = atlas.getSpriteFrame("theme177_wheel_ui_s"+res.card);
                icon.scale = 0;
                icon.runAction(cc.sequence(cc.scaleTo(0.6,1.1), cc.scaleTo(0.2, 1)));

                anim = "animation2";
                dir = -1;
                delayTime = 0.8;
            } else if (res.idx == 3) {   //奖励翻倍 
                let symbol = this._reels[res.idx-1].symbols[0];
                symbol.getChildByName("what").active = false;
                
                let label = symbol.getChildByName("lbl_multipler");
                label.getComponent(cc.Label).string = "X"+res.mul;
                label.scale = 0;
                label.runAction(cc.sequence(cc.scaleTo(0.6,1.1), cc.scaleTo(0.2, 1)));

                anim = "animation3";
                delayTime = 0.8;
            }

            this.scheduleOnce(()=>{
                this.showXiaoJinLong(anim, dir);
                Global.TheLegendOfDragon.playEffect("base/bonus_notify");
                if (this._onSpinEndCallBack) {
                    this._onSpinEndCallBack();
                }
            }, delayTime);
        }
    },

    update (dt) {
        if (!this._spining) return;
        for (let i=0; i<3; i++) {
            if (this._rounds[i] <= 0) continue;
            let reel = this._reels[i];
            let y = reel.holder.y - dt*1600;
            if (y <= -180) {
                y = 0;
                //交换symbol的位置
                let pos0 = reel.symbols[0].getPosition();
                let tmppos0 = cc.v2(pos0.x, pos0.y);
                let pos1 = reel.symbols[1].getPosition();
                let tmppos1 = cc.v2(pos1.x, pos1.y)
                reel.symbols[0].position = tmppos1;
                reel.symbols[1].position = tmppos0;
                this._rounds[i] -= 1;
                if (this._rounds[i] <= 0) {
                    this.onSpinEnd(i);
                }
            }
            reel.holder.y = y;
        }
    },
});
