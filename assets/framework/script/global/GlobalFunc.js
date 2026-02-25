/*
** Manager the global function
*/
var GlobalFunc = require('GlobalVar');

GlobalFunc.shake = false;

/*
** 是否是原生app端
*/
GlobalFunc.isNative = function () {
    return cc.sys.isNative && jsb;
}

// 设置是否震动
// 设置 true false
GlobalFunc.setShake = function(value){
    GlobalFunc.shake = value;
    cc.sys.localStorage.setItem("shake",value);
    Global.dispatchEvent(EventId.SET_SHAKE,value);
}

// 获取当前震动值
// 返回ture false
GlobalFunc.getShake = function(value){
    return GlobalFunc.shake;
}
/*
** 是否是Adnroid
*/
GlobalFunc.isAndroid = function () {
	return cc.sys.os == cc.sys.OS_ANDROID;
}

/*
** 是否是IOS 
*/
GlobalFunc.isIOS = function () {
	return cc.sys.os == cc.sys.OS_IOS;
}

/*
** 是否是IOS审核版本
*/
GlobalFunc.isIOSReview = function () {
	if (!GlobalFunc.isIOS()) {
        return false;
	}
	else {
		return Global.isReview;
	}
}

GlobalFunc.isIOSAndroidReview = function(){
    if(Global.isNative()){
        return Global.isIOSReview() || (Global.isAndroidReview && Global.isAndroid())
    }
    else{
        return false
    }
    
},

/*
** 是否关闭购买
*/
GlobalFunc.isClosePurchase = function () {
	return Global.appId==Global.APPID.HuaweiDRM; //华为DRM 关闭购买功能
}

/*
** 获取设备ID
*/
GlobalFunc.getDeviceId = function () {
    return cc.vv.PlatformApiMgr.getDeviceId()
}

/*
** 发送事件消息
** 再次封装，主要是打印
*/
GlobalFunc.emit = function (node, eventId, dic) {
	if (node) {
		node.emit(eventId, dic);
		if (Global.localVersion) {
			dic.eventId = eventId;
			cc.log('emit', JSON.stringify(dic));
		}
	}
}

/*
** 注册事件监听
*/
GlobalFunc.on = function (node, eventId, func, target) {
	if (node) {
		node.on(eventId, func, target);
		if (Global.localVersion) {
			cc.log('node(' + node.getName() + ') on ' + 'eventId(' + eventId + ')');
		}
	}
}

/*
** 注销事件监听
*/
GlobalFunc.off = function (node, eventId, func, target) {
	if (node) {
		node.off(eventId, func, target);
		if (Global.localVersion) {
			cc.log('node(' + node.getName() + ') off ' + 'eventId(' + eventId + ')');
		}
	}
}

/*
** retain对象(未开启长期持有C++底层对象时)
*/
GlobalFunc.retain = function (obj) {
	// if (!cc.sys.ENABLE_GC_FOR_NATIVE_OBJECTS) {
	// 	obj.retain();
	// }
}

/*
** release对象(未开启长期持有C++底层对象时)
*/ 
GlobalFunc.release = function (obj) {
	// if (obj && !cc.sys.ENABLE_GC_FOR_NATIVE_OBJECTS) {
	// 	obj.release();
	// }
}

/*
** 设置常驻节点（为其他场景使用）
** 将Node成为常驻节点，场景切换时不会清除这个节点的内存
** 方便下一个场景可以通过这个节点访问数据
*/
GlobalFunc.addPersistNode = function (node) {
	cc.game.addPersistRootNode(node);
}

/*
** 移除常驻节点
*/ 
GlobalFunc.removePersistNode = function (node) {
	cc.game.removePersistRootNode(node)
}

/*
** 保存String数据到本地
*/
GlobalFunc.saveLocal = function (key, str) {
    key += '';
    str += '';
    //cc.sys.localStorage.setItem(key, str);
    cc.sys.localStorage.setItem(Global.compile(key), Global.compile(str));
}

/*
** 获取本地保存的String数据
*/
GlobalFunc.getLocal = function (key, defaultStr) {
    key += '';
    //var str = cc.sys.localStorage.getItem(key);
    var str = cc.sys.localStorage.getItem(Global.compile(key));
    if (str) str = Global.uncompile(str);
	if (!str || str.length <= 0) {
		str = defaultStr
	}
	return str;
}

/*
** 删除本地保存的String数据
*/
GlobalFunc.deleteLocal = function (key) {
    key += '';
    //cc.sys.localStorage.removeItem(key);
    cc.sys.localStorage.removeItem(Global.compile(key));
}

/*
** 简单加密字符串
*/
GlobalFunc.compile = function (code) {
    var c=String.fromCharCode(code.charCodeAt(0)+code.length);  
    for(var i=1;i<code.length;i++){  
        c+=String.fromCharCode(code.charCodeAt(i)+code.charCodeAt(i-1));  
    }
    // alert(escape(c));
    c = escape(c);
    return c;
}

/*
** 简单解密字符串
*/
GlobalFunc.uncompile = function (code) {
    code=unescape(code);  
    var c=String.fromCharCode(code.charCodeAt(0)-code.length);  
    for(var i=1;i<code.length;i++){  
        c+=String.fromCharCode(code.charCodeAt(i)-c.charCodeAt(i-1));  
    }  
   return c;  
}


/*
** 绑定参数
** 第一个参数必须是函数类型
*/
GlobalFunc.bindParams = function () {
	var args = Array.prototype.slice.call(arguments);
	var func = args.shift();
	if (typeof(func) != 'function') return;

    return function() {
      return func.apply(null, args.concat(Array.prototype.slice.call(arguments)));
  };
}

/*
** 生成任意值到任意值（也就是指定范围内）的随机数
** max期望的最大值
** min期望的最小值
*/
GlobalFunc.random = function (min, max) {
	return Math.floor(Math.random()*(max-min+1)+min);
}

/**
 * 随机多个数
 * @returns 
 */
GlobalFunc.randomArray = function(n,min,max){
    let arr = []
    let isExist = function(val){
        for(let i = 0; i < arr.length; i++){
            if(val == arr[i]){
                return true
            }
        }
        return false
    }
    for(let i = 0; i < n ;i++){
        let item = Global.random(min,max)
        while(isExist(item)){
            item = Global.random(min,max)
        }
        arr[i] = item
    }
    return arr
}

/*
** 随机-1到1
*/
GlobalFunc.random1To1 = function () {
    return (Math.random() - 0.5) * 2;
}

/*
** 随机0到1
*/
GlobalFunc.random0To1 = function () {
    return Math.random();
}

/*
** 对象 深拷贝
*/
GlobalFunc.copy = function (obj){
    if(cc.js.isNumber(obj) || cc.js.isString(obj)){ //简单类型
        return obj
    }
    var newObj = obj instanceof Array ? [] : {}
    for (var item in obj) {
        if (typeof obj[item] === "object") {
            newObj[item] = GlobalFunc.copy(obj[item]);
        } else {
            newObj[item] = obj[item];
        }
    }
    return newObj;
}

