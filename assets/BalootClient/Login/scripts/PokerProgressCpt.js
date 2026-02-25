cc.Class({
    extends: cc.Component,

    properties: {
        progressBar: cc.ProgressBar,
    },

    onLoad() {
        this.reset();
    },
    reset() {
        // this.progress = 0;
        // for (let i = 0; i < this.node.children.length; i++) {
        //     const itemNode = this.node.children[i];
        //     itemNode.getComponent(sp.Skeleton).setAnimation(0, "animation", true);
        // }
    },
    update(dt) {
        // // 根据进度条的进度 进行设置自己的变化
        // this.progress = Math.max(this.progressBar.progress, this.progress);
        // // 进行更新
        // for (let i = 0; i < this.node.children.length; i++) {
        //     if ((i + 1) / 10 <= this.progress) {
        //         const itemNode = this.node.children[i];
        //         let skeAnim = itemNode.getComponent(sp.Skeleton)
        //         // if (skeAnim.animation == "animation") {
        //         //     skeAnim.setAnimation(0, "animation2", false);
        //         // }
        //         skeAnim.setAnimation(0, "animation3", false);
        //     }
        // }
    },
});
