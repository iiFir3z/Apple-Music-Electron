const {app, ipcMain} = require('electron')
const {UpdateActivity} = require('../rpc/UpdateActivity')
const {SetThumbarButtons} = require('../win/SetThumbarButtons')
const {SetTrayTooltip} = require('../win/SetTrayTooltip')
const {UpdatePlaybackStatus} = require('../mpris/UpdatePlaybackStatus')

exports.playbackStateDidChange = function () {
    console.log('[playbackStateDidChange] Started.')
    ipcMain.on('playbackStateDidChange', (_item, a) => {
        app.isPlaying = a.status;
        if (!a || a.playParams.id === 'no-id-found' || !app.ipc.cache) return;

        if (a.playParams.id !== app.ipc.cache.playParams.id) { // If it is a new song
            a.startTime = Date.now()
            a.endTime = Number(Math.round(a.startTime + a.durationInMillis));
        } else { // If its continuing from the same song
            a.startTime = Date.now()
            a.endTime = Number(Math.round(Date.now() + a.remainingTime));
        }

        // Thumbar Buttons
        while (app.ipc.ThumbarUpdate) {
            app.ipc.ThumbarUpdate = SetThumbarButtons(a.status)
        }

        // TrayTooltipSongName
        while (app.ipc.TooltipUpdate) {
            app.ipc.TooltipUpdate = SetTrayTooltip(a)
        }

        // Discord Update
        while (app.ipc.DiscordUpdate) {
            app.ipc.DiscordUpdate = UpdateActivity(a)
        }

        // Mpris Status Update
        while (app.ipc.MprisStatusUpdate) {
            app.ipc.MprisStatusUpdate = UpdatePlaybackStatus(a);
        }


        // Revert it All because This Runs too many times
        setTimeout(() => {
            if (!app.ipc.ThumbarUpdate) app.ipc.ThumbarUpdate = true;
            if (!app.ipc.TooltipUpdate) app.ipc.TooltipUpdate = true;
            if (!app.ipc.DiscordUpdate) app.ipc.DiscordUpdate = true;
            if (!app.ipc.MprisStatusUpdate) app.ipc.MprisStatusUpdate = true;
        }, 500)
    });
}