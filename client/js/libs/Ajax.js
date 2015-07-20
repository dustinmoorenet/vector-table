export default function ajax(method, url, args) {
    var promise = new Promise((resolve, reject) => {

        // Instantiates the XMLHttpRequest
        var client = new XMLHttpRequest();
        var uri = url;

        if (args && (method === 'POST' || method === 'PUT')) {
            uri += '?';
            var argcount = 0;
            for (var key in args) {
                if (args.hasOwnProperty(key)) {
                    if (argcount++) {
                        uri += '&';
                    }
                    uri += encodeURIComponent(key) + '=' + encodeURIComponent(args[key]);
                }
            }
        }

        client.open(method, uri);
        client.send();

        client.onload = function() {
            if (this.status === 200) {
                // Performs the function "resolve" when this.status is equal to 200
                resolve(this.response);
            }
            else {
                // Performs the function "reject" when this.status is different than 200
                reject(this.statusText);
            }
        };
        client.onerror = function() {
            reject(this.statusText);
        };
    });

    // Return the promise
    return promise;
}

export function get(url, args) {
    return ajax('GET', url, args);
}

export function post(url, args) {
    return ajax('POST', url, args);
}

export function put(url, args) {
    return ajax('PUT', url, args);
}

export function del(url, args) {
    return ajax('DELETE', url, args);
}
