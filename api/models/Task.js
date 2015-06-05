/**
* Task.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  attributes: {
    id_user: { model: 'user' },
    caption: 'string',
    due_date: 'date',
    url: 'string',
    finished: 'boolean',
    published: 'boolean'
  }

};
