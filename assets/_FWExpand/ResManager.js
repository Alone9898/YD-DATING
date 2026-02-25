// 动态资源管理
// 对一些通用的动态资源进行管理,在使用时候不需要异步加载
cc.Class({
    extends: cc.Component,
    statics: {
        resMap: {},
        // 获取缓存资源
        getRes(url) {
            let asset = this.resMap[url];
            if (!asset) {
                cc.warn("找不到该资源缓存: " + url);
                return;
            }
            return asset;
        },
        // 加载图片(返回句柄,可以主动取消)
        loadImage(url, callback) {
            var arrStr = url.split('/')
            var filename = arrStr[arrStr.length - 1]
            let req = { url: url, ignoreMaxConcurrency: true }
            if (filename.indexOf('.') < 0) {
                req = { url: url, type: 'jpg', ignoreMaxConcurrency: true }
            }
            let tempArgs = { url: url }
            new Promise((resolve, reject) => {
                tempArgs.rejectFunc = () => {
                    reject(0, "主动取消加载");
                };
                try {
                    cc.loader.load(req, (err, res) => {
                        if (err) { reject(-1, err); return; }
                        resolve(res);
                    });
                } catch (error) {
                    reject(-1, error);
                }

            }).then((res) => {
                callback(null, res);
            }).catch((code, err) => {
                if (code < 0) {
                    cc.warn(err, tempArgs.url);
                    callback(err);
                }
            });
            // return rejectFunc;
            return tempArgs;
        },
        loadLocalRes(url, fileType, callback) {
            let tempArgs = { url: url }
            new Promise((resolve, reject) => {
                tempArgs.rejectFunc = () => {
                    // code = 0 是主动取消加载
                    reject(0, "主动取消加载");
                };
                cc.loader.loadRes(url, fileType, (err, res) => {
                    // code = -1 加载失败
                    if (err) { reject(-1, err); return; }
                    resolve(res);
                });
            }).then((res) => {
                // 加载成功
                callback(null, res);
            }).catch((code, err) => {
                if (code < 0) {
                    cc.warn(err, tempArgs.url);
                    callback(err);
                }
            });
            return tempArgs;
        },
        // 设置图片
        setSpriteFrame(spriteCmp, texture, fileName, callback) {
            if(!spriteCmp) return 
            // 判断纹理是否有未完成的请求
            if (spriteCmp._reqHandle && spriteCmp._reqHandle.rejectFunc) {
                spriteCmp._reqHandle.rejectFunc();
                spriteCmp._reqHandle = undefined;
            }
            // 判断是不是图集纹理模式
            if (fileName) {
                spriteCmp._reqHandle = this.loadLocalRes(texture, cc.SpriteAtlas, (err, res) => {
                    // cc.log("File1=>", spriteCmp, res.getSpriteFrame(fileName))
                    if (res) {
                        spriteCmp.spriteFrame = res.getSpriteFrame(fileName);
                    }
                    spriteCmp._reqHandle = undefined;
                    if (callback) callback(err, res);
                })
            } else {
                spriteCmp._reqHandle = this.loadLocalRes(texture, cc.SpriteFrame, (err, res) => {
                    // cc.log("File2=>", spriteCmp, res)
                    if (res) {
                        spriteCmp.spriteFrame = res;
                    }
                    spriteCmp._reqHandle = undefined;
                    if (callback) callback(err, res);
                })
            }
        },
        // 设置骨骼动画
        setSkeleton(skeletonCpt, url, callback) {
            if (skeletonCpt._reqHandle && skeletonCpt._reqHandle.rejectFunc) {
                skeletonCpt._reqHandle.rejectFunc();
                skeletonCpt._reqHandle = undefined;
            }
            skeletonCpt._reqHandle = this.loadLocalRes(url, sp.SkeletonData, (err, res) => {
                if (err) { return; }
                if (res) {
                    skeletonCpt.skeletonData = res;
                }
                skeletonCpt._reqHandle = undefined;
                callback(skeletonCpt);
            });
        },

        async loadPrefab(url) {
            return new Promise((resolve, reject) => {
                cc.loader.loadRes(url, cc.Prefab, (err, prefab) => {
                    if (err) { reject(null); return; }
                    resolve(prefab);
                })
            });
        },
    },
});
