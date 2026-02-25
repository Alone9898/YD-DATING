

cc.Class({
    extends: require("Table_GameData_Base"),

    properties: {

    },

    addGameRecord:function(item){
        let list = {
            bp:item.bankerpoint,
            pp:item.playerpoint,
            res:item.res,
            wp:item.winplace,
        }

        this._deskInfo.records.push(list);

        // if(this._deskInfo.records.length > 48){
        //     this._deskInfo.records.splice(0,6)
        // }
    },

    // 最后一竖列满了，整体前移一列，records数组删掉前面6个
    updateRecord(){
        if(this._deskInfo.records.length > 48){
            let cnt = Math.floor(this._deskInfo.records.length/6)-7
            this._deskInfo.records.splice(0,6*cnt)
        }
        return this._deskInfo.records;
    },

    setGameRecord:function(data){
        this._deskInfo.records = data;
    }

    // update (dt) {},
});
