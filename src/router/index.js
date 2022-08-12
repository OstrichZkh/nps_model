import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path:'/',
    redirect:'/project',
  },
  {
    path: '/project',
    name: 'Project',
    component: ()=>import('@/views/Project/Project.vue'),
    children:[
      {
        path:'projectdetail',
        name:'ProjectDetail',
        component:()=>import('@/views/Project/ProjectDetail.vue')
      }
    ]
  },{
    path:'/setup',
    name:'Setup',
    component:()=>import('@/views/Setup/Setup.vue'),
    beforeEnter: (to, from, next) => {
      // 是否切换了项目？
      if(to.query.projectName){
        next()
      }
    },
    children:[
      {
        path:'weatherdata',
        name:'WeatherDataView',
        component:()=>import('@/views/Setup/WeatherDataView.vue')
      },
      {
        path:'weathergenerator',
        name:'WeatherGeneratorView',
        component:()=>import('@/views/Setup/WeatherGeneratorView.vue')
      },
      {
        path:'demdata',
        name:'DemDataView',
        component:()=>import('@/views/Setup/DemDataView.vue')
      },
      {
        path:'landusedata',
        name:'LandUseDataView',
        component:()=>import('@/views/Setup/LandUseDataView.vue')
      },
      {
        path:'soiltypedata',
        name:'SoilTypeDataView',
        component:()=>import('@/views/Setup/SoilTypeDataView.vue')
      },  
      {
        path:'rusledata',
        name:'RusleDataView',
        component:()=>import('@/views/Setup/RusleDataView.vue')
      },    
    ]
    
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
