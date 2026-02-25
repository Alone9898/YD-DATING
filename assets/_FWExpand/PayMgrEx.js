cc.Class({
    extends: require("PayMgr"),
    statics: {
        registerAllMsg: function () {
            //注册sdk支付回调
            cc.vv.NetManager.registerMsg(MsgId.PURCHASE_CHECK_ORDER, this.onRcvMsgCheckOrder.bind(this));
            //获取订单
            cc.vv.NetManager.registerMsg(MsgId.PURCHASE_GET_ORDER, this.onRcvNetGetChargeOrder, this);

            cc.vv.PlatformApiMgr.addCallback(this.paySdkCallback.bind(this), "paySdkCallback")
            cc.vv.PlatformApiMgr.addCallback(this.onPaymentErrorCallback.bind(this), "PaymentErrorCallback");
            cc.vv.PlatformApiMgr.addCallback(this.queryAllSKUCallback.bind(this), "queryAllSKUCallback");
            if (Global.isArabHero()) {
                cc.vv.PlatformApiMgr.addCallback(this.onBillingSetupFinished.bind(this), "onBillingSetupFinished");
                cc.vv.PlatformApiMgr.addCallback(this.onGooglePayInfoToJS.bind(this), "onGooglePayInfoToJS");
            }
        },
        // 支付报错
        onPaymentErrorCallback: function (dataDic) {
            if (dataDic.code == "0") {
                Global.dispatchEvent(EventId.PAY_RESULT, 0)
                cc.vv.LoadingTip.hide(0.1, true);
                if (dataDic.errCode == 18) {
                    //用户取消支付
                    //打点
                    StatisticsMgr.reqReportNow(StatisticsMgr.REQ_USER_CANCEL_PAY)
                } else {
                    let str = dataDic.msg
                    ___("Purchase Cancelled");
                    ___("Billing service DisConnected");
                    ___("Unsuccessful Purchase \nUnknown error");
                    ___("Unsuccessful Purchase \nVerification failed");
                    ___("Unsuccessful Purchase \niTunes Store verification failed");
                    ___("Unsuccessful Purchase \nCannot connect to iTunes Store");
                    ___("Unsuccessful Purchase \nThe product cannot be purchased");
                    if (str.indexOf("Item is not owned by the user") == -1) {
                        cc.vv.FloatTip.show(___(str))
                        cc.vv.LoadingTip.hide(0.1, true);
                        // cc.vv.AlertView.showTips(___(str), () => {
                        //     cc.vv.LoadingTip.hide(0.1, true);
                        // });
                    } else {

                    }
                }
            }
            else if (dataDic.code == "100") {
                //支付连接成功
            }
        },
        // 下单
        reqPurchaseOrder: function (goods_id) {
            let self = this
            // cc.vv.LoadingTip.showAndClose(cc.vv.Language.Purchasing);
            //下单打点
            let eventval = {
                "$Revenue": 0,
                "$CurrName": "SAR",
                "$TransactionId": 0,
                "$RoleName": cc.vv.UserManager.getNickName(),
                "$Vouchers": "0",
                "$MaterialSlot": "0",
                "$MaterialName": "0",
                "$Keywords": goods_id,
                "$Content": "0",
                "$PromotionName": "0",
                "$Medium": "SHOP",
                "$Source": "0",
                "$Voucher": "0",
                "$Class": "0",
                "$EndDate": cc.sys.now(),
                "$BeginDate": cc.sys.now(),
                "$Destination": "0",
                "$OriginatingPlace": "0",
                "$PassengersNumber": "0",
                "$BookingRooms": "0",
                "$BookingDays": "0",
            }
            cc.vv.PlatformApiMgr.KoSDKTrackEvent("$StartCheckout", JSON.stringify(eventval))

            let uid = cc.vv.UserManager.uid
            cc.vv.PlatformApiMgr.KoSDKTrackEvent('do_order', JSON.stringify({ game_uid: uid }))

            let sureCall = function () {
                var req = { c: MsgId.PURCHASE_GET_ORDER };
                req.id = goods_id;
                req.appId = Global.appId
                var plat = 0;
                if (Global.isAndroid()) {
                    plat = 1;
                }
                else if (Global.isIOS()) {
                    plat = 2;
                }
                if (cc.sys.isBrowser) {
                    plat = 3; //网页下单
                }
                if (Global.isSingle()) {
                    req.view = 1;
                }
                req.platform = plat;
                req.version = cc.vv.PlatformApiMgr.getAppVersion();
                cc.vv.NetManager.send(req);
            }
            sureCall()
        },
        // 下单成功
        onRcvNetGetChargeOrder: function (msg) {
            if (msg.code === 200) {
                if (cc.sys.isBrowser) {
                    //h5直接跳转
                    var url = msg.paymentUrl;
                    //window.location.href=url    //同窗口打开
                    window.open(url);   //新窗口打开
                }
                else {
                    // cc.vv.LoadingTip.show(cc.vv.Language.Purchasing, true);
                    //获取到订单号
                    var data = {};
                    data.Pid = msg.productid;
                    data.OrderId = msg.orderid; //订单号这个到时候回从服务器获取
                    if (Global.IsHuawei()) {
                        data.rolename = cc.vv.UserManager.getNickName()
                        data.rolelv = cc.vv.UserManager.getCurLv()
                    }
                    cc.vv.PlatformApiMgr.SdkPay(JSON.stringify(data));

                    this.saveOrderInfo(msg.productid, msg.orderid);
                }
            }
            else {
                cc.vv.LoadingTip.hide(0.1, true);
            }
        },
        //查看可售商品详细
        //需要在各自项目中配置Global.pid_cfg数据。为字符串数组：["com.rummyfree.7","com.rummyfree.8"]
        //google会在连接成功后调用,iOS的话可初始化直接调用
        queryAllSKUByProductids: function (pids) {
            if (!!pids) {
                let data = {};
                data.Pids = pids;
                cc.vv.PlatformApiMgr.SdkQueryAllSKU(JSON.stringify(data))
            }
        },
        //sdk充值完成，发送协议给服务端校验
        sendCheckOrder: function (data) {
            cc.vv.LoadingTip.hide(0.1, true);
            var req = null
            if (Global.isAndroid()) {
                //google pay 回调
                var strResult = data.result
                if (strResult === "1") {
                    var msg = data.message
                    var sign = data.signature
                    var pid = data.pid
                    req = { c: MsgId.PURCHASE_CHECK_ORDER }
                    // 如果有透传orderid，就用透传的，没有就用自己生成的
                    if (data.orderid) {
                        req.orderid = data.orderid;
                    } else {
                        req.orderid = this.getOrderId(pid);
                    }
                    req.platform = 1
                    req.data = msg
                    req.sign = sign
                }
                else {
                    //支付异常
                    var strErr = data.errInfo
                    cc.vv.FloatTip.show(strErr)
                    Global.dispatchEvent(EventId.PAY_RESULT, 0)
                }
            }
            else if (Global.isIOS()) {
                //apple pay 回调
                var receipt = data.receipt
                var orderid = data.orderid

                req = { c: MsgId.PURCHASE_CHECK_ORDER }
                req.orderid = orderid
                req.platform = 2
                req.data = receipt
                req.sign = ''
            }

            if (req) {
                req.appId = Global.appId
                if (Global.isSingle()) {
                    req.view = 1;
                }
                cc.vv.NetManager.send(req)
            }
        },

        //overwrite
        sendSDKTrackEvent: function (price) {
            if (Global.isYDApp()) {
                //YD 支付由服务器来打
                return
            }
            let evtName = 'af_purchase'
            if (Global.IsHuawei()) {
                evtName = 'Purchase_Success'
            }
            //购买成功
            cc.vv.PlatformApiMgr.KoSDKTrackEvent(evtName, JSON.stringify({ af_revenue: price, uid: Global.playerData.uid }))

        },

        // 支付连接成功
        onBillingSetupFinished: function () {
            // 连接成功后 进行商品更新
            if (cc.vv && cc.vv.UserManager && cc.vv.UserManager.productids) {
                this.queryAllSKUByProductids(cc.vv.UserManager.productids);
            }
        },
        // 支付流程返回
        // 传递支付流程结果给 js
        //    下单检测:
        //    code:201 开启下单检测调用
        //    code:202 SDK下单检测时候,出现问题(0:找不到订单号,代码出问题等等)
        //    独立查询:
        //    code:301 启动独立查询
        //    code:302 独立查询结果
        //    下单流程:
        //    code:401 SDK开启支付调用
        //    code:402 SDK开启支付结果
        //    支付结果:
        //    code:501 SDK支付界面开启成功
        //    code:502 SDK支付结果
        //    消费结果:
        //    code:601 SDK消费开始
        //    code:602 SDK消费结果
        //    任意阶段:
        //    code:-1 SKD未连接支付服务器


        // int SERVICE_TIMEOUT = -3;
        // int FEATURE_NOT_SUPPORTED = -2;
        // int SERVICE_DISCONNECTED = -1;
        // int OK = 0;
        // int USER_CANCELED = 1;
        // int SERVICE_UNAVAILABLE = 2;
        // int BILLING_UNAVAILABLE = 3;
        // int ITEM_UNAVAILABLE = 4;
        // int DEVELOPER_ERROR = 5;
        // int ERROR = 6;
        // int ITEM_ALREADY_OWNED = 7;
        // int ITEM_NOT_OWNED = 8;

        onGooglePayInfoToJS: function (data) {
            let ordMsg = "";
            // 确认订单状态 进行同步
            if (data.code == 201) {
                ordMsg = "开启下单检测调用";
            } else if (data.code == 202) {
                if (data.info.code == 0) {
                    ordMsg = "SDK下单检测信息成功";
                } else {
                    ordMsg = "SDK下单检测,未找到订单信息";
                }
            } else if (data.code == 301) {
                ordMsg = "启动独立查询订单信息";
            } else if (data.code == 302) {
                if (data.info.code == 0) {
                    ordMsg = "独立查询成功";
                } else {
                    ordMsg = "独立查询失败:" + data.info.msg;
                }
            } else if (data.code == 401) {
                ordMsg = "SDK唤起支付调用";
            } else if (data.code == 402) {
                if (data.info.code == 0) {
                    ordMsg = "SDK开启唤起成功";
                } else {
                    ordMsg = "SDK开启唤起失败:" + data.info.msg;
                }
            } else if (data.code == 501) {
                ordMsg = "SDK支付界面唤起";
            } else if (data.code == 502) {
                if (data.info.code == 0) {
                    ordMsg = "SDK支付成功";
                } else {
                    ordMsg = "SDK支付失败:" + data.info.msg;
                }
            } else if (data.code == 601) {
                ordMsg = "SDK消费开始";
            } else if (data.code == 602) {
                if (data.info.code == 0) {
                    ordMsg = "SDK消费成功";
                } else {
                    ordMsg = "SDK消费失败:" + data.info.msg;
                }
            }
            cc.vv.NetManager.send({
                c: MsgId.ORDER_INFO_UPDATE,
                orderid: data.purchase.OrderId,
                sdkOrderId: data.purchase.sdkOrderId,
                stageCode: data.code,
                infoCode: data.info.code,
                ordMsg: ordMsg
            });
        }

    }
});
