/**
 * 押注筹码列表
 */
 const List = require('List');
cc.Class({
    extends: cc.Component,

    properties: {
       _betlist:[],
        listview:List,
        _bCanSelect:false, //是否可以押注
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {

        Global.registerEvent("change_chip",this.onEventRefushSelect,this)

        //节点激活的时候，初始化押注列表
        let bets = cc.vv.gameData.getBetChipList()
        this.init(bets)

        let btn_arrow = cc.find("arrow",this.node)
        Global.btnClickEvent(btn_arrow,this.onClickArrow,this)

        this.listview.getComponent(cc.ScrollView).node.on("scroll-ended",this.onEventScrollEnd,this)

        
    },

    start () {
        if(!this._select_chip_node){
            //选一个默认档位
            let chiplist = cc.vv.gameData.getBetChipList()
            let defaultVal = chiplist[0]
            Global.dispatchEvent("change_chip",defaultVal)
        }

        this.showArrowEnterAni()
    },

    init:function(datas){
        this._betlist = datas


        this.listview.numItems = datas.length
    },

    showArrowEnterAni:function(){
        let arrow = cc.find("arrow",this.node)
        arrow.x = 560
        cc.tween(arrow)
        .to(0.2,{x:495})
        .start()
    },

    onListRender:function(item,id){
        let itemData = this._betlist[id]
        if(itemData){
            item.active = true
            let scp = cc.find("chip",item).getComponent("Table_BetChip_Base")
            scp.init(itemData)
            scp.setClickEnable(true)
            let bCan = this._bCanSelect
            if(bCan){
                //可以押注的时候，需要判断是否金币足够
                let myCoin  = cc.vv.gameData.getMyCoin()
                if(itemData>myCoin){
                    bCan = false
                }
            }
            scp.setSelect(this._select_val == itemData);
            scp.setCanSelect(bCan)
        }
        else{
            item.active = false
        }
    },

    

    //设置是否可以下注
    setCanSelectChips:function(val){
        this._bCanSelect = val

        let scp_arr = this.listview.getComponentsInChildren("Table_BetChip_Base")
        for(let i = 0; i < scp_arr.length; i++){
            let chip_val = scp_arr[i].getChipVal()
            let bCan = val
            if(val){
                //可以押注的时候，需要判断是否金币足够
                let myCoin  = cc.vv.gameData.getMyCoin()
                if(chip_val>myCoin){
                    bCan = false
                }
            }
            scp_arr[i].setCanSelect(bCan)
        }
    },

    /**
     * 获取当前选中的筹码值
     */
    getSelectChipVal:function(){
        return this._select_val
    },

    /**
     * 获取当前选中的筹码节点
     * @returns 
     */
    getSelectChipNode:function(){
        return this._select_chip_node
    },

    
    setSelectChipVal:function(val){
        this._select_val = val
        let scp_arr = this.listview.getComponentsInChildren("Table_BetChip_Base")
        for(let i = 0; i < scp_arr.length; i++){
            let chip_val = scp_arr[i].getChipVal()
            let res = (chip_val == val)
            scp_arr[i].setSelect(res)
            if(res){
                this._select_chip_node = scp_arr[i].node
            }
            
        }
    },

    onEventRefushSelect:function(data){
        let val = data.detail
        this.setSelectChipVal(val)
    },

    onClickArrow:function(){
        if(cc.isValid(this.listview)){
            this.listview.getComponent(cc.ScrollView).scrollToRight(0.1)
        }
    },

    onEventScrollEnd:function(){
        let curOff = this.listview.getComponent(cc.ScrollView).getScrollOffset()
        let maxOff = this.listview.getComponent(cc.ScrollView).getMaxScrollOffset()
        let bShow = true
        if(curOff.x>maxOff.x-20){
            //已经靠近边缘了
            bShow = false
        }
        cc.find("arrow",this.node).active = bShow
    },


    // update (dt) {},
});
