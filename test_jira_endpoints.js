const fs = require('fs');
const https = require('https');

const envFile = fs.readFileSync('.env.local', 'utf8');
let JIRA_DOMAIN, JIRA_EMAIL, Statik_API;
envFile.split('\n').forEach(line => {
  const parts = line.split('=');
  if(parts[0] === 'JIRA_DOMAIN') JIRA_DOMAIN = parts[1].trim().replace(/\r/g, '');
  if(parts[0] === 'JIRA_EMAIL') JIRA_EMAIL = parts[1].trim().replace(/\r/g, '');
  if(parts[0] === 'Statik_API') Statik_API = parts[1].trim().replace(/\r/g, '');
});

const domain = JIRA_DOMAIN.replace(/^https?:\/\//, "").replace(/\/$/, "");
const auth = Buffer.from(`${JIRA_EMAIL}:${Statik_API}`).toString("base64");

async function testSearch(name, path, payload) {
  return new Promise((resolve) => {
    const req = https.request({
        hostname: domain,
        port: 443,
        path: path,
        method: 'POST',
        headers: {
            'Authorization': `Basic ${auth}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(JSON.stringify(payload))
        }
    }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
            console.log(`[${name}] Status: ${res.statusCode}`);
            if(res.statusCode !== 200) console.log(data.substring(0, 200));
            resolve();
        });
    });
    req.write(JSON.stringify(payload));
    req.end();
  });
}

async function run() {
  await testSearch("ARRAY", '/rest/api/3/search/jql', { jql: "project = OTE", expand: ["changelog"] });
  await testSearch("STRING", '/rest/api/3/search/jql', { jql: "project = OTE", expand: "changelog" });
}

run();
