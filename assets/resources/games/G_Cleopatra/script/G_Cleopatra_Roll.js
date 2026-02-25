
cc.Class({
    extends: cc.Component,

    properties: {
        items:[cc.Node],
        //图片的移动速度
        _moveSpeed:36,
        //选中item位置
        _choicItem:null,
    },

    onLoad () {
         //父节点的宽度
        this._initPosX = this.items[this.items.length-1].position.x+196;
        this._parentWidth = cc.find('rollView/view/content',this.node).width;
    },

    //开始移动 这里类型不统一(移动前增加动画播放)
    startMove(gamedata){
        let spineani = cc.find('choiceFrame/framespine',this.node);
        cc.vv.gameData.playSpine(spineani,'animation',false,()=>{
            spineani.active = false;
            this.resetData();
            this.initUpdateCoin();
            this._subGameData = gamedata;
            if(this._subGameData.rtype&&this._subGameData.rtype == 4){
                this._stopItemName = 'img'+gamedata.idx;
            }else{
                this._stopItemName = 'img'+gamedata.type;
            }
            Global.playHSEffect('wheel_spin');
        });
    },

    //复位数据
    resetData(){
        this._stopItemName = undefined;
        this._moveSpeed = 28;
        this._curMoveTimes = 0;
        this._moveTimes = 4;
        this._startStop = false;
    },

    //移动结束
    moveEnd(){
        AppLog.log('###停止移动');
        this.resetData();
        //开始免费游戏
        let spineani = cc.find('choiceFrame/framespine',this.node);
        cc.vv.gameData.playSpine(spineani,'animation',false,()=>{
            spineani.active = false;
            //Global.playHSEffect('dialog_jackpot_collect');
            cc.vv.gameData.GetFreeGameScript().rollEndHandle(this._subGameData);
        });
        Global.playHSEffect('wheel_win');
        //展示jackpot中奖
        this.playJackpot();
    },

    //初始化刷新money
    initUpdateCoin(){
        let wheel = cc.vv.gameData.getWheel();
        let index = 0;
        for(let key in wheel){
            if(wheel[key].coin){
                let lblnum = cc.find('lbl_num',this.items[index]);
                if(lblnum){
                    lblnum.getComponent(cc.Label).string = Global.convertNumToShort(wheel[key].coin);
                }
            }
            index++;
        }
    },

    //播放jackpot特效
    playJackpot(){
        if(this._subGameData.result){
            let type = this._subGameData.result.type;
            let jacknode = undefined;
            if(type == 1){
                jacknode = cc.find('Canvas/safe_node/LMSlots_PrizePool/prizePool_Mini/rewardspine');
            }else if(type == 2){
                jacknode = cc.find('Canvas/safe_node/LMSlots_PrizePool/prizePool_Minor/rewardspine');
            }else if(type == 3){
                 jacknode = cc.find('Canvas/safe_node/LMSlots_PrizePool/prizePool_Major/rewardspine');
            }else if(type == 4){
                 jacknode = cc.find('Canvas/safe_node/LMSlots_PrizePool/prizePool_Mega/rewardspine');
            }else if(type == 5){
                jacknode = cc.find('Canvas/safe_node/LMSlots_PrizePool/prizePool_Grand/rewardspine');
            }
            if(jacknode){
                cc.vv.gameData.playSpine(jacknode,'animation1',false,()=>{
                    cc.vv.gameData.playSpine(jacknode,'animation2',true);
                });
            }
        }
    },

    update (dt) {
        if(!this._stopItemName)
            return;
        this.items.forEach(item => {
            if(item.x > this._initPosX){
                item.x = item.x-this._parentWidth;
                if(this._stopItemName == item.name){
                    this._curMoveTimes ++;
                    if(this._curMoveTimes > this._moveTimes){
                        this._startStop = true;
                        this._choicItem = item;
                    }
                }
            }
            item.x += this._moveSpeed;
        });

        if(this._startStop){
            if(this._choicItem.x > -1){
                this.moveEnd();
            }else{
                this._moveSpeed = dt*this._parentWidth/4;
            }
        }
  },
});
