/**
 * How to use:
 *
 * Make a copy of this file called config.js
 * Replace placeholders with actual values
 *
 * Remember: Do not upload sensitive keys to public repos
 */

module.exports.dropbox = "<YOUR DROPBOX API KEY>";
module.exports.jwtsecret = "<RANDOM JWT SECRET>";

// Local MySQL info
module.exports.db = {
  user: "<MYSQL USERNAME>",
  password: "<MYSQL PASSWORD>",
  database: "<LOCAL TEST DATABASE NAME>"
};

module.exports.twitter = {
  consumer_key: '<YOUR TWITTER API CONSUMER KEY>',
  consumer_secret: '<YOUR TWITTER API CONSUMER SECRET>',
  access_token_key: '<YOUR TWITTER API ACCESS TOKEN KEY>',
  access_token_secret: '<YOUR TWITTER API ACCESS TOKEN SECRET>'
};
