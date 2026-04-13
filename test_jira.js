const fs = require('fs');
const https = require('https');

// Read env variables
const envFile = fs.readFileSync('.env.local', 'utf8');
let JIRA_DOMAIN, JIRA_EMAIL, Statik_API;
envFile.split('\n').forEach(line => {
  const parts = line.split('=');
  if(parts[0] === 'JIRA_DOMAIN') JIRA_DOMAIN = parts[1].trim().replace(/\r/g, '');
  if(parts[0] === 'JIRA_EMAIL') JIRA_EMAIL = parts[1].trim().replace(/\r/g, '');
  if(parts[0] === 'Statik_API') Statik_API = parts[1].trim().replace(/\r/g, '');
});

const sanitizeDomain = (val) => val.replace(/^https?:\/\//, "").replace(/\/$/, "");

const domain = sanitizeDomain(JIRA_DOMAIN);
const auth = Buffer.from(`${JIRA_EMAIL}:${Statik_API}`).toString("base64");

const payload = JSON.stringify({
    jql: "project = OTE ORDER BY created DESC",
    maxResults: 50,
    expand: ["changelog"],
    fields: ["created", "status", "resolutiondate", "summary", "issuetype", "priority", "statuscategorychangedate"]
});

const req = https.request({
    hostname: domain,
    port: 443,
    path: '/rest/api/3/search/jql',
    method: 'POST',
    headers: {
        'Authorization': `Basic ${auth}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
    }
}, (res) => {
    console.log('Status:', res.statusCode);
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        if(res.statusCode !== 200) {
            console.log('Response body:', data.substring(0, 500));
        } else {
            console.log('Success!', data.substring(0, 100));
        }
    });
});

req.on('error', (e) => {
    console.error(e);
});

console.log('Sending request to Jira...');
const startTime = Date.now();
req.write(payload);
req.end();
