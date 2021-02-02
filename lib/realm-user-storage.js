'use strict';

const privates = require('./private-map');
const request = require('request');

/**
 * @module clients
 */

module.exports = {
  find: find,
  create: create,
  update: update,
  remove: remove,
  removeImportedUsers: removeImportedUsers,
  triggerChangedUsersSync: triggerChangedUsersSync,
  triggerFullSync: triggerFullSync,
  unlinkImportedUsers: unlinkImportedUsers
};

/**
 A function to get the list of userStorages or a userStorage for a realm.
 @param {string} realmName - The name of the realm(not the realmID) - ex: master
 @param {object} [options] - The options object
 @param {string} [options.id] - use this options to get a userStorage by an id.
 @returns {Promise} A promise that will resolve with an Array of userStorage objects or just the 1 userStorage object if id is used
 @example
 keycloakAdminClient(settings)
 .then((client) => {
      client.realms.userStorage.find(realmName)
        .then((userStorageList) => {
        console.log(userStorageList) // [{...},{...}, ...]
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

      if (options.id) {
        req.url = `${client.baseUrl}/admin/realms/${realm}/components/${options.id}`;
      } else {
        req.url = `${client.baseUrl}/admin/realms/${realm}/components?parent=${realm}&type=org.keycloak.storage.UserStorageProvider`;        req.qs = options;
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
 A function to create a new user storage for a realm.
 @param {string} realmName - The name of the realm(not the realmID) - ex: master
 @param {object} userStorage - The JSON representation of a userStorage
 @returns {Promise} A promise that will resolve with the user object
 @example
 keycloakAdminClient(settings)
 .then((client) => {
      client.realms.userStorage.create(realmName, userStorage)
        .then((createduserStorage) => {
        console.log(createduserStorage) // [{...}]
      })
    })
 */
function create(client) {
  return function create(realmName, userStorage) {
    return new Promise((resolve, reject) => {
      const req = {
        url: `${client.baseUrl}/admin/realms/${realmName}/components`,
        auth: {
          bearer: privates.get(client).accessToken
        },
        body: userStorage,
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
        // *** Body is empty but location header contains userStorage id ***
        // We need to search based on the userStorage.id, since it will be unique
        return resolve(client.realms.userStorage.find(realmName, {
          id: uid
        }));
      });
    });
  };
}

/**
 A function to update a userStorage for a realm
 @param {string} realmName - The name of the realm(not the realmID) - ex: master,
 @param {object} userStorage - The JSON representation of the fields to update for the userStorage
 - This must include the userStorage.id field.
 @returns {Promise} A promise that resolves.
 @example
 keycloakAdminClient(settings)
 .then((client) => {
      client.realms.userStorage.update(realmName, userStorage)
        .then(() => {
          console.log('success')
      })
    })
 */
function update(client) {
  return function update(realmName, userStorage) {
    return new Promise((resolve, reject) => {
      userStorage = userStorage || {};
      const req = {
        url: `${client.baseUrl}/admin/realms/${realmName}/components/${userStorage.id}`,
        auth: {
          bearer: privates.get(client).accessToken
        },
        json: true,
        method: 'PUT',
        body: userStorage
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
 A function to delete a userStorage in a realm
 @param {string} realmName - The name of the realm(not the realmID) to delete - ex: master,
 @param {string} id - The id of the userStorage to delete
 @returns {Promise} A promise that resolves.
 @example
 keycloakAdminClient(settings)
 .then((client) => {
      client.realms.userStorage.remove(realmName, id)
        .then(() => {
          console.log('success')
      })
    })
 */
function remove(client) {
  return function remove(realmName, id) {
    return new Promise((resolve, reject) => {
      const req = {
        url: `${client.baseUrl}/admin/realms/${realmName}/components/${id}`,
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

function triggerChangedUsersSync(client) {
  return function triggerChangedUsersSync(realm, id) {
    return new Promise((resolve, reject) => {
      const req = {
        auth: {
          bearer: privates.get(client).accessToken
        },
        json: true,
        url: `${client.baseUrl}/admin/realms/${realm}/user-storage/${id}/sync?action=triggerChangedUsersSync`
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

function triggerFullSync(client) {
  return function triggerFullSync(realm, id) {
    return new Promise((resolve, reject) => {
      const req = {
        auth: {
          bearer: privates.get(client).accessToken
        },
        json: true,
        url: `${client.baseUrl}/admin/realms/${realm}/user-storage/${id}/sync?action=triggerFullSync`
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

function removeImportedUsers(client) {
  return function removeImportedUsers(realm, id) {
    return new Promise((resolve, reject) => {
      const req = {
        auth: {
          bearer: privates.get(client).accessToken
        },
        json: true,
        url: `${client.baseUrl}/admin/realms/${realm}/user-storage/${id}/remove-imported-users`
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

function unlinkImportedUsers(client) {
  return function unlinkImportedUsers(realm, id) {
    return new Promise((resolve, reject) => {
      const req = {
        auth: {
          bearer: privates.get(client).accessToken
        },
        json: true,
        url: `${client.baseUrl}/admin/realms/${realm}/user-storage/${id}/unlink-users`
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