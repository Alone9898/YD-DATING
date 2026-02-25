/**
 * 内存打印工具
 */
cc.Class({
    extends: cc.Component,

    properties: {
       
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        Global.registerEvent("MEM_PRINT",this.onEventPrint,this)
    },

    start () {

    },

    print(filter){
        var textures = cc.loader._cache;
        let nTotalCount = 0
        let nTotalMem = 0
        for(let key in textures){
            if(textures[key].type == "png" || textures[key].type == "jpg"){
                let item = textures[key]
                if(cc.isValid(item,true)){
                    let url = item.url
                    var num = ((item.content.width * item.content.height)*(url.indexOf(".jpg")>-1?3:4)/1024/1024).toFixed(2)
                    nTotalMem += Number(num)
                    nTotalCount += 1
                    if(Number(num) > filter){
                        console.log(url+"大小:"+num)
                    }
                }
                
                
            }
            // else{
            //     console.log(textures[key].url+"type:"+textures[key].type)
            // }
        }

        console.log("文件总数"+ nTotalCount + "总内存:"+nTotalMem)
    },

    onEventPrint(param){
        let val_filter = 0
        if(param && param.detail) {
            val_filter = param.detail
        }
        this.print(val_filter)
    }

    // update (dt) {},
});
