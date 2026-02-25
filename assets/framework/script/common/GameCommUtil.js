/*
** Manager the global function
* 主要是一些在拉米中也可能用到的方法，如果添加到globfunc中可能会麻烦同步
*/
var GlobalComm = require('GlobalVar');

//统一封装一下手动加载的资源
GlobalComm.loadRes = function (url, restype, completeCallback) {
    return cc.loader.loadRes(url, restype, function (err, res) {
        if (completeCallback) {
            completeCallback(err, res);
        }
        // if(!err){
        //     cc.loader.setAutoReleaseRecursively(res, true);
        // }

    });
}



//ps:截取2位小数点：3.145 => 3.14 不同于toFixed(2)是四舍五入保留两位小数点
//nPoint:保留小数点位数: 默认2
//return: 是字符串 和toFixed返回的类型一样
//usage: Global.S2P(3.145)
//split2pint 简写 S2P
GlobalComm.S2P = function (val, nPoint) {
    if (nPoint >= 0) {
    }
    else {
        nPoint = 0
    }

    //因客户端自己累加的时候可能会出现很多.9999999的情况，
    //服务端最多只有4位小数点，所以4位小数点后的采取四舍五入
    let pointSave = function (input) {
        //按4位小数点后面四舍五入
        let fixNum = Math.round(Number(input) * Math.pow(10, 4))
        return fixNum / Math.pow(10, 4)
    }
    val = pointSave(val)

    let nRate = Math.pow(10, nPoint) //保留2位
    let temp = Number(val)
    temp = Math.floor(pointSave(temp * nRate)) / nRate
    temp = temp.toFixed(nPoint)
    return temp
}

// 添加序列帧动画 支持跨多个纹理集 spriteDataList 结构为[{start:1,end:12,atlas:"test",prefix:"tt"},{}]
GlobalComm.createClip = (node, spriteDataList, animationName = "action", isLoop = true, speed = 1 / 7, zeroize = true, nSizeModel = cc.Sprite.SizeMode.RAW) => {
    let animation = node.getComponent(cc.Animation);
    if (animation === null) animation = node.addComponent(cc.Animation);
    animation.enabled = true;

    let clips = animation.getClips();
    for (let i = 0; i < clips.length; ++i) {
        if (clips[i].name === animationName) {
            cc.vv.gameData.addAnimationList(node);
            return;
        }
    }

    // 是否需要补零
    let getZeroize = (num, zeroize) => {
        if (zeroize) {
            let str = num < 10 ? ("0" + num) : num;
            return str;
        }
        else {
            return num;
        }
    }

    // 创建动画
    let framesList = [];
    for (let i = 0; i < spriteDataList.length; ++i) {
        for (let j = spriteDataList[i].start; j <= spriteDataList[i].end; ++j) {
            let atlas = cc.vv.gameData.resMgr.getAtlas(spriteDataList[i].atlas);
            let spriteName = spriteDataList[i].prefix + (getZeroize(j, zeroize));
            let frame = atlas.getSpriteFrame(spriteName);
            if (frame) {
                framesList.push(frame);
            }
            else {
                AppLog.warn("######### 没有找到序列帧:" + spriteName);
            }
        }
    }
    let clipAnimation = cc.AnimationClip.createWithSpriteFrames(framesList);
    clipAnimation.wrapMode = isLoop ? cc.WrapMode.Loop : cc.WrapMode.Normal;
    clipAnimation.sample = 30;
    clipAnimation.speed = speed;
    clipAnimation.name = animationName;
    node.getComponent(cc.Sprite).trim = false;
    node.getComponent(cc.Sprite).sizeMode = nSizeModel;
    animation.addClip(clipAnimation);

    if (cc.vv.gameData.addAnimationList) {
        cc.vv.gameData.addAnimationList(node);
    }

    return clipAnimation;
}

//异步加载一张图片设置精灵
//path路径
//sprobj精灵对象
GlobalComm.setSpriteSync = function (path, sprObj) {
    cc.loader.loadRes(path, cc.SpriteFrame, function (err, spriteFrame) {
        sprObj.getComponent(cc.Sprite).spriteFrame = spriteFrame;
    });
}

