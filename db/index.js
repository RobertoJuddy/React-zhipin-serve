const mongoose = require('mongoose');


mongoose.connect('mongodb://localhost:27017/gzhipin', {useNewUrlParser:true});


mongoose.connection.once('open',err=>{

  if(!err){
    console.log('数据库连接成功')

  }else{

    console.log(err)
  }


});