const fs = require('fs');
const path = require('path');

const packageJsonPath = path.join('./', 'package.json');
const packageContent = fs.readFileSync(packageJsonPath, 'utf-8');
const packageJson = JSON.parse(packageContent);
const { version } = packageJson;

const content = `window.packageVersion = '${version}'`;
const envContent = `ICE_BASEURL=https://api.offerwing.cn/api\nICE_VERSION=${version}`;

fs.writeFileSync('./public/version.js', content, 'utf-8');
fs.writeFileSync('.env.production', envContent, 'utf-8');