//数字滚动的效果
//lblObj 需要执行动作的label
//nBeginNum 开始数字
//nEndNum 结束数字
//nDur 持续时间 > 0  指定时间内滚动完
//finishCall 结束回调
//perChangeCall 每次数字变化的回调：ps播放数字变化音效
//nPoint 小数点位数
//bFormatDot 格式化成带逗号形式
//unit :单位，是1000，1000000这种，用来格式成100,000K
GlobalComm.doRoallNumEff = function (lblObj, nBeginNum, nEndNum, nDur = 1.5, finishCall, perChangeCall, nPoint = 2, bFormatDot, unit, fromatStr) {
    let lblCmp = lblObj.getComponent(cc.Label)
    if (lblCmp) {

        let setNum = function (lbl, numVal) {

            let strNum = Global.SavePoints(numVal, nPoint)
            let showStr = strNum
            if (bFormatDot) {
                showStr = Global.FormatNumToComma(Number(strNum))
            }
            if (unit) {
                showStr = Global.formatNumShort(Number(strNum), nPoint)
            }
            if (fromatStr) {
                lbl.string = cc.js.formatStr(fromatStr, showStr)
            }
            else {
                lbl.string = showStr
            }

        }

        setNum(lblCmp, nBeginNum)

        if (nBeginNum == nEndNum || nEndNum < 1) { //设置为同一个数，就没必要滚动了
            setNum(lblCmp, nEndNum);
            if (finishCall) {
                finishCall()
            }
            return
        }
        let nDifTime = 0.04
        let nRoallTime = Math.floor(nDur / nDifTime)
        let nDif = Math.floor(((nEndNum - nBeginNum) / nRoallTime) * 100) / 100
        if ( nDif % 10 == 0) {
            //被10整除了，可能累加末位数字不会变化。此时需要
            nDif = nDif - 1
            nRoallTime = Math.floor(((nEndNum - nBeginNum) / nDif) * 100) / 100

        }

        if (nDif == 0) {
            nDif = 1
        }
        //修正：小于1的增长
        if(nRoallTime < 0){
            nRoallTime = 1
            nDif = nEndNum - nBeginNum
        }
        let nStart = nBeginNum
        let changeNum = function () {
            nStart += nDif
            setNum(lblCmp, nStart)

        }
        let actionDelay = cc.delayTime(nDifTime)
        let actionCall = cc.callFunc(() => {
            changeNum()
        })
        let perAddCall = cc.callFunc(() => {
            //每次数字变化的回调。可用来播放加钱音效
            if (perChangeCall) {
                perChangeCall(nStart)
            }
        })
        let seqAc = cc.repeat(cc.sequence(actionDelay, actionCall, perAddCall), nRoallTime)
        let lastCall = cc.callFunc(() => {
            setNum(lblCmp, nEndNum)
            if (finishCall) {
                finishCall()
            }
        })
        lblCmp.node.stopAllActions()
        lblCmp.node.runAction(cc.sequence(seqAc, lastCall))

    }
}

//是否是boolean类型
Global.isBoolean = function (val) {
    if (val == true || val == false) {
        return true
    }
    return false
}

//恢复Blink动作:避免出现node不显示的问题
//cc.blink动作在web上是修改opacity,但是在native下是修改visible属性(不是active)
//调用下面的接口来停止cc.blink动作
Global.resetBlink = function (obj) {
    if (obj) {
        let className = cc.js.getClassName(obj)
        let node = obj.node
        if (className == 'cc.Node') {
            node = obj
        }

        if (node) {
            node.stopAllActions()
            node.opacity = 255
            node.active = true
        }
    }
}

