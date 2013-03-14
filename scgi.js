
function Counter(len){
	this._data=[];
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
Response.prototype.write = function(){
	return this._conn.write.apply(this._conn,arguments);
};
Response.prototype.end = function(){
	return this._conn.end.apply(this._conn,arguments);
};

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

