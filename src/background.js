'use strict'
import { app, protocol, BrowserWindow,ipcMain,dialog,shell } from 'electron'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'
import installExtension, { VUEJS3_DEVTOOLS } from 'electron-devtools-installer'
const fs = require('fs')
const path = require('path')
// import { handleError } from 'vue'
let currentProjectPath = ''
let currentProjectName = ''
let projectInfoJson = path.join(__dirname,'..','./log/projectInfo.json')
const isDevelopment = process.env.NODE_ENV !== 'production'
const dayjs = require('dayjs');
// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { secure: true, standard: true } }
])

async function createWindow() {
  // Create the browser window.
  // let devtools = path.join('C:/Users/yezouhua/AppData/Local/Google/Chrome/User Data/Default/Extensions/nhdogjmejiglipccpnnnanhbledajbpd/6.2.1_0')
  // BrowserWindow.addDevToolsExtension(devtools)
  const win = new BrowserWindow({
    width: 1400,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  })

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    await win.loadURL(process.env.WEBPACK_DEV_SERVER_URL)
    if (!process.env.IS_TEST) win.webContents.openDevTools()
  } else {
    createProtocol('app')
    // Load the index.html when not in development
    win.loadURL('app://./index.html')
  }
}

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    try {
      await installExtension(VUEJS3_DEVTOOLS)
    } catch (e) {
      console.error('Vue Devtools failed to install:', e.toString())
    }
  }
  createWindow()
})

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', (data) => {
      if (data === 'graceful-exit') {
        app.quit()
      }
    })
  } else {
    process.on('SIGTERM', () => {
      app.quit()
    })
  }
}

function switchProject(payload,event){
  const {projectName,projectPath} = payload
  fs.readFile(projectInfoJson,'utf-8',function(err,json){
    let data = JSON.parse(json)
    if(data[projectName]){
      currentProjectPath = projectPath
      currentProjectName = projectName
      data[currentProjectName].lastSavedDate = +new Date()
      data[currentProjectName].lastSaved = dayjs(new Date).format('YYYY-MM-DD HH:mm:ss')
      fs.writeFile(projectInfoJson,JSON.stringify(data),function(err,data){})
      event.sender.send('sendProjectInfo',data)
      console.log(`切换项目成功，切换到了${currentProjectName}，路径为${currentProjectPath}`);
    }else{
      console.log(`项目${projectName}不存在，切换失败`)
    }
  })
}

// 修改json文件中的项目信息，并返回给渲染进程最新数据
function jsonUpdate(event,objName,value,key1,key2){
  // 读取json文件
  fs.readFile(projectInfoJson,'utf-8',function(err,json){
    let data = JSON.parse(json)
    if(key2){
      data[objName][key1][key2] = value
    }else{
      data[objName][key1] = value
    }
    fs.writeFile(projectInfoJson,JSON.stringify(data),function(err,d){
      if(err){
        console.log('json');
      }else{
        console.log(`项目${currentProjectName}的${key1},${key2}属性更新成功，为${value}`)
        event.sender.send('sendProjectInfo',data)
      }
    })
    // let updatedJson = JSON.stringify(data)
    // fs.writeFile(projectInfoJson,updatedJson,function(err,data){
    //   if(!err){
    //     console.log('json文件写入成功！');
    //   }
    // })

  })
}

// 新建或者删除json中的项目
function jsonDeleteAdd(behavior,projectName,info){
  if(behavior=='delete'){
    // 在json文件中删除对应项目信息
    fs.readFile(projectInfoJson,'utf-8',function(err,json){
      if(!err){
        let data = JSON.parse(json)
        for(let key in data){
          if(key==projectName){
            delete data[projectName]
            fs.writeFile(projectInfoJson,JSON.stringify(data),function(err,data){
              if(!err){console.log(`${projectName}被删除`);}
            })
          }
        }
      }else{
        console.log(`json文件${behavior}失败`);
      }
    })
  }else if(behavior=='add'){
    // 在json文件中写入对应项目信息
    fs.readFile(projectInfoJson,'utf-8',function(err,json){
      if(!err){
        let data = JSON.parse(json)
        if(data[projectName]){
          console.log(`项目${projectName}已存在！`);
        }else{
          data[projectName] = info
          fs.writeFile(projectInfoJson,JSON.stringify(data),function(err,data){
            if(!err){console.log(`项目${projectName}添加成功，信息为${info}`)}
          })
        }
      }else{
        console.log(`json文件${behavior}失败`);
      }
    })
  }
}

