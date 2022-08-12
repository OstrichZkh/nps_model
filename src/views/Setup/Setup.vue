<template>
  <div class="container">
    <!-- 侧边栏 -->
     <div class="Siderbar">
        <Sidepanel></Sidepanel>
        <SubSidepanel></SubSidepanel>
    </div>
    <!-- 主页面 -->
    <div class="content-box" >
      <router-view></router-view>
    </div>
  </div>
</template>

<script>
// @ is an alias to /src
import SubSidepanel from '@/components/SubSidepanel.vue'
import Sidepanel from '@/components/Sidepanel.vue'
export default {
  name: 'Setup',
  components: {
    Sidepanel,
    SubSidepanel
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

  .content-box{
    flex: 1;
  }
  .Siderbar{
    display: flex;
  }
}


</style>
