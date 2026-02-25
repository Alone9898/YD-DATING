// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html
let GAME_ID = require("GameIdMgr");
let GameItemCfg = require("GameItemCfg");
cc.Class({
    extends: cc.Component,

    properties: {
        // foo: {
        //     // ATTRIBUTES:
        //     default: null,        // The default value will be used only when the component attaching
        //                           // to a node for the first time
        //     type: cc.SpriteFrame, // optional, default is typeof default0
        //     serializable: true,   // optional, default is true
        // },
        // bar: {
        //     get () {
        //         return this._bar;
        //     },
        //     set (value) {
        //         this._bar = value;
        //     }
        // },
        _jackpotNum: 0,
        _delayTime: 0,
        jackpotLabel: { // 奖池整数
            default: null,
            type: cc.Label,
        },
        jMult:{
            default:1,
            tooltip:'jackpt默认显示比例'
        },
        bAddModel:{
            default:true,
            tooltip:'是否是累加模式，默认累加模式。不勾选则是随机模式'
        },
        nItervMul:{
            default:1,
            tooltip:'更新的间隔缩放倍率。>1表示更新变慢，<1表示更新变快'
        },
        _gameId: -1,
        _addRandNum: 0,
        _needPause: false,
        _stepSpeed: 0,
        _mult:1,            // 比列
        _showTime:0,    //累计显示时间s

    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {

        //先取编辑器里的显示比例
        this._mult = this.jMult
        this._showTime = 0
        if(this._gameId == -1){
            this._gameId = cc.vv.AppData.getGameId();
        }
        
        this._jackpotNum = cc.vv.AppData.getGameJackpot(this._gameId);
        // if (this._gameId > 0) {
        //     if(cc.vv.SlotGameCfg[this._gameId].cfgCmp){
        //         let cfg = require(cc.vv.SlotGameCfg[this._gameId].cfgCmp);
        //         if(cfg) this._mult = cfg.mult?cfg.mult:1;
        //     }
            
        // }
        if(cc.vv.gameData && this._gameId > 0 && Global.appId === Global.APPID.BigBang){
            let fnt = cc.vv.gameData.resMgr.getJackPotFnt();
            this.jackpotLabel.font = fnt;
            this.jackpotLabel.lineHeight = 60;
            this.jackpotLabel.fontSize = 14;
            this.jackpotLabel.node.color = cc.Color.WHITE;
        }
        // else if(Global.appId === Global.APPID.Poly){
        //     this.jackpotLabel.fontSize = 12;
        // }

        cc.vv.NetManager.registerMsg(MsgId.JACKPOT_GAME, this.onRecvJackPotGame, this);
        this.updateJackPot();
    },

    start() {

    },

    // 只有大厅需要调用
    init(gameId, num) {
        this._jackpotNum = num;
        this._gameId = gameId;
        this.updateJackPot();
    },


    onRecvJackPotGame(msg) {
        if (msg.code === 200) {
            let gameJackpotList = msg.gameJackpotList;
            for (let i = 0; i < gameJackpotList.length; ++i) {
                if (gameJackpotList[i].gameid === this._gameId) {
                    this._jackpotNum = gameJackpotList[i][2];
                    break;
                }
            }
        }
    },


    update(dt) {
        if (this._jackpotNum > 0 ) {

            if (cc.vv.AppData.getIsInGame()) {
                this._delayTime += dt;
                let bBigBang = Global.appId == Global.APPID.BigBang? true:false

                if(this.bAddModel){
                    let nIterv = bBigBang?0.1:0.01
                    //累加模式:每0.1s加0-1的随机浮点，每30min减少100-500
                    if(this._mult == 100){
                        nIterv = 0.01
                    }
                    //高速一段时间，又变成低速加
                    let nMin = this._showTime*nIterv/60
                    let slowBegin = bBigBang?15:20
                    let slowEnd = bBigBang?25:27
                    if( nMin > slowBegin && nMin < slowEnd){
                        nIterv = 0.1
                    }
                    nIterv *= this.nItervMul
                    let baseNum = bBigBang? 1:1
                    if(this._delayTime >= nIterv){
                        //按分0.01的幅度来加
                        this._jackpotNum += (Global.random(1,5)/100) * baseNum
                        this.updateJackPot();
                        this._delayTime = 0;
                        this._showTime += nIterv
                    }
                    if(this._showTime*nIterv/60 > 30){
                        this._jackpotNum -= Global.random(100,500)
                        this.updateJackPot();
                        this._showTime = 0
                    }
                }
                else{
                    if (this._delayTime >= 1) {
                        this._delayTime = 0;
                        if(!bBigBang){
                            this._jackpotNum = 2500+Math.random()*7500;
                        }
                        else{
                            this._jackpotNum = 500+Math.random()*9500;
                        }

                        this.updateJackPot();
                    }
                }
            }
            else {
                this._delayTime += dt;
                if (this._delayTime > 5) {
                    this._delayTime = 0;
                    let num = Math.random() * 10+4;
                    this._jackpotNum += num;
                    this.updateJackPot();
                }
                else {
                    this._delayTime += dt;
                }
            }

        }

    },

    // 更新奖池
    updateJackPot() {
        if(Global.appId !== Global.APPID.BigBang && this._jackpotNum>12000) this._jackpotNum = 12000;
        let str = Global.S2P(this._jackpotNum);
        if(this._mult>1){
            str = (this._jackpotNum*this._mult).toFixed(0);
        }
        this.jackpotLabel.string = str;
        cc.vv.AppData.setGameJackpot(this._gameId, this._jackpotNum);
    },

    onDestroy() {
        cc.vv.NetManager.unregisterMsg(MsgId.JACKPOT_GAME, this.onRecvJackPotGame, false, this);
    }

});
