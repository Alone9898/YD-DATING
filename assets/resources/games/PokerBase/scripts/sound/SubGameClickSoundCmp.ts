const { ccclass, property, menu,disallowMultiple } = cc._decorator;


enum SubGameClickResType {
    EVENT = 1,      // 发事件播放
    AUDIO_CLIP = 2, // 直接播放声音
}

export enum SubGameClickSoundType {
    COMMON = 1,     // 通用
    SUBGAME = 2,    // 子游戏
}

export enum SubGameClickSoundName {
    CLICK = 1,  // 点击
}

@ccclass
@disallowMultiple
@menu("通用/子游戏音效")
export class SubGameClickSoundCmp extends cc.Component {
    @property({type:cc.Enum(SubGameClickResType)})
    soundResType = SubGameClickResType.EVENT; // 声音资源类型

    @property({
        type:cc.Enum(SubGameClickSoundType),
        visible(){ return this.soundType == SubGameClickResType.EVENT}
    })
    soundType = SubGameClickSoundType.COMMON; // 音效类型

    @property({
        type:cc.Enum(SubGameClickSoundName),
        visible(){ return this.soundType == SubGameClickResType.EVENT}
    })
    soundName = SubGameClickSoundName.CLICK; // 声音名字

    @property({
        type:cc.AudioClip,
        visible(){ return this.soundType == SubGameClickResType.AUDIO_CLIP}
    })
    audioClip:cc.AudioClip = null;

    protected onLoad(): void {
        let btn = this.node.getComponent(cc.Button);
        if(btn) {
            btn.node.on("click", ()=>{
                this.processClick();
            }, this);
        }else {
            this.node.on(cc.Node.EventType.TOUCH_END, ()=>{
                this.processClick();
            }, this);
        }
    }

    processClick() {
        if(this.soundResType == SubGameClickResType.AUDIO_CLIP) {
            this.audioClip && cc.audioEngine.playEffect(this.audioClip, false);
        } else {
            let msg = {
                soundType:this.soundType,
                soundName:this.soundName
            }
            Global.dispatchEvent("SubgameClickSoundEvt", msg);
        }
    }
}