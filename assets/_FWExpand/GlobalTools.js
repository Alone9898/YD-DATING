var GlobalFunc = require('GlobalVar');

// 函数padLeftZero的作用：如果月份为1位(如9),则在其左边补0(变为09)
GlobalFunc.padLeftZero = (str) => {
    return "0" + str.substr(str.length - 1)
}

GlobalFunc.formatTime = (fmt, timestamp) => {
    var date = new Date(timestamp * 1000)
    if (/(y+)/.test(fmt)) {
        // $1标识第一个子串中的内容；这里当fmt格式中年份少于4位时，从后往前取
        fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
    }
    let filterMap = {
        "M+": date.getMonth() + 1,
        "d+": date.getDate(),
        "h+": date.getHours(),
        "m+": date.getMinutes(),
        "s+": date.getSeconds()
    };
    for (let key in filterMap) {
        if (new RegExp(`(${key})`).test(fmt)) {
            let str = filterMap[key] + "";
            fmt = fmt.replace(RegExp.$1, str.length === 2 ? str : GlobalFunc.padLeftZero(str));
        }
    }
    return fmt;
}
// 将剩余秒数装换为时间格式
GlobalFunc.formatSecond = function (second, fmt) {
    if (!fmt) fmt = 'hh:mm:ss';
    let filterMap = {
        "h+": Math.floor(second / 3600),
        "m+": Math.floor(second % 3600 / 60),
        "s+": second % 3600 % 60
    };
    for (let key in filterMap) {
        if (new RegExp(`(${key})`).test(fmt)) {
            let str = filterMap[key] + "";
            fmt = fmt.replace(RegExp.$1, str.length === 2 ? str : GlobalFunc.padLeftZero(str));
        }
    }
    return fmt;
}

//替换自定义后缀
GlobalFunc.formatNumber = function (num, args) {
    args = args || {};
    let unitArr = ['', 'K', 'M', 'B', 'T', 'Q'];
    let sign = num >= 0 ? 1 : -1;  //符号
    let absNum = Math.abs(num);
    let decimal = args.decimal || 2;
    let radix = args.radix || 1000;
    let threshold = args.threshold || 10000;
    if (absNum < threshold) {
        return GlobalFunc.FormatNumToComma(num);
        // return num;
    }
    let sum = 0;
    while (absNum >= radix) {
        sum++;
        absNum = absNum / radix;
    }
    return Number((sign * absNum).toFixed(decimal)) + unitArr[sum];
}

GlobalFunc.deepClone = function (obj) {
    var copy;
    // Handle the 3 simple types, and null or undefined
    if (null == obj || "object" != typeof obj) return obj;
    // Handle Date
    if (obj instanceof Date) {
        copy = new Date();
        copy.setTime(obj.getTime());
        return copy;
    }
    // Handle Array
    if (obj instanceof Array) {
        copy = [];
        for (var i = 0, len = obj.length; i < len; i++) {
            copy[i] = GlobalFunc.deepClone(obj[i]);
        }
        return copy;
    }
    // Handle Function
    if (obj instanceof Function) {
        copy = function () {
            return obj.apply(this, arguments);
        }
        return copy;
    }
    // Handle Object
    if (obj instanceof Object) {
        copy = {};
        for (var attr in obj) {
            if (obj.hasOwnProperty(attr)) copy[attr] = GlobalFunc.deepClone(obj[attr]);
        }
        return copy;
    }
    throw new Error("Unable to copy obj as type isn't supported " + obj.constructor.name);
}

