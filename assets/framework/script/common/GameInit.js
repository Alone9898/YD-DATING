// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html

module.exports ={
    init(){
        let appData = require("AppData");
        cc.vv.AppData = new appData();
        cc.vv.AppData.init();

        
        //默认取Global.language的默认语言配置
        let lang = Global.getLocal(Global.SAVE_LANGUAGE);
        if(lang){ //如果有设置过语言，取设置后的语言
            Global.language = lang;
        }
        else{
            //根据设备语言来显示.如果是阿拉伯文，就用阿拉伯文。否则用英文默认的
            let sysLan = cc.sys.language
            if(sysLan == Global.LANGUAGE.AR){
                Global.language = sysLan
            }
            
        }
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

        
        

        // let shake = cc.sys.localStorage.getItem("shake");
        // if(shake === "true"){
        //     shake = true;
        // } 
        // else if(shake === "false"){
        //     shake = false;
        // }
        // else{
        //     //默认开启
        //     shake = true
        // }
        // Global.setShake(shake);

        // cc.vv.PathMgr = require("PathManager");
        // cc.vv.SlotGameCfg = require("SlotMachine_GameCfg");
        cc.vv.GameItemCfg = require("GameItemCfg");
    },

};

