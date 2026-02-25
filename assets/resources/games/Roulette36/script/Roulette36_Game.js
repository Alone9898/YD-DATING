/**
 * 俄罗斯轮盘36游戏逻辑
 */
 let STATUS_TIME = {
    FREE:5,
    BET:15,
    RESULT:20
}

cc.Class({
    extends: require("Table_Game_Base"),


    properties: {
        
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start () {
        this._super()
        this._playLunpanRandomAni()
    },

    //空闲
    showIdleStatu:function(){
        this._super()
        this._showBigResult(false)
        this.showTotalBet()
    },

    //下注
    showBetStatu:function(doStatusChange){
        this._super(doStatusChange)

       
        

        this.showTotalBet()
    },


    //展示结果
    async showResultStatu(){
        let self = this
        this._super()

        let resultMsg = cc.vv.gameData.getResultMsg()
        if(resultMsg){
            //add record
            cc.vv.gameData.addGameRecord(resultMsg.result.res)
            //移动桌子
            let moveVal = -500
            
            await this._moveGameNode(moveVal)
            //转动轮盘
            await this._playLunpanResult(resultMsg.result.res)
            //播放音效
            Global.TableSoundMgr.playEffect("number/res"+resultMsg.result.res)

            let endCall = function(){
                self._showBigResult(true,resultMsg.result.res)
                self.doShowResultFinish()
            }
            await this._moveGameNode(0,endCall)
            //显示中奖区域
            await this._showWinArean(resultMsg.result.winplace)
            //飞筹码
            await this._flyWinChip(resultMsg)

        }
        else{
            //没结果，显示等待
            Global.TableSoundMgr.stopEffectByName("roll")
            this._showWaitResult(true)
        }

        

    },

    _moveGameNode:function(yOff,endCall){
        return new Promise((res, rej) => {
            cc.tween(this.node)
            .to(0.3,{y:yOff})
            .call(()=>{
                if(endCall){endCall()}
                res()
                
            })
            .start()
        })
    },

    //轮盘初始化动画
    _playLunpanRandomAni:function(){
        let ball = Global.random(0,36)
        let node_lunpan = cc.find("Bg/node_luanpan/lunpan",this.node)
        let spcmp = node_lunpan.getComponent(sp.Skeleton)
        spcmp.setAnimation(0,cc.js.formatStr("Animation%s_0",ball),true)
    },

    //轮盘结果
    _playLunpanResult:function(ball){
        return new Promise((res, rej) => {
            let node_lunpan = cc.find("Bg/node_luanpan/lunpan",this.node)
            let spcmp = node_lunpan.getComponent(sp.Skeleton)
            spcmp.setAnimation(0,"Animation"+ball,false)
            spcmp.addAnimation(0,cc.js.formatStr("Animation%s_0",ball),true)
            cc.tween(node_lunpan)
            .call(()=>{
                Global.TableSoundMgr.playEffect("roll", true)
            })
            .delay(4.5)
            .call(()=>{
                Global.TableSoundMgr.stopEffectByName("roll")
                Global.TableSoundMgr.playEffect("tiao")
            })
            .delay(3)
            .call(()=>{
                res()
            })
            .start()
        })
    },

    _showWinArean:function(places){
        return new Promise((res, rej) => {
            
            this.scheduleOnce(()=>{
                Global.TableSoundMgr.playEffect("Win")
            },0.3)
            
            for(let i = 0; i < places.length; i++){
                let idx = places[i]
                let node = this._getBetAreaScript().getBetAreaNode(idx)
                if(node){
                    let sel = cc.find("sel",node)
                    if(sel){
                        let endCall = function(){
                            res()
                            sel.active = false
                        }
                        sel.active = true
                        Global.blinkAction(sel,0.1,0.1,3,endCall)
                    }
                }
            }
        })
    },

    _flyWinChip:function(){
        return new Promise((res, rej) => {
            let resultMsg = cc.vv.gameData.getResultMsg()
            //输的筹码飞Total,Total再飞赢的区域，赢的再飞玩家
            let area_scp = this._getBetAreaScript()
            //输的方位金币飞到赢的方位消失
            let losechips = []
            for(let i = 0; i < area_scp.AreaList.length; i++){
                let item = area_scp.AreaList[i]
                if(resultMsg.result.winplace.indexOf(item.idx) == -1){
                    let itemchips = area_scp.getAreaChips(item.idx)
                    for(let j = 0; j < itemchips.length; j++){
                        losechips.push(itemchips[j])
                    }
                }
            }
            let chipCon = cc.find("node_total",this.node)
            for(let i = 0; i < losechips.length; i++){
                let item = losechips[i]

                let toOffSet = cc.v2(0,0)
                area_scp.moveChip(item.chipNode,item.chipNode,chipCon,(obj)=>{
                    obj.active = false
                },false,toOffSet)

            }

            this.scheduleOnce(()=>{
                let nWinArean = resultMsg.result.winplace.length
                let nPer = Math.ceil(losechips.length/nWinArean)
                for(let i = 0; i < nWinArean; i++){
                    for(let j = 0; j < nPer; j++){
                        let item = losechips[i*nPer+j]
                        if(item){
                            let winNode = area_scp.getBetAreaNode(resultMsg.result.winplace[i])
                            item.chipNode.active = true
                            area_scp.moveChip(item.chipNode,item.chipNode,winNode,null,false)
                        }
                        else{
                            cc.log("1")
                        }
                        

                    }
                }

                this.scheduleOnce(()=>{
                    this._flyTableChips(resultMsg)
                    this.updateRecords()
                },0.7)
            },1)

            
            res()
        })
    },

    updateRecords:function(){
        let record_node = cc.find("node_trend",this.node)
        record_node.getComponent("Roulette36_Trend").showRecord(true)
    },

    _showBigResult:function(bShow,val){
        let node_big = cc.find("result_big",this.node)
        if(bShow){
            let node_ball = cc.find("ball",node_big)
            //球数字
            Global.setLabelString("val",node_ball,val)
            //球底板
            let key 
            if(val == 0){
                key = "end_lingbg"
            }
            else{
                let color = cc.vv.gameData._getBallColor(val)
                key = (color ==1)?"end_heibg":"end_hongbg"
            }
                
            
            
            
            let atlas = cc.vv.gameData.getAtlas(0)
            if(atlas){
                node_ball.getComponent(cc.Sprite).spriteFrame = atlas.getSpriteFrame(key)
            }
            let angle = cc.vv.gameData.getPanAngle(val)
            let pan = cc.find("mask/pan",node_big)
            pan.angle = angle
            node_big.active = true
            node_big.x = -700
            cc.tween(node_big)
            .to(0.2,{x:-310})
            .start()
        }
        else{
            node_big.active = false
        }
        
    },

    showTotalBet:function(){
        let node_total = cc.find("node_total",this.node)
        let total_val = cc.vv.gameData.getTotalBetCount()
        Global.setLabelString("val",node_total,Global.FormatNumToComma(total_val))
    },

    playOtherBet:function(msg){
        this._super(msg)
        this.showTotalBet()
    },

    getRetimerNode:function(){
        return cc.find("Bg/node_retimer",this.node)
    },

    // update (dt) {},
});
