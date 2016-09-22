'use strict';

let path = require('path');
let HTMLHint = require("htmlhint").HTMLHint;
let chalk = require('chalk');
let stylish = require('jshint-stylish');

const DEFAULT_OPTIONS = {
  configFile: path.posix.join(__dirname,'./_rules.js')
};

/**
 * @constructor
 * @param  {Object} options 配置项
 * @return none
 */
let HtmlWebpackHtmlhintPlugin = function(options) {
  this.options = Object.assign({}, DEFAULT_OPTIONS, options);
};

/**
 * @override
 * @param  {Object} compiler webpack compiler对象
 */
HtmlWebpackHtmlhintPlugin.prototype.apply = function(compiler) {
  let _this = this;
  compiler.plugin('compilation', function(compilation) {
    compilation.plugin('html-webpack-plugin-after-html-processing', function(htmlPluginData,callback) {
      _this.verifyContent(htmlPluginData, callback);
    });
  });
};

/**
 * @method
 * @desc 验证内容合法性
 * @param  {Object}   htmlPluginData           html数据
 * @param  {Function} callback                 回调函数
 * @return null
 */
HtmlWebpackHtmlhintPlugin.prototype.verifyContent = function(htmlPluginData, callback) {
  const TYPE_MAP = {
    error: 'E',
    warning: 'W'
  };

  let _this = this;
  // 验证规则
  let _rules = require(_this.options.configFile);
  // html内容文本
  let _html = htmlPluginData.html;
  // 文件名
  let _file = htmlPluginData.plugin.options.filename;

  let results = HTMLHint.verify(_html,_rules);
  // 输出log
  if(results&&results.length!==0){
    stylish.reporter(results.map(function(item){
      return {
        file: _file,
        error: {
            character: item.col,
            code: TYPE_MAP[item.type],
            line: item.line,
            reason: item.message
        }
      }
    }));
    process.exit();
  }else{
    callback();
  }
};

module.exports = HtmlWebpackHtmlhintPlugin;
