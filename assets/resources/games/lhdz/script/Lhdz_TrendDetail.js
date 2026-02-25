/**
 * 趋势详情
 */
cc.Class({
    extends: cc.Component,

    properties: {
       long:cc.SpriteFrame,
       hu:cc.SpriteFrame,
       he:cc.SpriteFrame,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        let btn_close = cc.find("btn_close",this.node)
        Global.btnClickEvent(btn_close, this.onClickClose, this)
    },

    start () {
        this.showDetail20()
        this.showDetail16()
        this.showTotalCount()
        this.showTrendRoad()
    },


    showDetail20:function(){
        //last20
        let records = cc.vv.gameData.getGameRecords()
        let nTotal = records.length
        let last20_t = 0
        let last20_d = 0
        let last20_tie = 0
        for(let i = 20; i > 0; i--){
            //last20
            let item = cc.find("bg/last_20/item"+i,this.node)
            let data = records[nTotal-1-(20-i)]
            item.active = data?true:false
            if(data){
                let showSprite
                if(data.res == 1) {
                    showSprite = this.long
                    last20_d +=1
                }
                if(data.res == 2) {
                    last20_t +=1
                    showSprite = this.hu
                }
                if(data.res == 3) {
                    last20_tie += 1
                    showSprite = this.he
                }
                item.getComponent(cc.Sprite).spriteFrame = showSprite
            }
            // //last16
            // let last16_item = cc.find("bg/node_point/item"+(i-4),this.node)
            // if(last16_item){

            // }
        }

        let nPer_long = last20_d/20
        let nPer_hu = last20_t/20
        cc.find("bg/node_pro/lbl_d",this.node).getComponent(cc.Label).string = parseInt(nPer_long*100)+"%"
        cc.find("bg/node_pro/lbl_t",this.node).getComponent(cc.Label).string = parseInt(nPer_hu*100)+"%"
        cc.find("bg/node_pro/pro",this.node).getComponent(cc.ProgressBar).progress = nPer_long
    },

    showDetail16:function(){
        let records = cc.vv.gameData.getGameRecords()
        let nTotal = records.length
        
        for(let i = 16; i > 0; i--){
            //last20
            let item = cc.find("bg/node_point/item"+i,this.node)
            let data = records[nTotal-1-(16-i)]
            item.active = data?true:false
            if(data){
                let node_long = cc.find("spr_d",item)
                let node_hu = cc.find("spr_t",item)
                // let node_tie = cc.find("spr_tie",item)
                // if(data.res == 1 || data.res == 2) {
                    //long
                    node_long.active = true
                    node_hu.active = true
                    // node_tie.active = false
                    Global.setLabelString("val",node_long,this._showResultNum(data.c1))
                    Global.setLabelString("val",node_hu,this._showResultNum(data.c2))
                    cc.find("sel",node_long).active = data.res == 1
                    cc.find("sel",node_hu).active = data.res == 2
                    // cc.find("sel",node_tie).active = data.res == 3
                // }
               
                
            }
            
        }

        
    },

    showTotalCount:function(){
        let records = cc.vv.gameData.getGameRecords()
        let nTotal = records.length
        let nLong = 0; 
        let nHu = 0;
        let nHe = 0
        for(let i = 0; i < nTotal; i++){
            let item = records[i]
            if(item.res == 1) nLong += 1
            if(item.res == 2) nHu += 1
            if(item.res == 3) nHe += 1

        }

        Global.setLabelString("bg/node_static/spr_d/val",this.node,nLong)
        Global.setLabelString("bg/node_static/spr_t/val",this.node,nHu)
        Global.setLabelString("bg/node_static/spr_tie/val",this.node,nHe)
        Global.setLabelString("bg/node_static/spr_count/val",this.node,nTotal)
    },

    showTrendRoad:function(){
        let records = cc.vv.gameData.getGameRecords()
        let layout_2 = cc.find("bg/node_annal/layout", this.node);
        layout_2.children.forEach((node)=>{node.active = false;})

        let resultList = this.getListGroup2(records);
        let result2 = this.getResultPosition(resultList);
        if(result2.length > 9){
            resultList.splice(0, result2.length-9);
            result2 = this.getResultPosition(resultList);
        }
        for (let col = 0; col < result2.length; col++) {
            for (let row = 0; row < result2[col].length; row++){
                if(result2[col][row]){
                    let item = this.getBiaojiNode(layout_2, result2[col][row]);
                    item.position = cc.v2(36+col*82, -58+row*(-85))
                }
            }
        }
    },


    getListGroup2(record){
        let records = Global.copy(record);

        let result = [];
        let res;
        let list = [];
        for (let i = 0; i < records.length; i++){
            if(records[i].res == res){
                list.push(records[i].res);
            }
            else {
                result.push(list);
                list = [];
                res = records[i].res;
                i = i-1;
            }
        }
        result.push(list)
        //
        result.shift()
        if(result.length > 9){ // 最多显示24列，多了的删除前面的
            result.splice(0, result.length-9);
        }
        // console.log("result:", result);
        return result;
    },

    getResultPosition(result){
        let hMax = 8;
        let result2 = [];
        for (let i = 0; i < result.length; i++) {
            let cur_col = i;
            let cur_row = 0;
            for (let j = 0; j < result[i].length; j++) {
                result2[cur_col] || (result2[cur_col] = []);
                if(result2[cur_col][cur_row]){
                    cur_col += 1;
                    result2[cur_col] || (result2[cur_col] = []);
                    if(cur_row == 0){
                        result2[cur_col][cur_row] = result[i][j];
                        cur_row += 1;
                    } else {
                        result2[cur_col][cur_row-1] = result[i][j];
                    }
                }
                else if(cur_col>0 && result2[cur_col][cur_row+1] && result2[cur_col][cur_row+1] ==result[i][j]) {
                    cur_col += 1;
                    result2[cur_col] || (result2[cur_col] = []);
                    result2[cur_col][cur_row-1] = result[i][j];
                }
                else if(cur_col>0 && result2[cur_col-1][cur_row] && result2[cur_col-1][cur_row] == result[i][j]){
                    cur_col += 1;
                    result2[cur_col] || (result2[cur_col] = []);
                    result2[cur_col][cur_row-1] = result[i][j];
                }
                else if(cur_row > hMax-1){
                    cur_col += 1;
                    result2[cur_col] || (result2[cur_col] = []);
                    result2[cur_col][cur_row-1] = result[i][j];
                }
                else {
                    result2[cur_col][cur_row] = result[i][j];
                    cur_row += 1;
                }
            }
        }
        return result2;
    },


    getBiaojiNode(parent, res, cnt){
        let node;
        for (let i = 0; i < parent.childrenCount; i++){
            if(!parent.children[i].active){
                node = parent.children[i];
                break;
            }
        }
        if(!node){
            let itemNode = cc.find("bg/node_annal/item1",this.node)
            node = cc.instantiate(itemNode);
            node.parent = parent;
        }
        node.active = true;
        node.getComponent(cc.Sprite).spriteFrame = this.getShowFreame(res)//this.getShowFreame(res); //按庄,闲,庄斜杠,闲斜杠的顺序
        // node.getChildByName("lbl").getComponent(cc.Label).string = cnt?cnt:"";
        return node;
    },

    /**
     * 设置一个标记的位置
     * @param item 珠子节点
     * @param hMax 一列最多能摆的个数
     * @param col 珠子在的列(从0开始计数)
     * @param row 珠子在的行(从0开始计数)
     * @param sPos 珠子的起始位置
     * @param offPos 每个珠子位置的偏移量
     */
    setBiaojiPos(item, hMax, col, row, sPos, offPos){
        if(row < hMax[col]){
            item.position = cc.v2(sPos.x+offPos.x*col, sPos.y+offPos.y*row);
        } else {
            let nCol = col+row-hMax[col]+1;
            item.position = cc.v2(sPos.x+offPos.x*nCol, sPos.y+offPos.y*(hMax[col]-1));
            hMax[nCol] -= 1;
        }
    },

    onClickClose:function(){
        this.node.destroy()
    },

    _showResultNum:function(val){
        let res = ["A","2","3","4","5","6","7","8","9","10","J","Q","K"]
        let result = cc.vv.gameData.convert16PokertoDatavalue(val)
        if(!res[result.value-1]){
            cc.log("1")
        }
        return res[result.value-1]
    },

    getShowFreame:function(val){
        let showSprite
        if(val == 1){
            showSprite = this.long
            
        }
        if(val == 2) {
           
            showSprite = this.hu
        }
        if(val == 3) {
           
            showSprite = this.he
        }
        return showSprite
    }

    // update (dt) {},
});
