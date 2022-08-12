const fs = require('fs')
// 读取文件方法
function readFile(path){
    return new Promise((resolve, reject)=>{
        fs.readFile(path, { flag: 'r', encoding:'utf-8' }, (err, data) => {
            if (err) { reject('出错啦'); }
            resolve(data);
        }); 
    })
}

module.exports = { readFile }