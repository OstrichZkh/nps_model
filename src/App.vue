<template>
    <router-view/>
</template>

<script>
import { onMounted } from '@vue/runtime-core';
import { useStore } from 'vuex';

export default {

  setup(){
    // onMounted(()=>{
    //     let dom = document.querySelector('.respond')
    //     let height = document.documentElement.clientHeight + 'px'
    //     dom.style.height = height
    //     window.onresize = function(){
    //       let height = document.documentElement.clientHeight + 'px'
    //       dom.style.height = height
    //     }
    // })


    const store = useStore()
    // 请求所有的项目信息
    window.ipcRenderer.send('requireProjectInfo')
    // 从主线程返回所有的项目信息，添加到store中
    window.ipcRenderer.on('sendProjectInfo',function(err,projectInfo){
      store.commit('addProjectInfo',projectInfo)
    })


    // 监听修改项目的回调，修改目前的项目名称和项目信息
    window.ipcRenderer.on('switchProject',function(err,projectName){
      // 接收到更改后的项目路径和名称
      store.commit('switchProject',projectName)

    })


    // 降雨文件成功导入项目文件夹
    // window.ipcRenderer.on('rainfallImported',(e,msg)=>{
    //   store.commit('changeState',{
    //     property:'isRainfallUpdate',
    //     boolean:true
    //   })

    //   isRainfallUpdate.value = store.state.isRainfallUpdate
    // })
  
  }
}

</script>
<style lang="scss">
*{
  padding: 0;
  margin: 0;
  font-family: 'Times New Roman', Times, serif;

}
</style>
