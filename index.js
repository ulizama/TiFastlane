var chalk = require('chalk')
  , fs = require("fs")
  , tiappxml = require('tiapp.xml')
  , pkg = require('./package.json')
  , xpath = require('xpath')
  , _ = require('underscore')
  , exec = require('./lib/exec')
  , _exec = require('child_process').exec
  , templates = require('./lib/templates')
  //\\
  , cfgfile = 'tifastlane.cfg'
  , infile = 'tiapp.xml'
  , certDir = './TiFLCertificates'
  , deliveryDir = './TiFLDelivery'
  , pilotDir = './TiFLPilot'
  //\\
  , canLoad = true
  , tiapp = null
  , cfg = null
  , appDeliveryDir = null
  , deliverFile = null
  , appDeliveryMetaDir = null
  , appDeliveryScreenDir = null
  ;


/*
@ Initialize and read configuration files
*/
exports.initialize = function(){

    // check that all required input paths are good
    [cfgfile, infile].forEach(function (file) {
      if (!fs.existsSync(file)) {
          console.log(chalk.red('Cannot find ' + file));
          console.log(chalk.yellow('tifast must be run on Root App folder. "./appName"'));
          canLoad = false;
      }
    });

    tiapp = tiappxml.load(infile);

    // read in our config
    cfg = JSON.parse(fs.readFileSync(cfgfile, "utf-8"));
    if( !cfg.username ){
        console.log(chalk.red('Cannot determine username from configuration'));
    }

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
@ build SKU for app creating
*/
function build_sku( appid ){
    //We are going to use the same id of the app, for the SKU
    var sku = appid.toUpperCase().replace(/\./g, "") + randomIntInc(100,999);
    return sku;
};
function randomIntInc (low, high) {
    return Math.floor(Math.random() * (high - low + 1) + low);
};

/*
@ extraFiles
*/
function extraFiles(){
    // Create ratings.json
    var _deliverRatingJson = templates.ratings;
    fs.writeFileSync(appDeliveryDir + "/rating.json", _deliverRatingJson);

    // Create SnapShots Files
    var _deliverSnapfile = templates.Snapfile;
    _deliverSnapfile = _deliverSnapfile.replace("[SCHEME]", tiapp.name).replace("[PATH]", "../../build/iphone/" + tiapp.name + ".xcodeproj");
    fs.writeFileSync(appDeliveryDir + "/Snapfile", _deliverSnapfile);

    var _deliversnapshotiPad = templates.snapshotiPad;
    fs.writeFileSync(appDeliveryDir + "/snapshot-iPad.js", _deliversnapshotiPad);

    var _deliverSnapshot = templates.snapshot;
    fs.writeFileSync(appDeliveryDir + "/snapshot.js", _deliverSnapshot);

    var _deliverSnapshotHelper = templates.SnapshotHelper;
    fs.writeFileSync(appDeliveryDir + "/SnapshotHelper.js", _deliverSnapshotHelper);


    // Pilot
    if (!fs.existsSync(pilotDir)){
        fs.mkdirSync(pilotDir);
    }
    var pilotImport = templates.pilotImport;
    fs.writeFileSync(pilotDir + "/tester_import.csv", pilotImport);
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
    console.log('Apple ID Username: ' + chalk.cyan(cfg.username))
    console.log('Name: ' + chalk.cyan(tiapp.name));
    console.log('AppId: ' + chalk.cyan(tiapp.id));
    console.log('Version: ' + chalk.yellow(tiapp.version));
    console.log('CFBundleVersion: ' + chalk.yellow(_bundleVersionIndex));
    console.log('GUID: ' + chalk.cyan(tiapp.guid));
    console.log('SKU: ' + chalk.cyan( build_sku(tiapp.id) ));
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
        '--skip-deploy'
    ];

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
          , '-u' , cfg.username
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

        exec('appc', cleanArgs, null, function(e){
            console.log(chalk.cyan('Starting Appcelerator App Store Build'));
            console.log("\n");

            console.log(chalk.yellow('You MUST select Appstore provisioning to work'));
            console.log("\n");

            // Delete IPA from Dist folder
            fs.unlinkSync("./dist/" + tiapp.name + ".ipa");

            var buildArgs = [
                'run',
                '-p', 'ios',
                '-T', 'dist-adhoc',
                '-O', './dist'
            ];

            exec('appc', buildArgs, null, function(e){
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
        '--username', cfg.username
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
@ export init function to CLI
*/
exports.init = function(opts){
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
        _deliverFile = _deliverFile.replace("[APP_ID]", tiapp.id).replace("[EMAIL]", cfg.username);

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

        var newFileContents = ""
          , _hasipa = false
          ;

        fs.readFileSync(deliverFile).toString().split('\n').forEach(function (line) {
            // console.log('line: ', line);
            if( /^version /.test(line) ){
                //Skip version
                return;
            }
            
            if( /^ipa /.test(line) ){
                _hasipa = true;
                newFileContents = newFileContents + 'ipa "../../dist/' + tiapp.name + '.ipa"' + "\n";
            }else{
                newFileContents = newFileContents + line + "\n";
            }
            //fs.appendFileSync(deliverFile, line.toString() + "\n");
        });

        if( !_hasipa ){
            newFileContents = newFileContents + 'ipa "../../dist/' + tiapp.name + '.ipa"' + "\n";
        }

        fs.writeFileSync(deliverFile, newFileContents);

        /*
        @ App Store
        */
        function _deliver(){
            console.log("\n");
            console.log(chalk.yellow('Starting Deliver'));

            var initArgs = [
                // 'run'
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

            var cleanArgs = [
                'ti',
                'clean',
                '-p', 'ios'
            ];

            exec('appc', cleanArgs, null, function(e){
                console.log(chalk.cyan('Starting Appcelerator App Store Build'));
                console.log("\n");

                // Delete IPA from Dist folder
                fs.unlinkSync("./dist/" + tiapp.name + ".ipa");

                var buildArgs = [
                    'run',
                    '-p', 'ios',
                    '-T', 'dist-adhoc',
                    '-O', './dist'
                ];

                exec('appc', buildArgs, null, function(e){
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
    localStatus();
};

/*
@ export register function to CLI
*/
exports.register = function(opts){
    console.log('opts: ', opts);

    //First step is to register the application using fastlane.produce
    console.log( chalk.cyan('Creating app on Apple Developer Portal ' + ( opts.skip_itc ? 'Skipping iTunes Connect' : '& iTunes Connect') ));

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
                    '-u', cfg.username,
                    '-a', tiapp.id,
                    '-o', certDir
                ];

                if( opts.skip_install ){
                    sighArgs.push('--skip_install');
                }

                if( opts.force ){
                    sighArgs.push('--force');
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
exports.snapshot = function(){
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

/*
@ export pem function to CLI
*/
exports.pem = function(opts){
    // console.log('opts: ', opts);

    //Create certificate directory if it doesn't exist
    if (!fs.existsSync(certDir)){
        fs.mkdirSync(certDir);
    }

    var pemArgs = [
        '-l', certDir,
        '-a', tiapp.id,
        '-u', cfg.username
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
    pilotArgs.push(cfg.username);
    pilotArgs.push('-a');
    pilotArgs.push(tiapp.id);

    exec('pilot', pilotArgs, null, function(e){
        console.log(chalk.cyan('\nPilot ' + opts.command + ' completed\n'));
    });
};
