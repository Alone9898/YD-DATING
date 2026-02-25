const { ccclass, property } = cc._decorator;

@ccclass
export default class EmojiLockCpt extends cc.Component {
    @property
    key: string = '';
}
