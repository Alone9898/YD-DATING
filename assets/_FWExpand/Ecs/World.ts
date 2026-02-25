import AudioCfgCpt from "./components/AudioCfgCpt";
import KeyCpt from "./components/KeyCpt";
import PrefabCfgCpt from "./components/PrefabCfgCpt";
import System from "./System";
import Utils from "./Utils";

const { ccclass, property } = cc._decorator;

@ccclass
export default class World extends cc.Component {
	timeScale = 1;
	systemList = [];

	onLoad() {
		this.systemList = this.node.getComponentsInChildren(System)
		// 初始化
		for (let system of this.systemList) {
			cc.log('挂载System : ', system.name)
			system.world = this
			system.onInit();
		}
		this.onInit()
	}
	start() {

	}
	// 帧刷新
	update(dt) {
		dt *= this.timeScale
		this.onUpdate(dt)
		for (const system of this.systemList) {
			system.onUpdate(dt)
		}
	}
	// 获取指定系统
	getSystem<T extends cc.Component>(systemClass: { prototype: T }): T {
		let system = this.node.getComponent(systemClass)
		if (!system) {
			system = this.node.getComponentInChildren(systemClass)
		}
		return system
	}
	// 获取一个组件
	getCpt<T extends cc.Component>(type: { prototype: T }, filterFunc?: Function): T {
		return this.getCpts(type, filterFunc)[0];
	}
	// 获取所有组件
	getCpts<T extends cc.Component>(type: { prototype: T }, filterFunc?: Function): T[] {
		let temp: T[] = cc.director.getScene().getComponentsInChildren(type)
		let tempArr: T[] = [];
		for (const _cpt of temp) {
			if (filterFunc) {
				if (filterFunc(_cpt)) {
					tempArr.push(_cpt)
				}
			} else {
				tempArr.push(_cpt)
			}
		}
		return tempArr
	}
	// 根据key 获取组件
	getCptByKey<T extends cc.Component>(type: { prototype: T }, key): T {
		return this.getCpt(type, (cpt) => {
			let keyCpt = cpt.getComponent(KeyCpt)
			if (keyCpt && keyCpt.key == key) {
				return true;
			}
			if (cpt.key && cpt.key == key) {
				return true;
			}
		})
	}
	getCptsByKey<T extends cc.Component>(type: { prototype: T }, key): T[] {
		return this.getCpts(type, (cpt) => {
			let keyCpt = cpt.getComponent(KeyCpt)
			if (keyCpt && keyCpt.key == key) {
				return true;
			}
			if (cpt.key && cpt.key == key) {
				return true;
			}
		})
	}
	// 延迟
	delay(time, list?) {
		const { promise, abort } = Utils.getPromise((resolve, reject) => {
			this.scheduleOnce(() => {
				resolve()
			}, time)
		});
		if (list) {
			list.push(abort)
		}
		return promise;
	}
	// 获取预制体
	getPrefab(prefabKey: string): cc.Prefab {
		let configCpt = this.getComponent(PrefabCfgCpt)
		if (!configCpt) {
			cc.warn("没有发现预制体配置组件")
			return
		} else {
			for (const item of configCpt.config) {
				if (item.key == prefabKey) {
					return item.prefab;
				}
			}
		}
	}
	// 获取预制体
	getAudio(key: string): cc.AudioClip {
		let configCpt = this.getComponent(AudioCfgCpt)
		if (!configCpt) {
			cc.warn("没有发现声音配置组件")
			return
		} else {
			for (const item of configCpt.config) {
				if (item.key == key) {
					return item.audio;
				}
			}
		}
	}
	onInit() {
	}
	// 帧刷新回调
	onUpdate(dt) {
	}
}