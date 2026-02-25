const { ccclass, property } = cc._decorator;

@ccclass
export default class VipUserBgCpt extends cc.Component {

    @property(cc.Sprite)
    bg: cc.Sprite = null;

    @property(cc.SpriteFrame)
    normal: cc.SpriteFrame = null;
    @property(cc.SpriteFrame)
    level_1: cc.SpriteFrame = null;
    @property(cc.SpriteFrame)
    level_2: cc.SpriteFrame = null;
    @property(cc.SpriteFrame)
    level_3: cc.SpriteFrame = null;
    @property(cc.SpriteFrame)
    level_4: cc.SpriteFrame = null;

    onLoad() {
        this.bg.spriteFrame = this.normal;
    }


    setLevel(level) {
        if (level == 1) {
            this.bg.spriteFrame = this.level_1;
        } else if (level == 2) {
            this.bg.spriteFrame = this.level_2;
        } else if (level == 3) {
            this.bg.spriteFrame = this.level_3;
        } else if (level >= 4) {
            this.bg.spriteFrame = this.level_4;
        } else {
            this.bg.spriteFrame = this.normal;
        }
    }

}
