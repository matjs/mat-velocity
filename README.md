# mat-velocity

[![npm version](https://badge.fury.io/js/mat-velocity.svg)](http://badge.fury.io/js/mat-velocity)

提供velocity模板的渲染功能


## Installation

```sh
npm install --save mat-velocity
```

## Usage

```javascript
var mat  = require('mat')
var velocity = require('mat-velocity')
var rewrite = require('mat-rewrite')

mat.task('daily', function () {
  mat.url([/\.vm/])
    .use(velocity({
    }))
})
```

## api

用来处理vm的渲染。
默认情况下 请求 b.vm 会使用 b.js返回的变量来渲染vm。
可以使用b.vm?ds=c.js来指定不同的数据源

* config.viewLocation  vm模板的目录，默认是当前根目录。
* config.dataLocation  vm模板对应的渲染变量文件的目录，默认是当前根目录。
* config.macros        全局的宏定义。在vm中使用  #xxx()  来使用。
* config.dataInject    用于对返回的变量进行统一处理。这样可以注入一些全局统一的变量或者方法，支持返回promise对象处理异步。return的值如果不为空，就会整个替换（同理promise的情况下，就是resolve的值不为空）。
