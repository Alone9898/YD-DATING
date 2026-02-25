import RewardListCpt from "../UI/RewardListCpt";

const { ccclass, property } = cc._decorator;

@ccclass
export default class BroadcastCpt extends cc.Component {

    @property(cc.Node)
    contentNode: cc.Node = null;
    @property(cc.Label)
    contentLabel: any = null;
    @property(cc.RichText)
    contentLabelRich: cc.RichText = null;
    @property(cc.Layout)
    layout: cc.Layout = null;
    @property(RewardListCpt)
    rewardListCpt: RewardListCpt = null;
    @property(cc.SpriteFrame)
    bgFrames: cc.SpriteFrame[] = [];
    @property(cc.SpriteFrame)
    iconFrames: cc.SpriteFrame[] = [];
    @property(cc.Button)
    btnGo: cc.Button = null;
    @property
    speed: number = 300;
    @property
    delay: number = 0.5;

    closeFunc: Function;
    contentLabelShow: any = null;
    private _uid: any = null;

    protected onLoad(): void {
        this.contentLabelShow = this.contentLabel || this.contentLabelRich;
        this.layout.node.active = false;
        this.contentLabelShow.node.opacity = 1;
        //注册事件
        if (this.btnGo) {
            this.btnGo.node.on("click", () => {
                cc.vv.PopupManager.addPopup("BalootClient/UserInfo/PopupPersonalInfo", {
                    opacityIn: true,
                    multiple: true,
                    onShow: (node) => {
                        let cpt = node.getComponent("PersonalInfo");
                        if (cpt) {
                            cpt.init(this._uid);
                        }
                    }
                })
            });
        }
    }
    //初始化ui
    initUI(data) {
        let rtype = data.type;
        if (data.extra_info == null || data.extra_info == undefined) return;
        //判断类型枚举
        let broadEnum = cc.Enum({
            SLIVER: 4,//银喇叭
            GOLD: 5,//金喇叭
        });
        let userInfo = data.extra_info;
        this._uid = userInfo.uid;
        let bg = cc.find("bg", this.node);
        let icon = cc.find("icon", this.node);
        let headNode = cc.find("node_head", this.node);
        bg.getComponent(cc.Sprite).spriteFrame = this.bgFrames[rtype - broadEnum.SLIVER];
        icon.getComponent(cc.Sprite).spriteFrame = this.iconFrames[rtype - broadEnum.SLIVER];
        // 设置头像
        let headCmp = headNode.getComponent("HeadCmp");
        headCmp.setHead(userInfo.uid, userInfo.usericon);
        let _avatarframe = userInfo.avatarframe.toString();
        _avatarframe = _avatarframe.indexOf("avatarframe_") >= 0 ? _avatarframe : "avatarframe_0";
        headCmp.setAvatarFrame(_avatarframe);
    }
    // direction 1: 右进左出 2:左进右出
    run(params: any) {
        let count = params.count || 1;
        this.layout.node.active = false;
        this.closeFunc = params.closeFunc;
        this.contentLabelShow.string = params.content;
        if (!!params.rewards) {
            let nodeMap = this.rewardListCpt.updateView(params.rewards);
            if (nodeMap[1]) nodeMap[1].icon.scale = 0.4;
            if (nodeMap[25]) nodeMap[25].icon.scale = 0.4;
            if (nodeMap[53]) nodeMap[53].icon.scale = 0.3;
            if (nodeMap[54]) nodeMap[54].icon.scale = 0.5;
        } else {
            this.rewardListCpt.closeAll();
        }
        // 执行播放, 动作结束移除自己
        this.scheduleOnce(() => {
            this.layout.node.active = true;
            this.layout.updateLayout();
            this.contentLabelShow.node.opacity = 255;
            // 右进左出(英文版)
            let startX = 0;
            if (params.direction == 1) {
                // 设置起始位置,和结束位置
                startX = this.contentNode.width / 2 + this.layout.node.width / 2;
            } else {
                startX = -(this.contentNode.width / 2 + this.layout.node.width / 2);
            }
            let endx = -startX;
            this.layout.node.x = startX;
            // 计算执行时间 (距离除以速度)
            let animTime = (this.contentNode.width + this.layout.node.width) / this.speed;
            if (count > 1) animTime *= 2;//如果次数是多次，速度放慢一倍
            //播放几次的喇叭
            let tw1 = cc.tween(this.layout.node)
                .call(() => { this.layout.node.x = startX; })
                .to(animTime, { x: endx })
                .start()
            cc.tween(this.layout.node)
                .repeat(count, tw1)
                .delay(this.delay)
                .call(() => {
                    this.node.destroy();
                })
                .start()
        });
    }
    protected onDestroy(): void {
        this.closeFunc && this.closeFunc();
    }

}
