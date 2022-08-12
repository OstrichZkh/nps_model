import { createStore } from 'vuex'

export default createStore({
  state: {
    rainfallDate:{},
    isRainfallUpdate:false,
    siderPanelActived:'file',
    projectInfo:[],  // 所有的项目信息
    currentProjectName:"", //目前的项目名称
    kValue:{
      '红壤':{
        '红壤':0.0075,
        '黄红壤':0.0077,
        '红壤性土':0.0065
      },
      '黄壤':{
        '黄壤':0.0157,
        '黄壤性土':0.0145,
      },
      '黄棕壤':{
        '黄棕壤':0.0168,
        '暗黄棕壤':0.0182,
        '黄棕壤性土':0.0175
      },
      '黄褐土':{
        '黄褐土':0.0192
      },
      '棕壤':{
        '棕壤':0.0072
      },
      '暗棕壤':{
        '暗棕壤':0.0113
      },
      '石灰土':{
        '黑色石灰土':0.0147,
        '棕色石灰土':0.0186,
        '黄色石灰土':0.0167
      },
      '紫色土':{
        '酸性紫色土':0.0196,
        '中性紫色土':0.0179,
        '石灰紫色土':0.0174
      },
      '粗骨土':{
        '酸性粗骨土':0.0055,
        '中性粗骨土':0.0086,
        '钙质粗骨土':0.0097
      },
      '山地草甸土':{
        '山地草甸土':0.0176
      },
      '水稻土':{
        '潴育水稻土':0.0195,
        '淹育水稻土':0.0142,
        '渗育水稻土':0.0186,
        '潜育水稻土':0.0195
      }
    }
  },
  getters: {
    currentProjectPath(state){
      if(state.currentProjectName!==""){
        return state.projectInfo.filter((item)=>{
          return item.projectName == state.currentProjectName 
        })[0].projectPath
      }else{
        return null
      }
    },
    currentProjectInfo(state){
      return state.projectInfo.filter((item)=>{
        return item.projectName == state.currentProjectName 
      })[0]
    },
    dataState(state){
      if(state.currentProjectName!==""){
        let curInfo = state.projectInfo.filter((item)=>{
          return item.projectName == state.currentProjectName 
        })[0]
        let res = [
          {
            'data':'降雨数据',
            'state':curInfo['rainfall']['state']
          },
          {
            'data':'DEM数据',
            'state':curInfo['DEM']['state']
          },
          {
            'data':'土地利用数据',
            'state':curInfo['landUse']['state']
          },
          {
            'data':'土壤类型数据',
            'state':curInfo['soilType']['state']
          },
        ]
        return res
      
      }else{
        return null
      }
    }
    
  },
  mutations: {
    changeState(state,payload){
      const {property,newVal} = payload
      state[property] = newVal
    },
    // 改变最左边的状态
    changeSiderPanelActived(state,payload){
      state['siderPanelActived'] = payload
    },
    // 添加项目的json数据
    addProjectInfo(state,payload){
      state.projectInfo = []
      let tempInfoArr = []
      // 将项目信息按照lastSaved进行排序
      for(let key in payload){
        tempInfoArr.push(payload[key])
      }
      // 按照更新时间排序
      tempInfoArr.sort((a,b)=>{
        return b.lastSavedDate - a.lastSavedDate
      })
      state.projectInfo = tempInfoArr
      // 如果删除了目前的项目，则将项目置空
      if(!state.projectInfo.some((item)=>{
        return item.projectName == state.currentProjectName
      })){
        state.currentProjectName = ''
      }

    },
    // 修改当前的项目
    switchProject(state,projectName){
      state.currentProjectName = projectName
    },
    
  },
  actions: {
  },
  modules: {
  }
})
