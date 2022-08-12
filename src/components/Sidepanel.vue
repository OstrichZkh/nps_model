<template>
  <div class="container">
    <div class="respond">
      <router-link :to="{path:'/'}"  :class="[isActive=='file'?'active':'']"><img class="file" 
       @click="active('file')"></router-link>
      <router-link :to="{path:'/setup',query:{projectName:currentProjectName}}" :class="[isActive=='setup'?'active':'']"><img class="setup" 
       @click="active('setup')"></router-link>
    </div>
  </div>
</template>

<script>
import { defineComponent,ref,onMounted, computed } from 'vue'
import { useStore } from 'vuex'
export default defineComponent ({
  name:'Sidepanel',
  components:{},
  props:{},
  setup(props, ctx){
      const store = useStore()
      onMounted(()=>{
        let dom = document.querySelector('.respond')
        let height = document.documentElement.clientHeight + 'px'
        dom.style.height = height
        window.onresize = function(){
          let height = document.documentElement.clientHeight + 'px'
          dom.style.height = height
        }
      })

      
      let isActive = computed(()=>{
        return store.state.siderPanelActived
      })
      let currentProjectName = computed(()=>{
        return store.state.currentProjectName
      })
      function active(name){
        store.commit('changeSiderPanelActived',name)
      }
    return {
      isActive,
      active,
      currentProjectName
    }
  },
})
</script>

<style scoped>
.container{
  width: 60px;
  background-color: rgb(18,60,105);
  color: white;
  display: flex;
  flex-direction: column;
  /* height: 2000px; */
}

.file{
  width: 40px;
  height: 40px;
  margin: 10px;
  content: url('../assets/file-unactive.svg');
}


.file:hover{
  content: url('../assets/file-actived.svg');
  cursor: pointer;
}

.setup{
  width: 40px;
  height: 40px;
  margin: 10px;
  content: url('../assets/setup-unactive.svg');
}
.setup:hover{
  content: url('../assets/setup-actived.svg');
  cursor: pointer;
}


.active .file{
  content: url('../assets/file-actived.svg');
}

.active .setup{
  content: url('../assets/setup-actived.svg');
}

</style>