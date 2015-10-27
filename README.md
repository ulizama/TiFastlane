# TiFastlane [![npm version](https://badge.fury.io/js/tifastlane.svg)](http://badge.fury.io/js/tifastlane)

Building apps for iOS it's all great until you have to deal with Certificates, Provisioning Profiles and sending iTunes Connect. Then came [fastlane.tools](https://fastlane.tools/) a collection of tools that enable Continuous Deployment of iOS Apps.

TiFastlane it's a way to use those tools for Titanium development. Now you'll be able to do real continous deployment of your Titanium app. Sending your app for review will be a breeze:

	tifast send

With TiFastlane you'll be able to fully optimize the way you submit your app updates and maintain your certificates and provisioning profiles.

### Current tools from [Fastlane](https://github.com/KrauseFx/fastlane) available:
<p align="center">

  &bull; <a href="https://github.com/KrauseFx/deliver">deliver</a> &bull;
  <a href="https://github.com/KrauseFx/PEM">PEM</a> &bull;
  <a href="https://github.com/KrauseFx/sigh">sigh</a> &bull;
  <a href="https://github.com/KrauseFx/produce">produce</a> &bull;
  <a href="https://github.com/fastlane/pilot">pilot</a> &bull;
</p>

## [Documentation](./docs/README.md)


## TODO

* Add [Frameit](https://github.com/fastlane/frameit)
* Specification of the default certificate to use.

##  Collaborators

* [Uriel Lizama](https://github.com/ulizama)
* [Douglas Hennrich](https://github.com/DouglasHennrich)

##  Thanks

* [Felix Krause](https://github.com/KrauseFx) for creating the awesome fastlane.tools
* [Jason Kneen](https://github.com/jasonkneen) for creating some awesome CLI tools from which I'm basing this one

## Changelog
* 0.3.7 Fix problem with uploading only metadata and screenshots
* 0.3.6 Update to use the latest tools provided by [@KrauseFx](https://github.com/KrauseFx/fastlane)
* 0.3.4 Fix on status and snapshot call
* 0.3.3 Update app version on send

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
