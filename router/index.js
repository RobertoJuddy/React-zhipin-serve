const express = require('express');

const md5 = require('blueimp-md5');

const cookieParser = require('cookie-parser');
const User = require('../models/users');

const Router = express.Router;


const router = new Router();

router.use(express.urlencoded({extended: true}));

router.use(cookieParser());

//登录页面
router.post('/login', async (req, res) => {
  const {username, password} = req.body;
  if (!username || !password) {
    res.json({
      "code": 2,
      "msg": "输入不合法"
    });
    return;
  }

  try {
    const data = await User.findOne({username, password: md5(password)});
    if (data) {
      res.cookie('userid', data.id, {maxAge: 1000 * 3600 * 24 * 7});
      res.json({
        "code": 0,
        "data": {
          "_id": data.id,
          "username": data.username,
          "type": data.type,
        }
      })
    } else {
      res.json({
        "code": 1,
        "msg": "用户名或密码错误"
      })
    }
  } catch (e) {
    res.json({
      "code": 3,
      "msg": "网络不稳定，请刷新"
    })
  }
});


//注册页面
router.post('/register', async (req, res) => {
  const {username, password, type} = req.body;
  console.log(username, password, type);
  if (!username || !password || !type) {
    res.json({
      "code": 2,
      "msg": "输入不合法"
    });
    return;
  }
  try {
    const data = await User.findOne({username});

    if (data) {
      //返回错误
      res.json({
        "code": 1,
        "msg": "用户名已存在"
      });
    } else {
      const data = await User.create({username, password: md5(password), type});
      //返回成功的响应
      res.cookie('userid', data.id, {maxAge: 1000 * 3600 * 24 * 7});
      res.json({
        code: 0,
        data: {
          _id: data.id,
          username: data.username,
          type: data.type
        }
      })
    }
  } catch (e) {
    //说明findOne / create方法出错了
    //返回失败的响应
    res.json({
      "code": 3,
      "msg": "网络不稳定，请重新试试~"
    })
  }

})



// 更新用户信息的路由
router.post('/update', (req, res) => {
  // 从请求的cookie得到userid
  const userid = req.cookies.userid;
  // 如果不存在, 直接返回一个提示信息
  if (!userid) {
    return res.json({code: 1, msg: '请先登陆'});
  }
  // 存在, 根据userid更新对应的user文档数据
  // 得到提交的用户数据
  const user = req.body // 没有_id
  User.findByIdAndUpdate({_id: userid}, user)
    .then(oldUser => {
      if (!oldUser) {
        //更新数据失败
        // 通知浏览器删除userid cookie
        res.clearCookie('userid');
        // 返回返回一个提示信息
        res.json({code: 1, msg: '请先登陆'});
      } else {
        //更新数据成功
        // 准备一个返回的user数据对象
        const {_id, username, type} = oldUser;
        //此对象有所有的数据
        const data = Object.assign({_id, username, type}, user)
        // 返回成功的响应
        res.json({code: 0, data})
      }
    })
    .catch(error => {
      // console.error('登陆异常', error)
      res.send({code: 3, msg: '网络不稳定，请重新试试~'})
    })
})

//暴露出去
module.exports = router;

