#!/usr/bin/env node

/*jslint node: true */
'use strict';

/*
@ tifastlane.cfg
*/
exports.cfgFile = "{\n" +
"   \"cli\": \"[CLI]\" \n" +
" , \"locale\": \"[LOCALE]\" \n" +
" , \"username\": \"[USERNAME]\" \n" +
"}";

/*
@ Deliverfile
*/
exports.deliverFile = "###################### App Metadata ######################\n" +
"# Update the app description and metadata in the ./metadata folder\n" +
"\n" +
"###################### Screenshots ######################\n" +
"# Store all screenshots in the ./screenshots folder separated\n" +
"# by language.\n" +
"\n" +
"###################### App Information ######################\n" +
"app_identifier \"[APP_ID]\"\n" +
"apple_id \"[ID]\" # This is NOT your Apple login ID, but the App ID of your app\n" +
"email \"[EMAIL]\" # the login email address\n" +
"\n" +
"# Pass the price tier as number. This will be active from the current day. 0 = free\n" +
"price_tier 0\n" +
"\n" +
"# A path to a new app icon, which must be exactly 1024x1024px\n" +
"app_icon \"../../DefaultIcon.png\"\n" +
"\n" +
"# The up to date copyright information.\n" +
"copyright \"#{Time.now.year} Felix Krause\"\n" +
"\n" +
"# The english name of the category you want to set (e.g. Business, Books)\n" +
"primary_category \"Business\"\n" +
"\n" +
"# The english name of the secondary category you want to set\n" +
"secondary_category \"Games\"\n" +
"\n" +
"# Should the app be released to all users once Apple approves it? If set to false, you'll have to manually release the update once it got approved.\n" +
"automatic_release true\n" +
"\n" +
"# Contact information for the app review team. Available options: first_name, last_name, phone_number, email_address, demo_user, demo_password, notes.\n" +
"app_review_information(\n" +
"  first_name: \"Felix\",\n" +
"  last_name: \"Krause\",\n" +
"  phone_number: \"123123\",\n" +
"  email_address: \"github@krausefx.com\",\n" +
"  demo_user: \"demoUser\",\n" +
"  demo_password: \"demoPass\",\n" +
"  notes: \"such notes, very text\"\n" +
")\n" +
"\n" +
"# You can set the app age ratings using deliver. You'll have to create and store a JSON configuration file.\n" +
"\n" +
"# The comment in the JSON file is just for your convenience, it will not be used by deliver. You can now replace the level values to have the value 1 for mild and 2 for intense.\n" +
"\n" +
"# The boolean values on the bottom can only have the value 0 or 1.\n" +
"ratings_config_path \"./ratings.json\"\n" +
"\n" +
"# should be a hash. This is used as the last step for the deployment process, where you define if you use third party content or use encryption.\n" +
"submit_further_information({\n" +
"  export_compliance: {\n" +
"    encryption_updated: false,\n" +
"    cryptography_enabled: false,\n" +
"    is_exempt: false\n" +
"  },\n" +
"  third_party_content: {\n" +
"    contains_third_party_content: false,\n" +
"    has_rights: false\n" +
"  },\n" +
"  advertising_identifier: {\n" +
"    use_idfa: false,\n" +
"    serve_advertisement: false,\n" +
"    attribute_advertisement: false,\n" +
"    attribute_actions: false,\n" +
"    limit_ad_tracking: false\n" +
"  }\n" +
"})\n" +
"\n" +
"###################### More Options ######################\n" +
"# If you want to have even more control, check out the documentation\n" +
"# https://github.com/KrauseFx/deliver/blob/master/Deliverfile.md\n" +
"\n";

