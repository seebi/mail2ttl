var MailParser = require('mailparser').MailParser;
var mailparser = new MailParser();
var fs = require('fs');
var crypto = require('crypto');
var N3Util = require('n3').Util;
var Turtle = require('n3').Writer({
            prefixes: {
                rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
                rdfs: 'http://www.w3.org/2000/01/rdf-schema#',
                foaf: 'http://xmlns.com/foaf/0.1/',
                schema: 'http://schema.org/',
                mail: 'http://sebastian.tramp.name/mail/',
                dc: 'http://purl.org/dc/elements/1.1/',
                p: 'http://sebastian.tramp.name/people/'
            }
        });

function md5 (data) {
    'use strict';
    return crypto.createHash('md5').update(data).digest('hex');
}

function getMailUrn (id) {
    'use strict';
    // remove last ',' if present
    if (id.substring(id.length - 1) === ',') {
        id = id.substring(0, id.length - 1);
    }
    if (id.substring(0, 1) === ',') {
        id = id.substring(1, id.length);
    }
    // remove tag markup
    if (id.substring(id.length - 1) === '>') {
        id = id.substring(0, id.length - 1);
    }
    if (id.substring(0, 1) === '<') {
        id = id.substring(1, id.length);
    }
    return 'urn:mail:' + encodeURI(id);
}

function stripPersonName (name) {
    'use strict';
    // remove quotes
    if (name.substring(name.length - 1) === '\'') {
        name = name.substring(0, name.length - 1);
    }
    if (name.substring(0, 1) === '\'') {
        name = name.substring(1, name.length);
    }
    return name;
}

function getMailToUri (mail) {
    'use strict';
    return 'mailto:' + encodeURI(mail.toLowerCase());
}

function getPersonUri (mail) {
    'use strict';
    return 'p:' + md5(mail.toLowerCase());
}

//prints a person
function createPerson (person) {
    'use strict';
    if (person.address) {
        var personUri = getPersonUri(person.address);
        var mailUri = getMailToUri(person.address);
        Turtle.addTriple(personUri, 'rdf:type', 'foaf:Person');
        Turtle.addTriple(personUri, 'foaf:mbox', mailUri);
        if (person.name) {
            var name = stripPersonName(person.name);
            Turtle.addTriple(personUri, 'foaf:name', N3Util.createLiteral(name));
        }
    }
}

// print ttl
function mail2ttl (mail) {
    'use strict';

    // See here for all the things mailparser returns
    // https://www.npmjs.com/package/mailparser#parsed-mail-object
    if (typeof mail.headers['message-id'] === 'string') {
        mail.id = getMailUrn(mail.headers['message-id']);

        if (mail.to) {
            mail.to.forEach(createPerson);
        }
        if (mail.from) {
            mail.from.forEach(createPerson);
        }
        if (mail.cc) {
            mail.cc.forEach(createPerson);
        }
        if (mail.bcc) {
            mail.bcc.forEach(createPerson);
        }

        Turtle.addTriple(mail.id, 'rdf:type', 'schema:EmailMessage');

        if (mail.subject) {
            Turtle.addTriple(mail.id, 'rdfs:label', N3Util.createLiteral(mail.subject));
        }

        if (mail.priority) {
            Turtle.addTriple(mail.id, 'mail:priority', N3Util.createLiteral(mail.priority));
        }

        if (mail.date) {
            Turtle.addTriple(
                    mail.id,
                    'dc:created',
                    N3Util.createLiteral(
                        mail.date.toISOString(),
                        'http://www.w3.org/2001/XMLSchema#dateTime'
                        )
                    );
        }

        if (mail.text) {
            Turtle.addTriple(mail.id, 'mail:content', N3Util.createLiteral(mail.text));
        }

        if (mail.to) {
            mail.to.forEach(function (person) {
                if (person.address) {
                    Turtle.addTriple(mail.id, 'schema:recipient', getPersonUri(person.address));
                }
            });
        }

        if (mail.from) {
            mail.from.forEach(function (person) {
                if (person.address) {
                    Turtle.addTriple(mail.id, 'schema:sender', getPersonUri(person.address));
                }
            });
        }

        if (mail.cc) {
            mail.cc.forEach(function (person) {
                if (person.address) {
                    Turtle.addTriple(mail.id, 'mail:cc', getPersonUri(person.address));
                }
            });
        }

        if (mail.bcc) {
            mail.bcc.forEach(function (person) {
                if (person.address) {
                    Turtle.addTriple(mail.id, 'mail:bcc', getPersonUri(person.address));
                }
            });
        }

        if (mail.references) {
            mail.references.forEach(function (reference) {
                Turtle.addTriple(mail.id, 'mail:reference', getMailUrn(reference));
            });
        }

        if (mail.inReplyTo) {
            mail.inReplyTo.forEach(function (reference) {
                Turtle.addTriple(mail.id, 'mail:inReplyTo', getMailUrn(reference));
            });
        }

        Turtle.end(function (error, result) { console.log(result); });
    }
}

// parse the mail file
function parseMail(path) {
    'use strict';
    mailparser.on('end', mail2ttl);
    fs.createReadStream(path).pipe(mailparser);
}

module.exports = parseMail;
