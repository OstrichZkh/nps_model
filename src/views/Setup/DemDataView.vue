<template>
  <div class="container">
    <h1 style="padding-bottom:10px">数字高程模型（DEM）</h1>
    <div style="border:1px solid #CCC"></div>  
    
    <!-- 文件拖入此处 -->
    <div class="file">
      <div class="inner" @drop="fileDrop" @dragover="fileDragover">
        <div v-if="!isDEMUpdate">请将文件拖入此处</div>
        <div v-else><img src="@/assets/dem.svg" style="width:30px;vertical-align:middle;margin:0 5px 5px 0"> DEM已导入</div>
      </div>
    </div>
    <!-- 导入数据的按钮 -->
    <div class="button">
      <el-button type="primary" @click="importDataByButton">导入数据</el-button>
    </div>
    <!-- DEM图 -->
    <div class="echarts-dem"></div>
  </div>
</template>



<script>
import { ref } from '@vue/reactivity'
import { useStore } from 'vuex'
import {  computed, watchEffect,watch, onMounted } from 'vue'
import * as echarts from 'echarts'


export default {
  name: 'DemDataView',
  components: {
  },
  setup(){
    const store = useStore()
    // 向主进程发送降雨数据的保存位置
    const importDataByButton = function(){
      window.ipcRenderer.send('importDataByButton','DEM')
    }
    
    // 降雨数据是否放入？
    let isDEMUpdate = computed(()=>{
      return store.getters.currentProjectInfo.DEM.state
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
            key:'DEM',
            fileType:fileType
          })
        }
      }
    }
    let fileDragover = function(e){
      e.preventDefault()
      e.stopPropagation()
    }

    onMounted(()=>{
      // 请求echarts数据，如果已存在，则直接绘图，不存在则返回
      window.ipcRenderer.send('requireEcharts','DEM')
      // 发送dem绘图数据请求

      // 导入成功后，再发送计算数据的请求
      window.ipcRenderer.on('DEMImported',function(err,arg){
        window.ipcRenderer.send('paintDEM',store.getters.currentProjectPath)
      })
      // 监听绘图事件
      window.ipcRenderer.on('DEMPaint',function(err,DEMObj){
        const {demArr,countArr} = DEMObj
        let myChart = echarts.init(document.querySelector(".echarts-dem"));
        window.onresize = function(){
          myChart.resize();
        };
        console.log(demArr);
        console.log(countArr);

        // 绘制图表
         myChart.setOption({
          title: {					         	
                text: "DEM分布情况",
                left: "center",
                textStyle: {
                  fontSize: 20
                },
                padding:[20,0,0,0]
                
            },

            xAxis: {
              type: 'category',
              data: demArr
            },
            yAxis: {},
            series : [
                {
                  name:'数量',
                  type: 'bar',  
                  data: countArr
                }
            ]
        })
      })
    })
    


    
    return{
      importDataByButton,
      fileDrop,
      fileDragover,
      isDEMUpdate,
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

.echarts-dem{
  height: 300px;
  margin: 50px 50px 0 50px;
  // border: 1px solid rgb(189, 189, 189);
}



</style>