/*
** string转化成Bytes
*/
GlobalFunc.stringToBytes = function ( str ) {  
    var ch, re = []; 
    for (var i = 0; i < str.length; i++ ) { 
        ch = str.charCodeAt(i);  // get char
        var st = [];
		do {  
        	st.push( ch & 0xFF );  // push byte to stack  
        	ch = ch >> 8;          // shift value down by 1 byte  
    	}
    	while ( ch );  
    	// add stack contents to result  
    	// done because chars have "wrong" endianness
        re = re.concat( st.reverse() ); 
    }  
    // return an array of bytes  
    return re;  
} 

/*
** 转化value=n*256+m为字符串nm
*/
GlobalFunc.jsToCByShort = function (value) {
	var low1 = Math.floor(value / 256);
	var low2 = Math.floor(value % 256);
	/*var lowByte1 = GlobalFunc.charToByte(low1,low2);
	var lowByte2 = GlobalFunc.charToByte(low2);*/
	return String.fromCharCode(low1,low2);
}

/*
** 转化m+n*2^24+k*2^16+l*2^8=为字符串mnkl
*/
GlobalFunc.jsToCByInt = function (value) {
	var low1 = Math.floor(value / (256*256*256))
	var low2 = Math.floor(value / (256*256)) % 256
	var low3 = Math.floor(value / 256) % 256
	var low4 = Math.floor(value % 256)
	/*var lowByte1 = GlobalFunc.charToByte(low1);
	var lowByte2 = GlobalFunc.charToByte(low2);
	var lowByte3 = GlobalFunc.charToByte(low3);
	var lowByte4 = GlobalFunc.charToByte(low4);*/
	return String.fromCharCode(low1,low2,low3,low4);
}

/*
** 计算长度
*/
GlobalFunc.srcSum = function (strData, len) {
	var sum = 65535;
	for (var i=0; i < len; i++) {
		var d = strData[i];
		sum = sum^d;
		if ((sum & 1) == 0) {
			sum = sum>>1;
		}
		else {
			sum = (sum>>1)^(0x70B1);
		}
	}
	return sum;
}


/*
** @description 把GPS原始坐标转换成GCJ-02火星坐标
** @param lat 纬度
** @param lng 经度
** @return lat,lng
*/
/**
 * WGS84转GCj02
 * @param lng
 * @param lat
 * @returns {*[]}
 */
//function wgs84togcj02(lng, lat) {
GlobalFunc.convertGPS2GCJ = function (lng, lat) {
    lng = Number(lng);
    lat = Number(lat);

    var x_PI = 3.14159265358979324 * 3000.0 / 180.0;
    var PI = 3.1415926535897932384626;
    var a = 6378245.0;
    var ee = 0.00669342162296594323;

    function transformlat(lng, lat) {
        var ret = -100.0 + 2.0 * lng + 3.0 * lat + 0.2 * lat * lat + 0.1 * lng * lat + 0.2 * Math.sqrt(Math.abs(lng));
        ret += (20.0 * Math.sin(6.0 * lng * PI) + 20.0 * Math.sin(2.0 * lng * PI)) * 2.0 / 3.0;
        ret += (20.0 * Math.sin(lat * PI) + 40.0 * Math.sin(lat / 3.0 * PI)) * 2.0 / 3.0;
        ret += (160.0 * Math.sin(lat / 12.0 * PI) + 320 * Math.sin(lat * PI / 30.0)) * 2.0 / 3.0;
        return ret
    }
     
    function transformlng(lng, lat) {
        var ret = 300.0 + lng + 2.0 * lat + 0.1 * lng * lng + 0.1 * lng * lat + 0.1 * Math.sqrt(Math.abs(lng));
        ret += (20.0 * Math.sin(6.0 * lng * PI) + 20.0 * Math.sin(2.0 * lng * PI)) * 2.0 / 3.0;
        ret += (20.0 * Math.sin(lng * PI) + 40.0 * Math.sin(lng / 3.0 * PI)) * 2.0 / 3.0;
        ret += (150.0 * Math.sin(lng / 12.0 * PI) + 300.0 * Math.sin(lng / 30.0 * PI)) * 2.0 / 3.0;
        return ret
    }

    function out_of_china(lng, lat) {
        return (lng < 72.004 || lng > 137.8347) || ((lat < 0.8293 || lat > 55.8271) || false);
    }


    // if (out_of_china(lng, lat)) {
    //     return {lat:lat, lng:lng}
    // }
    // else {
        var dlat = transformlat(lng - 105.0, lat - 35.0);
        var dlng = transformlng(lng - 105.0, lat - 35.0);
        var radlat = lat / 180.0 * PI;
        var magic = Math.sin(radlat);
        magic = 1 - ee * magic * magic;
        var sqrtmagic = Math.sqrt(magic);
        dlat = (dlat * 180.0) / ((a * (1 - ee)) / (magic * sqrtmagic) * PI);
        dlng = (dlng * 180.0) / (a / sqrtmagic * Math.cos(radlat) * PI);
        var mglat = lat + dlat;
        var mglng = lng + dlng;
        return {lat:mglat, lng:mglng};
    // }
}
/*
GlobalFunc.convertGPS2GCJ = function (lat,lng) {
    lat = parseInt(lat);
    lng = parseInt(lng);

    var pi = Math.PI;
    var x_pi = pi * 3000.0/180.0;
    var a = 6378245.0;
    var ee = 0.00669342162296594323;

    var transformLat = function(x,y) {
        var ret = -100.0 + 2.0 * x + 3.0 * y + 0.2 * y * y + 0.1 * x * y + 0.2 * Math.sqrt(Math.abs(x));
        ret = ret + (20.0 * Math.sin(6.0 * x * pi) + 20.0 * Math.sin(2.0 * x * pi)) * 2.0 / 3.0;
        ret = ret + (20.0 * Math.sin(y * pi) + 40.0 * Math.sin(y / 3.0 * pi)) * 2.0 / 3.0;
        ret = ret + (160.0 * Math.sin(y / 12.0 * pi) + 320 * Math.sin(y * pi / 30.0)) * 2.0 / 3.0;
    	return ret;
    }

    var transformLon = function(x,y) {
        var ret = 300.0 + x + 2.0 * y + 0.1 * x * x + 0.1 * x * y + 0.1 * Math.sqrt(Math.abs(x));
        ret = ret + (20.0 * Math.sin(6.0 * x * pi) + 20.0 * Math.sin(2.0 * x * pi)) * 2.0 / 3.0;
        ret = ret + (20.0 * Math.sin(x * pi) + 40.0 * Math.sin(x / 3.0 * pi)) * 2.0 / 3.0;
        ret = ret + (150.0 * Math.sin(x / 12.0 * pi) + 300.0 * Math.sin(x / 30.0 * pi)) * 2.0 / 3.0;
        return ret;
    }

    var dLat = transformLat(lng - 105.0, lat - 35.0);
    var dLng = transformLon(lng - 105.0, lat - 35.0);

    var radLat = lat / 180.0 * pi;
    var magic = Math.sin(radLat);
    magic = 1 - ee * magic * magic;

    var sqrtMagic = Math.sqrt(magic);
    dLat = (dLat * 180.0) / ((a * (1 - ee)) / (magic * sqrtMagic) * pi);
    dLng = (dLng * 180.0) / (a / sqrtMagic * Math.cos(radLat) * pi);

    var mgLat = lat + dLat;
    var mgLng = lng + dLng;

    return {lat:mgLat, lng:mgLng};
}
*/

