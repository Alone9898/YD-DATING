/**墨西哥帅哥-符号表 
 * 
*/
cc.Class({
    extends: require("LMSlots_Symbol_Base"),

    properties: {
        
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    // start () {
    //
    // },

    //重写
    StartMove:function(){
        this._super()
        this.SetMult()
    },

    //设置_symbolIdx 行序号
    SetSymbolIdx:function(idx){
        this._symbolIdx = idx;

        if (idx === 10) {  //wild层最高
            this.node.zIndex = 50;
        }
        else {
            this.node.zIndex = 50 - idx;
        }
    },

    SetMult:function(mult){
        let txt = cc.find("coin_num",this.node)
        if(mult){
            txt.active = true
            txt.getComponent(cc.Label).string = mult + "X";
            txt.scaleY = 0;

            cc.tween(txt)
                .to(0.3, {scaleY:1.2})
                .to(0.3, {scaleY:1.0})
                .call(()=>{
                    AppLog.warn("SetMult: ", txt.scaleY);
                })
                .start();
        }
        else{
            txt.cleanup();
            txt.active = false;
        }
    },

    //在顶层播放动画；能覆盖左右两列
    setAnimationToTop(isTop){
        if(this._topAniNode){
            if (isTop) {
                let cloneNode = cc.find(cc.js.formatStr("symbol_ani_%s_%s",this._symbolIdx,this._reelIdx),this._topAniNode);

                //如果有同一帧又创建了，需要判断卷轴是否有效
                if (!cloneNode) {
                    cloneNode = cc.instantiate(this.node)
                }

                let wordPos = this.node.convertToWorldSpaceAR(cc.v2(0.0));
                cloneNode.parent = this._topAniNode
                cloneNode.name = cc.js.formatStr("symbol_ani_%s_%s",this._symbolIdx,this._reelIdx)
                cloneNode.position = this._topAniNode.convertToNodeSpaceAR(wordPos)
                this.node.active = false

                //设置倍数
                if (this._data && this._data.t == "mult") {
                    cloneNode.getComponent("LampOfAladdin_Symbol").SetMult(this._data.num);
                }

                return cloneNode
            }else{
                let showNode = cc.find(cc.js.formatStr("symbol_ani_%s_%s",this._symbolIdx,this._reelIdx),this._topAniNode);
                if (showNode) {
                    //需要重复利用的话，隐藏就好
                    showNode.removeFromParent()
                    showNode.destroy()
                }
                this.node.active = true
                if(this._showNode){
                    this._showNode.active = true
                }
            }
        }
        return this.node
    },


    //播放收集能量动作
    PlayCollectAction:function(){
        let cfg = cc.vv.gameData.getGameCfg();
        if(this._id != cfg.collectId) return;

        //同时实例化scatter对象 移动用
        let flyNode = cc.instantiate(this.node);
        let parentNode = cc.find('Canvas/safe_node')
        flyNode.parent = parentNode
        let beiginPos = parentNode.convertToNodeSpaceAR(this.node.convertToWorldSpaceAR(cc.v2(0,0)))
        flyNode.position = beiginPos
        flyNode.active = true;

        //先播放scatter动画
        cc.find(cfg.symbol[this._id].node, flyNode).active = false;
        let wnode = cc.find(cfg.symbol[this._id].win_node, flyNode);
        wnode.active = true;
        wnode.getComponent(sp.Skeleton).setAnimation(0,"animation1",false);
        wnode.getComponent(sp.Skeleton).setCompleteListener(()=>{
            flyNode.removeFromParent(true);
        });

        let targetNode = cc.find('Canvas/safe_node/slots/node_energy/spr_collect_m1');
        let tarPos = parentNode.convertToNodeSpaceAR(targetNode.convertToWorldSpaceAR(cc.v2(0,0)));
        flyNode.runAction(
            // cc.sequence(
                cc.bezierTo(0.4, [cc.v2(beiginPos.x,beiginPos.y),cc.v2(tarPos.x,beiginPos.y),cc.v2(tarPos.x,tarPos.y)]),
            //     cc.callFunc(()=>{
            //         flyNode.removeFromParent(true);
            //     })
            // )
        );
        return true; //表示播放了
    },

    //飞wild到收集金盘
    playWildCollectAction:function(){
        let cfg = cc.vv.gameData.getGameCfg();
        if(this._id != cfg.wildId) return;

        if (!cc.vv.gameData.isOpenCollectWild()) return;

        //设置倍数
        if (this._data && this._data.t == "mult") {
            this.SetMult(this._data.num);
        }

        //同时实例化wild对象 移动用
        let flyNode = cc.instantiate(this.node);
        let symScript = flyNode.getComponent("LampOfAladdin_Symbol");
        let parentNode = cc.find('Canvas/safe_node')
        flyNode.parent = parentNode

        let beiginPos = parentNode.convertToNodeSpaceAR(this.node.convertToWorldSpaceAR(cc.v2(0,0)))
        flyNode.position = beiginPos

        let targetNode = cc.find('Canvas/safe_node/slots/spine_collect_wild')
        let tarPos = parentNode.convertToNodeSpaceAR(targetNode.convertToWorldSpaceAR(cc.v2(140,60)));

        //开始移动
        symScript._showNode.active = false;
        Global.SlotsSoundMgr.playEffect('wild_fly');
        cc.tween(flyNode)
            .delay(0.5)
            .call(()=>{
                symScript._showNode = cc.find("w100", flyNode);
                symScript._showNode.active = true;
                symScript._showNode.getComponent(sp.Skeleton).setAnimation(0,"animation",false);
            })
            .bezierTo(0.5,cc.v2(beiginPos.x,beiginPos.y),cc.v2(tarPos.x,beiginPos.y),cc.v2(tarPos.x,tarPos.y))
            .call(() => {
                symScript._showNode.active = false;
                symScript._showNode = cc.find("w101", flyNode);
                symScript._showNode.active = true;
                symScript._showNode.getComponent(sp.Skeleton).setAnimation(0,"animation",false);
            })
            .delay(0.2)
            .call(()=>{
                //移动结束 通知刷新能量
                Global.dispatchEvent(cc.vv.gameData._EventId.SLOT_REFUSH_COLLECT_WILD_PROGRESS);
            })
            .removeSelf()
            .start();
    },
});
