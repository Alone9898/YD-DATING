import World from "./World";

const { ccclass, property } = cc._decorator;

@ccclass
export default class System extends cc.Component {
	world: World = null;
	// 生命周期 加载系统的时候调用
	onInit() {
	}
	onUpdate(dt) {
	}
	getCpt<T extends cc.Component>(type: { prototype: T }, filterFunc?: Function): T {
		return this.world.getCpt(type, filterFunc);
	}
	getCpts<T extends cc.Component>(type: { prototype: T }, filterFunc?: Function): T[] {
		let temp: T[] = this.world.getCpts(type, filterFunc)
		return temp
	}
	getCptByKey<T extends cc.Component>(type: { prototype: T }, key) {
		return this.world.getCptByKey(type, key);
	}
	delay(time, list?) {
		return this.world.delay(time, list);
	}
}
