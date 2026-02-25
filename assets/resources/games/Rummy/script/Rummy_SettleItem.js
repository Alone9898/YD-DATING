/**
 * 结算item
 */
cc.Class({
    extends: cc.Component,

    properties: {
        font_lose:cc.Font,
        font_win:cc.Font,
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start () {

    },

    init:function(p,idx){
        let playInfo = p//cc.vv.gameData.getPlayByUid(p.uid)
        
        //head
        let avter_node = cc.find("head_icon",this.node)
        if(playInfo && playInfo.usericon){
            avter_node.getComponent("UserAvatar").updataAvatar({ uid: playInfo.uid, icon: playInfo.usericon, avatarFrame: playInfo.avatarFrame });
        }
        //name
        let showName = ""
        if(playInfo){
            showName = playInfo.playername
        }
        Global.setLabelString("lbl_name",this.node,showName)
        //win/lose
        let win_flag = cc.find("flag_win",this.node)
        let lose_flag = cc.find("flag_lose",this.node)
        let spr_win = cc.find("spr_win",this.node)
        
        let val = p.wincoin
        win_flag.active = idx == 0 ? true:false
        lose_flag.active = !win_flag.active
        spr_win.active = win_flag.active

        let showScro = val
        let font_val = this.font_lose
        if(val>0){
            showScro = "+"+val
            font_val = this.font_win
        }
        Global.setLabelString("coin",this.node,showScro)
        let coin_node = cc.find("coin",this.node)
        coin_node.getComponent(cc.Label).font = font_val
        

        let point_val = p.point
        Global.setLabelString("lbl_points",this.node,"Points:"+point_val)

        this.showGroupCards(p.groupcards)

        this.playEffect(p.uid,val>0)
    },

    showGroupCards:function(groups){
        let parNode = cc.find("cards",this.node)
        let cardTemp = cc.find("poker_temp",this.node)
        let roundInfo = cc.vv.gameData.getRoundInfo()
        let wildVal = roundInfo.wildCard
        let left = 30
        let space = 35
        let duiSpace = 90
        for(let i = 0; i < groups.length; i++){
            let dui = groups[i]
            for(let j = 0; j < dui.length; j++){
                let node = cc.instantiate(cardTemp)
                node.active = true
                node.parent = parNode
                // node.y = 0
                // node.x = left+space
                node.position = cc.v2(left+space,0)
                node.getComponent("Rummy_Poker").show16Poker(dui[j],wildVal)
                if(j != dui.length-1){
                    left = left+space
                }
                

            }
            //每多一个堆加一个空格
            left += duiSpace
        }
    },

    playEffect:function(uid,bwin){
        let bMySelf = cc.vv.UserManager.isMySelf(uid)
        if(bMySelf){
            let name = "lose"
            if(bwin){
                name = "win"
            }
            Global.TableSoundMgr.playEffect(name)
        }
    }

    // update (dt) {},
});
