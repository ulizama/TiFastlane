## Instalation
Requiments:
* Mac OS 10.9 or newer
* Ruby 2.0 or newer (`ruby -v`)
* Xcode

Additionally, to an Xcode installation, you also need the Xcode command line tools set up.

    xcode-select --install

### [Fastlane](https://fastlane.tools/)
Install the gem and all its dependencies (this might take a few minutes).

    sudo gem install fastlane --verbose

In case RubyGems has a hard time installing Nokogiri, check out their [official installation guide](http://www.nokogiri.org/tutorials/installing_nokogiri.html).

### Tifastlane [![npm version](https://badge.fury.io/js/tifastlane.svg)](http://badge.fury.io/js/tifastlane)

    [sudo] npm install -g tifastlane

Now you are ready to get Started :D

## Usage

`tifastlane` or `tifast` must be executed from your Titanium App directory. It will automatically read your tiapp.xml to determine your App configuration for all the tools.

#### Available Commands
* [tifast setup](#tifast-setup)
* [tifast init](#tifast-init)
* [tifast status](#tifast-status)
* [tifast register](#tifast-register)
* [tifast send](#tifast-send)
* [tifast pem](#tifast-pem)
* [tifast pilot](#tifast-pilot)
* [tifast snapshot](#tifast-snapshot)

### Tifast Setup
First we need to setup how TiFastlane will work on your app, run:

    tifast setup

### Tifast Init
TiFastlane needs to initialize the configuration files needed to keep iTunes Connect updated with the correct information. If the app **it's not in iTunes Connect** then run to start fresh settings:


    tifast init

If your app **is already on iTunes Connect**, then run the wizard which will automatically download all your current metadata and screenshots:

    tifast init -s

### Tifast Status
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

### Tifast Register
Register your Titanium App ID on the Apple Developer Program and iTunes Connect, and then generate the Provisioning Profiles for App Store, Ad Hoc and Development.

    tifast register

Everything is done behind the scenes using [produce](https://github.com/fastlane/produce) and [sigh](https://github.com/KrauseFx/sigh). If the App ID already exists on the Developer Program or iTunes Connect it will be safely skipped.

For default provisiong profiles will be generated for all platforms, but if you wish you can target a single platform: `appstore`, `adhoc`, `development` or `all`.

    tifast register <platform>

If you wish to overwrite exists provisionings

    tifast register <platform> -f

### Tifast Send

When you have a new version of your App that you wish to push to iTunes Connect, all you have to do is:

	tifast send


If you want to **Update only Medata and Screenshots**  of your App without having to submit a new version or binary.

    tifast send -m

If you want to **Upload an Beta version** of your app.

    tifast send -t


### Tifast PEM

Generate or rewnew your push certificates by using:

	tifast pem [password]

For default certificates will be created for distribution using the password you define, if you want to target the development certificates then use:

	tifast pem -d [password]

To renew push certificate, even if the current one is active for 30 more days

    tifast pem -f [password]


### Tifast Pilot
* [Documentation for Pilot](./Pilot.md)

### Tifast Snapshot
* [Documentation for Snapshot](./Snapshot.md)


## Configuration Files

All metadata and screenshots are easily maintained from the `TiFLDelivery\APPID` directory, here you will find the following files:

**Deliveryfile**

You can configure Price, Copyright, Developer Notes, etc. You can read the full [documentation here](https://github.com/KrauseFx/deliver/blob/master/Deliverfile.md).

**./metadata/[LANG]/*.txt**

In this directory you will see several text files with the contents of the metadata that is language dependant. By default it's only created with the `EN_US` language, but if you run the wizard and you support more language, you'll see them listed here.

**./screenshots/[LANG]/*.***

As with metadata, screenshots support multi language. Based on the dimension of the images they will be correctly set to the appropiate device. The images are ordered alphabetically, so make sure to name them correctly to control the right display order.