/*
@ rating.json
*/
exports.ratings = "[\n" +
"  {\n" +
"    \"comment\": \"Cartoon or Fantasy Violence\",\n" +
"    \"level\": 0\n" +
"  },\n" +
"  {\n" +
"    \"comment\": \"Realistic Violence\",\n" +
"    \"level\": 0\n" +
"  },\n" +
"  {\n" +
"    \"comment\": \"Prolonged Graphic or Sadistic Realistic\",\n" +
"    \"level\": 0\n" +
"  },\n" +
"  {\n" +
"    \"comment\": \"Profanity or Crude Humor\",\n" +
"    \"level\": 0\n" +
"  },\n" +
"  {\n" +
"    \"comment\": \"Mature/Suggestive Themes\",\n" +
"    \"level\": 0\n" +
"  },\n" +
"  {\n" +
"    \"comment\": \"Horror/Fear Themes\",\n" +
"    \"level\": 0\n" +
"  },\n" +
"  {\n" +
"    \"comment\": \"Medical/Treatment Information\",\n" +
"    \"level\": 0\n" +
"  },\n" +
"  {\n" +
"    \"comment\": \"Alcohol, Tobacco, or Drug Use or References\",\n" +
"    \"level\": 0\n" +
"  },\n" +
"  {\n" +
"    \"comment\": \"Simulated Gambling\",\n" +
"    \"level\": 0\n" +
"  },\n" +
"  {\n" +
"    \"comment\": \"Sexual Content or Nudity\",\n" +
"    \"level\": 0\n" +
"  },\n" +
"  {\n" +
"    \"comment\": \"Graphic Sexual Content and Nudity\",\n" +
"    \"level\": 0\n" +
"  },\n" +
"  {\n" +
"    \"type\": \"boolean\",\n" +
"    \"comment\": \"Unrestricted Web Access\",\n" +
"    \"level\": 0\n" +
"  },\n" +
"  {\n" +
"    \"type\": \"boolean\",\n" +
"    \"comment\": \"Gambling and Contests\",\n" +
"    \"level\": 0\n" +
"  },\n" +
"  {\n" +
"    \"comment\": \"Made for Kids; 1 = Age < 5; 2 = Ages 6-8; 3 = Ages 9 - 11\",\n" +
"    \"level\": 0\n" +
"  }\n" +
"]";

/*
@ SnapShots Files
*/
exports.Snapfile = "# Uncomment the lines below you want to change by removing the # in the beginning\n" +
"\n" +
"# A list of devices you want to take the screenshots from\n" +
"devices([\n" +
"  \"iPhone 6\",\n" +
"  \"iPhone 6 Plus\",\n" +
"  \"iPhone 5\",\n" +
"  \"iPhone 4s\",\n" +
"  \"iPad Air\"\n" +
"])\n" +
"\n" +
"\n" +
"# Available languades:\n" +
"#\"da\", \"de-DE\", \"el\", \"en-AU\", \"en-CA\", \"en-GB\", \"en-US\", \"es-ES\", \"es-MX\", \"fi\", \"fr-CA\", \"fr-FR\", \"id\", \"it\", \"ja\", \"ko\", \"ms\", \"nl\", \"no\", \"pt-BR\", \"pt-PT\", \"ru\", \"sv\", \"th\", \"tr\", \"vi\", \"zh-Hans\", \"zh-Hant\"\n" +
"languages([\n" +
"  \"en-US\",\n" +
"  \"de-DE\",\n" +
"  \"pt-BR\"\n" +
"])\n" +
"\n" +
"\n" +
"# Where should the resulting screenshots be stored?\n" +
"screenshots_path \"./screenshots\"\n" +
"\n" +
"\n" +
"# clear_previous_screenshots # remove the '#' to clear all previously generated screenshots before creating new ones\n" +
"\n" +
"\n" +
"# JavaScript UIAutomation file\n" +
"js_file './snapshot.js'\n" +
"\n" +
"\n" +
"# The name of the project's scheme\n" +
"scheme '[SCHEME]'\n" +
"\n" +
"\n" +
"# Where is your project (or workspace)? Provide the full path here\n" +
"project_path \"[PATH]\"\n" +
"\n" +
"\n" +
"# By default, the latest version should be used automatically. If you want to change it, do it here\n" +
"# ios_version \"8.1\"\n" +
"\n" +
"\n";

exports.snapshotiPad = "#import \"SnapshotHelper.js\"\n" +
"\n" +
"var target = UIATarget.localTarget();\n" +
"var app = target.frontMostApp();\n" +
"var window = app.mainWindow();\n" +
"// Edit only below this comment\n" +
"// To take shots -> captureLocalizedScreenshot(\"name_photo\")\n" +
"\n" +
"\n" +
"target.delay(3)\n" +
"captureLocalizedScreenshot(\"0-LandingScreen\");\n" +
"\n";

