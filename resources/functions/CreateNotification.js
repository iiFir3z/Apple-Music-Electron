const {app, Notification} = require('electron')
const {join} = require('path')

exports.CreateNotification = function (attributes) {
    console.log(`[CreateNotification] Attempting to CreateNotification with parameters:`)
    console.log(`[CreateNotification] Config Option: ${app.preferences.value('general.playbackNotifications')}`)
    console.log(`[CreateNotification] Notification Supported: ${Notification.isSupported()}`)
    if (!app.preferences.value('general.playbackNotifications') || !Notification.isSupported()) return;


    if (app.preferences.value('general.playbackNotifications').includes("minimized")) {
        const isAppHidden = !app.win.isVisible()
        console.log(`[CreateNotification] [notificationsMinimized] Config Notification Minimized: ${app.preferences.value('general.playbackNotifications').includes("minimized")}`)
        console.log(`[CreateNotification] [notificationsMinimized] App Minimized: ${app.win.isMinimized()}`)
        console.log(`[CreateNotification] [notificationsMinimized] App Hidden: ${isAppHidden}`)
        if (isAppHidden || app.win.isMinimized()) {

        } else {
            return;
        }
    }


    console.log(`[CreateNotification] Notification Generating | Function Parameters: SongName: ${attributes.name} | Artist: ${attributes.artistName} | Album: ${attributes.albumName}`)

    if (app.ipc.existingNotification) {
        console.log("[CreateNotification] Existing Notification Found - Removing. ")
        app.ipc.existingNotification.close()
        app.ipc.existingNotification = false
    }

    const NOTIFICATION_OBJECT = {
        title: attributes.name,
        body: `${attributes.artistName} - ${attributes.albumName}`,
        silent: true,
        icon: join(__dirname, '../icons/icon.png'),
        actions: []
    }

    if (process.platform === "darwin") {
        NOTIFICATION_OBJECT.actions = {
            actions: [{
                type: 'button',
                text: 'Skip'
            }]
        }
    }

    app.ipc.existingNotification = new Notification(NOTIFICATION_OBJECT)
    app.ipc.existingNotification.show()

    if (process.platform === "darwin") {
        app.ipc.existingNotification.addListener('action', (_event) => {
            app.win.webContents.executeJavaScript("MusicKit.getInstance().skipToNextItem()").then(() => console.log("[CreateNotification] skipToNextItem"))
        });
    }
}