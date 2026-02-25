import ShopViewCoin from "./scripts/ShopViewCoin";

const { ccclass, property } = cc._decorator;

@ccclass
export default class ShopViewMainV3View extends cc.Component {
    @property(cc.Node)
    walletNode: cc.Node = null;

    private netListener: any;
    private localData: any;
    private _pDrawinfo: any;


    onLoad() {
        // cc.log("ShopViewMain", "onLoad")
        this.netListener = this.node.addComponent("NetListenerCmp");
        Global.FixDesignScale_V(this.node);
        this.initWalletNode();
        let scroll = cc.find("safeview/ScrollView", this.node).getComponent(cc.ScrollView)
        this.scheduleOnce(()=>{
            scroll.scrollToTop(0.1)
        }, 0.2)
    }

    onEnable(): void {
        // cc.log("ShopViewMain", "onEnable")
        // this.netListener.registerMsg(MsgId.REQ_SHOP_EX, this.REQ_SHOP_EX, this);
        this.netListener.registerMsg(MsgId.PURCHASE_RECHARGE_SUC, this.PURCHASE_RECHARGE_SUC, this);
        this.netListener.registerMsg(MsgId.PERSIONAL_INFO, this.PERSIONAL_INFO, this);
        this.netListener.registerMsg(MsgId.UPDATE_USER_INFO, this.UPDATE_USER_INFO, this);
        // 请求商城数据 1:金币，25:钻石 14:VIP1 15:VIP2 多个类型用逗号隔开
        // cc.vv.NetManager.sendAndCache({ c: MsgId.REQ_SHOP_EX, stype: "1", platform: Global.isIOS() ? 2 : 1 }, true);
        cc.vv.NetManager.sendAndCache({ c: MsgId.PERSIONAL_INFO, otheruid: cc.vv.UserManager.uid }, true);
        
        //直接更新
        this.updateWalletView()

        var eventListener = this.node.addComponent("EventListenerCmp");
        eventListener.registerEvent(EventId.UPATE_COINS, this.updateCoin, this); // // 监听更新钻石更新
    }


    onDisable(): void {
        this.netListener.clear();
    }

    // REQ_SHOP_EX(msg) {
    //     // throw new Error("Method not implemented.");
    //     // 处理数据
    //     // this.pageView.
    //     if (msg.code != 200) return;
    //     if (msg.spcode && msg.spcode > 0) return;
    //     let shoplist = msg.shoplist || {};
    //     if (shoplist.data1) shoplist.data1.sort((a, b) => { return a.amount - b.amount })
    //     let shopViewCoin = this.getComponentInChildren(ShopViewCoin);
    //     if (shopViewCoin && shoplist.data1) {
    //         shopViewCoin.initData(shoplist.data1);
    //     }
    // }

    // 充值钻石成功 进行界面刷新
    PURCHASE_RECHARGE_SUC(msg) {
        if (msg.code != 200) return;
        if (msg.spcode && msg.spcode > 0) return;
        cc.vv.NetManager.sendAndCache({ c: MsgId.REQ_SHOP_EX, stype: "1", platform: Global.isIOS() ? 2 : 1 }, true);
    }


    // 得到用户信息
    PERSIONAL_INFO(msg) {
        if (msg.code != 200) return;
        if (!msg.playerInfo) return;
        if (!msg.playerInfo.uid) return;
        
        // 因为winng服务器不会推，需要主动同步
        cc.vv.UserManager.dcoin = msg.playerInfo.dcoin;
        cc.vv.UserManager.ecoin = msg.playerInfo.ecoin;
        cc.vv.UserManager.SetCoin(msg.playerInfo.coin,true);

        this._pDrawinfo = msg.playerInfo.drawinfo
        
        this.updateWalletView()
    }
    // 用户信息更新
    UPDATE_USER_INFO(msg) {
        if(this._pDrawinfo){
            if(msg.user && msg.user.drawinfo){
                if(cc.js.isNumber(msg.user.drawinfo.isfirstdraw)){
                    this._pDrawinfo.isfirstdraw = msg.user.drawinfo.isfirstdraw
                }

                if(cc.js.isNumber(msg.user.drawinfo.isfirstdeposit)){
                    this._pDrawinfo.isfirstdeposit = msg.user.drawinfo.isfirstdeposit
                }
                if(cc.js.isNumber(msg.user.drawinfo.islimited)){
                    this._pDrawinfo.islimited = msg.user.drawinfo.islimited
                }
            }
        }
        this.updateWalletView()
    }

