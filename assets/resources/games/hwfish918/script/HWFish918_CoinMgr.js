
cc.Class({
    extends: cc.Component,

    properties: {
        _coinPref: null,
        _textPref: null,
        _boomPref: null,
        _coinPool: null,
        _textPool: null,
        _boomPool: null,
        _rot: 0,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this._coinLayer = cc.find("coin_layer", this.node);
        this._effectLayer = cc.find("effect_layer", this.node);
        this._textLayer = cc.find("text_layer", this.node);

        this._coinPool = new cc.NodePool();
        this._textPool = new cc.NodePool();
        this._boomPool = new cc.NodePool();

        Global.registerEvent("show_coin", this.onShowCoin, this);
    },

    onDestroy() {
        this._coinPool.clear();
        this._textPool.clear();
        this._boomPool.clear();
    },

    init(goldPref, goldTextPref, boomPref) {
        this._coinPref = goldPref;
        for(let i=0; i<50; i++) {
            let inst = cc.instantiate(this._coinPref);
            this._coinPool.put(inst);
        }

        this._textPref = goldTextPref;
        for(let i=0; i<20; i++) {
            let inst = cc.instantiate(this._textPref);
            this._textPool.put(inst);
        }
	
        this._boomPref = boomPref;
    },

    setRot(rot) {
        this._rot = rot;
    },

    createCoin() {
        let coin = null;
        if (this._coinPool.size() > 0) {
            coin = this._coinPool.get();
        } else {
            coin = cc.instantiate(this._coinPref);
        }
        return coin;
    },

    createText() {
        let text = null;
        if (this._textPool.size() > 0) {
            text = this._textPool.get();
        } else {
            text = cc.instantiate(this._textPref);
        }
        return text;
    },

    createBoom() {
        let boom = null;
        if (this._boomPool.size() > 0) {
            boom = this._boomPool.get();
        } else {
            boom = cc.instantiate(this._boomPref);
        }
        return boom; 
    },

    getCoinCount(tp) {
        if (tp <= 2) {
            return 1;
        } else if (tp <= 4) {
            return 2;
        } else if (tp <= 6) {
            return 3;
        } else if (tp <= 9) {
            return 4;
        } else if (tp <= 12) {
            return 5;
        } else if (tp <= 15) {
            return 6;
        } else if (tp <= 18) {
            return 7;
        }
        return 8;
    },

    onShowCoin(data) {
        let d = data.detail;
        this.showCoin(d.num, d.tp, d.startpos, d.endpos);
    },

    showCoin(num, tp, startpos, endpos) {
        if (num <= 0) return;
        //金币飞行
        if (tp < 20) {
            let t = startpos.sub(endpos).mag()/1400;
            t = Math.max(0.4, t);

            let coinPool = this._coinPool;
            let cnt = this.getCoinCount(tp);
            for (let i=0; i < cnt; i++) {
                let coin = this.createCoin();
                coin.setPosition(cc.v2(startpos.x + (i-(cnt-1)/2)*(20+Math.random()*8), startpos.y+Math.random()*40));
                this._coinLayer.addChild(coin);
                coin.runAction(cc.sequence(cc.delayTime(0.8+0.1*i), cc.moveTo(t, cc.v2(endpos.x+Global.random1To1()*20, endpos.y+(Math.random()-0.5)*40)), cc.callFunc((sender)=>{
                    coinPool.put(sender);
                })));
            }
            Global.playFishEffect("goldsmallfish");
        }else if (tp<=24 || tp==30) {    //boss和海王 显示金币爆炸
            let boomPool = this._boomPool;
            let boom = this.createBoom();
            boom.setPosition(startpos);
            this._coinLayer.addChild(boom);
            boom.getComponent(cc.ParticleSystem).resetSystem();
            boom.runAction(cc.sequence(cc.delayTime(2), cc.callFunc((sender)=>{
                boomPool.put(sender);
            })));
            Global.playFishEffect("baozha");
        }

        //文字信息
        let textPool = this._textPool;
        let text = this.createText();
        text.setPosition(startpos);
        text.angle = -this._rot;
        text.getComponent(cc.Label).string = cc.vv.gameData.formatNumber(num);
        this._textLayer.addChild(text);
        let mb = cc.v2(48, 36);
        if (this._rot!=0)
            mb.negSelf();
        text.runAction(cc.sequence(cc.moveBy(1, mb), cc.callFunc((sender)=>{
            textPool.put(sender);
        })));        
    },

});
