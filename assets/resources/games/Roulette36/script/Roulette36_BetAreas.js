/**
 * 俄罗斯押注区域
 */

cc.Class({
    extends: require("Table_BetAreas_Base") ,

    properties: {
        mybet_prefab:cc.Prefab
    },

    onLoad () {
        this._super()
        if(this.AreaList.length == 0){
            this.AreaList = this.node.getComponentsInChildren("Table_Area")
        }
    },



    updateBetTotalNum:function(){
        for(let i = 0; i < this.AreaList.length; i++){
            let itemData = this.AreaList[i]
            let dataIdx = itemData.idx-1
            let areaNode = itemData.node

            let totalBet = cc.vv.gameData.getAreaTotalBet(itemData.idx)

            //总
            Global.setLabelString("totalbet",areaNode,totalBet)
            //我的
            let mybet = cc.vv.gameData.getMyBetByAreanIdx(dataIdx)
            let node_mybet = cc.find("mybet",areaNode)
            if(mybet>0){
                
                if(!node_mybet){
                    node_mybet = cc.instantiate(this.mybet_prefab)
                    node_mybet.parent = areaNode
                    node_mybet.zIndex = 1000
                }
                node_mybet.active = mybet>0?true:false
                Global.setLabelString("lbl",node_mybet,mybet)
            }
            else{
                if(node_mybet) node_mybet.active = false
            }
            
            
            
            
        }
    },

    _randomAreanPostion(areanNode){

        let xPos = 0//Global.random(-areanNode.width/2,areanNode.width/2)
        let yPos = 0//Global.random(-areanNode.height/2,areanNode.height/2)
        return this.node.convertToNodeSpaceAR(areanNode.convertToWorldSpaceAR(cc.v2(xPos,yPos)))
    },

    onEventBetArea:function(data){
        this._super(data)

        let toAreaIdx = data.detail //押注方位的序号
        let placecfg = cc.vv.gameData.getArenCfg(toAreaIdx)
        if(placecfg){
            for(let i = 0; i < placecfg.length; i++){
                let item = placecfg[i]
                let node_name = "area"+item
                if(item == 0){
                    node_name = "area37"
                }
                let node = cc.find(node_name,this.node)
                if(node){
                    let sel = cc.find("sel",node)
                    sel.active = true
                    cc.tween(sel)
                    .delay(0.1)
                    .call(()=>{
                        sel.active = false
                    })
                    .start()
                    
                }
            }
        }
        
        
    },

    _checkCanRecycleChip:function(areaIdx){
        if(cc.isValid(this._active_chips)){
            let gameCfg = cc.vv.gameData.getGameCfg()
            let nCount = 0
            let nFirst = -1 //同时找一个离押注区域中心点最近的
            for(let i = 0; i < this._active_chips.length; i++){
                let item = this._active_chips[i]
                if(item.areaIdx == areaIdx){
                    nCount += 1
                    if(nFirst == -1){
                        nFirst = i
                    }
                }
                
    
            }
    
            let nMax = 2
            if(gameCfg.show_arean_chips){
                nMax = gameCfg.show_arean_chips
            }
            if(nCount > nMax){
                let recy_item = this._active_chips[nFirst]
                if(recy_item){
                    this.removeOneChip(recy_item.chipNode)
                }
                
            }
        }
        
    },

    

    // update (dt) {},
});
