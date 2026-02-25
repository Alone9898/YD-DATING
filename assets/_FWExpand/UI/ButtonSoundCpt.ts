const { ccclass, property, requireComponent } = cc._decorator;

@ccclass
@requireComponent(cc.Button)
export default class ButtonSoundCpt extends cc.Component {
    @property({ type: cc.AudioClip })
    soundClip: cc.AudioClip = null;

    onLoad() {
        let button = this.node.getComponent(cc.Button)
        if (button) {
            this.node.on('click', () => {
                cc.audioEngine.playEffect(this.soundClip, false);
            }, this);
        }
    }
}
