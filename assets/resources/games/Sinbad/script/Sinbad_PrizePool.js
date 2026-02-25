
cc.Class({
    extends: require("LMSlots_PrizePool_Base"),

    properties: {

    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    // start () {
    //
    // },

    InItPoolList(){
        this._super();

        for(let i = 0; i < this._poolList.length; i++) {
            let item = this._poolList[i].node
            cc.find("JP_Kuang", item).active = false;
        }
    },

    showJPKuang(jpId){
        for (let i = 0; i < this._poolList.length; i++){
            let poolType = this._poolList[i].GetPoolType();
            cc.find("JP_Kuang", this._poolList[i].node).active = jpId == poolType;
        }
    },


    // update (dt) {},
});
