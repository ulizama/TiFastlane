var chalk = require('chalk')
  , os = require('os')
  , fs = require("fs")
  , path = require("path")
  , tiappxml = require('tiapp.xml')
  , plist = require('plist')
  , pkg = require('./package.json')
  , xpath = require('xpath')
  , _ = require('underscore')
  , exec = require('./lib/exec')
  , _exec = require('child_process').exec
  , templates = require('./lib/templates')
  , inquirer = require('inquirer')
  //\\
  , cfgfile = 'tifastlane.cfg'
  , infile = 'tiapp.xml'
  , certDir = './TiFLCertificates'
  , deliveryDir = './TiFLDelivery'
  , pilotDir = './TiFLPilot'
  , tiapp = {}
  , TiVersion = {}
  , cfg = {
      cli : "appc"
    , locale : "en-US"
    , apple_id : "null"
  }
  , appDeliveryDir = null
  , appAndroidDeliveryDir = null
  , deliverFile = null
  , appDeliveryMetaDir = null
  , appDeliveryScreenDir = null
  , fastlaneBinary = 'fastlane'
  //\\
  , canLoad = true
  ;


/*
@ Read configuration files
*/
exports.loadconfig = function( cfg_file ){

    if( cfg_file ){
        cfgfile = cfg_file;
        console.log(chalk.white('Using config file: ' + cfgfile));
    }

    if (!fs.existsSync(infile)) {
        console.log(chalk.red('Cannot find ' + infile));
        console.log(chalk.yellow('tifast must be run on the root of your Titanium App'));
        process.exit();
    }

    if (!fs.existsSync(cfgfile)) {
        console.log(chalk.red('Cannot find ' + cfgfile));
        console.log(chalk.yellow('Run ') + chalk.cyan('tifast setup') + chalk.yellow(' to initialize your tifast configuation.') );
        process.exit();
    }

    // read in our config
    cfg = JSON.parse(fs.readFileSync(cfgfile, "utf-8"));

    // for old tifastlane.cfg
    if (!cfg.android_app_id) cfg.android_app_id = "null";

    if( cfg.android_app_id != "null" ){
        manageAppID();
    }

    tiapp = tiappxml.load(infile);

    TiVersion = parseVersionString(tiapp['sdk-version']);

    /*
    @ Path Directories
    */
    appDeliveryDir = deliveryDir + '/' + tiapp.id
      , appAndroidDeliveryDir = appDeliveryDir + "/PlayStore"
      , deliverFile = appDeliveryDir + "/Deliverfile"
      , appDeliveryMetaDir = (!cfg.locale) ? appDeliveryDir + '/metadata/en-US' : appDeliveryDir + '/metadata/' + cfg.locale
      , appDeliveryScreenDir = (!cfg.locale) ? appDeliveryDir + '/screenshots/en-US' : appDeliveryDir + '/screenshots/' + cfg.locale
      , fastlaneBinary = (cfg.fastlane_binary)
      		? (path.isAbsolute(cfg.fastlane_binary) || cfg.fastlane_binary === 'fastlane'
      			? cfg.fastlane_binary
      			: fs.realpathSync(path.dirname(cfgfile) + "/" + cfg.fastlane_binary))
      		: 'fastlane'
      ;

}

/*
@ bumpBundleVersion
*/
function bumpBundleVersion(){
  var tiapp = fs.readFileSync('tiapp.xml', {
      encoding: 'utf-8'
  });

  tiapp = tiapp.replace(/(<key>CFBundleVersion<\/key>\s*<string>)([^< ]+)(<\/string>)/mg, function (match, before, CFBundleVersion, after) {
      CFBundleVersion = parseInt(CFBundleVersion, 10) + 1;

      console.log(chalk.green('Bumped CFBundleVersion to: ' + CFBundleVersion));

      return before + CFBundleVersion + after;
  });

  fs.writeFileSync('tiapp.xml', tiapp);
};

/*
@ extraFiles
*/
function extraFiles(){
    // Create ratings.json
    var _deliverRatingJson = templates.ratings;
    fs.writeFileSync(appDeliveryDir + "/rating.json", _deliverRatingJson);

    // Create SnapShots Files
    /*
    var _deliverSnapfile = templates.Snapfile;
    _deliverSnapfile = _deliverSnapfile.replace("[SCHEME]", tiapp.name).replace("[PATH]", "../../build/iphone/" + tiapp.name + ".xcodeproj");
    fs.writeFileSync(appDeliveryDir + "/Snapfile", _deliverSnapfile);

    var _deliversnapshotiPad = templates.snapshotiPad;
    fs.writeFileSync(appDeliveryDir + "/snapshot-iPad.js", _deliversnapshotiPad);

    var _deliverSnapshot = templates.snapshot;
    fs.writeFileSync(appDeliveryDir + "/snapshot.js", _deliverSnapshot);

    var _deliverSnapshotHelper = templates.SnapshotHelper;
    fs.writeFileSync(appDeliveryDir + "/SnapshotHelper.js", _deliverSnapshotHelper);
    */

    // Pilot
    // if (!fs.existsSync(pilotDir)){
    //     fs.mkdirSync(pilotDir);
    // }
    // var pilotImport = templates.pilotImport;
    // fs.writeFileSync(pilotDir + "/tester_import.csv", pilotImport);
};