/**
 * GCJ02 转换为 WGS84
 * @param lng
 * @param lat
 * @returns {*[]}
 */
GlobalFunc.gcj02towgs84 = function (lng, lat) {
    if (out_of_china(lng, lat)) {
        return [lng, lat]
    }
    else {
        var dlat = transformlat(lng - 105.0, lat - 35.0);
        var dlng = transformlng(lng - 105.0, lat - 35.0);
        var radlat = lat / 180.0 * PI;
        var magic = Math.sin(radlat);
        magic = 1 - ee * magic * magic;
        var sqrtmagic = Math.sqrt(magic);
        dlat = (dlat * 180.0) / ((a * (1 - ee)) / (magic * sqrtmagic) * PI);
        dlng = (dlng * 180.0) / (a / sqrtmagic * Math.cos(radlat) * PI);
        mglat = lat + dlat;
        mglng = lng + dlng;
        return [lng * 2 - mglng, lat * 2 - mglat]
    }
}


/*
** @description 通过经纬度，获取到具体的位置
** @param lat 纬度
** @param lng 经度
** @param cb 回调,返回街道地址
** [[ {"status":0,"result":{"location":{"lng":111.07259999999997,"lat":26.268391095085833},"formatted_address":"广西壮族自治区桂林市全州县","business":"","addressComponent":{"country":"中国","country_code":0,"province":"广西壮族自治区","city":"桂林市","district":"全州县","town":"","adcode":"450324","street":"","street_number":"","direction":"","distance":""},"pois":[],"roads":[],"poiRegions":[],"sematic_description":"","cityCode":142}} ]]
*/
GlobalFunc.getAddressDetail = function (lat,lng,cb) {
    //因获取的是高德地图经纬度(火星坐标)，这里需要换算到百度地图的经纬度
    /*var posData = convertGCJ2DB(lat,lng)
    lat = posData.lat;
    lng = posData.lng;

    //需要去这里申请 http://lbsyun.baidu.com/index.php?title=webapi/guide/webservice-geocoding
    var ak_and = "9uAwj28kHQe3SA3sYQycRBv9XfGFzVtG"
    //var ak_ios = "AReN74lHsEGDcUmLdMSAx1GdQs3BS3A4"
    var mcode_and = "35:77:CF:A6:24:79:8A:51:9C:AB:37:10:C7:20:44:C9:96:32:66:20;com.you9.azzy" //安全码（android的）
    //var mcode_ios = "35:77:CF:A6:24:79:8A:51:9C:AB:37:10:C7:20:44:C9:96:32:66:20;com.you9.azzy" //安全码（ios的）
    var url = string.format("http://api.map.baidu.com/geocoder/v2/?location=%f,%f&output=json&pois=0&ak=%s&mcode=%s",lat,lng,ak_and,mcode_and)
    var xhr = cc.XMLHttpRequest:new()
    xhr.timeout = 30
    xhr.responseType = cc.XMLHTTPREQUEST_RESPONSE_JSON
    xhr:open("GET", url)
    xhr:registerScriptHandler( function () {
        if xhr.readyState == 4 and (xhr.status >= 200 and xhr.status < 207) then
            cb({code=0,data=xhr.response})
        elseif xhr.readyState == 1 and xhr.status == 0 then
            // 网络问题,异常断开
            cb({code=1,desc="网络异常断开"})
        else
            cb({code=-1,desc="数据异常"})
        end
        xhr:unregisterScriptHandler()
    });
    xhr:send()*/
}

/*
** @description 计算两个经纬度点间的距离
** @return 距离（number），千米
*/
GlobalFunc.getDistanceOfTwoPoint = function (lat1,lng1,lat2,lng2) {
    AppLog.log(lat1,lng1,lat2,lng2);

    //角度转弧度
    var angleToRadian = function (angle) {
    	return angle*Math.PI/180;
    }

    var radlat1 = angleToRadian(lat1);
    var radlat2 = angleToRadian(lat2);;
    var a = radlat1 - radlat2;
    var b = angleToRadian(lng1) - angleToRadian(lng2);
    var distance = 2 * Math.asin( Math.sqrt( Math.pow( Math.sin(a/2),2)+ Math.cos(radlat1) * Math.cos(radlat2) * Math.pow( Math.sin(b/2),2)));
    var earth_radius = 6378.137;
    distance = distance*earth_radius;
    return Math.abs(distance);
}


/*
** 转化数字为万、亿为单位的字符串
** num需转化的数字
** radix进制
** decimal 小数点后保留位数
** costomunitArr 自定义后缀 ['','W','Y','H']
** criticalValue 触发转换的临界值；默认等于进制 例如 10000才会触发 10k转换；1000不会转换成1k
*/ 
GlobalFunc.convertNumToShort = function (num, radix, decimal, costomunitArr, criticalValue) {
	 // var unitArr = ['', '万', '亿', '万亿'];
    var unitArr = ['', 'K', 'M', 'B', 'T', 'Q'];
	var sign = (num != 0)?num/Math.abs(num):1;  //符号
	num = Math.abs(num);

	//替换自定义后缀
	if(costomunitArr){
		unitArr = costomunitArr
	}

	radix = (radix == null)?1000:radix; //默认值  10000万亿
	decimal = (decimal == null)?1:decimal; //默认值
    criticalValue = (criticalValue == null)?radix:criticalValue; //默认值  进制
	var sum = 0;
	while (num >= criticalValue) {
		sum ++;
		num = num/radix;
	}
	num = Math.floor(num*Math.pow(10, decimal))/Math.pow(10, decimal);
	
	return num*sign + unitArr[sum];	
}

/*
** 数字转化成中文
 */
