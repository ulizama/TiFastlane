## Instalation
Requiments:
* Mac OS 10.9 or newer
* Ruby 2.0 or newer (`ruby -v`)
* Xcode

Additionally, to an Xcode installation, you also need the Xcode command line tools set up.

`xcode-select --install`

### [Fastlane](https://fastlane.tools/)
Install the gem and all its dependencies (this might take a few minutes).

`sudo gem install fastlane --verbose`

In case RubyGems has a hard time installing Nokogiri, check out their [official installation guide](http://www.nokogiri.org/tutorials/installing_nokogiri.html).

### Tifastlane [![npm version](https://badge.fury.io/js/tifastlane.svg)](http://badge.fury.io/js/tifastlane)

`[sudo] npm install -g tifastlane`

Now you are ready to get Started :D

## Usage

`tifastlane` or `tifast` must be executed from your Titanium App directory. It will automatically read your tiapp.xml to determine your App configuration for all the tools.

#### Available Commands
* [tifast setup](###Tifast-Setup)

### Tifast Setup
First we need to setup how TiFastlane will work on your app, run:

`tifast setup`
