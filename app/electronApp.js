const {app, BrowserWindow, Tray, nativeImage, Menu, ipcMain} = require('electron');
const defaultContextMenu = require('electron-context-menu');
const path = require('node:path');
const battery = new (require("./battery"));
const settings = new (require("./settings"));
const testMode = process.argv.includes("--trace-warnings");
let main, contents, contextMenu,
iconPath = nativeImage.createFromPath('./assets/battery_icons/loading.png'),
titleName = "Battery Detector";
let tray = null;
let quit = false;
let settingsLoaded = false;
let timer = 15; //sec
module.exports = class {
    
    constructor()
    {          
        app.on('second-instance', async () => {    
            if (main) {
                if(!main.isVisible())
                {
                    main.show();
                    await this.makeTray(true);
                }
                if(main.isMinimized()) main.restore();
                main.focus();
            }
        });
        

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
        // if(!testMode) 
            main.setMenu(null);
        contents.on('did-finish-load', () => {
            // main.show();
            main.hide();
            settingsLoaded = true;
            console.log("settings loaded");
        });
        

        main.on('close', async (e) =>
        {
            if(!quit)
            {
                main.hide();
                e.preventDefault(); 
                return ;   
            }
        });
        
        await this.makeTray();
    };

    async startNotifications()
    {
        setTimeout(async () => {
            this.detectIcon();
            await this.startNotifications();
        }, timer * 1000);
    }

    async makeTray(overWrite)
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
                    this.toggleWindow();
                });
            }
            let $this = this;
            contextMenu = Menu.buildFromTemplate([
                { 
                    label: "Settings", 
                    type: 'normal', 
                    click(){
                        $this.toggleWindow()
                    }
                },
                {
                    label: "Quit", 
                    type: 'normal', 
                    click(){
                        $this.quit();                                
                    },
                }
            ]);

            
            tray.setContextMenu(contextMenu);
            await this.detectIcon();
        }
    }

    async detectIcon()
    {
        if(tray) 
        {
            let {image, val} = await battery.currentIcon(true);
            tray.setImage(nativeImage.createFromPath(image || './assets/icons/icon.png'));
            tray.setTitle(`${titleName} ${val}%`);
            tray.setToolTip(`${titleName} ${val}%`);
        }
    }

    quit()
    {
        quit = true;        
        app.exit();
        return false;
    }

    toggleWindow()
    {
        if(!settingsLoaded) return false;
        main.isVisible() ? main.hide() : main.show();
    }
}