"use strict";
const { platform } = require('node:process');
const util = require('util');
const exec = util.promisify(require('child_process').exec);

module.exports = {
    dedectOS()
    {
        console.log(`This platform is ${platform}`);
        return platform.toLocaleLowerCase();
    },
    async exe(command, params)
    {
        try {
            console.log("Command:", command);
            const { stdout, stderr } = await exec(command, params || []);
            if(stderr) 
            {
                console.error(stderr);
                return null;
            }
            if(stdout) 
            {
                return stdout;
            }
        } catch (e) {
            console.error(e); // should contain code (exit code) and signal (that caused the termination).
            return null;
        }
    }
}