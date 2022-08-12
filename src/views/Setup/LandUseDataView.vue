<template>
  <div class="container">
    <h1 style="padding-bottom:10px">土地利用</h1>
    <div style="border:1px solid #CCC"></div>  
    
    <!-- 文件拖入此处 -->
    <div class="file">
      <div class="inner" @drop="fileDrop" @dragover="fileDragover">
        
        <div v-if="!isLandUseUpdate">请将文件拖入此处</div>
        <div v-else><img src="@/assets/landuse.svg" style="width:30px;vertical-align:middle;margin:0 5px 5px 0"> 土地利用已导入</div>
        
      </div>
    </div>
    <!-- 导入数据的按钮 -->
    <div class="button">
      <el-button type="primary" @click="importDataByButton" style="margin-top:20px;position:relative;left:50px;width:120px;float:left">导入数据</el-button>
    </div>

    <!-- 表单+饼状图 -->
    <div class="bottom">
    <!-- 选择土地利用编号的表单 -->
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
          <span class="el-form-item-label">土地利用类型{{index+1}}</span>

          <el-select v-model="domain.landuse" placeholder="请输入土地利用类型">
            <el-option label="林地" value="林地" />
            <el-option label="水田" value="水田" />
            <el-option label="池塘" value="池塘" />
            <el-option label="坡耕地" value="坡耕地" />
            <el-option label="河道" value="河道" />
            <el-option label="建设用地" value="建设用地" />
          </el-select>

          <!-- <el-input placeholder="请输入土地利用类型" v-model="domain.landuse"/> -->
          <el-input placeholder="请输入土地利用参数" v-model="domain.code"/>
          <el-button class="mt-2" type="danger" @click.prevent="removeDomain(domain)">删除</el-button>
        </el-form-item>

        <el-form-item>


          <el-button type="primary" @click="submitForm(formRef)">提交</el-button>
          <el-button @click="addDomain">新增</el-button>
          <el-button @click="resetForm(formRef)">重置</el-button>
        </el-form-item>

        </el-form>
     </div>
      <!-- 饼状图 -->
      <div class="echarts-landuse"></div>
    </div>

     

     
  </div>
   
</template>



<script>
import { reactive, ref, toRefs } from '@vue/reactivity'
import { useStore } from 'vuex'
import {  computed, watchEffect,watch, onMounted } from 'vue'
import * as echarts from 'echarts'


export default {
  name: 'LandUseDataView',
  components: {
  },
  setup(){
    const store = useStore()
    // 向主进程发送降雨数据的保存位置
    const importDataByButton = function(){
      window.ipcRenderer.send('importDataByButton','landUse')
    }
    // 降雨数据是否放入？
    let isLandUseUpdate = computed(()=>{
      return store.getters.currentProjectInfo.landUse.state
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
            key:'landUse',
            fileType:fileType
          })
        }
      }
    }
    let fileDragover = function(e){
      e.preventDefault()
      e.stopPropagation()
    }


    // 表单
    const formRef = ref()
    const dynamicValidateForm = reactive({
      domains: [
        {
          key: 1,
          landuse: '林地',
          code: '1',
        },
      ],
    })


    const removeDomain = (item) => {
      const index = dynamicValidateForm.domains.indexOf(item)
      if (index !== -1) {
        dynamicValidateForm.domains.splice(index, 1)
      }
    }

    const addDomain = () => {
      dynamicValidateForm.domains.push({
        key: Date.now(),
        value: '',
      })
    }

    const submitForm = (formEl) => {
      if (!formEl) return
      let isValidate = true
      let arr = {}
      dynamicValidateForm.domains.forEach((item)=>{
        if(!item['landuse'] || !item['code']){
          isValidate = false
        }else{
          // arr[item['landuse']] = item['landuse']
          arr[item['code']] = item['landuse']
        }
      })
      if(isValidate){
        // 验证通过，发送给后台
        alert('提交成功')
        window.ipcRenderer.send('paintLandUse',{filepath:store.getters.currentProjectPath,landuseCode:arr})
      }else{
        alert('请正确输入土地利用类型！')
      }      
    }

    const resetForm = (formEl) => {
      if (!formEl) return
      formEl.resetFields()
    }


    // 页面加载前，进行绘图
    onMounted(()=>{
      // 请求echarts数据，如果已存在，则直接绘图，不存在则返回
      window.ipcRenderer.send('requireEcharts','landuse')
      // 以下两个事件为页面中landUse->code对应关系的持久化处理
      window.ipcRenderer.send('requireLanduseCode',store.getters.currentProjectPath)
      window.ipcRenderer.on('getLanduseCode',function(err,codeArr){
        dynamicValidateForm.domains = codeArr
      })
      // 监听主线程数据计算成功的事件,并绘图
      window.ipcRenderer.on('landusePaint',function(err,landuseObj){
        const {landuse,count} = landuseObj
        let luData = []
        for(let i = 0 ; i <landuse.length;i++){
          luData.push({
            value:count[i],
            name:landuse[i]
          })
        }
        let myChart = echarts.init(document.querySelector(".echarts-landuse"));
        window.onresize = function(){
          myChart.resize();
        };
        // 绘制图表
        myChart.setOption({
            title: {					         	
                    text: "土地利用分布情况",
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
                  data:luData
                }
            ]
        })
      })
    })
      
      return{
        importDataByButton,
        fileDrop,
        fileDragover,
        isLandUseUpdate,
        formRef,
        dynamicValidateForm,
        removeDomain,
        addDomain,
        submitForm,
        resetForm
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
}

.bottom{
    display: flex;
    margin: 50px;
    justify-content: space-around;
    flex-wrap: wrap;
  .land-use-form{
    width: 60%;
    min-width: 500px;
    .el-form-item{
      display: flex;
      flex-wrap: nowrap;
      vertical-align: middle;
      height: 50px;
      border-top: 1px solid rgb(222,226,230);
      margin-bottom: 0px;
      .el-form-item-label{
        font-size: 20px;
        float: left;
        margin-left:-100px;
      }
      .el-input,.el-select{
        width: 30%;
        margin: 0 2%;
      }
      .el-button{
        width: 20%;
        vertical-align: middle;
      }
    }
  }

  .echarts-landuse{
    width: 300px;
    height: 300px;
    
  }
}


</style>