/*
@ localStatus( To send function be able to use it too )
*/
function localStatus(e) {

    e = e || {};

    // Trick to get Bundle Version since tiapp.xml doesn't expose it
    var _tiappFile = fs.readFileSync('tiapp.xml', {
            encoding: 'utf-8'
        }),
        CFBundleVersion = 0,
        versionCode = 0;

    _tiappFile.replace(/(versionCode=\")([^< ]+)(")/mg, function(match, before, _versionCode, after) {
        versionCode = parseInt(_versionCode, 10);
    });

    _tiappFile.replace(/(<key>CFBundleVersion<\/key>\s*<string>)([^< ]+)(<\/string>)/mg, function(match, before, _CFBundleVersion, after) {
        CFBundleVersion = parseInt(_CFBundleVersion, 10);
    });


    console.log('\n');
    console.log('Name:', chalk.cyan(tiapp.name));
    console.log('Version:', chalk.yellow(tiapp.version));
    console.log('GUID:', chalk.cyan(tiapp.guid));
    console.log('AppId:', chalk.cyan(tiapp.id));
    console.log('SDK Version:', 'major', chalk.cyan(TiVersion.major), 'minor', chalk.cyan(TiVersion.minor), 'patch', chalk.cyan(TiVersion.patch));

    if (e.type !== 'Android') {
        console.log(chalk.cyan("iOS:"));
        if (cfg.apple_id != "null") console.log('\t', 'Apple ID:', chalk.cyan(cfg.apple_id));
        if (cfg.team_id != "null") console.log('\t', 'Team ID:', chalk.cyan(cfg.team_id));
        if (cfg.team_name != "null") console.log('\t', 'Team Name:', chalk.cyan(cfg.team_name));
        console.log('\t', 'CFBundleVersion:', chalk.yellow(CFBundleVersion));
    }

    if (e.type !== 'iOS') {
        console.log(chalk.cyan("Android:"));
        if (cfg.android_app_id != "null") console.log('\t', 'Android AppID:', chalk.cyan(cfg.android_app_id));
        console.log('\t', 'android:versionCode:', chalk.yellow(versionCode));
    }

    console.log('\n');
};

/*
@ Upload Metadata
*/
function uploadMetadata(){
    if (!fs.existsSync(appDeliveryDir + "/Deliverfile")){
        console.log(chalk.red('You need to run "tifast init" first'));
        return;
    }

    var initArgs = [
        'deliver'
    ];

    exec(fastlaneBinary, initArgs, { cwd: appDeliveryDir }, function(e){
        console.log(chalk.green('\nDone\n'));
    });
};

/*
@ upload Beta Test IPA
*/
function uploadBetaTestIPA(opts){

    if (!fs.existsSync(appDeliveryDir + "/Deliverfile")){
        console.log(chalk.red('You need to run "tifast init" first'));
        return;
    }

    /*
    @ TestFlight
    */
    function _pilot(){
        console.log("\n");
        console.log(chalk.yellow('Starting Pilot'));

        var pilotArgs = [
            'pilot',
            'upload'
          , '-u' , cfg.apple_id
          , '-i' , "../../dist/" + tiapp.name + ".ipa"
        ];

        if( opts.skip_waiting_for_build_processing ){
          pilotArgs.push(
                '--skip_waiting_for_build_processing'
            );
        }
        
        if(cfg.team_name != "null"){
          pilotArgs.push('-r');
          pilotArgs.push(cfg.team_name);
        }
        
        exec(fastlaneBinary, pilotArgs, { cwd: appDeliveryDir }, function(e){
            console.log(chalk.green('\nDone\n'));
        });
    };

    /*
    @ status app
    */
    localStatus({
        type: 'iOS'
    });

    if( opts.skip_build ){

        console.log(chalk.yellow('Skipping Appcelerator App Store Build'));
        _pilot();

    }else{

        /*
        @ Update +1 to BundleVersion( compiler version )
        */
        bumpBundleVersion();

        console.log(chalk.yellow('First things first. Clean project to ensure build'));
        console.log("\n");

        var cleanArgs = [];

        if(cfg.cli == "appc"){
            cleanArgs.push('ti');
        }

        cleanArgs.push('clean');
        cleanArgs.push('-p');
        cleanArgs.push('ios');

        exec(cfg.cli, cleanArgs, null, function(e){
            buildIPA(opts, _pilot);
        });

    }
};

/*
@ smartInit
*/
function smartInit(){
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
        'deliver',
        'init',
        '--username', cfg.apple_id,
        '-a', tiapp.id
    ];

    exec(fastlaneBinary, initArgs, { cwd: appDeliveryDir }, function(e){
        // Create Extra Files
        extraFiles();

        console.log(chalk.green('Your app has been initialized.'));
        console.log(chalk.green('You can find your configuration files for delivery on: ' + appDeliveryDir));
        console.log(chalk.green('Now the fun starts!'));
    });
};

/*
@ dealWithResults
*/
function dealWithResults(json){
    // console.log('json: ', json);
    // Set CLI
    cfg.cli = ( json.cli == "appcelerator" ) ? "appc" : "ti";
    cfg.locale = json.locale;
    cfg.apple_id = json.apple_id;
    cfg.team_id = ( json.team_id ) ? json.team_id : null;
    cfg.team_name = ( json.team_name ) ? json.team_name : null;
    cfg.google_play_json_key = ( json.google_play_json_key ) ? json.google_play_json_key : null;
    cfg.google_play_issuer = ( json.google_play_issuer ) ? json.google_play_issuer : null;
    cfg.google_keystore_file = ( json.google_keystore_file ) ? json.google_keystore_file : null;
    cfg.google_keystore_password = ( json.google_keystore_password ) ? json.google_keystore_password : null;
    cfg.google_keystore_alias = ( json.google_keystore_alias ) ? json.google_keystore_alias : null;
    cfg.fastlane_binary = ( json.fastlane_binary ) ? json.fastlane_binary : 'fastlane';
    cfg.ios_build_args = (json.ios_build_args) ? json.ios_build_args : null;
    cfg.android_build_args = (json.android_build_args) ? json.android_build_args : null;
    cfg.android_app_id = (json.android_app_id) ? json.android_app_id : null;

    var cfgFile = templates.cfgFile;
    cfgFile = cfgFile.replace("[CLI]", cfg.cli).replace("[LOCALE]", cfg.locale).
    replace('[APPLE_ID]', cfg.apple_id).replace('[TEAM_ID]', cfg.team_id).
    replace('[TEAM_NAME]', cfg.team_name).replace('[GOOGLE_PLAY_JSON_KEY]', cfg.google_play_json_key).
    replace('[GOOGLE_KEYSTORE_FILE]', cfg.google_keystore_file).
    replace('[GOOGLE_KEYSTORE_PASSWORD]', cfg.google_keystore_password).
    replace('[GOOGLE_KEYSTORE_ALIAS]', cfg.google_keystore_alias).
    replace('[FASTLANE_BINARY]', cfg.fastlane_binary).
    replace('[IOS_BUILD_ARGS]',cfg.ios_build_args).
    replace('[ANDROID_BUILD_ARGS]',cfg.android_build_args).
    replace('[ANDROID_APPLICATION_ID]',cfg.android_app_id);
    fs.writeFileSync( "./tifastlane.cfg", cfgFile);

    console.log('\n ');
    console.log(chalk.yellow('tifastlane.cfg created'));
    console.log(chalk.green('All Done!'));
    console.log('\n ');
};

