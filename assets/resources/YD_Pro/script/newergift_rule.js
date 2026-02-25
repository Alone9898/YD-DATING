
cc.Class({
    extends: cc.Component,

    properties: {
        coinLbl: cc.Label,
        coinLbl2: cc.Label,
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start () {

    },

    init(val){
        this.coinLbl && (this.coinLbl.string = val)
        this.coinLbl2 && (this.coinLbl2.string = val)
    },

    // update (dt) {},
});
