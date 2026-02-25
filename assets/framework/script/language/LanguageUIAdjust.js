/**
 * 多语言ui节点显示位置调整：阿拉伯文需要左边语序，其他默认右边语序
 * 普通节点：只需要位置对调
 * cc.Label/cc.RichText: 考虑horizontal align
 * cc.Layout/List:水平布局方向
 * cc.Progress:进度条方向
 * cc.Editbox:文字方向直接给placeholder/text上的label节点挂载此脚本就可以啦
 */
cc.Class({
    extends: require("LanguageUIBase"),

    properties: {
        bScaleX:{
            default:false,
            displayName:"ScaleX翻转"
        },
        bLabelTopAlign:{
            default:false,
            displayName:"Label是否上对齐",
        },
        bLabelBottomAlign:{
            default:false,
            displayName:"Label是否下对齐",
        },
        bAuto:{
            default:true,
            displayName:"自动调整"
        },
        bPosX:{
            default:true,
            visible:function(){return !this.bAuto;} ,
            displayName:"PosX对称",
        },
        bAnchorX:{
            default:true,
            visible:function(){return !this.bAuto;} ,
            displayName:"AnchorX对称",
        },
        bLabelAlign:{
            default:true,
            visible:function(){return (!this.bAuto && (this.node.getComponent(cc.Label) || this.node.getComponent(cc.RichText)) );} ,
            displayName:"Label/Text水平对齐方式",
        },
        bLayoutAlign:{
            default:true,
            visible:function(){return (!this.bAuto && (this.node.getComponent(cc.Layout)) || this.node.getComponent("List") );} ,
            displayName:"Layout/List水平对齐方式",
        },
        bProgressDir:{
            default:true,
            visible:function(){return (!this.bAuto && (this.node.getComponent(cc.ProgressBar)) );} ,
            displayName:"Progress方向",
        },

        //属性初始值
        _defaultScaleX:null,
        _defaultLabelAlignV:null,
        _defaultPosX:null,
        _defaultAnchorX:null,
        _defaultLabelAlignH:null,
        _defaultLayoutAlign:null,
        _defaultProgressDir:null,
        
    },

    start () {
        this.updateNode()
    },

    //更新位置
    updateNode(){
        //没有赋值过的（== null）才需要采集初始值。否则说明已经不是初始值啦
        if(this._defaultScaleX == null){
            this._defaultScaleX = this.node.scaleX
        }
        if(this._defaultPosX == null){
            this._defaultPosX = this.node.x
        }
        if(this._defaultAnchorX == null){
            this._defaultAnchorX = this.node.anchorX
        }
        
        

        //是否是支持文本布局的组建cc.Label/cc.RichText
        let lblCmp = this.node.getComponent(cc.Label) || this.node.getComponent(cc.RichText)
        if(lblCmp){
            if(this._defaultLabelAlignH == null){
                this._defaultLabelAlignH = lblCmp.horizontalAlign
            }
            if(this._defaultLabelAlignV == null){
                this._defaultLabelAlignV = lblCmp.verticalAlign
            }
            
        }
        

        //是否支持cc.Layout组建
        let layCmp = this.node.getComponent(cc.Layout)
        if(!layCmp){
            let listcmp = this.node.getComponent("List")
            if(listcmp){
                layCmp = listcmp._layout
            }
        }
        if(layCmp){
            //横向列表才需要改方向排列
            if(layCmp.type == cc.Layout.Type.HORIZONTAL && this._defaultLayoutAlign == null){
                this._defaultLayoutAlign = layCmp.horizontalDirection
            }
        }

        //是否支持cc.Progress组建
        let progressCmp = this.node.getComponent(cc.ProgressBar)
        if(progressCmp && this._defaultProgressDir == null){
            this._defaultProgressDir = progressCmp.reverse
        }

        if(Global.language === Global.LANGUAGE.AR){
            //右边开始读
            if(this.bScaleX){
                this.node.scaleX = -this._defaultScaleX
            }
            if(this.bPosX){
                this.node.x = -this._defaultPosX
            }
            if(this.bAnchorX){
                this.node.anchorX = 1-this._defaultAnchorX
            }
            if(lblCmp){
                if(this.bLabelAlign){
                    //如果是左右对齐的调换对齐方式
                    let xAl = this._getLabelHorizontalAlign(this._defaultLabelAlignH)
                    //如果是自动变高模式，且中间对齐。强制用右对齐显示
                    if(lblCmp.overflow == cc.Label.Overflow.RESIZE_HEIGHT && this._defaultLabelAlignH == cc.macro.TextAlignment.CENTER){
                        xAl = cc.macro.TextAlignment.RIGHT
                    }
                    lblCmp.horizontalAlign = xAl
                }
                if(this.bLabelTopAlign && this._defaultLabelAlignV != null){
                    lblCmp.verticalAlign = cc.Label.VerticalAlign.TOP
                }
                if(this.bLabelBottomAlign && this._defaultLabelAlignV != null){
                    lblCmp.verticalAlign = cc.Label.VerticalAlign.BOTTOM
                }
            }
            
            if(this.bLayoutAlign && layCmp){
                layCmp.horizontalDirection = this._getLayoutHorzontalAlign(this._defaultLayoutAlign)
            }
            if(this.bProgressDir && progressCmp){
                progressCmp.reverse = !this._defaultProgressDir
            }
        }
        else{
            //恢复默认的左边开始读
            this.node.scaleX = this._defaultScaleX
            this.node.x = this._defaultPosX
            this.node.anchorX = this._defaultAnchorX
            if(lblCmp){
                if(this.bLabelAlign){
                    lblCmp.horizontalAlign = this._defaultLabelAlignH
                }
                if(this.bLabelTopAlign && this._defaultLabelAlignV != null){
                    lblCmp.verticalAlign = this._defaultLabelAlignV
                }
                
            }
            if(this.bLayoutAlign && layCmp){
                layCmp.horizontalDirection = this._defaultLayoutAlign
            }
            if(this.bProgressDir && progressCmp){
                progressCmp.reverse = this._defaultProgressDir
            }
        }
    },

    //获取需要调整的文本对齐方式
    _getLabelHorizontalAlign(dir){
        if(dir == cc.macro.TextAlignment.LEFT){
            return cc.macro.TextAlignment.RIGHT
        }
        else if(dir == cc.macro.TextAlignment.RIGHT){
            return cc.macro.TextAlignment.LEFT
        }
        else{
            return dir
        }
    },

    //获取需要调整的Layout对齐方式
    _getLayoutHorzontalAlign(dir){
        if(dir == cc.Layout.HorizontalDirection.LEFT_TO_RIGHT){
            return cc.Layout.HorizontalDirection.RIGHT_TO_LEFT
        }
        else{
            return cc.Layout.HorizontalDirection.LEFT_TO_RIGHT
        }
    },

    display(){
        this._super()
        this.updateNode()
    },

    // update (dt) {},
});
