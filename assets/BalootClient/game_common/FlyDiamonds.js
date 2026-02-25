
function around(val = 0.1) {
    return (1 - val) + Math.random() * val * 2;
}

cc.Class({
    extends: cc.Component,

    properties: {
        diamondSpriteFrame: cc.SpriteFrame,
        atlas: cc.SpriteAtlas,
        _coinScale: {
            default: 0.8,
            serializable: false
        },
        _nodePool: null,
        _hitNodePool: null,
    },

    onLoad() {
        this._nodePool = new cc.NodePool();
        this._hitNodePool = new cc.NodePool()
    },

    createCoin() {
        let coin = 0;
        if (this._nodePool.size() > 0) {
            coin = this._nodePool.get();
        } else {
            coin = new cc.Node("coin");
            let spr = coin.addComponent(cc.Sprite);
            let ani = coin.addComponent(cc.Animation);
            spr.sizeMode = cc.Sprite.SizeMode.RAW;
            var frames = [];
            let start_idx = Global.random(1, 23);
            for (let i = 0; i < 23; i++) {
                // let idx = (start_idx + i) % 23 + 1;
                // var frame = this.atlas.getSpriteFrame("e0" + ((idx < 10) ? ("0" + idx) : idx));
                var frame = this.diamondSpriteFrame;
                if (frame) {
                    frames.push(frame);
                }
                else
                    break;
            }
            var clip = cc.AnimationClip.createWithSpriteFrames(frames, 40);
            clip.name = "anim";
            clip.wrapMode = cc.WrapMode.Loop;
            ani.addClip(clip);
            ani.play("anim");
        }

        return coin;
    },


    onDestroy() {
        cc.vv.AudioManager.stopEffectByName(Global.SOUNDS.sound_fly_coins.filename);
        this._nodePool.clear();
        this._hitNodePool.clear();
    },

    around() {
        return 0.9 + Math.random() * 0.2;
    },

    //显示金币从src飞向des的动画，数量为num
    //rollData {lblCoin:要滚动的金币节点,addCoin:要增加的金币,begin:开始滚动的数字}
    showFlyCoins(src, des, num = 20, callback, rollData) {
        let self = this
        self._coinNum = num
        self._rollData = rollData

        let flySpeed = 1500 * 2
        if (rollData && rollData.begin) {
            rollData.lblCoin.getComponent(cc.Label).string = Global.FormatNumToComma(rollData.begin)
        }

        cc.vv.AudioManager.playEff(Global.SOUNDS.sound_fly_coins.path, Global.SOUNDS.sound_fly_coins.filename, true, true);
        let pool = this._nodePool;
        for (let i = 0; i < num; i++) {
            let coin = this.createCoin();
            coin.setScale(this._coinScale * around());
            coin.position = src;
            this.node.addChild(coin);

            let delta = des.sub(src);
            let d = delta.mag();
            let bezier = [
                cc.v2(src.x * around() - delta.x * around() * 0.4, src.y + delta.y * 0.4 * around()),
                cc.v2(des.x * around() + delta.x * around() * 0.7, src.y + delta.y * 0.7 * around()),
                des
            ];
            coin.runAction(cc.sequence(cc.hide(), cc.delayTime(0.05 * i * around(0.05)), cc.show(), cc.bezierTo(d / flySpeed, bezier), cc.callFunc((sender) => {
                //添加金币撞击的效果
                self._showHitEff(des)
                self.doRollLabelCoin()
                pool.put(sender);
                if (i === num - 1) {
                    cc.vv.AudioManager.stopEffectByName(Global.SOUNDS.sound_fly_coins.filename);
                    if (cc.isValid(callback)) callback();
                }
            })));
        }
    },

    //设置金币的缩放
    setCoinScale(s) {
        this._coinScale = s;
    },

    //显示撞击效果
    _showHitEff: function (pos) {
        let self = this

        let doAniEff = function (node) {
            if (node) {
                node.stopAllActions()
                node.position = pos
                node.parent = self.node
                node.scale = 1
                node.opacity = 255
                cc.tween(node)
                    .to(0.2, { scale: 3, opacity: 100 })
                    .call((target) => {
                        if (cc.isValid(self._hitNodePool)) {
                            self._hitNodePool.put(target)
                        }

                    })
                    .start()
            }
        }

        let node
        if (this._hitNodePool.size() > 0) {
            node = this._hitNodePool.get()
            doAniEff(node)
        }
        else {
            cc.loader.loadRes("BalootClient/BaseRes/prefabs/spr_flycoin_hit", cc.Prefab, (err, prefab) => {
                node = cc.instantiate(prefab)
                doAniEff(node)
            })
        }
    },

    doRollLabelCoin: function () {
        if (this._rollData) {
            let lblNode = this._rollData.lblCoin
            let addCoin = this._rollData.addCoin
            if (cc.isValid(lblNode)) {
                let lbl = lblNode.getComponent(cc.Label)
                if (lbl) {
                    let oldNum = Global.FormatCommaNumToNum(lbl.string)
                    lbl.string = Global.FormatNumToComma(parseInt(addCoin / this._coinNum) + oldNum)
                }
            }

        }
    }

});
