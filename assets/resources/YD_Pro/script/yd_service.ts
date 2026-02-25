const { ccclass, property } = cc._decorator;

@ccclass
export default class FeedbackView extends cc.Component {

    @property(cc.Node)
    listNode: cc.Node = null;
    list:any;

    @property(cc.Button)
    feedbackBtn: cc.Button = null;

    dataList:any[];
    smedias:any[];

    @property(cc.Node)
    infoNode: cc.Node = null;

    @property(cc.SpriteFrame)
    nor_item:cc.SpriteFrame=null;
    @property(cc.SpriteFrame)
    www_item:cc.SpriteFrame=null;

    lblCfg = {
        1:{title:"WhatsApp", desc:"Tap to message us from WhatsApp"},
        2:{title:"Telegram", desc:"Tap to join our Telegram channel"},
        3:{title:"Other", desc:"Other methods"},
        4:{title:"Email", desc:"Tap to send email to support@yonogames.com"},
        5:{title:"Online customer service", desc:"Tap to connect customer service 24/7"},
        6:{title:"Telephone", desc:"Tap to call us to get help"},
        7:{title:"Complaint", desc:"Apply,commission,complain"},
        8:{title:"Call Back", desc:"Tap to order a call back from us"},
        1000:{title:"www.yonogames.com", desc:"Tap to visit our official website"},
    };

    onLoad() {
        this.list = this.listNode.getComponent('List');

        let netListener = this.node.addComponent("NetListenerCmp");
        netListener.registerMsg(MsgId.REQ_SERVICES_INFO, this.REQ_SERVICES_INFO, this);

        if(this.feedbackBtn){
            Global.btnClickEvent(this.feedbackBtn.node, function () {
                cc.vv.PopupManager.addPopup("YD_Pro/prefab/yd_feedback");
            },this)
        }

        cc.find("UserHead", this.infoNode).getComponent("HeadCmp").setHead(cc.vv.UserManager.uid, cc.vv.UserManager.userIcon);
        cc.find("UserHead", this.infoNode).getComponent("HeadCmp").setAvatarFrame(cc.vv.UserManager.avatarframe);
        Global.setLabelString("uid/label", this.infoNode, cc.vv.UserManager.uid)
        Global.btnClickEvent(cc.find("uid/btn_copy", this.infoNode), function () {
            if (CC_DEBUG) {
                cc.log("COPY: ", cc.vv.UserManager.uid)
            }
            cc.vv.FloatTip.show(___("复制成功"));
            cc.vv.PlatformApiMgr.Copy(cc.vv.UserManager.uid + "");
        }, this)
    }

    start () {
        cc.vv.NetManager.send({ c: MsgId.REQ_SERVICES_INFO });
    }

    REQ_SERVICES_INFO(msg){
        if (msg.code != 200) return;
        if (msg.spcode && msg.spcode > 0) {
            return;
        }

        this.dataList = msg.data;
        this.dataList.sort((a, b) => { return a.ord - b.ord });

        this.list.numItems = this.dataList.length;

        this.smedias = msg.medialist
        this.showMedias()
    }


    // list刷新回调
    onUpdateItem(item, idx) {
        let data = this.dataList[idx];
        let imgIdx = data.type-1
        let des =  this.lblCfg[data.type].desc
        if(data.memo){
            des = data.memo
        }
        let bg = this.nor_item
        
        let lbl1 = cc.find("lbl1",item)
        lbl1.active = true
        let titlestr = this.lblCfg[data.type].title
        let des_color = cc.color().fromHEX("#A6B0B0")
        if(data.type == 1000){
            imgIdx = 8
            bg = this.www_item
            des_color = cc.color().fromHEX("#FFFFFF")
            titlestr = data.url
        }
        item.getComponent(cc.Sprite).spriteFrame = bg
        cc.find("icon",item).getComponent("ImgSwitchCmp").setIndex(imgIdx);
        lbl1.getComponent(cc.Label).string = titlestr;
        let lbl2 = cc.find("lbl2",item)
        lbl2.getComponent(cc.Label).string = des;
        lbl2.color = des_color
        item.off("click");
        item.on("click", ()=>{
            cc.vv.EventManager.emit("EVENT_BTN_CLICK_SOUNDS");
            if(data.type == 1){ // Whatsapp
                if(data.url){
                    cc.vv.PlatformApiMgr.openURL(data.url)
                }
            }else if(data.type == 2){   // Telegram
                if(data.url){
                    cc.vv.PlatformApiMgr.openURL(data.url)
                }
            } else if(data.type == 3){  // Other
                if(data.url){
                    cc.vv.PlatformApiMgr.openURL(data.url)
                }
            } else if(data.type == 4){  // Email
                if(data.url){
                    // cc.vv.PlatformApiMgr.openURL(data.url)
                    let param = {
                        sender: data.url,
                        title: "MY UID:"+cc.vv.UserManager.uid,
                        content: "Please let us know how can we help!",
                        sendway:"sendto",
                    }
                    cc.vv.PlatformApiMgr.SendMail(JSON.stringify(param))

                }
            } else if(data.type == 5){  // Online
                if(data.url){
                    cc.vv.PlatformApiMgr.openURL(data.url)
                }
            } else if(data.type == 6){  // Telephone
                if(data.url) {
                    cc.vv.PlatformApiMgr.callPhone(data.url)
                }
            } else if(data.type == 7){  //
                if(data.url){
                    cc.vv.PlatformApiMgr.openURL(data.url)
                }
            } else if(data.type == 8){  // callback
                cc.vv.PopupManager.addPopup("YD_Pro/prefab/yd_call_back");
            } else if(data.type == 1000){ //office website
                cc.vv.PlatformApiMgr.openURL(data.url)
            }
            
        })
    }

    showMedias(){
        let node_lay = cc.find("media_list/layout",this.node)
        let midcfg = [{type:9,name:"m_fb"},{type:10,name:"m_youtobe"},{type:11,name:"m_ins"},{type:2,name:"m_telgram"}]
        for(let i =0; i <midcfg.length; i++){
            let item = midcfg[i]
            let node = cc.find(item.name,node_lay)
            let m_data = this.getMediaData(item.type)
            node.active = m_data?true:false
            node.on("click",()=>{
                cc.vv.PlatformApiMgr.openURL(m_data.url)
            })
        }
    }

    getMediaData(nVal){
        for(let i = 0;i < this.smedias.length; i++){
            if(this.smedias[i].type == nVal){
                return this.smedias[i]
            }
        }
    }

}
