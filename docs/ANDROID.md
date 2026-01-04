## Setup a Google Developers Service Account

- Open the [Google Play Console](https://play.google.com/apps/publish/)
- Select **Settings** tab, followed by the **API access** tab
- Click the **Create Service Account** button and follow the **Google Developers Console** link in the dialog
- Click the **Create Service account** button at the top of the developers console screen
- Provide a name for the service account
- Click **Select a role** and choose **Project > Service Account Actor**
- Check the **Furnish a new private key** checkbox
- Select **JSON** as the Key type and click **Create**
- Save the JSON file into **the root of your Titanium App project directory** and name it `GooglePlayKey.json` (you can choose to name it differently), and close the dialog
- Back on the Google Play developer console, click **Done** to close the dialog
- Click on **Grant Access** for the newly added service account
- Choose **Release Manager** from the **Role** dropdown and click **Send Invitation** to close the dialog

### Migrating Google credential format (from .p12 key file to .json)

In previous versions of supply and tifast, credentials to your Play Console were stored as `.p12` files. We now are using the recommended `.json` key Service Account credential files. To upgrade please follow the _Setup_ procedure once again to make sure you create the appropriate JSON file, and run the `tifast setup` again.

## Get Started

Inside your app directory, you first need to setup and configure TiFastlane:

    tifast setup

Make sure you enter the correct name of the P12 file Google provided and that is correctly placed in the root of your directory, as well as entering the correct issuer email.

Once your configuration is set, then you want to initialize your app:

    tifast playinit

**IMPORTANT: The App must already exist on your Play Store account, there is no functionality to create it just yet**

And then finally when you are ready, you'll want to send your app to the Play Store:

    tifast playsend

**Is it that easy!**

Below you will find full documentation on every step and other tools available to you.

## Usage

`tifastlane` or `tifast` must be executed from your Titanium App directory. It will automatically read your tiapp.xml to determine your App configuration for all the tools.

#### Available Commands

- [tifast setup](#tifast-setup)
- [tifast playinit](#tifast-init)
- [tifast status](#tifast-status)
- [tifast playsend](#tifast-send)

#### CLI Help

Each of TiFastlane's commands has its own set of arguments you can use to further control. You can easily look at each available argument with -h, for example:

tifast setup -h

### Tifast Setup

This will configure TiFastlane on your current project.

    tifast setup

### Tifast PlayInit

TiFastlane needs to initialize the configuration files needed to keep the Play Store updated with the correct information:

    tifast playinit

For the moment this process doesn't download any existing screenshots or images from the Play Store.

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

### Tifast PlaySend

When you have a new version of your App that you wish to push to the Play Store, all you have to do is:

    tifast playsend

You can choose the Track to upload the App to (production, beta, alpha or rollout):

    tifast playsend --track beta

You can decide what you want to send to Google Play (apk, screenshots, metadata, etc). For full listing of options run:

    tifast playsend -h

## Metadata/Screenshot Files

All metadata and screenshots are easily maintained from the `TiFLDelivery\APPID\PlayStore` directory.

You can configure the different Title, Full Description Short Description and your Images. You can read the full [documentation here](https://github.com/fastlane/supply).

**./PlayStore/metadata/[LANG]/\*.txt**

In this directory you will see several text files with the contents of the metadata that is language dependent.

\*_./PlayStore/metadata/[LANG]/images/_

On the root of this directory you can supply images with the following file names (extension can be png, jpg or jpeg):

- featureGraphic
- icon
- promoGraphic
- tvBanner

And you can supply screenshots by creating directories with the following names, containing PNGs or JPEGs (image names are irrelevant):

- phoneScreenshots/
- sevenInchScreenshots/ (7-inch tablets)
- tenInchScreenshots/ (10-inch tablets)
- tvScreenshots/
- wearScreenshots/

**Note that these will replace the current images and screenshots on the play store listing, not add to them.**

## TiFast Configuration

By default the main configuration settings are stored in a file called `tifastlane.cfg` in your app project root.

If you want to be able to have multiple configuration files, for example, to login with other credentials, you can override the configuration file to be loaded by using the `-c` param.

For example:

    tifast playsend -c otherconfig.cfg

This will make TiFastlane use the `otherconfig.cfg` file instead of the default `tifastlane.cfg`. All methods accept the configuration override.
