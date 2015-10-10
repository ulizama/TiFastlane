## Tifast Snapshot
This command is used to create all Screenshots with multi-language for your app.

Before you run `tifast snapshot` you need to do some configuration.

* Profile your app in Xcode (`CMD + I`), choose `Automation` and click the Record button on the bottom of the window.

![assets/snapshotAutomation.png](assets/snapshotAutomation.png)

* This will get you started. Copy the generated code into `snapshot.js`. Make sure, you leave the import statement on the top.

* To take a screenshot, use `captureLocalizedScreenshot('0-name')` on script

Here's an example of `snapshot` working:
![assets/snapshot.gif](assets/snapshot.gif)

#### This is the HTML generated from snapshot
![assets/htmlPagePreviewFade.jpg](assets/htmlPagePreviewFade.jpg)

### Snapfile
You can customize your `Snapfile` as you like it. For more options follow the [official documentation of Snapshot](https://github.com/KrauseFx/snapshot)
