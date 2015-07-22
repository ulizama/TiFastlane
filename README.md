# TiFastlane

A wrapper to the awesome [fastlane.tools](https://fastlane.tools/) so you can use them seamlessly with your Titanium Development.

*Please note that this tool is currently in beta development.*

## About fastlane.tools

The [fastlane](https://fastlane.tools/) family is a collection of tools that enable Continuous Deployment of iOS Apps. It has 9 different tools that allow things like registering the app, creating provisioning profiles and even automatic delivery to the App Store and TestFlight.

## Install [![npm version](https://badge.fury.io/js/tifastlane.svg)](http://badge.fury.io/js/tifastlane)

Make sure, you have the latest version of the Xcode command line tools installed:

	xcode-select --install

Then install the CLI and all the required gems will be installed automatically.

	[sudo] npm install -g tifastlane

### TiFastlane Configuration

Create a `tifastlane.cfg` file in the Titanium project folder as follows:

```json
{
	"username": "YOURAPPLEID@EMAIL"
}
```

## Usage

`tifastlane` must be executed from your Titanium App directory. It will automatically ready your `tiapp.xml` to determine your App configuration for all the tools.

You can view the current settings that would be used by running:

	tifastlane status

## Register App (produce + sigh)

We have merged the actions of [produce](https://github.com/fastlane/produce) and [sigh](https://github.com/KrauseFx/sigh) into a single call.

	tifastlane register
	
This simple command will register the current Titanium App on the Apple Developer Program and iTunes Connect, and then generate the Provisioning Profiles for App Store, Ad Hoc and Development.

For default provisiong profiles will be generated for all platforms, but if you wish to only target a specific platform `appstore`, `adhoc` or `development`:

	tifastlane register <platform>
	
### Advanced Options

* `-i, --skip_itc` - Skips creating the app on Itunes Connect
* `--force` - By default if the Provisioning Profiles exist, they will be skipped. User force to recreate and resign the profiles.
* `--skip_install` - Skip installation of new provisioning profiles
* `--skip_fetch_profiles` - Skips the verification of existing profiles which is useful if you have thousands of profiles

## Update iTunes Connect (deliver)

Now is possible to update your iTunes Connect metadata (Title, Description, Icon, etc) and screenshots using [deliver](https://github.com/KrauseFx/deliver). With this tool not only will you be able to update your app data from the command line, but you'll be able to keep track of it with version control.

### Initializing Deliverfile

You will need to initialize your app settings. If this is a new app with no information on iTunes Connect then do:

	tifastlane init
	
If your app is already on iTunes Connect, then run the wizard which will download all your metadata and screenshots:

	tifastlane initwizard

After correct initialization you will see on the `TiFLDelivery` directory, a new directory with the name of your app.

### Configuration Files

All metadata and screenshots are easily maintaned from the `TiFLDelivery\APPID` directory, here you will find the following files:

**Deliveryfile**

You can configure Price, Copyright, Developer Notes, etc. You can read the full [documentation here](https://github.com/KrauseFx/deliver/blob/master/Deliverfile.md).

**./metadata/[LANG]/*.txt**

In this directory you will see several text files with the contents of the metadata that is language dependant. By default it's only created with the `EN_US` language, but if you run the wizard and you support more language, you'll see them listed here.

**./screenshots/[LANG]/*.***

As with metadata, screenshots support multi language. Based on the dimension of the images they will be correctly set to the appropiate device. The images are ordered alphabetically, so make sure to name them correctly to control the right display order.

### Updating App on iTunes Connect

Updating the App metadata and screenshots it's as easy as running:

	tifastlane updatemeta
	
This will login to iTunes Connect and update your app information based on your configuration, as well as uploading all the App screenshots.

By default, before submitting you will be shown a report file with all the changes that will be made which you'll need to confirm. To skip this confirmation, which might be really useful for automation, just use:

* `--skip_verify` - Skips configuration verification before upload.

### Uploading ipa to App Store

Currently I'm working on the ability to upload your ipa to the App Store with an option to automatically submit for review.


##TODO

* Allow configuration of team id, team name, and specification of the default certificate to use
* Integrate the rest of the fastlane tools

##  Thanks

* [Felix Krause](https://github.com/KrauseFx) for creating the awesome fastlane.tools
* [Jason Kneen](https://github.com/jasonkneen) for creating some awesome CLI tools from which I'm basing this one

## Changelog

* 0.1.0 Now you can update your iTunes Connect metadata and screenshots (deliver)
* 0.0.3 Added register - Register App (produce + sigh)
* 0.0.1 Initial Commit

## License

<pre>
Copyright 2015 Uriel Lizama

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
</pre>
