"use strict";

const app = new (require("./app/electronApp"));
(async() => await app.startNotifications())();