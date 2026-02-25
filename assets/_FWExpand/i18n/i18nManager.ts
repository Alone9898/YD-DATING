import { i18nLabel } from "./i18nLabel";
import { i18nSprite, i18nSpriteFrameSet } from "./i18nSprite";
import { i18nLangConfig, i18nLangEnum, i18nLanguage } from "./i18nConst";
import i18nTransform from "./i18nTransform";
import { i18nRichLabel } from "./i18nRichLabel";
import { i18SpriteButton } from "./i18SpriteButton";

export class i18nManager {
    public static lang: i18nLangEnum; // 当前语言
    private static _langCache: { [key: string]: string | null } = {}; // 文字配置
    private static cmpList: cc.Component[] = [];  // 所有的多语言控制组件

    // 设置语言
    public static setLanguage(langEnum: i18nLangEnum) {
        if (this.lang === langEnum) return;
        this.lang = langEnum;
        // 存储到本地设置
        cc.sys.localStorage.setItem("i18n_lang", this.lang);
        // 更新所有
        this.reloadAll();

    }
    // 获取当前语言配置
    public static getLanguage(defaultLanEnum?: i18nLangEnum) {
        let lang = cc.sys.localStorage.getItem("i18n_lang")
        if (lang == undefined || lang == null) {
            lang = defaultLanEnum;
        }
        return lang;
    }
    // 获取语言配置
    public static getLanguageConfig(langEnum: i18nLangEnum): i18nLangConfig {
        let langConfig: i18nLangConfig = null;
        for (var key in i18nLanguage) {
            if (langEnum == i18nLanguage[key].enum) {
                langConfig = i18nLanguage[key];
                break;
            }
        }
        return langConfig;
    }
    // 获取当前的语言配置
    public static getConfig() {
        return this.getLanguageConfig(this.getLanguage(i18nLangEnum.AR));
    }
    // 获取文本
    public static getLabel(...params: any[]): string {
        if (!params) return "";
        let opt: string = params[0];
        let obj = this._langCache[this.lang] || {};
        let output: string;
        output = obj[opt];
        if (Global.noI18n || !output) output = opt;
        for (let i = 1; i < params.length; i++) {
            output = output.replace('{' + i + '}', params[i]);
        }
        // cc.log('output = ', output);
        return output;
    }
    // 获取图片
    public static getSprite(target: cc.SpriteAtlas | Array<i18nSpriteFrameSet>, frameName: string, cb: (spriteFrame: cc.SpriteFrame) => void) {
        if (target instanceof cc.SpriteAtlas) {
            // cc.log("framename = ", this.lang + "-" + frameName);
            let atlas = target;
            let frame = atlas.getSpriteFrame((this.lang == 1 ? "ar" : "en") + "_" + frameName);
            if (!frame) {
                frame = atlas.getSpriteFrame(this.lang + "-" + frameName);
            }
            cb(frame);
        } else {
            let spriteFrame;
            for (let e of target) {
                if (e.language == this.lang) {
                    spriteFrame = e.spriteFrame;
                    break;
                }
            }
            cb(spriteFrame);
        }
    }
    // 获取对应语言顺序的文本
    public static getString(...params: string[]): string {
        let tempStr = '';
        // 确定顺序
        if (this.getLanguage() == i18nLangEnum.AR) {
            params = params.reverse()
        }
        for (const str of params) {
            tempStr += str;
        }
        return tempStr;
    }
    // 注册组件
    public static register(cmp: cc.Component) {
        if (this.cmpList.indexOf(cmp) < 0) {
            this.cmpList.push(cmp);
        }
    }
    // 注销组件
    public static unregister(cmp: cc.Component) {
        let index = this.cmpList.indexOf(cmp);
        if (index >= 0) {
            this.cmpList.splice(index, 1);
        }
    }
    // 重新加载所有i18n组件
    public static reloadAll() {
        // 文本刷新
        let url = "i18n/" + this.getLanguageConfig(this.lang).lang;
        cc.loader.loadRes(url, cc.JsonAsset, (err, data: cc.JsonAsset) => {
            if (err) {
                this._langCache[this.lang] = null;
                cc.error(err);
            } else {
                this._langCache[this.lang] = data.json;
                for (const cmp of this.cmpList) {
                    let label = cmp.node.getComponent(i18nLabel);
                    if (label) label.updateView();
                    let richLabel = cmp.node.getComponent(i18nRichLabel);
                    if (richLabel) richLabel.updateView();
                }
            }
        });
        // 更新其他所有组件
        for (const cmp of this.cmpList) {
            let sprite = cmp.node.getComponent(i18nSprite);
            if (sprite) sprite.updateView();
            let transform = cmp.node.getComponent(i18nTransform);
            if (transform) transform.updateView();
            let spriteButton = cmp.node.getComponent(i18SpriteButton);
            if (spriteButton) spriteButton.updateView();
        }
    }
}

// export
if (!window["___"]) {
    window["___"] = function () {
        return i18nManager.getLabel.apply(i18nManager, arguments);
    }
}

if (!window["__"]) {
    window["__"] = function () {
        return i18nManager.getString.apply(i18nManager, arguments);
    }
}