// 向项目文件夹中导入数据，并更新json数据
function importFile(sourcePath,fileName,fileType){
  fs.readFile(sourcePath,'utf-8',function(err,data){
    if(!err){
     fs.writeFile(`${currentProjectPath}/${fileName}`,data,function(err,data){
        if(!err){
          // jsonUpdate(fileType)
        }
      })
    }
  })
}

// 通过导入按钮导入降雨数据
ipcMain.on('importDataByButton', function(event, type) {
  // 
  let title
  let filters
  let targetPath
  if(type=='rainfall'){
    title = '请选择降雨文件'
    filters = [
      {
        name: 'txt',
        extensions: ['txt']         
      }
    ]
    targetPath = currentProjectPath + '/rain.txt'
  }else if(type=='soilType'){
    title = '请选择土壤类型文件'
    filters = [
      {
        name: 'tif',
        extensions: ['tif']         
      }
    ]
    targetPath = currentProjectPath + '/soilType.tif'
  }else if(type=='landUse'){
    title = '请选择土地利用文件'
    filters = [
      {
        name: 'tif',
        extensions: ['tif']         
      }
    ]
    targetPath = currentProjectPath + '/landUse.tif'
  }else if(type=='DEM'){
    title = '请选择DEM文件'
    filters = [
      {
        name: 'tif',
        extensions: ['tif']         
      }
    ]
    targetPath = currentProjectPath + '/DEM.tif'
  }else if(type == 'C_factor'){
    title = '请选择C因子文件'
    filters = [
      {
        name: 'tif',
        extensions: ['tif']         
      }
    ]
    targetPath = currentProjectPath + '/C_factor.tif'
  }else if(type == 'L_factor'){
    title = '请选择L因子文件'
    filters = [
      {
        name: 'tif',
        extensions: ['tif']         
      }
    ]
    targetPath = currentProjectPath + '/L_factor.tif'
  }else if(type == 'S_factor'){
    title = '请选择S因子文件'
    filters = [
      {
        name: 'tif',
        extensions: ['tif']         
      }
    ]
    targetPath = currentProjectPath + '/S_factor.tif'
  }
    // arg是从渲染进程返回来的数据
  dialog.showOpenDialog(
    {
      title: title,       // 对话框的标题
      defaultPath: '',       // 默认的文件名字
      filters: filters,
      buttonLabel: '选择'     // 自定义按钮文本显示内容
  }).then((res)=>{
    fs.copyFile(res.filePaths[0],targetPath,function(err,d){
      if(!err){
        console.log(`项目${currentProjectName}的${type}数据导入成功`);
        // 写入成功，修改json文件，并发送给前台
        if(type=='rainfall'){
          jsonUpdate(event,currentProjectName,true,'rainfall','state')
          event.sender.send('rainfallImported')
        }else if(type=='soilType'){
          jsonUpdate(event,currentProjectName,true,'soilType','state')
          event.sender.send('soilTypeImported')
        }else if(type=='landUse'){
          jsonUpdate(event,currentProjectName,true,'landUse','state')
          event.sender.send('landUseImported')
        }else if(type=='DEM'){
          jsonUpdate(event,currentProjectName,true,'DEM','state')
          event.sender.send('DEMImported')
        }else if(type == 'C_factor'){
          jsonUpdate(event,currentProjectName,true,'rusle','C_factor')
        }else if(type == 'L_factor'){
          jsonUpdate(event,currentProjectName,true,'rusle','L_factor')
        }else if(type == 'S_factor'){
          jsonUpdate(event,currentProjectName,true,'rusle','S_factor')
        }
      }
    })

  },(err)=>{
    throw err
  })
});



