#!/usr/bin/env node

var program = require('commander'),
    chalk = require('chalk'),
    updateNotifier = require('update-notifier'),
    fs = require("fs"),
    tiappxml = require('tiapp.xml'),
    pkg = require('../package.json'),
    xpath = require('xpath'),
    _ = require('underscore'),
    exec = require('../lib/exec'),
    templates = require('../lib/templates')

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


    function deliverinit(){

        //Create delivery directory if it doesn't exist
        if (!fs.existsSync(deliveryDir)){
            fs.mkdirSync(deliveryDir);
        }

        //Create delivery directory if it doesn't exist
        if (!fs.existsSync(appDeliveryDir)){
            fs.mkdirSync(appDeliveryDir);
        }

        if (fs.existsSync(appDeliveryDir + "/Deliverfile")){
            console.log(chalk.red('App is already initialized. If you wish to redo the process please remove the "' + appDeliveryDir + '" directory'));
            return;
        }

        //Create metadata and screenshot directories
        if (!fs.existsSync(appDeliveryDir+'/metadata')){
            fs.mkdirSync(appDeliveryDir+'/metadata');
        }

        if (!fs.existsSync(appDeliveryMetaDir)){
            fs.mkdirSync(appDeliveryMetaDir);
        }

        if (!fs.existsSync(appDeliveryDir+'/screenshots')){
            fs.mkdirSync(appDeliveryDir+'/screenshots');
        }

        if (!fs.existsSync(appDeliveryScreenDir)){
            fs.mkdirSync(appDeliveryScreenDir);
        }

        var _deliverFile = templates.deliverFile;
        _deliverFile = _deliverFile.replace("[APP_ID]", tiapp.id).replace("[EMAIL]", cfg.username);

        fs.writeFileSync(appDeliveryDir + "/Deliverfile", _deliverFile);

        //Create metadata files
        var metafiles = ['description.txt','keywords.txt','privacy_url.txt','software_url.txt','support_url.txt','title.txt','version_whats_new.txt'];

        metafiles.forEach(function (file) {
            var data = "";
            if( file == "title.txt" ){
                data = tiapp.name;
            }
            fs.writeFileSync(appDeliveryMetaDir + "/" + file, data);
        });

        console.log(chalk.green('Your app "deliver" configuration has been created.'));
        console.log(chalk.green('You can find your configuration files on: ' + appDeliveryDir));
        console.log(chalk.green('Go in and tweak your configuration.'));

    }


    function deliverwizard(){

        //Create delivery directory if it doesn't exist
        if (!fs.existsSync(deliveryDir)){
            fs.mkdirSync(deliveryDir);
        }

        //Create delivery directory if it doesn't exist
        if (!fs.existsSync(appDeliveryDir)){
            fs.mkdirSync(appDeliveryDir);
        }

        if (fs.existsSync(appDeliveryDir + "/Deliverfile")){
            console.log(chalk.red('App is already initialized. If you wish to redo the process please remove the "' + appDeliveryDir + '" directory'));
            return;
        }

        var initArgs = [
            'init',
            '--username', cfg.username
        ];

        exec('deliver', initArgs, { cwd: appDeliveryDir }, function(e){
            console.log(chalk.green('Your app has been initialized.'));
            console.log(chalk.green('You can find your configuration files for delivery on: ' + appDeliveryDir));
            console.log(chalk.green('Now the fun starts!'));
        });

    }


    function updatemeta(){

        if (!fs.existsSync(appDeliveryDir + "/Deliverfile")){
            console.log(chalk.red('You need to initialize the "deliver" settings.'));
            program.help();
            return;
        }

        var initArgs = [
            'upload_metadata',
            '--skip-deploy'
        ];

        if( program.skip_verify ){
            initArgs.push('--force');
        }

        exec('deliver', initArgs, { cwd: appDeliveryDir }, function(e){
            console.log(chalk.green('Done'));
        });

    }


    function sendapp(){

        if (!fs.existsSync(appDeliveryDir + "/Deliverfile")){
            console.log(chalk.red('You need to initialize the "deliver" settings.'));
            program.help();
            return;
        }

        var newFileContents = "";
        var _hasipa = false;

        fs.readFileSync(deliverFile).toString().split('\n').forEach(function (line) {

            if( /^ipa /.test(line) ){
                _hasipa = true;
                newFileContents = newFileContents + 'ipa "../../build/' + tiapp.name + '.ipa"' + "\n";
            }
            else{
                newFileContents = newFileContents + line + "\n";
            }
            //fs.appendFileSync(deliverFile, line.toString() + "\n");
        });

        if( !_hasipa ){
            newFileContents = newFileContents + 'ipa "../../build/' + tiapp.name + '.ipa"' + "\n";
        }

        fs.writeFileSync(deliverFile, newFileContents);

        var buildArgs = [
            'build',
            '-p', 'ios',
            '-T', 'dist-adhoc',
            '-O', './build'
        ];

        function _deliver(){
            
            console.log("\n");
            console.log(chalk.yellow('Starting deliver'));

            var initArgs = [
                'run'
            ];

            if( program.skip_verify ){
                initArgs.push('--force');
            }

            exec('deliver', initArgs, { cwd: appDeliveryDir }, function(e){
                console.log(chalk.green('Done'));
            });            
        }

        if( program.skip_build ){
            console.log(chalk.yellow('Skipping Titanium App Store Build'));
            _deliver();
        }
        else{

            console.log(chalk.yellow('Starting Titanium App Store Build'));
            console.log("\n");

            exec('titanium', buildArgs, null, function(e){
                _deliver();
            });

        }

    }


    function register(platform) {

        if( platform && !_.contains(['appstore','development','adhoc'], platform) ){
            console.log(chalk.red('Invalid platform value: ' + platform));
            return;
        }

        //First step is to register the application using fastlane.produce
        console.log( chalk.cyan('Creating app on Apple Developer Portal ' + ( program.skip_itc ? 'Skipping iTunes Connect' : '& iTunes Connect') ));

        var sku = build_sku(tiapp.id);

        console.log( chalk.white('APP ID: ' + tiapp.id) );
        console.log( chalk.white('APP Name: ' + tiapp.name) );
        console.log( chalk.white('Version: ' + tiapp.version) );

        var produceArgs = [
            '--username', cfg.username,
            '--app_identifier', tiapp.id,
            '--app_version', tiapp.version,
            '--app_name', tiapp.name
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
                if (!fs.existsSync(certDir)){
                    fs.mkdirSync(certDir);
                }

                platforms.forEach(function (p) {

                    console.log( chalk.cyan('Creating Provision Profile on environment: ' + p) );

                    var sighArgs = [
                        '-u', cfg.username,
                        '-a', tiapp.id,
                        '-o', certDir
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
        .option('--init', 'Initialize the deliver configuration')
        .option('--initwizard', 'If your app is already on the App Store run the wizard')
        .option('--updatemeta', 'Update metadata and screenshots on iTunes Connect')
        .option('--sendapp', 'Send new App version to iTunes Connect')
        .option('-f, --force', 'On register it forces the provisioning profiles to be renewed')
        .option('-i, --skip_itc', 'Skip the creation of the app on iTunes Connect')
        .option('--skip_install', 'Skip installation of new provisioning profiles')
        .option('--skip_fetch_profiles', 'Skips the verification of existing profiles which is useful if you have thousands of profiles')
        .option('--skip_verify', 'Skip verification of metadata on update')
        .option('--skip_build', 'Skip build of App Store ipa')

    program.parse(process.argv);

    var cfgfile = 'tifastlane.cfg';
    var infile = 'tiapp.xml';
    var certDir = './TiFLCertificates';
    var deliveryDir = './TiFLDelivery';

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

    //Path Dirs
    var appDeliveryDir = deliveryDir + '/' + tiapp.id;
    var deliverFile = appDeliveryDir + "/Deliverfile";
    var appDeliveryMetaDir = appDeliveryDir + '/metadata/en-US';
    var appDeliveryScreenDir = appDeliveryDir + '/screenshots/en-US';

    // check for a new version
    updateNotifier({
        packageName: pkg.name,
        packageVersion: pkg.version
    }).notify();

    if( program.status ){
        status();
    }
    else if( program.init ){
        deliverinit();
    }
    else if( program.initwizard ){
        deliverwizard();
    }
    else if( program.updatemeta ){
        updatemeta();
    }
    else if( program.sendapp ){
        sendapp();
    }
    else if( program.register ){
        register(program.args[0]);
    }

}

function build_sku( appid ){
    //We are going to use the same id of the app, for the SKU
    var sku = appid.toUpperCase().replace(/\./g, "") + randomIntInc(100,999);
    return sku;
}

function randomIntInc (low, high) {
    return Math.floor(Math.random() * (high - low + 1) + low);
}