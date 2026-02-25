/*
** Log封装
** 定义比较方便使用的log封装
*/

window.LogMode = cc.debug.DebugMode.INFO;
var AppLog = cc.Class({
    extends: cc.Component,
    statics: {
        getDateString : function () {
            var d = new Date();
            var str = d.getHours();
            var timeStr = "";
            timeStr += (str.length==1? "0"+str : str) + ":";
            str = d.getMinutes();
            timeStr += (str.length==1? "0"+str : str) + ":";
            str = d.getSeconds();
            timeStr += (str.length==1? "0"+str : str) + ":";
            str = d.getMilliseconds();
            if( str.length==1 ) str = "00"+str;
            if( str.length==2 ) str = "0"+str;
            timeStr += str;

            timeStr = "[" + timeStr + "]";
            return timeStr;
        },

        stack : function (index) {
            var e = new Error();
            var lines = e.stack.split("\n");
            lines.shift();
            var result = [];
            lines.forEach(function (line) {
                line = line.substring(7);
                var lineBreak = line.split(" ");
                if (lineBreak.length<2) {
                    result.push(lineBreak[0]);
                } else {
                    result.push({[lineBreak[0]] : lineBreak[1]});
                }
            });

            if (index == -1) {
                var logstr = 'ERROR Function stack:';
                for (var i=2; i < result.length; i++) {
                    logstr += '\n\t';
                    if (typeof result[i] != 'string') {
                        var list = [];
                        for (var a in result[i]) {
                            list.push(a);
                        }
                        logstr += list[0];
                        logstr += result[i][list[0]];
                    }
                    else {
                        logstr += result[i];
                    }                    
                }
                logstr += '\nLog: ';
                return logstr;
            }
            else if(index < result.length-1){
                var list = [];
                for(var a in result[index]){
                    list.push(a);
                }
                //var splitList = list[0].split(".");
                return (list[0] + result[index][list[0]] + "\n\tLog: ");
            }
        },

        log : function () {
            var backLog = console.log || cc.log || log;

            if(LogMode <= cc.debug.DebugMode.INFO){
                if (Global.isNative()) {
                    backLog(AppLog.getDateString() + "Log: " + cc.js.formatStr.apply(cc,arguments));
                }
                else {
                    backLog.call(this,"%c%s%s"+cc.js.formatStr.apply(cc,arguments),"color:#4E455F;",this.stack(3),AppLog.getDateString());  
                }
            }
        },

        info : function () {
            var backLog = console.log || cc.log || log;
            if(LogMode <= cc.debug.DebugMode.INFO){
                if (Global.isNative()) {
                    backLog(AppLog.getDateString() + "Info: " + cc.js.formatStr.apply(cc,arguments));
                }
                else {
                    backLog.call(this,"%c%s%s:"+cc.js.formatStr.apply(cc,arguments),"color:#00CD00;",this.stack(2),AppLog.getDateString());
                }
            }
        },

        warn : function () {
            var backLog = console.log || cc.log || log;
            if(LogMode <= cc.debug.DebugMode.WARN){
                if (Global.isNative()) {
                    backLog(AppLog.getDateString() + "Warn: " + cc.js.formatStr.apply(cc,arguments));
                }
                else {
                    backLog.call(this,"%c%s%s:"+cc.js.formatStr.apply(cc,arguments),"color:#ee7700;",this.stack(2),AppLog.getDateString());
                }
            }
        },

        err : function () {
            var backLog = console.log || cc.log || log;
            if(LogMode <= cc.debug.DebugMode.ERROR){
                if (Global.isNative()) {
                    backLog(AppLog.getDateString() + "Error: " + cc.js.formatStr.apply(cc,arguments));
                }
                else {
                    backLog.call(this,"%c%s%s:"+cc.js.formatStr.apply(cc,arguments),"color:red",this.stack(-1),AppLog.getDateString());
                }
            }
        },

        ShowScreen : function(){
            let val = cc.sys.localStorage.getItem('screen_log');
            if(!val){
                return
            }
            let str = AppLog.getDateString() + cc.js.formatStr.apply(cc,arguments)
            this._screenLogs = this._screenLogs || []
            this._screenLogs.push(str)
            
            let lay_logs = cc.find('Canvas/lay_logs')
            if(!lay_logs){
                //add
                lay_logs = new cc.Node('lay_logs')
                lay_logs.anchorY = 1
                lay_logs.anchorX = 0
                let widcmp = lay_logs.addComponent(cc.Widget)
                widcmp.isAlignTop = true
                widcmp.top = 0
                widcmp.isAlignLeft = true
                widcmp.left = 0
                widcmp.isAlignRight = true
                widcmp.right = 0

                let lay = lay_logs.addComponent(cc.Layout)
                lay.type = cc.Layout.Type.VERTICAL
                lay.resizeMode = cc.Layout.ResizeMode.CONTAINER
                lay.spacingY = 5

                lay_logs.parent = cc.find('Canvas')
            }

            //log item 
            do{
                let showItem = this._screenLogs.shift()
                if(showItem){
                    let lbl = new cc.Node()
                    lbl.anchorX = 0
                    let lblcmp = lbl.addComponent(cc.Label)
                    lblcmp.string = showItem
                    lay_logs.addChild(lbl)
                }
                
            }
            while(this._screenLogs.length>0)
            

        } ,
    },
});

window.AppLog = AppLog;