// 通过拖拽导入数据
ipcMain.on('importDataByDrop', function(event, payload) {
  const {projectName,path,key,fileType} = payload
  if(projectName!==currentProjectName){
    console.log('不应该呀，导入数据的时候传过来的项目名应该就是现在的项目名字')
  }else{
    // 目标路径
    let targetPath = `${currentProjectPath}/${key}.${fileType}`
    // 将拖入的数据复制到项目文件夹中
    fs.copyFile(path,targetPath,function(err,d){
      if(!err){
        console.log(`${projectName}的${key}写入成功`)
        if(key=='rainfall'){
          jsonUpdate(event,currentProjectName,true,'rainfall','state')
          event.sender.send('rainfallImported')
        }else if(key=='soilType'){
          jsonUpdate(event,currentProjectName,true,'soilType','state')
          event.sender.send('soilTypeImported')
        }else if(key=='landUse'){
          jsonUpdate(event,currentProjectName,true,'landUse','state')
          event.sender.send('landUseImported')
        }else if(key=='DEM'){
          jsonUpdate(event,currentProjectName,true,'DEM','state')
          event.sender.send('DEMImported')
        }else if(key == 'C_factor'){
          jsonUpdate(event,currentProjectName,true,'rusle','C_factor')
        }else if(key == 'L_factor'){
          jsonUpdate(event,currentProjectName,true,'rusle','L_factor')
        }else if(key == 'S_factor'){
          jsonUpdate(event,currentProjectName,true,'rusle','S_factor')
        }
      }else{
        console.log(`写入文件失败`);
      }
    })

    // fs.readFile(path,'utf-8',function(err,data){
    //   if(!err){
    //     fs.writeFile(targetPath,data,function(err,d){
    //       if(!err){
    //         console.log(`${projectName}的${key}写入成功`)
    //         if(key=='rainfall'){
    //           jsonUpdate(event,currentProjectName,true,'rainfall','state')
    //         }else if(key=='soilType'){
    //           jsonUpdate(event,currentProjectName,true,'soilType','state')
    //         }else if(key=='landUse'){
    //           jsonUpdate(event,currentProjectName,true,'landUse','state')
    //         }else if(key=='DEM'){
    //           jsonUpdate(event,currentProjectName,true,'DEM','state')
    //         }
    //       }else{
    //         console.log(`写入文件失败`);
    //       }
    //     })
    //   }else{
    //     console.log(`读取文件失败`)
    //   }
    // })

  }


})
// 返回给渲染进程已有项目信息->第一次加载
ipcMain.on('requireProjectInfo',function(event,arg){
  fs.readFile(projectInfoJson,'utf-8',function(err,json){
    let data = JSON.parse(json)
    event.sender.send('sendProjectInfo',data)
  })
})


