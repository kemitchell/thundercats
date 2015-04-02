var Action = require('thundercats').Action;
var ChatWebAPIUtils = require('../utils/ChatWebAPIUtils');

var ChatActions = Action.createActions([
  {
    name: 'createMessage',
    map: function(data) {
      console.log('create message called', data)
      var text = data.text;
      var threadID = data.threadID;

      var timestamp = Date.now();
      var message = {
        id: 'm_' + timestamp,
        threadID: threadID,
        // hard coded for the example
        authorName: 'Bill',
        date: new Date(timestamp),
        text: text,
        isRead: true
      };
      var promise = ChatWebAPIUtils.createMessage(message);

      return {
        message: message,
        promise: promise
      };
    }
  },
  {
    name: 'receiveRawMessages',
    map: Action.create()
  },
  {
    name: 'clickThread',
    map: Action.create()
  }
]);
console.log("chatAction generated", ChatActions)

module.exports = ChatActions;