exports.snapshot = "#import \"SnapshotHelper.js\"\n" +
"\n" +
"var target = UIATarget.localTarget();\n" +
"var app = target.frontMostApp();\n" +
"var window = app.mainWindow();\n" +
"// Edit only below this comment\n" +
"// To take shots -> captureLocalizedScreenshot(\"name_photo\")\n" +
"\n" +
"\n" +
"target.delay(3)\n" +
"captureLocalizedScreenshot(\"0-LandingScreen\");\n" +
"\n";

exports.SnapshotHelper = "function wait_for_loading_indicator_to_be_finished()\n" +
"{\n" +
"  try {\n" +
"    re = UIATarget.localTarget().frontMostApp().statusBar().elements()[2].rect()\n" +
"    re2 = UIATarget.localTarget().frontMostApp().statusBar().elements()[3].rect()\n" +
"    while ((re['size']['width'] == 10 && re['size']['height'] == 20) ||\n" +
"           (re2['size']['width'] == 10 && re2['size']['height'] == 20))\n" +
"     {\n" +
"      UIALogger.logMessage(\"Loading indicator is visible... waiting\")\n" +
"      UIATarget.localTarget().delay(1)\n" +
"      re = UIATarget.localTarget().frontMostApp().statusBar().elements()[2].rect()\n" +
"      re2 = UIATarget.localTarget().frontMostApp().statusBar().elements()[3].rect()\n" +
"    }\n" +
"  } catch (e) {}\n" +
"}\n" +
"\n" +
"\n" +
"function isTablet()\n" +
"{\n" +
"  return !(UIATarget.localTarget().model().match(/iPhone/))\n" +
"}\n" +
"\n" +
"\n" +
"function captureLocalizedScreenshot(name) {\n" +
"  wait_for_loading_indicator_to_be_finished();\n" +
"\n" +
"  var target = UIATarget.localTarget();\n" +
"  var model = target.model();\n" +
"  var rect = target.rect();\n" +
"  var deviceOrientation = target.deviceOrientation();\n" +
"\n" +
"  var theSize = (rect.size.width > rect.size.height) ? rect.size.width.toFixed() : rect.size.height.toFixed();\n" +
"\n" +
"  if (model.match(/iPhone/)) \n" +
"  {\n" +
"    if (theSize > 667) {\n" +
"      model = \"iPhone6Plus\";\n" +
"    } else if (theSize == 667) {\n" +
"      model = \"iPhone6\";\n" +
"    } else if (theSize == 568){\n" +
"      model = \"iPhone5\";\n" +
"    } else {\n" +
"    model = \"iPhone4\";\n" +
"    }\n" +
"  }\n" +
"  else\n" +
"  {\n" +
"    model = \"iPad\";\n" +
"  }\n" +
"\n" +
"  var orientation = \"portrait\";\n" +
"  if (deviceOrientation == UIA_DEVICE_ORIENTATION_LANDSCAPELEFT) {\n" +
"    orientation = \"landscapeleft\";\n" +
"  } else if (deviceOrientation == UIA_DEVICE_ORIENTATION_LANDSCAPERIGHT) {\n" +
"    orientation = \"landscaperight\";\n" +
"  } else if (deviceOrientation == UIA_DEVICE_ORIENTATION_PORTRAIT_UPSIDEDOWN) {\n" +
"    orientation = \"portrait_upsidedown\";\n" +
"  }\n" +
"\n" +
"  var result = target.host().performTaskWithPathArgumentsTimeout(\"/usr/bin/printenv\" , [\"SNAPSHOT_LANGUAGE\"], 5);\n" +
"\n" +
"  var language = result.stdout.substring(0, result.stdout.length - 1);\n" +
"\n" +
"  var parts = [language, model, name, orientation];\n" +
"  target.captureScreenWithName(parts.join(\"-\"));\n" +
"}\n";

// Pilot
exports.pilotImport = "John,Appleseed,appleseed_john@mac.com";
