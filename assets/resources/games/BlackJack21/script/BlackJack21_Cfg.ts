
export class BlackJack21Cfg {
    helpItems=[];
    bet_records="";

    constructor() {
        this.init();
    }

    init(){
        this.helpItems=[
            "games/BlackJack21/prefab/help_item1",
            "games/BlackJack21/prefab/help_item2",
            "games/BlackJack21/prefab/help_item3",
        ]

        this.bet_records= "Table_Common/TableRes/prefab/record_bet_pannel";
    }
}