GlobalFunc.convertNumToChineseNum = function (moneyNum) {
    //汉字的数字
    var cnNums = new Array('零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖');
    //基本单位
    var cnIntRadice = new Array('', '拾', '佰', '仟');
    //对应整数部分扩展单位
    var cnIntUnits = new Array('', '万', '亿', '兆');
    //最大处理的数字
    var maxNum = 999999999999999.9999;
    //金额整数部分
    var integerNum;
    //金额小数部分
    var decimalNum;
    //输出的中文金额字符串
    var chineseStr = '';
    //分离金额后用的数组，预定义
    var parts;
    if (moneyNum === '') {
        return '';
    }

    moneyNum = parseFloat(moneyNum);
    if (moneyNum >= maxNum) {
        //超出最大处理数字
        return '';
    }
    if (moneyNum == 0) {
        chineseStr = cnNums[0];
        return chineseStr;
    }

    //转换为字符串
    moneyNum = moneyNum.toString();
    if (moneyNum.indexOf('.') == -1) {
        integerNum = moneyNum;
        decimalNum = '';
    } else {
        parts = moneyNum.split('.');
        integerNum = parts[0];
        decimalNum = parts[1].substr(0, 4);
    }
    //获取整型部分转换
    if (parseInt(integerNum, 10) > 0) {
        var zeroCount = 0;
        var IntLen = integerNum.length;
        for (var i = 0; i < IntLen; i++) {
            var n = integerNum.substr(i, 1);
            var p = IntLen - i - 1;
            var q = p / 4;
            var m = p % 4;
            if (n == '0') {
                zeroCount++;
            } else {
                if (zeroCount > 0) {
                    chineseStr += cnNums[0];
                }
                //归零
                zeroCount = 0;
                chineseStr += cnNums[parseInt(n)] + cnIntRadice[m];
            }
            if (m == 0 && zeroCount < 4) {
                chineseStr += cnIntUnits[q];
            }
        }
    }

    if (chineseStr == '') {
        chineseStr += cnNums[0];
    }
    return chineseStr;
}

/*
** 截取字符串 包含中文处理
** （串，长度，增加....）
*/
GlobalFunc.subStrOfChinese = function (str, len, hasDot) {
	var newLength = 0;  
    var newStr = "";  
    var chineseRegex = /[^\x00-\xff]/g;  
    var singleChar = "";
    try {
        var strLength = str.replace(chineseRegex,"**").length;
        for(var i = 0;i < strLength;i++)
        {
            singleChar = str.charAt(i).toString();
            if(singleChar.match(chineseRegex) != null)
            {
                newLength += 2;
            }
            else
            {
                newLength++;
            }
            if(newLength > len)
            {
                break;
            }
            newStr += singleChar;
        }

        if(hasDot && strLength > len)
        {
            newStr += "..";
        }
    }
    catch (e) {
		return str;
    }

    return newStr;  
},

// //截屏
// //fileName: **.png
// //node: 截屏的节点
// //endCall: 截屏完成的回调会传出目标文件路径
// //cpSize: 截屏大小：如果不是截全屏大小。
// //bHide:有些节点需要隐藏截图后，就只在截图瞬间显示
// GlobalFunc.captureScreen=function(fileName,node,endCall,cpSize,bHide){
// 	if(CC_JSB){
//         var oldPos = node.position
//         var doCapSize = Global.designSize
//         if(cpSize){
//             doCapSize = cpSize
//         }
//         if(bHide){
//             node.active = true
//         }
        
//         var rt = cc.RenderTexture.create(doCapSize.width,doCapSize.height)
//         rt.setVisible(false)
// 		rt.begin()
// 		node.position = cc.v2(Global.designSize.width/2,Global.designSize.height/2); //要加这句，不然会偏移坐标
// 		node._sgNode.visit()
//         rt.end()
//         if(bHide){
//             node.active = false
//         }
        

// 		rt.saveToFile(fileName,cc.ImageFormat.PNG,true,function(){
// 			cc.log(jsb.fileUtils.getWritablePath())
// 			var targetPath = jsb.fileUtils.getWritablePath() + fileName
// 			if(endCall){
//                 node.position = oldPos
// 				endCall(targetPath)
// 			}
// 		})
// 	}
// },


//截屏
//fileName: **.png
//node: 截屏的节点
//endCall: 截屏完成的回调会传出目标文件路径
GlobalFunc.captureScreen = function(fileName, node, fn,nScale){
    let width = Math.floor(node.width);
    let height = Math.floor(node.height);
    if (CC_JSB) {
        let fullPath = jsb.fileUtils.getWritablePath() + fileName;
        if (jsb.fileUtils.isFileExist(fullPath)) {
            jsb.fileUtils.removeFile(fullPath);
        }
        let cameraNode = new cc.Node();
        cameraNode.parent = node.parent;
        cameraNode.zIndex = -1
        
        cameraNode.position = node.position;
        let camera = cameraNode.addComponent(cc.Camera);
        camera.cullingMask = 0xffffffff;

        let scale = Math.max(cc.winSize.width/node.width, cc.winSize.height/node.height);
        if(nScale){
            scale = nScale
        }
        let texture = new cc.RenderTexture();
        let gl = cc.game._renderContext;
        texture.initWithSize(width*scale, height*scale, gl.STENCIL_INDEX8);
        camera.targetTexture = texture;
        node.scaleY = -1*scale; //-1将截图后默认倒置的图片回正
        node.scaleX = scale;
        camera.render(node);
        node.scale = 1;

        let data = texture.readPixels();
        // //以下代码将截图后默认倒置的图片回正
        // let picData = new Uint8Array(width * height * 4);
        // let rowBytes = width * 4;
        // for (let row = 0; row < height; row++) {
        //     let srow = height - 1 - row;
        //     let start = Math.floor(srow * width * 4);
        //     let reStart = row * width * 4;
        //     // save the piexls data
        //     for (let i = 0; i < rowBytes; i++) {
        //         picData[reStart + i] = data[start + i];
        //     }
        // }
        //保存图片
        jsb.saveImageData(data, width*scale, height*scale, fullPath);
        console.log("截图成功，图片保存在 ====>", fullPath);
        node.parent.removeChild(cameraNode);
        if (fn) fn(fullPath);
    }
},

//FB链接分享
//linkUrl:点击跳转的url
//strContent:文字内容即引文
GlobalFunc.ShareLink=function(linkUrl,strContent){
    //fb
    if( Global.openFacebookLogin && Global.playerData.logintype === Global.LoginType.FB){
        var shareData = {}
        shareData.shareType = 1 //链接分享
        shareData.linkUrl = linkUrl
        shareData.content = strContent || ""
        cc.vv.PlatformApiMgr.SdkShare(JSON.stringify(shareData))
    }
    else if(Global.openWeChatLogin ) {
        //微信
        var title = 'poly娱乐'
        var content = '喊你一起玩游戏！'
        if(strContent && strContent.length > 0){
            content = strContent
        }
        var toScene = Global.WX_SHARE_SCENE.Secssion
        Global.WXShareLink(linkUrl,title,content,toScene)
    }
    else{
        cc.loader.loadRes("prefab/UIShare", function (err, prefab) {
            var newNode = cc.instantiate(prefab);
            var script = newNode.getComponent('UIGuestShare')
            if(script){
                script.setQRCodeUrl(linkUrl)
            }
            newNode.position = Global.centerPos
            cc.director.getScene().addChild(newNode);
        });
    }

	
}

