const path = require('path')
const url = require('url')
const { app, BrowserWindow, ipcMain, Menu } = require('electron')
const Log = require('./models/log') 
const db = require('./config/db')

db();

let mainWindow;

let isDev = false;
const isMac = process.platform === 'darwin' ? true : false;

if (
	process.env.NODE_ENV !== undefined &&
	process.env.NODE_ENV === 'development'
) {
	isDev = true;
}

function createMainWindow() {
	mainWindow = new BrowserWindow({
		width: 1100,
		height: 800,
		show: false,
		backgroundColor: 'white',
		icon: `${__dirname}/assets/icon.png`,
		webPreferences: {
			nodeIntegration: true,
			devTools: true,
			webSecurity: false
		},
	})

	let indexPath

	if (isDev && process.argv.indexOf('--noDevServer') === -1) {
		indexPath = url.format({
			protocol: 'http:',
			host: 'localhost:8080',
			pathname: 'index.html',
			slashes: true,
		})
	} else {
		indexPath = url.format({
			// protocol: 'file:',
			// pathname: path.join(__dirname, 'dist', 'index.html'),
			// slashes: true,
			protocol: 'http:',
			host: 'localhost:8080',
			pathname: 'index.html',
			slashes: true,
		})
	}

	console.log(indexPath)
	mainWindow.loadURL(indexPath)

	// Don't show until we are ready and loaded
	mainWindow.once('ready-to-show', () => {
		mainWindow.show()

		// Open devtools if dev
		if (isDev) {
			const {
				default: installExtension,
				REACT_DEVELOPER_TOOLS,
			} = require('electron-devtools-installer')

			installExtension(REACT_DEVELOPER_TOOLS).catch((err) =>
				console.log('Error loading React DevTools: ', err)
			)
			mainWindow.webContents.openDevTools()
		}
	})

	mainWindow.on('closed', () => (mainWindow = null))
}

// menu
const menu = [
	...(isMac ? [{role: 'appMenu'}] : []),
	{
		role: 'fileMenu'
	},
	{
		role: 'editMenu'
	},
	{
		label: 'Logs',
		submenu: [
			{
				label: 'Clear logs',
				click: () => clearLogs(),
			}
		]
	},
	{role: 'toggledevtools'},
	...(isDev ? [
		{
			label: 'Developer',
			submenu : [
				{role: 'reload'},
				{role: 'forcereload'},
				{role: 'separator'},
				{role: 'toggledevtools'}
			]
		}
	] : [])
];

app.on('ready', () => {
	createMainWindow();
	const mainMenu = Menu.buildFromTemplate(menu);
	Menu.setApplicationMenu(mainMenu);
})

//  clear all logs in db
const clearLogs = async () => {
	try {
		await Log.deleteMany({})
		mainWindow.webContents.send('logs:clear')
	} catch (error) {
		console.log(error);
	}
}



// sendibg logs from db to app.js (renderer)
const sendLogs = async() => {
	try {
		// console.log('recieved in main')
		const logs = await Log.find().sort({created: 1});
		mainWindow.webContents.send('logs:get', JSON.stringify(logs))
	} catch (error) {
		console.log(error);
	}
};
ipcMain.on('logs:load', sendLogs);

// adding log to db 
const addLog = async(event, item) => {
	try{
		await Log.create(item);
		sendLogs();
	} catch (error) {
		console.log(error);
	}
}
ipcMain.on('logs:add', addLog)

// deleting log from db
const deleteLog = async (event, id) => {
	try {
		 await Log.findOneAndDelete({_id: id});
		 sendLogs();
	} catch (error) {
		console.log(error);
	}
}
ipcMain.on('logs:delete', deleteLog)

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit()
	}
})

app.on('activate', () => {
	if (mainWindow === null) {
		createMainWindow()
	}
})

// Stop error
app.allowRendererProcessReuse = true
