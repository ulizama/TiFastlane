## Installation

Requirements:

* Mac OS 10.9 or newer
* Ruby 2.0 or newer (`ruby -v`)
* Xcode

Additionally, to an Xcode installation, you also need the Xcode command line tools set up.

    xcode-select --install


### Tifastlane

**BEFORE** you download `tifastlane` you **MUST** do this trick to be able to download all `gems` dependencies.

Edit your `.bashrc` or `.zshrc` file:

    export GEM_HOME=/Users/{Your-Username}/.gems
    export PATH=$PATH:/Users/{Your-Username}/.gems/bin

* Save it
* Close your terminal and open it again
* `mkdir  $GEM_HOME`

All done! no need for `sudo` anymore( on gems side ).

    [sudo] npm install -g tifastlane

Now you are ready to get started :D

In case RubyGems has a hard time installing Nokogiri, check out their [official installation guide](http://www.nokogiri.org/tutorials/installing_nokogiri.html).

## Get Started

Inside your app directory, you first need to setup and configure TiFastlane:

	tifast setup

Once your configuration is set, then you want to initialize your app:

	tifast init

And then finally when you are ready, you'll want to send your app for review at the App Store:

	tifast send

**It's that easy!**

Below you will find full documentation on every step and other tools available to you.

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

#### CLI Help

Each of TiFastlane's commands has it's own set of arguments you can use to further control. You can easily look at each avaiable argument with -h, for example:

tifast setup -h

### Tifast Setup
This will configure TiFastlane on your current project.

    tifast setup

### Tifast Init
TiFastlane needs to initialize the configuration files needed to keep iTunes Connect updated with the correct information. If the app **is not in iTunes Connect** then run to start fresh settings:


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

For default provisiong profiles will be generated for all platforms, but if you wish you can target a single platform: `appstore`, `adhoc`, `development` or leave empty for all.

    tifast register <platform>

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


## Configuration Files

All metadata and screenshots are easily maintained from the `TiFLDelivery\APPID` directory, here you will find the following files:

**Deliveryfile**

You can configure Price, Copyright, Developer Notes, etc. You can read the full [documentation here](https://github.com/KrauseFx/deliver/blob/master/Deliverfile.md).

**./metadata/[LANG]/*.txt**

In this directory you will see several text files with the contents of the metadata that is language dependant.

#### Available languages
`da`, `de-DE`, `el`, `en-AU`, `en-CA`, `en-GB`, `en-US`, `es-ES`, `es-MX`, `fi`, `fr-CA`, `fr-FR`, `id`, `it`, `ja`, `ko`, `ms`, `nl`, `no`, `pt-BR`, `pt-PT`, `ru`, `sv`, `th`, `tr`, `vi`, `zh-Hans`, `zh-Hant`

**./screenshots/[LANG]/*.***

As with metadata, screenshots support multi language. Based on the dimension of the images they will be correctly set to the appropiate device. The images are ordered alphabetically, so make sure to name them correctly to control the right display order.
