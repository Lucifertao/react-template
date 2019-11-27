### 1.什么是webpack

一种js的模块打包器，讲我们的源代码转换成线上可执行的js，css，html，webpack的基本功能如下

+ 代码转换：通过module，讲浏览器不识别的ts，scss，less，等转换成js和css
+ 代码分割：通过提取多个页面的公共代码，库代码，缩小文件的体积，最大化利用浏览器缓存机制，同时可以提取首屏不需要的代码进行异步加载，以及vue，react等库的路由懒加载功能
+ 文件优化：压缩js，html，css，图片转base64，减小请求大小，以及请求次数，优化网络请求
+ 模块合并：在现代化的项目中，也就是react，vue，angular等项目中，因为采用的是单文件组件开发的形式，因此需要webpack讲项目里引用的多个模块化文件合并成一个文件
+ 热加载：监听本地代码的变化，自动构建并刷新浏览器
+ 自动发布（高级）：更新完代码后，自动构建出线上发布代码并且传输给发布系统



### 2.基本概念

+ entry：入口

+ output：输出

+ module：{}，模块， 定义文件转换规则，webpack会从入口开始递归找出所有依赖的模块，然后根据对应的规则，去使用相应的loader进行文件转换，以便浏览器识别

+ plugins：[] 插件机制（事件流 tapable），在打包的某些时刻去执行某些特定的动作行文

+ devServer：开发服务器相关

+ chunk：代码块，一个chunk可以由多个模块组成，一般用来代码合并和分割

  ```js
  module.export = {
      entry: './src/index.js',
      output: {
          path: path.resolve(__dirname, './dist'), // path只能是绝对路径,否则会报错 The output directory as **absolute path** (required).
          filename: "bundle.js" // 打包输出的文件名称
      },
      module:{},
      plugins:[]
  }
  ```

  

### 3.module的使用

### 4.devServer使用

devServer输出：

| Asset资源名称） | Size（资源大小） | Chunks（代码块） | Chunk Names        |
| --------------- | ---------------- | ---------------- | ------------------ |
| bundle.js       | 373 KiB          | main[emitted]    | main（代码块名称） |

Entrypoint main = bundle.js	默认代码块chunk是main

### 5.常用webpack优化

```js
    resolve: {
        alias: {
            // 优化3 配置别名那么在任何环境下都是使用线上环境代码
            'react': path.resolve(require.resolve('react'), '../', './cjs/react.production.min.js'),
            'react-dom': path.resolve(require.resolve('react-dom'), '../', './cjs/react-dom.production.min.js'),
        },
        extensions: ['.js', '.jsx'],
        mainFields: ['main', 'node', 'browser'], // 优化2:配置默认的入口文件，经常用作当加载的模块是包的时候
        // 优化1当引入模块的时候要进行解析,可以是node_modules，也可以是自定义的模块目录，缩小文件搜索范围
        modules: [path.resolve(__dirname, 'node_modules')]
    },
     module: {
        // 优化4不需要递归去解析此模块，因为已经是编译压缩过的了
        noParse: [/react\.production\.min\.js/],
  	}
        
   	优化5：DLL动态链接库
    把基础模块独立出来打包，当需要导入的模块在dll中的时候，模块不会再次打包，而是直接从已经打包好的dll中获取即可

```

###     优化6：HappyPack

```
npm install --save-dev happypack
```

###  优化7：多进程压缩js文件

### 优化8:  区分环境

### 优化9：模块热更新

```js
devServer.hot = true
```

### 优化10：tree-shaking

### 优化11：代码提取

1. 基础类库方便长期缓存
2. 页面之间的公用代码
3. 各个页面之间单独生成文件

### 优化12：开启Scope Hoisting

> ​	打包体积更小，运行更快（作用域提升）

+ 函数声明会减少，因此对应的内存开销也会减小