//按队列加载资源
//datas加载的资源列表
//preCall每次加载完成一个的进度回调
//finishCall加载结束的回调
//beginNum开始下载的下标
//loadNum每次下载的数量
Global.LoadByQueue = function (datas, resType, proCall, finishCall, beginNum, loadNum) {
    let idx = 0
    if (beginNum) {
        idx = beginNum
    }
    if (!loadNum) {
        loadNum = 1
    }
    let doNextCall = function (err, res) {
        if (proCall) {
            proCall(err, res)
        }

        idx = idx + loadNum
        if (idx < datas.length) {
            Global.LoadByQueue(datas, resType, proCall, finishCall, idx, loadNum)
        }
        else {
            if (finishCall) {
                finishCall()
            }
        }
    }
    if (loadNum > 1) {
        //一次加载多个
        let arr = []
        for (let i = 0; i < loadNum; i++) {
            let con = idx + i
            if (con < datas.length) {
                arr.push(datas[con])
            }

        }
        cc.loader.loadResArray(arr, resType, function (err, assets) {
            doNextCall(err, assets)
        });
    }
    else {
        this.loadRes(datas[idx], resType, doNextCall)
    }

}

//精灵灰太
//spr为精灵节点
//bGray:true显示灰太，false常态
Global.showSpriteGray = function (spr, bGray) {
    if (spr) {
        let nState = '2d-sprite'
        if (bGray) {
            nState = '2d-gray-sprite'
        }
        spr.getComponent(cc.Sprite).setMaterial(0, cc.Material.getBuiltinMaterial(nState))
    }


}

//格式化数值显示
Global.formatNumShort = function (nVal, nPoint = 2) {
    //1000
    //1000000
    //1000000000
    //1000000000000
    let str = ''
    let pointVal = Math.pow(10, nPoint)
    // if(nVal > 1000000000000){
    //     let tVal = Math.floor((nVal/1000000000000)*100) /100
    //     str = tVal + 'T'
    // }
    // else 
    if (nVal >= 1000000000) {
        let tVal = Math.floor((nVal / 1000000000) * pointVal) / pointVal
        str = tVal + 'B'
    }
    else if (nVal >= 1000000) {
        let tVal = Math.floor((nVal / 1000000) * pointVal) / pointVal
        str = tVal + 'M'
    }
    else if (nVal >= 1000) {
        let tVal = Math.floor((nVal / 1000) * pointVal) / pointVal
        str = tVal + 'K'
    }
    else {
        str = nVal
    }

    return str

}

//横屏设计分辨率缩放
//共用节点都是按照1080*1920设计的，大小需要缩放到当前场景的分辨率
Global.FixDesignScale = function (node) {
    let fixDesigin = Global.designSize

    let curGameId = cc.vv.AppData.getGameId()
    if (curGameId && curGameId > 0) {
        let data = cc.vv.GameDataCfg.getGameData(curGameId);
        if (data) {

            if (data.orientation == "portrait") {
                let curCanvas = cc.find('Canvas').getComponent(cc.Canvas)
                let scaleX = curCanvas.designResolution.width / fixDesigin.height
                let scaleY = curCanvas.designResolution.height / fixDesigin.width
                let min = (scaleX > scaleY ? scaleY : scaleX)

                node.scale = node.scale * min
                return min
            }
        }
    }
    return 1
}

//竖屏设计的UI
//共用节点都是按照1080*1920设计的，大小需要缩放到当前场景的分辨率
Global.FixDesignScale_V = function (node, forse) {
    let fixDesigin = cc.size(1080, 1920)
    let doFix = function () {
        let curCanvas = cc.find('Canvas').getComponent(cc.Canvas)
        let scaleX = curCanvas.designResolution.width / fixDesigin.width
        let scaleY = curCanvas.designResolution.height / fixDesigin.height
        let min = (scaleX > scaleY ? scaleY : scaleX)
        if (node) {
            node.scale = node.scale * min
        }
        return min
    }
    if (forse) {
        return doFix()
    }
    let curGameId = cc.vv.AppData.getGameId()
    if (curGameId && curGameId > 0) {
        let data = cc.vv.GameDataCfg.getGameData(curGameId);
        if (data) {

            if (data.orientation == "portrait") {
                return doFix()
            }
        }
    }
    return 1
}

