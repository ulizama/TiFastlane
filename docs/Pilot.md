## Tifast Pilot
This tool allows you to manage all important features of Apple TestFlight using your terminal.

* [tifast pilot upload](#upload)

* [tifast pilot builds](#builds)

* [tifast pilot add](#add)

* [tifast pilot export](#export)

* [tifast pilot import](#import)

* [tifast pilot find](#find)

* [tifast pilot list](#list)

* [tifast pilot remove](#remove)



`pilot` uses [spaceship.airforce](https://spaceship.airforce/) to interact with iTunes Connect.

### Upload

This will automatically look for an `ipa` in your `dist` directory and tries to fetch the login credentials from your `tifastlane.cfg`.

    tifast pilot upload

You can also skip the submission of the binary, which means, the `ipa` file will only be uploaded and not distributed to testers:

    tifast pilot upload -s


### Builds
To list all builds for specific application.

    tifast pilot builds


### Add
Adds a new external tester. This will also add an existing tester to an app.

    tifast pilot add


### Export
Exports all external testers to a CSV file

    tifast pilot export


### Import
Create external testers from a CSV file. The file **must** be at `appRoot/TiFLPilot/tester_import.csv`

    tifast pilot import
    
#### Import Tester CSV
Here's an example of how the `tester_import.csv` should look:

```javascript
// Name, Lastname, Email
John,Appleseed,appleseed_john@mac.com
```

### Find
Find a tester (internal or external) by their email address.

    tifast pilot find <tester@email.com>


### List
Lists all registered testers, both internal and external.

    tifast pilot list


### Remove
Remove an external tester by their email address

    tifast pilot remove <tester@email.com>



