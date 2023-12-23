const {Notification} = require('electron');
module.exports = {
    send(title, body, {onclick,afterTime})
    {
        let message = new Notification({title, body,timeoutType: 'default'});
        if(onclick) message.on('click', onclick);
        if(afterTime) setTimeout(() => {
            message.show();
        }, afterTime);
        else message.show();
    }
}