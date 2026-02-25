/**
 * Andar Bahar记录
 */
const AndarRecordColor = cc.color(108, 153, 255)
const BaharRecordColor = cc.color(243, 50, 50)
const OptName = ["","Ander","Bahar","1-5","6-10","11-15","16-25","26-30","31-35","36-40","41 or more"]

cc.Class({
    extends: require("Table_Record_Item"),

    properties: {
        
    },

    //根据游戏显示自己的结果
    showGameResult:function(result){
        let lblRes1 = cc.find("node_result/lbl_res1", this.node)
        let lblRes2 = cc.find("node_result/lbl_res2", this.node)
        lblRes1.getComponent(cc.Label).string = OptName[result.winplace[0]]
        lblRes2.getComponent(cc.Label).string = OptName[result.winplace[1]]
        if (result.res == 1) {  //Andar
            lblRes1.color = AndarRecordColor
            lblRes2.color = AndarRecordColor
        } else {    //Bahar
            lblRes1.color = BaharRecordColor
            lblRes2.color = BaharRecordColor
        }
    },

    //根据自己的游戏显示押注选项
    showGameOption:function(opt){
        Global.setLabelString("node_option/lbl_res",this.node,OptName[opt])
    },
});
