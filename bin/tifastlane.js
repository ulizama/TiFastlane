#!/usr/bin/env node

var program = require('commander'),
    chalk = require('chalk'),
    updateNotifier = require('update-notifier'),
    fs = require("fs"),
    tiappxml = require('tiapp.xml'),
    pkg = require('../package.json'),
    xpath = require('xpath'),
    _ = require('underscore'),
    exec = require('../lib/exec')

tifastlane();

// main function
function tifastlane() {

    // status command, shows the current config
    function status() {
        console.log('\n');
        console.log('Apple ID Username: ' + chalk.cyan(cfg.username))
        console.log('Name: ' + chalk.cyan(tiapp.name));
        console.log('AppId: ' + chalk.cyan(tiapp.id));
        console.log('Version: ' + chalk.cyan(tiapp.version));
        console.log('GUID: ' + chalk.cyan(tiapp.guid));
        console.log('SKU: ' + chalk.cyan( build_sku(tiapp.id) ));

        console.log('\n');
    }

    function register(platform) {

        if( platform && !_.contains(['appstore','development','adhoc'], platform) ){
            console.log(chalk.red('Invalid platform value: ' + platform));
            return;
        }

        //First step is to register the application using fastlane.produce
        console.log( chalk.cyan('Creating app on Apple Developer Portal ' + ( program.skip_itc ? 'Skipping iTunes Connect' : '& iTunes Connect') ));

        var produceArgs = [
            '--username', cfg.username,
            '--app_identifier', tiapp.id,
            '--app_name', tiapp.name,
            '--sku', build_sku(tiapp.id)
        ];

        if( program.skip_itc ){
            produceArgs.push('--skip_itc');
        }

        exec('produce', produceArgs, null,
            function(e) {

                //We have the app created, now let's build the provisioning profiles with fastlane.sigh
                var platforms = ['development','adhoc','appstore'];

                if( platform == 'development' ){
                    platforms = ['development'];
                }
                else if( platform == 'adhoc' ){
                    platforms = ['adhoc'];   
                }
                else if( platform == 'appstore' ){
                    platforms = ['appstore'];   
                }

                //Create certificate directory if it doesn't exist
                if (!fs.existsSync(certDirs)){
                    fs.mkdirSync(certDirs);
                }

                platforms.forEach(function (p) {

                    console.log( chalk.cyan('Creating Provision Profile on environment: ' + p) );

                    var sighArgs = [
                        '-u', cfg.username,
                        '-a', tiapp.id,
                        '-o', certDirs
                    ];

                    if( program.skip_install ){
                        sighArgs.push('--skip_install');
                    }

                    if( program.force ){
                        sighArgs.push('--force');
                    }

                    if( program.skip_fetch_profiles ){
                        sighArgs.push('--skip_fetch_profiles');   
                    }

                    if( p == 'development' ){
                        sighArgs.push('--development');
                    }
                    else if( p == 'adhoc' ){
                        sighArgs.push('--adhoc');
                    }

                    exec('sigh', sighArgs, null,
                        function(e) {
                            //Done
                        }
                    );
                });

            }
        );

    }


    // setup CLI
    program
        .version(pkg.version, '-v, --version')
        .usage('[options]')
        .description(pkg.description)
        .option('--status', 'Displays the information available from the config')
        .option('--register <platform>', 'Register app and create provisioning profiles')
        .option('-f, --force', 'On register it forces the provisioning profiles to be renewed')
        .option('-i, --skip_itc', 'Skip the creation of the app on iTunes Connect')
        .option('--skip_install', 'Skip installation of new provisioning profiles')
        .option('--skip_fetch_profiles', 'Skips the verification of existing profiles which is useful if you have thousands of profiles')

    program.parse(process.argv);

    var cfgfile = 'tifastlane.cfg';
    var infile = 'tiapp.xml';
    var certDirs = './TiFLCertificates';

    // check that all required input paths are good
    [cfgfile, infile].forEach(function (file) {
        if (!fs.existsSync(file)) {
            console.log(chalk.red('Cannot find ' + file));
            program.help();
        }
    });

    // read in our config
    var cfg = JSON.parse(fs.readFileSync(cfgfile, "utf-8"));

    if( !cfg.username ){
        console.log(chalk.red('Cannot determine username from configuration'));
        program.help();
    }

    // read in the app config
    var tiapp = tiappxml.load(infile);

    // check for a new version
    updateNotifier({
        packageName: pkg.name,
        packageVersion: pkg.version
    }).notify();

    if( program.status ){
        status();
    }
    else if( program.register ){
        register(program.args[0]);
    }

}

function build_sku( appid ){
    //We are going to use the same id of the app, for the SKU
    var sku = appid.toUpperCase().replace(/\./g, "_");
    return sku;
}