# tiny node.js libraries

These are some tiny useful node.js libraries.

## scgi

A scgi library, that is asynchronous.

On detail: scgi.js contains a stateful netstring parser, a scgi request parser, a Request
and a Response class, as well as a socket-handler for 'net' sockets so you don't need to
care about low level stuff.

```js
var net = require('net');
var scgi = require('./scgi.js');

var serve2 = scgi.createSocketHandler(function(req,resp){
	// writeHead2 is the scgi native version.
	// resp.writeHead2("200 OK",{"Content-Type":"text/plain"});
	
	// writeHead was implemented to be more http-module complaint.
	resp.writeHead(200,"OK",{"Content-Type":"text/plain"});
	resp.end("It works!","ascii");
});

net.createServer(serve2).listen(11001);
```

### response.writeHead2(status, headers)
This method returns the status code.
```js
resp.writeHead2('200 OK',{"Content-Type":"text/plain"});
```

### response.writeHead([statusCode], [reasonPhrase], [headers])
I addes this method get the scgi package compativle with code, written for node's http-module.
Internally it calls the .writeHead2 - method. Unlike the http-module, scgi requires the headers
to be well-cased ( not "content-type" instead of "Content-Type").

##query_context

If node.js developers have to wait for many callbacks to be called or events to happen, in order to merge
the results, the testing for the each event to happen is a challange.
**query_context** is a solution to wait for many events to happen.

```js
var Context = require('./query_context.js');
var ctx = new Context(function(){
  console.log("evend: Anything done!");
});
var event1 = ctx.call(function(par){
  console.log("event1: "+par);
});
var event2 = ctx.call(function(par){
  console.log("event2: "+par);
});
var event3 = ctx.call(function(par){
  console.log("event3: "+par);
});
event1("Result1");
event2("Result2");
event3("Result3");
console.log("End!");
```
will output:
```
event1: Result1
event2: Result2
event3: Result3
evend: Anything done!
End!
```

The event class also has a .kill() method in order to set timeouts.

## License for all libraries

Copyright (c) 2013 maxymania

Permission is hereby granted, free of charge, to any person obtaining a copy of this software
and associated documentation files (the "Software"), to deal in the Software without restriction,
including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense,
and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial
portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT
LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
