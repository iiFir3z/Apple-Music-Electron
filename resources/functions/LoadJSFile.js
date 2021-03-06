const {readFile} = require('fs')
const {app} = require('electron')
const {join} = require('path')

exports.LoadJSFile = function (path) {
    const filePath = join(join(__dirname, '../js/'), path)
    console.log(`[LoadJSFile] Attempting to load: '${filePath}`)
    readFile(filePath, "utf-8", function (error, data) {

        if (!error) {
            let formattedData = data.replace(/\s{2,10}/g, ' ').trim();
            app.win.webContents.executeJavaScript(formattedData).then(() => console.log(`[LoadJSFile] '${path}' successfully injected.`));
        } else {
            console.log(`[LoadJSFile] Error while injecting: ${path} - Error: ${error}`)
        }
    });


}