//飞金币
// fromNode:金币开始飞的节点
// toNode: 金币结束飞的节点
// endCall: 结束回调
// rollData:{lblCoin:数字滚动节点, addCoin:滚动增加的数字}
Global.FlyCoin = function (fromNode, toNode, endCall, rollData, bCopyHallCoin) {
    //检查当前canvas下有没有flycoin的节点，没有就添加
    //位置转换：会将fromNode,toNode转换到flycoin下的坐标来显示
    let self = this
    if (!toNode) {
        toNode = cc.find(Global.HALL_COIN_NODE_PATH)
        if (!toNode) {
            toNode = cc.find(Global.INGAME_COIN_NODE_PATH)
        }
    }
    let doFly = function (node) {
        Global.FixDesignScale_V(node)
        if (cc.isValid(fromNode) && cc.isValid(toNode) && cc.isValid(node)) {
            let fromWordPos = fromNode.convertToWorldSpaceAR(cc.v2(0, 0))
            let toWordPos = toNode.convertToWorldSpaceAR(cc.v2(0, 0))
            let fromNodePos = node.convertToNodeSpaceAR(fromWordPos)
            let toNodePos = node.convertToNodeSpaceAR(toWordPos)

            let _copyHallNode
            if (bCopyHallCoin && rollData) {
                _copyHallNode = cc.find('copyhallcoin', node)
                if (!_copyHallNode) {
                    let targetNode = cc.find(Global.HALL_TOPCOIN_PATH)
                    if (!targetNode) {
                        targetNode = cc.find(Global.INGAME_COIN_NODE_PATH).parent
                    }
                    if (targetNode) {
                        let copNode = cc.instantiate(targetNode)
                        let pos = node.convertToNodeSpaceAR(targetNode.convertToWorldSpaceAR(cc.v2(0, 0)))

                        copNode.name = 'copyhallcoin'
                        copNode.parent = node
                        copNode.position = pos

                        _copyHallNode = copNode
                    }
                }
                rollData.lblCoin = cc.find('lbl_coin', _copyHallNode)
                if (!rollData.lblCoin) {
                    rollData.lblCoin = cc.find('lbl_coinsNum', _copyHallNode)
                }
                _copyHallNode.active = true
            }
            let flyEnd = function () {
                if (endCall) {
                    endCall()
                }
                if (bCopyHallCoin) {
                    Global.dispatchEvent(EventId.UPATE_COINS)
                    if (_copyHallNode) {
                        _copyHallNode.active = false
                    }
                }

            }
            let script = node.getComponent('FlyCoins')
            if (script) {
                script.showFlyCoins(fromNodePos, toNodePos, 20, flyEnd, rollData)
            }
        }
        else {
            if (endCall) {
                endCall()
            }
        }



    }

    let flyNode = cc.find("Canvas/flycoin")
    if (!flyNode) {
        //add
        cc.loader.loadRes("CashHero/prefab/flycoins", cc.Prefab, (err, prefab) => {
            if (!err) {
                let newNode = cc.instantiate(prefab)
                newNode.x = 0
                newNode.y = 0
                newNode.parent = cc.find("Canvas")
                doFly(newNode)
            }
        })
    }
    else {
        doFly(flyNode)
    }

}

