"use strict";
const {app, BrowserWindow, Tray, Notification, nativeImage, Menu, MenuItem, shell, dialog} = require('electron');
const defaultContextMenu = require('electron-context-menu');

const battery = require("./app/battery");
const settings = new (require("./app/settings"));
console.log(settings.batteryMax);
let main, contents, iconPath = "";
app.on('second-instance', (event, commandLine, workingDirectory) => {    
    if (main) {
        if(!main.isVisible())
        {
            main.show();
            // makeTray(true);
        }
        if(main.isMinimized()) main.restore();
        main.focus();
    }
});


// app.on("web-contents-created", (e, contents) => {
//    defaultContextMenu({
//       window: contents,
//       showSearchWithGoogle: false,
//       showInspectElement: false
      
//    });
// })

app.whenReady().then(() => start());

async function start()
{
    // console.log(">>>", await battery.getValue());

    main =  new BrowserWindow({width: 800, height: 450, resizable: false, show: false, nativeWindowOpen: false, icon: iconPath,title: "Settings",alwaysOnTop: true,});
    console.log(settings.values);
    main.loadFile("./views/settings.html", {        
        hash: JSON.stringify(settings.values),
    });
    contents = main.webContents;
    main.setMenu(null);
    // contents.on('did-finish-load', () => main.show());
    app.exit();
}
