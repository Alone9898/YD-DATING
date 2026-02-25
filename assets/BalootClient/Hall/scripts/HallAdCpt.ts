import CarouselCpt from "../../../_FWExpand/UI/CarouselCpt";
import CarouselItemCpt from "../../../_FWExpand/UI/CarouselItemCpt";
import HallAdItemCpt from "./HallAdItemCpt";
import CarouselIndicatorCpt from "../../../_FWExpand/UI/CarouselIndicatorCpt";

const { ccclass, property } = cc._decorator;

@ccclass
export default class HallAdCpt extends cc.Component {

    @property(cc.Prefab)
    adPagePrefab: cc.Prefab = null;

    protected onLoad(): void {
        let adConfig = cc.vv.UserManager.adpics;
        if(adConfig.length == 0){   // 默认添加一个下载
            adConfig.push({img:"btn_share_en", url:"download"})
        }
        this.updateView(adConfig);
    }


    updateView(adConfig) {
        for (const itemCpt of this.node.getComponentsInChildren(CarouselItemCpt)) {
            itemCpt._isOpen = false;
        }
        // 控制广告位
        for (const item of adConfig) {
            // if (item.img && item.img.indexOf('http') > -1) { //网络头像
                let adPageNode = cc.instantiate(this.adPagePrefab)
                adPageNode.parent = this.node.getComponent(CarouselCpt).node;
                adPageNode.getComponent(HallAdItemCpt).img = item.img;
                adPageNode.getComponent(HallAdItemCpt).url = item.url;
                adPageNode.getComponent(CarouselItemCpt)._isOpen = item.url;
                adPageNode.getComponent(CarouselItemCpt).ord = adConfig.indexOf(item);
            // } else {
            //     let itemNode = cc.find(item.img, this.node)
            //     if (itemNode && itemNode.getComponent(CarouselItemCpt)) {
            //         itemNode.getComponent(CarouselItemCpt)._isOpen = true;
            //         itemNode.getComponent(CarouselItemCpt).ord = adConfig.indexOf(item);
            //     }
            // }
        }
        this.node.getComponent(CarouselCpt).updateView();
    }
}