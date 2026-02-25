
cc.Class({
    extends: cc.Component,

    properties: {
        atlas: cc.SpriteAtlas,
        trendPrefab: cc.Prefab,
    },

    onLoad () {
        let btn_trend = cc.find("wheel_base/btn_trend",this.node)
        Global.btnClickEvent(btn_trend, this.onClickTrend, this)
    },

    start () {
        this.showRecord()
    },

    showResLamp() {
        let reslamp = cc.find("reslamp", this.node)
        reslamp.active = true
        let spine = reslamp.getComponent(sp.Skeleton)
        spine.setCompleteListener(()=>{
            reslamp.active = false
        })
        spine.setAnimation(0, "baopo", false)
        Global.TableSoundMgr.playEffect("kaijiang")
    },

    showResSymbol(bShow, res) {
        let ressymbol = cc.find("res_symbol", this.node)
        ressymbol.active = bShow
        if (bShow) {
            if (res == 0) {
                ressymbol.getComponent(cc.Sprite).spriteFrame = this.atlas.getSpriteFrame("question")
            } else {
                let cfg = cc.vv.gameData.getGameCfg()
                let result = cfg.ResultMap[res]
                ressymbol.getComponent(cc.Sprite).spriteFrame = this.atlas.getSpriteFrame("symbol_"+result.symbol)
            }
        }
    },

    async turnWheel(res) {
        //蒙版
        let mask = cc.find("wheel_mask", this.node)
        mask.active = false
        //灯
        let deng = cc.find("deng", this.node)
        deng.getComponent(sp.Skeleton).setAnimation(0, "xuanzhuan", true)
        cc.tween(deng)
            .delay(5)
            .call(()=>{
                deng.getComponent(sp.Skeleton).setAnimation(0, "san", true)
            })
            .delay(1)
            .call(()=>{
                deng.getComponent(sp.Skeleton).setAnimation(0, "tinzhi", true)
            })
            .start()
        //结果图片
        this.showResSymbol(true, 0)//显示?
        //声音
        Global.TableSoundMgr.playEffect("start2")
        // cc.tween(this.node)
        //     .delay(1)
        //     .call(()=>{
        //         Global.TableSoundMgr.playEffect("zhuan", true)
        //     })
        //     .delay(1)
        //     .call(()=>{
        //         Global.TableSoundMgr.stopEffectByName("zhuan")
        //         Global.TableSoundMgr.playEffect("over")
        //     })
        //     .start()
            cc.tween(this.node)
            .delay(3)
            .call(()=>{
                Global.TableSoundMgr.playEffect("over2")
            })
            .start()
        //转盘
        let wheel = cc.find("wheel", this.node)
        wheel.rotation = wheel.rotation % 360;
        let offsetAngle = -360*9 - (res-1) * 360 / 10;
        //转动转盘
        return new Promise((resolve) => {
        //     cc.tween(wheel)
        //         .delay(0.25)
        //         .to(6.5, { angle: offsetAngle }, { easing: 'quartInOut' })
        //         .call(()=>{
        //             this.showResLamp()
        //             this.showResSymbol(true, res)
        //         })
        //         .delay(0.25)
        //         .call(() => {
        //             resolve()
        //             mask.active = true
        //         })
        //         .start();
        // })
            cc.tween(wheel)
                .delay(0.25)
                .to(0.7, { angle: offsetAngle*0.2}, { easing: 'quadIn' })
                .to(2.6, { angle: offsetAngle*0.8 })
                .to(3.0, { angle: offsetAngle }, { easing: 'quintOut' })
                .call(()=>{
                    this.showResLamp()
                    this.showResSymbol(true, res)
                })
                .delay(0.25)
                .call(() => {
                    resolve()
                    mask.active = true
                })
                .start();
        })
    },

    showReTime:function(bShow,endCall,showFormat,userPerCall){
        let nTime = cc.vv.gameData.getStatusTime()
        let node_retimer = cc.find("node_retimer",this.node)
        node_retimer.active = bShow
        let perCall = function(nTime){
            if(cc.vv.gameData.getGameStatus() == 2){
                if(nTime <=3 && nTime > 0){
                    //押注阶段才倒计时
                    Global.TableSoundMgr.playCommonEff("com_timeAlarm")
                }
                if (nTime==0) {
                    cc.find("val",node_retimer).getComponent(cc.Label).string = ""
                }
            }
            if(userPerCall){
                userPerCall(nTime)
            }
        }
        if(bShow){
            cc.find("val",node_retimer).getComponent("ReTimer").setReTimer(nTime,1,endCall,showFormat,perCall)
        }
    },

    showRecord() {
        //显示最近4条
        let cfg = cc.vv.gameData.getGameCfg()
        let records = cc.vv.gameData.getGameRecords()
        let nTotal = records.length
        let nShowNum = 4
        let nAdd = 0
        if (nTotal < nShowNum) nAdd = nShowNum-nTotal
        let recordsNode = cc.find("wheel_base/node_records", this.node)
        for(let i = nShowNum; i > 0; i--){
            let idx = nTotal - i + nAdd
            let item = records[idx]
            let node = cc.find("r"+i, recordsNode)
            if (item){
                node.active = true
                let result = cfg.ResultMap[item.res]
                node.getChildByName("symbol").getComponent(cc.Sprite).spriteFrame = this.atlas.getSpriteFrame("symbol_"+result.symbol)
                node.getChildByName("mult").getComponent(cc.Sprite).spriteFrame = this.atlas.getSpriteFrame("x"+result.mult)
            } else {
                node.active = false
            }
        }
    },

    onClickTrend() {
        Global.TableSoundMgr.playEffect("anniudianji")
        let canvas = cc.find("Canvas")
        if (!canvas.getChildByName("trend")) {
            let node = cc.instantiate(this.trendPrefab)
            node.parent = canvas
        }            
    },



});
