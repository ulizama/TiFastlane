var chalk = require('chalk')
  , fs = require("fs")
  , path = require("path")
  , tiappxml = require('tiapp.xml')
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

    tiapp = tiappxml.load(infile);

    // read in our config
    cfg = JSON.parse(fs.readFileSync(cfgfile, "utf-8"));

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
function localStatus() {
    // Trick to get Bundle Version since tiapp.xml doesn't expose it
    var _bundleVersion = fs.readFileSync('tiapp.xml', {
        encoding: 'utf-8'
    });
    _bundleVersionIndex = 0;
    _bundleVersion.replace(/(<key>CFBundleVersion<\/key>\s*<string>)([^< ]+)(<\/string>)/mg, function (match, before, CFBundleVersion, after) {
        CFBundleVersion = parseInt(CFBundleVersion, 10);

        _bundleVersionIndex = CFBundleVersion;
    });


    console.log('\n');
    if( cfg.apple_id != "null" ) console.log('Apple ID: ' + chalk.cyan(cfg.apple_id));
    if( cfg.team_id != "null" ) console.log('Team ID: ' + chalk.cyan(cfg.team_id));
    if( cfg.team_name != "null" ) console.log('Team Name: ' + chalk.cyan(cfg.team_name));

    console.log('Name: ' + chalk.cyan(tiapp.name));
    console.log('AppId: ' + chalk.cyan(tiapp.id));
    console.log('Version: ' + chalk.yellow(tiapp.version));
    console.log('CFBundleVersion: ' + chalk.yellow(_bundleVersionIndex));
    console.log('GUID: ' + chalk.cyan(tiapp.guid));
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
            initArgs.push(
                '--skip_waiting_for_build_processing'
            );
        }

        exec(fastlaneBinary, pilotArgs, { cwd: appDeliveryDir }, function(e){
            console.log(chalk.green('\nDone\n'));
        });
    };

    /*
    @ status app
    */
    localStatus();

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
            console.log(chalk.cyan('Starting Appcelerator App Store Build'));
            console.log("\n");

            console.log(chalk.yellow('You MUST select Appstore provisioning to work'));
            console.log("\n");

            // Delete IPA from Dist folder
            if(fs.existsSync("./dist/" + tiapp.name + ".ipa")){
                fs.unlinkSync("./dist/" + tiapp.name + ".ipa");
            }

            var buildArgs = [cfg.cli == "appc"?'run':'build'];
            var buildArgsDetail = '-p ios -T dist-adhoc -O ./dist';
            buildArgs = buildArgs.concat(buildArgsDetail.split(' '));

            exec(cfg.cli, buildArgs, null, function(e){
                _pilot();
            });
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

    var cfgFile = templates.cfgFile;
    cfgFile = cfgFile.replace("[CLI]", cfg.cli).replace("[LOCALE]", cfg.locale).
    replace('[APPLE_ID]', cfg.apple_id).replace('[TEAM_ID]', cfg.team_id).
    replace('[TEAM_NAME]', cfg.team_name).replace('[GOOGLE_PLAY_JSON_KEY]', cfg.google_play_json_key).
    replace('[GOOGLE_KEYSTORE_FILE]', cfg.google_keystore_file).
    replace('[GOOGLE_KEYSTORE_PASSWORD]', cfg.google_keystore_password).replace('[GOOGLE_KEYSTORE_ALIAS]', cfg.google_keystore_alias).replace('[FASTLANE_BINARY]', cfg.fastlane_binary);
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
    // console.log('opts: ', opts);

    if( opts.testflight ){
        console.log(chalk.cyan('Sending App to Beta Test'));
        return uploadBetaTestIPA(opts);
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
        localStatus();

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
                console.log(chalk.cyan('Starting Appcelerator App Store Build'));
                console.log("\n");

                // Delete IPA from Dist folder
                if(fs.existsSync("./dist/" + tiapp.name + ".ipa")){
                    fs.unlinkSync("./dist/" + tiapp.name + ".ipa");
                }

                var buildArgs = [cfg.cli == "appc"?'run':'build'];
                var buildArgsDetail = '-p ios -T dist-adhoc -O ./dist';
                buildArgs = buildArgs.concat(buildArgsDetail.split(' '));

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

                exec(cfg.cli, buildArgs, null, function(e){
                    _deliver(1);
                });
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
            pilotArgs.push('ipa');
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

    if(cfg.team_name){
      pilotArgs.push('-r');
      pilotArgs.push(cfg.team_name);
    }

    if(cfg.team_id){
      pilotArgs.push('-q');
      pilotArgs.push(cfg.team_id);
    }

    exec(fastlaneBinary, pilotArgs, null, function(e){
        console.log(chalk.cyan('\nPilot ' + opts.command + ' completed\n'));
    });
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
        '--package_name', tiapp.id
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
            '--package_name', tiapp.id
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

            initArgs.push(
                '--apk', '../../../dist/' + tiapp.name + '.apk'
            );
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
        localStatus();


        if( opts.skip_build ){
            console.log(chalk.yellow('Skipping App Build'));
            _supply(1);

        }else{

            console.log(chalk.yellow('First things first. Clean project to ensure build'));
            console.log("\n");

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
                var buildArgsDetail = '-p android -T dist-playstore -O ./dist';

                buildArgs = buildArgs.concat(buildArgsDetail.split(' '));

                buildArgs.push(
                    '-K', cfg.google_keystore_file,
                    '-P', cfg.google_keystore_password,
                    '-L', cfg.google_keystore_alias
                );

                exec(cfg.cli, buildArgs, null, function(e){
                    _supply(1);
                });
            });
        }
    }

};
/*
@
*/
/*
@
*/
