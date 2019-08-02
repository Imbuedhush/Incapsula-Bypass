//Add bad config detection
const fs = require('fs');
const path = require('path');

const asyncReaddir = function (path) {
    return new Promise((resolve, reject) => {
        try {
            fs.readdir(path, (err, items) => resolve(items))
        } catch (e) {
            reject(e)
        }
    });

};

const asyncReadFile = function (path) {
    return new Promise((resolve, reject) => {
        try {
            fs.readFile(path, (err, file) => resolve(file))
        } catch (e) {
            reject(e)
        }
    });

};

function configReader(userFolder, customConfig) {;
		
    const folder = userFolder ? userFolder : 'configs';
    const directory = path.join(__dirname, folder);
    const fileName = 'jsoverrider.json';
	let configFolder = '';

    return asyncReaddir(directory)
        .then(folders => {
			configFolder = customConfig ? customConfig : randomFolder(folders);
            let file = path.join(directory, configFolder, fileName);
            return asyncReadFile(file)
        })
        .then(config => { return {config: config.toString(), folder: configFolder} })
        .catch(e => console.log(e))
};

function randomFolder(folders) {
    var folder = folders[Math.floor(Math.random() * folders.length)];
    return folder
};

module.exports = configReader;