// 飞钻石
Global.FlyDiamond = function (fromNode, toNode, endCall, rollData, bCopyHallCoin) {
    //检查当前canvas下有没有flycoin的节点，没有就添加
    if (!toNode) {
        toNode = cc.find("Canvas/UserinfoBar/钻石/icon")
    }
    //位置转换：会将fromNode,toNode转换到flycoin下的坐标来显示
    let doFly = function (node) {
        Global.FixDesignScale_V(node)
        if (cc.isValid(fromNode) && cc.isValid(toNode) && cc.isValid(node)) {
            let fromWordPos = fromNode.convertToWorldSpaceAR(cc.v2(0, 0))
            let toWordPos = toNode.convertToWorldSpaceAR(cc.v2(0, 0))
            let fromNodePos = node.convertToNodeSpaceAR(fromWordPos)
            let toNodePos = node.convertToNodeSpaceAR(toWordPos)
            let _copyHallNode
            if (bCopyHallCoin && rollData) {
                _copyHallNode = cc.find('copyhalldiamond', node)
                if (!_copyHallNode) {
                    let targetNode = cc.find("Canvas/UserinfoBar/钻石")
                    // if (targetNode) {
                    let copNode = cc.instantiate(targetNode)
                    let pos = node.convertToNodeSpaceAR(targetNode.convertToWorldSpaceAR(cc.v2(0, 0)))
                    copNode.name = 'copyhalldiamond'
                    copNode.parent = node
                    copNode.position = pos
                    _copyHallNode = copNode
                    // }
                }
                rollData.lblCoin = cc.find('lbl_val', _copyHallNode)
                _copyHallNode.active = true
            }
            let flyEnd = function () {
                if (endCall) {
                    endCall()
                }
                if (bCopyHallCoin) {
                    Global.dispatchEvent(EventId.UPATE_DIAMOND)
                    if (_copyHallNode) {
                        _copyHallNode.active = false
                    }
                }

            }
            let script = node.getComponent('FlyDiamonds')
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
    let flyNode = cc.find("Canvas/flydiamonds")
    if (!flyNode) {
        cc.loader.loadRes("BalootClient/BaseRes/prefabs/flydiamonds", cc.Prefab, (err, prefab) => {
            if (!err) {
                let newNode = cc.instantiate(prefab)
                newNode.parent = cc.find("Canvas")
                newNode.zIndex = 999;
                doFly(newNode)
            }
        })
    }
    else {
        doFly(flyNode)
    }
}
// 飞钻石
Global.FlyCoinV2 = function (fromNode, toNode, endCall, rollData, bCopyHallCoin) {
    //检查当前canvas下有没有flycoin的节点，没有就添加
    //位置转换：会将fromNode,toNode转换到flycoin下的坐标来显示
    if (!toNode) {
        toNode = cc.find("Canvas/UserinfoBar/金币/icon")
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
                    // if (!targetNode) {
                    //     targetNode = cc.find(Global.INGAME_COIN_NODE_PATH).parent
                    // }
                    // if (targetNode) {
                    let copNode = cc.instantiate(targetNode)
                    let pos = node.convertToNodeSpaceAR(targetNode.convertToWorldSpaceAR(cc.v2(0, 0)))
                    copNode.name = 'copyhallcoin'
                    copNode.parent = node
                    copNode.position = pos
                    _copyHallNode = copNode
                    // }
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
            let script = node.getComponent('FlyCoins');
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
    let flyNode = cc.find("Canvas/flycoins")
    if (!flyNode) {
        //add
        cc.loader.loadRes("BalootClient/BaseRes/prefabs/flycoins", cc.Prefab, (err, prefab) => {
            if (!err) {
                let newNode = cc.instantiate(prefab)
                newNode.parent = cc.find("Canvas")
                newNode.zIndex = 999;
                doFly(newNode)
            }
        })
    }
    else {
        doFly(flyNode)
    }

}

// 飞任意节点
Global.FlyAnimTo = function (fromNode, toNode, parm) {
    let spriteFrame = parm.spriteFrame;
    let prefab = parm.prefab;
    let scale = parm.scale || 1;
    let delay = parm.delay || 0;
    let onStart = parm.onStart;
    let zIndex = parm.zIndex || 1000;
    let onEnd = parm.onEnd;
    let count = parm.count || 20;

    if (cc.isValid(fromNode) && cc.isValid(toNode) && (spriteFrame || prefab)) {
        let Canvas = cc.find("Canvas")

        let fromWordPos = fromNode.convertToWorldSpaceAR(cc.v2(0, 0))
        let toWordPos = toNode.convertToWorldSpaceAR(cc.v2(0, 0))
        let fromNodePos = Canvas.convertToNodeSpaceAR(fromWordPos)
        let toNodePos = Canvas.convertToNodeSpaceAR(toWordPos)

        let tempNodes = [];
        for (let i = 0; i < count; i++) {
            let flyNode = null;
            if (spriteFrame) {
                flyNode = new cc.Node();
                let sp = flyNode.addComponent(cc.Sprite)
                sp.spriteFrame = spriteFrame;
            } else if (prefab) {
                flyNode = cc.instantiate(prefab)
            }
            flyNode.scale = scale;
            flyNode.zIndex = zIndex;
            flyNode.active = false;
            flyNode.parent = cc.find("Canvas");
            tempNodes.push(flyNode)
        }

        let isStart = false;
        // 给予动画
        for (let i = 0; i < tempNodes.length; i++) {
            const _node = tempNodes[i];
            Global.FixDesignScale_V(_node)
            _node.position = _node.parent.convertToNodeSpaceAR(fromWordPos)
            // 随机生成一个中间位置
            let tempPos = fromNodePos.add(cc.v2(Math.random() * 300 - 150, Math.random() * 300 - 150));
            // 随机时间
            let animTime = 0.1 + Math.random() * 0.3;
            cc.tween(_node)
                .delay(delay)
                .call(() => {
                    _node.active = true;
                    // 回调
                    if (!isStart) {
                        onStart && onStart();
                        isStart = true;
                    }
                })
                .to(animTime, { position: tempPos })
                .delay(0.5)
                .to(0.3, { position: toNodePos, scale: 1 })
                .call(() => {
                    onEnd && onEnd(_node);
                    _node.destroy();
                })
                .start();
        }

    }
}



Global.FlyAnimToPos = function (fromWordPos, toWordPos, parm) {
    let spriteFrame = parm.spriteFrame;
    let prefab = parm.prefab;
    let scale = parm.scale || 1;
    let endScale = parm.endScale || 1;
    let delay = parm.delay || 0;
    let onStart = parm.onStart;
    let onEnd = parm.onEnd;
    let zIndex = parm.zIndex || 1000;
    let onEndOne = parm.onEndOne;
    let count = parm.count || 20;
    let onInit = parm.onInit;
    let noBoom = parm.boom || false;
    let rangeX = parm.rangeX || 150;
    let rangeY = parm.rangeY || 150;

    if ((spriteFrame || prefab)) {
        let Canvas = cc.find("Canvas")
        // let fromWordPos = fromNode.convertToWorldSpaceAR(cc.v2(0, 0))
        // let toWordPos = toNode.convertToWorldSpaceAR(cc.v2(0, 0))
        // let fromNodePos = Canvas.convertToNodeSpaceAR(fromWordPos)
        // let toNodePos = Canvas.convertToNodeSpaceAR(toWordPos)

        let tempNodes = [];
        for (let i = 0; i < count; i++) {
            let flyNode = null;
            if (spriteFrame) {
                flyNode = new cc.Node();
                let sp = flyNode.addComponent(cc.Sprite)
                sp.spriteFrame = spriteFrame;
            } else if (prefab) {
                flyNode = cc.instantiate(prefab)
            }
            flyNode.parent = Canvas;
            onInit && onInit(i, flyNode);
            flyNode.scale = scale;
            flyNode.zIndex = zIndex;
            flyNode.position = cc.v2(0, 0)
            flyNode.active = false;
            tempNodes.push(flyNode)
        }

        let isStart = false;
        let indexAnim = 0;
        // 给予动画
        for (let i = 0; i < tempNodes.length; i++) {
            const _node = tempNodes[i];
            Global.FixDesignScale_V(_node)
            _node.position = _node.parent.convertToNodeSpaceAR(fromWordPos)
            // 随机生成一个中间位置
            let tempPos = _node.parent.convertToNodeSpaceAR(fromWordPos).add(cc.v2(Math.random() * rangeX * 2 - rangeX, Math.random() * rangeY * 2 - rangeY));
            // 随机时间
            let animTime = 0.1 + Math.random() * 0.3;
            let delayTime = 0.3 + Math.random() * 0.3;
            let moveTime = 0.3 + Math.random() * 0.3;
            if (!noBoom) {
                cc.tween(_node)
                    .delay(delay)
                    .call(() => {
                        _node.active = true;
                        // 回调
                        if (!isStart) {
                            onStart && onStart();
                            isStart = true;
                        }
                    })
                    .to(animTime, { position: tempPos })
                    .delay(delayTime)
                    .to(moveTime, { position: _node.parent.convertToNodeSpaceAR(toWordPos), scale: endScale })
                    .call(() => {
                        indexAnim++;
                        // if (tempNodes.indexOf(_node) >= tempNodes.length - 1) {
                        // }
                        if (indexAnim >= tempNodes.length) {
                            onEnd && onEnd(_node);
                        }
                        onEndOne && onEndOne(_node);
                        _node.destroy();
                    })
                    .start();
            } else {
                _node.active = true;
                // 回调
                if (!isStart) {
                    onStart && onStart();
                    isStart = true;
                }
                _node.position = tempPos;
                cc.tween(_node)
                    .delay(delayTime)
                    .to(moveTime, { position: _node.parent.convertToNodeSpaceAR(toWordPos), scale: endScale })
                    .call(() => {
                        indexAnim++;
                        // if (tempNodes.indexOf(_node) >= tempNodes.length - 1) {
                        // }
                        if (indexAnim >= tempNodes.length) {
                            onEnd && onEnd(_node);
                        }
                        onEndOne && onEndOne(_node);
                        _node.destroy();
                    })
                    .start();

            }

        }
    }
}


Global.RewardFly = function (rewards, fromWorldPos) {
    let flyNode = cc.find("Canvas/RewardFlyAnim");
    if (flyNode) {
        flyNode.getComponent("RewardFlyAnim").run(rewards, fromWorldPos);
    } else {
        cc.loader.loadRes("BalootClient/BaseRes/prefabs/RewardFlyAnim", cc.Prefab, (err, prefab) => {
            if (err == null) {
                let node = cc.instantiate(prefab);
                node.parent = cc.find("Canvas")
                node.zIndex = 1000;
                node.position = cc.v2(0, 0);
                node.getComponent("RewardFlyAnim").scheduleOnce(() => {
                    node.getComponent("RewardFlyAnim").run(rewards, fromWorldPos);
                })
                // node.getComponent("RewardFlyAnim").run(rewards, fromWorldPos);
            }
        });
    }
}

Global.getId = function (id, node) {
    if (node) {
        let idCpt = node.getComponent("ID")
        if (idCpt.id == id) {
            return idCpt;
        }
    }
    node = node || cc.director.getScene();
    for (const idCpt of node.getComponentsInChildren("ID")) {
        if (idCpt.id == id) {
            return idCpt;
        }
    }
}


Global.isRealNum = (val) => {
    // isNaN()函数 把空串 空格 以及NUll 按照0来处理 所以先去除
    if (val === "" || val == null) {
        return false;
    }
    if (!isNaN(val)) {
        return true;
    } else {
        return false;
    }
}

Global.webCopyString = (str) => {
    if (cc.sys.isNative) return;
    if (window["ClipboardJS"] && window["ClipboardJS"].copy) {
        window["ClipboardJS"].copy(str);
        return;
    }
    var input = str;
    const el = document.createElement('textarea');
    el.value = input;
    el.setAttribute('readonly', '');
    el.style.contain = 'strict';
    el.style.position = 'absolute';
    el.style.left = '-9999px';
    el.style.fontSize = '12pt'; // Prevent zooming on iOS
    const selection = getSelection();
    var originalRange = false;
    if (selection.rangeCount > 0) {
        originalRange = selection.getRangeAt(0);
    }
    document.body.appendChild(el);
    el.select();
    el.selectionStart = 0;
    el.selectionEnd = input.length;
    var success = false;
    try {
        success = document.execCommand('copy');
    } catch (err) { }
    document.body.removeChild(el);
    if (originalRange) {
        selection.removeAllRanges();
        selection.addRange(originalRange);
    }
    // cc.log('复制', str, success);
    return success;
}
// 字符串打码
Global.strConfuse = (str) => {
    if (str.length < 2) {
        return str;
    } if (str.length < 5) {
        let list = str.split("");
        list[1] = "*";
        return list.join("");
    } else {
        let list = str.split("")
        for (let i = 2; i < list.length - 2; i++) {
            list[i] = "*";
        }
        return list.join("");
    }
}
// 贝塞尔 1个控制点 计算公式
Global.bezier3 = (start, mid, end, t) => {
    // P = (1−t)2P1 + 2(1−t)tP2 + t2P3
    return start.mul(Math.pow(1 - t, 2)).add(mid.mul(2 * (1 - t) * t)).add(end.mul(Math.pow(t, 2)));
}
// 贝塞尔 2个控制点 计算公式
Global.bezier4 = (start, mid, mid2, end, t) => {
    // P = (1−t)3P1 + 3(1−t)2tP2 +3(1−t)t2P3 + t3P4
    return start.mul(Math.pow(1 - t, 3)).add(mid.mul(3 * Math.pow(1 - t, 2) * t)).add(mid2.mul(3 * (1 - t) * Math.pow(t, 2))).add(end.mul(Math.pow(t, 3)));
}
// 根据起点和终点 获取中间控制点
Global.getBezier2Mid = (startPos, endPos, midLen, m1len, m2len) => {
    let toEndDir = endPos.sub(startPos);
    let toMidDir = toEndDir.mul(midLen);
    // 根据角度 确定曲线控制点 (弧度计算)
    let midAngle = toEndDir.signAngle(cc.Vec2.RIGHT);
    let pDir = toMidDir.rotate(Math.PI / 2);
    if (Math.abs(midAngle) <= Math.PI / 2) {
        // 第1,4象限
        pDir = toMidDir.rotate(Math.PI / 2);
    } else if (Math.abs(midAngle) > Math.PI / 2) {
        // 第2,3象限
        pDir = toMidDir.rotate(-Math.PI / 2);
    }
    // 计算 控制点
    let m1Pos = startPos.add(toEndDir.mul(m1len)).add(pDir);
    let m2Pos = startPos.add(toEndDir.mul(m2len)).add(pDir);
    return [m1Pos, m2Pos]
}

// 停止当前场景的所有定时器
Global.stopAllTimer = () => {
    // 停止网络监听
    let facade = window.facade;
    if (facade && facade.dm && facade.dm.msgHandler) {
        facade.dm.msgHandler.reset();
    }
    if (cc.vv.gameData) {
        if (cc.vv.gameData.onExit) {
            cc.vv.gameData.onExit();
        }
    }
    // 停止所有定时器
    for (const cpt of cc.director.getScene().getComponentsInChildren(cc.Component)) {
        cpt.unscheduleAllCallbacks();
        // cc.log(cpt.name);
        if (cpt.name != "SceneTranslate<SceneTranslate>") {
            cpt["update"] = () => { };
        }

    }
}

// 根据deskInfo的users判断是不是狙击主播
Global.whetherSnipeType = (facedeCopy, selfUid = null) => {
    let _isSnipe = false;
    let _isAttack = 0;
    let _isAnchor = 0;
    let _selfObj = null;
    //由于狙击者身上自带的字段isAttack在匹配失败也会带，所以这里同时要判断主播和自己
    if (facedeCopy && facedeCopy.dm && facedeCopy.dm.deskInfo && facedeCopy.dm.deskInfo.users) {
        for (let userInfo of facedeCopy.dm.deskInfo.users) {
            if (userInfo.isAttack) {
                _isAttack = 1;
            }
            if (userInfo.isAnchor) {
                _isAnchor = 1;
            }
            if (selfUid) {
                if (cc.vv.UserManager.uid == userInfo.uid) {
                    _selfObj = userInfo;
                }
            }
        }
    }
    if (_isAttack == 1 && _isAnchor == 1) {
        _isSnipe = true;
    }
    //返回对象
    return { snipeType: _isSnipe, selfObj: _selfObj, };
}

// 判断是不是狙击主播房间
Global.isSniperRoom = (facedeCopy) => {
    let _isAttack = 0;
    let _isAnchor = 0;
    //由于狙击者身上自带的字段isAttack在匹配失败也会带，所以这里同时要判断主播和自己
    if (facedeCopy && facedeCopy.dm && facedeCopy.dm.deskInfo && facedeCopy.dm.deskInfo.users) {
        for (let userInfo of facedeCopy.dm.deskInfo.users) {
            if (userInfo.isAttack) {
                _isAttack = 1;
            }
            if (userInfo.isAnchor) {
                _isAnchor = 1;
            }
        }
    }
    if (_isAttack == 1 || _isAnchor == 1) {
        return true;
    }
    return false;
}

let UNICODE = "ﺁﺁﺂﺂﺃﺃﺄﺄﺅﺅﺆﺆﺇﺇﺈﺈﺉﺋﺌﺊﺍﺍﺎﺎﺏﺑﺒﺐﺓﺓﺔﺔﺕﺗﺘﺖﺙﺛﺜﺚﺝﺟﺠﺞﺡﺣﺤﺢﺥﺧﺨﺦﺩﺩﺪﺪﺫﺫﺬﺬﺭﺭﺮﺮﺯﺯﺰﺰﺱﺳﺴﺲﺵﺷﺸﺶﺹﺻﺼﺺﺽﺿﻀﺾﻁﻃﻄﻂﻅﻇﻈﻆﻉﻋﻌﻊﻍﻏﻐﻎﻑﻓﻔﻒﻕﻗﻘﻖﻙﻛﻜﻚﻝﻟﻠﻞﻡﻣﻤﻢﻥﻧﻨﻦﻩﻫﻬﻪﻭﻭﻮﻮﻯﻯﻰﻰﻱﻳﻴﻲﻵﻵﻶﻶﻷﻷﻸﻸﻹﻹﻺﻺﻻﻻﻼﻼ";
// All Arabic letters, harakat and symbols
let ARABIC = "ًٌٍَُِّْْئءؤرلاىةوزظشسيبلاتنمكطضصثقفغعهخحجدذْلآآلأأـلإإ،؟";
Global.isArabic = (text) => {
    if (text.length === 1) {
        const char = text;
        if (
            UNICODE.indexOf(char) >= 0 ||
            ARABIC.indexOf(char) >= 0
        ) {
            return true;
        }

        return false;
    }
    const chars = text.split("");
    for (let i = 0; i < chars.length; i++) {
        const char = chars[i];
        if (
            UNICODE.indexOf(char) >= 0 ||
            ARABIC.indexOf(char) >= 0
        ) {
            return true;
        }
    }
    return false;
}
// 判断是否包含表情
Global.isEmoji = (substring) => {
    for (var i = 0; i < substring.length; i++) {
        var hs = substring.charCodeAt(i)
        if (hs >= 0xd800 && hs <= 0xdbff) {
            if (substring.length > 1) {
                var ls = substring.charCodeAt(i + 1)
                var uc = ((hs - 0xd800) * 0x400) + (ls - 0xdc00) + 0x10000
                if (uc >= 0x1d000 && uc <= 0x1f77f) {
                    return true
                }
            }
        } else if (substring.length > 1) {
            var a = substring.charCodeAt(i + 1)
            if (a === 0x20e3) {
                return true
            }
        } else {
            if (hs >= 0x2100 && hs <= 0x27ff) {
                return true
            } else if (hs >= 0x2B05 && hs <= 0x2b07) {
                return true
            } else if (hs >= 0x2934 && hs <= 0x2935) {
                return true
            } else if (hs >= 0x3297 && hs <= 0x3299) {
                return true
            } else if (hs === 0xa9 || hs === 0xae || hs === 0x303d || hs === 0x3030 ||
                hs === 0x2b55 || hs === 0x2b1c || hs === 0x2b1b ||
                hs === 0x2b50) {
                return true
            }
        }
    }
}
// 判断是否有包含emoji表情,更新Label模式
Global.upateLabelMode = (label) => {
    if (Global.isEmoji(label.string)) {
        label.cacheMode = cc.Label.CacheMode.NONE;
    } else {
        label.cacheMode = cc.Label.CacheMode.CHAR;
    }
}

// 获取承诺
Global.getPromise = (callback, abortFunc) => {
    let _reject;
    const promise = new Promise((resolve, reject) => {
        _reject = reject;
        callback(resolve, reject)
    });
    return {
        promise,
        abort: () => {
            abortFunc && abortFunc();
            _reject({ message: "the promise is aborted" })
        }
    }
}
// 延迟
Global.delay = (time, list) => {
    const { promise, abort } = Global.getPromise((resolve, reject) => {
        setTimeout(() => {
            resolve()
        }, time * 1000)
    });
    if (list) {
        list.push(abort)
    }
    return promise;
}