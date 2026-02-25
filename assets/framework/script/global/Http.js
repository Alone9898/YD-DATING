var URL = "http://pay.25599.in/sms.php";

var HTTP = cc.Class({
    extends: cc.Component,

    statics: {
        _sessionId: 0,
        _url: URL,

        sendReq: function (path, data, handler, extraUrl,type="GET",bAllowCache=true,timeout) {
            var xhr = cc.loader.getXMLHttpRequest();
            xhr.timeout = timeout || 3000;  //5秒超时

            var str = "";
            for (var key in data) {
                if (str != "") {
                    str += "&";
                }
                str += key + "=" + data[key];
            }

            if (extraUrl == null) {
                extraUrl = HTTP._url
            }

            var requestURL = extraUrl + path 
            if(type == "GET"){
                requestURL += ('?'+encodeURI( str ));
            }
            if(Global.localVersion){
                console.log("#######request url:" +requestURL + " => " + JSON.stringify(data));
            }
            
            xhr.open(type, requestURL, true);
            if (Global.isNative()) {
                xhr.setRequestHeader("Accept-Encoding","gzip,deflate","text/html;charset=UTF-8");
            }
            
            
            xhr.onreadystatechange = function () {
                HTTP.onReadyStateChanged(xhr, handler);
            };
            
            if(type == "POST"){
                xhr.send(str);  
            }
            else{
                //只有Get的header
                if(!bAllowCache){
                    // xhr.setRequestHeader("If-Modified-Since","0");
                    xhr.setRequestHeader("If-Modified-Since", "Thu, 01 Jan 1970 00:00:00 GMT");
                }

                xhr.send();
            }
            
            return xhr;
        },

        onReadyStateChanged: function (xhr, handler) {
            if(xhr.readyState === 4 && (xhr.status >= 200 && xhr.status < 400)) {
                console.log("http res("+ xhr.responseText.length + "): " + xhr.responseText);
                try {
                    var ret = JSON.parse(xhr.responseText);
                    if (handler) {
                        handler(true, ret);
                    }
                    else {
                        let errorMsg = "HTTP is not set callback function!"
                        console.log(errorMsg);
                        handler(false,false);
                    }
                } 
                catch (e) {
                    let errorMsg = "HTTP Error: " + e
                    console.log("HTTP Error: " + e);
                    handler(false,errorMsg);
                }
                finally {
                    // Todo ...
                }
            }
            else {
                let errorMsg = 'Http Error:  readyState: ' + xhr.readyState + '  status: ' + xhr.status
                console.log(errorMsg);
                handler(false,errorMsg);
            }
        },
    },
});

module.exports = HTTP;