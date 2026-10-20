import fs from 'fs';
import https from 'https';

const KEY = '8bc45640fdecd873fa152db720ada3c0';
const HOST = 'www.origintra.com';
const KEY_LOCATION = `https://${HOST}/${KEY}.txt`;

// Read sitemap to get all URLs
const sitemapContent = fs.readFileSync('public/sitemap.xml', 'utf8');
const urlMatches = [...sitemapContent.matchAll(/<loc>([^<]+)<\/loc>/g)];
const urlList = urlMatches.map(m => m[1]);

console.log(`Found ${urlList.length} URLs in sitemap to submit to Bing & IndexNow.`);

const payload = JSON.stringify({
  host: HOST,
  key: KEY,
  keyLocation: KEY_LOCATION,
  urlList: urlList
});

function postIndexNow(endpoint) {
  return new Promise((resolve, reject) => {
    const url = new URL(endpoint);
    const options = {
      hostname: url.hostname,
      port: 443,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Length': Buffer.byteLength(payload)
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        console.log(`[${endpoint}] Response status: ${res.statusCode} ${res.statusMessage}`);
        if (body) console.log(`Response body: ${body}`);
        resolve({ statusCode: res.statusCode, body });
      });
    });

    req.on('error', (e) => {
      console.error(`[${endpoint}] Request error: ${e.message}`);
      resolve({ error: e.message });
    });

    req.write(payload);
    req.end();
  });
}

async function main() {
  console.log(`Submitting IndexNow payload for ${HOST} with key ${KEY}...`);
  await postIndexNow('https://api.indexnow.org/indexnow');
  await postIndexNow('https://www.bing.com/indexnow');
  console.log('IndexNow submission completed.');
}

main();
