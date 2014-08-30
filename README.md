#soundcloudnodejs
================

The missing NodeJS Wrapper for SoundCloud API
soundcloudnodejs is a nodejs module to access [soundcloud](https://www.soundcloud.com) from NodeJS.

## Install
```bash
npm install soundcloudnodejs


Register your app http://soundcloud.com/you/apps/new

```
var soundcloudnodejs = require('soundcloudnodejs');
var options = {
    client_id: "",
    client_secret: "",
    grant_type: '',
    username: "",
    password: "",
    redirect_uri: ""
}
soundcloudnodejs.getToken(options, function (err, token, meta) {
    config.access_token = token.access_token;
    console.log(config.access_token)
});

```

No bla bla bla and many examples --> see folder /example.