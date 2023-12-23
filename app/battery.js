"use strict";
const commandsList = require('../commands.json');
const notifications = require("./notifications");
const $ = require("./helper.js");
let batteryIcons = {};
const settings = new (require("./settings"));
const commands = commandsList[$.dedectOS()] || {};
const values = [10,20,45,65,80,90];
let lastNotify = 0;
const notifyLimit = 4;
module.exports = class {    
    constructor()
    {
        for(var i in values)
        {
            batteryIcons[i.toString()] = './assets/battery_icons/'+values[i]+'.png';
            batteryIcons["c_"+i.toString()] = './assets/battery_icons/c_'+values[i]+'.png';
        }
    }

    async getValue()
    {
        return parseFloat((await $.exe(commands.CurrentValue)).trim() || "0");
    }

    async isCharging()
    {
        let chargeStatus = (await $.exe(commands.ChargeStatus)).toLocaleLowerCase().trim();
        return chargeStatus ? chargeStatus == "charging" : false;
    }

    async currentIcon(all)
    {
        let val = await this.getValue();
        let index = values.findIndex((num, i) => val <= num &&  (i == 0 || val > values[i-1]));
        let isCharging = await this.isCharging();
        let image = batteryIcons[(isCharging ? "c_" : "")+index];

        if(all)
        {
            if(lastNotify == 0)
            {
                if(isCharging && val >= settings.batteryMax)
                {
                    lastNotify = notifyLimit;
                    notifications.send(`Battery is almost CHARGED (${val}%)`, "Disconnect power supply to improve battery life");
                }
                if(!isCharging && val <= settings.batteryMin)
                {
                    lastNotify = notifyLimit;
                    notifications.send(`Battery is about to DISCHARGE (${val}%)`, "Connect power supply to continue");
                }
            }
            else if(lastNotify > 0) lastNotify--;
        }

        return all ? {val,image} : image;
    }
}