```js
/******/ 未开启分析 首先打包后的文件是一个闭包(require函数执行访问入口文件)(所有以来模块的 key：value集合) key是文件路径，value是对应的文件模块的导出值，因此在递归调用的时候bundle的各个模块都单独的是一个闭包空间，无形中会产生很多函数作用于增加内存消耗
(function (modules) { // webpackBootstrap
    /******/ 	// The module cache
    /******/
    var installedModules = {};
    /******/
    /******/ 	// The require function
    /******/
    function __webpack_require__(moduleId) {
        /******/
        /******/ 		// Check if module is in cache
        /******/
        if (installedModules[moduleId]) {
            /******/
            return installedModules[moduleId].exports;
            /******/
        }
        /******/ 		// Create a new module (and put it into the cache)
        /******/
        var module = installedModules[moduleId] = {
            /******/            i: moduleId,
            /******/            l: false,
            /******/            exports: {}
            /******/
        };
        /******/
        /******/ 		// Execute the module function
        /******/
        modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
        /******/
        /******/ 		// Flag the module as loaded
        /******/
        module.l = true;
        /******/
        /******/ 		// Return the exports of the module
        /******/
        return module.exports;
        /******/
    }
    First ：这里返回调用加载index的内容，__webpack_require__内部在执行次key对应的value的时候会由传入__webpack_require__，用来进行递归调用         __webpack_require__(/*! ./base */ "./src/base.js")，这样的话index本身的空间就会作为一个闭包，由于base没有得到释放今儿产生内存消耗，
    然后base又去解析base2，所以这样的开销是很大的
    return __webpack_require__(__webpack_require__.s = "./src/index.js");
    /******/
})
/************************************************************************/
/******/({

    /***/ "./node_modules/react-dom/cjs/react-dom.production.min.js":
    /***/ (function (module, exports, __webpack_require__) {

        module.exports = (__webpack_require__(/*! dll-reference react */ "dll-reference react"))(5);

        /***/
    }),

    /***/ "./node_modules/react/cjs/react.production.min.js":
    /***/ (function (module, exports, __webpack_require__) {

        module.exports = (__webpack_require__(/*! dll-reference react */ "dll-reference react"))(3);

        /***/
    }),

    /***/ "./src/base.js":
    /***/ (function (module, __webpack_exports__, __webpack_require__) {

        "use strict";
        __webpack_require__.r(__webpack_exports__);
        /* harmony import */
        var _base2__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./base2 */ "./src/base2.js");

        console.log(_base2__WEBPACK_IMPORTED_MODULE_0__["default"]);

        /***/
    }),

    /***/ "./src/base2.js":
    /***/ (function (module, __webpack_exports__, __webpack_require__) {

        "use strict";
        __webpack_require__.r(__webpack_exports__);
        /* harmony default export */
        __webpack_exports__["default"] = (1);
    }),

    /***/ "./src/index.js":
    /***/ (function (module, __webpack_exports__, __webpack_require__) {

        "use strict";
        __webpack_require__.r(__webpack_exports__);
        /* harmony import */
        var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "./node_modules/react/cjs/react.production.min.js");
        /* harmony import */
        var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
        /* harmony import */
        var react_dom__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react-dom */ "./node_modules/react-dom/cjs/react-dom.production.min.js");
        /* harmony import */
        var react_dom__WEBPACK_IMPORTED_MODULE_1___default = 
        __webpack_require__(/*! ./base */ "./src/base.js");

        if (false) {
        }
        react_dom__WEBPACK_IMPORTED_MODULE_1___default.a.render(react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("div", null, sum() + sum3()), document.getElementById('app'));
    }),
    /***/ "dll-reference react":
    /***/ (function (module, exports) {

        module.exports = react;

        /***/
    })

    /******/
});
//# sourceMappingURL=main.0fb5a0043e.js.map
```



```js
开启作用域提升
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/index.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./node_modules/react-dom/cjs/react-dom.production.min.js":

/***/ (function(module, exports, __webpack_require__) {

module.exports = (__webpack_require__(/*! dll-reference react */ "dll-reference react"))(5);

/***/ }),

/***/ "./node_modules/react/cjs/react.production.min.js":
/*!*******************************************************************************************!*\
  !*** delegated ./node_modules/react/cjs/react.production.min.js from dll-reference react ***!
  \*******************************************************************************************/
/*! no static exports found */
/*! ModuleConcatenation bailout: Module is not an ECMAScript module */
/***/ (function(module, exports, __webpack_require__) {

module.exports = (__webpack_require__(/*! dll-reference react */ "dll-reference react"))(3);

/***/ }),

/***/ "./src/base.js":
/*!*********************************!*\
  !*** ./src/base.js + 1 modules ***!
  \*********************************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
这里直接讲base的内容提升到base1中，而不是再去__webpack_require__（base2）的形式，因此少了一次嵌套引入变少了一次内存消耗，这种变量提升会大大加快代码执行速度
// CONCATENATED MODULE: ./src/base2.js
/* harmony default export */ var base2 = (1);
// CONCATENATED MODULE: ./src/base.js

console.log(base2);

/***/ }),

/***/ "./src/index.js":
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
/*! no exports provided */
/*! ModuleConcatenation bailout: Module is an entry point */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "./node_modules/react/cjs/react.production.min.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var react_dom__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react-dom */ "./node_modules/react-dom/cjs/react-dom.production.min.js");
/* harmony import */ var react_dom__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react_dom__WEBPACK_IMPORTED_MODULE_1__);
// react加载策略，可以通过配置alias，那么不管在生产环境还是开发环境都会加载react线上环境代码

/*
* if (process.env.NODE_ENV === 'production') {
  module.exports = require('./cjs/react.production.min.js');
} else {
  module.exports = require('./cjs/react.development.js');
}
* */

 // 默认情况下(开发模式下打包，会循环便利index->base->base2)
// 引入ModuleConcatenationPlugin进行模块内联,则会进行函数合并，变量提升，将base2中的变量导入到base中，从而只循环遍历到base1就可以，而不需要多做一次引入

__webpack_require__(/*! ./base */ "./src/base.js");

if (false) {}

react_dom__WEBPACK_IMPORTED_MODULE_1___default.a.render(react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("div", null, sum() + sum3()), document.getElementById('app'));

/***/ }),

/***/ "dll-reference react":
/*!************************!*\
  !*** external "react" ***!
  \************************/
/*! no static exports found */
/*! ModuleConcatenation bailout: Module is not an ECMAScript module */
/***/ (function(module, exports) {

module.exports = react;

/***/ })

/******/ });
//# sourceMappingURL=main.5c9222fa8c.js.map
```

