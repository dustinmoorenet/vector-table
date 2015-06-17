import request from 'request';

export default function ajax(args) {
    args.baseUrl = location.origin || location.protocol + "//" + location.host;
    args.json = true;

    var promise = new Promise((resolve, reject) => {
        request(args, (err, res, body) => {
            if (err) {
                console.error(err);
                reject(err);
            }

            resolve(body);
        });
    });

    return promise;
}
