<template>
<div class="container">
    <h1 style="padding-bottom:10px">请选择项目的时间范围</h1>
    <div style="border:1px solid #CCC"></div> 
    <!-- 选择时间 -->
    <div class="date">
      <el-date-picker
        v-model="date"
        type="monthrange"
        range-separator="至"
        unlink-panels
        start-placeholder="起始时间"
        end-placeholder="结束时间"
        :size="size"
      />



    </div>
    <el-button type="primary" @click="changeDate">确定</el-button>

</div>
    
</template>

<script>
import { reactive, ref } from '@vue/reactivity'
import { onMounted, watch } from 'vue'

export default {
  name: 'WeatherGeneratorView',
  components: {
  },
  setup(){
    let date = ref('')

    function changeDate(){
      let endDate = date.value[1]
      let newEndDate = new Date(endDate.getFullYear(),endDate.getMonth()+1,endDate.getDate())
      let monthDay = parseInt((newEndDate-endDate)/(86400000))
      let startYear = date.value[0].getFullYear()
      let startMonth = date.value[0].getMonth()+1
      let startDay = date.value[0].getDate()
      let endYear = date.value[1].getFullYear()
      let endMonth = date.value[1].getMonth()+1
      let endDay = date.value[1].getDate()
      let dateObj = {
        startDate:startYear+'-'+startMonth+'-'+startDay,
        endDate:endYear+'-'+endMonth+'-'+monthDay,
      }
      alert('项目日期设置成功！')
      window.ipcRenderer.send('changeDate',dateObj)
    }

    // 持久化日期
    onMounted(()=>{

      window.ipcRenderer.send('requireDate')
      window.ipcRenderer.on('getDate',function(err,payload){
        const {startDate,endDate} = payload
        let startYear = startDate.split('-')[0]
        let startMonth = startDate.split('-')[1]
        let startDay = startDate.split('-')[2]
        let startD = new Date(startYear,startMonth,startDay)
        let endYear = endDate.split('-')[0]
        let endMonth = endDate.split('-')[1]
        let endDay = 1
        let endD = new Date(endYear,endMonth,endDay)
        date.value = [startD,endD]
      })

    })
    

    return {
      date,
      changeDate
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



  .date{
    float: left;
    position: relative;
    left: 50px;
    width: 120px;
    padding: 15px 0;
    
  }

  .el-button{
    position: relative;
    left: 50px;
    width: 120px;
    float: left;
  }


}
</style>
