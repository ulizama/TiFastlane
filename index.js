var chalk = require('chalk')
  , fs = require("fs")
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
  , deliverFile = null
  , appDeliveryMetaDir = null
  , appDeliveryScreenDir = null
  //\\
  , canLoad = true
  ;


/*
@ Read configuration files
*/
exports.loadconfig = function(){

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
      , deliverFile = appDeliveryDir + "/Deliverfile"
      , appDeliveryMetaDir = (!cfg.locale) ? appDeliveryDir + '/metadata/en-US' : appDeliveryDir + '/metadata/' + cfg.locale
      , appDeliveryScreenDir = (!cfg.locale) ? appDeliveryDir + '/screenshots/en-US' : appDeliveryDir + '/screenshots/' + cfg.locale
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

    var initArgs = [];

    exec('deliver', initArgs, { cwd: appDeliveryDir }, function(e){
        console.log(chalk.green('\nDone\n'));
    });
};

/*
@ upload Beta Test IPA
*/
function uploadBetaTestIPA(_skip){
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
            'upload'
          , '-u' , cfg.apple_id
          , '-i' , "../../dist/" + tiapp.name + ".ipa"
        ];

        exec('pilot', pilotArgs, { cwd: appDeliveryDir }, function(e){
            console.log(chalk.green('\nDone\n'));
        });
    };

    /*
    @ status app
    */
    localStatus();

    if(_skip){
        _pilot();

    }else{

        /*
        @ Update +1 to BundleVersion( compiler version )
        */
        bumpBundleVersion();

        console.log(chalk.yellow('First things first. Clean project to ensure build'));
        console.log("\n");

        var cleanArgs = [
            'ti',
            'clean',
            '-p', 'ios'
        ];

        exec(cfg.cli, cleanArgs, null, function(e){
            console.log(chalk.cyan('Starting Appcelerator App Store Build'));
            console.log("\n");

            console.log(chalk.yellow('You MUST select Appstore provisioning to work'));
            console.log("\n");

            // Delete IPA from Dist folder
            if(fs.existsSync("./dist/" + tiapp.name + ".ipa")){
                fs.unlinkSync("./dist/" + tiapp.name + ".ipa");
            }

            var buildArgs = [
                'run',
                '-p', 'ios',
                '-T', 'dist-adhoc',
                '-O', './dist'
            ];

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
        'init',
        '--username', cfg.apple_id,
        '-a', tiapp.id
    ];

    exec('deliver', initArgs, { cwd: appDeliveryDir }, function(e){
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

    var cfgFile = templates.cfgFile;
    cfgFile = cfgFile.replace("[CLI]", cfg.cli).replace("[LOCALE]", cfg.locale).replace('[APPLE_ID]', cfg.apple_id).replace('[TEAM_ID]', cfg.team_id).replace('[TEAM_NAME]', cfg.team_name);
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
            choices: [ "da", "de-DE", "el", "en-AU", "en-CA", "en-GB", "en-US", "es-ES", "es-MX", "fi", "fr-CA", "fr-FR", "id", "it", "ja", "ko", "ms", "nl", "no", "pt-BR", "pt-PT", "ru", "sv", "th", "tr", "vi", "zh-Hans", "zh-Hant" ]
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
        }

    ], function( answers ) {
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
        return
    }
    // console.log('opts: ', opts);

    if( opts.metadata ){
        console.log(chalk.cyan('Sending only Metadata'));
        uploadMetadata();

    }else if( opts.testflight ){
        console.log(chalk.cyan('Sending App to Beta Test'));
        uploadBetaTestIPA(opts.skip_build);

    }else{
        if (!fs.existsSync(appDeliveryDir + "/Deliverfile")){
            console.log(chalk.red('You need to run "tifast init" first'));
            return;
        }

        console.log(chalk.cyan('Sending App to AppStore'));

        var newFileContents = "";

        fs.readFileSync(deliverFile).toString().split('\n').forEach(function (line) {
            // console.log('line: ', line);

            if( /^version /.test(line) ){
                //Update Version
                newFileContents = newFileContents + 'version "' + tiapp.version + '"' + "\n";
            }
            /*
            else if( /^ipa /.test(line) ){
                _hasipa = true;
                newFileContents = newFileContents + 'ipa "../../dist/' + tiapp.name + '.ipa"' + "\n";
            }else{
                newFileContents = newFileContents + line + "\n";
            }
            */
            newFileContents = newFileContents + line + "\n";
            //fs.appendFileSync(deliverFile, line.toString() + "\n");
        });

        // if( !_hasipa ){
        //     newFileContents = newFileContents + 'ipa "../../dist/' + tiapp.name + '.ipa"' + "\n";
        // }

        fs.writeFileSync(deliverFile, newFileContents);

        /*
        @ App Store
        */
        function _deliver(){
            console.log("\n");
            console.log(chalk.yellow('Starting Deliver'));

            var initArgs = [
                '-i', '../../dist/' + tiapp.name + '.ipa'
            ];

            if( opts.skip_verify ){
                initArgs.push('--force');
            }

            exec('deliver', initArgs, { cwd: appDeliveryDir }, function(e){
                console.log(chalk.green('\nDeliver Done\n'));
            });
        }

        /*
        @ status app
        */
        localStatus();


        if( opts.skip_build ){
            console.log(chalk.yellow('Skipping Appcelerator App Store Build'));
            _deliver();

        }else{

            console.log(chalk.yellow('First things first. Clean project to ensure build'));
            console.log("\n");

            var cleanArgs = [];

            if(cfg.cli == "appc"){
                cleanArgs.push('ti');
                cleanArgs.push('clean');
                cleanArgs.push('-p');
                cleanArgs.push('ios');

            }else{
                cleanArgs.push('clean');
                cleanArgs.push('-p');
                cleanArgs.push('ios');
            }

            exec(cfg.cli, cleanArgs, null, function(e){
                console.log(chalk.cyan('Starting Appcelerator App Store Build'));
                console.log("\n");

                // Delete IPA from Dist folder
                if(fs.existsSync("./dist/" + tiapp.name + ".ipa")){
                    fs.unlinkSync("./dist/" + tiapp.name + ".ipa");
                }

                var buildArgs = [];

                if(cfg.cli == "appc"){
                    buildArgs.push('run');
                    buildArgs.push('-p');
                    buildArgs.push('ios');
                    buildArgs.push('-T');
                    buildArgs.push('dist-adhoc');
                    buildArgs.push('-O');
                    buildArgs.push('./dist');

                }else{
                    buildArgs.push('build');
                    buildArgs.push('-p');
                    buildArgs.push('ios');
                    buildArgs.push('-T');
                    buildArgs.push('dist-adhoc');
                    buildArgs.push('-O');
                    buildArgs.push('./dist');
                }

                exec(cfg.cli, buildArgs, null, function(e){
                    _deliver();
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

    exec('produce', produceArgs, null,
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
                    '-u', cfg.apple_id,
                    '-a', tiapp.id,
                    '-o', certDir,
                    '--force'
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

                exec('sigh', sighArgs, null,
                    function(e) {
                        //Done
                    }
                );
            });

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
        '-l', certDir,
        '-a', tiapp.id,
        '-u', cfg.apple_id
    ];

    if(opts.password != null){
        pemArgs.push('-p');
        pemArgs.push(opts.password);
    }

    if(opts.development) pemArgs.push('-d');

    if(opts.generate_p12) pemArgs.push('-g');

    if(opts.save_private_key) pemArgs.push('-s');

    if(opts.force) pemArgs.push('-f');

    console.log( chalk.cyan('Starting Pem'));

    exec('pem', pemArgs,null, function(e){
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

    var pilotArgs = [];

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

    exec('pilot', pilotArgs, null, function(e){
        console.log(chalk.cyan('\nPilot ' + opts.command + ' completed\n'));
    });
};
/*
@
*/
/*
@
*/
