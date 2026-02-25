/*
** 支付管理
** 
** 
*/

cc.Class({
    extends: cc.Component,
    statics: {
        init: function () {
            
            // 注册全局消息
            this.registerAllMsg();

            
        },

        registerAllMsg: function () {
            
            //注册sdk支付回调
            cc.vv.NetManager.registerMsg(MsgId.PURCHASE_CHECK_ORDER, this.onRcvMsgCheckOrder.bind(this));
            //获取订单
            cc.vv.NetManager.registerMsg(MsgId.PURCHASE_GET_ORDER, this.onRcvNetGetChargeOrder, this);

            cc.vv.PlatformApiMgr.addCallback(this.paySdkCallback.bind(this),"paySdkCallback")
            cc.vv.PlatformApiMgr.addCallback(this.onPaymentErrorCallback.bind(this), "PaymentErrorCallback");
            cc.vv.PlatformApiMgr.addCallback(this.queryAllSKUCallback.bind(this), "queryAllSKUCallback");
        },

        //查看可售商品详细
        //需要在各自项目中配置Global.pid_cfg数据。为字符串数组：["com.rummyfree.7","com.rummyfree.8"]
        //google会在连接成功后调用,iOS的话可初始化直接调用
        queryAllSKU:function(){

            if(Global.PID_CFG){
                let data = {}
                if(Global.isAndroid()){
                    if(Global.IsHuawei()){
                        //华为可能有多个包,再用app区分
                        let bHuaweiLogin = cc.vv.UserManager.logintype == Global.LoginType.HUAWEI
                        let bHasHW = Global.PID_CFG["huawei"+Global.appId] || Global.PID_CFG["huawei"]
                        if(bHuaweiLogin && bHasHW){
                            data.Pids = bHasHW
                        }
                        else{
                            return
                        }
                        
                    }
                    data.Pids = Global.PID_CFG.google
                }
                else {
                    data.Pids = Global.PID_CFG.ios
                }
                
                cc.vv.PlatformApiMgr.SdkQueryAllSKU(JSON.stringify(data))
            }
            else{
                //未配置,不查询当地价格
            }
            

        },

        //sdk支付回调
        paySdkCallback: function(data){
            cc.log("支付成功回调服务端:" + JSON.stringify(data))
            this.sendCheckOrder(data);
        },

        onPaymentErrorCallback: function (dataDic) {
            Global.dispatchEvent(EventId.PAY_RESULT,0)
            cc.vv.LoadingTip.hide(0.1, true);

            if (dataDic.code == "0") {
                
                if(dataDic.errCode == 18){
                    //用户取消支付
                    //打点
                    StatisticsMgr.reqReport(StatisticsMgr.REQ_USER_CANCEL_PAY) 
                }
                else{
                    let str = dataDic.msg
                    if(str.indexOf("Item is not owned by the user") == -1){
                        cc.vv.LoadingTip.hide(0.1, true);
                        cc.vv.FloatTip.show(str)
                        
                    }
                    else{
                        
                    }
                }
            }
            else if(dataDic.code == "100"){
                //支付连接成功
               
            }
        },

        queryAllSKUCallback:function(data){
           
            let details = data.price_detail
            if(details){
                this._local_prices = details

            }

            // //TODO TEST 
            // AppLog.warn(JSON.stringify(data));
            // let p1 = this.getLocalPrice("com.rummyfree.7")
            // AppLog.warn("Android:"+p1);
            // let p2 = this.getLocalPrice("com.mensa.card.7")
            // AppLog.warn("IOS:"+p2);
        },

        /**
         * 
         * @param {string} pid 获取当地显示价格 
         * @return {string} 显示价格,带了当地货币符号的.需要判断返回值,如果为假,则用默认价格表示形式
         */
        getLocalPrice:function(pid){
            let res = null
            if(this._local_prices){
                for(let i = 0; i < this._local_prices.length; i++){
                    let item = this._local_prices[i]
                    if(item.pid == pid){
                        res =  item.price
                        break;
                    }
                }
            }
            return res
        },

        //下单
        reqPurchaseOrder: function (goods_id) {
            let self = this

            cc.vv.LoadingTip.show(cc.vv.Language.Purchasing, true);
            
            let uid = cc.vv.UserManager.uid
            cc.vv.PlatformApiMgr.KoSDKTrackEvent('do_order', JSON.stringify({ game_uid: uid }))

            let sureCall = function(){
                var req = {c:MsgId.PURCHASE_GET_ORDER};
                req.id = goods_id;
                req.appId = Global.appId
                var plat = 0;
                if(Global.isAndroid()){
                    plat = 1;
                }
                else if(Global.isIOS()){
                    plat = 2;
                }
                if(cc.sys.isBrowser){
                    plat = 3; //网页下单
                }
                req.platform = plat;
                req.version = cc.vv.PlatformApiMgr.getAppVersion();
                cc.vv.NetManager.send(req);
            }
            
            sureCall()


            
        },

        //sdk充值完成，发送协议给服务端校验
        sendCheckOrder: function(data){
            cc.vv.LoadingTip.hide(0.1, true);

            cc.vv.EventManager.emit("SEND_CHECK_ORDER", data);

            var req = null
            if(Global.isAndroid()){
                //google pay 回调
                var strResult = data.result
                if(strResult === "1"){
                    var msg = data.message
                    var sign = data.signature
                    var pid = data.pid

                    req = {c:MsgId.PURCHASE_CHECK_ORDER}
                    req.orderid = this.getOrderId(pid);
                    req.platform = 1
                    req.data = msg
                    req.sign = sign
                }
                else {
                    //支付异常
                    var strErr = data.errInfo
                    cc.vv.FloatTip.show(strErr)
                    Global.dispatchEvent(EventId.PAY_RESULT,0)
                }

            }
            else if(Global.isIOS()){
                //apple pay 回调
                var receipt = data.receipt
                var orderid  = data.orderid
                
                req = {c:MsgId.PURCHASE_CHECK_ORDER}
                req.orderid = orderid
                req.platform = 2
                req.data = receipt
                req.sign = ''
            }

            if(req){
                req.appId = Global.appId
                cc.vv.NetManager.send(req)
            }
        },

        //补单
        doReplaceOrder: function(){
            var self = this
            if(Global.isIOS()){
                cc.vv.PlatformApiMgr.addCallback(self.paySdkReplacementCallback.bind(this),"paySdkReplacementCallback")
                var data = "abc"//空的字符
                cc.vv.PlatformApiMgr.SdkReplaceOrder(data)
            }
            else if(Global.isAndroid()){
                if(Global.IsHuawei()){
                    if(!cc.vv.PlatformApiMgr.isHuaweiServerAvailble()){
                        return
                    }
                }
                cc.vv.PlatformApiMgr.GPCheckUnComsumerOrder();
            }
            
        },

        //支付校验成功
        onRcvMsgCheckOrder:function(msg){
            if(msg.code === 200){
                Global.dispatchEvent(EventId.PAY_RESULT,1)
                if(Global.isIOS()){
                    //删除订单缓存
                    var data = {}
                    data.Flag = msg.flag
                    data.OrderId = msg.orderid 
                    cc.vv.PlatformApiMgr.SdkDelOrderCache(JSON.stringify(data));
                }
                else if(Global.isAndroid()){
                    //消耗产品
                    let token = msg.purchaseTokenData
                    let bHuawei = Global.IsHuawei()
                    if(bHuawei){
                        cc.vv.PlatformApiMgr.doHuaweiPayComsumerOrder(token)
                    }
                }
                this.sendSDKTrackEvent(msg.price);
            }
        },

        //发送sdk打点事件
        sendSDKTrackEvent: function (price) {
            // let platStr = "web";
            // if (Global.isIOS()) platStr = "ApplePay";
            // if (Global.isAndroid()) platStr = "GooglePay";
            // cc.vv.PlatformApiMgr.KoSDKTrackEvent('Purchase',JSON.stringify({plat:platStr, price:price, userid:Global.playerData.uid}))
            let evtName = 'af_purchase'
            if(Global.IsHuawei()){
                evtName = 'Purchase_Success'
            }
            //购买成功
            cc.vv.PlatformApiMgr.KoSDKTrackEvent(evtName,JSON.stringify({af_revenue:price, uid:Global.playerData.uid}))
            
        },

        //补单回调
        paySdkReplacementCallback: function(data){
            var self = this
            self.sendCheckOrder(data)
        },

        onRcvNetGetChargeOrder: function(msg){
            if(msg.code === 200){
                if(cc.sys.isBrowser){
                    //h5直接跳转
                    var url = msg.paymentUrl;
                    //window.location.href=url    //同窗口打开
                    window.open(url);   //新窗口打开
                }
                else{
                    cc.vv.LoadingTip.show(cc.vv.Language.Purchasing, true);
                    //获取到订单号
                    var data = {};
                    data.Pid = msg.productid;
                    data.OrderId = msg.orderid; //订单号这个到时候回从服务器获取
                    if(Global.IsHuawei()){
                        data.rolename = cc.vv.UserManager.getNickName()
                        data.rolelv = cc.vv.UserManager.getCurLv()
                    }
                    cc.vv.PlatformApiMgr.SdkPay(JSON.stringify(data));

                    this.saveOrderInfo(msg.productid, msg.orderid);
                }
            }
            else{
                cc.vv.LoadingTip.hide(0.1, true);
            }
        },

        //考虑补单问题，android不能透传
        //自己存一份
        saveOrderInfo: function (productid, orderid) {
            let orderData = JSON.parse(Global.getLocal("PURCHASE_ORDER_DATA", "{}"));
            let curOrderList = orderData[productid] || [];
            curOrderList.push(orderid);
            orderData[productid] = curOrderList;
            Global.saveLocal("PURCHASE_ORDER_DATA", JSON.stringify(orderData));
        },
        
        getOrderId: function (productid, isClear) {
            let orderData = JSON.parse(Global.getLocal("PURCHASE_ORDER_DATA", "{}"));
            let curOrderList = orderData[productid];
            if (curOrderList && curOrderList.length > 0) {
                let orderId = curOrderList.pop();
                orderData[productid] = []; //清空
                Global.saveLocal("PURCHASE_ORDER_DATA", JSON.stringify(orderData));
                return orderId;
            }
            else {
                AppLog.err("没有找到" + productid + "对应订单");
            }
        },
    }
});
