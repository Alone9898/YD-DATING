import { facade } from "../../scripts/PBLogic";

const {ccclass, property} = cc._decorator;

@ccclass
export default class PBClickEffect extends cc.Component {

    @property(cc.Prefab)
    effect_prefab:cc.Prefab = null;

    protected onLoad(): void {
        this.node.on(cc.Node.EventType.TOUCH_START, (evt:cc.Event.EventTouch)=>{
            let node = cc.find("Canvas");
            let prefabNode = cc.instantiate(this.effect_prefab);
            prefabNode.parent = node;
            prefabNode.setPosition(node.convertToNodeSpaceAR(evt.getLocation()));
            facade.soundMgr.playBaseEffect("click_effect");
            cc.tween(prefabNode)
                .delay(0.5)
                .call(()=>{
                    prefabNode.destroy();
                })
                .start();
        }, this);
    }
}
