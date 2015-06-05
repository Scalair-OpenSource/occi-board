/**
* User.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  attributes: {
    login: { type: 'string', unique: true },  // Compte utilisé pour se connecter
    passwd: 'string',     // SHA-256 cipher
    sessionID: 'string',
    lastconn: 'date',     // Last connection date and hour
    lastip: 'string',     // Last connection IP address
    company: 'string',
    firstname: 'string',
    lastname: { type: 'string', required: true },
    mail: { type: 'email', required: true },
    phone: 'string',
    fax: 'string',
    address: 'string',
    complement: 'string',
    zipcode: 'string',
    town: 'string',
    country: 'string',
    workforce: 'integer',
    officefunction: 'string',
    watermark: 'boolean', // Display (if true) the logo of company in each widget title
    offers: [ 'string' ], // @see db-products.js -> OFFERS
    role: [ 'string' ],   // @see config.js -> ROLES
    hosts: [ 'string' ],  // List of hosts name or IP that are managed by this user
    status: 'integer',     // @see users.STATUS_SUBSCRIBED etc.
    notes: 'json',   // Can contains HTML tags
    type: 'integer',       // @see config.js -> TYPES
    accounts: 'text', // ENCRYPTED - Liste des comptes (exemple: accès Centreon, accès datacenter).
    subscriptions: [ 'string' ], // @see getSubscriptions
    prefs: 'json', // Préférences - do not put password in this area!
    expirationdate: 'date' // [optional] After this date, the login is blocked !
  }
};
