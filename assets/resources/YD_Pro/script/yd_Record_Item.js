let FortuneWheel_ResultMap = {
    [1]: {symbol: 1, mult: 2},
    [2]: {symbol: 3, mult: 10},
    [3]: {symbol: 5, mult: 2},
    [4]: {symbol: 2, mult: 8},
    [5]: {symbol: 4, mult: 2},
    [6]: {symbol: 1, mult: 5},
    [7]: {symbol: 3, mult: 2},
    [8]: {symbol: 5, mult: 50},
    [9]: {symbol: 2, mult: 2},
    [10]: {symbol: 4, mult: 20},
};
let Roulette_Places= [
    //编号： 1~10
    [1], [2], [3], [4], [5], [6], [7], [8], [9], [10],
    //编号： 11~20
    [11],[12],[13],[14],[15],[16],[17],[18],[19],[20],
    //编号: 21~30
    [21],[22],[23],[24],[25],[26],[27],[28],[29],[30],
    //编号: 31~37
    [31],[32],[33],[34],[35],[36],[0],

    ////////////////两个数字（18倍）
    //编号：38~47
    [0,3],  [0,2],  [0,1],  [2,3],  [2,1],  [3,6],  [2,5],  [1,4],  [5,6],  [5,4],
    //编号：48~57
    [6,9],  [5,8],  [4,7],  [9,8],  [8,7],  [9,12], [8,11], [7,10], [12,11],[11,10],
    //编号：58~67
    [12,15],[11,14],[10,13],[15,14],[14,13],[15,18],[14,17],[13,16],[18,17],[17,16],
    //编号：68~77
    [18,21],[17,20],[16,19],[21,20],[20,19],[21,24],[20,23],[19,22],[24,23],[23,22],
    //编号：78~87
    [24,27],[23,26],[22,25],[27,26],[26,25],[27,30],[26,29],[25,28],[30,29],[29,28],
    //编号：88~97
    [30,33],[29,32],[28,31],[33,32],[32,31],[33,36],[32,35],[31,34],[36,35],[35,34],

    ////////////////三个数字（12倍）
    //编号：98~107
    [0,3,2],[0,2,1],[1,3,2],[6,5,4],[9,8,7],[12,11,10],[15,14,13],[18,17,16],[21,20,19],[24,23,22],
    //编号：108~111
    [27,26,25],[30,29,28],[33,32,31],[36,35,34],

    ////////////////四个数字（9倍）
    //编号：112~116
    [3,6,2,5],    [2,5,1,4],    [6,9,5,8],    [5,8,4,7],    [9,12,8,11],
    //编号：117~121
    [8,11,7,10],  [12,15,11,14],[11,14,10,13],[15,18,14,17],[14,17,13,16],
    //编号：122~126
    [18,21,17,20],[17,20,16,19],[21,24,20,23],[20,23,19,22],[24,27,23,26],
    //编号：127~131
    [23,26,22,25],[27,30,26,29],[26,29,25,28],[30,33,29,32],[29,32,28,31],
    //编号：132~133
    [33,36,32,35],[32,35,31,34],

    ////////////////六个数字（6倍）
    //编号：134~137
    [1,2,3,4,5,6],      [4,5,6,7,8,9],      [7,8,9,10,11,12],   [10,11,12,13,14,15],
    //编号：138~141
    [13,14,15,16,17,18],[16,17,18,19,20,21],[19,20,21,22,23,24],[22,23,24,25,26,27],
    //编号：142~144
    [25,26,27,28,29,30],[28,29,30,31,32,33],[31,32,33,34,35,36],

    ////////////////2 to 1（3倍）
    //编号：145~147
    [3,6,9,12,15,18,21,24,27,30,33,36],[2,5,8,11,14,17,20,23,26,29,32,35],[1,4,7,10,13,16,19,22,25,28,31,34],
    //编号：148~150
    [1,2,3,4,5,6,7,8,9,10,11,12],[13,14,15,16,17,18,19,20,21,22,23,24],[25,26,27,28,29,30,31,32,33,34,35,36],

    ////////////////红黑（2倍）
    //编号：151~152
    [1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36], [2,4,6,8,10,11,13,15,17,20,22,24,26,28,29,31,33,35],

    ////////////////奇偶（2倍）
    //编号：153~154
    [1,3,5,7,9,11,13,15,17,19,21,23,25,27,29,31,33,35], [2,4,6,8,10,12,14,16,18,20,22,24,26,28,30,32,34,36],

    ////////////////小大（2倍）
    //编号：155~156
    [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18], [19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36],

]

