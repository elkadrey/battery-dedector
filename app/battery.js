"use strict";
const commandsList = require('../commands.json');
const $ = require("./helper.js");


const commands = commandsList[$.dedectOS()] || {};

module.exports = {    
    async getValue()
    {
        return parseFloat((await $.exe(commands.CurrentValue)).trim() || "0");
    },
    async isCharging()
    {
        let chargeStatus = (await $.exe(commands.ChargeStatus)).toLocaleLowerCase().trim();
        return chargeStatus ? chargeStatus == "charging" : false;
    }
}