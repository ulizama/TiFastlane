# TiFastlane [![npm version](https://badge.fury.io/js/tifastlane.svg)](http://badge.fury.io/js/tifastlane)

Building apps for iOS and Android it's all great until you have to deal with Certificates, Provisioning Profiles and sending the app to iTunes Connect or the Play Store. Then came [fastlane.tools](https://fastlane.tools/) a collection of tools that enable Continuous Deployment of iOS and Android Apps.

TiFastlane is a way to use those tools for Titanium development. Now you'll be able to do real continous deployment of your Titanium app. Sending your app for review will be a breeze:

	tifast send
	
And publishing your new version to the Play Store will be as easy:

	tifast playsend

With TiFastlane you'll be able to fully optimize the way you submit your app updates and maintain your certificates and provisioning profiles.

### Current tools from [Fastlane](https://github.com/KrauseFx/fastlane) available:
<p align="center">

  &bull; <a href="https://github.com/KrauseFx/deliver">deliver</a> &bull;
  <a href="https://github.com/KrauseFx/PEM">PEM</a> &bull;
  <a href="https://github.com/KrauseFx/sigh">sigh</a> &bull;
  <a href="https://github.com/KrauseFx/produce">produce</a> &bull;
  <a href="https://github.com/fastlane/pilot">pilot</a> &bull;
    <a href="https://github.com/fastlane/supply">supply</a> &bull;
</p>

## Documentation

* [Installation](./docs/INSTALL.md)
* [iOS App Store Guide](./docs/IOS.md)
* [Android Play Store Guide](./docs/ANDROID.md)


## TODO

* Support for installr
* Add [Frameit](https://github.com/fastlane/frameit)
* Specification of the default certificate to use.


##  Collaborators

* [Uriel Lizama](https://github.com/ulizama)
* [Douglas Hennrich](https://github.com/DouglasHennrich)

##  Thanks

* [Felix Krause](https://github.com/KrauseFx) for creating the awesome fastlane.tools
* [Jason Kneen](https://github.com/jasonkneen) for creating some awesome CLI tools from which I'm basing this one

## Changelog
* 0.4.1 Minor bug fixes
* 0.4.0 Added `supply` to support Google Play Store. Updated to the latest `fastlane` tools.
* 0.3.8 Changed name of deliver file from `title.txt` to `name.txt`
* 0.3.7 Fix problem with uploading only metadata and screenshots


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