/*
@ export setup function to CLI
*/
exports.setup = function(opts){

    inquirer.prompt([
        {
            type: "list",
            name: "cli",
            message: "Which CLI do you want to use?",
            choices: [ "Appcelerator", "Titanium" ],
            filter: function( val ) { return val.toLowerCase(); }
        },

        {
            type: "list",
            name: "locale",
            message: "What locale do you want to use?",
            choices: [ "en-US", "da", "de-DE", "el", "en-AU", "en-CA", "en-GB", "es-ES", "es-MX", "fi", "fr-CA", "fr-FR", "id", "it", "ja", "ko", "ms", "nl", "no", "pt-BR", "pt-PT", "ru", "sv", "th", "tr", "vi", "zh-Hans", "zh-Hant" ]
        },

        {
            type: "input",
            name: "apple_id",
            message: "What's your apple@id.com?",
            validate: function( value ) {
                var re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;

                var pass = re.test( value );

                if (pass) {
                    return true;
                } else {
                    return "Please enter a valid email";
                }
            }
        },

        {
            type: "input",
            name: "team_id",
            message: "What's your TEAM ID? Leave it if you don't want to use it"
        },

        {
            type: "input",
            name: "team_name",
            message: "What's your TEAM NAME? Leave it if you don't want to use it"
        },

        {
            type: "input",
            name: "ios_build_args",
            message: "Append build arguments for ios."
        },

        {
            type: "input",
            name: "google_play_json_key",
            message: "What's your Google Play Key File? (leave empty for default)",
            default: "GooglePlayKey.json"
        },

        {
            type: "input",
            name: "google_keystore_file",
            message: "Keystore Location. Path to your keystore file that is used to sign your application."
        },

        {
            type: "input",
            name: "google_keystore_password",
            message: "Keystore Password. Password to your keystore."
        },

        {
            type: "input",
            name: "google_keystore_alias",
            message: "Key Alias. Alias associated with your application's certificate."
        },
        
        {
            type: "input",
            name: "android_build_args",
            message: "Append build arguments for android."
        },

        {
            type: "input",
            name: "android_app_id",
            message: "Optional Application ID to use for Android, if empty it will use the default one"
        },

        {
            type: "input",
            name: "fastlane_binary",
            message: "Optional absolute path or relative to this config, to the Fastlane binary",
            default: "fastlane"
        }

    ]).then( function( answers ) {
            dealWithResults( answers );
        }
    );
};

/*
@ export init function to CLI
*/
exports.init = function(opts){
    if(!fs.existsSync(cfgfile)){
        console.log(chalk.red("==================================="));
        console.log(chalk.red('Cannot find ', cfgfile));
        console.log(chalk.yellow('You must run ') + chalk.cyan('tifast setup'));
        console.log(chalk.red("==================================="));
        console.log('\n ');
        return
    }

    if(opts.smart){
        console.log(chalk.cyan('Initializing TiFastLane Smart Mode'));
        smartInit();

    }else{
        console.log(chalk.cyan('Initializing TiFastLane'));

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

        // Create DeliverFile
        var _deliverFile = templates.deliverFile;
        _deliverFile = _deliverFile.replace("[APP_ID]", tiapp.id).replace("[EMAIL]", cfg.apple_id);

        fs.writeFileSync(appDeliveryDir + "/Deliverfile", _deliverFile);

        // Create Extra Files
        extraFiles();


        //Create metadata files
        var metafiles = ['description.txt','keywords.txt','privacy_url.txt','marketing_url.txt','support_url.txt','name.txt','release_notes.txt'];

        metafiles.forEach(function (file) {
            var data = "";
            if( file == "name.txt" ){
                data = tiapp.name;
            }
            fs.writeFileSync(appDeliveryMetaDir + "/" + file, data);
        });

        console.log(chalk.green('Your app "deliver" configuration has been created.'));
        console.log(chalk.green('You can find your configuration files on: ' + appDeliveryDir));
        console.log(chalk.green('Go in and tweak your configuration.'));
    }
};

