import fetch from 'cross-fetch';
import createHistory from 'history/createBrowserHistory';

export const history = createHistory();

// Taken from https://github.com/github/fetch/issues/203#issuecomment-266034180
/**
 * Parses the JSON returned by a network request
 *
 * @param  {object} response A response from a network request
 *
 * @return {object}          The parsed JSON, status from the response
 */
function parseJSON(response) {
  if (response.status === 204) {
    return new Promise((resolve) => resolve({
      status: response.status,
      ok: response.ok,
    }));
  };

  return new Promise((resolve) => response.json()
    .then((json) => resolve({
        status: response.status,
        ok: response.ok,
        json
      })
    )
  );
}

/**
 * Requests a URL, returning a promise
 *
 * @param  {string} url       The URL we want to request
 * @param  {object} [options] The options we want to pass to "fetch"
 *
 * @return {Promise}          The request promise
 */
export function request(url, options) {
  return new Promise((resolve, reject) => {
    fetch(url, options)
      .then(parseJSON)
      .then((response) => {
        if (response.ok) {
          return resolve(response.json || null);
        }
        // Sometimes error message might be a json, sometimes not
        let errorMsg = response.json.message
        try {
          errorMsg = JSON.parse(errorMsg);
        }
        catch {}

        // extract the error from the server's json
        return reject({ status: response.status, code: response.json.code, message: errorMsg });
      })
      .catch((error) => reject({
        networkError: error.message,
      }));
  });
}