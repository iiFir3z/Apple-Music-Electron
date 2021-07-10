require('v8-compile-cache');
const path = require('path');
const {app} = require('electron');

// Creating the Application Window and Calling all the Functions
function CreateWindow() {
    console.log('[CreateWindow] Started.')

    const {InstanceHandler} = require('./resources/functions/handler/InstanceHandler')
    const ExistingInstance = InstanceHandler()
    if (ExistingInstance) return;

    const {CreateBrowserWindow} = require('./resources/functions/CreateBrowserWindow')
    app.win = CreateBrowserWindow() // Create the Browser Window

    const {SetThumbarButtons} = require('./resources/functions/win/SetThumbarButtons')
    SetThumbarButtons() // Set Inactive Thumbar Icons

    const {LoadWebsite} = require('./resources/functions/load/LoadWebsite')
    LoadWebsite() // Load the Website

    const {InjectFiles} = require('./resources/functions/InjectFiles')
    InjectFiles() // Load the Website Javascript

    const {WindowStateHandler} = require('./resources/functions/handler/WindowStateHandler')
    WindowStateHandler() // Handling the Window

    const {playbackStateDidChange} = require('./resources/functions/handler/PlaybackStateHandler')
    playbackStateDidChange() // IPCMain

    const {mediaItemStateDidChange} = require('./resources/functions/handler/MediaStateHandler')
    mediaItemStateDidChange() // IPCMain
}

// When its Ready call it all
app.on('ready', () => {
    const {InitializeLogging} = require('./resources/functions/init/Init-Logging')
    InitializeLogging()

    const {SettingsMenuInit} = require("./resources/functions/settings/OpenMenu");
    SettingsMenuInit()
    console.log(app.preferences)

    const {InitializeBase} = require('./resources/functions/init/Init-Base')
    InitializeBase()

    const {ApplicationReady} = require('./resources/functions/init/App-Ready')
    ApplicationReady()
    console.log("[Apple-Music-Electron] Application is Ready.")
    console.log("[Apple-Music-Electron] Creating Window...")
    setTimeout(CreateWindow, process.platform === "linux" ? 1000 : 0);

    app.preferences.on('save', (preferences) => {
        console.log(`Preferences were saved.`, JSON.stringify(preferences, null, 4));
    });
});

function ClearMPRIS() {
    if (app.mpris) { // Reset Mpris when app is closed
        app.mpris.metadata = {'mpris:trackid': '/org/mpris/MediaPlayer2/TrackList/NoTrack'}
        app.mpris.playbackStatus = 'Stopped';
    }
}

app.on('window-all-closed', () => {
    ClearMPRIS()
    app.quit()
});

app.on('before-quit', function () {
    ClearMPRIS()
    if (app.preferences.value('general.discordRPC')[0] && app.discord.client) app.discord.client.disconnect
    console.log("[DiscordRPC] Disconnecting from Discord.")
    console.log("---------------------------------------------------------------------")
    console.log("Application Closing...")
    console.log("---------------------------------------------------------------------")
    app.isQuiting = true;
});