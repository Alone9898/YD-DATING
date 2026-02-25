const { ccclass, property } = cc._decorator;

@ccclass
export default class RuleViewCpt extends cc.Component {

    @property(cc.Sprite)
    ruleSp: cc.Sprite = null;

    @property(cc.Node)
    bgNode: cc.Node = null;

    @property(cc.Node)
    loaddingNode: cc.Node = null;

    private _reqHandle = null;

    onLoad() {
        this.loaddingNode.active = true;
    }

    onInit(url, parms): void {
        if (!url) return;
        let height = parms.height || 1148;
        height = Math.min(1148, height);
        height = Math.max(600, height);
        this._reqHandle && this._reqHandle.rejectFunc();
        this.loaddingNode.active = true;
        this.bgNode.height = height;
        this._reqHandle = cc.vv.ResManager.loadImage(url, (err, res) => {
            if (cc.isValid(this.ruleSp) && cc.isValid(this.ruleSp.node)) {
                if (res) {
                    this.ruleSp.spriteFrame = new cc.SpriteFrame(res);
                }
            }
            // 请求结束后删除请求句柄
            this._reqHandle = null;
            if (this.loaddingNode && cc.isValid(this.loaddingNode)) {
                this.loaddingNode.active = false;
            }
        })
    }

    protected onDestroy(): void {
        this._reqHandle && this._reqHandle.rejectFunc();
    }

}
