const { ccclass, property } = cc._decorator;

@ccclass
export default class ProgressBarTarget extends cc.Component {
    // LIFE-CYCLE CALLBACKS:

    @property(cc.ProgressBar)
    progressBar: cc.ProgressBar = null;

    update(dt) {
        this.node.position = this.progressBar.barSprite.node.position.add(cc.v3(this.progressBar.progress * this.progressBar.totalLength, 0, 0));
    }
}
