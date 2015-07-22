var _ = require('lodash')
var fs = require('fs')
var Stream = require('stream')
var path = require('path')
var velocity = require('velocityjs');

var resolve = path.resolve
var join = path.join


var __CONFIG = {
  viewLocation: './',
  dataLocation: './',
  defaultLayout: 'layout/default_layout.vm',
  macros:{
    parse: function (file) {
      var viewPath = path.join(__CONFIG.viewLocation, file)
      var template = fs.readFileSync(viewPath).toString()
      return this.eval(template)
    }
  },
  dataInject:function(data){
    //需要被重写
  }
}

var LAYOUT_REG = /set[\s]*\([\s]*\$layout[\s]*=[\s]*"([^"]*)"\)[\s]*/


var fetchTmpl = function(viewPath) {
  viewPath = resolve(__CONFIG.viewLocation,'./'+viewPath)
  return fs.readFileSync(viewPath).toString()
}

var fetchData = function(dataSource) {

  if (!dataSource) return

  dataSource = resolve(__CONFIG.dataLocation,'./'+dataSource)
  function fetch(callback) {

    var filePath = dataSource

    if (!fs.existsSync(filePath)) {
      callback(null,{})
    }

    try {
      callback(null,require(filePath))
    } catch (e) {
      callback(e)
    }
  }

  return fetch
}

var parseLayout = function(template){

  var layoutPath = __CONFIG.defaultLayout
  var m = template.match(LAYOUT_REG)

  if (m) {
    layoutPath = m[1]
  }
  if (layoutPath) {
    template = fetchTmpl(layoutPath).replace('$screen_content',template)
  }

  return template
}

function cobody(stream) {
  return function(cb){
    var buffers = []
    stream.on('data', function(chunk){
      buffers.push(chunk)
    })
    stream.on('end', function(){
      cb(null, Buffer.concat(buffers).toString('utf-8'))
    })
  }
}

module.exports = function(config){

  __CONFIG = _.defaultsDeep(config,__CONFIG)

  return function *(next){
    //this.path = join(__CONFIG.viewLocation,this.path)

    //yield next

    var ctx = this
    var data = yield fetchData((this.query.ds || ctx.path.split('.')[0]+'.js'))
    var template = fetchTmpl(this.path)

    //对于stream进行转换
    // if (template instanceof Stream) {
    //   template = yield cobody(template)
    // }else{
    //   template = template.toString()
    // }
    //解析layout，默认的vm里面是没有layout功能的
    template = parseLayout(template)

    //提供统一的数据注入方法
    __CONFIG.dataInject(data)

    ctx.body = velocity.render(template, data, __CONFIG.macros)
    ctx.type = 'text/html'
  }
}