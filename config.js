var config = {};
config.rootURL = 'localhost:3000/';
config.sessionSecret = 'top coder';
config.facebook = {
	appId: '1509368379354395', 
	appSecret: '51b2fe7d2ef2b2869ec6972cbe50dd6b',
	redirectUri: config.rootURL + 'auth/'
};
config.db = { 
	host: 'localhost',
	user: 'root',
	password: '19870709Wx', 
	database: 'findfriends'
}
module.exports = config;
