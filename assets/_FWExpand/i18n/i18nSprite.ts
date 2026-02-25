import { i18nLangEnum } from "./i18nConst";
import { i18nManager } from "./i18nManager";
const { ccclass, property, executeInEditMode, disallowMultiple, requireComponent, menu } = cc._decorator;

// 精灵纹理类型
enum SpriteType {
    Texture = 0,
    Atlas,
}

@ccclass("i18nSpriteFrameSet")
export class i18nSpriteFrameSet {
    @property({ type: cc.Enum(i18nLangEnum), displayName: "语言" })
    language: i18nLangEnum = i18nLangEnum.AR;
    @property(cc.SpriteFrame)
    spriteFrame: cc.SpriteFrame = null;
}

@ccclass
@executeInEditMode
@requireComponent(cc.Sprite)
@disallowMultiple
@menu("多语言/i18nSprite")
export class i18nSprite extends cc.Component {

    @property({ type: cc.Enum(SpriteType) })
    spriteType: SpriteType = SpriteType.Texture;

    @property({ type: i18nSpriteFrameSet, visible() { return this.spriteType == SpriteType.Texture; } })
    spriteFrameSets: i18nSpriteFrameSet[] = [];

    @property({ type: cc.SpriteAtlas, visible() { return this.spriteType == SpriteType.Atlas; } })
    atlas: cc.SpriteAtlas = null;

    @property
    private _frameName: string = "";
    @property({ type: cc.String, visible() { return this.spriteType == SpriteType.Atlas; } })
    get frameName() {
        return this._frameName || "";
    }
    set frameName(value: string) {
        this._frameName = value;
        this._updateSpriteFrame();
    }

    onLoad() {
        i18nManager.register(this);
        this.updateView();
    }

    private _updateSpriteFrame() {
        let sprite = this.getComponent(cc.Sprite);
        if (!cc.isValid(sprite))
            return;

        let target;
        switch (this.spriteType) {
            case SpriteType.Texture:
                target = this.spriteFrameSets;
                i18nManager.getSprite(target, this.frameName, (spriteFrame) => {
                    if (cc.isValid(sprite) && spriteFrame) sprite.spriteFrame = spriteFrame;
                });
                break;
            default:
                if (!this.atlas || this.frameName.length === 0) return;
                i18nManager.getSprite(this.atlas, this.frameName, (spriteFrame) => {
                    if (cc.isValid(sprite) && spriteFrame) sprite.spriteFrame = spriteFrame;
                });
                break;
        }
    }

    updateView() {
        this.frameName = this._frameName;
    }

    onDestroy() {
        i18nManager.unregister(this);
    }
}
