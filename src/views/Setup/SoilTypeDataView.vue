<template>
  <div class="container">
    <h1 style="padding-bottom:10px">土壤类型</h1>
    <div style="border:1px solid #CCC"></div>  
    
    <!-- 文件拖入此处 -->
    <div class="file">
      <div class="inner" @drop="fileDrop" @dragover="fileDragover">
        
        <div v-if="!isSoilTypeUpdate">请将文件拖入此处</div>
        <div v-else><img src="@/assets/soilType.svg" style="width:30px;vertical-align:middle;margin:0 5px 5px 0"> 土壤类型已导入</div>
        
      </div>
    </div>
    <!-- 导入数据的按钮 -->
    <div class="button">
      <el-button type="primary" @click="importDataByButton">导入数据</el-button>
    </div>
  </div>
  <!-- 底部表单和图 -->

  <div class="bottom">
    <div class="land-use-form">
      <el-form
          ref="formRef"
          :model="dynamicValidateForm"
          label-width="120px"
          class="demo-dynamic"
      > 
        <el-form-item
          v-for="(domain, index) in dynamicValidateForm.domains"
          :key="domain.key"
          :prop="'domains.' + index + '.value'"
          class="el-form-item"
        >
          <span class="label">土壤类型{{index+1}}</span>
          <div class="select">
            <el-cascader
              v-model="domain.soilType"
              :options="options"
              :props="props"
              @change="handleChange(domain)"
            />
          </div>
          <div class="input">
            <el-input placeholder="请输入土壤参数" v-model="domain.code"/>
          </div>
          <div class="k-value">K = {{domain.kVal}}</div>
          <div class="button">
            <el-button class="mt-2" type="danger" @click.prevent="removeDomain(domain)">删除</el-button>
          </div>

        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="submitForm(formRef)">提交</el-button>
          <el-button @click="addDomain">新增</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>

  <div class="echarts-soiltype"></div>

</template>

<script>
import { reactive, ref } from '@vue/reactivity'
import { useStore } from 'vuex'
import {  computed, watchEffect,watch, onMounted } from 'vue'
import * as echarts from 'echarts'