GlobalFunc.shareAppWebLink = function (actionId, valueId) {
    actionId = actionId || '0';
    valueId = valueId || '0';
    var url_linke = Global.share_url + '?appName=ruili.com&actionId=' + actionId +'&valueId=' + valueId;
    //添加渠道号
    var strChannal = cc.vv.PlatformApiMgr.umChannel()
    url_linke  = url_linke + "&channel="  + strChannal
    Global.ShareLink(url_linke,'');
    
}
//==FB分享end

//WX链接分享
//linkUrl:点击跳转的url
//title:分享标题
//content:分享内容
//toScene:分享场景 Global.WX_SHARE_SCENE
//shareResultCall:分享结果回调
GlobalFunc.WXShareLink=function(linkUrl,title,content,toScene,shareResultCall){
	var iconUrl = Global.webShareIcon
	if(toScene >= 0 && linkUrl && title && content){
		cc.vv.WxMgr.wxShareWeb(toScene,title,content,iconUrl,linkUrl,shareResultCall)
	}
}

//WX图片分享
//imgPath 图片地址
//toScene: 分享场景
GlobalFunc.WXShareImage=function(imgPath,toScene,shareResultCall){
	if(toScene >= 0 && imgPath){
		cc.vv.WxMgr.wxShareImg(toScene,imgPath,shareResultCall)
	}
}

//是否开启wss 
//不带端口的时候，就采用https
//即当是https的时候，websocket也需要用wss
GlobalFunc.isUserWSS = function(pUrl){
    var res = false
    let url = Global.loginServerAddress
    if(pUrl){
        url = pUrl
    }
	if(url.indexOf(':') === -1){
		res = false
	}
	return res
}

// // 获取房间等级显示的文字
// GlobalFunc.getRoomLevelString = function(level)
// {
//     level = level || 0;
//     var roomNames = ['场次名称', '体验场', '初级场','普通场', '高级场','VIP场'];
// 	return roomNames[level];
// }

// 根据贡献值获取段位等级
GlobalFunc.getSegmentLevel = function (integral) {
    var level = 0;
    if (cc.vv.UserManager.levelList && cc.vv.UserManager.levelList instanceof Array) {
        for (var i = 0; i < cc.vv.UserManager.levelList.length; ++i) {
            if (integral < cc.vv.UserManager.levelList[i].count) {
                level = cc.vv.UserManager.levelList[i].id - 1;
                break;
            }
        }
        var maxCount = cc.vv.UserManager.levelList[cc.vv.UserManager.levelList.length - 1].count;
        if (integral > maxCount) level = cc.vv.UserManager.levelList[cc.vv.UserManager.levelList.length - 1].id;
    }
    return level;
};

// 注册事件
GlobalFunc.registerEvent = function(eventName,func,obj)
{
    let canvas = cc.find("Canvas");
    if(cc.isValid(canvas,true)){
        canvas.on(eventName,func,obj);
    }
}

//注销事件
GlobalFunc.unregisterEvent = function(eventName,func,obj)
{
    let canvas = cc.find("Canvas");
    if(cc.isValid(canvas,true)){
        canvas.off(eventName,func,obj);
    }
}

// 发送事件
GlobalFunc.dispatchEvent= function (eventName,data) {
    let canvas = cc.find("Canvas");
    //
    let args = {}
    args.detail = data
    if(canvas)   canvas.emit(eventName,args);
}

// 按钮点击事件
//soundCfg null 播放默认 有配置则播放配置的。-1表示不播放声音
GlobalFunc.btnClickEvent = function (btn,func,obj,soundCfg=null) {
    if(btn == null)
    {
        return null;
    }
    let temp = func.bind(obj);

    btn.on("click",(event)=>
    {
        let btnCmp =  btn.getComponent(cc.Button);
        if(btnCmp){
            if(btnCmp.interactable){
                if(soundCfg === null || soundCfg === undefined)
                {
                    // if (Global.poly99 && cc.vv.gameData === null) cc.vv.AudioManager.playEff(cc.vv.PathMgr.SLOT_BASE,"btn_click",true);
                    // else if(Global.appId === Global.APPID.BigBang && cc.vv.gameData === null) Global.playEff(Global.SOUNDS.eff_click);
                }
                else if(soundCfg === -1){
                    //不播放声音
                    
                }
                else
                {
                    cc.vv.AudioManager.playEff(soundCfg.path, soundCfg.filename, soundCfg.common);
                }
            }
        }
        temp(event);
    });
    return btn;
}

// 按钮点击事件, 不需要默认音效版本，如樱桃的爱，伟大的蓝色，func 中 自己单独播放 同一个按键不同的音效
GlobalFunc.btnClickEventNoDefaultSound = function (btn,func,obj) {
    if(btn == null)
    {
        return null;
    }
    btn.on("click",func,obj);
    return btn;
}

// 数字转换逗号分隔符
GlobalFunc.FormatNumToComma = function (num){
    if(!num)return 0;
    num = Number(Number(num).toFixed(2));
    var res=num.toString().replace(/\d+/, function(n){ // 先提取整数部分
        return n.replace(/(\d)(?=(\d{3})+$)/g,function($1){
            return $1+",";
        });
    })
    return res;
}

//逗号分隔符数字字符串转成数字
GlobalFunc.FormatCommaNumToNum = function (numStr) {
    return parseInt(numStr.replace(/,/g, ""));
}


//保留小数点不足补0
GlobalFunc.SavePoints = function(num,pt=2){
    //1. 可能是字符串，转换为浮点数
    //2. 乘以100 小数点向右移动两位
    //3. Math.round 进行四舍五入
    //4. 除以100 小数点向左移动两位 实现保留小数点后两位
    var value = Math.round(parseFloat(num) * 100) / 100;
    // 去掉小数点 存为数组
    var arrayNum = value.toString().split(".");
    //只有一位（整数）
    if (arrayNum.length == 1) {
        let addstr = "."
        for(let i = 0; i < pt; i++){
            addstr +="0"
        }
        return value.toString() + addstr;
    }
    if (arrayNum.length > 1) {
        //小数点右侧 如果小于两位 则补一个0
        if (arrayNum[1].length < pt) {
            let addstr = ""
            for(let i = 0; i < pt-arrayNum[1].length; i++){
                addstr +="0"
            }
            return value.toString() + addstr;
        }
        return value;
    }
}

// 查找toggle选中
GlobalFunc.checkToggleIsSelect = function(toggleParent)
{
    for(let i = 0;i<toggleParent.childrenCount;++i){
        let t = toggleParent.children[i].getComponent(cc.Toggle);
        if(t.isChecked){
            return t.node;
        }
    }
    return null;
}

// 设置选中的toggle
GlobalFunc.setToggleSecelct = function(toggleParent,toggleName) {
    for(let i = 0;i<toggleParent.childrenCount;++i){

        let t = toggleParent.children[i].getComponent(cc.Toggle);
        if(toggleParent.children[i].name == toggleName){

            t.isChecked = true;
        }
        else
        {
            t.isChecked = false;
        }
    }
}

