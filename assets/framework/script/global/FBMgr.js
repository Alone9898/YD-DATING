/*
** FB相关接口管理
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

            //发送分享成功的消息给服务端
            // cc.vv.NetManager.registerMsg(MsgId.DO_SHARE_ACTION, this.onRcvMsgShareSuccess.bind(this));

        },

        // onRcvMsgShareSuccess: function(msg){
        //     var self = this
        //     if(msg.code == 200){
        //         Global.deleteLocal('doShareAction')
        //     }
        // },

        doSendShareAction:function(){
            var self = this
            var data = Global.getLocal('doShareAction')
            if(data){
                // var req = {c:MsgId.DO_SHARE_ACTION}
                // cc.vv.NetManager.send(req)
            }
        },

        //FB分享_图片
        fbShareImg:function(imgPath,pCall){
            var self = this;
            self._shareEndCall = pCall;

            var data = {};
            data.shareType = 2;
            data.imagePath = imgPath;
            cc.vv.PlatformApiMgr.fbShare(JSON.stringify(data),self.shareResultCall.bind(this));
        },

        //FB分享_web
        fbShareWeb:function(urlLink,imgUrl,content,pCall){
            var self = this;
            self._shareEndCall = pCall;

            var shareData = {};
            shareData.shareType = 1; //链接分享
            shareData.linkUrl = urlLink;
            if(imgUrl){
                shareData.imgUrl = imgUrl;
            }
            if(content){
                shareData.content = content;
            }

            cc.vv.PlatformApiMgr.fbShare(JSON.stringify(shareData),self.shareResultCall.bind(this));
        },
        //FB分享_web
        fbShareWebEx:function(imgUrl, content, pCall) {
            let urlLink = 'https://global.rummyslot.com/fb/?code='+Global.playerData.uid;
            this.fbShareWeb(urlLink, imgUrl, content, pCall)
        },

        //分享成功回调
        shareResultCall:function(data){
            var self = this
            //data.result = 1 成功 -1 取消 ...
            let strResult = data.result + ""
            if(strResult == "1"){
                cc.vv.FloatTip.show('Sharing success！')

                //保存起来
                Global.saveLocal('doShareAction',1)

                // self.doSendShareAction()
            }
            else if(strResult == "-1"){
                //cc.vv.FloatTip.show('分享取消！')
            }
            else if(strResult == "-2"){
                // cc.vv.FloatTip.show('分享失败！')
            }
            else if (strResult == "-3"){
                // cc.vv.FloatTip.show('分享初始化失败！')
            }
            else if(strResult == "-10"){
                //未安装Messager
                // cc.vv.FloatTip.show(cc.vv.Language.float_tip_Messenger_installed_started);
                // cc.vv.FloatTip.show('Messenger is not installed or started')
            }
            else if(strResult == "-11"){
                //未安装whatsapp
                // cc.vv.FloatTip.show(cc.vv.Language.float_tip_Whatsapp_not_installed);
                // cc.vv.FloatTip.show('Whatsapp is not installed')
            }
            if(self._shareEndCall){
                self._shareEndCall(data)
            }
        },


        FBFriendsInApp:function(){
            cc.vv.PlatformApiMgr.FBFriendsInApp(this.FbFriendsCallback.bind(this))
        },

        FbFriendsCallback:function(data){
            cc.log("好友数据："+data)
        },

        /**
         * 
         * @param {*} title 
         * @param {*} subtitle 
         * @param {*} btntitle 
         * @param {*} linkUrl 
         * @param {*} imgUrl 
         * @param {*} shareCall 
         */
        MessagerShare:function(title,subtitle,btntitle,linkUrl,imgUrl,shareCall){
            let data ={}
            data.title = title
            data.subtitle = subtitle
            // let params = "?rooid="+roomid
            // if(gameid){
            //     params += ("&gameid="+gameid)
            // }
            // if(pwd){
            //     params += ("&pwd="+pwd)
            // }

            data.linkUrl = linkUrl//"https://inter.sekiengame.com/fb/share/" + params
            data.imgUrl =  imgUrl //"https://inter.sekiengame.com/icon.png"
            data.btnTitle = btntitle
            data.fbPageId = "Your page ID"//"108990531577619"
            data.shareWhere = 2
            this._shareEndCall = shareCall

            cc.vv.PlatformApiMgr.fbShare(JSON.stringify(data),this.shareResultCall.bind(this));
        },

        /**
         * whatsapp 分享只是分享一个字符串，包含链接的话。会自动解析
         * @param {*} msgStr 
         * @param {*} shareCall 
         */
        WhatsappShare:function(msgStr,shareCall){
            let data = {}
            data.shareWhere = 3
            data.msgStr = msgStr
            this._shareEndCall = shareCall
            cc.vv.PlatformApiMgr.fbShare(JSON.stringify(data),this.shareResultCall.bind(this));
        },

        /**
         * 
         * @param {*} shareWhere 1 fb 2 messger 3 whatsapp 4 系统分享
         * @param {*} title 分享标题
         * @param {*} subtitle 分享内容
         * @param {*} roomid 房间号
         * @param {*} gameid 游戏ID，可空
         * @param {*} pwd 密码，可空
         * @param {*} shareCall 分享回调 可空
         */
        deskInvite:function(sharelink, imgUrl,shareWhere,title,subtitle,roomid,gameid=null,pwd=null,shareCall=null){
           
            let params = "?roomid="+(roomid || 0)
            // 参数构造，whatsapp 会把&参数给截掉，也不知道什么原因。先修改参数构造方式
            // roomid = "房间号-游戏id-密码"

            if(!gameid){ //没传就补0
                gameid = "0"
            }
            params += ("-"+gameid)

            if(!pwd){ //没传就补0
                pwd = "0"
            }
            params += ("-"+pwd)
            
            let linkUrl = sharelink + params
            // let imgUrl = "https://inter.sekiengame.com/icon.png"
            if(shareWhere == 1){
                this.fbShareWeb(linkUrl,imgUrl,subtitle,shareCall)
            }
            else if(shareWhere == 2){
                this.MessagerShare(title,subtitle,"Play Game",linkUrl,imgUrl,shareCall)
            }
            else if(shareWhere == 3){
                let shareStr = cc.js.formatStr("%s #%s# %s",subtitle,title,linkUrl)
                this.WhatsappShare(shareStr,shareCall)
            }
            else if(shareWhere == 4){
                let data = {}
                data.title = title
                data.content = linkUrl
                data.imgUrl = imgUrl
                cc.vv.PlatformApiMgr.systemShare(JSON.stringify(data))
            }
        }

    },

   
});
