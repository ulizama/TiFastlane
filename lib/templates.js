#!/usr/bin/env node

/*jslint node: true */
'use strict';

/*
@ tifastlane.cfg
*/
exports.cfgFile = "{\n" +
"   \"cli\": \"[CLI]\" \n" +
" , \"locale\": \"[LOCALE]\" \n" +
" , \"apple_id\": \"[APPLE_ID]\" \n" +
" , \"team_id\": \"[TEAM_ID]\" \n" +
" , \"team_name\": \"[TEAM_NAME]\" \n" +
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
"username \"[EMAIL]\" # the login email address\n" +
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
"# The keys/values on the top allow values from 0-2, and the items on the bottom allow only 0 or 1.\n" +
"app_rating_config_path \"./ratings.json\"\n" +
"\n" +
"# Please, read this information https://github.com/KrauseFx/deliver/blob/master/Reference.md\n" +
"\n" +
"Must be a hash. This is used as the last step for the deployment process, where you define if you use third party content or use encryption.\n" +
"submission_information({\n" +
"   add_id_info_serves_ads: false,\n" +
"   add_id_info_limits_tracking: false,\n" +
"   add_id_info_tracks_action: true,\n" +
"   add_id_info_tracks_install: true,\n" +
"   add_id_info_uses_idfa: true,\n" +
"   content_rights_contains_third_party_content: false,\n" +
"   content_rights_has_rights: false,\n" +
"   export_compliance_available_on_french_store: false,\n" +
"   export_compliance_ccat_file: false,\n" +
"   export_compliance_contains_proprietary_cryptography: false,\n" +
"   export_compliance_is_exempt: false,\n" +
"   export_compliance_uses_encryption: false,\n" +
"   export_compliance_encryption_updated: false,\n" +
"   export_compliance_compliance_required: false\n" +
"})\n" +
"\n" +
"###################### More Options ######################\n" +
"# If you want to have even more control, check out the documentation\n" +
"# https://github.com/KrauseFx/deliver/blob/master/Deliverfile.md\n" +
"\n";

/*
@ rating.json
*/
exports.ratings = "{\n" +
"   \"CARTOON_FANTASY_VIOLENCE\": 0,\n" +
"   \"REALISTIC_VIOLENCE\": 0,\n" +
"   \"PROLONGED_GRAPHIC_SADISTIC_REALISTIC_VIOLENCE\": 0,\n" +
"   \"PROFANITY_CRUDE_HUMOR\": 0,\n" +
"   \"MATURE_SUGGESTIVE\": 0,\n" +
"   \"HORROR\": 0,\n" +
"   \"MEDICAL_TREATMENT_INFO\": 0,\n" +
"   \"ALCOHOL_TOBACCO_DRUGS\": 0,\n" +
"   \"GAMBLING\": 0,\n" +
"   \"SEXUAL_CONTENT_NUDITY\": 0,\n" +
"   \"GRAPHIC_SEXUAL_CONTENT_NUDITY\": 0,\n" +
"\n" +
"\n" +
"   \"UNRESTRICTED_WEB_ACCESS\": 0,\n" +
"   \"GAMBLING_CONTESTS\": 0\n" +
"}";

/*
@ SnapShots Files
*/
/*
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
*/

// Pilot
exports.pilotImport = "John,Appleseed,appleseed_john@mac.com";