//自动适配设备
GlobalFunc.autoAdaptDevices = function (isShowAll=true) {
    //
    let testIPad = false
    // if(testIPad || cc.sys.platform == cc.sys.IPAD){ //只有ipad才需要修改
        var canvasNode = cc.find('Canvas');
        var canvas = canvasNode.getComponent(cc.Canvas);
        
        var frameWidth = canvasNode.width;
        var frameHeight = canvasNode.height;
        var designWidth = canvas.designResolution.width;
        var designHeight = canvas.designResolution.height;
        if ((frameWidth/frameHeight) < (designWidth/designHeight)) { //按照宽来适配
            canvas.fitWidth = true;
            canvas.fitHeight = false;
        }
        else { //按照高来适配
            canvas.fitWidth = false;
            canvas.fitHeight = true;
        }
    // }
}

// 适配iphoneX
GlobalFunc.setAdaptIphoneX = function()
{
    var nameStr = 'safe_node';
    var canvas = cc.find("Canvas").getComponent(cc.Canvas);
    let safe_node = canvas.node.getChildByName(nameStr);
    if(safe_node) {
        let widget = safe_node.getComponent(cc.Widget);
        if(widget){
            widget.top = 0;
            widget.bottom = 0;
            widget.left = 0;
            widget.right = 0;
        }
    }

}

GlobalFunc.getStrBLen = function(str) {
    if (str == null) return 0;
    if (typeof str != "string"){
        str += "";
    }
    return str.replace(/[^\x00-\xff]/g,"ab").length;
}

/*
** 检测IP跟GPS
** playersList参数结构:[{uid:*, ip:*, lat:* lng:*},...]
** toPlayer参数结构：{uid:*, ip:*, lat:*, lng:*} 说明：相对玩家，缺省情况下，会两两相互之间比较
*/
GlobalFunc.checkIpAndGps = function (playersList, toPlayer) {
    //是否开启GPS
    var isOpenGPS = function (player) {
        return !(player.lat === 0 && player.lng === 0);
    };

    //IP相同
    var isSameIp = function (player1, player2) {
        return (player1.ip.split(':')[0] == player2.ip.split(':')[0]);
    };

    var isNearlyDistance = function (player1, player2) {
        if (!isOpenGPS(player1)) return false;
        if (!isOpenGPS(player2)) return false;
        return Global.getDistanceOfTwoPoint(player1.lat, player1.lng, player2.lat, player2.lng) <= 0.2;
    }

    if (!toPlayer) {
        //先检测是否IP相同
        for (var i=0; i < playersList.length - 1; i++) {
            if (!playersList[i]) continue;
            for (var j=i+1; j < playersList.length; j++) {
                if (!playersList[j]) continue;
                if (isSameIp(playersList[i], playersList[j])) return true;
            }
        }

        //再检测GPS是否过近
        for (var i=0; i < playersList.length - 1; i++) {
            if (!playersList[i]) continue;
            for (var j=i+1; j < playersList.length; j++) {
                if (!playersList[j]) continue;
                if (isNearlyDistance(playersList[i], playersList[j])) return true;
            }
        }
    }
    else {
        //先检测是否IP相同
        for (var i=0; i < playersList.length; i++) {
            if (!playersList[i]) continue;
            if (playersList[i].uid == toPlayer.uid) continue;
            if (isSameIp(playersList[i], toPlayer)) return true;
        }

        //再检测GPS是否过近
        for (var i=0; i < playersList.length; i++) {
            if (!playersList[i]) continue;
            if (playersList[i].uid == toPlayer.uid) continue;
            if (isNearlyDistance(playersList[i], toPlayer)) return true;
        }
    }
    return false;
}
//动态生成二维码接口
//urlData:数据链接
//node:显示二维码预制节点
//bShowIcon:是否显示游戏icon
GlobalFunc.showQRCode = function(urlData,node,bShowIcon){
    if(node){
        var script = node.getComponent('showQRcode')
        if(script){
            script.showQRCode(urlData,bShowIcon)
        }
    }
    
}

GlobalFunc.moveMenu = function(isDown,meunNode) // 移动菜单栏
{
    meunNode.getComponent(cc.Button).interactable = false;
    let startPos = isDown? cc.v2(0,meunNode.height):cc.v2(0,0);
    let endPos = isDown? cc.v2(0,0):cc.v2(0,meunNode.height);
    meunNode.position = startPos;
    meunNode.opacity = isDown ? 0:255;
    meunNode.active = true;
    let delaytime = 0.3;
    meunNode.runAction(cc.sequence(cc.spawn(cc.moveTo(delaytime,endPos),cc.fadeTo(delaytime,isDown?255:0)),cc.callFunc(()=>
    {
        meunNode.getComponent(cc.Button).interactable = true;
    })));
}

// 弹出动画显示
GlobalFunc.showAlertAction = function(node,isShow,startScale,endScale,callback)
{
    let start_Scale = startScale;
    let end_Scale = endScale;
    if(isShow)
    {
        node.opacity = 0.3*255
        if(start_Scale == null)
        {
            node.scale = 0;
        }else {
            node.scale = start_Scale;
        }

        if(end_Scale == null)
        {
            end_Scale = 1;
        }
    }
    else
    {
        if(start_Scale == null)
        {
            node.scale = 1;
        }

        if(end_Scale == null)
        {
            end_Scale = 0;
        }
    }
    let action
    if(isShow)
    {
        let action1 = cc.scaleTo(0.35,end_Scale);
        action1.easing(cc.easeBackOut(2));

        let action2 = cc.fadeTo(0.35,255)
        // action2.easing(cc.easeBackOut(2));
        action = cc.spawn(action1,action2)
    }
    else
    {
        action = cc.scaleTo(0.3,end_Scale);
        action.easing(cc.easeSineIn(3));
    }

    node.runAction(cc.sequence(action,cc.callFunc(function()
    {
        if(callback)
        {
            callback();
        }

    })));
}

//创建一个新节点带帧动画
//atlas资源所在的图集
//preSufix资源的前缀
//nNum帧动画张数
//speed播放速度
//bLoop是否循环
//endCall播完结束的回调
//strConn前缀和数字之间的连接字符可空
//beginDif:开始图片的起始下标，默认1开始
//return: 返回的节点需要自己删除
GlobalFunc.createrSpriteAni=function(atlas,preSufix,nNum,speed,bLoop,endCall,strConn,beginDif,addZero){
    var self = this
    //创建一个空节点
    var newNode = new cc.Node('node_eff')
    var sp = newNode.addComponent(cc.Sprite)

    self.addSpriteAni(newNode,atlas,preSufix,nNum,speed,bLoop,endCall,strConn,beginDif,addZero)
    
    return newNode
}

