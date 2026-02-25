/**
 * 错误码显示
 */
export function showErrorInfo(code: number) {
    cc.log("#error code#", code);
    let msg = cc.vv.UserConfig.spcode2String(code);
    if(msg) {
        cc.vv.FloatTip.show(msg, true);
    }
}