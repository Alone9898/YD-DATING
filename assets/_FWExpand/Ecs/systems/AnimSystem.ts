import System from "../System";

const { ccclass, property, menu } = cc._decorator;

@ccclass
@menu('ECS/系统/动画系统')
export default class AnimSystem extends System {
    async playSkePrefab(args: any) {
        args = args || {}
        return new Promise<void>((resolve, reject) => {
            let prefab: cc.Prefab = args.prefab;
            let parent: cc.Node = args.parent;
            let position = args.position;
            let nextLoopAnimName = args.nextLoopAnimName;
            let scale = args.scale;
            let animName = args.animName;
            let zIndex = args.zIndex;
            let timeScale = args.timeScale;
            let preCallback = args.preCallback;
            let startCallback = args.startCallback;
            let endCallback = args.endCallback || args.callback;
            if (!parent) {
                resolve();
                return;
            }
            let skeNode = cc.instantiate(prefab)
            skeNode.parent = parent;
            skeNode.zIndex = zIndex || 1000;
            if (position) {
                skeNode.position = position;
            }
            if (scale) {
                if (Array.isArray(scale)) {
                    skeNode.scaleX = scale[0];
                    skeNode.scaleY = scale[1];
                } else {
                    skeNode.scale = scale;
                }
            }
            let ske = skeNode.getComponent(sp.Skeleton);
            if (timeScale) {
                ske.timeScale = timeScale;
            }
            ske = ske || skeNode.getComponentInChildren(sp.Skeleton);
            ske.setCompleteListener((trackEntry: sp.spine.TrackEntry) => {
                endCallback && endCallback(skeNode);
                if (nextLoopAnimName) {
                    ske.setAnimation(0, nextLoopAnimName, true);
                } else {
                    skeNode.destroy();
                    resolve();
                }
            });
            if (animName) {
                preCallback && preCallback(skeNode);
                let entry = ske.setAnimation(0, animName, false);
                startCallback && startCallback(skeNode, ske, entry);
            }
        });
    }

    async playSkePrefabs(argsList: any[]) {
        for (let i = 0; i < argsList.length; i++) {
            let args = argsList[i];
            if (i >= argsList.length - 1) {
                await this.playSkePrefab(args);
            } else {
                this.playSkePrefab(args);
            }
        }
    }
}
