cc.Class({
    extends: require("Table_History_Detail"),

    properties: {
        
    },

    showGameType:function(result){
        let typeNode = cc.find("ui/node_type", this.node)
        let andarNode = cc.find("andar", typeNode)
        let baharNode = cc.find("bahar", typeNode)
        let cardJoker = cc.find("card_joker", typeNode)
        cardJoker.getComponent("Poker").show16Poker(result.joker)
        let size = result.andercards.length + result.baharcards.length
        let startX = -312
        let spaceX = 28
        for (let i=0; i<size; i++) {
            let cardNode = cc.instantiate(cardJoker)
            let idx = 0
            let cardVal = 0
            if (i%2==0) {
                idx = i/2
                cardVal = result.andercards[idx]
                andarNode.addChild(cardNode)
            } else {
                idx = (i-1)/2
                cardVal = result.baharcards[idx]
                baharNode.addChild(cardNode)
            }
            cardNode.position = cc.v2(startX + idx * spaceX, -4)
            cardNode.getComponent("Poker").show16Poker(cardVal)
        }
    },

    showGameResult:function(result){
        let AndarRecordColor = cc.color(108, 153, 255)
        let BaharRecordColor = cc.color(243, 50, 50)
        let OptName = ["","Ander","Bahar","1-5","6-10","11-15","16-25","26-30","31-35","36-40","41 or more"]
        let lblRes = cc.find("ui/node_result/lbl_res", this.node)
        lblRes.getComponent(cc.Label).string = OptName[result.winplace[0]] + ", " + OptName[result.winplace[1]]
        if (result.res == 1) {  //Andar
            lblRes.color = AndarRecordColor
        } else {    //Bahar
            lblRes.color = BaharRecordColor
        }
    },
});