Global.FlyCoinInPokerHero = function (fromNode, toNode, endCall, rollData, bCopyHallCoin) {
    //检查当前canvas下有没有flycoin的节点，没有就添加
    //位置转换：会将fromNode,toNode转换到flycoin下的坐标来显示
    let self = this
    if (!toNode) {
        toNode = cc.find("Canvas/UserinfoBar/金币/icon");
        if (!toNode) {
            toNode = cc.find(Global.INGAME_COIN_NODE_PATH)
        }
    }
    let doFly = function (node) {
        Global.FixDesignScale_V(node)
        if (cc.isValid(fromNode) && cc.isValid(toNode) && cc.isValid(node)) {
            let fromWordPos = fromNode.convertToWorldSpaceAR(cc.v2(0, 0))
            let toWordPos = toNode.convertToWorldSpaceAR(cc.v2(0, 0))
            let fromNodePos = node.convertToNodeSpaceAR(fromWordPos)
            let toNodePos = node.convertToNodeSpaceAR(toWordPos)

            let _copyHallNode
            if (bCopyHallCoin && rollData) {
                _copyHallNode = cc.find('copyhallcoin', node)
                if (!_copyHallNode) {
                    let targetNode = cc.find("Canvas/UserinfoBar/金币")
                    if (!targetNode) {
                        targetNode = cc.find(Global.INGAME_COIN_NODE_PATH).parent
                    }
                    if (targetNode) {
                        let copNode = cc.instantiate(targetNode)
                        let pos = node.convertToNodeSpaceAR(targetNode.convertToWorldSpaceAR(cc.v2(0, 0)))

                        copNode.name = 'copyhallcoin'
                        copNode.parent = node
                        copNode.position = pos

                        _copyHallNode = copNode
                    }
                }
                rollData.lblCoin = cc.find('lbl_coin', _copyHallNode)
                if (!rollData.lblCoin) {
                    rollData.lblCoin = cc.find('lbl_coinsNum', _copyHallNode)
                }
                _copyHallNode.active = true
            }
            let flyEnd = function () {
                if (endCall) {
                    endCall()
                }
                if (bCopyHallCoin) {
                    Global.dispatchEvent(EventId.UPATE_COINS)
                    if (_copyHallNode) {
                        _copyHallNode.active = false
                    }
                }

            }
            let script = node.getComponent('FlyCoins')
            if (script) {
                script.showFlyCoins(fromNodePos, toNodePos, 20, flyEnd, rollData)
            }
        }
        else {
            if (endCall) {
                endCall()
            }
        }



    }

    let flyNode = cc.find("Canvas/flycoin")
    if (!flyNode) {
        //add
        cc.loader.loadRes("BalootClient/BaseRes/prefabs/flycoins", cc.Prefab, (err, prefab) => {
            if (!err) {
                let newNode = cc.instantiate(prefab)
                newNode.parent = cc.find("Canvas")
                doFly(newNode)
            }
        })
    }
    else {
        doFly(flyNode)
    }

}


/**
 * 
 * @param {*} val 音量.
 * 降低背景音，需要背景音乐是开启的状态
 */
Global.ChangeBgmVol = function (val) {
    let old = cc.vv.AudioManager.getBgmVolume()
    if (old != 0) {
        cc.vv.AudioManager.setBgmVolume(val)
    }
}

Global.comloadsprite = function (url, obj, exData) {
    if (exData) {
        obj.userTag = exData
    }

    cc.loader.loadRes(url, cc.SpriteFrame, (err, res) => {
        if (!err) {
            if (cc.isValid(obj)) {

                if (obj.userTag) {
                    if (obj.userTag == res.name) {
                        obj.getComponent(cc.Sprite).spriteFrame = res
                    }
                }
                else {
                    obj.getComponent(cc.Sprite).spriteFrame = res
                }

            }
        }
    })
}

Global.loadSpine = function(url,obj,animationName,bLoop){
    cc.loader.loadRes(url,sp.SkeletonData,(err,data)=>{
        if(cc.isValid(obj)){
            let EffSpine = obj.getComponent(sp.Skeleton)
            EffSpine.skeletonData = data;
            EffSpine.setAnimation(0,animationName,bLoop);
        }
        
    })
}


//是否今日已经弹窗
//return true需要弹，false不需要弹
Global.needPopDayTips = function(tipKey){
    let res = false
    let last = Global.getLocal(tipKey)
    if(last){
        let day1 = new Date(last).toDateString()
        let day2 = new Date().toDateString()
        let bSameday = (new Date(last).toDateString() === new Date().toDateString())
        if(bSameday){
            res = false
        }
        else{//不同天
            let curtime = new Date().toDateString()
            Global.saveLocal(tipKey,curtime)
            res = true
        }
    }
    else{
        //没弹过
        let curtime = new Date().toDateString()
        Global.saveLocal(tipKey,curtime)
        res = true
    }
    return res
}

//是否为当天
Global.sameDay = function(t){

if (new Date(Number(t)* 1000).toDateString() === new Date().toDateString()) {
  return true;
} else if (new Date(Number(t)* 1000) < new Date()){
  return false;
}
return false
}
