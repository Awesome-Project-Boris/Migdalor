const fs = require('fs');
const path = require('path');

const googleServices = process.env.GOOGLE_SERVICES_JSON;

if (!googleServices) {
    console.error('GOOGLE_SERVICES_JSON is not defined in environment variables.');
    process.exit(1);
}

const filePath = path.join(__dirname, '..', 'android', 'app', 'google-services.json');
fs.writeFileSync(filePath, googleServices);
console.log(`✅ google-services.json written to ${filePath}`);