// 创建新的项目
ipcMain.on('createProject',function(event,arg){
  dialog.showOpenDialog(
    {
      title: '请选择项目位置',       // 对话框的标题
      defaultPath: '',       // 默认的文件名字
      filters: [
        {
          name: '',
          extensions: ['']         
        }
      ],
      properties:['openDirectory'],
      buttonLabel: '选择'     // 自定义按钮文本显示内容
  })
  .then((res)=>{
    const ProjectPath = res.filePaths[0]
    const projectArr = ProjectPath.split('\\')
    const projectName = projectArr[projectArr.length-1]
    // 将目前项目的路径修改
    currentProjectPath = ProjectPath
    currentProjectName = projectName
    fs.readdir(ProjectPath,function(err,data){
      if(data.length===0){
        let obj = {
          projectName:projectName,
          projectPath:ProjectPath,
          lastSaved:dayjs(new Date).format('YYYY-MM-DD HH:mm:ss'),
          lastSavedDate:+new Date(),
          area:'0.00 ha',
          periods:{
            startDate:'',
            endDate:''
          },
          softWare:'zkh-model v1.0',
          rainfall:{
            state:false
          },
          landUse:{
            state:false,
            grids:0,
          },
          soilType:{
            state:false,
            grids:0,
          },
          DEM:{
            state:false,
            grids:0,
          },
          rusle:{
            S_factor:false,
            C_factor:false,
            L_factor:false
          }
        }
        // 向json文件写入配置
        fs.readFile(projectInfoJson,'utf-8',function(err,json){
          let data = JSON.parse(json)
          // JSON文件中已经存在该项目id了
          if(data[projectName]){
            dialog.showMessageBox({
              type:'warning',
              title:'警告',
              message:'项目名已存在，请更改文件夹名称！',
            })
          }else{
            console.log(`新建项目成功，项目名为${currentProjectName}，路径为${currentProjectPath}`);
            data[projectName] = obj
            // 修改日志中的json文件
            fs.writeFile(projectInfoJson,JSON.stringify(data),function(err,d){
              if(err){
                console.log(err);
              }else{
                // JSON文件写入成功，告诉渲染进程修改项目
                event.sender.send('sendProjectInfo',data)
                event.sender.send('switchProject',currentProjectName)
              }
            })
            // 新建项目文件夹下echarts的json文件
            fs.writeFile(ProjectPath+'/echarts.json',JSON.stringify({}),function(err,d){
              console.log(`项目中的echarts文件创建成功！`);
            })
            
          }
          
        })
      }else{
        dialog.showMessageBox({
          type:'warning',
          title:'您选择的文件夹有误',
          message:'请选择空文件夹作为项目目录！',
        })
      }
    })
  })
})

// 删除项目
ipcMain.on('deleteProject',function(event,projectName){
  dialog.showMessageBox({
    type:'info',
    title:'提示',
    message:'是否删除该项目？（项目文件需要手动删除）',
    buttons:['确定','取消'],
    defaultId: 0,
    cancelId: 1
  }).then((res)=>{
    // res.response==0，确认删除
    if(res.response==0){
      fs.readFile(projectInfoJson,'utf-8',function(err,json){
        if(!err){
          let data = JSON.parse(json)
          for(let key in data){
            if(key==projectName){
              delete data[projectName]
              console.log('删除了',projectName)
            }
          }
          fs.writeFile(projectInfoJson,JSON.stringify(data),function(err,data_){
            if(!err){
              event.sender.send('sendProjectInfo',data)
            }
          })

        }
      })
    }
  })

})

// 打开已有项目
ipcMain.on('openProject',function(event,data){
  dialog.showOpenDialog(
    {
      title: '请选择项目位置',       // 对话框的标题
      defaultPath: '',       // 默认的文件名字
      filters: [
        {
          name: '',
          extensions: ['']         
        }
      ],
      properties:['openDirectory'],
      buttonLabel: '选择'     // 自定义按钮文本显示内容
  })
  .then((res)=>{
    const ProjectPath = res.filePaths[0]
    const projectArr = ProjectPath.split('\\')
    const projectName = projectArr[projectArr.length-1]
    // 判断项目是否存在于JSON文件中
    fs.readFile(projectInfoJson,'utf-8',(err,data)=>{
      let jsonData = JSON.parse(data)
      
      // 判断项目是否合法
      if(jsonData[projectName].projectPath == ProjectPath){
        // 如果合法，才修改当前的项目信息，并返回给渲染进程
        currentProjectPath = ProjectPath
        currentProjectName = projectName
        event.sender.send('switchProject',currentProjectName)
      }else{
        console.log('err');
      }
    })
  })
})

