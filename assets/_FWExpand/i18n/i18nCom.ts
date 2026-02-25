import { i18nLangEnum } from "./i18nConst";
import { i18nManager } from "./i18nManager";

const { ccclass, property, menu } = cc._decorator;
@ccclass
@menu("多语言/i18nCom")
export default class i18nCom extends cc.Component {
    @property({ visible: false })
    private _currLanguage: i18nLangEnum = i18nLangEnum.AR;
    // @property({ type: cc.Enum(i18nLangEnum), displayName: "默认语言" })
    // get language() {
    //     return this._currLanguage;
    // }
    set language(value: i18nLangEnum) {
        this._currLanguage = value;
        i18nManager.setLanguage(this._currLanguage);
        // 自动挂载资源, 进入游戏时预加载,为了防止进游戏后可以看到中文
        // let config = i18nManager.getLanguageConfig(this._currLanguage)
        // let url = 'i18n/%s'.replace(/%s/g, config.lang);
        // cc.loader.loadRes(url, cc.JsonAsset, (err, asset: cc.JsonAsset) => {
        //     if (!err) {
        //         this.jsonAsset = asset;
        //     } else {
        //         cc.warn("err =", err);
        //     }
        // });
    }
    @property({ type: cc.JsonAsset, displayName: "预加载Json" })
    jsonAsset_ar: cc.JsonAsset = null;
    @property({ type: cc.JsonAsset, displayName: "预加载Json" })
    jsonAsset_en: cc.JsonAsset = null;
    onLoad() {
        // 获取当前语言设置,如果没有设置,则使用默认配置
        let currlang = i18nManager.getLanguage();
        if (currlang) {
            this.language = currlang;
        } else {
            let enList = ['en', 'en-au', 'en-bz', 'en-ca', 'en-gb', 'en-ie', 'en-jm', 'en-nz', 'en-ph', 'en-tt', 'en-us', 'en-za', 'en-zw'];
            if (enList.indexOf(cc.sys.languageCode) >= 0) {
                this.language = i18nLangEnum.EN;
            } else {
                this.language = i18nLangEnum.AR;
            }
        }
    }
    onDestroy() {
    }
}