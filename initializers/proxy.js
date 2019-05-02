'use strict';

const tunnel = require('tunnel');

/**
 * configures any requested proxy settings for the incoming activity
 * @param {Object} context - the context key of the activity context
 */
module.exports = {
  initialize: (context) => {
    if (context.ProxyServer && context.ProxyServer.EnableProxyServer) {
      const proxy = {
        host: context.ProxyServer.host
      };

      if (context.ProxyServer.port) proxy.port = context.ProxyServer.port;

      if (context.ProxyServer.username && context.ProxyServer.password) {
        proxy.proxyAuth = `${context.ProxyServer.username}:${context.ProxyServer.password}`;
      } else if (context.ProxyServer.username) {
        proxy.proxyAuth = context.ProxyServer.username;
      } else if (context.ProxyServer.password) {
        proxy.proxyAuth = context.ProxyServer.password;
      }

      context.ProxyServer.agent = tunnel.httpsOverHttp({
        proxy: proxy
      });
    }
  }
};
