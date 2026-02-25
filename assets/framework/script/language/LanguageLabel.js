/**
 * 多语言文本控件:支持cc.Label,cc.RichText,cc.Editbox下的placeholder的label也可以挂载
 */
cc.Class({
    extends: require("LanguageUIBase"),

    properties: {
        id:{
            default:"",
            displayName:"文字KEY"
        },
        
        _setParam:null,
    },

    // LIFE-CYCLE CALLBACKS:

    start () {
        this.updateLabel();
     },

     /**
      * 
      * @param {*} text 不传的时候，就是根据key来设置文字，
      * 但是有时候需要外部修改文字。可以通过text字段来修改需要显示的字符
      */
    updateLabel(text){

        let labObj = this.getComponent(cc.Label);
        if(!labObj) {
            labObj = this.getComponent(cc.RichText);
        } 

        if(labObj){
            if (!text) {//如果外部没有主动更新，就用KEY来取对应的文字
                if(this.id){
                    text = cc.vv.Language[this.id];
                }
                else{
                    //都没有值就不修改
                    return
                }
                
            }
            labObj.string = text;
        }
    },

    /**
     * 
     * @param  {...any} theArgs 外部设置的代码参数。比如用代码控制的多语言文本显示
     */
    setLabel(...theArgs){
        // let setKey
        //listview里复用的话 this._setKey 会存在上一个item的值 导致无法赋值新的数据
        // if(!this._setKey){
        let setKey = this._getLanKeyByVal(theArgs[0]) //传递进来的是key对应的val
        this._setKey = setKey
        // }
        // else{
        //     setKey = this._setKey
        // }
        this._setParam = theArgs
        
        this._setRefushData(setKey,theArgs)

    },

    _setRefushData(setKey,params){
        //获取显示的key
        let str = cc.vv.Language[setKey]

        //调整参数语序
        if(I18N && I18N.ChangeParamPos){
            str = I18N.ChangeParamPos(str)
        }
        if(str){
            for (let i = 1; i < params.length; i++) {
                str = str.replace('{' + i + '}', params[i]);
            }
            this.updateLabel(str)
        }
        else{
            cc.log("不存在:"+setKey)
        }
    },

    display(){
        this._super()
        if(this.id){//设置了静态文本的
            this.updateLabel()
        }
        else{
            //更新代码控制的显示
            if(this._setParam && this._setKey){
                this._setRefushData(this._setKey,this._setParam)
            }
        }
        
    },
    _getLanKeyByVal:function(val){
        function findKey (obj,value, compare = (a, b) => a === b) {

            return Object.keys(obj).find(k => compare(obj[k], value))
        }
        return findKey(cc.vv.Language,val)
    }

    // update (dt) {},
});
