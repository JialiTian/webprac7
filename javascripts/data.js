fs = require('fs');
path = require('path');

exports.getData = function(callback){
	fs.readFile(path.join(path.join(__dirname,'../model')
									,'friendData.json')
						,function(err,data){
							if(err)throw err;
							obj = JSON.parse(data);
							callback(obj);
						}
				);
									
};
