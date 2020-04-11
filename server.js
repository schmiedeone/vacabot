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
    // response.write(JSON.stringify(body));
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


function handleCommand(body) {
  console.log("Handling Command!")
  let user = new User(body.user_id, body.user_name, null)
  const responseUrl = body.response_url
  const triggerId = body.trigger_id


}



function handleInteractions() {}

class User {
  constructor(userId, userName, channelId) {
    this.userId = userId;
    this.userName = userName;
    this.channelId = channelId;
  }
}

class Vacation {
  constructor(from, to) {
    this.from = from;
    this.to = to;
  }
}

function createVacationTemplate(props) {
  const { vacationLeft } = props;
  return { "blocks":
  [
      {
         "type":"section",
         "text":{
            "type":"mrkdwn",
            "text":`*Add Vacation!*\nBalance: ${vacationLeft} Days`
         }
      },
      {
         "type":"section",
         "text":{
            "type":"mrkdwn",
            "text":"From Date"
         },
         "accessory":{
            "type":"datepicker",
            "placeholder":{
               "type":"plain_text",
               "text":"Select a date",
               "emoji":true
            },
            "action_id": "from"
         },
         "block_id": "${userVacationRecordId}"
      },
      {
         "type":"section",
         "text":{
            "type":"mrkdwn",
            "text":"To Date"
         },
         "accessory":{
            "type":"datepicker",
            "placeholder":{
               "type":"plain_text",
               "text":"Select a date",
               "emoji":true
            },
            "action_id": "to"
         }
      },
      {
         "type":"divider"
      },
      {
         "type":"actions",
         "elements":[
            {
               "type":"button",
               "text":{
                  "type":"plain_text",
                  "emoji":true,
                  "text":"Confirm Plan"
               },
               "style":"primary",
               "value":"click_me_123",
               "action_id": "confirmVacation"
            }
         ]
      }
   ],
   "text": "Create Vacation!"
  } 
}

function httpClient(url, reqBody) {
  const data = JSON.stringify(reqBody)
  
  const options = {
    hostname: 'whatever.com',
    port: 443,
    path: '/todos',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length
    }
  }
  
  const req = https.request(options, res => {
    console.log(`statusCode: ${res.statusCode}`)
  
    res.on('data', d => {
      process.stdout.write(d)
    })
  })
  
  req.on('error', error => {
    console.error(error)
  })
  
  req.write(data)
  req.end()
}