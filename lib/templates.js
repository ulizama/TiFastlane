#!/usr/bin/env node

/*jslint node: true */
'use strict';

exports.deliverFile = "###################### App Metadata ######################\n" +
"# Update the app description and metadata in the ./metadata folder\n" +
"\n" +
"###################### Screenshots ######################\n" +
"# Store all screenshots in the ./screenshots folder separated\n" +
"# by language.\n" +
"\n" +
"\n" +
"###################### App Information ######################\n" +
"app_identifier \"[APP_ID]\"\n" +
"apple_id \"[ID]\" # This is NOT your Apple login ID, but the App ID of your app\n" +
"email \"[EMAIL]\" # the login email address\n" +
"\n" +
"\n" +
"###################### More Options ######################\n" +
"# If you want to have even more control, check out the documentation\n" +
"# https://github.com/KrauseFx/deliver/blob/master/Deliverfile.md\n" +
"\n";