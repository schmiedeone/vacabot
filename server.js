const http = require('http');
const { parse } = require('querystring');

http.createServer((request, response) => {
  const { headers, method, url } = request;
  let body = [];
  request.on('error', (err) => {
    console.error(err);
  }).on('data', (chunk) => {
    body.push(chunk);
  }).on('end', () => {
    body = parse(Buffer.concat(body).toString());
    console.log(body)
    processRequest(body)




    response.writeHead(200, {'content-type':'application/json'});
    response.write(JSON.stringify(body));
    response.end();
  });
  
}).listen(80); 

function processRequest(body) {
  if(body.command) {
    handleCommand(body)
  } else {
    handleInteractions(body)
  }
}


function handleCommand() {}

function handleInteractions() {}
