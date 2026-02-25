const { ccclass, property, menu } = cc._decorator;

@ccclass('AudioCfgItem')
export class AudioCfgItem {
    // key
    @property({ displayName: 'Key' })
    key: string = '';
    // 范围
    @property({ type: cc.AudioClip, displayName: 'MP3' })
    audio: cc.AudioClip = null;
}

@ccclass
@menu('ECS/配置/声音配置')
export default class AudioCfgCpt extends cc.Component {
    @property({
        type: [AudioCfgItem],
    })
    config: AudioCfgItem[] = [];
}
