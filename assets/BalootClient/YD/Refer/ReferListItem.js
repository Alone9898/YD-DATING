/**
 * 代理列表item
 */
cc.Class({
    extends: cc.Component,

    properties: {
        
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start () {

    },

    setInfo(info){
        //头像
        this._showHead(info.uid,info.usericon,0,info.playername)

        //局数
        Global.setLabelString("lbl_board",this.node,info.times)
        //最近登陆时间
        let dif = cc.sys.now()/1000 - info.login_time 
        let showDif = Global.formatTimeDiff(dif) + " ago"
        Global.setLabelString("lbl_lastlogin",this.node,showDif)
        
        //注册时间
        let timestr = Global.getFullDateStr(info.create_time)
        Global.setLabelString("lbl_date",this.node,timestr)
    },

    
    _showHead(uid,icon,avat,nick){
        // let uid = uid
        let headIcon = icon
        let avatarframe = avat || 0;
        let node_my = this.node
        let node_head = cc.find("head",node_my)
        node_head.getComponent("HeadCmp").setHead(uid, headIcon)
        node_head.getComponent("HeadCmp").setAvatarFrame(avatarframe)

        //name
        Global.setLabelString("lbl_name",node_my,nick)
        
        

    },
    


    // update (dt) {},
});
