cc.Class({
    extends: cc.Component,

    properties: {
        listView: require('List'),

        itemPage: cc.Node,
        pageView: cc.PageView,
        scrollView: cc.ScrollView,
        indicator: cc.Node,
        _indicatorList: [],
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        this.pageView.node.on('page-turning', this.pageTurning, this);
    },

    start() {

    },

    updateView(data) {
        this.localData = data;

        let content = cc.find("view/content", this.scrollView.node);
        let dot0 = cc.find("dot0", content);
        for (let i = 0; i < data.length; i++) {
            let itemPage = i == 0 ? this.itemPage : cc.instantiate(this.itemPage);
            itemPage.active = true;
            this.onUpdatePage(itemPage, data[i]);
            this.pageView.addPage(itemPage);

            let dot = i == 0 ? dot0 : cc.instantiate(dot0);
            dot.parent = content;
            cc.find("dot1", dot).active = i == 0;
            Global.btnClickEvent(dot, ()=>{this.dotClick(i)}, this);
            this._indicatorList.push(dot);
        }
        content.width = Math.min(data.length*dot0.width, this.scrollView.node.width);
        this.scrollView.horizontal = data.length*dot0.width > this.scrollView.node.width;
        content.getComponent(cc.Layout).updateLayout();

        this.listView.numItems = data.length;
        this.listView.selectedId = 0;
    },

    onUpdatePage(node, data) {
        let biaoti = cc.find("biaoti", node);
        let layout = cc.find("layout", node);
        let goBtn = cc.find("btn_go", node);
        let sprite = cc.find("sprite", node);
        if (data.img && data.img.indexOf('http') > -1) {
            biaoti.active = false;
            layout.active = false;
            goBtn.active = false;
            sprite.active = true;
            // let spr = sprite.getComponent(cc.Sprite);
            // this._reqHandle && this._reqHandle.rejectFunc();
            // this._reqHandle = cc.vv.ResManager.loadImage(data.img, (err, res) => {
            //     if (cc.isValid(spr) && cc.isValid(sprite)) {
            //         if (res) {
            //             spr.spriteFrame = new cc.SpriteFrame(res);
            //         }
            //     }
            //     // 请求结束后删除请求句柄
            //     this._reqHandle = null;
            // })
            sprite.getComponent("UserHead").setHead(data.img,data.img)

            Global.btnClickEvent(cc.find("btn",sprite), this.goBtnClick, this);
        } else {
            biaoti.active = true;
            layout.active = true;
            goBtn.active = true;
            sprite.active = false;
            cc.find("title", biaoti).getComponent(cc.Label).string = "" + data.title;
            cc.find("label", layout).getComponent(cc.RichText).string = "" + data.content;
            Global.btnClickEvent(goBtn, this.goBtnClick, this);
        }
    },

    // 更新Item
    onUpdateMenuItem(item, idx) {
        let data = this.localData[idx];
        Global.setLabelString("unselect/lbl", item, data.btntxt);
        Global.setLabelString("select/lbl", item, data.btntxt);

        let curDate = Global.getFullDateStr(new Date()/1000);
        let lastDate = Global.getLocal("yd_activity_"+data.id, "");
        cc.find("unselect/RedHitAnim", item).active = curDate != lastDate;
    },

    // 选择菜单
    onSelectMenuItem(item, index, lastIndex) {
        let data = this.localData[index];
        let curDate = Global.getFullDateStr(new Date()/1000);
        Global.saveLocal("yd_activity_"+data.id, curDate);
        cc.find("unselect/RedHitAnim", item).active = false;

        this.pageView.scrollToPage(index);
        this._indicatorList.forEach((node,idx)=>{
            cc.find("dot1", node).active = idx == index;
        })

        let content = cc.find("view/content", this.scrollView.node);
        if(content.width > this.scrollView.node.width){
            this.scrollView.scrollToOffset(cc.v2(this._indicatorList[index].x,0))
        }
    },

    pageTurning() {
        let curPageIdx = this.pageView.getCurrentPageIndex();
        this.listView.scrollTo(curPageIdx, 0, 0.4);
        this.listView.selectedId = curPageIdx;
    },

    dotClick(index){
        this.listView.scrollTo(index, 0, 0.4);
        this.listView.selectedId = index;
        this.pageView.scrollToPage(index);
    },

    goBtnClick() {
        let curPageIdx = this.pageView.getCurrentPageIndex();
        let jumpType = this.localData[curPageIdx].jumpto;

        if (jumpType) {
            let path = "";
            if (jumpType.indexOf('http') > -1) {
                cc.vv.PlatformApiMgr.openURL(jumpType)
                cc.vv.PopupManager.removePopup(this.node);
            } else if (jumpType == "Bank") {
                cc.vv.GameManager.jumpTo(5);
            } else if (jumpType == "Salon") {
                cc.vv.GameManager.jumpTo(2);
            } else if (jumpType == "Game") {
                cc.vv.GameManager.jumpTo(1);
            } else if (jumpType == "ReferEarn") {
                cc.vv.GameManager.jumpTo(3);
            } else if (jumpType == "Social") {
                cc.vv.GameManager.jumpTo(6);
            } else if (jumpType == "vip") {
                path = "YD_Pro/prefab/yd_vip";
            } else if (jumpType == "customerservice") {    // 客服中心
                path = "YD_Pro/prefab/yd_service";
            } else if (jumpType == "inbox") {
                path = "BalootClient/Hall/PopupMailView";
            } else if (jumpType == "lbdaily") {    // Leaderboard，Cash Game Daily
                cc.vv.GameManager.jumpTo(12.1);
            } else if (jumpType == "lbweek") {    // Leaderboard，Cash Game Weekly
                cc.vv.GameManager.jumpTo(12.2);
            } else if (jumpType == "lbmonth") {    // Leaderboard，Cash Game Monthly
                cc.vv.GameManager.jumpTo(12.3);
            } else if (jumpType == "lbref") {    // Leaderboard，Cash Game Referrals
                cc.vv.GameManager.jumpTo(12.4);
            } else if (jumpType == "cashback") {    // Betting Cash back 返水
                cc.vv.GameManager.jumpTo(11.1)
            } else if (jumpType == "task") {    // 任务中心
                cc.vv.GameManager.jumpTo(11.2)
            } 
            else if(jumpType == "promo"){ // bonus-promo
                cc.vv.GameManager.jumpTo(11.4)
            }
            else if(jumpType == "bonuslogin"){ // bonus-login
                cc.vv.GameManager.jumpTo(11.3)
            }
            else if (jumpType == "record") {    // 交易记录中心
                path = "YD_Pro/prefab/yd_historical_record";
            } 
            else if (jumpType == "transactions") {    // My Transactions （H5的入款，出款界面）
                cc.vv.PopupManager.showTopWin("YD_Pro/prefab/yd_charge", {
                    onShow: (node) => {
                        node.getComponent("yd_charge").setURL(cc.vv.UserManager.transactionUrl);
                    }
                })
            } else if(jumpType == "slotlist"){ //slot列表
                cc.vv.GameManager.jumpTo(4)
            }
            

            if (path) {
                cc.vv.PopupManager.addPopup(path);
                cc.vv.PopupManager.removePopup(this.node);
            }
        }

    },

    // update (dt) {},
});
