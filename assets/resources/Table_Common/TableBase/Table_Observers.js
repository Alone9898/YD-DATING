/**
 * 观众列表
 */

cc.Class({
    extends: cc.Component,

    properties: {
       observerListPrefab: cc.Prefab
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {

        let btn = cc.find("btn",this.node)
        Global.btnClickEvent(btn,this.onClickWatchList,this)

        
        cc.vv.NetManager.registerMsg(MsgId.REQ_OBSER_LIST, this.OnRcvNetObserList, this); //观众列表
        
    },

    onDestroy(){
        
        cc.vv.NetManager.unregisterMsg(MsgId.REQ_OBSER_LIST, this.OnRcvNetObserList, false,this);
    },

    start () {
        let num = cc.vv.gameData.getObservers()
        this.showWatchers(num)
    },

    //显示观众人数
    showWatchers:function(num){
        Global.setLabelString("lbl_num",this.node,num)
    },

    //点开玩家列表
    onClickWatchList:function(){
        Global.TableSoundMgr.playCommonEff("com_click")
        
        let req = {c:MsgId.REQ_OBSER_LIST}
        cc.vv.NetManager.send(req)
    },

    // OnRcvNetObserNum:function(msg){
    //     if(msg.code == 200){
    //         let newNum = msg.count
    //         this.showWatchers(newNum)
    //     }
    // },

    OnRcvNetObserList:function(msg){
        if(msg.code == 200){
            if (this.observerListPrefab) {
                let parent = cc.find("Canvas")
                let old = parent.getChildByName('Obser_List')
                if(!old){
                    let node = cc.instantiate(this.observerListPrefab)
                    node.name = 'Obser_List'
                    node.parent = parent
                    node.getComponent("Table_Observers_List").init(msg.list)
                }
            } else {
                let url = "Table_Common/TableRes/prefab/Obser_List"
                cc.loader.loadRes(url,cc.Prefab, (err, prefab) => {
                    if (!err) {
                        let parent = cc.find("Canvas")
                        let old = parent.getChildByName('Obser_List')
                        if(!old){
                            let node = cc.instantiate(prefab);
                            node.parent = parent;
                            node.getComponent("Table_Observers_List").init(msg.list)
                            
                        }
                    }
                })
            }
        }
    },

    // update (dt) {},
});
