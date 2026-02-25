/**
 * 百家乐趋势
 *
 * 走势图规则：
 * 路头牌(第1行的珠子):
    前两列的圈圈数是否相等。相等标记红色，不等标记蓝色。(前两列指对照的列和对照的后一列)
 * 路中牌(第23456行的珠子)：
    珠子所在列和对照列，珠子水平左无且左上有则为蓝色，其余状况为红色。
 *
 * 珠仔路:---
 * 大路：每一次开牌的结果记录下来
 * 大眼仔路:从大路的第二列第二行开始，如果大路中该座标上没有结果，则开始参照点为第三列第一行
    参考的两列是当前列与前列，即第二列与第一列、第三列与第二列，以此类推。
 * 小路:从大路的第三列第二行开始，如果大路中该座标上没有结果，则开始参照点为第四列第一行
    参考的两列是当前列与前前列，即第三列与第一列、第四列与第二列，以此类推。
 * 曱甴路:大路的第四列第二行开始，如果大路中该座标上没有结果，则起始参照点为第五列第一行。
    参考的两列是当前列与前前前列，即第四列与第一列、第五列与第二列，以此类推。
 */

cc.Class({
    extends: cc.Component,

    properties: {
        zhuziSprs:[cc.SpriteFrame], //按庄,闲,平的顺序
        zhuziPre:cc.Prefab, // 珠仔路上item
        biaojiSprs:[cc.SpriteFrame], //按庄空心,闲空心，庄实心，闲实心,庄斜杠,闲斜杠的顺序
        biaojiPre:cc.Prefab, // 其他路上item

        _layout2HMax : [],
        _layout3HMax : [],
        _layout4HMax : [],
        _layout5HMax : [],

        _totalRound : 0,
    },

    start () {
        this.initLayoutHeight();
        this.initRecord()
    },

    initLayoutHeight(){
        for (let i = 0; i < 24; i++){
            this._layout2HMax[i] = 6;
            this._layout3HMax[i] = 6;
            this._layout4HMax[i] = 6;
            this._layout5HMax[i] = 6;
        }
    },

    // 初始所有记录
    initRecord:function(){
        let records = cc.vv.gameData.getGameRecords();
        this._totalRound = records.length;
        // cc.log("_totalRound:", this._totalRound);
        records = cc.vv.gameData.updateRecord();

        let layout_1 = cc.find("layout_1", this.node);
        for(let i = 0; i < records.length; i++){
            let data = records[i];

            let item = cc.instantiate(this.zhuziPre);
            item.parent = layout_1;
            this.updateZhuzi(item, data);
        }

        this.initCnt(records);
        this.initLayout2(records);
        this.initLayout3(records);
        this.initLayout4(records);
        this.initLayout5(records);
        this.randomBiaojiSpr();
    },

    /**
     * 随机标记图标颜色
     */
    randomBiaojiSpr(){
        // 按庄空心,闲空心，庄实心，闲实心,庄斜杠,闲斜杠的顺序
        // [1,3]Math.random()

        cc.find("spr/biaoji_1", this.node).getComponent(cc.Sprite).spriteFrame = this.biaojiSprs[[0,1][Global.random(0,1)]]
        cc.find("spr/biaoji_4", this.node).getComponent(cc.Sprite).spriteFrame = this.biaojiSprs[[0,1][Global.random(0,1)]]
        cc.find("spr/biaoji_2", this.node).getComponent(cc.Sprite).spriteFrame = this.biaojiSprs[[2,3][Global.random(0,1)]]
        cc.find("spr/biaoji_5", this.node).getComponent(cc.Sprite).spriteFrame = this.biaojiSprs[[2,3][Global.random(0,1)]]
        cc.find("spr/biaoji_3", this.node).getComponent(cc.Sprite).spriteFrame = this.biaojiSprs[[4,5][Global.random(0,1)]]
        cc.find("spr/biaoji_6", this.node).getComponent(cc.Sprite).spriteFrame = this.biaojiSprs[[4,5][Global.random(0,1)]]
    },

    // 初始统计个数
    initCnt(records){
        let bCnt = 0;
        let pCnt = 0;
        let tCnt = 0;
        let bPCnt = 0;
        let pPCnt = 0;
        let bigCnt = 0;
        let roundCnt = 0;

        // let records = cc.vv.gameData.getGameRecords()
        records.forEach(data=>{
            if(data.res == 1){
                bCnt += 1;
            } else if(data.res == 2){
                pCnt += 1;
            } else if(data.res == 3){
                tCnt += 1;
            }
            if(data.wp.indexOf(4)>=0){
                bPCnt += 1;
            }else if(data.wp.indexOf(5)>=0){
                pPCnt += 1;
            }
            if(data.bp >= 8){
                bigCnt += 1;
            }
            if(data.pp >= 8){
                bigCnt += 1;
            }
        });

        cc.find("cnt/p/lbl", this.node).getComponent(cc.Label).string = pCnt;
        cc.find("cnt/b/lbl", this.node).getComponent(cc.Label).string = bCnt;
        cc.find("cnt/t/lbl", this.node).getComponent(cc.Label).string = tCnt;
        cc.find("cnt/b_p/lbl", this.node).getComponent(cc.Label).string = bPCnt;
        cc.find("cnt/p_p/lbl", this.node).getComponent(cc.Label).string = pPCnt;
        cc.find("cnt/big/lbl", this.node).getComponent(cc.Label).string = bigCnt;
        cc.find("cnt/total/lbl", this.node).getComponent(cc.Label).string = this._totalRound;
    },

    /**
     * 初始大路
     */
    initLayout2(records){
        let layout_2 = cc.find("layout_2", this.node);
        layout_2.children.forEach((node)=>{node.active = false;})

        let resultList = this.getListGroup2(records);
        let s_col = Math.max(0, resultList.length - this._layout2HMax.length);
        for (let col =s_col; col < resultList.length; col++){
            let list = resultList[col];
            for (let row = 0; row < list.length; row++){
                let record = list[row].record;
                let cnt = list[row].cnt;

                let item = this.getBiaojiNode(layout_2, record.res, cnt);
                this.setBiaojiPos(item, this._layout2HMax, col-s_col, row, cc.v2(12.5,-12.5), cc.v2(25,-25));
            }
        }
    },

    // 大路加一个标记
    // addOneLayout2(records){
    //     let resultList = this.getListGroup2(records);
    //
    //
    //
    // },



    /**
     * 大眼仔路
     * @param records
     */
    initLayout3(records){
        let layout_3 = cc.find("layout_3", this.node);
        layout_3.children.forEach((node)=>{node.active = false;})

        let resultList2 = this.getListGroup2(records);
        let resultList = this.getListGroup3(resultList2);

        let s_col = Math.max(0, resultList.length - this._layout3HMax.length)
        for (let col = s_col; col < resultList.length; col++){
            let data = resultList[col];
            for (let row = 0; row < data.cnt; row++) {
                let item = this.getBiaojiNode(layout_3, data.res, "");
                item.scale = 0.5;
                this.setBiaojiPos(item, this._layout3HMax, col-s_col, row, cc.v2(6,-6), cc.v2(12.5,-12.5));

                // if(row < this._layout3HMax[col]){
                //     item.position = cc.v2(6+12.5*(col-s_col), -6-12.5*row);
                // } else {
                //     // item.position = cc.v2(6+12.5*(col-s_col+row-this._layout3HMax[col]+1), -6-12.5*this._layout3HMax[col]);
                //     let nCol = col-s_col+row-this._layout3HMax[col]+1;
                //     item.position = cc.v2(12.5+25*nCol, -12.5-25*(this._layout3HMax[col]-1));
                //     this._layout3HMax[nCol] -= 1;
                // }
            }
        }
        //
        // if(addOne){
        //     let col = resultList.length-1;
        //     let data = resultList[col];
        //     let row = data.cnt-1;
        //
        //     let item = this.getBiaojiNode(layout_3, data.res, "");
        //     item.scale = 0.5;
        //     if(row < this._layout3HMax[col]){
        //         item.position = cc.v2(6+12.5*(col-s_col), -6-12.5*row);
        //     } else {
        //         let nCol = col-s_col+row-this._layout3HMax[col]+1;
        //         item.position = cc.v2(12.5+25*nCol, -12.5-25*(this._layout3HMax[col]-1));
        //         this._layout3HMax[nCol] -= 1;
        //     }
        // }
    },

    /**
     * 小路
     * @param records
     */
    initLayout4(records){
        let layout_4 = cc.find("layout_4", this.node);
        layout_4.children.forEach((node)=>{node.active = false;})

        let resultList2 = this.getListGroup2(records);
        let resultList = this.getListGroup4(resultList2);

        let s_col = Math.max(0, resultList.length - this._layout4HMax.length)
        for (let col = s_col; col < resultList.length; col++){
            let data = resultList[col];
            for (let row = 0; row < data.cnt; row++) {
                let item = this.getBiaojiNode(layout_4, data.res, "");
                item.scale = 0.5;
                this.setBiaojiPos(item, this._layout4HMax, col-s_col, row, cc.v2(6,-6), cc.v2(12.5,-12.5));

                // if(row < this._layout4HMax[col]){
                //     item.position = cc.v2(6+12.5*(col-s_col), -6-12.5*row);
                // } else {
                //     // item.position = cc.v2(6+12.5*(col-s_col+row-this._layout4HMax[col]+1), -6-12.5*this._layout4HMax[col]);
                //     let nCol = col-s_col+row-this._layout4HMax[col]+1;
                //     item.position = cc.v2(12.5+25*nCol, -12.5-25*(this._layout4HMax[col]-1));
                //     this._layout4HMax[nCol] -= 1;
                // }
            }
        }
    },

    /**
     * 曱甴路
     * @param records
     */
    initLayout5(records){
        let layout_5 = cc.find("layout_5", this.node);
        layout_5.children.forEach((node)=>{node.active = false;})

        let resultList2 = this.getListGroup2(records);
        let resultList = this.getListGroup5(resultList2);

        let s_col = Math.max(0, resultList.length - this._layout5HMax.length)
        for (let col = s_col; col < resultList.length; col++){
            let data = resultList[col];
            for (let row = 0; row < data.cnt; row++) {
                let item = this.getBiaojiNode(layout_5, data.res, "");
                item.scale = 0.5;
                this.setBiaojiPos(item, this._layout5HMax, col-s_col, row, cc.v2(6,-6), cc.v2(12.5,-12.5));

                // if(row < this._layout5HMax[col]){
                //     item.position = cc.v2(6+12.5*(col-s_col), -6-12.5*row);
                // } else {
                //     // item.position = cc.v2(6+12.5*(col-s_col+row-this._layout5HMax[col]+1), -6-12.5*this._layout5HMax[col]);
                //     let nCol = col-s_col+row-this._layout5HMax[col]+1;
                //     item.position = cc.v2(12.5+25*nCol, -12.5-25*(this._layout5HMax[col]-1));
                //     this._layout5HMax[nCol] -= 1;
                // }
            }
        }
    },


    /**
     * 得到大路每一列数据
     * @param record
     */
    getListGroup2(record){
        let records = Global.copy(record);
        records.push({res:0})// 便于最后一个值保存进结果数组

        let result = [];
        let res;

        let list = [];
        let s_i = 0;
        for (let i = 0; i < records.length; i++){
            if(records[i].res != 3){
                res = records[i].res;
                list.push({record:records[i],cnt:i});
                s_i = i+1;
                break;
            }
        }

        for (let i = s_i; i < records.length; i++){
            if(records[i].res == res){
                list.push({record:records[i],cnt:0});
            } else if(records[i].res == 3){
                list[list.length-1].cnt += 1;
            }
            else {
                result.push(list);
                list = [];
                res = records[i].res;
                i = i-1;
            }
        }

        if(result.length > this._layout2HMax.length){ // 最多显示24列，多了的删除前面的
            result.splice(0, this._layout2HMax.length-result.length);
        }

        // console.log("Group2:", result);
        return result;
    },



    /**
     * 大眼仔路
     * @param resultList 大路每一列的数据
     */
    getListGroup3(resultList){
        let result = [];    // res 1-红色 2-蓝色

        if (resultList.length>2 || (resultList.length==2 && resultList[1].length>1)) {

            let s_col = !resultList[1][1] ? 2 : 1;
            for (let col = s_col; col < resultList.length; col++) {
                let s_row = col == 1 ? 1 : 0;
                for (let row = s_row; row < resultList[col].length; row++) {
                    let res;
                    if (row == 0) {
                        res = (resultList[col - 1].length == resultList[col - 2].length) ? 1 : 2;
                    } else {
                        res = (!resultList[col - 1][row] && resultList[col - 1][row - 1]) ? 2 : 1;
                    }

                    // cc.log(res);
                    if (result[result.length - 1] && result[result.length - 1].res == res) {
                        result[result.length - 1].cnt += 1;
                    } else {
                        result.push({res: res, cnt: 1});
                    }
                }
            }
        }

        // console.log("Group3:", result);
        return result;
    },

    /**
     * 小路
     * @param resultList 大路每一列的数据
     */
    getListGroup4(resultList){
        let result = [];    // res 1-红色 2-蓝色

        if (resultList.length>3 || (resultList.length==3 && resultList[2].length>1)){
            let s_col = !resultList[2][1] ? 3 : 2;
            for (let col = s_col; col < resultList.length; col++){
                let s_row = col == 2 ? 1 : 0;
                for (let row = s_row; row < resultList[col].length; row++){
                    let res;
                    if(row == 0){
                        res = (resultList[col-2].length == resultList[col-3].length) ? 3 : 4;
                    } else {
                        res = (!resultList[col-2][row] && resultList[col-2][row-1]) ? 4 : 3;
                    }

                    // cc.log(res);
                    if(result[result.length-1] && result[result.length-1].res == res){
                        result[result.length-1].cnt += 1;
                    } else {
                        result.push({res:res, cnt:1});
                    }
                }
            }
        }

        // console.log("Group4:", result);
        return result;
    },
    /**
     * 曱甴路
     * @param resultList 大路每一列的数据
     */
    getListGroup5(resultList){
        let result = [];    // res 3-红色 2-蓝色

        if (resultList.length>4 || (resultList.length==4 && resultList[3].length>1)) {
            let s_col = !resultList[3][1] ? 4 : 3;
            for (let col = s_col; col < resultList.length; col++) {
                let s_row = col == 3 ? 1 : 0;
                for (let row = s_row; row < resultList[col].length; row++) {
                    let res;
                    if (row == 0) {
                        res = (resultList[col - 3].length == resultList[col - 4].length) ? 5 : 6;
                    } else {
                        res = (!resultList[col - 3][row] && resultList[col - 3][row - 1]) ? 6 : 5;
                    }

                    // cc.log(res);
                    if (result[result.length - 1] && result[result.length - 1].res == res) {
                        result[result.length - 1].cnt += 1;
                    } else {
                        result.push({res: res, cnt: 1});
                    }
                }
            }
        }
        // console.log("Group5:", result);
        return result;
    },

    /**
     * 新增一个记录
     * 刷新规则： 总共收集了96局，在第96局结束，会刷新走势图，(新的走势图不包含第97局的数据)
     */
    addARecord:function(){
        let records = cc.vv.gameData.getGameRecords();

        let refreCnt = 96;
        if(this._totalRound >= refreCnt){ // 刷新数据，从头开始
            this._totalRound = 1;
            // cc.log("_totalRound:", this._totalRound);
            records = records.slice(-1);
            cc.vv.gameData.setGameRecord(records);

            // todo 重新整理
            let layout_1 = cc.find("layout_1", this.node);
            for (let i = 0; i < layout_1.childrenCount; i++){
                let zhuzi = layout_1.children[i];
                if(records[i]){
                    zhuzi.active = true;
                    this.updateZhuzi(zhuzi,records[i]);
                } else {
                    zhuzi.active = false;
                }
            }

        } else {
            this._totalRound += 1;
            // cc.log("_totalRound:", this._totalRound);
            let layout_1 = cc.find("layout_1", this.node);

            if(records.length > 48){    // 删除前六个珠子
                records = cc.vv.gameData.updateRecord();
                for (let i = 0; i < layout_1.childrenCount; i++){
                    let zhuzi = layout_1.children[i];
                    if(records[i]){
                        zhuzi.active = true;
                        this.updateZhuzi(zhuzi,records[i]);
                    } else {
                        zhuzi.active = false;
                    }
                }

                // this.initLayout3(records);
                // this.initLayout4(records);
                // this.initLayout5(records);
            } else {
                let zhuzi = layout_1.children[records.length];
                if(zhuzi){
                    zhuzi.active = true;
                    this.updateZhuzi(zhuzi,records[records.length-1]);
                } else {
                    let item = cc.instantiate(this.zhuziPre);
                    item.parent = layout_1;
                    this.updateZhuzi(item, records[records.length-1]);
                }
            }
        }

        this.initLayoutHeight();
        this.initCnt(records);
        this.initLayout2(records);
        this.initLayout3(records);
        this.initLayout4(records);
        this.initLayout5(records);
        this.randomBiaojiSpr();
    },

    updateZhuzi(item, data){
        item.getComponent(cc.Sprite).spriteFrame = this.zhuziSprs[data.res-1];
        cc.find("p_p", item).active = data.wp.indexOf(5)>=0;
        cc.find("b_p", item).active = data.wp.indexOf(4)>=0;
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
            node = cc.instantiate(this.biaojiPre);
            node.parent = parent;
        }
        node.active = true;
        node.getComponent(cc.Sprite).spriteFrame = this.biaojiSprs[res-1]; //按庄,闲,庄斜杠,闲斜杠的顺序
        node.getChildByName("lbl").getComponent(cc.Label).string = cnt?cnt:"";
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

    // update (dt) {},
});
