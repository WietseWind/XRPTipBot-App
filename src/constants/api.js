/**
 * API Config
 */

export default {
    apiUrl: 'https://www.xrptipbot.com/app',

    endpoints: new Map([
        // Auth
        ['token', '/api/action:login/'],
        ['internal', '/api/action:internal/'],
        ['logout', '/api/action:unlink/'],
            // paper api
        ['activate', '/paper-api/action:activate'],
        ['webauth', '/api/action:webauth'],
        // account
        ['balance', '/api/action:balance/'],
        ['userinfo', '/api/action:userinfo'],
        // tip`
        ['bump', '/api/action:bump/'],
        ['tip', '/api/action:tip/'],
        // contacts
        ['contacts', '/api/action:contacts/'],
        ['persist', '/api/action:persist'],
        ['lookup', '/api/action:lookup'],
        // push notifications
        ['push_token', '/api/action:persistpushtoken'],


    ]),

    tokenKey: 'token'
};
