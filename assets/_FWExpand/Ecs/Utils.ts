const bigNumMap = [
	{ len: 3, mark: "K" },
	{ len: 6, mark: "M" },
	{ len: 9, mark: "B" },
	{ len: 12, mark: "T" },
]
export default class Utils {
	// 以指定符号三位间隔格式化数字
	public static formatNumWithSymbol(num: number, symbol: string = ',', alwaysFix: boolean = false, decimalNum: number = 2): string {
		if (!num)
			return num + "";
		let code = "";
		if (num < 0) {
			code = "-";
		}
		let absNum = Math.abs(num);
		let integer = Math.floor(absNum);
		let decimal = absNum - integer;
		let numStr = integer + '';
		let parts = [];
		for (let i = numStr.length - 1; i >= 0; i -= 3) {
			parts.unshift(numStr.slice(Math.max(0, i - 2), i + 1));
		}
		// 小数位
		let decimalStr = "";
		if (alwaysFix || decimal >= 1 / Math.pow(10, decimalNum)) {
			decimalStr = decimal.toFixed(decimalNum).slice(1);
		}
		return code + parts.join(symbol) + decimalStr;
	}

	// 以K,M,B,T格式化数字(fmtLen:从第几位开始格式化,digits:小数点保留最多位数)
	public static formatBigNum(num: number, fmtLen: number = 5, digits: number = 2): string {
		if (typeof num !== 'number' || num === 0)
			return num + "";
		let code = "";
		if (num < 0) {
			code = "-";
		}
		let absNum = Math.abs(num);
		let integer = Math.floor(absNum);
		let numStr = integer + '';
		let ret = "";
		if (numStr.length < fmtLen) {
			return Utils.formatNumWithSymbol(num);
		}
		let cfg = null;
		bigNumMap.some((value) => {
			if (numStr.length > value.len) {
				cfg = value;
			} else {
				return true;
			}
			return false;
		});
		if (!cfg) {
			return code + numStr;
		}
		let subLen = numStr.length - cfg.len;
		let headStr = numStr.substring(0, subLen);
		let tailStr = numStr.substring(subLen, numStr.length);
		let regular = new RegExp("[0]{" + tailStr.length.toString() + "}", "g");
		if (tailStr.length > 0 && !regular.test(tailStr)) {
			tailStr = tailStr.substring(0, Math.min(digits, tailStr.length));
			ret = code + headStr + "." + tailStr + cfg.mark;
		} else {
			ret = code + headStr + cfg.mark;
		}
		return ret;
	}

	//封装随机数函数
	public static randomBy(under: number = 0, over: number = 1, isInteger: boolean = true) {
		let ret;
		if (typeof under == "number" && typeof over == "number") {
			ret = (Math.random() * (over - under + 1) + under);
		} else if (typeof under == "number") {
			ret = (Math.random() * under + 1);
		}
		if (isInteger) {
			ret = Math.min(Math.max(Math.round(ret), under), over);
		}
		return ret;
	}

	//object属性混合
	public static merge(targetObj: object, mergeObj: object, newObject: boolean = false, fliter?: Function) {
		let ret;
		if (newObject) {
			ret = {};
			for (var i in targetObj) {
				ret[i] = targetObj[i];
			}
		} else {
			ret = targetObj;
		}
		for (var i in mergeObj) {
			if (fliter && fliter(i, ret[i], mergeObj[i])) {
				ret[i] = mergeObj[i];
			} else {
				ret[i] = mergeObj[i];
			}
		}
		return ret;
	}

	// 深度克隆
	public static deepClone = function (obj) {
		// 先检测是不是数组和Object
		// let isArr = Object.prototype.toString.call(obj) === '[object Array]';
		let isArr = Array.isArray(obj);
		let isJson = Object.prototype.toString.call(obj) === '[object Object]';
		if (isArr) {
			// 克隆数组
			let newObj = [];
			for (let i = 0; i < obj.length; i++) {
				newObj[i] = Utils.deepClone(obj[i]);
			}
			return newObj;
		} else if (isJson) {
			// 克隆Object
			let newObj = {};
			for (let i in obj) {
				newObj[i] = Utils.deepClone(obj[i]);
			}
			return newObj;
		}
		// 不是引用类型直接返回
		return obj;
	}