    initWalletNode() {
        cc.find("btn_add", this.walletNode).on("click", () => {
            StatisticsMgr.reqReport(ReportConfig.BANK_ADD_CASH);
            cc.vv.UserManager.showChargeUI()
        });
        // 提取
        cc.find("layout/item_winnings/btn_withdraw", this.walletNode).on("click", () => {
            
            let bBind = (cc.vv.UserManager.kyc == 1)
            if(!bBind){
                //需要先绑定
                StatisticsMgr.reqReport(ReportConfig.BANK_VERFY);
                cc.vv.PopupManager.showTopWin("YD_Pro/prefab/yd_charge", {
                    onShow: (node) => {
                        node.getComponent("yd_charge").setURL(cc.vv.UserManager.kycUrl);
                    }
                })
                return
            }
            
            //是否提现被限制
            StatisticsMgr.reqReport(ReportConfig.BANK_WITHDRAW);
            let _pDrawinfo = this._pDrawinfo
            if(_pDrawinfo){
                if(_pDrawinfo.islimited){
                    //提现被限制了，需要提示
                    cc.vv.AlertView.show(___("Upgrade your VIP level to enjoy unlimited withdraw"), () => {
                        
                        cc.vv.PopupManager.showTopWin("YD_Pro/prefab/yd_charge", {
                            onShow: (node) => {
                                node.getComponent("yd_charge").setURL(cc.vv.UserManager.payurl);
                            }
                        })
                        
                    }, () => {
    
                    },false,null,null,___("Upgrade Later"),___("Upgrade Now"));
                    return
                }
                //是否首次提现
                if(cc.vv.UserManager.coin>_pDrawinfo.maxcoin){
                    if(_pDrawinfo.isfirstdraw){
                        //需要提示
                        let url = "YD_Pro/prefab/yd_withdarwtips"
                        cc.vv.PopupManager.addPopup(url, {
                            onShow:(node) =>{
                                node.getComponent("yd_withdrawTips").showTipType(1,_pDrawinfo.maxcoin)
                            }
                        })
                        return
                    }
                }
            }
            
            
            cc.vv.PopupManager.showTopWin("YD_Pro/prefab/yd_charge", {
                onShow: (node) => {
                    node.getComponent("yd_charge").setURL(cc.vv.UserManager.drawUrl);

                    let cp = node.addComponent("NodeLifeCallBack")
                    cp.setDestroyCall(()=>{
                        //更新一下winning
                        cc.vv.NetManager.sendAndCache({ c: MsgId.PERSIONAL_INFO, otheruid: cc.vv.UserManager.uid }, true);
                    })
                }
            })
        });
        // // 验证
        // cc.find("layout/item_winnings/btn_verifynow", this.walletNode).on("click", () => {
        //     StatisticsMgr.reqReport(ReportConfig.BANK_VERFY);
        //     cc.vv.PopupManager.showTopWin("YD_Pro/prefab/yd_charge", {
        //         onShow: (node) => {
        //             node.getComponent("yd_charge").setURL(cc.vv.UserManager.kycUrl);
        //         }
        //     })
        // });
        // // 提示
        let btn_amount_hint = cc.find("layout/item_amount/btn_hint", this.walletNode);
        btn_amount_hint.on("click", () => {
            let wroldPos = btn_amount_hint.convertToWorldSpaceAR(cc.v2(-340, -50))
            let endPos = cc.v3(cc.find("Canvas").convertToNodeSpaceAR(wroldPos));
            let url = "BalootClient/ShopV2/prefabs/ShopWalletHintAmount"
            cc.vv.PopupManager.addPopup(url, {
                noMask: true,
                pos: endPos,
                noCloseHit: true,
                onShow: (node) => {
                    node.opacity = 0;
                    node.position = endPos.add(cc.v3(0, 200))
                    cc.tween(node).to(0.1, { opacity: 255, position: endPos }).start();
                }
            })
        });
        let btn_winnings_hint = cc.find("layout/item_winnings/btn_hint", this.walletNode);
        btn_winnings_hint.on("click", () => {
            let wroldPos = btn_winnings_hint.convertToWorldSpaceAR(cc.v2(-340, -50))
            let endPos = cc.v3(cc.find("Canvas").convertToNodeSpaceAR(wroldPos));
            let url = "BalootClient/ShopV2/prefabs/ShopWalletHintWinnings"
            cc.vv.PopupManager.addPopup(url, {
                noMask: true,
                pos: endPos,
                noCloseHit: true,
                onShow: (node) => {
                    node.opacity = 0;
                    node.position = endPos.add(cc.v3(0, 200))
                    cc.tween(node).to(0.1, { opacity: 255, position: endPos }).start();
                }
            })
        });
        let btn_cashbouns_hint = cc.find("layout/item_cashbouns/btn_hint", this.walletNode);
        btn_cashbouns_hint.on("click", () => {
            let wroldPos = btn_cashbouns_hint.convertToWorldSpaceAR(cc.v2(-340, -50))
            let endPos = cc.v3(cc.find("Canvas").convertToNodeSpaceAR(wroldPos));
            let url = "BalootClient/ShopV2/prefabs/ShopWalletHintCashBouns"
            cc.vv.PopupManager.addPopup(url, {
                noMask: true,
                pos: endPos,
                noCloseHit: true,
                onShow: (node) => {
                    node.opacity = 0;
                    node.position = endPos.add(cc.v3(0, 200))
                    cc.tween(node).to(0.1, { opacity: 255, position: endPos }).start();
                }
            })
        });

        let btn_cashbonus_trans = cc.find("layout/item_cashbouns/btn_transfer",this.walletNode)
        btn_cashbonus_trans.on("click",()=>{
            //跳转Bonus
            // cc.vv.GameManager.jumpTo(11)
            cc.vv.PopupManager.addPopup("YD_Pro/prefab/yd_bonus_transfer",{onShow: (node) => {
                let cp = node.addComponent("NodeLifeCallBack")
                    cp.setDestroyCall(()=>{
                        //更新一下winning
                        cc.vv.NetManager.sendAndCache({ c: MsgId.PERSIONAL_INFO, otheruid: cc.vv.UserManager.uid }, true);
                    })
            }})

        })

        // let btn_safe_hint = cc.find("layout/item_safe/btn_hint",this.walletNode)
        // btn_safe_hint.on("click",()=>{
        //     let wroldPos = btn_safe_hint.convertToWorldSpaceAR(cc.v2(-350, -50))
        //     let endPos = cc.v3(cc.find("Canvas").convertToNodeSpaceAR(wroldPos));
        //     let url = "BalootClient/ShopV2/prefabs/ShopWalletHintSafe"
        //     cc.vv.PopupManager.addPopup(url, {
        //         noMask: true,
        //         pos: endPos,
        //         noCloseHit: true,
        //         onShow: (node) => {
        //             node.opacity = 0;
        //             node.position = endPos.add(cc.v3(0, 200))
        //             cc.tween(node).to(0.1, { opacity: 255, position: endPos }).start();
        //         }
        //     })
        // })

        // let btn_transfer = cc.find("layout/item_safe/btn_transfer",this.walletNode)
        // btn_transfer.on("click",()=>{
        //     let url = "YD_Pro/prefab/yd_safe"
        //     cc.vv.PopupManager.addPopup(url, {isWait: true, scaleIn: true })
        // })

        let btn_transcation = cc.find("layout/item_mytransfer/btn_go",this.walletNode)
        btn_transcation.on("click",()=>{
            StatisticsMgr.reqReport(ReportConfig.BANK_TRANSACTIONS);
            cc.vv.PopupManager.showTopWin("YD_Pro/prefab/yd_charge", {
                onShow: (node) => {
                    node.getComponent("yd_charge").setURL(cc.vv.UserManager.transactionUrl);
                }
            })
        })

        let btn_manager = cc.find("layout/item_manager/btn_go",this.walletNode)
        btn_manager.on("click",()=>{
            StatisticsMgr.reqReport(ReportConfig.BANK_PAYMENTS);
            cc.vv.PopupManager.showTopWin("YD_Pro/prefab/yd_charge", {
                onShow: (node) => {
                    node.getComponent("yd_charge").setURL(cc.vv.UserManager.paymentUrl);
                }
            })
        })

        let btn_support = cc.find("layout/item_support/btn_go",this.walletNode)
        btn_support.on("click",()=>{
            let url = "YD_Pro/prefab/yd_service"
            cc.vv.PopupManager.addPopup(url, {isWait: true, scaleIn: true })
        })
    }

    // 更新钱包界面
    updateWalletView() {
        cc.find("value", this.walletNode).getComponent(cc.Label).string = "₹ "+cc.vv.UserManager.coin.toFixed(2);
        cc.find("layout/item_amount/label", this.walletNode).getComponent(cc.Label).string = "₹ "+cc.vv.UserManager.ecoin.toFixed(2);
        cc.find("layout/item_winnings/label", this.walletNode).getComponent(cc.Label).string = "₹ "+cc.vv.UserManager.dcoin.toFixed(2);
        cc.find("layout/item_cashbouns/label", this.walletNode).getComponent(cc.Label).string = "₹ "+cc.vv.UserManager.cashbonus.toFixed(2);
        // cc.find("layout/item_safe/label", this.walletNode).getComponent(cc.Label).string = "₹ "+cc.vv.UserManager.bankcoin.toFixed(2);

        let bBind = (cc.vv.UserManager.kyc == 1)
        cc.find("layout/item_winnings/btn_withdraw", this.walletNode).active = true;
        // cc.find("layout/item_winnings/btn_verifynow", this.walletNode).active = !bBind;
        // cc.find("layout/item_winnings/label2", this.walletNode).active = !bBind;

    }

    updateCoin(){
        this.updateWalletView()
    }
}
