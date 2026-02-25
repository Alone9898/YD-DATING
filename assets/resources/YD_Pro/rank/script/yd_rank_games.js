/**
 * 游戏榜-游戏列表
 */
cc.Class({
    extends: cc.Component,

    properties: {
        listView:require('List'),
        _listdata:null,
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start () {
        this._listdata = cc.vv.UserManager.getLepGames() || []
        this.listView.numItems = this._listdata.length
    },

    onListRender(item, idx){
        let data = this._listdata[idx]
        if(data){
            item.active = true
            item.getComponent("yd_rank_gamesitem").updateView(data);
        }
        else{
            item.active = false
        }
    }

    // update (dt) {},
});
