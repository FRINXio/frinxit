const ODL_IP = '127.0.0.1'
const ODL_USER = 'admin'
const ODL_PASSWORD = 'admin'


module.exports = function () {
	this.odlIp = ODL_IP;
	this.odlUser = ODL_USER;
	this.odlPassword = ODL_PASSWORD;

	this.setOdlIp = function (odlIp) {
		this.odlIp = odlIp;
	} 
	this.setOdlUser = function (odlUser) {
		this.odlUser = odlUser;
	}     
	this.setOdlPassword = function (odlPassword) {
		this.odlPassword = odlPassword;
	} 

	this.getOdlIp = function () { 
	    return this.odlIp;
	}
	this.getOdlUser = function () { 
	    return this.odlUser;
	}
	this.getOdlPassword = function () { 
	    return this.odlPassword;
	}    
}
