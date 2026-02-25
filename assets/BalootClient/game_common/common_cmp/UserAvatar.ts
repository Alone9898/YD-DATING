import NetImg, { NetImgType } from "./NetImg";

const { ccclass, property } = cc._decorator;

interface IUserAvatarData {
    uid: number, //玩家id
    icon: string,    // 头像地址
    avatarFrame?: string   // 头像框动画
}
@ccclass
export default class UserAvatar extends cc.Component {
    @property({ type: NetImg, displayName: "头像" })
    icon: NetImg = null;

    @property({ type: sp.Skeleton, displayName: "头像框" })
    spineFrame: sp.Skeleton = null;

    _data: IUserAvatarData = { uid: 0, icon: "head_0", avatarFrame: "avatarframe_0" };

    _retrycnt:0;

    onLoad() {
        this.updataAvatar(this._data);
    }

    /**
     * 隐藏头像和头像框
     */
    hideAvatar(bHide){
        if (this.icon) {
            this.icon.node.active = !bHide;
        }
        if (this.spineFrame){
            this.spineFrame.node.active = !bHide;
        }
    }

    /**
     * 更新头像和头像框
     */
    updataAvatar(data: IUserAvatarData) {
        this.updateIcon(data.uid, data.icon);
        this.updateFrame(data.avatarFrame);
    }

    /**
     * 更新头像
     */
    updateIcon(uid: number, icon: string) {
        if (!icon) {
            return;
        }
        this._data.uid = uid;
        this._data.icon = icon + "";
        if (!this.icon) {
            return;
        }
        if (this._data.icon.startsWith("http")) {
            if (uid && uid > 0) {
                let node = this.icon.node;
                let NetHeadImg = node.getComponent("NetHeadImg");
                if (!NetHeadImg) {
                    NetHeadImg = node.addComponent("NetHeadImg");
                }
                this.showLoading(true);
                NetHeadImg.load(uid, icon, (res) => {
                    this.showLoading(false);
                    if(!res){//失败
                        this.retry()
                    }
                    
                });

                this.icon.setUrlValue(icon);  //修改url值，防止由http头像切换成atlas头像时不更新
            } else {
                this.showLoading(true);
                this.icon.imgType = NetImgType.net;
                this.icon.loadUrl(this._data.icon, () => {
                    this.showLoading(false);
                })
            }
        } else {
            this.icon.imgType = NetImgType.atlas;
            this.icon.url = `head_${this._data.icon}`;
        }
    }

    /**
     * 更新头像框
     */
    updateFrame(frame: string) {
        frame = frame || "avatarframe_1000";
        frame = frame == "avatarframe_0" ? "avatarframe_1000" : frame;
        frame = frame.indexOf("avatarframe_") >= 0 ? frame : "avatarframe_1000";
        this._data.avatarFrame = frame;
        if (!this.spineFrame) return;
        if (!!cc.vv && !!cc.vv.UserConfig) {
            cc.vv.UserConfig.setAvatarFrame(this.spineFrame, this._data.avatarFrame);
        }
    }

    showLoading(visiable: boolean) {
        if(cc.isValid(this.node)){
            let mask = this.node.getChildByName("mask")
            if (mask) {
                mask.active = visiable;
                let loadingNode = mask.getChildByName("loading");
                if (loadingNode) {
                    if (visiable) {
                        loadingNode.runAction(cc.sequence(cc.repeat(cc.rotateBy(3, -360), 2), cc.callFunc(() => {
                            if (cc.isValid(mask)) mask.active = false;
                        })));
                    } else {
                        loadingNode.stopAllActions();
                    }
                }
            }
        }
        
    }

    retry(){
        this._retrycnt = this._retrycnt || 0
        this._retrycnt += 1
        if(this._retrycnt<=3){ //间隔3s重试一次，总共重试3次
            cc.tween(this.node)
            .delay(3)
            .call(()=>{
                if(cc.isValid(this._data)){
                    this.updateIcon(this._data.uid,this._data.icon)
                }
                
            })
            .start()
        }
        
    }
}

