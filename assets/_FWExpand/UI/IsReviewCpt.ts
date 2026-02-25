
const { ccclass, property, menu } = cc._decorator;

@ccclass
@menu("过审/IsReviewCpt")
export default class IsReviewCpt extends cc.Component {
    // 反转
    @property
    isReverse: boolean = false;

    onLoad() {
        // 判断是否是审核版本
        cc.log("IsReviewCpt onLoad", Global.isIOSAndroidReview());
        if (this.isReverse) {
            this.node.active = Global.isIOSAndroidReview();
        } else {
            this.node.active = !Global.isIOSAndroidReview();
        }
    }
}
