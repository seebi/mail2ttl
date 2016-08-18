# mail2ttl

## Usage

```bash
git checkout git@github.com:leipert/mail2ttl.git
cd mail2ttl
npm install -g .
node ./generateMail.js
mail2ttl mail.file
```

To convert your whole maildir do something like

```bash
find ~/mail/Archive/ -type f | parallel ./bin/mail2ttl {} >~/dump.ttl
```


or during development:

```bash
cd mail2ttl
npm install
node ./generateMail.js
./bin/mail2ttl mail.file
```
