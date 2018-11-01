const express = require('express');

const md5 = require('blueimp-md5');


const User = require('../models/users');

const Router = express.Router;


const router = new Router();

router.use(express.urlencoded({extended: true}));

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
router.post('/register', (req, res) => {
  const {username, password, type} = req.body;
  console.log(username, password, type);
  if (!username || !password || !type) {
    res.json({
      "code": 2,
      "msg": "输入不合法"
    });
    return;
  }
  User.findOne({username}, (err, data) => {
    if (!err) {
      if (data) {
        res.json({
          "code": 1,
          "msg": "此用户已存在"
        })
      } else {
        User.create({username, password: md5(password), type}, (err, data) => {
          if (!err) {
            res.json({
              code: 0,
              data: {
                _id: data.id,
                username: data.username,
                type: data.type
              }
            })
          } else {
            res.json({
              "code": 3,
              "msg": "网络不稳定，请刷新"
            })
          }
        })
      }
    } else {
      res.json({
        "code": 3,
        "msg": "网络不稳定，请刷新"
      })
    }
  })
});

module.exports = router;