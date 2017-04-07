# TiFastlane [![npm version](https://badge.fury.io/js/tifastlane.svg)](http://badge.fury.io/js/tifastlane)

Building apps for iOS and Android it's all great until you have to deal with Certificates, Provisioning Profiles and sending the app to iTunes Connect or the Play Store. Then came [fastlane.tools](https://fastlane.tools/) a collection of tools that enable Continuous Deployment of iOS and Android Apps.

TiFastlane is a way to use those tools for Titanium development. Now you'll be able to do real continous deployment of your Titanium app. Sending your app for review will be a breeze:

	tifast send

And publishing your new version to the Play Store will be as easy:

	tifast playsend

With TiFastlane you'll be able to fully optimize the way you submit your app updates and maintain your certificates and provisioning profiles.

### Current tools from [Fastlane](https://github.com/fastlane/fastlane) available:
<p align="center">

  &bull; <a href="https://github.com/fastlane/fastlane/tree/master/deliver">deliver</a> &bull;
  <a href="https://github.com/fastlane/fastlane/tree/master/pem">pem</a> &bull;
  <a href="https://github.com/fastlane/fastlane/tree/master/sigh">sigh</a> &bull;
  <a href="https://github.com/fastlane/fastlane/tree/master/produce">produce</a> &bull;
  <a href="https://github.com/fastlane/fastlane/tree/master/pilot">pilot</a> &bull;
  <a href="https://github.com/fastlane/fastlane/tree/master/supply">supply</a> &bull;
</p>

## Documentation

* [Installation](./docs/INSTALL.md)
* [iOS App Store Guide](./docs/IOS.md)
* [Android Play Store Guide](./docs/ANDROID.md)


## TODO

* Support for installr
* Add [Frameit](https://github.com/fastlane/fastlane/tree/master/frameit)


##  Collaborators

* [Uriel Lizama](https://github.com/ulizama)
* [Douglas Hennrich](https://github.com/DouglasHennrich)
* [Jeroen van Dijk](https://github.com/jvandijk)
* [Jong Eun Lee](https://github.com/yomybaby)
* [Hazem Khaled](https://github.com/HazemKhaled)


##  Thanks

* [Felix Krause](https://github.com/KrauseFx) for creating the awesome fastlane.tools
* [Jason Kneen](https://github.com/jasonkneen) for creating some awesome CLI tools from which I'm basing this one

## Changelog
* 0.9.0 Added support for Titanium 6.0.3.GA and XCode 8.3
* 0.8.3 You can customize the build args on setup
* 0.8.2 Fix on PEM. Node dependencies
* 0.8.0 BC BREAK to support Fastlane 2. Minor changes on tifast send
* 0.7.0 Bug fixes. Added new `repairprofiles` and `downloadprofiles`
* 0.6.0 `playsend` now uses a JSON key instead of a P12 key. This is a breaking change and the setup needs to be done again.
* 0.5.1 Removed automatic Fastlane installation, updated Install Guide.
* 0.5.0 Revamped the way `send` works, you now can choose to skip uploading binary, screenshots, etc. Reworked `playsend` so that it builds the APK for distribution using the [recommended unique keystore](http://docs.appcelerator.com/platform/latest/#!/guide/Distributing_Android_apps).
* 0.4.5 Added support for multiple config files. `playsend` params update.
* 0.4.1 Minor bug fixes


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
