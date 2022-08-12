<template>
  <div class="sub-bar">
    <div class="title">KH-MODEL V1.0</div>
    <div class="helper" style="margin-bottom:10px"><a href="https://www.baidu.com" @click.prevent="toRepos">点击此处</a>跳转到git仓库</div>
    <div class="button">
      <el-button type="primary" class="openProj" @click="openProject">打开已有项目</el-button>
      <el-button type="success" class="newProj" @click="createProject">新建项目</el-button>
    </div>
    <div class="recent">
      <div class="projectTitle">最近打开项目</div>
      <div class="projectName" v-for="item in projectInfoRef" :key="item.projectName">
        <a href="" @click.prevent="toProjDetail(item.projectName)" class="item">{{item.projectName}}</a>
        <!-- <router-link :to="{path:'/projectdetail',query:{name:}}">{{item.projectName}}</router-link> -->
        <img class="delete" @click="deleteProject(item.projectName)" src="../assets/delete-unactive.svg" alt="">
      </div>
    </div>
  </div>
</template>

<script>
import { computed, defineComponent,reactive,ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'
export default defineComponent ({
  name:'SubSideProject',
  components:{},
  props:{},
  setup(props, ctx){
    const store = useStore()
    const router = useRouter()
    const route = useRoute()
    // 获取保存在store中的项目数据
    let projectInfoRef = computed(()=>{
      return store.state.projectInfo
    })
    // 新建项目
    function createProject(){
      window.ipcRenderer.send('createProject')
    }
    // 打开已有项目
    function openProject(){
      window.ipcRenderer.send('openProject')
    }

    // 跳转到github仓库
    function toRepos(){
      window.open('https://www.baidu.com')
    }

    // 路由跳转到当前项目信息
    function toProjDetail(projectName){
      // router.push('/project/projectdetail')
      store.commit('switchProject',projectName)
      window.ipcRenderer.send('switchProject',{
        projectName:projectName,
        projectPath:store.getters.currentProjectPath
      })
    }

    // 删除项目
    function deleteProject(projectName){
      window.ipcRenderer.send('deleteProject',projectName)

    }

    return {
      toRepos,
      createProject,
      projectInfoRef,
      openProject,
      toProjDetail,
      deleteProject
    }
  },
})
</script>

<style scoped lang="less">
.sub-bar {
  width: 200px;
  background-color: rgb(244,245,247);

  .el-button{
    width: 170px;
    margin: 5px 15px;
  }
  .projectTitle{
    font-size: 15px;
    padding: 10px 0 5px 10px;
    color: rgb(133,153,175);
    font-weight: 1000;
  }
  .projectName{
    font-size: 14px;
    padding: 12px;
    margin: 0 5px;
    border-top: 1px dashed rgb(222,226,230);
  }

  .delete{
    display: inline-block;
    width: 20px;
    vertical-align:middle;
    float: right;
  }
  .delete:hover{
    content: url("../assets/delete-actived.svg");
    cursor: pointer;
  }
  
  .item{
    text-align: center;
    text-decoration: none;
    color: rgb(42,128,202);
  }
  .item:hover{
    color:rgb(16,75,126);
  }
}
.title {
  font-size: 20px;
  font-weight: 600;
  text-align: center;
  margin: 10px auto;
}
.helper{
  text-align: center;
  a {
  color:rgb(25,118,199);
  text-decoration: none;
}
}


</style>