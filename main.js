// Modules to control application life and create native browser window
const { BufferReadable } = require("buffer-readable");
const { MultiBufferReadable } = require("multi-readable");
const {app, BrowserWindow} = require('electron')
const path = require('path')
const {readFile} = require("fs/promises");
const { Agent, request: _request } = require("https");
const {createReadStream} = require("fs");

function createWindow () {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      devTools: true,
      preload: path.join(__dirname, 'preload.js')
    }
  })
  // Open the DevTools.
  mainWindow.webContents.openDevTools();

  // onBeforeRequest 无法拿到 header 的信息， 所以需要从 onBeforeSendHeaders 这个方法做 对 header 的处理
  mainWindow.webContents.session.webRequest.onBeforeRequest(
      {urls: ['https://jira.toolsfdg.net/*']},
      async (request, callback) => {
        const url = new URL(request.url);
        // 需要的证书，和需要代理到网关的 ip 52.223.7.42
        const [cert, key] = await Promise.all([
          readFile("cert/certificate.pem"),
          readFile("cert/privateKey.key"),
        ]);
        const agent = new Agent({ cert, key, host: "52.223.7.42" });

        // 客户端校验 server 的证书
        const ca = "-----BEGIN CERTIFICATE-----\nMIIFfzCCA2egAwIBAgICEAAwDQYJKoZIhvcNAQELBQAwUzELMAkGA1UEBhMCR0Ix\nEDAOBgNVBAgMB0VuZ2xhbmQxEjAQBgNVBAoMCURpZmZ0IEx0ZDEeMBwGA1UEAwwV\nRGlmZnQgQ3liZXJUcnVzdCBSb290MB4XDTIxMTExNjExNDE0OVoXDTMxMTExNDEx\nNDE0OVowSjELMAkGA1UEBhMCR0IxEDAOBgNVBAgMB0VuZ2xhbmQxEjAQBgNVBAoM\nCURpZmZ0IEx0ZDEVMBMGA1UEAwwMRGlmZnQgU1NMIENBMIICIjANBgkqhkiG9w0B\nAQEFAAOCAg8AMIICCgKCAgEArtzHa4n2PiMa1GajuOzcJjr/ipaQ6K3dMYfiP7Xq\n+tV9zh7kD/DAece1KSX+4SavpLgCb/B3r8zL0YpDuth6Gn9Ql2XWOD5JGUeP6+gG\njjfZGkjAOdaOT+A/gcRkZ7DizGI0/ZS7Ga4EKSnWuC0P23iJSgToZSPMbmTDl70u\nIk2xNpUokM7tiavEuIv2+HA/cOM34IntVd1f7bYp1EOq+i0qbZN+ruCPgGeatbqb\nO1KU5OQ3ygDeCWivTPF7w9EnKSaUl/9Qvohdp2mM8+ANojivhWE4mffSmHJnHqv5\nZLEliEvbQAI58Pum/wG4khRKMrEXtXdrf+9ye+/wAkdo17ZRkioOHWA9hJbzaDax\nfeQkv4KTf0ajF35WPhOtDOzZ5r5Eutc5GWORo8spGJaH5R660J4ihBF+ElTsp19v\nFZOnEEra1m3NhJwVl0g+4GznTtor9nDyYWT4es+p960+e2i9cO6WiJBmKOj003qu\nlLuodmJIZzvYRn2eCOhLkbSqT5dhRSjSyYYLPgIK3cnyrLAckzuDz+iuHqcuCX2Q\nofFwmuPXKhqVKlqD3iVdIs5s2pKhcWOXpWx/KeVRdPUmbfMJ0dbcn1f6lL2qzT8K\nmoYqBB1hadPkidxAFdYZfb74yxA7ZjxEsOEfT3zVilR8Uh67B+vqf5LyvOF2+9o6\n4rECAwEAAaNmMGQwHQYDVR0OBBYEFHbN8ZCS4Y5ozQEfKM/xGPL86kKwMB8GA1Ud\nIwQYMBaAFLlSihYU9MSuErmS76++NAtE/qJJMBIGA1UdEwEB/wQIMAYBAf8CAQAw\nDgYDVR0PAQH/BAQDAgGGMA0GCSqGSIb3DQEBCwUAA4ICAQAizrIlGejeXsfI7Lx0\nbqlfZG485zqoqLOTT0HB4LCniBKJTn8VUHTM5jqDKEIEqTUal2m/rOuV84kJorbc\nfoFEB/U72I1BolvCvNvxtYlwlWfrVVmebyrDJgdB1cxenYu5a5YloT0mopgZ+b8J\nEuR08ey4E3WGvHEoY24cuh6VjFIaOs4JFQYqfQ9T65MM0CBIm1niGXLhIEMXJrqW\npl8hMDEzmzz9h7EJqrvn0dkuVlj9ERpF5SKrx15CmXgxnmTflBosPTCHDYtBmLew\nNE27IobTksNN5uge7lRYCFX+troJXMoX/1zJbMxicaQLXj6eqvNk/Pt3e7hc2wje\ntjNFui8IygwkRVuGOXwQq62nuAQrtPsNrI+0bJevo8Py+5gA3YSLTGIcFxxQxkzs\n7xWEa+FVc9f2HnKb6Xz/tY5qiTUxyQmuKoQseunNvYco+ezlUsbE8HuXScPJfYfs\nEKWn17hmVEqGnID69oMAkX+XtU8y2mCWP278HCRvk1FHfZCVy/lY7FWGGUuyKsxI\njRZhTJBdpY2aMfpT4z3aOn0MLd8jnAHe2BQ4a/x9UN7+KvRUCwfN+F+z4Hgl+0fi\n3SxETa0xDaH6vgxrDgi06j37IxAMliMhDwmPIpAEVjStfx4NZ4duANLBCqXJjpyb\ne6IO4vHMTohQzz7eBZAoXeEF3w==\n-----END CERTIFICATE-----\n-----BEGIN CERTIFICATE-----\nMIIFmTCCA4GgAwIBAgIUUoDQhnD2xrGerkCY7EAs8JYgzUswDQYJKoZIhvcNAQEL\nBQAwUzELMAkGA1UEBhMCR0IxEDAOBgNVBAgMB0VuZ2xhbmQxEjAQBgNVBAoMCURp\nZmZ0IEx0ZDEeMBwGA1UEAwwVRGlmZnQgQ3liZXJUcnVzdCBSb290MCAXDTIxMTEx\nNjExNDEwMFoYDzIwNzExMTA0MTE0MTAwWjBTMQswCQYDVQQGEwJHQjEQMA4GA1UE\nCAwHRW5nbGFuZDESMBAGA1UECgwJRGlmZnQgTHRkMR4wHAYDVQQDDBVEaWZmdCBD\neWJlclRydXN0IFJvb3QwggIiMA0GCSqGSIb3DQEBAQUAA4ICDwAwggIKAoICAQDg\nJwQPXj3Y92ta8Dc4nhJZBcbi0TyuKEYGTgyGKv2E5k7TCg9ggg+KS9Fsx1SkfX1k\n9u/okJkaNxLot8TbkYrXpgXoroDI1akQRBiCs7TAb47OuhVJ0BVh8CxNJqIJz1vk\nHRhI5POlaCjK7bb1p3QpMjsKlqKOdJUuC/GtIhCZ1qj/Nr8rC9HqJl2Qv/R+rGon\nsRLY8vz/9Tdi3vIONNyo1ZB+RuGe4CccLjz+cQ2QMx/Z1KUapgIMvVgHm5M26yal\n815BwXgYGXPbZTSwpp3N09n4rxl1J1bl64K0CiE2Xv43Va5Bbh65mKDMsBoGN9GZ\nVJSQsUrcVaRm2lcgSbL+0qufmifH7WsYYzw9om0cxeC36yLm7JWcSdpdzXTrZzjA\nrrGtFKwuljmtRu07UPHqQnQNWnEANdCDAWrv5e/l7rzsLpoE/vAdFd4oUg5fsa9z\nqHaXRKZY99Fn8cBo+7sfaNckYtwTuUFS3uvrTjs1cVabE19xyM36AdhtEOw0Ryfg\nPK/E9peLYPKZ2bvV5xcQIQFZ1+82tBcRQ0EAaKEeROos9t2dllTZsj6v7azCsbHP\n/1L49hfDOCYpwXmScFDd5MpkU7TqqdCAXpacG9nbkpyN99t2541NRJtFch36shoC\n69/aB589C1F62y05QzB1Wbx+/b8r/1tfCPqGf6qTswIDAQABo2MwYTAdBgNVHQ4E\nFgQUuVKKFhT0xK4SuZLvr740C0T+okkwHwYDVR0jBBgwFoAUuVKKFhT0xK4SuZLv\nr740C0T+okkwDwYDVR0TAQH/BAUwAwEB/zAOBgNVHQ8BAf8EBAMCAYYwDQYJKoZI\nhvcNAQELBQADggIBAF3CSPGyakBJCoiSnoCc+kYIQQUqPsfDzfaa9xc348pKkBjh\nzgtuO1dD4ObwcbFzcdLbs72z8uOJ3UfltSOCPSlkbOZYVUYUW80vgGTvYhj1aDtA\n5xxjC+b4DX5C5qIN8r8QfSgzA6L/B8U9TedscXxbH8v6Y8rJXRnqIcBZiDfpAYFD\nwK7zwniCu7mudglamDV1vDEAQWJnQ35hvmi/d8IEKvSUblRM1CxsqZfg1bYEgtVL\nWYgKtVOaWcHDyWr83awzMVrrFsMmLrBUhdrAFW9MWchtfXAIZqfljmYZDelNEuOe\n9+273m2AdYtqv5c+2FvS2/sdgfEnFhK7WNDQIb1EzYY0/tGajMtXWlZPa+kuFaYy\nGmWfVmctTRIgbXRgksU5qLABZMV5FHPxbvKykEE3oefG/XQclM8mYmo38j6nb8kh\neUV1rCXBSw/2Mb/EpAw/akMXwBekxh5/b00r3qraH+Cazxz0AzZhO55ilaIWrjSm\nH5CELckQJViA2SXOJImG5jHdryHNy2K8g5dIamyRa0ZhksAXDX34CMzOWv+Z2cYh\n2BFE/RbJPCudpLbt3SAcQ0H6vsS5c9B9cGDzxVdy10kSwoegEGY23FV/At7pHI4y\nLhJxRfwD7EyxSrWqBOqjEpJgTOYXAA0U1E3VMfJFpneprvJsHaVFWuxJ179D\n-----END CERTIFICATE-----\n";

        const req = _request(
            {
              hostname: url.hostname,
              port: url.port,
              path: url.pathname + url.search + url.hash,
              method: request.method,
              agent,
              ca,
              timeout: 10000,
            },
            (res) => {
              // TODO：希望能够将 res 作为 这次拦截的请求 的 response 进行返回。 这边的 callback 并不能实现。

                callback({})
            }
        )
            .on("error", (err) => {
              // throw err;
            })
            .on("timeout", () => {
              // req.destroy(new Error("timeout"));
            });
        const uploadData = request.uploadData;
        if (uploadData && uploadData.length > 0) {
          try{
            new MultiBufferReadable(
                uploadData.map(({ bytes, blobUUID, file }) => {
                  if (file) {
                    return createReadStream(file);
                  } else if (blobUUID) {
                    // what is it?
                    throw new Error("todo");
                  } else {
                    return new BufferReadable(bytes);
                  }
                })
            ).pipe(req);
          }catch (e) {
            console.log(e)
          }
        } else {
          req.end();
        }
      }
  );
  mainWindow.webContents.session.webRequest.onBeforeSendHeaders(
      {urls: ['https://jira.toolsfdg.net/*']},
      (details, callback) => {
        const requestHeaders = details.requestHeaders || {};

        // TODO add header  网关测试环境已经去掉了所有 header 的校验。这边可以暂时不加也可以。

        callback({ requestHeaders });
      }
  )

  // and load the index.html of the app.
  mainWindow.loadURL("https://jira.toolsfdg.net/");
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