/*
@ export send function to CLI
*/
exports.send = function(opts){

    if(!fs.existsSync(cfgfile)){
        console.log(chalk.red("==================================="));
        console.log(chalk.red('Cannot find ', cfgfile));
        console.log(chalk.yellow('You must run ') + chalk.cyan('tifast setup'));
        console.log(chalk.red("==================================="));
        console.log('\n ');
        return;
    }

    if( opts.testflight ){
        console.log(chalk.cyan('Sending App to Beta Test'));
        return uploadBetaTestIPA(opts);
    }

    //Check the ios args
    if( cfg.ios_build_args && cfg.ios_build_args != "" ){
        
        var regex = new RegExp(/-p\b|-T\b|-O\b/);
        
        if( regex.test(cfg.ios_build_args) ){
            console.log("\n");
            console.log(chalk.red("==================================="));
            console.log(chalk.red(' ERROR ON YOUR IOS BUILD ARGS '));
            console.log(chalk.red(' Starting TiFastlane v0.9 the "ios_build_args" configuration changed how it behaves.'));
            console.log(chalk.red(' Now you use it to append build args instead of replacing them'));
            console.log(chalk.red(' You cannot use -p (platform), -T (target) or -O (output) when appending new args'));
            console.log(chalk.red("==================================="));
            console.log('\n ');
            return;
        }

    }


    /*
    @ App Store
    */
    function _deliver( sendipa ){

        console.log("\n");
        console.log(chalk.yellow('Starting Deliver'));

        var initArgs = [
            'deliver'
        ];

        if( sendipa ){
            initArgs.push('-i', '../../dist/' + tiapp.name + '.ipa');
        }
        else{
            initArgs.push(
                '--skip_binary_upload'
            );
        }

        if( opts.skip_verify ){
            initArgs.push('--force');
        }

        if( opts.skip_screenshots ){
            initArgs.push(
                '--skip_screenshots'
            );
        }

        if( opts.skip_metadata ){
            initArgs.push(
                '--skip_metadata'
            );
        }

        if( opts.submit_for_review ){
            initArgs.push(
                '--submit_for_review'
            );
        }

        if( opts.skip_waiting_for_build_processing ){
            initArgs.push(
                '--skip_waiting_for_build_processing'
            );
        }

        if( opts.automatic_release ){
            initArgs.push(
                '--automatic_release'
            );
        }
        
        if(cfg.team_name != "null"){
          initArgs.push('-e');
          initArgs.push(cfg.team_name);
        }

        exec(fastlaneBinary, initArgs, { cwd: appDeliveryDir }, function(e){
            console.log(chalk.green('\nDeliver Done\n'));
        });

    }

    if( opts.skip_binary_upload ){
        console.log(chalk.cyan('Skipping Binary Upload'));
        _deliver(0);
    }
    else{

        if (!fs.existsSync(appDeliveryDir + "/Deliverfile")){
            console.log(chalk.red('You need to run "tifast init" first'));
            return;
        }

        console.log(chalk.cyan('Updating iTunesConnect'));

        var newFileContents = "";

        fs.readFileSync(deliverFile).toString().split('\n').forEach(function (line) {
            if( /^version /.test(line) ){
                //Update Version
                newFileContents = newFileContents + 'version "' + tiapp.version + '"' + "\n";
            }
            newFileContents = newFileContents + line + "\n";
        });

        fs.writeFileSync(deliverFile, newFileContents);

        /*
        @ status app
        */
        localStatus({
            type: 'iOS'
        });

        if( opts.skip_build ){
            console.log(chalk.yellow('Skipping Appcelerator App Store Build'));
            _deliver(1);

        }else{

            console.log(chalk.yellow('First things first. Clean project to ensure build'));
            console.log("\n");

            var cleanArgs = [];

            if(cfg.cli == "appc"){
                cleanArgs.push('ti');
            }

            cleanArgs.push('clean');

            exec(cfg.cli, cleanArgs, null, function(e){
                buildIPA(opts, _deliver);
            });
        }

    }

};

/*
@ export status function to CLI
*/
exports.status = function(){
    if(!fs.existsSync(cfgfile)){
        console.log(chalk.red("==================================="));
        console.log(chalk.red('Cannot find ', cfgfile));
        console.log(chalk.yellow('You must run ') + chalk.cyan('tifast setup'));
        console.log(chalk.red("==================================="));
        console.log('\n ');
        return
    }

    localStatus();
};

/*
@ export register function to CLI
*/
exports.register = function(opts){
    if(!fs.existsSync(cfgfile)){
        console.log(chalk.red("==================================="));
        console.log(chalk.red('Cannot find ', cfgfile));
        console.log(chalk.yellow('You must run ') + chalk.cyan('tifast setup'));
        console.log(chalk.red("==================================="));
        console.log('\n ');
        return
    }
    // console.log('opts: ', opts);

    //First step is to register the application using fastlane.produce
    console.log( chalk.cyan('Creating app on Apple Developer Portal ' + ( opts.skip_itc ? 'Skipping iTunes Connect' : '& iTunes Connect') ));

    console.log( chalk.white('APP ID: ' + tiapp.id) );
    console.log( chalk.white('APP Name: ' + tiapp.name) );
    console.log( chalk.white('Version: ' + tiapp.version) );

    var produceArgs = [
        'produce',
        '--username', cfg.apple_id,
        '--app_identifier', tiapp.id,
        '--app_version', tiapp.version,
        '--app_name', tiapp.name
    ];

    if( cfg.team_id != "null" ){
        produceArgs.push('--team_id');
        produceArgs.push(cfg.team_id);
    }

    if( cfg.team_name != "null" ){
        produceArgs.push('--team_name');
        produceArgs.push(cfg.team_name);
    }

    if( opts.skip_itc ){
        produceArgs.push('--skip_itc');
    }

    exec(fastlaneBinary, produceArgs, null,
        function(e) {

            if( opts.skip_profiles ){
                //Skip generating provisioning profiles
                return;
            }

            //We have the app created, now let's build the provisioning profiles with fastlane.sigh
            var platforms = ['development','adhoc','appstore'];

            if( opts.platform == 'development' ){
                platforms = ['development'];
            }
            else if( opts.platform == 'adhoc' ){
                platforms = ['adhoc'];
            }
            else if( opts.platform == 'appstore' ){
                platforms = ['appstore'];
            }

            //Create certificate directory if it doesn't exist
            if (!fs.existsSync(certDir)){
                fs.mkdirSync(certDir);
            }

            platforms.forEach(function (p) {

                if( opts.match ){

                    console.log( chalk.cyan('Running fastlane match on environment: ' + p) );

                    var matchArgs = [
                        'match',
                        p,
                        '-u', cfg.apple_id,
                        '-a', tiapp.id
                    ];

                    if( cfg.team_id != "null" ){
                        matchArgs.push('--team_id');
                        matchArgs.push(cfg.team_id);
                    }

                    if( cfg.team_name != "null" ){
                        matchArgs.push('--team_name');
                        matchArgs.push(cfg.team_name);
                    }

                    exec(fastlaneBinary, matchArgs, null,
                        function(e) {
                            //Done
                        }
                    );

                }
                else{

                    console.log( chalk.cyan('Creating Provision Profile on environment: ' + p) );

                    var sighArgs = [
                        'sigh',
                        '-u', cfg.apple_id,
                        '-a', tiapp.id,
                        '-o', certDir
                    ];

                    if( cfg.team_id != "null" ){
                        sighArgs.push('--team_id');
                        sighArgs.push(cfg.team_id);
                    }

                    if( cfg.team_name != "null" ){
                        sighArgs.push('--team_name');
                        sighArgs.push(cfg.team_name);
                    }

                    if( opts.skip_install ){
                        sighArgs.push('--skip_install');
                    }

                    if( opts.skip_fetch_profiles ){
                        sighArgs.push('--skip_fetch_profiles');
                    }

                    if( p == 'development' ){
                        sighArgs.push('--development');
                    }
                    else if( p == 'adhoc' ){
                        sighArgs.push('--adhoc');
                    }

                    exec(fastlaneBinary, sighArgs, null,
                        function(e) {
                            //Done
                        }
                    );

                }

            });

        }
    );
};


