var _ = require('lodash');
var path = require('path');
var fs = require('fs');
var ConfigLoader = {};

function getDirectories(src){
  return fs.readdirSync(src).filter(function(file){
    return fs.statSync(path.join(src,file)).isDirectory();
  });
}

ConfigLoader.loadMethods = function(root,options){
  options = options || {};
  var methodDir = path.join(root,'methods');
  var dirs = getDirectories(methodDir);

  var constants = options.constants || {};
  try{
    _.assign(constants,require(path.join(root,'constants')));
  }catch(e){}

  return _.map(dirs,function(method){
    return require(path.join(methodDir,method,'config'))(constants);
  });
};
module.exports = ConfigLoader;
