
cc.Class({
    extends: require("Table_History_Detail"),

    properties: {

    },

    showGameResult:function(result){

        let p_db = cc.find("ui/node_type/p_db", this.node);
        let b_db = cc.find("ui/node_type/b_db", this.node);

        for (let i = 0; i < 3; i++){
            let cardsData_p = result.playercards;
            let card_p = cc.find(`card${i+1}`,p_db);
            if(cardsData_p[i] >= 0) {
                card_p.active = true;
                card_p.getComponent("Poker").show16Poker(cardsData_p[i]);
            } else {
                card_p.active = false;
            }

            let cardsData_b = result.bankercards;
            let card_b = cc.find(`card${i+1}`,b_db);
            if(cardsData_b[i] >= 0){
                card_b.active = true;
                card_b.getComponent("Poker").show16Poker(cardsData_b[i]);
            } else {
                card_b.active = false;
            }
        }
        cc.find("point", p_db).getComponent(cc.Label).string = result.playerpoint;
        cc.find("point", b_db).getComponent(cc.Label).string = result.bankerpoint;

        let winNode = cc.find("ui/node_type/ysz_tie", this.node);
        if(result.res == 1) {
            winNode = cc.find("win", b_db);
        } else if(result.res == 2) {
            winNode = cc.find("win", p_db);
        }
        winNode.active = true;

    },

    showGameType:function(result){

        let winplace = result.winplace;

        let layout = cc.find("ui/node_result/layout", this.node);
        for (let i = 1; i <= 5; i++){
            cc.find("area_"+i, layout).active = winplace.includes(i);
        }

        // let optname = ["Banker", "Player", "Tie", "Banker Pair", "Player Pair" ]
        //
        // let str = optname[winplace[0]-1];
        // for (let i = 1; i < winplace.length; i++){
        //     str += `, ${optname[winplace[i]-1]}`;
        // }
        //
        // cc.find("ui/node_result/lbl_result", this.node).getComponent(cc.Label).string = str;
    },

    // update (dt) {},
});