/*
@ export repairprofiles function to CLI
*/
exports.repairprofiles = function(opts){
    if(!fs.existsSync(cfgfile)){
        console.log(chalk.red("==================================="));
        console.log(chalk.red('Cannot find ', cfgfile));
        console.log(chalk.yellow('You must run ') + chalk.cyan('tifast setup'));
        console.log(chalk.red("==================================="));
        console.log('\n ');
        return
    }

    //First step is to register the application using fastlane.produce
    console.log( chalk.cyan('Repairing all provisioning profiles on account') );

    var sighArgs = [
        'sigh',
        'repair',
        '--username', cfg.apple_id,
        '--app_identifier', tiapp.id
    ];

    if( cfg.team_id != "null" ){
        sighArgs.push('--team_id');
        sighArgs.push(cfg.team_id);
    }

    if( cfg.team_name != "null" ){
        sighArgs.push('--team_name');
        sighArgs.push(cfg.team_name);
    }

    exec(fastlaneBinary, sighArgs, null,
        function(e) {
            //Done
        }
    );
};


/*
@ export downloadprofiles function to CLI
*/
exports.downloadprofiles = function(opts){
    if(!fs.existsSync(cfgfile)){
        console.log(chalk.red("==================================="));
        console.log(chalk.red('Cannot find ', cfgfile));
        console.log(chalk.yellow('You must run ') + chalk.cyan('tifast setup'));
        console.log(chalk.red("==================================="));
        console.log('\n ');
        return
    }

    //First step is to register the application using fastlane.produce
    console.log( chalk.cyan('Downloading all provisioning profiles on account') );

    var sighArgs = [
        'sigh',
        'download_all',
        '--username', cfg.apple_id,
        '--app_identifier', tiapp.id
    ];

    if( cfg.team_id != "null" ){
        sighArgs.push('--team_id');
        sighArgs.push(cfg.team_id);
    }

    if( cfg.team_name != "null" ){
        sighArgs.push('--team_name');
        sighArgs.push(cfg.team_name);
    }

    exec(fastlaneBinary, sighArgs, null,
        function(e) {
            //Done
        }
    );
};

/*
@ export snapshot function to CLI
*/
/*
exports.snapshot = function(){
    if(!fs.existsSync(cfgfile)){
        console.log(chalk.red("==================================="));
        console.log(chalk.red('Cannot find ', cfgfile));
        console.log(chalk.yellow('You must run ') + chalk.cyan('tifast setup'));
        console.log(chalk.red("==================================="));
        console.log('\n ');
        return
    }

    if (!fs.existsSync(appDeliveryDir + "/Deliverfile")){
        console.log(chalk.red('You need to run "tifast init" first'));
        return;
    }

    console.log( chalk.cyan('Starting Snapshot'));
    console.log("\n");
    console.log( chalk.yellow('This may take several minutes. Don\'t worry, be happy'));

    // Current exe from won't work
    _exec('snapshot', { cwd: appDeliveryDir }, function(e){
        console.log(chalk.green('\nSnapshot Done\n'));
    });
};
*/

/*
@ export pem function to CLI
*/
exports.pem = function(opts){
    if(!fs.existsSync(cfgfile)){
        console.log(chalk.red("==================================="));
        console.log(chalk.red('Cannot find ', cfgfile));
        console.log(chalk.yellow('You must run ') + chalk.cyan('tifast setup'));
        console.log(chalk.red("==================================="));
        console.log('\n ');
        return
    }

    //Create certificate directory if it doesn't exist
    if (!fs.existsSync(certDir)){
        fs.mkdirSync(certDir);
    }

    var pemArgs = [
        'pem',
        '-e', certDir,
        '-a', tiapp.id,
        '-u', cfg.apple_id
    ];

    if( cfg.team_id != "null" ){
        pemArgs.push('--team_id');
        pemArgs.push(cfg.team_id);
    }

    if( cfg.team_name != "null" ){
        pemArgs.push('--team_name');
        pemArgs.push(cfg.team_name);
    }

    if(opts.password != null){
        pemArgs.push('-p');
        pemArgs.push(opts.password);
    }

    if(opts.development) pemArgs.push('--development');

    if(opts.generate_p12) pemArgs.push('--generate_p12');

    if(opts.save_private_key) pemArgs.push('-s');

    if(opts.force) pemArgs.push('--force');

    console.log( chalk.cyan('Starting Pem'));

    exec(fastlaneBinary, pemArgs,null, function(e){
        console.log(chalk.green('\nPem Done\n'));
    });
};

