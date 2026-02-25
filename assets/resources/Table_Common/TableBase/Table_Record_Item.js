/**
 * 记录item
 */
cc.Class({
    extends: cc.Component,

    properties: {
        
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        let btn_detail = cc.find("btn_detail",this.node)
        Global.btnClickEvent(btn_detail,this.onClickDetail,this)
    },

    start () {

    },

    init:function(data){
        this._itemdata = data

        //orderid
        Global.setLabelString("lbl_order",this.node,data.i)
        //时间
        Global.setLabelString("lbl_time",this.node,Global.getTimeStr(data.t))
        if(cc.find("btn_detail",this.node)){
            //说明是历史记录页面
            let timeLbl = cc.find("lbl_time",this.node)
            timeLbl.getComponent(cc.Label).overflow = cc.Label.Overflow.NONE
        }
        //押注额
        let lbl_amount = cc.find("lbl_amount",this.node)
        if(lbl_amount){
            Global.setLabelString("lbl_amount",this.node,Global.FormatNumToComma(data.bet))
        }
        //win
        let lbl_win = cc.find("lbl_win",this.node)
        if(lbl_win){
            let numPre = ""
            let color = cc.Color.GREEN
            if(data.win>0){
                numPre = "+"
                color = cc.Color.ORANGE
            }
            Global.setLabelString("lbl_win",this.node,numPre+Global.FormatNumToComma(data.win))
            
            lbl_win.color = color
        }
        
        //gameresult
        this.showGameResult(JSON.parse(data.result))

        //gameoption
        if(data.p){
            this.showGameOption(data.p)
        } else {
            this.showGameOption("--")
        }
        
    },

    setDetailPrefab:function(data){
        this._prefab_detail = data
    },

    //根据游戏显示自己的结果
    showGameResult:function(result){

    },

    //根据自己的游戏显示押注选项
    showGameOption:function(opt){

    },

    //点击详情
    onClickDetail:function(){
        if(this._prefab_detail){
            let parNode = cc.find("Canvas")
            let old = parNode.getChildByName("history_result_detail")
            if(!old){
                let node = cc.instantiate(this._prefab_detail)
                node.name = "history_result_detail"
                node.parent = parNode
                node.getComponent("Table_History_Detail").setInfo(this._itemdata)
            }
            
        }
    },

    // update (dt) {},
});
