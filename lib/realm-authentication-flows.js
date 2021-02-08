'use strict';

const privates = require('./private-map');
const request = require('request');

/**
 * @module clients
 */

module.exports = {
  find: find,
  update: update
};

/**
 A function to get the list of authenticationFlows or a authenticationFlow for a realm.
 @param {string} realmName - The name of the realm(not the realmID) - ex: master
 @param {string} flow - The name of the realm(not the realmID) - ex: browser,
 @param {object} [options] - The options object
 @returns {Promise} A promise that will resolve with an Array of identityProvider objects or just the 1 identityProvider object if alias is used
 @example
 keycloakAdminClient(settings)
 .then((client) => {
      client.realms.authenticationFlow.find(realmName)
        .then((authenticationFlowList) => {
        console.log(authenticationFlowList) // [{...},{...}, ...]
      })
    })
 */
function find(client) {
  return function find(realm, flow, options) {
    return new Promise((resolve, reject) => {
      options = options || {};
      const req = {
        auth: {
          bearer: privates.get(client).accessToken
        },
        json: true
      };

      req.url = `${client.baseUrl}/admin/realms/${realm}/authentication/flows/${flow}/executions`;
      req.qs = options;

      request(req, (err, resp, body) => {
        if (err) {
          return reject(err);
        }

        if (resp.statusCode !== 200) {
          return reject(body);
        }

        return resolve(body);
      });
    });
  };
}

/**
 A function to update a authenticationFlow for a realm
 @param {string} realmName - The name of the realm(not the realmID) - ex: master,
 @param {string} flow - The name of the realm(not the realmID) - ex: browser,
 @param {object} authenticationFlow - The JSON representation of a authenticationFlow
 @returns {Promise} A promise that resolves.
 @example
 keycloakAdminClient(settings)
 .then((client) => {
      client.realms.authenticationFlow.update(realmName, flow, authenticationFlow)
        .then(() => {
          console.log('success')
      })
    })
 */
function update(client) {
  return function update(realmName, flow, authenticationFlow) {
    return new Promise((resolve, reject) => {
      const req = {
        url: `${client.baseUrl}/admin/realms/${realmName}/authentication/flows/${flow}/executions`,
        auth: {
          bearer: privates.get(client).accessToken
        },
        json: true,
        method: 'PUT',
        body: authenticationFlow
      };

      request(req, (err, resp, body) => {
        if (err) {
          return reject(err);
        }

        // Check that the status cod
        if (resp.statusCode !== 204) {
          return reject(body);
        }

        return resolve(body);
      });
    });
  };
}
