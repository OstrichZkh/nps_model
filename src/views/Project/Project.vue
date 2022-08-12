<template>
  <div class="container">
      <!-- 侧边栏 -->
      <div class="Siderbar">
        <Sidepanel></Sidepanel>
        <SubSideProject></SubSideProject>
      </div>
      <!-- 主页面 -->
      <div class="content-box">
        <ProjectDetail></ProjectDetail>
        <!-- <router-view></router-view> -->
      </div>
  </div>
</template>
<script>
// @ is an alias to /src
import Sidepanel from '@/components/Sidepanel'
import SubSideProject from '@/components/SubSideProject'
import { useRoute, useRouter } from 'vue-router'
import ProjectDetail from '@/views/Project/ProjectDetail.vue'


export default {
  name: 'Project',
  components: {
    Sidepanel,
    SubSideProject,
    ProjectDetail
  },

  setup(){

    return{
      
    }
  }
}
</script>
<style scoped lang="less">
.container{
  display: flex;
  .Siderbar{
    display: flex;
  }
  .content-box{
    flex: 1;
  }
}


</style>
