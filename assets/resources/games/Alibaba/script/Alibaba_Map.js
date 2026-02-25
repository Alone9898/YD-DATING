/**
 * @author Cui Guoyang
 * @date 2021/9/29
 * @description
 */

cc.Class({
    extends: cc.Component,
    properties: {
        role: cc.Node,
        points: [cc.Node],
        map: cc.Node,
        start_node: cc.Node,
        btn_back: cc.Node,
        wheel: cc.Node,
    },

    initMap(mapInfo) {
        this.node.active = true;
        let cfg = cc.vv.gameData.getGameCfg();

        // 基础
        for (let i = 0; i < cfg.mapCfg.length; i++) {
            let pointCfg = cfg.mapCfg[i];
            let point = this.points[i];

            if (!cfg.bigPoint.includes((i + 1))) {
                point.active = i >= mapInfo.currId;
            } else {
                let glow = point.getChildByName("map_glow");
                glow.active = i >= mapInfo.currId;
            }
        }

        let startPoint = mapInfo.currId <= 0 ? this.start_node : this.points[mapInfo.currId - 1];
        this.role.active = true;
        this.role.position = startPoint.position;
        this.role.y -= 15;
        this.role.angle = mapInfo.currId <= 0 ? 0 : cfg.mapCfg[mapInfo.currId - 1].car_rotation;
        this.role.scaleX = mapInfo.currId <= 0 ? 0.7 : cfg.mapCfg[mapInfo.currId - 1].direction * 0.7;
    },

    openMap(showBtn) {
        Global.SlotsSoundMgr.stopBgm();
        Global.SlotsSoundMgr.playBgm("map");
        this.node.active = true;

        if (showBtn) {
            this.btn_back.active = true;

            this.btn_back.on("click", ()=>{
                this.btn_back.off("click");

                cc.vv.gameData.GetSlotsScript().CanDoNextRound();
                this.node.active = false;
                Global.SlotsSoundMgr.stopBgm();
                Global.SlotsSoundMgr.playNormalBgm();
                cc.vv.gameData.GetSlotsScript()._haveOpenMap = false;
            });
        } else {
            this.btn_back.active = false;
        }
    },

    // 断网重连
    ReconnectNet(mapInfo) {

    },

    async showMap(mapInfo) {
        this.node.active = true;
        let cfg = cc.vv.gameData.getGameCfg();
        this.initMap(mapInfo);

        let pointCfg = cfg.mapCfg[mapInfo.currId - 1];
        let point = this.points[mapInfo.currId - 1];

        this.openMap(false);
        
        let startPoint = mapInfo.currId - 1 <= 0 ? this.start_node : this.points[mapInfo.currId - 2];
        let endPoint = this.points[mapInfo.currId - 1];
        this.role.active = true;
        this.role.position = startPoint.position;
        this.role.angle = mapInfo.currId - 1 <= 0 ? 0 : cfg.mapCfg[mapInfo.currId - 2].car_rotation;
        this.role.scaleX = mapInfo.currId - 1 <= 0 ? 0.7 : cfg.mapCfg[mapInfo.currId - 2].direction * 0.7;
        
        let endAngle = cfg.mapCfg[mapInfo.currId - 1].car_rotation;
        let endDirection = cfg.mapCfg[mapInfo.currId - 1].direction * 0.7;
        if (this.role.angle === 0 && endAngle !== 0) {
            this.role.angle = endAngle;
        }

        Global.SlotsSoundMgr.playEffect("levelup");
        cc.tween(this.role)
            .to(0.5, {x:endPoint.x, y:(endPoint.y - 15)})
            .call(()=>{
                this.role.scaleX = endDirection;
                if (!cfg.bigPoint.includes(mapInfo.currId)) {
                    endPoint.active = false;
                } else {
                    Global.SlotsSoundMgr.playEffect("fireworks");
                }
            })
            .start();

        let endPointCfg = cfg.mapCfg[mapInfo.currId - 1];
        if (!cfg.bigPoint.includes(mapInfo.currId)) {
            await cc.vv.gameData.awaitTime(0.8);
            Global.SlotsSoundMgr.stopBgm();
            Global.SlotsSoundMgr.playBgm("wheelbg");
            // 进转盘
            let wheelScript = this.wheel.getComponent("Alibaba_Wheel");
            await wheelScript.startWheel(mapInfo);

            Global.SlotsSoundMgr.playEffect("end");
            await cc.vv.gameData.GetSlotsScript().popFreeResultDialog(wheelScript.getWinCoin());

            this.wheel.active = false;
            this.node.active = false;
            Global.SlotsSoundMgr.stopBgm();
            Global.SlotsSoundMgr.playNormalBgm();
        } else {
            await cc.vv.gameData.awaitTime(0.5);

            await cc.vv.gameData.GetSlotsScript().popMapEnterDialog(mapInfo);
            this.node.active = false;

            await cc.vv.gameData.awaitTime(0.5);
        }
    },
});