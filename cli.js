#!/usr/bin/env node

var program = require('commander')
  , tifastlane = require('./')
  , updateNotifier = require('update-notifier')
  , pkg = require('./package.json')
  , _ = require('underscore')
  , chalk = require('chalk')
  ;

var notifier = updateNotifier({
	pkg: pkg
});

/*
@ CLI
*/
program
	.version(pkg.version, '-v, --version')
	.usage('command [options]')
    ;

/*
@ Setup Function
*/
program.command('setup')
    .description('Setup Tifastlane.cfg file')
    .option('-id, --apple-id String', 'youapple@id.com')
    .action(setup)
    ;

/*
@ Init Function
*/
program.command('init')
	.description('Initialize of all components needed to work')
    .option('-s, --smart', 'If your app is already on the App Store run init with -s')
	.action(init)
    ;

/*
@ Send Function
*/
program.command('send')
	.description('Send all available resources of App to iTunes Connect. Only one of those options are allowed')
    .option('-m, --metadata', 'Send only metadata to update on iTunes Connect')
	.option('-t, --testflight', 'Send App to be Beta Test on TestFlight')
    .option('--skip_build', 'Skip build of App Store IPA')
    .option('--skip_verify', 'Skip verification of metadata on send command')
	.action(send)
    ;

/*
@ Status Function
*/
program.command('status')
	.description('Display the App Information')
    .action(status)
    ;

/*
@ Register Functions
*/
program.command('register [platform]')
    .description('Register app and create provisioning profiles. You can target a specific platform: "appstore", "development", "adhoc" or leave empty for all')
    .option('-i, --skip_itc', 'Skip the creation of the app on iTunes Connect')
    .option('-si, --skip_install', 'Skip installation of new provisioning profiles')
    .option('-sf, --skip_fetch_profiles', 'Skips the verification of existing profiles which is useful if you have thousands of profiles')
    .action(register)
    ;

/*
@ Snapshot Function
*/
// program.command('snapshot')
// 	.description('Take ScreenShot of Simulator to generate all images')
//     .action(snapshot)
//     ;

/*
@ Pem Function
*/
program.command('pem [password]')
	.description('Automatically generate and renew your push notification profiles')

    .option('-d, --development', 'Renew the development push certificate instead of the production one (PEM_DEVELOPMENT)')

	.option('-g, --generate_p12', 'Generate a p12 file additionally to a PEM file (PEM_GENERATE_P12_FILE)')

    .option('-s, --save_private_key', 'Set to save the private RSA key (PEM_SAVE_PRIVATEKEY)')

    .option('-f, --force', 'Create a new push certificate, even if the current one is active for 30 more days (PEM_FORCE)')

	.action(pem)
    ;

/*
@ Pilot Function
*/
program.command('pilot [Command]')
	.description('The best way to manage your TestFlight testers and builds from your terminal. Default command is "upload"')
    .option('[add]', 'Adds a new external tester. This will also add an existing tester to an app.')
    .option('[builds]', 'Lists all builds for given application')
    .option('[export]', 'Exports all external testers to a CSV file')
    .option('[find]', 'Find a tester (internal or external) by their email address')
    .option('[import]', 'Create external testers from a CSV file')
    .option('[list]', 'Lists all registered testers, both internal and external')
    .option('[remove]', 'Remove an external tester by their email address')
    .option('-s, --skip_submission', 'Skip the distributing action of pilot and only upload the ipa file')

	.action(pilot)
    ;

program.parse(process.argv);

if (program.args.length === 0 || typeof program.args[program.args.length - 1] === 'string') {
	notifier.update && notifier.notify();
	program.help();
}


/*
@ setup
*/
function setup(opts){
    notifier.update && notifier.notify();

	var options = _filterOptions(opts);

    tifastlane.setup(options);
};


/*
@ init
*/
function init(opts) {
	notifier.update && notifier.notify();

    var options = _filterOptions(opts);

    tifastlane.loadconfig();
	tifastlane.init(options);
};


/*
@ status
*/
function status(opts) {
    tifastlane.loadconfig();
    tifastlane.status();
};

/*
@ send
*/
function send(opts) {
	notifier.update && notifier.notify();

	var options = _filterOptions(opts);

    tifastlane.loadconfig();
	tifastlane.send(options);
};

/*
@ register
*/
function register(platform, opts) {
	notifier.update && notifier.notify();

	var options = _filterOptions(opts);

    options.platform = platform || '';

    tifastlane.loadconfig();
	tifastlane.register(options);
};

/*
@ pem
*/
function pem(env, opts) {
	notifier.update && notifier.notify();

	var options = _filterOptions(opts);
    options.password = (!env) ? null : env;

    tifastlane.loadconfig();
	tifastlane.pem(options);
};

/*
@ snapshot
*/
// function snapshot(opts) {
//     tifastlane.loadconfig();
//     tifastlane.snapshot();
// };


/*
@ pilot
*/
function pilot(env, opts) {
	notifier.update && notifier.notify();

	var options = _filterOptions(opts);
    options.command = (!env) ? 'upload' : env;

    var availableCommands = [ 'add', 'builds', 'export', 'find', 'import', 'list', 'remove', 'upload' ]
      , commandValid = false
      ;

    availableCommands.forEach(function(_command){
        if(options.command == _command){
            commandValid = true;
        }
    });

    if(!commandValid){
        console.log(chalk.red('Incorrect [Command]'));
        console.log(chalk.yellow('Example:') + chalk.cyan(' tifast pilot builds'));
        console.log('\n');
        return;
    }

    tifastlane.loadconfig();
	tifastlane.pilot(options);
};

/*
@ filterOptions
*/
function _filterOptions(o) {
	var opts = o.parent ? _filterOptions(o.parent) : {};

	_.each(o, function (v, k) {
		if (k[0] !== '_' && !_.isObject(v)) {
			opts[k] = v;
		}
	});

	return opts;
};
/*
@
*/
/*
@
*/
