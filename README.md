#soundcloudnodejs
================

The missing Async NodeJS Wrapper for SoundCloud API
soundcloudnodejs is a nodejs module to access [soundcloud](https://www.soundcloud.com) from NodeJS.

## Install
```bash
npm install --save soundcloudnodejs
```

## Register
Register your app http://soundcloud.com/you/apps/new


Example Code to get your Token Access from SoundCloud API
```
var soundcloudnodejs = require("soundcloudnodejs");
var options = {
    client_id: "your_client_id",
    client_secret: "your_client_secret",
    grant_type: "password",
    username: "your_username",
    password: "your_password",
    redirect_uri: "your_redirect_uri"
}
soundcloudnodejs.getToken(options).then(function (token, meta) {
    console.log(token.access_token)
});

```

For usage see folder [soundcloudnodejs/example/](https://github.com/thomasmodeneis/soundcloudnodejs/tree/master/example) .


# License

```The MIT License (MIT)

Copyright (c) 2016 Thomas Modeneis

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
```