/*
@ export pilot function to CLI
*/
exports.pilot = function(opts){
    if(!fs.existsSync(cfgfile)){
        console.log(chalk.red("==================================="));
        console.log(chalk.red('Cannot find ', cfgfile));
        console.log(chalk.yellow('You must run ') + chalk.cyan('tifast setup'));
        console.log(chalk.red("==================================="));
        console.log('\n ');
        return
    }

    if (!fs.existsSync(appDeliveryDir + "/Deliverfile")){
        console.log(chalk.red('You need to run "tifast init" first'));
        return;
    }
    // console.log('opts: ', opts);
    console.log( chalk.cyan('Starting Pilot ' + opts.command));
    console.log('\n');

    var pilotArgs = [
        'pilot'
    ];

    switch(opts.command){
        case "add":
            pilotArgs.push('add');
            break;

        case "builds":
            pilotArgs.push('builds');
            break;

        case "export":
            pilotArgs.push('export');
            pilotArgs.push('-c');

            if (!fs.existsSync(pilotDir)){
                fs.mkdirSync(pilotDir);
            }
            pilotArgs.push(pilotDir);
            break;

        case "find":
            pilotArgs.push('find');
            break;

        case "import":
            pilotArgs.push('import');
            pilotArgs.push('-c');

            if (!fs.existsSync(pilotDir)){
                fs.mkdirSync(pilotDir);
            }
            pilotArgs.push(pilotDir + '/tester_import.csv');
            break;

        case "list":
            pilotArgs.push('list');
            break;

        case "remove":
            pilotArgs.push('remove');
            break;

        default:
            pilotArgs.push('upload');
            pilotArgs.push('-i');
            pilotArgs.push('./dist/' + tiapp.name + '.ipa');

            if(opts.skip_submission){
                pilotArgs.push('-s');
            }

            break;
    };

    pilotArgs.push('-u');
    pilotArgs.push(cfg.apple_id);
    pilotArgs.push('-a');
    pilotArgs.push(tiapp.id);

    if(cfg.team_name != "null"){
      pilotArgs.push('-r');
      pilotArgs.push(cfg.team_name);
    }

    if(cfg.team_id != "null"){
      pilotArgs.push('-q');
      pilotArgs.push(cfg.team_id);
    }

    if(cfg.beta_app_description){
        pilotArgs.push('--beta_app_description');
        pilotArgs.push(cfg.beta_app_description);
    }

    if(cfg.beta_app_feedback_email){
        pilotArgs.push('--beta_app_feedback_email');
        pilotArgs.push(cfg.beta_app_feedback_email);
    }

    if(cfg.distribute_external){
        pilotArgs.push('--distribute_external');
        pilotArgs.push(cfg.distribute_external);
    }

    if(cfg.changelog){
        pilotArgs.push('--changelog');
        pilotArgs.push(cfg.changelog);
    }

    if(cfg.groups){
        pilotArgs.push('-g');
        pilotArgs.push(cfg.groups);
    }

    exec(fastlaneBinary, pilotArgs, null, function(e){
        console.log(chalk.cyan('\nPilot ' + opts.command + ' completed\n'));
    });
};


/*
@ bumpBundleVersionAndroid
*/
function bumpBundleVersionAndroid(){
  var tiapp = fs.readFileSync('tiapp.xml', {
      encoding: 'utf-8'
  });

  tiapp = tiapp.replace(/(versionCode=\")([^< ]+)(")/mg, function (match, before, versionCode, after) {
      versionCode = parseInt(versionCode, 10) + 1;

      console.log(chalk.green('Bumped versionCode to: ' + versionCode));

      return before + versionCode + after;
  });

  fs.writeFileSync('tiapp.xml', tiapp);
};

function manageAppID(osType){
    var tiappXml = fs.readFileSync('tiapp.xml', {
        encoding: 'utf-8'
    });

    // clean org.id
    var _orgId;
    tiappXml = tiappXml.replace(/(<org.id>)([^< ]+)(<\/org\.id>)/mg, function (match, before, orgId, after) {
        if (!_orgId) _orgId = orgId;
        return before + after;
    });
    tiappXml = tiappXml.replace(/(<org.id><\/org\.id>)/mg, '');

    if (osType == 'android' && cfg.android_app_id) {
        tiappXml = tiappXml.replace(/(<id>)([^< ]+)(<\/id>)/mg, function (match, before, appId, after) {
            console.log(chalk.green('Refine Application ID to: ' + cfg.android_app_id));

            return before + cfg.android_app_id + '</id><org.id>' + appId + '</org.id>' + after.slice(5);    // </id> length is 5
        });
    } else {
        tiappXml = tiappXml.replace(/(<id>)([^< ]+)(<\/id>)/mg, function (match, before, appId, after) {
            if (_orgId && _orgId != appId) appId = _orgId;

            console.log(chalk.green('Rollback Application ID to: ' + appId));

            return before + appId + after;
        });
    }

    fs.writeFileSync('tiapp.xml', tiappXml);
};

/*
@ export playinit function to CLI
*/
exports.playinit = function(opts){

    if(!fs.existsSync(cfgfile)){
        console.log(chalk.red("==================================="));
        console.log(chalk.red('Cannot find ', cfgfile));
        console.log(chalk.yellow('You must run ') + chalk.cyan('tifast setup'));
        console.log(chalk.red("==================================="));
        console.log('\n ');
        return
    }

    console.log(chalk.cyan('Initializing TiFastLane for GooglePlay'));

    //Create delivery directory if it doesn't exist
    if (!fs.existsSync(deliveryDir)){
        fs.mkdirSync(deliveryDir);
    }

    //Create delivery directory if it doesn't exist
    if (!fs.existsSync(appDeliveryDir)){
        fs.mkdirSync(appDeliveryDir);
    }

    //Create Google Play delivery directory if it doesn't exist
    if (!fs.existsSync(appAndroidDeliveryDir)){
        fs.mkdirSync(appAndroidDeliveryDir);
    }

    var initArgs = [
        'supply',
        'init',
        '--json_key', "../../../" + cfg.google_play_json_key,
        '--package_name', cfg.android_app_id != "null" ? cfg.android_app_id : tiapp.id
    ];

    exec(fastlaneBinary, initArgs, { cwd: appAndroidDeliveryDir }, function(e){
        console.log(chalk.green('Your app has been initialized.'));
        console.log(chalk.green('You can find your configuration files for delivery on: ' + appAndroidDeliveryDir));
        console.log(chalk.green('Now the fun starts!'));
    });

};

