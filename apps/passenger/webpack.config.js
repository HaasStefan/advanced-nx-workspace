const { shareAll, withModuleFederationPlugin } = require('@angular-architects/module-federation/webpack');
 
 // Version 14
 module.exports = withModuleFederationPlugin({
 
   name: 'passenger',
 
   exposes: {
     './Module': './apps/passenger/src/app/passenger/passenger.module.ts',
   },
 
   shared: {
     ...shareAll({ singleton: true, strictVersion: true, requiredVersion: 'auto' }),
   },
 
 });