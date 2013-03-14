// Copyright maxymania


/*
 * This Constant (HTTP_STATUS_CODES) comes directly from lib/http.js of node.js' standard library
 * Copyright Joyent, Inc. and other Node contributors.
 */
var HTTP_STATUS_CODES = {
  100 : 'Continue',
  101 : 'Switching Protocols',
  102 : 'Processing',                 // RFC 2518, obsoleted by RFC 4918
  200 : 'OK',
  201 : 'Created',
  202 : 'Accepted',
  203 : 'Non-Authoritative Information',
  204 : 'No Content',
  205 : 'Reset Content',
  206 : 'Partial Content',
  207 : 'Multi-Status',               // RFC 4918
  300 : 'Multiple Choices',
  301 : 'Moved Permanently',
  302 : 'Moved Temporarily',
  303 : 'See Other',
  304 : 'Not Modified',
  305 : 'Use Proxy',
  307 : 'Temporary Redirect',
  400 : 'Bad Request',
  401 : 'Unauthorized',
  402 : 'Payment Required',
  403 : 'Forbidden',
  404 : 'Not Found',
  405 : 'Method Not Allowed',
  406 : 'Not Acceptable',
  407 : 'Proxy Authentication Required',
  408 : 'Request Time-out',
  409 : 'Conflict',
  410 : 'Gone',
  411 : 'Length Required',
  412 : 'Precondition Failed',
  413 : 'Request Entity Too Large',
  414 : 'Request-URI Too Large',
  415 : 'Unsupported Media Type',
  416 : 'Requested Range Not Satisfiable',
  417 : 'Expectation Failed',
  418 : 'I\'m a teapot',              // RFC 2324
  422 : 'Unprocessable Entity',       // RFC 4918
  423 : 'Locked',                     // RFC 4918
  424 : 'Failed Dependency',          // RFC 4918
  425 : 'Unordered Collection',       // RFC 4918
  426 : 'Upgrade Required',           // RFC 2817
  428 : 'Precondition Required',      // RFC 6585
  429 : 'Too Many Requests',          // RFC 6585
  431 : 'Request Header Fields Too Large',// RFC 6585
  500 : 'Internal Server Error',
  501 : 'Not Implemented',
  502 : 'Bad Gateway',
  503 : 'Service Unavailable',
  504 : 'Gateway Time-out',
  505 : 'HTTP Version Not Supported',
  506 : 'Variant Also Negotiates',    // RFC 2295
  507 : 'Insufficient Storage',       // RFC 4918
  509 : 'Bandwidth Limit Exceeded',
  510 : 'Not Extended',               // RFC 2774
  511 : 'Network Authentication Required' // RFC 6585
};


function Counter(len){
	this._data=[];
	this._end=[];
	if(len<0){
		this.freewheel=true;
		this.got=0;
		this.len=0;
	}else{
		this.freewheel=false;
		this.got=0;
		this.len=len;
	}
}
Counter.prototype.full = function(){ return this.got>=this.len; }
Counter.prototype.addData = function(data){
	var m = this.len-this.got;
	var n = data.length;
	var i;
	var l = this._data.length;
	if(m==0)return;
	if(m<n)
		data = data.slice(0,m);
	for(i=0;i<l;i++)
		this._data[i](data);
	this.got += data.length;
	//return this.got<this.len;
};
Counter.prototype.end = function(){
	var i,l = this._end.length;
	for(i=0;i<l;i++)
		this._end[i]();
};

function NetString(){
	this.state=0;
	this.len=0;
	this.got=0;
	this.buffer=null;
}
NetString.prototype.addData = function(data){
	var i=0,n=data.length;
	while(i<n){
		switch(this.state){
		case 0:
			if(data[i]<0x30 || data[i]>0x3a){ this.state=-1; return i; }
			if(data[i]==0x3a){
				this.buffer = new Buffer(this.len);
				this.state=1;
				if(this.len==0) this.state=2;
				i++;
				continue;
			}
			this.len = this.len*10 + (data[i]-0x30);
			i++;
			continue;
		case 1:
			while( (i<n) && (this.got<this.len) )
				{this.buffer[this.got]=data[i]; i++; this.got++;}
			if(this.got>=this.len) if( (i<n) )
				{
					if (data[i]==0x2c) this.state=2;
					else this.state=-1;
					i++;
				}
			continue;
		case 2:
			return i;
		default:return i;
		}
	}
	return i;
};
NetString.prototype.isDone = function(){ return this.state==2; }
NetString.prototype.isError = function(){ return this.state<0; }

function toScgiMap(buf){
	var dest={};
	var i=0,n=buf.length;
	var l=0;
	var k,v;
	while(i<n){
		while((i<n) && (buf[i]!=0))i++;
		k=buf.toString('ascii',l,i);
		i++;l=i;
		while((i<n) && (buf[i]!=0))i++;
		v=buf.toString('ascii',l,i);
		dest[k]=v;
		i++;l=i;
	}
	return dest;
}

function Request(counter,headers,len){
	//this._conn=conn;
	this._counter=counter;
	this.headers=headers;
	this.url = headers["REQUEST_URI"];
	this.method = headers["REQUEST_METHOD"];
	this.contentLength=len;
}
Request.prototype.on = function(event,callback){
	if(event=='data')
		this._counter._data.push(callback);
	if(event=='end')
		this._counter._end.push(callback);
};

function Response(conn){
	this._conn=conn;
}
Response.prototype.writeHead2 = function(statusLine,headers){
	var h = 'Status: '+statusLine+'\r\n';
	for(var k in headers)
		h += k+': '+headers[k]+'\r\n';
	this._conn.write(h+'\r\n','ascii');
};
Response.prototype.writeHead = function(){
	var status,statusPhrase,headers;
	var i = 0;
	if( (typeof (arguments[i])) == 'number')
			status = arguments[i++];
		else status = 200;
	if( (typeof (arguments[i])) == 'string')
			statusPhrase = arguments[i++];
		else statusPhrase = HTTP_STATUS_CODES[status] || 'OK';
	headers = arguments[i++] || {};
	this.writeHead2(''+status+' '+statusPhrase,headers);
}
Response.prototype.write = function(){
	return this._conn.write.apply(this._conn,arguments);
};
Response.prototype.end = function(){
	return this._conn.end.apply(this._conn,arguments);
};
Response.prototype.on = function(){};

function createSocketHandler(callback){
	return function(c){
		var state=0;
		var ns = new NetString();
		var counter;
		var resp = new Response(c);
		var header;
		c.on('data',function(d){
			switch(state){
			case 0:
				var r = ns.addData(d);
				if(ns.state<0){ c.destroy(); return; }// parser error case
				if(ns.state==2){
					header = toScgiMap(ns.buffer);
					var len = -1;
					try{
						len = parseInt(header["CONTENT_LENGTH"])
					}catch(e){}
					counter = new Counter(len);
					state=1;
					callback(new Request(counter,header,len),resp);
				}else return;
				if(r==0)return;
				d = d.slice(r,d.length);
			case 1:
				counter.addData(d);
				if(counter.full()){
					counter.end();
					state=2;
				}
			case 2: // ignore bytes
			}
		})
	};
}


module.exports={
  NetString:NetString,
  Response:Response,
  toScgiMap:toScgiMap,
  createSocketHandler:createSocketHandler
};

