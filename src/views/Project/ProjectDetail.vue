<template>

  <div  v-if="currentProjectName">
    <!-- 标题 -->
    <div class="title">
      目前项目: {{currentProjectName}}
    </div>
    <!-- 文件夹 -->
    <div class="dir" @click="openProjectFile(currentProjectPath)" >
        <img src="@/assets/file.svg" alt="" style="width:20px">
        {{currentProjectPath}}
    </div>
    <!-- 项目信息 -->
    
    <div class="project-info-title">
      项目信息
    </div>

    <div class="project-info">
      <div class="project-info-item sub-title">
        流域面积
      </div>
      <div class="project-info-item">
        123 ha
      </div>
      <div class="project-info-item sub-title">
        模拟期
      </div>
      <div class="project-info-item">
        2010-2020
      </div>
      <div class="project-info-item sub-title">
        软件版本
      </div>
      <div class="project-info-item">
        V 1.0
      </div>
      <div class="project-info-item sub-title">
        最近保存
      </div>
      <div class="project-info-item">
        1111
      </div>
    </div>

    <!-- 数据信息 -->
    <div class="data-info">
      <div class="data-info-title">数据信息</div>
      <div class="data-info-item" v-for="(item,index) in dataState" :key="index">
          <div v-if="item.state"><img style="width:20px;paddingRight:10px" src="@/assets/tick.svg" alt=""></div>
          <div v-else><img style="width:20px;paddingRight:10px" src="@/assets/cross.svg" alt=""></div>
          <div class="data-info-item-title" @click="toDataView(item.data)">{{item.data}}</div>
      </div>


    </div>

  </div>
  
  
</template>

<script>
import { useStore } from 'vuex'
import { computed } from '@vue/runtime-core'
import { useRoute, useRouter } from 'vue-router'


export default {
  name: 'ProjectDetail',
  components: {
  },

  setup(){
    const store = useStore()
    const route = useRoute()
    const router = useRouter()
    let currentProjectName = computed({
      get(){
          return store.state.currentProjectName
      }
    })

    let currentProjectPath = computed({
      get(){
          return store.getters.currentProjectPath
      }
    })

    let currentProjectInfo = computed({
      get(){
          return store.getters.currentProjectInfo
      }
    })

    // 数据的情况
    let dataState = computed({
      get(){
        return store.getters.dataState
      }
    })

    // 打开文件夹
    function openProjectFile(path){
      window.ipcRenderer.send('openProjectFile',path)
    }

    // 跳转到对应数据的页面
    function toDataView(data){
      if(data=='降雨数据'){
        router.push('/setup/weatherdata')
      }
    }
    
    return{
      currentProjectName,
      currentProjectInfo,
      currentProjectPath,
      openProjectFile,
      dataState,
      toDataView
    }
  }
}
</script>
<style scoped lang="less">
.title{
  margin: 20px;
  font-size: 20px;
  font-weight: 800;
}
.dir{
  padding: 3px 0;
  margin: 0 30px;
  height: 30px;
  background: rgb(248,249,250);
  border: 1px solid rgb(222,226,230);
  line-height: 30px;
  white-space: nowrap;
  font-family: "consolas";
  img{
    vertical-align: middle;
    padding: 0 12px;
  }
}
.dir:hover{
  cursor: pointer;
  background-color: rgb(226,230,234);
}

.project-info-title{
  text-align: center;
  margin-top: 20px;
  margin-bottom: 10px;
  font-weight: bold;
}

.project-info{
  margin: 0px 30px;
  display: flex;
  flex-wrap: wrap;
  font-size: 14px;
  .project-info-item{
    border-top: 1px solid rgb(222,226,230);
    border-bottom: 1px solid rgb(222,226,230);
    margin-top: -1px;
    width: 25%;
    padding: 5px 0;
  }
  .sub-title{
    font-weight: 600;
  }
}

.data-info{
  margin: 0 30px;
  margin-top: 50px;
  font-weight: bold;
  .data-info-title{
    margin-bottom: 10px;
  }


  .data-info-item{
    display: flex;
    padding: 5px 0;
    border-top: 1px solid rgb(222,226,230);
    border-bottom: 1px solid rgb(222,226,230);
    margin-top: -1px;
    .data-info-item-title{
      font-weight: 100;
      color: rgb(58,138,207);
    }
    .data-info-item-title:hover{
      text-decoration: underline;
      cursor: pointer;
    }
  }
}
</style>
