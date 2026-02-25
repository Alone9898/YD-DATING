/**
 * 掉落金币
 */
cc.Class({
    extends: cc.Component,

    properties: {
        coin_prefab:cc.Prefab,
        autoPlay:false,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this._coinPool = new cc.NodePool();

    },

    start () {
        if(this.autoPlay){
            this.setPlay()
        }
    },

    //开始播放
    //nNum 越小越少
    //startWidth 出生的时候随机x偏移范围
    //endWidth 结束点x偏移最大宽度
    //endHeight 结束y偏移最大高度
    setPlay(nNum=30,startWidth = 100,endWidth=600,endHeight){
        this._totalNum = nNum
        this._endWidth = endWidth
        this._startWidth = startWidth
        this._maxHeight = cc.winSize.height
        if(endHeight){
            this._maxHeight = endHeight
        }
        this.node.active = true
        this._bPlay = true
        this._frameTime = 0
    },

    stopPlay(){
        this.node.active = false
        this._bPlay = false
        this._coinPool.clear();
    },

    onDestroy() {
        this._coinPool.clear();
    },

    _generate() {
        if (!this._bPlay) {
            return;
        }

        let pool = this._coinPool;
        let coin = null;
        if (pool.size() > 0) {
            coin = pool.get();
        } else {
            coin = cc.instantiate(this.coin_prefab);
        }
        this.node.addChild(coin);

        let size = cc.winSize;
        let ranVal = Math.random()
        let dir = -1
        if ( ranVal >= 0.5) { 
            dir = 1;
        }
        coin.scale = ranVal

        let startPos = cc.v2(Math.random()*this._startWidth*dir, 0); 
        let endPos = cc.v2(Math.random()*this._endWidth*dir, -this._maxHeight/2);
        coin.setPosition(startPos);

        let height = (0.2 + Math.random()*0.4)*this._maxHeight;
        let duraution = 1 + Math.random();
        // let sp = coin.getComponent(sp.Skeleton)
        // sp.setAnimation(0,'animation',true)

        coin.stopAllActions();
        coin.runAction(cc.sequence(cc.spawn(cc.scaleTo(duraution,1),cc.jumpTo(duraution, endPos, height, 1)), cc.callFunc((sender)=>{
            pool.put(sender);
        })));
    },

    update (dt) {
        
        this._frameTime += dt;
        if (this._frameTime > 1/this._totalNum) {   //控制数量
            this._frameTime = 0;
            this._generate();
        }
    },
});
