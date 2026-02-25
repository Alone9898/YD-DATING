const { ccclass, property } = cc._decorator;

@ccclass
export class PBEmotionPlayer extends cc.Component {
    @property(sp.Skeleton)
    spine: sp.Skeleton = null;
    onLoad() {
        this.spine.node.active = false;
    }

    playAni(aniName: string) {
        if (!aniName) {
            return;
        }
        this.node.active = true;
        let arr = aniName.split("_");
        if (arr.length != 3) {
            return;
        }
        let emojiType = arr[1];
        let url = "";
        let action = "";
        let scale = 1;
        url = `BalootClient/BaseRes/spines/emoji_${emojiType}/${aniName}`;
        action = "animation";
        scale = 0.5;
        this.spine.node.active = true;
        cc.loader.loadRes(url, sp.SkeletonData, (err, res) => {
            if (!err && this.spine && cc.isValid(this.spine.node)) {
                this.spine.skeletonData = res;
                this.spine.setCompleteListener(() => {
                    this.spine.setCompleteListener(null);
                    this.spine.node.active = false;
                })
                this.spine.setAnimation(0, action, false);
                this.spine.node.scale = scale;
            } else {
                console.log(err);
            }
        });
    }
}