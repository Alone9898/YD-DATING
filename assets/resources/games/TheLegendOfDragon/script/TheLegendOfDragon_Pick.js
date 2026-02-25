/*
 * 抽卡游戏
*/
cc.Class({
    extends: cc.Component,

    properties: {
        _pick: null,
        _data: null,
        _boxes: [],
        _columns:[],
        _fanpai: null,
        _fly:null,
        _processing:false,
        _tip:null,
    },

    onLoad () {
        this._pick = cc.find("safe_node/pick_game", this.node);
        let box_bg = cc.find("box_bg", this._pick);
        let children = box_bg.children;
        let self = this;
        for (let i=1, count=children.length; i<=count; ++i) {
            let box = children[i-1];
            this._boxes[i] = box;
            box.on('click', function () {
                self.onBtnBox(box)
            } );
        }
        for (let i=1; i<=5; i++) {
            let c = cc.find("columns/c"+i, this._pick);
            this._columns[i] = c;
        }
        this._fanpai = cc.find("fanpai", this._pick);
        this._fly = cc.find("fly", this._pick);
        this._tip = cc.find("tip", this._pick);
        this._tip.opacity = 0;

        cc.vv.NetManager.registerMsg(MsgId.SLOT_SUBGAME_DATA, this.OnRecvMsgSubAction, this);
    },

    onDestroy(){
        cc.vv.NetManager.unregisterMsg(MsgId.SLOT_SUBGAME_DATA, this.OnRecvMsgSubAction, false, this);
    },

    start() {
        let pick = cc.vv.gameData.getDeskInfo().pick;
        //pickData = {state:1,
        //    progs:[1,1,2,0,3],
        //    cards:[1,1,2,2,3,3,4,4,5,5,0,0,0,0,0,0,0,0,0,0]};
        if (pick && pick.state == 1) {
            this.show(pick, 1, true);
        }
    },

    async Sleep(time) {
        return new Promise((resolve, reject) => {
            this.scheduleOnce(()=>{resolve()}, time);
        });
    },

    async show(data, delay) {
        Global.SlotsSoundMgr.playBgm("pick/pick_bgm");

        cc.vv.gameData.GetBottomScript().ShowBtnsByState("moveing_1");

        this._pick.active = true;
        this._processing = true;
        this._data = data;
        for (let i=1; i<=20; i++) {
            this.showBoxInfo(this._boxes[i], 0, false);
            this._boxes[i].getChildByName("win").active = false;
        }
        for (let i=1; i<=5; i++) {
            this.showColumnInfo(i, 0);
        }

        await this.Sleep(delay || 2);
        if (data.remove_mini) {
            Global.TheLegendOfDragon.Pop.showRemoveMini();
            await this.Sleep(1.2);
            cc.find("columns/lock", this._pick).active = true;
        } else {
            cc.find("columns/lock", this._pick).active = false;
        }

        for (let i=1; i<=20; i++) {
            let gray = (data.remove_mini && (data.cards[i-1]==1));
            this.showBoxInfo(this._boxes[i], data.cards[i-1], false, gray);
        }
        for (let i=1; i<=5; i++) {
            this.showColumnInfo(i, data.progs[i-1]);
        }

        await this.Sleep(1);
        this.showTip();
        this._processing = false;
        this.setAutoPlay();
    },

    hide() {
        if (this._pick.active == true) {
            this._pick.active = false;
        }
    },

    showTip() {
        this._tip.stopAllActions();
        this._tip.opacity = 255;
        this._tip.runAction(cc.repeatForever(cc.sequence(cc.scaleTo(0.5, 0.7), cc.scaleTo(0.5, 0.6))));
    },

    showBoxInfo(box, card, open, gray) {
        let atlas = cc.vv.gameData.GetAtlasByName("pick");
        let icon = box.getChildByName("icon");
        icon.color = gray?cc.Color.GRAY:cc.Color.WHITE;
        let names = ["theme177_pick_frame1", "theme177_pick_r_4", "theme177_pick_r_3", "theme177_pick_r_2", "theme177_pick_r_1", "theme177_pick_r_0"];
        icon.getComponent(cc.Sprite).spriteFrame = atlas.getSpriteFrame(names[card]);
        let jackpot = box.getChildByName("jackpot");
        jackpot.active = (card > 0 && !gray);
        if (card>0) {
            let anims = ["", "animation4", "animation3", "animation2", "animation1", "animation0"];
            if (!gray) {
                jackpot.getComponent(sp.Skeleton).setAnimation(0, anims[card], true);
            }
            if (open) {
                icon.opacity = 0;
                icon.runAction(cc.fadeIn(0.5));
                let wp = icon.convertToWorldSpaceAR(cc.v2(0,0));
                let np = this._pick.convertToNodeSpaceAR(wp);
                //翻牌特效
                let fanpai = cc.instantiate(this._fanpai);
                fanpai.parent = this._pick;
                fanpai.position = np;
                fanpai.active = true;
                fanpai.runAction(cc.sequence(cc.delayTime(1), cc.destroySelf()));
                //飞行特效
                let px = [280,-280,140,-140,0];
                let fly = cc.instantiate(this._fly);
                fly.parent = this._pick;
                fly.position = np;
                fly.opacity = 0;
                fly.active = true;
                fly.runAction(cc.sequence(cc.delayTime(0.5),
                    cc.fadeIn(0), 
                    cc.callFunc(()=>{
                        Global.TheLegendOfDragon.playEffect("pick/card_fly");
                    }),
                    cc.moveTo(0.5, cc.v2(px[card-1], 0)),
                    cc.delayTime(0.2),
                    cc.destroySelf())
                );
            }
        }
    },

    showColumnInfo(idx, prog) {
        let column = this._columns[idx];
        let circle = column.getChildByName("circle");
        let counts = [0, 2, 2, 3, 3, 5];
        circle.active = (prog != counts[idx]+1)
        if (prog == 0) {
            circle.y = 0;
        }
        for (let i=1; i<=counts[idx]; i++) {
            let circlex = column.getChildByName("circle"+i);
            if (i<=prog) {
                circlex.active = false;
                if (i==prog) {
                    let pos = circlex.position;
                    circle.runAction(cc.moveTo(0.5, pos));
                }
            } else {
                circlex.active = true;
            }
        }
        
        let ske = column.getChildByName("column").getComponent(sp.Skeleton);
        ske.setAnimation(0, "animation"+prog, false);
    },

    //显示中奖图标
    showWinCard(card) {
        for (let i=1; i<=20; i++) {
            if (this._data.cards[i-1] == card) {
                this._boxes[i].getChildByName("win").active = true;
            }
        }
    },

    //显示剩余图标
    showLeftCards(leftcards) {
        for (let i=1; i<=20; i++) {
            if (this._data.cards[i-1] == 0) {
                let card = leftcards.shift();
                if (card) {
                    this.showBoxInfo(this._boxes[i], card, false, true);
                    let icon = this._boxes[i].getChildByName("icon");
                    icon.scale = 0.1;
                    icon.runAction(cc.scaleTo(0.3, 1));
                }
            }
        }
    },

    setAutoPlay(){
        let list = [];
        for (let i=1; i<=20; i++){
            if (this._data.cards[i-1] == 0) {
                list.push(i);
            }
        }

        let randomIdx = Global.random(0,list.length-1)
        let self = this;
        cc.vv.gameData.checkAutoPlay(this._boxes[list[randomIdx]],  function () {
            self.onBtnBox(self._boxes[list[randomIdx]])
        });
    },

    onBtnBox(node) {
        if (this._processing) return;
        if (this._tip.opacity>0) {
            this._tip.stopAllActions();
            this._tip.runAction(cc.fadeOut(0.2));
        }
        for (let i=1; i<=20; i++) {
            this._boxes[i].stopAllActions();
            if (node == this._boxes[i]) {
                if (this._data.cards[i-1] == 0) {
                    let req = {c: MsgId.SLOT_SUBGAME_DATA,
                        gameid: cc.vv.gameData.getGameId(),
                        data: {rtype: 1,
                            idx: i,
                        }
                    };
                    cc.vv.NetManager.send(req);
                    this._processing = true;

                    Global.TheLegendOfDragon.playEffect("pick/card");
                }
            }
        }
    },
    
    async OnMsgPick(msg) {
        let idx = msg.data.idx;
        let card = msg.data.card;
        this._data.cards[idx-1] = card;
        this._data.progs[card-1] = msg.data.prog;
        this.showBoxInfo(this._boxes[idx], card, true);
        this.scheduleOnce(()=>{
            this.showColumnInfo(card, msg.data.prog);
        }, 1);
        
        if (msg.data.wincoin > 0) {     //开奖
            await this.Sleep(0.8);
            this.showWinCard(card);
            this.showLeftCards(msg.data.leftcards);
            await this.Sleep(2);
            let wincoin = msg.data.wincoin;
            cc.vv.gameData.AddCoin(wincoin);
            Global.TheLegendOfDragon.Pop.showCollectJp(card, wincoin);
        } else {
            await this.Sleep(1.5);
            // this.showTip();
            this._processing = false;
            this.setAutoPlay();
        }
    },

    OnRecvMsgSubAction(msg) {
        if (msg.code == 200 && msg.data.spcode == 0 && msg.data.rtype == 1) {//抽卡
            this.OnMsgPick(msg);
        }
    }

});
