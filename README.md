# tiny node.js libraries

These are some tiny useful node.js libraries.

## scgi

A scgi library, that is asynchronous.

On detail: scgi.js contains a stateful netstring parser, a scgi request parser, a Request
and a Cesponse class, as well as 

```js
var net = require('net');
var scgi = require('./scgi.js');

var serve2 = scgi.createSocketHandler(function(req,resp){
	resp.writeHead2("200 OK",{"Content-Type":"text/plain"});
	resp.end("It works!","ascii");
});

net.createServer(serve2).listen(11001);
```

- [x] GET requests tested
- [ ] POST requests tested
- [ ] Extended error testing for netstring parser
- [ ] become more node.js-http-module complaint for compatiblity with other http code

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