// 项目更新！重要
ipcMain.on('projectInfoUpdated',function(event,payload){
  const {projectName,key,value} = payload
  console.log(currentProjectName)
  if(currentProjectName!==projectName){
    console.log('咋能不一样呢？');
  }else{
  // 没有key，则为sidebar切换项目，只更新项目的lastSaved值
  if(!key || key.length == 0){
    // 读取json文件，为switchProject操作
    fs.readFile(projectInfoJson,'utf-8',function(err,json){
      let data = JSON.parse(json)
      data[currentProjectName].lastSavedDate = +new Date()
      data[currentProjectName].lastSaved = dayjs(new Date).format('YYYY-MM-DD HH:mm:ss')
      fs.writeFile(projectInfoJson,JSON.stringify(data),function(err,d){
        event.sender.send('sendProjectInfo',data)
      })
    })
  }else{
    // 有key，则为数据的更新
    fs.readFile(projectInfoJson,'utf-8',function(err,json){
      let data = JSON.parse(json)
      data[currentProjectName].lastSavedDate = +new Date()
      data[currentProjectName].lastSaved = dayjs(new Date).format('YYYY-MM-DD HH:mm:ss')
      // 属性深度
      if(key.length == 1){
        data[currentProjectName][key[0]] = value
      }else if(key.length==2){
        data[currentProjectName][key[0]][key[1]] = value
      }
      // 修改完了data的属性后，保存json文件
      fs.writeFile(projectInfoJson,JSON.stringify(data),function(err,d){
        event.sender.send('sendProjectInfo',data)
      })
    })
  }
}
})

// 切换项目
ipcMain.on('switchProject',function(event,payload){
  switchProject(payload,event)
})

// 日期更新
ipcMain.on('changeDate',function(event,date){
  fs.readFile(projectInfoJson,'utf-8',function(err,json){
    let data = JSON.parse(json)
    data[currentProjectName]['periods']['startDate'] = date.startDate
    data[currentProjectName]['periods']['endDate'] = date.endDate
    fs.writeFile(projectInfoJson,JSON.stringify(data),function(err,d){
      if(err){
        console.log('项目时间修改失败');
      }else{
        event.sender.send('sendProjectInfo',data)
      }
    })
  })
})

// 持久化日期
ipcMain.on('requireDate',function(event,d){
  fs.readFile(projectInfoJson,'utf-8',function(err,json){
    let data = JSON.parse(json)
    event.sender.send('getDate',{
      startDate:data[currentProjectName]['periods']['startDate'],
      endDate:data[currentProjectName]['periods']['endDate']
    })
  })
})

// 打开文件夹
ipcMain.on('openProjectFile',function(event,dirPath){
  shell.openPath(dirPath,function(err,data){})
})

// 绘制降雨图
const spawn = require('child_process').spawn
const sys = require('sys')
ipcMain.on('paintRainfall',function(event,filePath){
  let pyPath = path.join(__dirname,'..','/src/py/dist/rainfallCalc/rainfallCalc.exe')
  let rainfallPath = filePath +'\\rain.txt'
  let jsonPath = filePath +'\\dataInfo.json'

  function dateCal(start,end){
    let res = []
    let startYear = parseInt(start.split('-')[0])
    let startMonth = parseInt(start.split('-')[1])
    let endYear = parseInt(end.split('-')[0])
    let endMonth = parseInt(end.split('-')[1])
    while((startYear*12+startMonth)<=(endYear*12+endMonth)){
      res.push(`${startYear}-${startMonth}`)
      if(startMonth<12){
        startMonth++
      }else{
        startMonth = 1
        startYear++
      }
    }
    return res    
  }
  let dateRange = dateCal('2011-1-1','2022-12-31')
  // 将降雨文件的数据发送给python脚本
  fs.readFile(projectInfoJson,'utf-8',function(err,json){
    if(!err){
      let data = JSON.parse(json)
      let currentInfo = data[currentProjectName]
      fs.writeFile(filePath+'/dataInfo.json',JSON.stringify(currentInfo),function(e,d){})
    }else{
      console.log(`${projectInfoJson}读取失败`);
    }
    
  })
  // 调用python脚本计算数据
  let std = spawn(pyPath, [rainfallPath, jsonPath]);
  std.stdout.on('data', (data) => {
    // sys.print(data)
    let res = data.toString()
    res = res.slice(1,res.length-3)
    res = res.split(',')
    res = res.map((item)=>{
      return +item
    })
    let rainfallObj = {
      rainfall:res,
      date:dateRange
    }
    fs.readFile(filePath+'/echarts.json','utf-8',function(err,json){
      if(!err){
        let data = JSON.parse(json)
        data['rainfall'] = rainfallObj
        fs.writeFile(filePath+'/echarts.json',JSON.stringify(data),function(err,d){
          if(!err){
            console.log(`降雨数据写入成功`);
            event.sender.send('rainfallPaint',data['rainfall'])
          }
        })
      }else{
        console.log(`echarts文件读取失败`);
      }
    })
  });
})

