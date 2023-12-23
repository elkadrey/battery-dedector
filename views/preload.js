const { contextBridge, ipcRenderer } = require('electron')




document.addEventListener("DOMContentLoaded", () => {
    ipcRenderer.on('on-settings', (_event, settings) => {        
            for(var k in settings)
            {
                var elem = document.querySelector('#settings-'+k);
                if(elem) elem.value = settings[k];
            }
    });
    contextBridge.exposeInMainWorld('electronAPI', {
        saveSettings: (key, value) =>
        {
            ipcRenderer.send("save-settings", {key,value});
        }
    });
    
    ipcRenderer.send('load-settings');
    console.log("worked");
});