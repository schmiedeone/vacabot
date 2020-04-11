const http = require('http');

http.createServer((request, response) => {
  const { headers, method, url } = request;
  let body = [];
  request.on('error', (err) => {
    console.error(err);
  }).on('data', (chunk) => {
    body.push(chunk);
  }).on('end', () => {
    body = Buffer.concat(body).toString();
    console.log("URL", url)
    console.log("Method", method)
    console.log("Body", body)

    const responseBody = { method, url, body };
    response.write(JSON.stringify(responseBody));
    response.end();
  });
  
}).listen(80); 