/*
@ export playsend function to CLI
*/
exports.playsend = function(opts){

    if(!fs.existsSync(cfgfile)){
        console.log(chalk.red("==================================="));
        console.log(chalk.red('Cannot find ', cfgfile));
        console.log(chalk.yellow('You must run ') + chalk.cyan('tifast setup'));
        console.log(chalk.red("==================================="));
        console.log('\n ');
        return
    }

    if(!cfg.google_keystore_file || !fs.existsSync(cfg.google_keystore_file)){
        console.log(chalk.red("==================================="));
        console.log(chalk.red('Unable to find Android Keystore file'));
        console.log(chalk.yellow('Please run ') + chalk.cyan('tifast setup'));
        console.log(chalk.red("==================================="));
        console.log('\n ');
        return
    }

    if (!fs.existsSync(appAndroidDeliveryDir)){
        console.log(chalk.red('You need to run "tifast playinit" first'));
        return;
    }

    //Check the android args
    if( cfg.android_build_args && cfg.android_build_args != "" ){
        
        var regex = new RegExp(/-p\b|-T\b|-O\b/);
        
        if( regex.test(cfg.android_build_args) ){
            console.log("\n");
            console.log(chalk.red("==================================="));
            console.log(chalk.red(' ERROR ON YOUR ANDROID BUILD ARGS '));
            console.log(chalk.red(' Starting TiFastlane v0.9 the "android_build_args" configuration changed how it behaves.'));
            console.log(chalk.red(' Now you use it to append build args instead of replacing them'));
            console.log(chalk.red(' You cannot use -p (platform), -T (target) or -O (output) when appending new args'));
            console.log(chalk.red("==================================="));
            console.log('\n ');
            return;
        }

    }

    console.log(chalk.cyan('Updating Google Play Store'));

    /*
    @ Play Store
    */
    function _supply( sendapk ){
        console.log("\n");
        console.log(chalk.yellow('Starting Supply'));

        var initArgs = [
            'supply',
            '--json_key', "../../../" + cfg.google_play_json_key,
            '--package_name', cfg.android_app_id != "null" ? cfg.android_app_id : tiapp.id
        ];

        if( sendapk ){

            if( opts.track ){
                initArgs.push(
                    '--track', opts.track
                );
            }

            if( opts.rollout ){
                initArgs.push(
                    '--rollout', opts.rollout
                );
            }

            if( opts.aab) {
                initArgs.push(
                    '--aab', '../../../dist/' + tiapp.name + '.aab'
                );
            } else {
                initArgs.push(
                    '--apk', '../../../dist/' + tiapp.name + '.apk'
                );
            }
        }
        else{
            initArgs.push(
                '--skip_upload_apk'
            );
        }

        if( opts.skip_upload_graphic_assets ){
            initArgs.push(
                '--skip_upload_images',
                '--skip_upload_screenshots'
            );
        }

        if( opts.skip_upload_images ){
            initArgs.push(
                '--skip_upload_images'
            );
        }

        if( opts.validate_only ){
            initArgs.push(
                '--validate_only'
            );
        }

        if( opts.skip_upload_screenshots ){
            initArgs.push(
                '--skip_upload_screenshots'
            );
        }

        if( opts.skip_upload_metadata ){
            initArgs.push(
                '--skip_upload_metadata'
            );
        }

        exec(fastlaneBinary, initArgs, { cwd: appAndroidDeliveryDir }, function(e){
            console.log(chalk.green('\nSupply Done\n'));
        });
    }


    if( opts.skip_upload_apk ){
        console.log(chalk.cyan('Skipping APK upload'));
        _supply(0);

    }
    else{

        /*
        @ status app
        */
        localStatus({
            type: 'Android'
        });


        if( opts.skip_build ){
            console.log(chalk.yellow('Skipping App Build'));
            _supply(1);

        }else{

            console.log(chalk.yellow('First things first. Clean project to ensure build'));
            console.log("\n");

            if( opts.bump_build_version ){
                // Bump version code
                bumpBundleVersionAndroid();
            }

            var cleanArgs = [];

            if(cfg.cli == "appc"){
                cleanArgs.push('ti');
            }

            cleanArgs.push('clean');

            exec(cfg.cli, cleanArgs, null, function(e){
                console.log(chalk.cyan('Starting Appcelerator Build'));
                console.log("\n");

                // Delete APK from Dist folder
                if(fs.existsSync("./dist/" + tiapp.name + ".apk")){
                    fs.unlinkSync("./dist/" + tiapp.name + ".apk");
                }

                var buildArgs = [cfg.cli == "appc"?'run':'build'];

                buildArgs.push('-p', 'android', '-T', 'dist-playstore', '-O', './dist');

                if( cfg.android_build_args && cfg.android_build_args != "" ){
                    buildArgs = buildArgs.concat(cliToArray(cfg.android_build_args));
                }

                buildArgs.push(
                    '-K', cfg.google_keystore_file,
                    '-P', cfg.google_keystore_password,
                    '-L', cfg.google_keystore_alias
                );

                if( cfg.android_app_id != "null" ){
                    manageAppID('android');
                }

                exec(cfg.cli, buildArgs, null, function(e){
                    if( cfg.android_app_id != "null" ){
                        manageAppID();
                    }

                    _supply(1);
                });
            });
        }
    }

};


/**
 * Build IPA
 */
