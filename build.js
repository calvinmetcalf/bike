var async = require("async");
var uglify=require("uglify-js");
var fs = require("fs");
module.exports = function() {
var files = ['js/jquery.js','js/underscore.js','js/backbone.js','js/leaflet-full.js','js/leaflet.utfgrid.js','js/bootstrap.js','js/mustache.js','js/script.js'];
	async.map(files, function(file,cb){
		fs.readFile("./"+file,"utf8",cb);
	}, function(err, results){
		var concat = results.join("\n");
    fs.writeFile("./leaflet-bundle.js",concat,"utf8",function(){
    	 fs.writeFile("./leaflet-bundle.min.js",uglify.minify("./leaflet-bundle.js").code,"utf8",function(){console.log("done")});
    });
});
 
};