/**
 * 桌上玩家管理
 */
cc.Class({
    extends: require("Table_Player_List_Base"),

    properties: {
       
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start () {
        
    },

    // init:function(){
        
    //     this._super()
    //     this._showMyInfo()
    // },


     //
    //  _showMyInfo(){
    //     let myInfo = cc.vv.gameData.getMyInfo()
    //     let node = cc.find("player0",this.node)
    //     let itemData = {coin:myInfo.coin,playername:cc.vv.UserManager.nickName,uid:cc.vv.UserManager.uid}
    //     itemData.usericon =  cc.vv.UserManager.userIcon
    //     itemData.avatarFrame = cc.vv.UserManager.avatarframe
    //     node.getComponent("Table_Player_Base").init(itemData)
    // },

    getPlayByUid:function(uid){
        let players = cc.vv.gameData.getTablePlayers()
        for(let i = 0; i < players.length; i++){
            let item = players[i]
            if(item.uid == uid){
                return item
            }
        }
    },
    //获取玩家节点
    getPlayerNode:function(uid){
        let res
        for(let i = 0; i < this.PLAYER_NUM; i++){
            let itemNode = cc.find("player"+(i),this.node)
            let scp = itemNode.getComponent("Table_Player_Base")
            if(uid == scp.getPlayerUid()){
                res = itemNode
            }
        }
        return res
    },
    
    // //根据服务器座位号获取玩家信息
    // getPlayByServiceSeat:function(servSeat){
    //     let players = cc.vv.gameData.getTablePlayers()
    //     for(let i = 0; i < players.length; i++ ){
    //         let item = players[i]
    //         if(item.seatid == servSeat){
    //             return item
    //         }
    //     }
    // },

    //客户端自己显示的座位号
    //seatid:显示的座位号：0开始，0表示自己
    _getPlayerByShowSeat:function(seatId){
        let myUid = cc.vv.UserManager.uid
        let myInfo = this.getPlayByUid(myUid)
        if(!myInfo){
            return
        }
        let mySeat = myInfo.seatid
        let players = cc.vv.gameData.getTablePlayers()
        for(let i = 0; i < players.length; i++ ){
            let info = players[i]
            if(info.seatid >= mySeat){
                info.showSeat = info.seatid - mySeat
            }
            else{
                info.showSeat = this.PLAYER_NUM - (mySeat - info.seatid)
            }
            if(info.showSeat == seatId){
                return info
            }
        } 
    },

    //根据玩家本地座位号获取玩家节点
    getPlayerNodeByShowSeat:function(showSeat){
        let node = cc.find("player"+showSeat,this.node)
        return node
    },

    //根据玩家uid获取玩家节点
    getPlayerNodeByUid:function(uid){
        let pInfo = this.getPlayByUid(uid)
        if(pInfo){
            return this.getPlayerNodeByShowSeat(pInfo.showSeat)  
        }
        else{
            cc.log("未找到玩家")
        }
        
    },

    //curActive:不隐藏当前活动的，如果设置了的话
    hideAllPlayerRetime:function(curActive){
        for(let i = 0; i < this.PLAYER_NUM; i++){
            // let info = this._getPlayerByShowSeat(i)
            let node = cc.find("player"+i,this.node)
            let scp = node.getComponent("Rummy_Player")
            let info = scp.getPlayerInfo()

            if(info && curActive && info.seatid == curActive){

            }
            else{
                scp._showRetimer(false)
            }
            
        }
    },

    hideAllPlayerDealer:function(){
        for(let i = 0; i < this.PLAYER_NUM; i++){
            // let info = this._getPlayerByShowSeat(i)
            let node = cc.find("player"+i,this.node)
            node.getComponent("Rummy_Player").showZhuangIcon(false)
            node.getComponent("Rummy_Player").showWinner(false)
        }
    },


    clearTablePlayers:function(){
        for(let i = 0; i < this.PLAYER_NUM; i++){
            
            let node = cc.find("player"+i,this.node)
            node.active = false
            
            
            
        }
    },



    _showTablePlayers:function(bDelay){
        
        for(let i = 0; i < this.PLAYER_NUM; i++){
            let info = this._getPlayerByShowSeat(i)
            let node = cc.find("player"+i,this.node)
            node.active = info?true:false
            
            if(info){
                node.getComponent("Rummy_Player").init(info,null,bDelay)
            }
            
        }
    },

    onEventPlayerChange:function(data){
        let uid = data.detail
        for(let i = 0; i < this.PLAYER_NUM; i++){
            let info = this._getPlayerByShowSeat(i)
            let node = cc.find("player"+i,this.node)
            node.active = info?true:false
            
            if(info && info.uid == uid){
                node.getComponent("Rummy_Player").init(info)
            }
            
        }

    }

    // update (dt) {},
});
