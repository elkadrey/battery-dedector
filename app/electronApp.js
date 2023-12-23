const {app, BrowserWindow, Tray, Notification, nativeImage, Menu, MenuItem, ipcMain, dialog} = require('electron');
const defaultContextMenu = require('electron-context-menu');
const path = require('node:path');
const battery = require("./battery");
const settings = new (require("./settings"));
const testMode = process.argv.includes("--trace-warnings");
let main, contents, 
iconPath = nativeImage.createFromPath(__dirname+'/assets/battery_icons/loading.png'),
titleName = "Battery Detector";
let tray = null;


module.exports = class {
    quit = false;
    constructor()
    {
        app.on('second-instance', () => {    
            if (main) {
                if(!main.isVisible())
                {
                    main.show();
                    this.makeTray(true);
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
        // });

        app.whenReady().then(() => this.start());
    };

    async start()
    {
        ipcMain.on('load-settings', (event) => {        
            event.sender.send("on-settings", settings.values());
        });
        ipcMain.on('save-settings', (event, arg) => {
            settings.set(arg.key, arg.value);
            event.returnValue = 'done';        
        });
        
        main =  new BrowserWindow({width: 800, height: 200, resizable: testMode, show: false, nativeWindowOpen: testMode, icon: iconPath,title: "Settings",alwaysOnTop: true,
                                webPreferences: {
                                    preload: path.join(__dirname, '/../views/preload.js')
                                }});
        
        
        main.loadFile("./views/settings.html", {        
            hash: JSON.stringify(settings.values),
        });
        contents = main.webContents;
        if(!testMode) main.setMenu(null);
        contents.on('did-finish-load', () => {
            main.show();

        });
        // app.exit();
    };


    makeTray(overWrite)
    {
        if(!tray || overWrite)
        {
            if(!tray)
            {
                tray = new Tray(iconPath);            
                tray.setIgnoreDoubleClickEvents(true)
                tray.setToolTip(titleName);
                tray.setTitle(titleName);

                // tray.on('click', () => {
                //     tray.popUpContextMenu(contextMenu);
                // });
                tray.on('click', () => {
                    toggleWindow();
                });
            }
            
            contextMenu = Menu.buildFromTemplate([
                { 
                    label: "Settings", 
                    type: 'normal', 
                    click(){
                        toggleWindow()
                    }
                },
                {
                    label: "Quit", 
                    type: 'normal', 
                    click(){
                        Quit();                                
                    },
                }
            ]);

            
            tray.setContextMenu(contextMenu);
            dedectIcon();
        }
    }
}