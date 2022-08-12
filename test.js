async function sleep(light,time){

  console.log(light)
  await new Promise((resolve,reject)=>{
      setTimeout(resolve,time)
  })
  
//   console.log('绿灯')
//   await new Promise((resolve,reject)=>{
//       setTimeout(resolve,2000)
//   })
//   console.log('黄灯')
//   await new Promise((resolve,reject)=>{
//     setTimeout(resolve,1000)
// })
}

// sleep()
async function a(){
  while(true){
    await sleep('红灯',1000)
    await sleep('绿灯',1000)
    await sleep('黄灯',1000)
  }
}
a()


