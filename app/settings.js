"use strict";
const Storage = require('node-storage');
const store = new Storage('this.#settings.db');

module.exports = class {

    #settings = {
        batteryMax: 95,
        batteryMin: 30
    }

    constructor() {    
        this.load();

        return new Proxy(this, {
            get: ($this, col) =>
            {
                return col == "values" ? this.values() :  this.get(col);
            }
        });
    }

    load()
    {
        for(var k in this.#settings)
        {
            var val = store.get(k);
            if(val)
            {
                this.#settings[k] = typeof this.#settings[k] == "number" ? parseFloat(val) : val;
            }
        }
    };

    toJson()
    {
        return JSON.stringify(this.#settings);
    };

    values()
    {
        return this.#settings;
    }

    set(key, value)
    {
        this.#settings[key] = value;
        store.put(key, value);
    };

    save(newValues)
    {
        if(typeof newValues != object) return ;

        for(var k in this.#settings)
        {
            if(newValues[k]) this.set(k, newValues[k]);
        }
    }

    get(key)
    {
        return this.#settings[key] || null;
    }
}