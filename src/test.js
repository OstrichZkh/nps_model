const fs = require('fs')
const path = require('path')

let a ='C:/Users/yezouhua/Desktop/master/胶体/流域基础数据/JLXsoil/SOIL4.tif'
let b = 'C:/Users/yezouhua/Desktop/master/胶体/流域基础数据/JLXsoil/SOIL4444.tif'
fs.copyFile(a,b,0,()=>{})