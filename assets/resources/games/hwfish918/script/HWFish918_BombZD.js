//连环炸弹爆炸效果
cc.Class({
    extends: cc.Component,

    properties: {
        particle1: cc.ParticleSystem,
        particle2: cc.ParticleSystem,
        lblCount: cc.Label,
        _index: 1,
        _seat: 1,
        _count: 1,
    },


    // LIFE-CYCLE CALLBACKS:

    onLoad () {

    },

    init(data) {
        this._seat = data.seat;
        this._count = Math.min(9, data.count);
        this._index = 1;
        this.lblCount.string = "1";
        this.node.position = data.pos;
    },

    step() {
        this._index += 1;
        this.lblCount.string = ""+this._index;
        this.particle1.resetSystem();
        this.particle2.resetSystem();

        Global.playFishEffect("baozha");
    },

    start() {
        let w = cc.winSize.width * 0.9;
        let h = cc.winSize.height * 0.9;
        let poses = [];
        for (let i=-1; i<=1; i+=1) {
            for (let j=-1; j<=1; j+=1) {
                poses.push(cc.v2(w*i/3, h*j/3));
            }
        }
        let indexs = [0,1,2,3,4,5,6,7,8];
        for (let i=0; i<9; i++) {
            let r = Global.random(1, 8);
            let tmp = indexs[0];
            indexs[0] = indexs[r];
            indexs[r] = tmp;
        }

        let actions = [];
        let spacex = w/5;
        let spacey = h/5;
        for (let i=0; i<this._count; i++) {
            let p = poses[indexs[i]];
            p.x += (Global.random(0, spacex) - spacex/2);
            p.y += (Global.random(0, spacey) - spacey/2);

            actions.push(cc.moveTo(0.5, p));
            actions.push(cc.callFunc(this.step.bind(this)));
            actions.push(cc.delayTime(0.3));
        }
        actions.push(cc.fadeOut(0.2));
        actions.push(cc.callFunc((sender)=>{sender.destroy();}));

        this.node.runAction(cc.sequence(actions));
    },
});