// 土地利用数据code持久化处理
ipcMain.on('requireLanduseCode',function(event,filepath){
  fs.readFile(filepath+'\\landuseCode.json','utf-8',function(err,json){
    if(!err){
      let count = 1
      let Code = JSON.parse(json)
      let codeArr = []
      for(let landuse in Code){
        codeArr.push({
          key:count,
          landuse:Code[landuse],
          code:landuse
        })
        count++
      }
      event.sender.send('getLanduseCode',codeArr)
    }
  })
})

// 土壤类型数据code持久化处理
ipcMain.on('requireSoilTypeCode',function(event,filepath){
  fs.readFile(filepath+'\\soilTypeCode.json','utf-8',function(err,json){
    if(!err){
      let count = 1
      let Code = JSON.parse(json)
      let codeArr = []
      for(let soilType in Code){
        codeArr.push({
          key:count,
          soilType:Code[soilType],
          code:soilType
        })
        count++
      }
      event.sender.send('getSoilType',codeArr)
    }
  })
})


// 土地利用数据code选择完成，计算各个土地利用类型面积占比
ipcMain.on('paintLandUse',function(event,payload){
  const {filepath,landuseCode} = payload
  fs.writeFile(filepath+'\\landuseCode.json',JSON.stringify(landuseCode),function(e,d){
    if(!e){
      console.log(`土地利用的code写入完毕，位于${filepath}\\landuseCode.json'`);
    }
  })
  // 开始执行python脚本
  let pyPath = path.join(__dirname,'..','/src/py/dist/tifToCsv/tifToCsv.exe')
  let landusePath = filepath +'\\landUse.tif'
  let jsonPath = filepath +'\\landuseCode.json'
  let std = spawn(pyPath, [landusePath,filepath,'landuse']);
  std.stdout.on('data', (data) => {
    let res = data.toString().replace('{','').replace('}','')
    res = res.split(',')
    let landuseArr = []
    let countArr = []
    res.forEach((item)=>{
      let key = item.split(':')[0].toString().replace(' ','')
      let count = item.split(':')[1]
      if(landuseCode[key]){
        landuseArr.push(landuseCode[key])
        countArr.push(parseInt(count))
      }
    })
    let landuseObj = {
      landuse:landuseArr,
      count:countArr
    }

    fs.readFile(filepath+'/echarts.json','utf-8',function(err,json){
      if(!err){
        let data = JSON.parse(json)
        data['landuse'] = landuseObj
        fs.writeFile(filepath+'/echarts.json',JSON.stringify(data),function(err,d){
          if(!err){
            console.log(`土地利用写入成功`);
            event.sender.send('landusePaint',landuseObj)
          }
        })
      }else{
        console.log(`echarts文件读取失败`);
      }
    })
  })
  std.stderr.on('data', (data) => {
    let res = data.toString()
    console.log('res',res);
  })
})


