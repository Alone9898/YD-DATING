/**
Logo 适配。logo相对彩金，卷轴，人物来说是不那么重要的，可以让logo往上顶。如果被上面的Top节点遮挡就隐藏
1 对于logo的spin大小不是实际logo大小的，可以自己拖一个节点，然后将spin作为子节点，然后调整节点大小到实际logo的大小。然后再挂载这个脚本
2 对于logo的spin大小是实际logo大小的，直接挂载这个脚本上去就好了

PS：logo会根据大小在top和彩池之间的空隙自动调整位置，大小
 */

cc.Class({
    extends: cc.Component,

    properties: {
        _bRefush:0,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad(){
        this.node.opacity = 0

    },

    updateAlignment(){
        this.node.opacity = 0
        this._bRefush = 0
    },

    update (dt) {
        
        if(this._bRefush == 1){ //PS:因为挂载了widget组件，结果会在下一帧生效
            let logoWorldRect = this.node.convertToWorldSpaceAR(cc.v2(0,0))
            let topNode = cc.vv.gameData.GetTopScript().node
            let buyBg = cc.find('btn_purchase_bg',topNode)
            if(!buyBg) return
            let topWorldRect = buyBg.convertToWorldSpaceAR(cc.v2(0,-40))
            // let logoBoundBox = this.node.getBoundingBoxToWorld() 
            if(topWorldRect.y <= logoWorldRect.y+(this.node.height+buyBg.height+80)/2){
                //隐藏
                
                //如果top和彩金之间还有很宽可以适当调整logo位置
                let prizepools = topNode.parent.getComponentsInChildren('LMSlotMachine_PrizePool')
                if(prizepools){
                    let yNeed = Math.abs(topWorldRect.y - logoWorldRect.y - (this.node.height+buyBg.height+80)/2)
                    let yMin = 1000
                    let rectMin
                    for(let i = 0; i < prizepools.length; i++){
                        let item = prizepools[i]
                        let itemWorlPos = item.node.convertToWorldSpaceAR(cc.v2(0,0))
                        let difY = logoWorldRect.y - itemWorlPos.y -  (item.node.height+this.node.height)/2
                        if(difY < yMin){
                            yMin = difY
                            rectMin = item.node.getBoundingBoxToWorld()
                        }
                    }
                    if(rectMin && yMin > 0 && (yMin > yNeed || (yNeed - yMin)/this.node.height < 0.5)){
                        if(yMin > yNeed){
                            this.node.opacity = 255
                            this.node.y -= yNeed
                        }
                        else{
                            this.node.opacity = 255
                            let val = 1 - (yNeed - yMin)/this.node.height
                            this.node.scale *= val
                            this.node.y = this.node.y - yNeed + (1-val)*this.node.height/2
                        }
                        
                    }
                }
            }
            else{
                this.node.opacity = 255
            }
            
        }
        this._bRefush++
            
        

    },

});
