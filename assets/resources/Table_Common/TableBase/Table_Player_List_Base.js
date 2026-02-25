/**
 * 桌上玩家
 */
cc.Class({
    extends: cc.Component,

    properties: {
       PLAYER_NUM:6,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.init()

        Global.registerEvent("Table_Player_Change",this.onEventPlayerChange,this)
        
    },

    start () {

    },

    init:function(){
        
        this._showTablePlayers()
    },

    _showTablePlayers:function(uid){
        let players = cc.vv.gameData.getTablePlayers()
        for(let i = 0; i < this.PLAYER_NUM; i++){
            let itemData = players[i]
            let seatId = i+1
            let itemNode = cc.find("player"+(i+1),this.node)
            itemNode.active = itemData?true:false
            if(itemData){
                if(uid ){//如果有指定刷新玩家
                    if(uid == itemData.uid){
                        itemNode.getComponent("Table_Player_Base").init(itemData,seatId,true)
                    }
                }
                else{
                    itemNode.getComponent("Table_Player_Base").init(itemData,seatId,true)
                }
                
            }
            
        }
    },

    //获取玩家节点
    getPlayerNode:function(uid){
        let res
        for(let i = 0; i < this.PLAYER_NUM; i++){
            let itemNode = cc.find("player"+(i+1),this.node)
            let scp = itemNode.getComponent("Table_Player_Base")
            if(uid == scp.getPlayerUid()){
                res = itemNode
            }
        }
        return res
    },

    //
    onEventPlayerChange:function(data){
        let uid = data.detail
        this._showTablePlayers(uid)

    }

    // update (dt) {},
});
