var MailParser = require('mailparser').MailParser;
var mailparser = new MailParser();
var fs = require('fs');
var crypto = require('crypto');


function md5(data) {
    return crypto.createHash('md5').update(data).digest('hex');
}

//prints a person
function printPerson(person) {
    console.log(':' + md5(person.address), 'a', 'foaf:person', ';');
    if(person.name) {
        console.log('\t', 'foaf:name', '"' + person.name + '"', ';');
    }
    console.log('\t', 'foaf:mbox', person.address, '.');
}

// print ttl
function mail2ttl(mailObject) {
    // See here for all the things mailparser returns https://www.npmjs.com/package/mailparser#parsed-mail-object

    mailObject.to.forEach(printPerson);
    mailObject.from.forEach(printPerson);

    // console.log('Subject:', mailObject.subject); // Hello world!
    // console.log('Text body:', mailObject.text); // How are you today?
}

// parse the mail file
function parseMail(path) {
    mailparser.on('end', mail2ttl);
    fs.createReadStream(path).pipe(mailparser);
}

module.exports = parseMail;