//给节点添加帧动画组件
GlobalFunc.addSpriteAni=function(newNode,atlas,preSufix,nNum,speed,bLoop,endCall,strConn,beginDif,addZero){
    var self = this
    if(!beginDif) beginDif = 1
    if(addZero == null ){
        addZero = true
    }
    // 是否需要补零
    var getZeroize=function(num,isZeroize)
    {
        if(isZeroize)
        {
            let str = num<10?("0"+num):num;
            return str;
        }
        else{
            return num;
        }

    }

    var lists = []
    for(var i = 0;i < nNum; i++){
        var key = preSufix + getZeroize(i+beginDif,addZero)
        if(strConn){
            key = preSufix + strConn + getZeroize(i+beginDif,addZero)
        }
        
        if(atlas._spriteFrames[key]){
            lists.push(atlas._spriteFrames[key])
        }
        
    }
    
    var ani = newNode.addComponent(cc.Animation)
    var clip = cc.AnimationClip.createWithSpriteFrames(lists,30)
    let finishEvent = 'finished'
    if(bLoop){
        clip.wrapMode = cc.WrapMode.Loop
        finishEvent = 'lastframe'
    }
    
    clip.speed = speed
    ani.addClip(clip,preSufix)
    var finishCall = function(){
        ani.off(finishEvent,finishCall)
        if(endCall){
           endCall()
        }
    }
    ani.on(finishEvent,finishCall) //不循环的
    ani.play(preSufix)
}

//空对象判断
GlobalFunc.isEmptyObject = function(obj) {   
    for (var key in obj){
    　　return false;
    }　　
    return true;
}


//获取设备信息
//用于后台上报
GlobalFunc.getDeviceInfo = function(){
    let info = {osValue:'web'}
    if(cc.sys.isNative){
        //分辨率
        info.frameSize  = cc.view.getFrameSize()
        //系统:ios android
        info.osValue = cc.sys.os
        //手机型号 android:手机品牌_手机型号(小米_xiaomi)  ios:iphne6_ios12
        info.phoneBrand = cc.vv.PlatformApiMgr.getDeviceBrand()
        //手机操作系统版本
        info.phoneSystemVision = cc.vv.PlatformApiMgr.getDeviceOpSysVision()
        //手机唯一识别码
        info.phoneUuid = this.getDeviceId()
        
        //网络：0未知，1Wi-Fi，2移动网络
        info.netType = cc.sys.getNetworkType()

    }
    return info
}

//对节点缩放适配
//node cc.Node 类型
Global.setNodeScaleFixWin=function(node){
    var winSize = cc.winSize
    node.scaleX = winSize.width/node.width
    node.scaleY = winSize.height/node.height
}

//对节点缩放适配, 节点的width和height，可以不是 设计分辨率
//node cc.Node 类型
Global.setNodeScaleWithDesignSize = function (node) {
    node.scaleX = cc.winSize.width / Global.designSize.width;
    node.scaleY = cc.winSize.height / Global.designSize.height;
}

//节点摇晃动作
Global.shakeNodeR = function(node){
    node.stopAllActions();
    node.angle = 0;
    
    let r_offset = 15;
    let t_interval = 0.25;
    let r1 = cc.rotateTo(t_interval, r_offset)
    let r2 = cc.rotateTo(2 * t_interval, -  r_offset)
    let r3 = cc.rotateTo(2 * t_interval,  r_offset)
    let r4 = cc.rotateTo(2 * t_interval, - r_offset)
    let r5 = cc.rotateTo(2 * t_interval,  r_offset)
    let r6 = cc.rotateTo(t_interval, 0)
    let delay = cc.delayTime(1.8);

    let seq = cc.repeatForever(cc.sequence(r1, r2, r3, r4, r5, r6, delay));
    node.runAction(seq);
}

//节点呼吸动作
Global.breathNode = function(node, _targetScale, _targetScaleSmall){
    node.stopAllActions();
    node.scale = _targetScale || 1;
    let targetScale = _targetScale || 1.1
    
    let targetScaleSmall = _targetScaleSmall || 1

    let seq = cc.repeatForever(cc.sequence(cc.scaleTo(0.6,targetScale),cc.scaleTo(0.6,targetScaleSmall)));
    node.runAction(seq);
}

//闪烁动作
Global.blinkAction = function(node,actionTime=0.2,delayTime=2,nBlinkCount=0,endCall){
    node.stopAllActions();
    node.opacity = 255
    if(nBlinkCount){
        cc.tween(node)
        .repeat(nBlinkCount,
            cc.tween()
            .to(actionTime,{opacity:0})
            .delay(0.1)
            .to(actionTime,{opacity:255})
            .delay(delayTime)
    
        )
        .call(()=>{
            if(endCall) endCall()
        })
        .start()
    }
    else{
        cc.tween(node)
        .repeatForever(
            cc.tween()
            .to(actionTime,{opacity:0})
            .delay(0.1)
            .to(actionTime,{opacity:255})
            .delay(delayTime)
    
        )
        .start()
    }
    
},

// 剔除重复元素
Global.unique5 = function(arr){
    var x = new Set(arr);
    return [...x];
}

//节点摇晃效果
//@param node: 要摇晃的节点
//@param offset 摇晃的幅度(默认16)
//@param time: 摇晃的时间(默认1s)
//@param originPos: 摇晃结束后回到的位置
Global.shakeNode = function(node, offset, time, originPos) {
    offset = offset || 16;
    time = time || 1.0;
    let duration = 0.04;
    let originScale = node.scale
    // 一个震动耗时4个duration左,复位,右,复位
    // 同时左右和上下震动
    let times = Math.floor(time / (duration * 4));
    let moveLeft = cc.moveBy(duration, cc.v2(-offset, 0));
    let moveLReset = cc.moveBy(duration, cc.v2(offset, 0));
    let moveRight = cc.moveBy(duration, cc.v2(offset, 0));
    let moveRReset = cc.moveBy(duration, cc.v2(-offset, 0));
    let horSeq = cc.sequence(moveLeft, moveLReset, moveRight, moveRReset);
    let moveUp = cc.moveBy(duration, cc.v2(0, offset));
    let moveUReset = cc.moveBy(duration, cc.v2(0, -offset));
    let moveDown = cc.moveBy(duration, cc.v2(0, -offset));
    let moveDReset = cc.moveBy(duration, cc.v2(0, offset));
    let verSeq = cc.sequence(moveUp, moveUReset, moveDown, moveDReset);
    node.runAction(cc.sequence(cc.scaleTo(duration,originScale+0.025), cc.repeat(cc.spawn(horSeq, verSeq), times), cc.scaleTo(duration,originScale), cc.callFunc(()=>{
        if (originPos) {
            node.setPosition(originPos);
        }
    })));
}

//节点的箭头动作
Global.ArrowAction = function(obj,moveVal,nDur){
    let orgPos = obj.position
    obj.stopAllActions()
    cc.tween(obj)
    .repeatForever(
        cc.tween()
        .to(nDur,{x:orgPos.x+moveVal.x,y:orgPos.y+moveVal.y})
        .to(nDur,{x:orgPos.x,y:orgPos.y})
    )
    .start()
}