	//随机颜色
	public static randomColor(args?: any) {
		return cc.color(Utils.randomBy(0, 255), Utils.randomBy(0, 255), Utils.randomBy(0, 255));
	}

	//随机牌值
	public static randomCardUint(args?: any) {
		return 0x100 * Utils.randomBy(1, 4) + Utils.randomBy(2, 14);
	}

	//获取url上的显示参数
	public static getQueryVariable(variable: string): any {
		var query = window.location.search.substring(1);
		var vars = query.split("&");
		for (var i = 0; i < vars.length; i++) {
			var pair = vars[i].split("=");
			if (pair[0] == variable) return pair[1];
		}
		return;
	}

	// 整数补0
	public static prefixInteger(num: number, length: number): string {
		return (Array(length).join('0') + num).slice(-length);
	}

	// // 光效移动动画
	// public static playShineMoveAnim(args: any = {}) {
	// 	// cc.log("args =", args);
	// 	let from = args.from;
	// 	let to = args.to;
	// 	let callback = args.callback;
	// 	let prefabPath = args.prefabPath || "prefab/CommonFlyEffect";
	// 	// 光效所在父节点
	// 	let parent: cc.Node;
	// 	let zIndex: number;
	// 	if (args.parent) {
	// 		parent = args.parent;
	// 		from = parent.convertToNodeSpaceAR(from);
	// 		to = parent.convertToNodeSpaceAR(to);
	// 		zIndex = args.zIndex;
	// 	} else {
	// 		parent = cc.director.getScene();
	// 		zIndex = cc.macro.MAX_ZINDEX;
	// 	}
	// 	// 贝塞尔曲线配置
	// 	let speed = args.speed || .8;
	// 	let controlPoint = cc.v2();
	// 	if (from.x > to.x) {
	// 		if (from.y > to.y) {
	// 			controlPoint = cc.v2(from.x - (from.x - to.x + 120) / 2, from.y - 30);
	// 		} else {
	// 			controlPoint = cc.v2(from.x - (from.x - to.x) / 2, to.y + 60);
	// 		}
	// 	} else {
	// 		if (from.y > to.y) {
	// 			controlPoint = cc.v2(from.x + (to.x - from.x + 120) / 2, from.y - 30);
	// 		} else {
	// 			controlPoint = cc.v2(from.x + (to.x - from.x) / 3, to.y + 60);
	// 		}
	// 	}

	// 	let nLight: cc.Node = new cc.Node("nLight");
	// 	nLight.parent = parent;
	// 	nLight.zIndex = zIndex;
	// 	nLight.position = from;
	// 	// 加载资源
	// 	let loader = new bm.Loader();
	// 	loader.loadRes(prefabPath, cc.Prefab, (res: cc.Prefab) => {
	// 		let node = cc.instantiate(res);
	// 		node.parent = nLight;
	// 		let spine: sp.Skeleton = node.getComponentInChildren(sp.Skeleton);
	// 		// spine.node.active = false;
	// 		cc.tween(nLight)
	// 			.delay(0.1)
	// 			.bezierTo(speed, from, controlPoint, to)
	// 			.call(() => {
	// 				if (!cc.isValid(nLight))
	// 					return;
	// 				spine.node.active = true;
	// 				spine.setAnimation(0, "animation", false);
	// 				if (typeof callback == "function") callback();
	// 			})
	// 			.delay(0.3)
	// 			.call(() => {
	// 				if (!cc.isValid(nLight))
	// 					return;
	// 				nLight.parent = null;
	// 			})
	// 			.start();
	// 	});
	// }

