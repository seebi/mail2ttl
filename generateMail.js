var fs = require('fs');
var path = require('path');


var email = "From: Sender Name <sender@example.com>\r\n"+
    "To: Receiver Name <receiver@example.com>, <receiver2@example.com>\r\n"+
    "Subject: Hello world!\r\n"+
    "\r\n"+
    "How are you today?";

fs.writeFileSync(path.join(__dirname, 'mail.file'), email);