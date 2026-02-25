const { ccclass, property } = cc._decorator;

@ccclass
export default class HallAdItemCpt extends cc.Component {

    @property(cc.Button)
    button: cc.Button = null;

    @property(cc.Sprite)
    icon: cc.Sprite = null;

    @property(cc.SpriteAtlas)
    atlas: cc.SpriteAtlas = null;

    url: string = "";
    _reqHandle = null;

    set img(value) {
        if (value && value.indexOf('http') > -1) { //网络头像
            this._reqHandle && this._reqHandle.rejectFunc();
            this._reqHandle = cc.vv.ResManager.loadImage(value, (err, res) => {
                if (cc.isValid(this.icon) && cc.isValid(this.icon.node)) {
                    if (res) {
                        this.icon.spriteFrame = new cc.SpriteFrame(res);
                    }
                }
                // 请求结束后删除请求句柄
                this._reqHandle = null;
            })
        }
        else {
            let sprF = this.atlas.getSpriteFrame(value);
            if(sprF){
                this.icon.spriteFrame = sprF;
            } else {
                console.log("ad not image");
            }
        }
    }

    onLoad() {
        this.button.node.on("click", () => {
            if (!!this.url) {
                let path = "";
                if(this.url == "download"){
                    path = "BalootClient/InviteCode/InviteCode";
                } else if(this.url == "inbox"){
                    path = "BalootClient/Hall/PopupMailView";
                } else if(this.url == "contact"){
                    path = "YD_Pro/prefab/yd_service";
                } else if(this.url == "referearn"){
                    // path = "YD_Pro/Refer/ReferEarn";
                    cc.vv.GameManager.jumpTo(3);
                } else if(this.url == "leaderboard"){
                    cc.vv.PopupManager.addPopup("YD_Pro/rank/yd_rank", {
                        onShow: (node) => {
                            node.getComponent("yd_rank").initPage(1);
                        }
                    })
                } else if(this.url == "vip"){
                    path = "YD_Pro/prefab/yd_vip";
                } else if(this.url == "bonus"){ //bonus-login
                    cc.vv.GameManager.jumpTo(11.3)
                } else if(this.url == "match"){
                    // cc.vv.GameManager.jumpTo(3);
                } else if(this.url == "salon"){
                    cc.vv.GameManager.jumpTo(2);
                }else if(this.url == "promo"){ //bonus-promo
                    cc.vv.GameManager.jumpTo(11.4);
                }else if(this.url == "cashback"){ //bonus-cashback
                    cc.vv.GameManager.jumpTo(11.1);
                }else if(this.url == "task"){ //bonus-task
                    cc.vv.GameManager.jumpTo(11.2);
                }

                if(path){
                    cc.vv.PopupManager.addPopup(path)
                }
            }
        });
    }

    start() {

    }

    // update (dt) {}
}
