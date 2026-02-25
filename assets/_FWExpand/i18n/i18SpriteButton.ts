import { i18nManager } from "./i18nManager";
import { i18nSpriteFrameSet } from "./i18nSprite";

const { ccclass, property, requireComponent, menu, disallowMultiple } = cc._decorator;

/**
 * 当按钮transition类型为cc.Button.Transition.SPRITE 且需要多语言时用到
 */
@ccclass
@requireComponent(cc.Button)
@disallowMultiple
@menu("多语言/i18SpriteButton")
export class i18SpriteButton extends cc.Component {
    @property([i18nSpriteFrameSet])
    normalSpriteFrameSets: i18nSpriteFrameSet[] = [];
    @property([i18nSpriteFrameSet])
    pressedSpriteFrameSets: i18nSpriteFrameSet[] = [];
    @property([i18nSpriteFrameSet])
    hoverSpriteFrameSets: i18nSpriteFrameSet[] = [];
    @property([i18nSpriteFrameSet])
    disabledSpriteFrameSets: i18nSpriteFrameSet[] = [];
    button: cc.Button = null;
    onLoad() {
        i18nManager.register(this);
        this.button = this.node.getComponent(cc.Button);
        this.updateView();
    }

    onDestroy() {
        i18nManager.unregister(this);
        this.normalSpriteFrameSets = null;
        this.pressedSpriteFrameSets = null;
        this.hoverSpriteFrameSets = null;
        this.disabledSpriteFrameSets = null;
        this.button = null;
    }

    protected onEnable(): void {
        this.updateView();
    }

    updateView() {
        if(!this.button || this.button.transition != cc.Button.Transition.SPRITE) {
            return;
        }
        this.normalSpriteFrameSets && i18nManager.getSprite(this.normalSpriteFrameSets, "", (spriteFrame) => {
            if(cc.isValid(this.button.normalSprite) && spriteFrame) {
                this.button.normalSprite = spriteFrame;
            }
        });
        this.pressedSpriteFrameSets && i18nManager.getSprite(this.pressedSpriteFrameSets, "", (spriteFrame) => {
            if(cc.isValid(this.button.normalSprite) && spriteFrame) {
                this.button.pressedSprite = spriteFrame;
            }
        });
        this.hoverSpriteFrameSets && i18nManager.getSprite(this.hoverSpriteFrameSets, "", (spriteFrame) => {
            if(cc.isValid(this.button.normalSprite) && spriteFrame) {
                this.button.hoverSprite = spriteFrame;
            }
        });
        this.disabledSpriteFrameSets && i18nManager.getSprite(this.disabledSpriteFrameSets, "", (spriteFrame) => {
            if(cc.isValid(this.button.normalSprite) && spriteFrame) {
                this.button.disabledSprite = spriteFrame;
            }
        });
    }
}