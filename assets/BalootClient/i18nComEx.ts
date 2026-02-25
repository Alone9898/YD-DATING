import { i18nLangEnum } from "../_FWExpand/i18n/i18nConst";
import { i18nManager } from "../_FWExpand/i18n/i18nManager";

const { ccclass, property, menu } = cc._decorator;
@ccclass
@menu("多语言/i18nCom")
export default class i18nCom extends cc.Component {
    @property({ visible: false })
    private _currLanguage: i18nLangEnum = i18nLangEnum.AR;

    set language(value: i18nLangEnum) {
        this._currLanguage = value;
        i18nManager.setLanguage(this._currLanguage);
       
    }
    @property({ type: cc.JsonAsset, displayName: "预加载Json" })
    jsonAsset_ar: cc.JsonAsset = null;
    @property({ type: cc.JsonAsset, displayName: "预加载Json" })
    jsonAsset_en: cc.JsonAsset = null;
    onLoad() {
        // 获取当前语言设置,如果没有设置,则使用默认配置
        this.language = i18nLangEnum.EN
        
        // let currlang = i18nManager.getLanguage();
        // if (currlang) {
        //     this.language = currlang;
        // } else {
        //     // let enList = ['en', 'en-au', 'en-bz', 'en-ca', 'en-gb', 'en-ie', 'en-jm', 'en-nz', 'en-ph', 'en-tt', 'en-us', 'en-za', 'en-zw'];
        //     // if (enList.indexOf(cc.sys.languageCode) >= 0) {
        //     //     this.language = i18nLangEnum.EN;
        //     // } else {
        //     //     this.language = i18nLangEnum.AR;
        //     // }
        //     this.language = i18nLangEnum.EN;
        // }
    }
    onDestroy() {
    }
}