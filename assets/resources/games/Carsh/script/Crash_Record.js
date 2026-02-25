/**
 * Crash record
 */
cc.Class({
    extends: cc.Component,

    properties: {
        back_bg:cc.SpriteFrame,
        green_bg:cc.SpriteFrame,
        red_ball:cc.SpriteFrame,
        green_ball:cc.SpriteFrame,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        Global.btnClickEvent(cc.find("toggle_detail",this.node),this.onClickDetail,this)
        Global.btnClickEvent(cc.find("node_detail",this.node),this.onClickClose,this)
    },

    start () {
        this.showRecords()
    },

    showRecords:function(bAni){
        let res = cc.vv.gameData.getGameRecords()
        let nTotal = res.length
        let nShowNum = 8
        for(let i= 0;i < nShowNum; i++){
            let item = cc.find("lay/item"+(i+1),this.node)
            let data = res[nTotal-(nShowNum-i)]
            item.active = data?true:false

            //bg
            if(data){
                let showbg = data>=2?this.green_bg:this.back_bg
                let showball = data>=2?this.red_ball:this.green_ball
                item.getComponent(cc.Sprite).spriteFrame = showbg
                cc.find("color",item).getComponent(cc.Sprite).spriteFrame = showball
                Global.setLabelString("val",item,data + "x")
            }

            let newFlag = cc.find("new",item)
            if(newFlag){
                newFlag.active = true
                if(bAni){
                    Global.blinkAction(newFlag,0.2,0.2,3)
                }
            }
            

        }

        this.showTrendRoad();
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
            let itemNode = cc.find("node_detail/item1",this.node)
            node = cc.instantiate(itemNode);
            node.parent = parent;
        }
        node.active = true;
        node.getComponent(cc.Sprite).spriteFrame = this.getShowFreame(res); //按庄,闲,庄斜杠,闲斜杠的顺序
        // node.getChildByName("lbl").getComponent(cc.Label).string = cnt?cnt:"";
        return node;
    },

    showTrendRoad:function(){
        let records = cc.vv.gameData.getGameRecords()
        let layout_2 = cc.find("node_detail/layout_2", this.node);
        layout_2.children.forEach((node)=>{node.active = false;})

        let resultList = this.getListGroup2(records);
        let result2 = this.getResultPosition(resultList);
        if(result2.length > 31){
            resultList.splice(0, result2.length-31);
            result2 = this.getResultPosition(resultList);
        }

        for (let col = 0; col < result2.length; col++) {
            for (let row = 0; row < result2[col].length; row++){
                if(result2[col][row]){
                    let item = this.getBiaojiNode(layout_2, result2[col][row]);
                    item.position = cc.v2(15+col*33, -15+row*(-33))
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
            if(this.getResutlType(records[i]) == res){
                list.push(records[i]);
            } 
            else {
                result.push(list);
                list = [];
                res = this.getResutlType(records[i]);
                i = i-1;
            }
        }
        result.push(list)
        result.shift()
        if(result.length > 31){ // 最多显示24列，多了的删除前面的
            result.splice(0, result.length-31);
        }

        console.log("result:", result);
        return result;
    },

    getResultPosition(result){
        let hMax = 5;
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
                else if(cur_col>0 && result2[cur_col][cur_row+1] && this.getResutlType(result2[cur_col][cur_row+1]) == this.getResutlType(result[i][j])) {
                    cur_col += 1;
                    result2[cur_col] || (result2[cur_col] = []);
                    result2[cur_col][cur_row-1] = result[i][j];
                }
                else if(cur_col>0 && result2[cur_col-1][cur_row] && this.getResutlType(result2[cur_col-1][cur_row]) == this.getResutlType(result[i][j])){
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

    getResutlType:function(val){
        let res = val>=2?1:2
        return res
    },

    getShowFreame:function(val){
        let showball = val>=2?this.red_ball:this.green_ball
        return showball
    },

    onClickDetail:function(){
        let tog = cc.find("toggle_detail",this.node)
        let bCheck = tog.getComponent(cc.Toggle).isChecked
        let detail = cc.find("node_detail",this.node)
        detail.active = !bCheck
        if(detail.active){
            this.showTrendRoad()
        }
    },

    onClickClose:function(){
        let tog = cc.find("toggle_detail",this.node)
        tog.getComponent(cc.Toggle).isChecked = false
        let detail = cc.find("node_detail",this.node)
        detail.active = false
    }

    // update (dt) {},
});
