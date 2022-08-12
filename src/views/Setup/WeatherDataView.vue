<template>
  <div class="container">
    <h1 style="padding-bottom:10px">降雨数据</h1>
    <div style="border:1px solid #CCC"></div>  
    
    <!-- 文件拖入此处 -->
    <div class="file">
      <div class="inner" @drop="fileDrop" @dragover="fileDragover">
        
        <div v-if="!isRainfallUpdate">请将文件拖入此处</div>
        <div v-else><img src="@/assets/rainfall.svg" style="width:30px;vertical-align:middle;margin:0 5px 5px 0">  降雨数据已导入</div>
        
      </div>
    </div>
    <!-- 导入数据的按钮 -->
    <div class="button">
      <el-button type="primary" @click="importDataByButton">导入数据</el-button>
      <!-- <el-button type="primary" @click="paintRainfall">绘制降雨图</el-button> -->
    </div>
    <!-- 降雨图 -->
    <div class="echarts-rainfall"></div>
  </div>
</template>


<script>
import { ref } from '@vue/reactivity'
import { useStore } from 'vuex'
import {  computed, watchEffect,watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import * as echarts from 'echarts'
// import { ipcRenderer } from 'electron'
// import '../font/iconfont.css'

export default {
  name: 'WeatherDataView',
  components: {
  },
  setup(){
    const store = useStore()
    // 向主进程发送降雨数据的保存位置
    const importDataByButton = function(){
      window.ipcRenderer.send('importDataByButton','rainfall')
      window.ipcRenderer.send('paintRainfall',store.getters.currentProjectPath)
    }
    // 降雨数据是否放入？
    let isRainfallUpdate = computed(()=>{
      return store.getters.currentProjectInfo.rainfall.state
    })
    
    // 拖拽事件
    let fileDrop = function(e){
      for(let file of e.dataTransfer.files){
        let fileType = file.name.split('.')[1]
        if(fileType !='txt'){
          alert('请输入txt文件！')
        }else{
          window.ipcRenderer.send('importDataByDrop',{
            projectName:store.state.currentProjectName,
            path:file.path,
            key:'rainfall',
            fileType:fileType
          })
        }
      }
      setTimeout(()=>{
        window.ipcRenderer.send('paintRainfall',store.getters.currentProjectPath)
      },400)
    }
    let fileDragover = function(e){
      e.preventDefault()
      e.stopPropagation()
    }
    


    // 页面加载前，进行绘图
    onMounted(()=>{
      window.ipcRenderer.send('requireEcharts','rainfall')
    })

    // 绘制降雨图
    // let paintRainfall = function(){
    //   window.ipcRenderer.send('paintRainfall',store.getters.currentProjectPath)
    // }

    // 监听主线程数据计算成功的事件
    window.ipcRenderer.on('rainfallPaint',function(err,rainfallData){
      const {rainfall,date} = rainfallData
      let myChart = echarts.init(document.querySelector(".echarts-rainfall"));
      window.onresize = function(){
        myChart.resize();
      };
      // 绘制图表
      myChart.setOption({
        title: { text: "降雨量" },
        tooltip: {},
        xAxis: {
          data: date,
        },
        yAxis: {},
        series: [
          {
            name: "降雨量",
            type: "line",
            data: rainfall,
          },
        ],
      });
      window.onresize = function () {//自适应大小
        myChart.resize();
      };
    })

    // onMounted(() => {//需要获取到element,所以是onMounted的Hook
    //   let myChart = echarts.init(document.querySelector(".echarts-rainfall"));
    //   window.onresize = function(){
    //     myChart.resize();
    //   };
    //   // 绘制图表
    //   myChart.setOption({
    //     title: { text: "总用户量" },
    //     tooltip: {},
    //     xAxis: {
    //       data: ["12-3", "12-4", "12-5", "12-6", "12-7", "12-8"],
    //     },
    //     yAxis: {},
    //     series: [
    //       {
    //         name: "用户量",
    //         type: "line",
    //         data: [5, 20, 36, 10, 10, 20],
    //       },
    //     ],
    //   });
    //   window.onresize = function () {//自适应大小
    //     myChart.resize();
    //   };
    // });
  

    // let myChart = echarts.init(document.querySelector('.echarts-rainfall'));
    
    
    return{
      importDataByButton,
      fileDrop,
      fileDragover,
      isRainfallUpdate,
      // paintRainfall,
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

.echarts-rainfall{
  height: 300px;
  margin: 50px 50px 0 50px;
  border: 1px solid black;
}



</style>
