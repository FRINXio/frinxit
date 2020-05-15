const UC_IP = '127.0.0.1'
const UC_USER = 'admin'
const UC_PASSWORD = 'admin'


module.exports = function () {
	this.ucIp = UC_IP;
	this.ucUser = UC_USER;
	this.ucPassword = UC_PASSWORD;

	this.setUcIp = function (ucIp) {
		this.ucIp = ucIp;
	} 
	this.setUcUser = function (ucUser) {
		this.ucUser = ucUser;
	}     
	this.setUcPassword = function (ucPassword) {
		this.ucPassword = ucPassword;
	} 

	this.getUcIp = function () { 
	    return this.ucIp;
	}
	this.getUcUser = function () { 
	    return this.ucUser;
	}
	this.getUcPassword = function () { 
	    return this.ucPassword;
	}    
}