//将秒钟格式成：*:*:*
//nVal 秒
Global.formatSec = function(nVal,fmt,bShowDay){
    if(!fmt) fmt = '%s:%s:%s';

    let day = Math.floor(nVal/(24*3600))
    if(!bShowDay){
        day = 0
    }
    let min = Math.floor((nVal-day*24*3600)%3600);
    let nHour = Math.floor((nVal-day*24*3600)/3600);
    let nMin = Math.floor(min/60);
    let nSec = min%60;
    let strShow = cc.js.formatStr(fmt,Global.PrefixInteger(nHour,2),Global.PrefixInteger(nMin,2),Global.PrefixInteger(nSec,2))
    if(day>0){ //天数超过1，则显示成天的前缀

        strShow = day + (day>1?' days':' day')
    }
    return strShow
}

//将秒格式化时间差
Global.formatTimeDiff = function(nVal){
    let day = Math.floor(nVal/(24*3600))
    if(day > 0){
        return  (day + ((day==1)?" Day":" Days"))
    }
    let nHour = Math.floor((nVal-day*24*3600)/3600);
    if(nHour>0){
        return  (nHour + ((nHour==1)?" Hour":" Hours"))
    }
    let min = Math.floor((nVal-day*24*3600)%3600);
    
    let nMin = Math.floor(min/60);
    if(nMin>0){
        return  (nMin + ((nMin==1)?" Min":" Min"))
    }
    return "1 Min"

},

//将秒钟格式成：*:*:*
//nVal 秒
Global.format2Time = function(nVal){
    let fmt = '%s:%s';

    let min = Math.floor(nVal%3600);
    let nHour = Math.floor(nVal/3600);
    let nMin = Math.floor(min/60);
    let nSec = min%60;
    if (nHour > 0) {
        return cc.js.formatStr(fmt,Global.PrefixInteger(nHour,2),Global.PrefixInteger(nMin,2))
    }
    else {
        return cc.js.formatStr(fmt,Global.PrefixInteger(nMin,2),Global.PrefixInteger(nSec,2))
    }
}

//传入8，需要的字符长度为3，调用方法后字符串结果为：008
Global.PrefixInteger = function(num,m){
    return (Array(m).join(0) + num).slice(-m);
}

//数字转换为金钱格式
//传入1234，返回1,234
Global.formatMoney = function(numb) {
    let str = numb.toString();
    let format = str.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    return format;
}

// 获取时间字符串 
Global.getTimeStr = function(time, bIsShowHM, jointStr = ' '){
    var date = new Date(time*1000)
    var year = date.getFullYear();
    var month = date.getMonth()+1;
    //if (10 > month) {
    //    month = '0' + month
    //}
    var day = date.getDate();
    //if (10 > day) {
    //    day = '0' + day
    //}
    var hour = date.getHours();
    if (10 > hour) {
        hour = '0' + hour
    }
    var minutes = date.getMinutes();
    if (10 > minutes) {
        minutes = '0' + minutes
    }
    var seconds = date.getSeconds();
    if (10 > seconds) {
        seconds = '0' + seconds
    }
    if (bIsShowHM) {
        return hour+':'+minutes+':'+seconds
    } else {
        if(Global.language == 'en'){
            return day+'/'+month+'/'+year + jointStr+hour+':'+minutes+':'+seconds
        }
        else{
            return month+'/'+day+'/'+year + jointStr+hour+':'+minutes+':'+seconds
        }
        
    }
}

// 09-26 14:50
Global.getSimpleTimeStr = function(time){
    var date = new Date(time*1000)
    
    var month = date.getMonth()+1;
    if (10 > month) {
        month = '0' + month
    }
    var day = date.getDate();
    if (10 > day) {
        day = '0' + day
    }

    var hour = date.getHours();
    if (10 > hour) {
        hour = '0' + hour
    }
    var minutes = date.getMinutes();
    if (10 > minutes) {
        minutes = '0' + minutes
    }
    return month+"-"+day+ " "+hour+":"+minutes
    
},

//2022-09-06
Global.getFullDateStr = function(time){
    var date = new Date(time*1000)
    var year = date.getFullYear();
    var month = date.getMonth()+1;
    if (10 > month) {
        month = '0' + month
    }
    var day = date.getDate();
    if (10 > day) {
        day = '0' + day
    }
    if(Global.language == 'en'){
        return  day +"-" + month +'-'+year
    }
    else{
        return  year +"-" + month +'-'+day
    }
    
}

// 06/09
Global.getDateStrNoYear = function(time){
    var date = new Date(time*1000);
    var month = date.getMonth()+1;
    if (10 > month) {
        month = '0' + month
    }
    var day = date.getDate();
    if (10 > day) {
        day = '0' + day
    }

    return month + "." + day;
}


// 获取日期 
Global.getDateStr = function(time){
    var date = new Date(time*1000)
    var year = date.getFullYear();
    var month = date.getMonth()+1;
    // if (10 > month) {
    //     month = '0' + month
    // }
    var day = date.getDate();
    if (10 > day) {
        day = '0' + day
    }
    
    return month+'-'+day
    
    
}

Global.setLabelString = function(route, node, str) {
    let label = cc.find(route, node)
    if (label) {
        label.getComponent(cc.Label).string = str
    }
}

Global.setRichTextString = function(route, node, str) {
    let label = cc.find(route, node)
    if (label) {
        label.getComponent(cc.RichText).string = str
    }
}

Global.setSpriteFrame = function(route, node, spr) {
    let sprite = cc.find(route, node)
    if (sprite) {
        sprite.getComponent(cc.Sprite).spriteFrame = spr
    }
}

Global.setProgress = function(route, node, progress) {
    let progressBar = cc.find(route, node)
    if (progressBar) {
        progressBar.getComponent(cc.ProgressBar).progress = progress
    }
}

Global.onClick = function(route, node, callback, target) {
    let button = cc.find(route, node)
    if (button) {
        button.on('click', callback, target)
    }
}

Global.delayInteractable= function(node, dt=0.5) {
    let button = node.getComponent(cc.Button)
    if (button) {
        button.interactable = false
        node.runAction(cc.sequence(cc.delayTime(dt), cc.callFunc(()=>{
            button.interactable = true
        })))
    }   
}

Global.awaitTime = function(component, time) {
    return new Promise((sucess, failed)=>{
        component.scheduleOnce(()=>{
            sucess()
        },time)
    })
}

/*
    函数:格式化字符串
    参数：str:字符串模板； data:数据
    调用方式:formatString("api/values/{id}/{name}",{id:101,name:"test"});
             formatString("api/values/{0}/{1}",101,"test");
*/
Global.formatString = function(str, data) {
    if (!str || data == undefined) {
        return str
    }
    if (typeof data === "object") {
        for (var key in data) {
            if (data.hasOwnProperty(key)) {
                str = str.replace(new RegExp("\{" + key + "\}", "g"), data[key])
            }
        }
    } else {
        var args = arguments,
            reg = new RegExp("\{([0-" + (args.length - 1) + "])\}", "g")
        return str.replace(reg, function(match, index) {
            return args[index - (-1)]
        });
    }
    return str
}