// DEM导入后，计算绘图所用数据
ipcMain.on('paintDEM',function(event,filePath){
  let pyPath = path.join(__dirname,'..','/src/py/dist/tifToCsv/tifToCsv.exe')
  let DEMPath = filePath +'\\DEM.tif'
  let std = spawn(pyPath,[DEMPath,filePath,'DEM'])
  std.stdout.on('data',(data)=>{
    let dem = data.toString().replace('{','').replace('}','').replace(' ','')
    let index1
    let index2
    let index3
    let index4
    index1=dem.indexOf('[')
    index2=dem.indexOf(']')
    index3=dem.indexOf('[',index1+1)
    index4=dem.indexOf(']',index2+1)
    let demArr = dem.slice(index1+1,index2).split(',')
    let countArr = dem.slice(index3+1,index4).split(',')
    demArr = demArr.map((item)=>{
      return item.replace(' ','').replace(/\'/g, "").replace(/\s*/g,"")
    })
    countArr = countArr.map((item)=>{
      return parseInt(item)
    })
    event.sender.send('DEMPaint',{
      demArr,
      countArr
    })
    fs.readFile(filePath+'/echarts.json','utf-8',function(err,json){
      if(!err){
        let data = JSON.parse(json)
        data['DEM'] = {
          demArr,
          countArr
        }
        fs.writeFile(filePath+'/echarts.json',JSON.stringify(data),function(err,d){
          if(!err){
            console.log(`DEM的echarts写入成功`);
          }
        })
      }else{
        console.log(`echarts文件读取失败`);
      }
    })
  })

  std.stderr.on('err',(err)=>{
    console.log(err);
  })
})

// 页面加载完后，页面会请求已存在的echarts数据
ipcMain.on('requireEcharts',function(event,type){
  fs.readFile(currentProjectPath+'/echarts.json','utf-8',function(err,json){
    let data = JSON.parse(json)
    if(type=='landuse' && data['landuse']){
      event.sender.send('landusePaint',data['landuse'])
    }else if(type=='rainfall' && data['rainfall']){
      event.sender.send('rainfallPaint',data['rainfall'])
    }else if(type=='DEM' && data['DEM']){
      event.sender.send('DEMPaint',data['DEM'])
    }else if(type=='soilType' && data['soilType']){
      event.sender.send('soilTypePaint',data['soilType'])
    }
  })
})



// 土地利用数据code选择完成，计算各个土地利用类型面积占比
ipcMain.on('paintSoilType',function(event,payload){
  payload = JSON.parse(payload)
  const {filepath,soilTypeCode} = payload

  fs.writeFile(filepath+'\\soilTypeCode.json',JSON.stringify(soilTypeCode),function(e,d){
    if(!e){
      console.log(`土壤类型的code写入完毕，位于${filepath}\\soilTypeCode.json'`);
    }else{
      console.log(`读取soilTypeCode.json失败`)
    }
  })
  // 开始执行python脚本
  let pyPath = path.join(__dirname,'..','/src/py/dist/tifToCsv/tifToCsv.exe')
  let soilTypePath = filepath +'\\soilType.tif'
  let jsonPath = filepath +'\\soilType.json'
  let std = spawn(pyPath, [soilTypePath,filepath,'soilType']);
  std.stdout.on('data', (data) => {
    let res = data.toString().replace('{','').replace('}','')
    res = res.split(',')
    let soilTypeArr = []
    let countArr = []
    res.forEach((item)=>{
      let key = item.split(':')[0].toString().replace(' ','')
      let count = item.split(':')[1]
      if(soilTypeCode[key]){
        soilTypeArr.push(soilTypeCode[key])
        countArr.push(parseInt(count))
      }
    })
    let soilTypeObj = {
      soilType:soilTypeArr,
      count:countArr
    }
    console.log(soilTypeObj);

    fs.readFile(filepath+'/echarts.json','utf-8',function(err,json){
      if(!err){
        let data = JSON.parse(json)
        data['soilType'] = soilTypeObj
        fs.writeFile(filepath+'/echarts.json',JSON.stringify(data),function(err,d){
          if(!err){
            console.log(`土地利用写入成功`);
            event.sender.send('soilTypePaint',soilTypeObj)
          }
        })
      }else{
        console.log(`echarts文件读取失败`);
      }
    })
  })
  std.stderr.on('data', (data) => {
    let res = data.toString()
    console.log('err',res);
  })
})