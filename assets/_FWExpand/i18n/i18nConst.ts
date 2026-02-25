/**
 *  i18nDef
 *  多语言语言配置
 */
export enum i18nLangEnum {
    AR = 1,
    EN,
}

export interface i18nLangConfig {
    enum: i18nLangEnum, name: string, lang: string, unit: string, id: number,
}

export const i18nLanguage = {
    "AR": <i18nLangConfig>{ enum: i18nLangEnum.AR, name: "عربي", lang: "ar", unit: 'AED', id: 1 },     // 阿拉伯
    "EN": <i18nLangConfig>{ enum: i18nLangEnum.EN, name: "English", lang: "en", unit: '$', id: 2 },       // 英语
}