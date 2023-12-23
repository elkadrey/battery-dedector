"use strict";
const Storage = require('node-storage');
const store = new Storage('settings.db');
let settings = {
    batteryMax: 95,
    batteryMin: 30
};

module.exports = class {

    

    constructor() {    
        this.load();

        return new Proxy(this, {            
            get: ($this, col) =>
            {
                return $this[col] ?  $this[col] : (col == "values" ? $this.values() :  $this.get(col));
            }
        });
    }

    load()
    {
        for(var k in settings)
        {
            var val = store.get(k);
            if(val)
            {
                settings[k] = typeof settings[k] == "number" ? parseFloat(val) : val;
            }
        }
    };

    toJson()
    {
        return JSON.stringify(settings);
    }

    values()
    {
        return settings;
    }

    set(key, value)
    {
        settings[key] = value;
        store.put(key, value);
    };

    save(newValues)
    {
        console.log("typeof newValues", typeof newValues);
        if(typeof newValues != "object") return ;

        for(var k in settings)
        {
            if(newValues[k]) this.set(k, newValues[k]);
        }
    }

    get(key)
    {
        return settings[key] || null;
    }
}