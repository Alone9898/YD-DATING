/**
 * 输入数字
 */
cc.Class({
    extends: cc.Component,

    properties: {
       nums:[],
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        for(let i = 1; i<=12; i++){
            let item = cc.find("lays/"+i,this.node)
            Global.btnClickEvent(item, this.onClickInputNums, this)
        }
        let btnClose = cc.find("btn_close",this.node)
        Global.btnClickEvent(btnClose, this.onClickClose, this)
        let btnClose_empty = cc.find("btn_close_empty",this.node)
        Global.btnClickEvent(btnClose_empty, this.onClickClose, this)
        let btnConfirm = cc.find("btn_confirm",this.node)
        Global.btnClickEvent(btnConfirm, this.onClickConfirm, this)

    },

    start () {

    },

    init:function(min=1,max=100,yesCall){
        this._minVal = min
        this._maxVal = max
        this.nums = []
        this._bHasdot = null
        this._yesCall = yesCall;
        this._showCurVal()
    },

    onClickInputNums:function(event){
        Global.TableSoundMgr.playCommonEff("com_click")
        let node = event.node
        let idx = Number(node.name)
        if(idx == 12){//删除一位数
            let val = this.nums.pop()
            if(val == "."){
                this._bHasdot = false
            }
        }
        else if(idx == 11)//小数点
        {
            if(this._bHasdot) return
            this._bHasdot = true
            this.nums.push(".")
        }
        else if(idx == 10){ //0
            this.nums.push("0")
        }
        else{
            //数字
            this.nums.push(idx)
        }

        let curVal = this._getVal()
        if(curVal <= this._maxVal){
            //只能是2位小数
            if(this._bHasdot){
                let nPoint = this._getPointNum(curVal)
                if(nPoint>2){
                    this.nums.pop()
                }
                else{
                    Global.dispatchEvent("input_num",curVal)
                }
            }
            else{
                Global.dispatchEvent("input_num",curVal)
            }
            
            
        }
        else{
            if(idx != 12){
                let val = this.nums.pop()
                if(val == "."){
                    this._bHasdot = false
                }
            }
            else{
                Global.dispatchEvent("input_num",curVal)
            } 
            //提示
            cc.vv.FloatTip.show(cc.js.formatStr("num shuld be %s ~ %s",this._minVal,this._maxVal))
        }

        this._showCurVal()
    },

    onClickClose:function(){
        this.node.destroy()
        Global.TableSoundMgr.playCommonEff("com_click")
    },

    onClickConfirm:function(){
        if(this._yesCall){
            let curVal = this._getVal()
            if (curVal >= this._minVal && curVal <= this._maxVal){
                this._yesCall(curVal)
                this.onClickClose()
            } else {
                //提示
                cc.vv.FloatTip.show(cc.js.formatStr("num shuld be %s ~ %s",this._minVal,this._maxVal))
            }
        }
    },

    _getVal:function(){
        let num =""
        for(let i= 0; i < this.nums.length; i++){
            if(i==this.nums.length-1 && '.' == this.nums[i]){
                //最后一位是小数点就不加了
                continue
            }
            num += this.nums[i]
        }
        return Number(num)
    },

    _getPointNum:function(val){
        let item = val.toString().split(".")[1]
        let p = 0
        if(item){
            p = item.length
        }
        return p
    },

    _showCurVal(){
        let lbl = cc.find("node_val/lbl_num",this.node)
        if(lbl){
            let val = this._getVal()
            lbl.getComponent(cc.Label).string = val.toFixed(2)
        }
        
    }

    // update (dt) {},
});
