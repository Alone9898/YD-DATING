/**
 * 多语言控件基类
 */
cc.Class({
    extends: cc.Component,

    properties: {
       
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
    
        Global.registerEvent(EventId.SYS_CHANGE_LANGUAGE,this.onEventChangeLan,this)
    },

    // onDestroy(){
    //     this.node.off(EventId.SYS_CHANGE_LANGUAGE,this.onEventChangeLan,this)
    // },

    start () {

    },

    //更新多语言显示
    display(){
        cc.log('语言切换')
    },

    /**
     * 
     * @param {是否在语言列表中} val 
     * @returns true/false
     */
    isInLanguageList:function(val){
        
        let res = false
        let arr = Global.languageList
        if(arr){
            for(let i = 0; i < arr.length; i++){
                if(arr[i] == val){
                    res = true
                    break
                }
            }
        }
        
        return res
    },

    onEventChangeLan:function(param){

        Global.saveLocal(Global.SAVE_LANGUAGE,Global.language);

        //加载框架的多语言文件
        if(Global.language === Global.LANGUAGE.ZH){
            cc.vv.Language = require("ChineseCfg");
        } 
        else {
            //默认用英语
            cc.vv.Language = require("EnglishCfg");
        }           

        //项目扩展多语言文件直接用 en.js,zh.js,ar.js 命名
        //与框架Key相同的会被覆盖，使用项目中的Key值
        if(Global.languageList){
            for(let i = 0; i < Global.languageList.length; i++){
                if(Global.languageList[i] == Global.language){
                    let extLancfg = require(Global.language)
                    Object.assign(cc.vv.Language,extLancfg)
                }
            }
        }
        

        this.display()
    }

    // update (dt) {},
});
