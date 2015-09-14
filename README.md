# TiFastlane

Building apps for iOS it's all great until you have to deal with Certificates, Provisioning Profiles and sending iTunes Connect. Then came [fastlane.tools](https://fastlane.tools/) a collection of 9 tools that enable Continuous Deployment of iOS Apps.

TiFastlane it's a way to use those tools for Titanium development. Now you'll be able to do real continous deployment of your Titanium app. Sending your app for review will be a breeze:

	tifast send

With TiFastlane you'll be able to fully optimize the way you submit your app updates and maintain your certificates and provisioning profiles.


## Install [![npm version](https://badge.fury.io/js/tifastlane.svg)](http://badge.fury.io/js/tifastlane)

Make sure, you have the latest version of the Xcode command line tools installed:

	xcode-select --install

Then install the CLI and all the required gems will be installed automatically.

	[sudo] npm install -g tifastlane

### TiFastlane Configuration

Create a `tifastlane.cfg` file in the Titanium project folder as follows:

Available locales `"da", "de-DE", "el", "en-AU", "en-CA", "en-GB", "en-US", "es-ES", "es-MX", "fi", "fr-CA", "fr-FR", "id", "it", "ja", "ko", "ms", "nl", "no", "pt-BR", "pt-PT", "ru", "sv", "th", "tr", "vi", "zh-Hans", "zh-Hant"`
```json
{
	"username": "YOURAPPLEID@EMAIL",
	"locale": "pt-BR"
}
```

## Usage
`tifastlane` or `tifast` must be executed from your Titanium App directory. It will automatically read your `tiapp.xml` to determine your App configuration for all the tools.

# First Things First
TiFastlane needs to initialize the configuration files needed to keep iTunes Connect updated with the correct information. If the app it's not in iTunes Connect then run to start fresh settings:
```javascript
tifast init
```

If your app is already on iTunes Connect, then run the wizard which will automatically download all your current metadata and screenshots:
```javascript
tifast init -s
```

### Status
You can view the current settings that would be used by running:

	tifast status

You will see something like this:
```javascript
Apple ID Username: contact@universopositivo.com.br
Name: Easy Ticket
AppId: br.com.universopositivo.easyTicket
Version: 1.0.0
CFBundleVersion: 107
GUID: "32cc538e-4fd3-4d6e-9999-870ce50ab039"
SKU: "xxxxxxxxxxxxxx"
```

### Register
Register your Titanium App ID on the Apple Developer Program and iTunes Connect, and then generate the Provisioning Profiles for App Store, Ad Hoc and Development.

	tifast register

Everything is done behing the scenes using [produce](https://github.com/fastlane/produce) and [sigh](https://github.com/KrauseFx/sigh). If the App ID already exists on the Developer Program or iTunes Connect it will be safely skipped.

For default provisiong profiles will be generated for all platforms, but if you wish you can target a single platform: `appstore`, `adhoc` or `development`.

	tifastlane register <platform>

### Send

When you have a new version of your App that you wish to push to iTunes Connect, all you have to do is:

	tifast send

TiFastalane will get Appcelerator to build the ipa. It will build it as AdHoc so we get an ipa, so make sure to select your App Store certificate so it works when sending it to iTunes Connect.

#### Updating only metadata

You might want to update only the metadata and/or screenshots of your App without having to submit a new version or binary. To do so use:

	tifast send -m

This will login to iTunes Connect and update your app information based on your configuration, as well as uploading all the App screenshots.

After the build, then using [Deliver](https://github.com/KrauseFx/deliver) TiFastlane will login to iTunes Connect. It will automatically read the new version of your ipa and create a new version if necessary, upload the metadata, screenshots and finally your binary.

### TestFlight
If you want to upload an Beta version of your app, you can do it by using:

	tifast send -t

It will use [Pilot](https://github.com/KrauseFx/pilot) to communicate with iTunes Connect and upload your App, already sending it to beta internal test and communicate your testers.

### Configuration Files

All metadata and screenshots are easily maintained from the `TiFLDelivery\APPID` directory, here you will find the following files:

**Deliveryfile**

You can configure Price, Copyright, Developer Notes, etc. You can read the full [documentation here](https://github.com/KrauseFx/deliver/blob/master/Deliverfile.md).

**./metadata/[LANG]/*.txt**

In this directory you will see several text files with the contents of the metadata that is language dependant. By default it's only created with the `EN_US` language, but if you run the wizard and you support more language, you'll see them listed here.

**./screenshots/[LANG]/*.***

As with metadata, screenshots support multi language. Based on the dimension of the images they will be correctly set to the appropiate device. The images are ordered alphabetically, so make sure to name them correctly to control the right display order.

## TODO

* Allow configuration of team id, team name, and specification of the default certificate to use

##  Thanks

* [Felix Krause](https://github.com/KrauseFx) for creating the awesome fastlane.tools
* [Jason Kneen](https://github.com/jasonkneen) for creating some awesome CLI tools from which I'm basing this one

## Changelog
* 1.0.0 Add new tools [Snapshot](https://github.com/KrauseFx/snapshot), [PEM](https://github.com/fastlane/PEM), [Pilot](https://github.com/fastlane/pilot)
* 0.2.3 Removed SKU delivery, automatic one will be generated by produce.
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
