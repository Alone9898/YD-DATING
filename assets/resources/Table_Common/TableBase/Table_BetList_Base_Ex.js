/**
 * 押注筹码列表
 */
cc.Class({
    extends: cc.Component,

    properties: {
        spaceX: 10,  //筹码间隔
        chipWidth: 160, //筹码宽度
        content: cc.Node, //筹码容器
        _betlist:[],
        _chipList:[],
        _bCanSelect:false, //是否可以押注
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {

        // Global.registerEvent("change_chip",this.onEventRefushSelect,this)
        this.onInit()

        this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove,this)
    },

    start () {
    },

    onInit(){
        let datas = cc.vv.gameData.getBetChipList()
        this._betlist = datas
        let chipNode = this.content.children[0]
        this._chipList.push(chipNode.getComponent("Table_BetChip_Base_Ex"))
        let size = datas.length
        for(let i=1; i<size; i++) {
            let chip = cc.instantiate(chipNode)
            this.content.addChild(chip)
            this._chipList.push(chip.getComponent("Table_BetChip_Base_Ex"))
        }
        this._startX = -(this.chipWidth + this.spaceX) * (size - 1) / 2
        for (let i=0; i<this._chipList.length; i++) {
            let chip = this._chipList[i]
            chip.node.x = this._startX + (this.chipWidth+this.spaceX)*i
            chip.init(this._betlist[i])
        }
        this.setSelectChipVal(datas[0])
        this.reLayout()
    },

    reLayout() {
        for (let i=0; i<this._chipList.length; i++) {
            let chip = this._chipList[i]
            if (chip.getSelect()) {
                chip.node.zIndex = 100
            } else {
                chip.node.zIndex = i
            }
        }
    },

    onTouchStart(event){
        this.onTouchMove(event)
    },

    onTouchMove(event){
        let location = event.getLocation()
        let mindis = 1000000
        let idx = -1
        let np = this.node.convertToNodeSpaceAR(location)
        for (let i=0; i<this._chipList.length; i++) {
            let chip = this._chipList[i]
            let box = chip.node.getBoundingBox()
            if (box.contains(np)) {
                let dis = Math.abs(np.x - chip.node.x)
                if (dis < mindis) {
                    mindis = dis
                    idx = i
                }
            }
        }
        if (idx >= 0) {
            let chip = this._chipList[idx]
            if (this._select_chip_node != chip.node) {
                this.setSelectChipVal(chip.getChipVal())
            }
        }
    },

    //设置是否可以下注
    setCanSelectChips:function(val){
        this._bCanSelect = val

        for(let i = 0; i < this._chipList.length; i++){
            let chip_val = this._chipList[i].getChipVal()
            let bCan = val
            if(val){
                //可以押注的时候，需要判断是否金币足够
                let myCoin  = cc.vv.gameData.getMyCoin()
                if(chip_val>myCoin){
                    bCan = false
                }
            }
            this._chipList[i].setCanSelect(bCan)
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

    //根据筹码值获取筹码节点
    getChipNodeByVal:function(val){
        for(let i = 0; i < this._chipList.length; i++){
            let chip = this._chipList[i]
            let chip_val = chip.getChipVal()
            let res = (chip_val == val)
            if(res){
                return chip.node
            }
            
        }
    },

    
    setSelectChipVal:function(val){
        this._select_val = val
        for(let i = 0; i < this._chipList.length; i++){
            let chip = this._chipList[i]
            let chip_val = chip.getChipVal()
            let res = (chip_val == val)
            chip.setSelect(res)
            if(res){
                this._select_chip_node = chip.node
            }
        }
        this.reLayout()
    },

    onEventRefushSelect:function(data){
        let val = data.detail
        this.setSelectChipVal(val)
    },
});
