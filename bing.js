"use strict";
var request = require("request");
var fs = require("fs");

function dateFormat(data, fmt) {
    var date = new Date(data);
    var o = {
        "M+": date.getMonth() + 1,
        "d+": date.getDate(),
        "h+": date.getHours(),
        "m+": date.getMinutes(),
        "s+": date.getSeconds(),
        "q+": Math.floor((date.getMonth() + 3) / 3),
        "S": date.getMilliseconds()
    };
    if (/(y+)/.test(fmt))
        fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt))
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
}

class Bing {
    constructor(url) {
        this.url = url;
        var now = new Date();
        this.now = dateFormat(now, "yyyy-MM-dd");
    }
    // 启动进程
    start() {
        var own = this;
        this.getFiles(function (arr) {
            own.download(arr);
        });

    }
        
    // 提取地址数据
    getFiles(callback) {
        var own = this;
        request(this, url, function (error, data, content) {
            if (error) throw error;
            own.saveRaw(content);
            own.saveCopyright(content);

            var re = new RegExp('\/\/.*?(jpg|mp4|png)\"', "g");
            var arr = [];
            arr = content.match(re);
            callback(arr);
        });
    }
        
    // // 保存原始数据
    saveRaw(json) {
        var path = "data/data/" + this.now + ".json";
        fs.writeFile(path, json);
    }
        
    // // 下载文件
    download(arr) {
        for (var i = 0; i < arr.length; i++) {
            var cur = arr[i];
            cur = "http:" + cur.replace('"', "");

            var filename = cur.split("/");
            filename = filename[filename.length - 1];
            var ext = cur.split(".");
            ext = ext[ext.length - 1];

            var path = "data/";
            if (ext === "mp4") {
                path += "video";
            } else {
                path += "picture";
            }
            path = path + "/" + this.now + "_" + i + "_" + filename;

            if (!fs.existsSync(path)) {
                console.log("download is start", filename);
                request(cur).pipe(fs.createWriteStream(path));

            } else {
                console.log("exists is", filename);
            }
        }
    }

    // // 提取出bing数据中的版权信息
    saveCopyright(content) {
        content = JSON.parse(content);
        var now = new Date();
        now = dateFormat(now,"yyyy-MM-dd hh:mm:ss")
        
        var copyright = now + "\t" + content["images"][0]["copyright"] + "\r\n";
        var path = "data/recode.log";
        fs.appendFile(path, copyright);
    }
}
var url = "http://cn.bing.com/HPImageArchive.aspx?format=js&idx=0&n=1&nc=1428896145111&pid=hp&video=1";
var b = new Bing(url);
b.start();