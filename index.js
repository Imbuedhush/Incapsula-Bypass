const http = require('http');
const { evaluate } = require('./evaluate');
const port = 8888;
let indexNum = 0;

var cluster = require('cluster');
var numCPUs = require('os').cpus().length;  // SKOK TEBE NADO CPU TUT NAPISHI CHISLO - PO YMOLCHANIU MAX

const server = http.createServer();

if (typeof atob === 'undefined') {
  global.atob = function (b64Encoded) {
    return new Buffer(b64Encoded, 'base64').toString('binary');
  };
}

const requestHandler = function (request, response) {
	const {method, url} = request;
	if (method === 'GET' && url === '/access') {
		response.end('OK');
	}

    if (method === 'POST' && url === '/generate') {

        let data = '';
        request.on('data', function (chunk) {
            data += chunk.toString();
            if (data.length > 500 * 1000) request.abort();
        });

        request.on('end', function () {
            try {
				data = atob(data);
                const [ code, cookie, customConfig ] = data.split(';;;;;;');
		
                if (!code || !cookie) { response.end('Not enough Data'); return; }
if(++indexNum % 200 === 0) {console.log('[R] ' + indexNum);}

                evaluate(code, cookie, customConfig)
                    .then(res => {
							const newCookie = res['document.cookieStr'].split('; ').filter(val => {return val.indexOf('___utmvc=') != -1})[0];
							//console.log(newCookie);
							//console.log(res['document.cookieStr'].split('; '));
							response.writeHead(200,{'set-cookie':newCookie}); response.end(JSON.stringify(res)) }
						)
					.catch(e => {console.log(e);response.end(e.message)});
            } catch (e) {
				console.log(e);
                response.end(e.message)
            }
        });
    }

}
console.log("++++ Incapsula Bypass ++++");


if (cluster.isMaster){

  for (var i = 0; i< numCPUs; i++) cluster.fork();

}else{
	
server.on('request', requestHandler);
server.listen(port);

}