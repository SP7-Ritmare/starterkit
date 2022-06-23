const fs = require('fs-extra');
const path = require('path');
const extensionsPath = path.join(
    __dirname,
    '../../',
    'static',
    'mapstore',
    'extensions'
);
const extensionIndexPath = path.join(extensionsPath, 'index.json');
const extensionIndex = fs.existsSync(extensionIndexPath)
    ? require(extensionIndexPath)
    : {};

const EXTENSION_NAME = 'SOSPlugin';

let error = false;
Object.keys(extensionIndex).forEach((extensionName) => {
    const endpoints = extensionIndex[extensionName];
    Object.keys(endpoints).forEach((key) => {
        if (endpoints[key].match('http://localhost:8082/extension')) {
            error = true;
            console.error('');
            console.error('//////////////////////////////////////');
            console.error('/// Error: dev url ' + key + ': ' + endpoints[key]);
            console.error(
                '/// -> please replace http://localhost:8082/extension with /static/mapstore/extensions/' +
                    extensionName
            );
            console.error('//////////////////////////////////////');
            console.error('');
        }
    });
});

if (!error) {
    fs.moveSync(
        path.resolve(__dirname, 'dist'),
        path.resolve(extensionsPath, EXTENSION_NAME),
        { overwrite: true }
    );
}
