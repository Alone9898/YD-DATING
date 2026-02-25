import CarouselCpt from "./CarouselCpt";

const { ccclass, property } = cc._decorator;

@ccclass
export default class CarouselIndicatorCpt extends cc.Component {
    @property(cc.Node)
    item:cc.Node = null;
    itemList:cc.Node[] = [];

    onLoad () {
    }

    initPage(cnt){
        for (let i = 0; i < cnt; i++){
            if(this.itemList[i]){

            } else {
                let node = cc.instantiate(this.item);
                node.parent = this.node;
                node.active = true;
                this.itemList.push(node);
            }
        }
    }

    showPage(pageIdx){
        this.node.active = this.itemList.length >= 2;

        this.itemList.forEach((node,idx)=>{
            cc.find("select", node).active = idx == pageIdx;
        })
    }


}
