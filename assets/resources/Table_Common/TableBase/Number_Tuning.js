
//输入数值控制组件

cc.Class({
    extends: cc.Component,

    properties: {
        value: {
            default: 1,
            type: cc.Float,
            tooltip: CC_DEV && '设置数值',
        },
        minVal: {
            default: 1,
            type: cc.Float,
            tooltip: CC_DEV && '最小值',
        },
        maxVal: {
            default: 1000,
            type: cc.Float,
            tooltip: CC_DEV && '最大值',
        },
        decimals: {
            default: 2,
            type: cc.Integer,
            tooltip: CC_DEV && '小数位数',
        },
        showPrefix: {
            default: '',
            type: cc.String,
            tooltip: CC_DEV && '值显示前缀',
        },
        showSuffix: {
            default: '',
            type: cc.String,
            tooltip: CC_DEV && '值显示后缀',
        },
        stepSize: {
            default: 1,
            type: cc.Float,
            tooltip: CC_DEV && '增减步长',
        },

        betmodel:{
            default:false,
            type:cc.Boolean,
            tooltip:CC_DEV && '控制下注额模式，Max/Min会根据服务器下发的值来控制',
        }
    },

    onLoad () {
        this.lblVal = cc.find('lbl_val', this.node).getComponent(cc.Label)
        this.node.on('click', this.onClick, this)
        Global.onClick("btn_min", this.node, this.onClickMin, this)
        Global.onClick("btn_max", this.node, this.onClickMax, this)
        Global.onClick("btn_minus", this.node, this.onClickMinus, this)
        Global.onClick("btn_add", this.node, this.onClickAdd, this)
    },

    start() {
        this._checkBetModel()
        this.setValue(this.value)
    },

    getValue() {
        return this.value
    },

    setValue(val) {
        let value = Math.min(this.maxVal, Math.max(this.minVal, val))
        this.value = value
        this.lblVal.string = this.showPrefix+value.toFixed(this.decimals)+this.showSuffix

        if(this._changeCall) this._changeCall(value)
    },

    //设置押注额变化的回调汗水
    setValChangeCall(valFun){
        this._changeCall = valFun
    },

    onClick() {
        let self = this
        cc.loader.loadRes("Table_Common/TableRes/prefab/node_input", cc.Prefab,function(err, res){
            if(!err){
                let canvas = cc.find("Canvas")
                let node_input = cc.find("node_input", canvas)
                if(!node_input){
                    let node = cc.instantiate(res)
                    node.parent = canvas
                    node.active = true
                    node.getComponent("Input_Nums").init(self.minVal, self.maxVal,(val)=>{
                        self.setValue(val)
                    })
                }
            }
        })

        Global.TableSoundMgr.playCommonEff("com_click")
    },

    onClickMin(){
        this.setValue(this.minVal)

        //音效
        let cfg = cc.vv.gameData.getGameCfg()
        if(cfg && cfg.NumberTuning_Min_Eff){
            Global.TableSoundMgr.playEffect(cfg.NumberTuning_Min_Eff)
        }
        else{
            Global.TableSoundMgr.playCommonEff("com_click")
        }
    },

    onClickMax(){
        this.setValue(this.maxVal)

        //音效
        let cfg = cc.vv.gameData.getGameCfg()
        if(cfg && cfg.NumberTuning_Max_Eff){
            Global.TableSoundMgr.playEffect(cfg.NumberTuning_Max_Eff)
        }
        else{
            Global.TableSoundMgr.playCommonEff("com_click")
        }
    },

    calcSuitableStep(){
        let val = this.value
        if (val < this.minVal + this.stepSize * 10) {
            return this.stepSize
        } else if (val < this.minVal + this.stepSize * 100) {
            return this.stepSize * 10
        } else if (val < this.minVal + this.stepSize * 1000) {
            return this.stepSize * 100
        } else {
            return 100
        }
    },

    onClickMinus(){
        let step = this.calcSuitableStep()
        this.setValue(this.value - step)

        //音效
        let cfg = cc.vv.gameData.getGameCfg()
        if(cfg && cfg.NumberTuning_Minus_Eff){
            Global.TableSoundMgr.playEffect(cfg.NumberTuning_Minus_Eff)
        }
        else{
            Global.TableSoundMgr.playCommonEff("com_click")
        }
    },
    
    onClickAdd(){
        let step = this.calcSuitableStep()
        this.setValue(this.value + step)

        //音效
        let cfg = cc.vv.gameData.getGameCfg()
        if(cfg && cfg.NumberTuning_Add_Eff){
            Global.TableSoundMgr.playEffect(cfg.NumberTuning_Add_Eff)
        }
        else{
            Global.TableSoundMgr.playCommonEff("com_click")
        }
    },

    _checkBetModel(){
        if(this.betmodel){
            let deskInfo = cc.vv.gameData.getDeskInfo()
            if(deskInfo && deskInfo.config){
                this.maxVal = deskInfo.config.maxbet
                this.minVal = deskInfo.config.minbet
            }
        }
    }

});
