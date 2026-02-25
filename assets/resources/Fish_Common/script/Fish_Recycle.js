//鱼节点回收
cc.Class({
    extends: cc.Component,

    onLoad () {},

    recycle () {
        let recycleFishes = [];
        let children = this.node.children;
        for (let i=0, l=children.length; i<l; i++) {
            let fish = children[i].getComponent("Fish_Fish");
            if (fish) {
                recycleFishes.push(fish);
            }
        }

        for (let i=0, l=recycleFishes.length; i<l; i++) {
            recycleFishes[i].onDead();
        }

        this.node.destroy();
    },

});
