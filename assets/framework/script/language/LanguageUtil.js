/**
 * 多语言扩展
 */

var i18nClass = cc.Class({
    extends: cc.Component,

    statics: {
       
        /**
         * 
         * @param {*} node 多语言节点
         * @param {*} textKey 多语言Key
         * @param  {...any} theArgs 多语言参数根据key中的参数来设定。{1}对应theArgs的第一个参数，以此类推
         */
        setI18nLabel:function(node,textKey,...theArgs){
            if(node){
                let lanLabemCmp = node.getComponent("LanguageLabel")
                if(!lanLabemCmp){
                    lanLabemCmp = node.addComponent("LanguageLabel")
                }
                
                lanLabemCmp.setLabel(textKey,...theArgs)
            }
        },

        /**
         * 设置多语言的图片节点。图片位置不需要变化的。有些更复杂的，可以用setI18SpriteChangeCall
         * @param {*} node 
         * @param {*} lanType 
         * @param {*} spriteFrameVal 
         */
        setI18Sprite:function(node,lanType,spriteFrameVal){
            if(node){
                let lanSprite = node.getComponent("LanguageSprite")
                if(!lanSprite){
                    lanSprite = node.addComponent("LanguageSprite")
                }
                lanSprite.setSptite(lanType,spriteFrameVal)
            }
        },

        /**
         * 多语言外部自己控制，这里只是提供切换语言的时候的一个显示调用
         * @param {*} node 
         * @param {*} changeCall 
         */
        setI18SpriteChangeCall:function(node,changeCall){
            if(node){
                let lanSprite = node.getComponent("LanguageSprite")
                if(!lanSprite){
                    lanSprite = node.addComponent("LanguageSprite")
                }
                lanSprite.setSpriteChangeCall(changeCall)
            }
        },

        /**
         * 调整参数位置：如果参数在尾部，就替换到头部。这样手机上显示就会到尾部
         * @param {*} str 
         * @returns 
         */
        ChangeParamPos:function(str){
            let newStr = str
            if(Global.language === Global.LANGUAGE.AR){
                //如果是阿拉伯语，才需要调整参数语序
                let modStr = /^[a-zA-Z0-9-\\{\\}!%٪]{1,30}/
                let arrays = modStr.exec(newStr)
                if(arrays){
                    if(arrays.index == 0 && arrays[0].length < arrays.input.length){
                        //截断
                        let tempstr = newStr.replace(modStr,"")
                        newStr = tempstr + arrays[0]
                    }
                    
                }
               
            }
            return newStr
        },

        /**
         * 获得加入参数后的字符串 方便floattip 显示
         * @param {*} textKey 多语言Key
         * @param {*} data 数据
         * @returns 
         */
         getI18nLabel:function(str, data){
            let newStr = str.replace('{' + 1 + '}', data)
            return newStr
        }
    },

    
});

window.I18N = i18nClass
