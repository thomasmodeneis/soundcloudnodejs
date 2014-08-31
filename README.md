#soundcloudnodejs
================

The missing NodeJS Wrapper for SoundCloud API
soundcloudnodejs is a nodejs module to access [soundcloud](https://www.soundcloud.com) from NodeJS.

## Install
```bash
npm install soundcloudnodejs


Register your app http://soundcloud.com/you/apps/new


var soundcloudnodejs = require("soundcloudnodejs");
var options = {
    client_id: "your_client_id",
    client_secret: "your_client_secret",
    grant_type: "password",
    username: "your_username",
    password: "your_password",
    redirect_uri: "your_redirect_uri"
}
soundcloudnodejs.getToken(options, function (err, token, meta) {
    config.access_token = token.access_token;
    console.log(config.access_token)
});

```

For usage see folder [soundcloudnodejs/example/](https://github.com/thomasmodeneis/soundcloudnodejs/tree/master/example) .