	public static formatDate(fmt, time) {
		let D = new Date();
		if (time) {
			D.setTime(time);
		}
		var o = {
			"M+": D.getMonth() + 1,              	 	//月份 
			"d+": D.getDate(),                    		//日 
			"h+": D.getHours(),                   		//小时 
			"m+": D.getMinutes(),                 		//分 
			"s+": D.getSeconds(),                 		//秒 
			"q+": Math.floor((D.getMonth() + 3) / 3), 	//季度 
			"S": D.getMilliseconds()             		//毫秒 
		};
		if (/(y+)/.test(fmt)) {
			fmt = fmt.replace(RegExp.$1, (D.getFullYear() + "").substr(4 - RegExp.$1.length));
		}
		for (var k in o) {
			if (new RegExp("(" + k + ")").test(fmt)) {
				fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
			}
		}
		return fmt;
	}

	public static async playSkeAnims(ske, anim1, anim2, callback?) {
		return new Promise<void>((resolve, reject) => {
			let entry: sp.spine.TrackEntry = ske.setAnimation(0, anim1, false);
			if (entry) {
				ske.setTrackCompleteListener(entry, (entry, loopCount) => {
					callback && callback()
					resolve()
					if (anim2) {
						ske.setAnimation(0, anim2, true);
					}
				})
			} else {
				callback && callback()
				resolve()
			}
		})
	}

	public static getPromise(callback, abortFunc?) {
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

	public static formatString(...params: any[]): string {
		let str: string = params[0];
		for (let i = 1; i < params.length; ++i) {
			str = str.replace('{' + i + '}', params[i]);
		}
		// cc.log('str = ', str);
		return str;
	}

	/**
	 * 限制节点到一定范围
	 * @param {*} target 需要变化的节点
	 * @param {*} params w:宽 h:高 force:如果target小于设置的x,y,是否需要强制拉伸到设置的宽高
	 */
	public static limitScaleTo(target: cc.Node, params: { w?: number, h?: number, force?: boolean }) {
		// 计算宽度需要缩小变化量
		var scaleX = 1;
		var scaleY = 1;
		if (params.w) {
			scaleX = params.w / target.width;
		}
		if (params.h) {
			scaleY = params.h / target.height;
		}
		var minScale = Math.min(scaleX, scaleY);
		if (params.force) {
			target.scale = minScale;
		} else if (minScale < 1) {
			target.scale = minScale;
		}
	}

	// 牌值
	public static getCardValue(card) {
		if (card > 0xFF) {
			return card % 0x100;
		} else {
			return (card & 0x0F) % 16;
		}
	}

	// 花色
	public static getCardVariety(card) {
		if (card > 0xFF) {
			return Math.floor(card / 0x100);
		} else {
			return (card & 0xF0) / 16;
		}
	}

	public static base64Encode(data) {
		var b64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/='
		var o1, o2, o3, h1, h2, h3, h4, bits, i = 0,
			ac = 0,
			enc = '',
			tmp_arr = []

		if (!data) {
			return data
		}

		data = unescape(encodeURIComponent(data))

		do {
			// pack three octets into four hexets
			o1 = data.charCodeAt(i++)
			o2 = data.charCodeAt(i++)
			o3 = data.charCodeAt(i++)

			bits = o1 << 16 | o2 << 8 | o3

			h1 = bits >> 18 & 0x3f
			h2 = bits >> 12 & 0x3f
			h3 = bits >> 6 & 0x3f
			h4 = bits & 0x3f

			// use hexets to index into b64, and append result to encoded string
			tmp_arr[ac++] = b64.charAt(h1) + b64.charAt(h2) + b64.charAt(h3) + b64.charAt(h4)
		} while (i < data.length)

		enc = tmp_arr.join('')

		var r = data.length % 3

		return (r ? enc.slice(0, r - 3) : enc) + '==='.slice(r || 3)
	}

	//限制字符串长度
	public static stringlimit(str,len){
		if(str == null || str == undefined)return "";
		var newLength = 0;
		var newStr = "";
		var chineseRegex = /[^\x00-\xff]/g;
		var singleChar = "";
		var strLength = str.replace(chineseRegex, "**").length;
		for (var i = 0; i < strLength; i++) {
			singleChar = str.charAt(i).toString();
			if (singleChar.match(chineseRegex) != null) {
				newLength += 2;
			}
			else {
				newLength++;
			}
			if (newLength > len) {
				break;
			}
			newStr += singleChar;
		}
		if (strLength > len) {

			newStr += "...";
		}
		return newStr;
	}
}
