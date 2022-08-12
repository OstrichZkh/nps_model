<template>
<div class="container">
    <h1 style="padding-bottom:10px">C因子</h1>
    <div style="border:1px solid #CCC"></div>  
    <!-- 文件拖入此处 -->
    <div class="file">
      <div class="inner" @drop="fileDrop('C_factor',$event)" @dragover="fileDragover">
        
        <div v-if="!isCUpdate">请将文件拖入此处</div>
        <div v-else><img src="@/assets/C_factor.svg" style="width:30px;vertical-align:middle;margin:0 5px 5px 0"> C因子已导入</div>
        
      </div>
    </div>
    <!-- 导入数据的按钮 -->
    <div class="button">
      <el-button type="primary" @click="importDataByButton('C_factor')">导入数据</el-button>
    </div>
</div>


<div class="container">
    <h1 style="padding-bottom:10px">L因子</h1>
    <div style="border:1px solid #CCC"></div>  
    <!-- 文件拖入此处 -->
    <div class="file">
      <div class="inner" @drop="fileDrop('L_factor',$event)" @dragover="fileDragover">
        
        <div v-if="!isLUpdate">请将文件拖入此处</div>
        <div v-else><img src="@/assets/L_factor.svg" style="width:30px;vertical-align:middle;margin:0 5px 5px 0"> L因子已导入</div>
        
      </div>
    </div>
    <!-- 导入数据的按钮 -->
    <div class="button">
      <el-button type="primary" @click="importDataByButton('L_factor')">导入数据</el-button>
    </div>
</div>


<div class="container">
    <h1 style="padding-bottom:10px">S因子</h1>
    <div style="border:1px solid #CCC"></div>  
    <!-- 文件拖入此处 -->
    <div class="file">
      <div class="inner" @drop="fileDrop('S_factor',$event)" @dragover="fileDragover">
        <div v-if="!isSUpdate">请将文件拖入此处</div>
        <div v-else><img src="@/assets/S_factor.svg" style="width:30px;vertical-align:middle;margin:0 5px 5px 0"> S因子已导入</div>
      </div>
    </div>
    <!-- 导入数据的按钮 -->
    <div class="button">
      <el-button type="primary" @click="importDataByButton('S_factor')">导入数据</el-button>
    </div>
</div>
</template>



<script>
import { computed } from '@vue/runtime-core'
import { useStore } from 'vuex'


export default {
  name: 'RusleDataView',
  components: {
  },
  setup(){
    const store = useStore()
    // 几个因子是否导入？
    let isCUpdate = computed(()=>{
      return store.getters.currentProjectInfo.rusle.C_factor
    })
    let isLUpdate = computed(()=>{
      return store.getters.currentProjectInfo.rusle.L_factor
    })
    let isSUpdate = computed(()=>{
      return store.getters.currentProjectInfo.rusle.S_factor
    })

    // 向主进程发送降雨数据的保存位置
    const importDataByButton = function(factor){
      window.ipcRenderer.send('importDataByButton',factor)
    }

    
    // 拖拽事件，传入类型的参数
    let fileDrop = function(factor,e){
      for(let file of e.dataTransfer.files){
        let fileType = file.name.split('.')[1]
        if(fileType !='tif'){
          alert('请输入tif文件！')
        }else{
          window.ipcRenderer.send('importDataByDrop',{
            projectName:store.state.currentProjectName,
            path:file.path,
            key:factor,
            fileType:fileType
          })
        }
      }
    }
    let fileDragover = function(e){
      e.preventDefault()
      e.stopPropagation()
    }


    return{
      isCUpdate,
      isLUpdate,
      isSUpdate,
      importDataByButton,
      fileDrop,
      fileDragover
    }
  }
}
</script>
<style scoped lang="less">

.container{
  display: flex;
  flex-direction: column;
  margin-bottom: 40px;
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
</style>
