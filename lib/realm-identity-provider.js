'use strict';

const privates = require('./private-map');
const request = require('request');

/**
 * @module clients
 */

module.exports = {
  find: find ,
  create: create ,
  update: update,
  remove: remove,
  exportConfiguration: exportConfiguration
};

/**
 A function to get the list of identityProviders or a identityProvider for a realm.
 @param {string} realmName - The name of the realm(not the realmID) - ex: master
 @param {object} [options] - The options object
 @param {string} [options.alias] - use this options to get a identityProvider by an alias.
 @returns {Promise} A promise that will resolve with an Array of identityProvider objects or just the 1 identityProvider object if alias is used
 @example
 keycloakAdminClient(settings)
 .then((client) => {
      client.realms.identityProvider.find(realmName)
        .then((identityProviderList) => {
        console.log(identityProviderList) // [{...},{...}, ...]
      })
    })
 */
function find(client) {
  return function find(realm, options) {
    return new Promise((resolve, reject) => {
      options = options || {};
      const req = {
        auth: {
          bearer: privates.get(client).accessToken
        },
        json: true
      };

      if (options.alias) {
        req.url = `${client.baseUrl}/admin/realms/${realm}/identity-provider/instances/${options.alias}`;
      } else {
        req.url = `${client.baseUrl}/admin/realms/${realm}/identity-provider/instances`;
        req.qs = options;
      }

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
 A function to create a new identity provider for a realm.
 @param {string} realmName - The name of the realm(not the realmID) - ex: master
 @param {object} identityProvider - The JSON representation of a identityProvider
 @returns {Promise} A promise that will resolve with the user object
 @example
 keycloakAdminClient(settings)
 .then((client) => {
      client.realms.identityProvider.create(realmName, identityProvider)
        .then((createdIdentityProvider) => {
        console.log(createdIdentityProvider) // [{...}]
      })
    })
 */
function create(client) {
  return function create(realmName, identityProvider) {
    return new Promise((resolve, reject) => {
      const req = {
        url: `${client.baseUrl}/admin/realms/${realmName}/identity-provider/instances`,
        auth: {
          bearer: privates.get(client).accessToken
        },
        body: identityProvider,
        method: 'POST',
        json: true
      };

      request(req, (err, resp, body) => {
        if (err) {
          return reject(err);
        }

        if (resp.statusCode !== 201) {
          return reject(body);
        }

        // eg "location":"https://<url>/auth/admin/realms/<realm>/users/499b7073-fe1f-4b7a-a8ab-f401d9b6b8ec"
        const uid = resp.headers.location.replace(/.*\/(.*)$/, '$1');

        // Since the create Endpoint returns an empty body, go get what we just imported.
        // *** Body is empty but location header contains identityProvider alias ***
        // We need to search based on the identityProvider.alias, since it will be unique
        return resolve(client.realms.identityProvider.find(realmName, {
          alias: uid
        }));
      });
    });
  };
}

/**
 A function to update a identityProvider for a realm
 @param {string} realmName - The name of the realm(not the realmID) - ex: master,
 @param {object} identityProvider - The JSON representation of the fields to update for the identityProvider
 - This must include the identityProvider.alias field.
 @returns {Promise} A promise that resolves.
 @example
 keycloakAdminClient(settings)
 .then((client) => {
      client.realms.identityProvider.update(realmName, identityProvider)
        .then(() => {
          console.log('success')
      })
    })
 */
function update(client) {
  return function update(realmName, identityProvider) {
    return new Promise((resolve, reject) => {
      identityProvider = identityProvider || {};
      const req = {
        url: `${client.baseUrl}/admin/realms/${realmName}/identity-provider/instances/${identityProvider.alias}`,
        auth: {
          bearer: privates.get(client).accessToken
        },
        json: true,
        method: 'PUT',
        body: identityProvider
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

/**
 A function to delete a identityProvider in a realm
 @param {string} realmName - The name of the realm(not the realmID) to delete - ex: master,
 @param {string} alias - The alias of the identityProvider to delete
 @returns {Promise} A promise that resolves.
 @example
 keycloakAdminClient(settings)
 .then((client) => {
      client.realms.identityProvider.remove(realmName, alias)
        .then(() => {
          console.log('success')
      })
    })
 */
function remove(client) {
  return function remove(realmName, alias) {
    return new Promise((resolve, reject) => {
      const req = {
        url: `${client.baseUrl}/admin/realms/${realmName}/identity-provider/instances/${alias}`,
        auth: {
          bearer: privates.get(client).accessToken
        },
        method: 'DELETE'
      };

      request(req, (err, resp, body) => {
        if (err) {
          return reject(err);
        }

        // Check that the status code is a 204
        if (resp.statusCode !== 204) {
          return reject(body);
        }

        return resolve(body);
      });
    });
  };
}

/**
 A function to get the exportConfiguration of identityProvider for a realm.
 @param {string} realmName - The name of the realm(not the realmID) to delete - ex: master,
 @param {string} alias - The alias of the identityProvider to exportConfiguration
 @returns {Promise} A promise that will resolve with an Object of identityProvider exportConfiguration
 @example
 keycloakAdminClient(settings)
 .then((client) => {
      client.realms.identityProvider.exportConfiguration(realmName, alias)
        .then((exportConfiguration) => {
        console.log(exportConfiguration) // [{...},{...}, ...]
      })
    })
 */
function exportConfiguration(client) {
  return function exportConfiguration(realm, alias) {
    return new Promise((resolve, reject) => {
      const req = {
        auth: {
          bearer: privates.get(client).accessToken
        },
        json: true,
        url: `${client.baseUrl}/admin/realms/${realm}/identity-provider/instances/${alias}/export`
      };

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