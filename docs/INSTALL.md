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
