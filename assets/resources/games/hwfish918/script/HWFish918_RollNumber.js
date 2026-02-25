
cc.Class({
    extends: cc.Component,

    properties: {
        _lblScore: null,
        _score: 0,
        _effect: false,
        _phase: 0,
        _phaseScore: 0,
        _phaseCount: 0,
        _curScore: 0,
        _delayTime: 0,
        _rollStart: false,
        _over: true,
        _delegate: null,
        _param: null,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        this._lblScore = this.node.getComponent(cc.Label);
    },

    show(delegate, score, effect, param) {
        this._lblScore.string = "";
        this._delegate = delegate;
        this._score = Math.floor(score);
        this._effect = effect || false;
        this._param = param;
        this._phase = 1;
        this._phaseCount = this._score;
        this._phaseScore = 1;
        while (this._phaseCount >= 10) {
            this._phaseCount = Math.floor(this._phaseCount/10);
            this._phaseScore = this._phaseScore * 10;
        }
        this._curScore = 0;
        this._deltaScore = this._phaseScore/19;

        this._over = false;
        this._rollStart = true;
    },

    update(dt) {
        if (this._over) return;

        // 等待
        if (this._delayTime > 0) {
            this._delayTime -= dt;
            return
        }

        //结束
        if (this._phase > this._phaseCount+1) {
            if (this._delegate) {
                this._delegate.onRollOver(this._param);
            }
            this._over = true;
            return;
        }

        if (this._curScore >= this._phase * this._phaseScore) {
            //阶段+1
            Global.stopFishEffect("BOSSGetScoreAdd");
            if (this._effect) Global.playFishEffect("BossAddScore"+this._phase);
            this._lblScore.string = ""+Math.floor(this._phase * this._phaseScore);
            this._delayTime = 0.4;
            this._phase += 1;
            this._rollStart = true;
        } else {
            //当前阶段
            if (this._rollStart) {
                this._rollStart = false;
                Global.playFishEffect("BOSSGetScoreAdd");
            }
            this._curScore += this._deltaScore;
            this._lblScore.string = ""+Math.floor(this._curScore);

            if (this._curScore >= this._score) {
                Global.stopFishEffect("BOSSGetScoreAdd");
                if (this._effect && this._phase<10) Global.playFishEffect("BossAddScore"+this._phase);
                this._lblScore.string = ""+this._score;
                this._delayTime = Math.max(0.6, 3-this._phaseCount*1.1);
                this._phase += 1;
            }
        }

    },
});
