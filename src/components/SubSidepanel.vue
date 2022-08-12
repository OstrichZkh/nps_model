<template>
  <div class="sub-sider-panel">
    <el-col :span="12">
      <el-menu
        active-text-color="#ffd04b"
        background-color="#C9CED8"
        class="el-menu-vertical-demo"
        default-active="2"
        text-color="#000"
        @open="handleOpen"
        @close="handleClose"
      >
        <el-sub-menu index="1">
          <template #title>
            <el-icon><location /></el-icon>
            <span style="fontWeight:800">数据准备</span>
          </template>
            <router-link  to="/setup/weathergenerator" class="tags-li-title">
              <el-menu-item el-menu-item index="1-1" :class="[isActive=='1-1'?'active':'']"  @click="active('1-1')">模拟期选择</el-menu-item>
            </router-link>

            <router-link  to="/setup/weatherdata" class="tags-li-title">
              <el-menu-item index="1-2"  :class="[isActive=='1-2'?'active':'']"  @click="active('1-2')">降雨数据</el-menu-item>
            </router-link>
            
            
            <router-link  to="/setup/landusedata" class="tags-li-title">
              <el-menu-item index="1-3"  :class="[isActive=='1-3'?'active':'']"  @click="active('1-3')">土地利用</el-menu-item>
            </router-link>

            <router-link  to="/setup/soiltypedata" class="tags-li-title">
              <el-menu-item index="1-4"  :class="[isActive=='1-4'?'active':'']"  @click="active('1-4')">土壤类型</el-menu-item>
            </router-link>
            
            <router-link  to="/setup/demdata" class="tags-li-title">
              <el-menu-item index="1-5"  :class="[isActive=='1-5'?'active':'']"  @click="active('1-5')">数字高程模型</el-menu-item>
            </router-link>

            <router-link  to="/setup/rusledata" class="tags-li-title">
              <el-menu-item index="1-6"  :class="[isActive=='1-6'?'active':'']"  @click="active('1-6')">RUSLE数据</el-menu-item>
            </router-link>
        </el-sub-menu>
      <!-- RUSLE -->
        <el-sub-menu index="2">
          <template #title>
            <el-icon><location /></el-icon>
            <span style="fontWeight:800">水土流失计算</span>
          </template>
            <router-link  to="/setup/weathergenerator" class="tags-li-title">
              <el-menu-item el-menu-item index="2-1" :class="[isActive=='2-1'?'active':'']"  @click="active('2-1')">K因子</el-menu-item>
            </router-link>

            <router-link  to="/setup/weatherdata" class="tags-li-title">
              <el-menu-item index="2-2"  :class="[isActive=='2-2'?'active':'']"  @click="active('2-2')">C因子</el-menu-item>
            </router-link>
            
            
            <router-link  to="/setup/landusedata" class="tags-li-title">
              <el-menu-item index="2-3"  :class="[isActive=='2-3'?'active':'']"  @click="active('2-3')">L因子</el-menu-item>
            </router-link>

            <router-link  to="/setup/soiltypedata" class="tags-li-title">
              <el-menu-item index="2-4"  :class="[isActive=='2-4'?'active':'']"  @click="active('2-4')">S因子</el-menu-item>
            </router-link>
            
            <router-link  to="/setup/demdata" class="tags-li-title">
              <el-menu-item index="2-5"  :class="[isActive=='2-5'?'active':'']"  @click="active('2-5')">R因子</el-menu-item>
            </router-link>
        </el-sub-menu>
      <!-- 污染计算 -->
        <el-sub-menu index="3">
          <template #title>
            <el-icon><location /></el-icon>
            <span style="fontWeight:800">面源磷模拟</span>
          </template>
            <router-link  to="/setup/weathergenerator" class="tags-li-title">
              <el-menu-item el-menu-item index="3-1" :class="[isActive=='3-1'?'active':'']"  @click="active('3-1')">模型参数设置</el-menu-item>
            </router-link>

            <router-link  to="/setup/weatherdata" class="tags-li-title">
              <el-menu-item index="3-2"  :class="[isActive=='3-2'?'active':'']"  @click="active('3-2')">率定设置</el-menu-item>
            </router-link>
            
            
            <router-link  to="/setup/landusedata" class="tags-li-title">
              <el-menu-item index="3-3"  :class="[isActive=='3-3'?'active':'']"  @click="active('3-3')">模型运行</el-menu-item>
            </router-link>

            <router-link  to="/setup/soiltypedata" class="tags-li-title">
              <el-menu-item index="3-4"  :class="[isActive=='3-4'?'active':'']"  @click="active('3-4')"></el-menu-item>
            </router-link>
            
            <router-link  to="/setup/demdata" class="tags-li-title">
              <el-menu-item index="3-5"  :class="[isActive=='3-5'?'active':'']"  @click="active('3-5')"></el-menu-item>
            </router-link>
        </el-sub-menu>


        <!-- <el-sub-menu index="2">
          <template #title>
            <el-icon><location /></el-icon>
            <span>流域数据</span>
          </template>
            <el-menu-item index="2-1"  :class="[isActive=='2-1'?'active':'']"  @click="active('2-1')">
              <router-link  to="/setup/weatherdata" class="tags-li-title">xxx</router-link>
            </el-menu-item>
            <el-menu-item index="2-2"  :class="[isActive=='2-2'?'active':'']"  @click="active('2-2')">
              <router-link  to="/setup/weatherdata" class="tags-li-title">xxx</router-link>
            </el-menu-item>
        </el-sub-menu> -->


      </el-menu>
    </el-col>


  </div>
  <!-- <div class="bottom"></div> -->
  
</template>

<script>
import { defineComponent,onMounted,ref } from 'vue'
export default defineComponent ({
  name:'SubSidepanel',
  components:{},
  props:{},
  setup(props, ctx){
    let isActive = ref(null)
    let active = function(index){
      isActive.value = index
    }
    return {
      isActive,
      active
    }
  },
})
</script>

<style scoped>

.sub-sider-panel{
  width: 200px;
  background-color:rgb(244,245,247);
}

.el-menu-vertical-demo:not(.el-menu--collapse) {
  width: 100%;
  /* min-height: 0px; */
  
}
.el-sub-menu{
  width: 200px;
}



.el-menu-item{
  background: rgb(244,245,247);
}
.el-menu-item:hover{
  background: rgb(209,233,255);
}

.active{
  background: rgb(209,233,255);
  font-weight: bold;
  color: black;
}
.el-col{
  width: 100%;
  height: 100%;
}
span{
  position: relative;
  left: -25px;
  font-size: 18px;
}
.tags-li-title{
  color: #000000;
  text-decoration-line: none;
}

.bottom {
  width: 200px;
  position: relative;
  left: 0;
  top: 0;
  z-index: -1;
}
</style>