export default {
  name: 'SoilTypeDataView',
  components: {
  },
  setup(){
    const store = useStore()

    onMounted(()=>{
      // 请求echarts数据，如果已存在，则直接绘图，不存在则返回
      window.ipcRenderer.send('requireEcharts','soilType')
      // 以下两个事件为页面中landUse->code对应关系的持久化处理
      window.ipcRenderer.send('requireSoilTypeCode',store.getters.currentProjectPath)
      window.ipcRenderer.on('getSoilType',function(err,codeArr){
        let res = []
        codeArr.forEach((item)=>{
          let soilType = item.soilType
          let kVal = store.state.kValue[soilType[0]][soilType[1]]
          res.push({
            key:item.key,
            soilType:item.soilType,
            code:item.code,
            kVal:kVal
          })
        })
        dynamicValidateForm.domains = res
      })
      // 监听主线程数据计算成功的事件,并绘图
      window.ipcRenderer.on('soilTypePaint',function(err,soilTypeObj){
        const {count,soilType} = soilTypeObj
        let soilData = [] 
        for(let i = 0 ; i <soilType.length;i++){
          soilData.push({
            value:count[i],
            name:soilType[i][1]
          })
        }
        let myChart = echarts.init(document.querySelector(".echarts-soiltype"));
        window.onresize = function(){
          myChart.resize();
        };
        // 绘制图表
        myChart.setOption({
            title: {					         	
                  text: "土壤类型分布情况",
                  left: "center",
                  textStyle: {
                    fontSize: 20
                  },
                  padding:[20,0,0,0]
                  
              },
            series : [
                {
                  name: '2333',
                  type: 'pie',    // 设置图表类型为饼图
                  radius: '55%',  // 饼图的半径，外半径为可视区尺寸（容器高宽中较小一项）的 55% 长度。
                  data:soilData
                }
            ]
        })
      })
    })

    // 向主进程发送降雨数据的保存位置
    const importDataByButton = function(){
      window.ipcRenderer.send('importDataByButton','soilType')
    }
    // 降雨数据是否放入？
    let isSoilTypeUpdate = computed(()=>{
      return store.getters.currentProjectInfo.soilType.state
    })
    
    // 拖拽事件
    let fileDrop = function(e){
      for(let file of e.dataTransfer.files){
        let fileType = file.name.split('.')[1]
        if(fileType !='tif'){
          alert('请输入tif文件！')
        }else{
          window.ipcRenderer.send('importDataByDrop',{
            projectName:store.state.currentProjectName,
            path:file.path,
            key:'soilType',
            fileType:fileType
          })
          // store.commit('changeState','isRainfallUpdate')
          // isRainfallUpdate.value = store.state.isRainfallUpdate
          // window.ipcRenderer.send('readRainByDrop',file.path)
        }
      }
    }
    let fileDragover = function(e){
      e.preventDefault()
      e.stopPropagation()
    }

    // 表单数据
    let formRef = ref('')
    let dynamicValidateForm = reactive({
      domains: [
        {
          key: 1,
          soilType: '',
          code: '',
          kVal:'0.000'
        },
      ],
    })

    const options = [
      {
        value:'红壤',
        label:'红壤',
        children:[
          {value:'红壤',label:'红壤'},
          {value:'黄红壤',label:'黄红壤'},
          {value:'红壤性土',label:'红壤性土'}
        ]
      },{
        value:'黄壤',
        label:'黄壤',
        children:[
          {value:'黄壤',label:'黄壤'},
          {value:'黄壤性土',label:'黄壤性土'},
        ]
      },{
        value:'黄棕壤',
        label:'黄棕壤',
        children:[
          {value:'黄棕壤',label:'黄棕壤'},
          {value:'暗黄棕壤',label:'暗黄棕壤'},
          {value:'黄棕壤性土',label:'黄棕壤性土'}
        ]
      },{
        value:'黄褐土',
        label:'黄褐土',
        children:[
          {value:'黄褐土',label:'黄褐土'},
        ]
      },{
        value:'棕壤',
        label:'棕壤',
        children:[
          {value:'棕壤',label:'棕壤'},
        ]
      },{
        value:'暗棕壤',
        label:'暗棕壤',
        children:[
          {value:'暗棕壤',label:'暗棕壤'},
        ]
      },{
        value:'石灰土',
        label:'石灰土',
        children:[
          {value:'黑色石灰土',label:'黑色石灰土'},
          {value:'棕色石灰土',label:'棕色石灰土'},
          {value:'黄色石灰土',label:'黄色石灰土'},
        ]
      },{
        value:'紫色土',
        label:'紫色土',
        children:[
          {value:'酸性紫色土',label:'酸性紫色土'},
          {value:'中性紫色土',label:'中性紫色土'},
          {value:'石灰紫色土',label:'石灰紫色土'},
        ]
      },{
        value:'粗骨土',
        label:'粗骨土',
        children:[
          {value:'酸性粗骨土',label:'酸性粗骨土'},
          {value:'中性粗骨土',label:'中性粗骨土'},
          {value:'钙质粗骨土',label:'钙质粗骨土'},
        ]
      },{
        value:'山地草甸土',
        label:'山地草甸土',
        children:[
          {value:'山地草甸土',label:'山地草甸土'}
        ]
      },{
        value:'水稻土',
        label:'水稻土',
        children:[
          {value:'潴育水稻土',label:'潴育水稻土'},
          {value:'淹育水稻土',label:'淹育水稻土'},
          {value:'渗育水稻土',label:'渗育水稻土'},
          {value:'潜育水稻土',label:'潜育水稻土'},
        ]
      }

    ]

    const handleChange = function(domain){
      domain.kVal = store.state.kValue[domain.soilType[0]][domain.soilType[1]]
    }

    const props = {
      expandTrigger: 'click',
    }

    const removeDomain = (item) => {
      const index = dynamicValidateForm.domains.indexOf(item)
      if (index !== -1) {
        dynamicValidateForm.domains.splice(index, 1)
      }
    }

    const addDomain = () => {
      dynamicValidateForm.domains.push({
        key: Date.now(),
        soilType: '',
        code:'',
        kVal:''
      })
    }

    const submitForm = (formEl) => {
      
      if (!formEl) return
      let isValidate = true
      let arr = {}
      dynamicValidateForm.domains.forEach((item)=>{
        if(!item['soilType'] || !item['code']){
          isValidate = false
        }else{
          arr[item['code']] = item['soilType']
        }
      })
      
      if(isValidate){
        // 验证通过，发送给后台
        alert('提交成功')
        window.ipcRenderer.send('paintSoilType',JSON.stringify({
          filepath:store.getters.currentProjectPath,
          soilTypeCode:arr
        }))
      }else{
        alert('请正确输入土地利用类型！')
      }      
    }
    
    return{
      importDataByButton,
      fileDrop,
      fileDragover,
      isSoilTypeUpdate,
      formRef,
      dynamicValidateForm,
      options,
      props,
      removeDomain,
      addDomain,
      submitForm,
      handleChange
    }
  }
}
</script>
<style scoped lang="less">
.container{
  display: flex;
  flex-direction: column;

  h1{
    text-align: left;
    margin-left: 30px;
  }





  .file{
    height: 150px;
    width: 90%;
    background: rgb(248,249,250);
    margin: 10px auto;
    .inner{
      height: 90px;
      width: 80%;
      background: white;
      position: relative;
      top: 50%;
      left: 50%;
      transform: translate(-50%,-50%);
      border: 5px dashed rgb(222,226,230);
      text-align: center;
      line-height: 90px;
    }
  }

  .el-button{
    position: relative;
    left: 50px;
    width: 120px;
    float: left;
  }

}

.bottom{
    display: flex;
    margin: 50px;
    justify-content: space-around;
    flex-wrap: nowrap;
    min-width: 700px;

  .land-use-form{
    width: 100%;
    .el-form-item{
      display: flex;
      flex-wrap: nowrap;
      vertical-align: middle;
      height: 50px;
      border-top: 1px solid rgb(222,226,230);
      margin-bottom: 0px;

      .label{
        font-size: 20px;
        float: left;
        margin-left:-100px;
      }



      .input,.select{
        width: 200px;
        margin: 0 2%;
      }
      
      .button{
        width: 20%;
        vertical-align: middle;
      }
    }
  }

}

.echarts-soiltype{
  width: 500px;
  height: 500px;
  margin-left: 50px;
}

</style>
