const electron = require('electron')
const path = require('path')
const Menu = electron.Menu
const app = electron.app
const BrowserWindow = electron.BrowserWindow
const {dialog} = require('electron')

const { default: installExtension, REACT_DEVELOPER_TOOLS } = require('electron-devtools-installer');

let windows = []

function createWindow () {

  let window = new BrowserWindow({
    width: Math.round(700 * 1.618),
    height: 700,
    minWidth: Math.round(700 * 1.618),
    minHeight: 700,
    show: false,
    backgroundColor: '#272822',
    icon: path.join(__dirname, '/icons/png/256x256.png')
  });

  windows.push(window)

  window.loadURL(`file://${__dirname}/index.html`)

  installExtension(REACT_DEVELOPER_TOOLS)
    .then((name) => console.log(`Added Extension:  ${name}`))
    .catch((err) => console.log('An error occurred: ', err));
  // Open the DevTools.
  // window.webContents.openDevTools()

  window.on('closed', function () {
    let index = windows.indexOf(window)
    windows.splice(index, 1)
    window = null
  })

  window.once('ready-to-show', () => {
     window.show()
  })

  window.saveDocument = function() {
    const fs = require("fs")
    const timestamp = Date.now()
    const folderPath = `./sketches/${timestamp}` 
    fs.mkdir(folderPath, err => { if (err) throw err })

    const printOptions = {
      printBackground: true,
      landscape: true,
      marginsType: 1
    }
    window.webContents.printToPDF(printOptions, (error, data) => {
      if (error) throw error
      fs.writeFile(folderPath + '/screen.pdf', data, (error) => { if (error) throw error })
    })

    window.webContents.send('save', {
      folder: folderPath 
    })
  }

  var template = [{
    label: app.getName(),
    submenu: [
        { role: 'about'},
        { type: 'separator' },
        { role: 'quit' }
    ]}, {
    label: "Sketch",
    submenu: [
        { label: "New",
          accelerator: "CmdOrCtrl+N",
          click: function() {
            createWindow()
          }
        },
        { type: "separator" },
        {
          label: "Open",
          accelerator: "CmdOrCtrl+O",
          click: () => {
            dialog.showOpenDialog({
              properties: ["openFile"],
              filter: [ // filters do not work for open dialogs
                {name: "Moniel source files", extensions: ["mon", "moniel"]},
                {name: "All Files", extensions: ["*"]}
              ]
            }, (filePaths) => {
              if (filePaths) {
                let w = createWindow()
                w.on("show", () => {
                  w.webContents.send("open", {
                    filePath: filePaths[0]
                  })
                })
              }
            })
          }
        },
        { type: "separator" },
        { label: "Save",
          accelerator: "CmdOrCtrl+S",
          click: () => {
            const window = BrowserWindow.getFocusedWindow()
            if (window !== null) {
              window.saveDocument()
            }
          }
        },
        //{ label: "Save As", accelerator: "Shift+CmdOrCtrl+S" },
        //{ label: "Save All", accelerator: "Option+CmdOrCtrl+S" },
        { type: "separator" },
        { label: "Close",
          accelerator: "CmdOrCtrl+W",
          click: () => {
            const window = BrowserWindow.getFocusedWindow()
            if (window !== null) {
              window.close()
            }
          }
        },
        { label: "Close All",
          accelerator: "Option+CmdOrCtrl+W",
          click: () => {
            while (windows.length > 0) {
              windows[0].close()
            }
          }
        },
    ]}, {
    label: "Edit",
    submenu: [
        { label: "Undo", accelerator: "CmdOrCtrl+Z", selector: "undo:" },
        { label: "Redo", accelerator: "Shift+CmdOrCtrl+Z", selector: "redo:" },
        { type: "separator" },
        { label: "Cut", accelerator: "CmdOrCtrl+X", selector: "cut:" },
        { label: "Copy", accelerator: "CmdOrCtrl+C", selector: "copy:" },
        { label: "Paste", accelerator: "CmdOrCtrl+V", selector: "paste:" },
        { label: "Select All", accelerator: "CmdOrCtrl+A", selector: "selectAll:" }
    ]},{
      label: 'Window',
      role: 'window'
    }, {
    label: 'View',
    submenu: [
      {
        label: "Toggle Layout",
        click: () => {
          const window = BrowserWindow.getFocusedWindow()
          if (window !== null) {
            window.webContents.send('toggleLayout', null);
          }
        }
      },
      {
        type: 'separator'
      },
      {
        role: 'reload'
      },
      {
        role: 'toggledevtools'
      },
      {
        type: 'separator'
      },
      {
        role: 'resetzoom'
      },
      {
        role: 'zoomin'
      },
      {
        role: 'zoomout'
      },
      {
        type: 'separator'
      },
      {
        role: 'togglefullscreen'
      }
    ]}
  ];

  Menu.setApplicationMenu(Menu.buildFromTemplate(template));

  return window
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (windows.length === 0) {
    createWindow()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