cc.Class({
    extends: require("Table_Record_Item"),

    properties: {
        atlas:cc.SpriteAtlas,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this._super();


    },

    // start () {

    // },

    // update (dt) {},

    setGameId(gameId){
        this.gameId = gameId;
    },

     //根据游戏显示自己的结果
     showGameResult:function(result){
         let cfg = this.getShowConf(this.gameId);

         let node_result = cc.find("node_result", this.node);
         node_result.children.forEach(node=>{
             node.active = false;
         })
         let showNode = cc.find(cfg.result_node, node_result);
         showNode.active = true;
         cfg.result(result, showNode, this.atlas);
    },

    //根据自己的游戏显示押注选项
    showGameOption:function(opt){
        let cfg = this.getShowConf(this.gameId);

        let node_option = cc.find("node_option", this.node);
        node_option.children.forEach(node=>{
            node.active = false;
        })
        let showNode = cc.find(cfg.option_node, node_option);
        showNode.active = true;
        showNode.scale = cfg.option_scale || 1;
        cfg.option(opt, showNode, this.atlas);
    },



    getShowConf(id){
        let self = this

        let cfg = {
            0:{result_node:"",option_node:"",result:(result,node,atlas)=>{}, option:(opt,node,atlas)=>{}},


            // Andar Bahar
            11:{result_node:"11",option_node:"lbl",result:(result,node)=>{
                    let AndarRecordColor = cc.color(108, 153, 255);
                    let BaharRecordColor = cc.color(243, 50, 50);
                    let OptName = ["","Ander","Bahar","1-5","6-10","11-15","16-25","26-30","31-35","36-40","41 or more"];
                    let lblRes1 = cc.find("lbl_res1", node);
                    let lblRes2 = cc.find("lbl_res2", node);
                    lblRes1.getComponent(cc.Label).string = OptName[result.winplace[0]];
                    lblRes2.getComponent(cc.Label).string = OptName[result.winplace[1]];
                    if (result.res == 1) {  //Andar
                        lblRes1.color = AndarRecordColor;
                        lblRes2.color = AndarRecordColor;
                    } else {    //Bahar
                        lblRes1.color = BaharRecordColor;
                        lblRes2.color = BaharRecordColor;
                    }
                }, option:(opt,node)=>{
                    let OptName = ["","Ander","Bahar","1-5","6-10","11-15","16-25","26-30","31-35","36-40","41 or more"];
                    node.getComponent(cc.Label).string = OptName[opt];
                }},

            // Crash
            12:{result_node:"12",option_node:"lbl",result:(result,node,atlas)=>{
                    let data = result.mult;
                    let item = cc.find("item",node);

                    let showbg = data>=2? "Crash_hj_l" : "Crash_Guess2";
                    let showball = data>=2? "Crash_red" : "Crash_green";
                    item.getComponent(cc.Sprite).spriteFrame = atlas.getSpriteFrame(showbg);
                    cc.find("color",item).getComponent(cc.Sprite).spriteFrame = atlas.getSpriteFrame(showball);
                    Global.setLabelString("val",item,data + "x")
                }, option:(opt,node)=>{
                    node.getComponent(cc.Label).string = opt;
                }},

            // Jhandi Munda
            13:{result_node:"13",option_node:"spr",result:(result,node,atlas)=>{
                    node.children.forEach((node)=>{
                        node.active = false;
                    })
                    let cnt = 0;
                    for (let i = 0; i < result.res.length; i++){
                        if(result.res[i]>=2){
                            cc.find(`item${cnt+1}`, node).active = true;
                            cc.find(`item${cnt+1}/spr`, node).getComponent(cc.Sprite).spriteFrame = atlas.getSpriteFrame(`JhandiMunda_record${i+1}`);
                            cnt+=1;
                        }
                    }
                }, option:(opt,node,atlas)=>{
                    node.getComponent(cc.Sprite).spriteFrame = atlas.getSpriteFrame(`JhandiMunda_record${opt}`);
                }},

            // 赛马
            14:{result_node:"14",option_node:"lbl",result:(result,node,atlas)=>{
                    cc.find("paoma_result", node).getComponent(cc.Sprite).spriteFrame = atlas.getSpriteFrame(`HorseRacing_paoma_result${result.res}`);
                }, option:(opt,node)=>{
                    node.getComponent(cc.Label).string = opt;
                }},

            // Wingo Lottery
            15:{result_node:"15",option_node:"lbl",result:(result,node,atlas)=>{
                    let frameN = "";
                    if(result.ball == 0 || result.ball == 5){
                        frameN = "WingoLottery_x1";
                    } else if(result.ball < 5){
                        frameN = "WingoLottery_x5";
                    } else if(result.ball > 5){
                        frameN = "WingoLottery_x3";
                    }
                    let spr = cc.find("spr", node);
                    spr.getComponent(cc.Sprite).spriteFrame = atlas.getSpriteFrame(frameN);
                    spr.getChildByName("lbl").getComponent(cc.Label).string = result.ball;
                }, option:(opt,node)=>{
                    let optname = ["1","2","3","4","5","6","7","8","9","0","1-4","0/5","6-9"];
                    node.getComponent(cc.Label).string = optname[opt-1];
                }},

            // Fortune Wheel
            16:{result_node:"16",option_node:"spr",option_scale:0.8,result:(result,node,atlas)=>{
                    let res = FortuneWheel_ResultMap[result.res];
                    if(res){
                        cc.find("symbol", node).getComponent(cc.Sprite).spriteFrame = atlas.getSpriteFrame("FortuneWheel_symbol_"+res.symbol);
                        cc.find("mult", node).getComponent(cc.Sprite).spriteFrame = atlas.getSpriteFrame("FortuneWheel_x"+res.mult);
                    }
                }, option:(opt,node,atlas)=>{
                    node.getComponent(cc.Sprite).spriteFrame = atlas.getSpriteFrame(`FortuneWheel_symbol_${opt}`);
                }},

            // 龙虎斗
            17:{result_node:"17",option_node:"lbl",result:(result,node,atlas)=>{
                    let val = result.res
                    let list = ["Lhdz_zoushi_icon01","Lhdz_zoushi_icon02","Lhdz_zoushi_icon03"]
                    let item = cc.find("item",node)
                    item.getComponent(cc.Sprite).spriteFrame = atlas.getSpriteFrame(list[val-1])
                }, option:(opt,node)=>{
                    let optname = ["Dragon","Tiger","Tie"];
                    node.getComponent(cc.Label).string = optname[opt-1];
                }},

            // 俄罗斯轮盘36
            18:{result_node:"18",option_node:"lbl",result:(result,node,atlas)=>{
                    let val = result.res;
                    let node_ball = cc.find("ball",node);
                    //球数字
                    Global.setLabelString("val",node_ball,val);
                    //球底板
                    let key;
                    if(val == 0){
                        key = "Roulette_end_lingbg";
                    }
                    else{
                        let _getBallColor=function(ball){
                            let colorType = 1 //黑
                            let colorItem = Roulette_Places[150] //红
                            for (let i = 0; i < colorItem.length; i++) {
                                if (ball == colorItem[i]) {
                                    colorType = 2
                                    break
                                }
                            }
                            return colorType
                        }

                        let color = _getBallColor(val);
                        key = (color ==1)?"Roulette_end_heibg":"Roulette_end_hongbg";
                    }
                    node_ball.getComponent(cc.Sprite).spriteFrame = atlas.getSpriteFrame(key);
                }, option:(opt,node)=>{
                    node.getComponent(cc.Label).string = opt;
                }},

            // 百家乐
            19:{result_node:"19",option_node:"lbl",result:(result,node,atlas)=>{
                    node.active = true;
                    let item = cc.find("zhuzi", node);
                    let sprNameList = ["Baccarat_zoushi_icon02","Baccarat_zoushi_icon01","Baccarat_zoushi_icon03"];  // 庄 闲 和
                    item.getComponent(cc.Sprite).spriteFrame = atlas.getSpriteFrame(sprNameList[result.res-1]);
                    cc.find("p_p", item).active = result.winplace.indexOf(5)>=0;
                    cc.find("b_p", item).active = result.winplace.indexOf(4)>=0;
                }, option:(opt,node)=>{
                    let optname = ["Banker", "Player", "Tie", "Banker Pair", "Player Pair"];
                    node.getComponent(cc.Label).string = optname[opt-1];
                }},

            // 7 Up Down
            20:{result_node:"20",option_node:"lbl",result:(result,node,atlas)=>{
                    let item = cc.find("item", node);
                    if(result.gold){
                        item.getComponent(cc.Sprite).spriteFrame = atlas.getSpriteFrame("SevenUpDown_r_h");
                    } else {
                        let list = ["SevenUpDown_r_hong","SevenUpDown_r_lv","SevenUpDown_r_lan"]; //2~6,8~12,7,
                        item.getComponent(cc.Sprite).spriteFrame = atlas.getSpriteFrame(list[result.res-1])
                    }
                    cc.find("lbl", item).getComponent(cc.Label).string = result.point;
                }, option:(opt,node)=>{
                    let optname = ["2-6","8-12","7"];
                    node.getComponent(cc.Label).string = optname[opt-1];
                }},

            // 阿拉丁转盘
            21:{result_node:"21",option_node:"spr",option_scale:0.8,result:(result,node,atlas)=>{
                    if (result.win.length > 1) {
                        cc.find("icon_deng", node).active = true;
                        cc.find("symbol", node).active = false;
                        cc.find("mult", node).getComponent(cc.Label).string = "";
                    } else {
                        cc.find("icon_deng", node).active = false;
                        cc.find("symbol", node).active = true;
                        cc.find("symbol", node).getComponent(cc.Sprite).spriteFrame = atlas.getSpriteFrame(`laba_bet_${result.win[0].place-1}`);
                        cc.find("mult", node).getComponent(cc.Label).string = "x" + result.win[0].mult;
                    }
                }, option:(opt,node,atlas)=>{
                    node.getComponent(cc.Sprite).spriteFrame = atlas.getSpriteFrame(`laba_bet_${opt-1}`);
                }},
            //Crash换皮:飞行员
            22:{result_node:"22",option_node:"lbl",result:(result,node,atlas)=>{
                let lbl = node
                let data = result.mult
                lbl.getComponent(cc.Label).string = data.toFixed(2) + "x"
                lbl.color = data>1.5?cc.color().fromHEX("#8C3EF7"):cc.color().fromHEX("#04A1E6")
            }, option:(opt,node,atlas)=>{
                node.getComponent(cc.Label).string = opt
            }},
            //Crash换皮: 女飞行员
            23:{result_node:"22",option_node:"lbl",result:(result,node,atlas)=>{
                let lbl = node
                let data = result.mult
                lbl.getComponent(cc.Label).string = data.toFixed(2) + "x"
                lbl.color = data>1.5?cc.Color.GREEN:cc.Color.BLUE
            }, option:(opt,node,atlas)=>{
                node.getComponent(cc.Label).string = opt
            }},
            //Crash换皮:CrashX
            24:{result_node:"22",option_node:"lbl",result:(result,node,atlas)=>{
                let lbl = node
                let data = result.mult
                lbl.getComponent(cc.Label).string = data.toFixed(2) + "x"
                lbl.color = data>1.5?cc.color(72,209,163):cc.color(90,118,207)
            }, option:(opt,node,atlas)=>{
                node.getComponent(cc.Label).string = opt
            }},
            //Carash换皮:板球
            25:{result_node:"22",option_node:"lbl",result:(result,node,atlas)=>{
                let lbl = node
                let data = result.mult
                lbl.getComponent(cc.Label).string = data.toFixed(2) + "x"
                lbl.color = data>1.5?cc.color(72,209,163):cc.color(90,118,207)
            }, option:(opt,node,atlas)=>{
                node.getComponent(cc.Label).string = opt
            }},
            //Crash换皮：喷气式飞机
            26:{result_node:"22",option_node:"lbl",result:(result,node,atlas)=>{
                let lbl = node
                let data = result.mult
                lbl.getComponent(cc.Label).string = data.toFixed(2) + "x"
                lbl.color = data>1.5?cc.Color.GREEN:cc.color().fromHEX("#9d1918")
            }, option:(opt,node,atlas)=>{
                node.getComponent(cc.Label).string = opt
            }},
            //Crash换皮：齐柏林飞艇
            27:{result_node:"22",option_node:"lbl",result:(result,node,atlas)=>{
                let lbl = node
                let data = result.mult
                lbl.getComponent(cc.Label).string = data.toFixed(2) + "x"
                lbl.color = data>1.5?cc.Color.GREEN:cc.Color.RED
            }, option:(opt,node,atlas)=>{
                node.getComponent(cc.Label).string = opt
            }},
            //单人Dice
            28:{result_node:"22",option_node:"lbl",result:(result,node,atlas)=>{
                let lbl = node
                let data = result
                lbl.getComponent(cc.Label).string = Global.SavePoints(data.num)
                lbl.color = data.res>0?cc.Color.GREEN:cc.Color.WHITE    
            }, option:(opt,node,atlas)=>{
                // node.getComponent(cc.Label).string = opt
                let str = opt
                let result = JSON.parse(self._itemdata.result)
                if(result.roll == 1){
                    str = "UNDER"
                }
                else if(result.roll == 2){
                    str = "OVER"
                }
                node.getComponent(cc.Label).string = str
            }},
            //单人Limbo
            29:{result_node:"22",option_node:"lbl",result:(result,node,atlas)=>{
                let lbl = node
                let data = result
                lbl.getComponent(cc.Label).string = data.mult + "x"
                
            }, option:(opt,node,atlas)=>{
                // node.getComponent(cc.Label).string = opt
                let str = opt
                let result = JSON.parse(self._itemdata.result)
                
                node.getComponent(cc.Label).string = result.multiplier + "x"
                node.color = (result.res == 1)?cc.Color.GREEN:cc.Color.RED
            }},
            //单人PLinko
            30:{result_node:"22",option_node:"lbl",result:(result,node,atlas)=>{
                let lbl = node
                let data = result
                lbl.getComponent(cc.Label).string = Global.SavePoints(data.mult)
                lbl.color = data.mult > 1 ? cc.Color.GREEN : cc.Color.WHITE

            }, option:(opt,node,atlas)=>{
                // node.getComponent(cc.Label).string = opt
                let str = opt
                let result = JSON.parse(self._itemdata.result)
                
               
                if (result.color == 1) {
                    str = "GREEN"
                } else if (result.color == 2) {
                    str = "YELLOW"
                } else if (result.color == 3) {
                    str = "RED"
                }
                node.getComponent(cc.Label).string = str

            }},
            //单人Keno
            31:{result_node:"31",option_node:"31",result:(result,node,atlas)=>{
                
                let data = result
                let lay = node
                for(let i = 0; i < 10; i++){
                    let item = cc.find("item"+(i+1),lay)
                    if(cc.js.isNumber(data.lottery_nums[i])){
                        item.active = true
                        Global.setLabelString("num",item,data.lottery_nums[i])
                    }
                    else{
                        item.active = false
                    }
                }

            }, option:(opt,node,atlas)=>{
                // node.getComponent(cc.Label).string = opt
                let str = opt
                let result = JSON.parse(self._itemdata.result)
                
               
                let isHit = function(val){
                    for(let i = 0; i < result.lottery_nums.length; i++){
                        if(val == result.lottery_nums[i]){
                            return true
                        }
                    }
                    return false
                }
                let lay = node
                for(let i = 0; i < 10; i++){
                    let item = cc.find("item"+(i+1),lay)
                    if(cc.js.isNumber(result.nums[i])){
                        item.active = true
                        let val = result.nums[i]
                        Global.setLabelString("num",item,val)
                        let spname = "Keno_ball_sel"
                        if(isHit(val)){
                            spname = "Keno_ball_hit"
                        }
                        cc.find("icon",item).getComponent(cc.Sprite).spriteFrame = atlas.getSpriteFrame(spname)
                    }
                    else{
                        item.active = false
                    }
                }

            }},
            //单人Mines
            32:{result_node:"22",option_node:"lbl",result:(result,node,atlas)=>{
                let lbl = node
                let data = result
                lbl.getComponent(cc.Label).string = "x" + (data.winMult || 0);
                lbl.color = data.winMult > 0 ? cc.Color.GREEN : cc.Color.WHITE;
                

            }, option:(opt,node,atlas)=>{
                
                let result = JSON.parse(self._itemdata.result)
                let str = "--"
                str = "Mines " + (result.mineCnt || 0);
                node.getComponent(cc.Label).string = str

            }},
            //单人Hilo
            33:{result_node:"22",option_node:"33",option_scale:0.3,result:(result,node,atlas)=>{
                
                let data = result
                let lbl = node
                
                lbl.getComponent(cc.Label).string = data.result == 1 ? "WIN" : "LOSE"
                lbl.color = data.res > 0 ? cc.Color.GREEN : cc.Color.WHITE


            }, option:(opt,node,atlas)=>{
                // node.getComponent(cc.Label).string = opt
                let str = opt
                let result = JSON.parse(self._itemdata.result)
                let poker = node;
                //显示最后一张牌
                poker.getComponent("Poker").show16Poker(result.card);

            }},
            //单人Towers
            34:{result_node:"22",option_node:"lbl",result:(result,node,atlas)=>{
                let lbl = node
                let data = result
                lbl.getComponent(cc.Label).string = "x"+data.mult
                

            }, option:(opt,node,atlas)=>{
                
                let result = JSON.parse(self._itemdata.result)
                let str = "--"
                let dif_cfg = ["Easy","Medium","Hard","Extreme","Nightmare"]
                str = dif_cfg[result.difficulty-1]
                node.getComponent(cc.Label).string = str

            }},
            //多人DoubleRoll
            35:{result_node:"14",option_node:"lbl",result:(result,node,atlas)=>{
                let lbl = node
                let data = result
                let color_cfg = ["rec_red_1","rec_black_1","rec_green_1"]
                cc.find("paoma_result",node).getComponent(cc.Sprite).spriteFrame = atlas.getSpriteFrame(color_cfg[data.res-1])
               
                

            }, option:(opt,node,atlas)=>{
                
                
                let str = "--"
                
                node.getComponent(cc.Label).string = str

            }},
            //多人DoubleRoll
            36:{result_node:"22",option_node:"spr",result:(result,node,atlas)=>{
                let lbl = node
                let data = result
                // let color_cfg = ["rec_red_1","rec_black_1","rec_green_1"]
                // cc.find("paoma_result",node).getComponent(cc.Sprite).spriteFrame = atlas.getSpriteFrame(color_cfg[data.res-1])
                lbl.getComponent(cc.Label).string = data.result == data.choose ? "WIN" : "LOSE";
                lbl.color = data.result == data.choose ? cc.Color.GREEN : cc.Color.WHITE;
                

            }, option:(opt,node,atlas)=>{
                
                let result = JSON.parse(self._itemdata.result)
                // let icon = node;
                // icon.active = true;
                let endIdx = result.choose == 1 ? 1 : 0;
                let color_cfg = ["coin_small_white1","coin_small_yellow1"]
                node.getComponent(cc.Sprite).spriteFrame = atlas.getSpriteFrame(color_cfg[endIdx])

            }},
            //单人Crypto
            37:{result_node:"37",option_node:"lbl",result:(result,node,atlas)=>{

                let sparr = ["dot_white","dot1","dot2","dot3","dot4","dot5","dot6","dot7","dot8"]
                let gems = result.gems
                let colors = []
                for (let i=0; i<gems.length; i++) {
                    let flag = false
                    for (j=0; j<colors.length; j++) {
                        if (colors[j].gem == gems[i]) {
                            colors[j].count++
                            flag = true
                            break
                        }
                    }
                    if (!flag) {
                        colors.push({
                            gem: gems[i],
                            count: 1
                        })
                    }
                }
                colors.sort((a, b)=>{return b.count - a.count})
                let idx = 1
                for (let i=0; i<colors.length; i++) {
                    if (colors[i].count > 1) {
                        for (let j=0; j<colors[i].count; j++) {
                            let color = cc.find("dot"+idx, node)
                            if (color) {
                                color.getComponent(cc.Sprite).spriteFrame = atlas.getSpriteFrame(sparr[colors[i].gem])//this.sprSymbols[colors[i].gem]
                            }
                            idx++
                        }
                    }
                }
                for (; idx<5; idx++) {
                    let color = cc.find("dot"+idx, node)
                    if (color) {
                        color.getComponent(cc.Sprite).spriteFrame = atlas.getSpriteFrame(sparr[0])
                    }
                }
               
                

            }, option:(opt,node,atlas)=>{
                let str = "--"
                node.getComponent(cc.Label).string = str

            }},

            //单人Triple
            38:{result_node:"38",option_node:"lbl",result:(result,node,atlas)=>{

                let sparr = ["triple_symbol_1_0","triple_symbol_2_0","triple_symbol_3_0"]
                for (let i=0; i<3; i++) {
                    let icon = cc.find("s"+i+"/icon",node)
                    icon.getComponent(cc.Sprite).spriteFrame = atlas.getSpriteFrame(sparr[result.res[i]-1])//this.sprSymbols[result.res[i]-1]
                }
               
                

            }, option:(opt,node,atlas)=>{
                let str = "--"
                node.getComponent(cc.Label).string = str

            }},
        }


        return cfg[id]
    },



});
