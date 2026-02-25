// 转盘
cc.Class({
    extends: cc.Component,

    properties: {

    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start () {

    },

    Init(){
        this._node_wheel = cc.find("safe_node/node_wheel", this.node);
        this._node_wheel.active = false;


    },

    ReconnectNet(){
        if(this._sendMsg){// 发了51消息，但没返回
            this.enterWheel(true);
        }
    },

    enterWheel(bReconnect){
        return new Promise(async (success, failed)=> {
            if(!bReconnect){
                this._wheelSucc = success;
            }

            this._node_wheel.active = true;
            cc.find("wheel/map_wheel",this._node_wheel).angle = 0;
            cc.find("wheel/win", this._node_wheel).active = false;

            let wheelItems = cc.vv.gameData.getProgressData().wheelItems;
            for (let i = 0; i < wheelItems.length; i++){
                cc.find("wheel/map_wheel/item"+(wheelItems[i].id), this._node_wheel).getComponent(cc.Label).string = Global.formatNumShort(wheelItems[i].coin,0);
            }

            cc.find("wheel/win", this._node_wheel).active = false;

            let btn = cc.find("wheel/btn", this._node_wheel);
            btn.getComponent(cc.Button).interactable = false;

            let wheel_spin = cc.find("wheel_spin", btn);
            let spin = cc.find("spin", btn);
            wheel_spin.active = false;
            spin.active = true;
            spin.getComponent(sp.Skeleton).setAnimation(0, "Spin_Loop", true);

            btn.off("click");
            btn.getComponent(cc.Button).interactable = true;
            let self = this;
            let clickFunc = async()=> {
                Global.SlotsSoundMgr.playEffect("wheelspin");
                btn.getComponent(cc.Button).interactable = false;
                spin.getComponent(sp.Skeleton).setAnimation(0, "Spin_Intro", false);
                spin.getComponent(sp.Skeleton).setCompleteListener(()=>{
                    spin.getComponent(sp.Skeleton).setCompleteListener();
                    spin.active = false;
                    wheel_spin.active = true;
                });

                await cc.vv.gameData.awaitTime(0.3);
                this._sendMsg = true;
                let reqdata = {rtype:3};
                let msg = await cc.vv.gameData.reqSubGame(reqdata);
                if(msg){
                    this._sendMsg = false;
                }
                if(msg.code === 200 && !msg.spcode && msg.data.rtype == 3){

                    cc.vv.gameData.setCollectGame(msg.data.collectGame);
                    await self.spinWheel(msg.data.id);
                    await cc.vv.gameData.getPopupScript().playWinPanel(msg.data.coin);

                    let totalWin = cc.vv.gameData.GetBottomScript().getCurrentWin() + msg.data.coin;
                    cc.vv.gameData.setWheelWin(totalWin);
                    cc.vv.gameData.GetBottomScript().SetWin(totalWin);
                    if(!cc.vv.gameData.isFreeGame()){
                        cc.vv.gameData.AddCoin(msg.data.coin);
                    }

                    self._node_wheel.active = false;
                    await cc.vv.gameData.getMapScript().enterGame(true,msg.data);
                }

                if(bReconnect){
                    success();
                }
                this._wheelSucc();
            };
            cc.vv.gameData.checkAutoPlay(btn, clickFunc);
            btn.on("click", async()=> {
                btn.stopAllActions();
                clickFunc();
            })
        });
    },

    spinWheel(result){
        return new Promise(async (success,failed)=>{

            Global.SlotsSoundMgr.playEffect("wheel");
            let wheel = cc.find("wheel/map_wheel",this._node_wheel);
            let sAng = cc.find("wheel/map_wheel/item"+(result), this._node_wheel).angle;

            let rusltAngle = sAng + 360*5;

            cc.tween(wheel)
                .to(6,{angle:-rusltAngle-20},{easing:"quadInOut"})
                .to(0.7,{angle:-rusltAngle},{easing:"quadIn"})
                .start();

            await cc.vv.gameData.awaitTime(6.7);
            Global.SlotsSoundMgr.playEffect("wheelstop");
            let win = cc.find("wheel/win", this._node_wheel);
            win.active = true;
            win.getComponent(sp.Skeleton).setAnimation(0, "XuanZhong", true);

            await cc.vv.gameData.awaitTime(2);
            success();
        })
    },


    // update (dt) {},
});