function buildIPA(opts, callback){
    
    console.log(chalk.cyan('Starting Appcelerator App Store Build'));
    console.log("\n");

    // Delete IPA from Dist folder
    if(fs.existsSync("./dist/" + tiapp.name + ".ipa")){
        fs.unlinkSync("./dist/" + tiapp.name + ".ipa");
    }

    var buildArgs = [cfg.cli == "appc"?'run':'build'];
    
    if( opts.legacy ){
        console.log(chalk.yellow('------- Enabling legacy mode for app build and packaging -------'));
        console.log(chalk.yellow('This mode only works if you are building with Titanium CLI < 6.0.2 and XCODE < 8.3'));
        console.log(chalk.yellow('If the build fails please disable the legacy mode'));
        console.log(chalk.yellow('----------------------------------------------------------------'));
        buildArgs.push('-p', 'ios', '-T', 'dist-adhoc','-O','./dist');
    }
    else{
        buildArgs.push('-p', 'ios', '-T', 'dist-appstore');
    }
    
    if( opts.distribution_name ){
        buildArgs.push(
            '-R',
            opts.distribution_name
        );
    }

    if( opts.pp_uuid ){
        buildArgs.push(
            '-P',
            opts.pp_uuid
        );
    }

    if( cfg.ios_build_args && cfg.ios_build_args != "" && cfg.ios_build_args != "null" ){
        buildArgs = buildArgs.concat(cliToArray(cfg.ios_build_args));
    }

    if( TiVersion.major <= 5 || (TiVersion.major === 6 && TiVersion.minor < 1) ){
        exec(cfg.cli, buildArgs, null, function(e){

            if( opts.legacy ){
                callback(1);
            }
            else{
                console.log(chalk.cyan('Exporting .archive to .ipa using xcodebuild'));
                console.log("\n");

                var archive = findXCodeArchive(tiapp.name);

                if( !archive ){
                    return;
                }

                //patch PLIST
                console.log(chalk.yellow('If you use Xcode 9, please run \'tifast send\' command with --pp_uuid option. If not, building IPA file will be failed.'))
                createExportPLIST(tiapp.id, opts.pp_uuid);
                

                var exporterArgs = ['-exportArchive','-archivePath',archive,'-exportPath',"./dist","-exportOptionsPlist","./build/iphone/build_exporter.plist"];

                exec("xcodebuild", exporterArgs, null, function(e){
                    callback(1);
                });
            }

        });

    }
    else{

        //New Build Method added on SDK 6.*
        buildArgs.push(
            '--export-ipa'
        );

        buildArgs.push(
            '--output-dir',
            './dist'
        );

        exec(cfg.cli, buildArgs, null, function(e){
            callback(1);
        });        

    }

}


/**
 * Split cli params to array
 * @param  {String} str CLI paramaters
 * @return {Array}
 */
function cliToArray(str) {
    var args = [];
    var readingPart = false;
    var part = '';
    for (var i = 0; i <= str.length; i++) {
        if (str.charAt(i) === ' ' && !readingPart) {
            args.push(part);
            part = '';
        } else {
            if (str.charAt(i) === '"') {
                readingPart = !readingPart;
            } else {
                part += str.charAt(i);
            }
        }
    }
    args.push(part);
    return args;
}

/**
 * Find XCode Archive
 * @param  {String} app App name
 * @return {String} archive path
 */
function findXCodeArchive(app) {


    if( TiVersion.major <= 5 ){

        //On older Titanium versions we need to look for the archive directly at the Archives path
        var dir = os.homedir() + '/Library/Developer/Xcode/Archives/';
        var archiveName = app;

        if (!fs.existsSync(dir)) {
            console.log(chalk.red('Cannot find ' + dir));
            return;
        }

        var files = fs.readdirSync(dir).filter(file => fs.statSync(path.join(dir, file)).isDirectory());

        if( files && files[0] ){

            files.sort(function(a, b) {
                return fs.statSync(path.join(dir,b)).mtime.getTime() - 
                    fs.statSync(path.join(dir,a)).mtime.getTime();
            });

            var archiveDir = path.join(dir, files[0]);
            var archives = fs.readdirSync(archiveDir);

            if( archives && archives[0] ){
            
                archives.sort(function(a, b) {
                    return fs.statSync(path.join(archiveDir,b)).mtime.getTime() - 
                        fs.statSync(path.join(archiveDir,a)).mtime.getTime();
                });

                var appXcodeArchive;
                var regex = new RegExp(archiveName,"i");

                archives.forEach(function(archive) {
                    if( !appXcodeArchive && regex.test(archive) ){
                        appXcodeArchive = archive;
                    }
                });

                if( appXcodeArchive ){
                    console.log('Using archive:', chalk.cyan(appXcodeArchive));
                    return path.join(archiveDir,appXcodeArchive);
                }

            }

            console.log(chalk.red('Unable to find an app Xcode.archive'));
            return;

        }
        else{
            console.log(chalk.red('Unable to find any archives'));
            return;
        }

    }
    else{

        var appXcodeArchive = './build/iphone/' + app + '.xcarchive';

        if (!fs.existsSync(appXcodeArchive)) {
            console.log(chalk.red('Cannot find xarchive ' + appXcodeArchive));
            return;
        }

    }

    return appXcodeArchive;

}


/**
 * Patch PLIST
 */
function createExportPLIST(appid, pp_uuid){
    
    console.log('Creating build export plist');

    var plistJSON = {
        'method': "app-store"
    };
    
    // for xcode 9 build. exportPLIST have to have a provisioningProfiles
    if (appid && pp_uuid) {
      plistJSON.provisioningProfiles = {};
      plistJSON.provisioningProfiles[appid] = pp_uuid;
    }

    fs.writeFileSync( "./build/iphone/build_exporter.plist", plist.build(plistJSON));

}


/**
 * Parse a version string
 */
function parseVersionString (str) {
    if (typeof(str) != 'string') { return false; }
    var x = str.split('.');
    // parse from string or default to 0 if can't parse
    var maj = parseInt(x[0]) || 0;
    var min = parseInt(x[1]) || 0;
    var pat = parseInt(x[2]) || 0;
    return {
        major: maj,
        minor: min,
        patch: pat
    }
}

/*
@
*/
/*
@
*/
