# TiFastlane

Building apps for iOS it's all great until you have to deal with Certificates, Provisioning Profiles and sending iTunes Connect. Then came [fastlane.tools](https://fastlane.tools/) a collection of 9 tools that enable Continuous Deployment of iOS Apps.

TiFastlane it's a way to use those tools for Titanium development. Now you'll be able to do real continous deployment of your Titanium app. Sending your app for review will be a breeze:

	tifastlane sendapp

With TiFastlane you'll be able to fully optimize the way you submit your app updates and maintain your certificates and provisioning profiles.


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

`tifastlane` must be executed from your Titanium App directory. It will automatically read your `tiapp.xml` to determine your App configuration for all the tools.

You can view the current settings that would be used by running:

	tifastlane status

## App IDs and Provisioning Profiles

Register your Titanium App ID on the Apple Developer Program and iTunes Connect, and then generate the Provisioning Profiles for App Store, Ad Hoc and Development.

	tifastlane register
	
Everything is done behing the scenes using [produce](https://github.com/fastlane/produce) and [sigh](https://github.com/KrauseFx/sigh). If the App ID already exists on the Developer Program or iTunes Connect it will be safely skipped.

For default provisiong profiles will be generated for all platforms, but if you wish you can target a single platform: `appstore`, `adhoc` or `development`.

	tifastlane register <platform>
	
### Advanced Options

* `-i, --skip_itc` - Skips creating the app on iTunes Connect
* `--force` - By default if the Provisioning Profiles exist, they will be skipped. User force to recreate and resign the profiles.
* `--skip_install` - Skip installation of new provisioning profiles
* `--skip_fetch_profiles` - Skips the verification of existing profiles which is useful if you have thousands of profiles

## Maintain iTunes Connect (deliver)

Update your app binary, your app metadata (Title, Description, Icon, etc) and your app screenshots using [deliver](https://github.com/KrauseFx/deliver).

### Initializing Deliverfile

TiFastlane needs to initialize the configuration files needed to keep iTunes Connect updated with the correct information. If the app it's not in iTunes Connect then run to start fresh settings:

	tifastlane init
	
If your app is already on iTunes Connect, then run the wizard which will automatically download all your current metadata and screenshots:

	tifastlane initwizard

After correct initialization you will see on the `TiFLDelivery` directory, a new directory with the id of your app.

### Configuration Files

All metadata and screenshots are easily maintained from the `TiFLDelivery\APPID` directory, here you will find the following files:

**Deliveryfile**

You can configure Price, Copyright, Developer Notes, etc. You can read the full [documentation here](https://github.com/KrauseFx/deliver/blob/master/Deliverfile.md).

**./metadata/[LANG]/*.txt**

In this directory you will see several text files with the contents of the metadata that is language dependant. By default it's only created with the `EN_US` language, but if you run the wizard and you support more language, you'll see them listed here.

**./screenshots/[LANG]/*.***

As with metadata, screenshots support multi language. Based on the dimension of the images they will be correctly set to the appropiate device. The images are ordered alphabetically, so make sure to name them correctly to control the right display order.

## Sending App Updates

When you have a new version of your App that you wish to push to iTunes Connect, all you have to do is:

	tifastlane sendapp
	
TiFastalane will get Titanium to build the ipa. It will build it as AdHoc so we get an ipa, so make sure to select your App Store certificate so it works when sending it to iTunes Connect.

After the build, then using [deliver](https://github.com/KrauseFx/deliver) TiFastlane will login to iTunes Connect. It will automatically read the new version of your ipa and create a new version if necessary, upload the metadata, screenshots and finally your binary.

After the ipa has succesfully uploaded, it will wait and try to submit it for review automatically. Make sure that you set the `submit_further_information` section on your Deliverfile.

### Advanced Options

By default, before submitting you will be shown a report file with all the changes that will be made which you'll need to confirm. To skip this confirmation, which might be really useful for automation:

* `--skip_verify` - Skips configuration prompt before upload.

And if you want to send the binary without having to do a rebuild:

* `--skip_build` - Skips ipa build

### Updating only metadata

You might want to update only the metadata and/or screenshots of your App without having to submit a new version or binary. To do so use:

	tifastlane updatemeta
	
This will login to iTunes Connect and update your app information based on your configuration, as well as uploading all the App screenshots.

##TODO

* Allow configuration of team id, team name, and specification of the default certificate to use
* Integrate the rest of the fastlane tools

##  Thanks

* [Felix Krause](https://github.com/KrauseFx) for creating the awesome fastlane.tools
* [Jason Kneen](https://github.com/jasonkneen) for creating some awesome CLI tools from which I'm basing this one

## Changelog

* 0.2.1 Send version on produce. Update SKU generator
* 0.2.0 Now you can upload your app update.
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
