import Events from '../libs/Events';
import AppView from '../views/AppView';
import LoginModal from '../views/LoginModal';
import User from './User';
import DataStore from '../libs/DataStore';
import Backup from '../libs/Backup';

export default class App extends Events {
    constructor() {
        super();

        this.packageWorker = new Worker('worker.bundle.js');
        this.packageWorker.addEventListener('message', (event) => this.fromWorker(event));

        global.dataStore = new DataStore();
        global.appStore = new DataStore();
        global.backup = new Backup(global.dataStore);

        global.appStore.on('app', (app, previousApp) => {
            if (!previousApp || app.currentPackage !== previousApp.currentPackage) {
                global.app.sendWork({
                    message: 'unset-package',
                    packageName: previousApp && previousApp.currentPackage
                });

                global.app.sendWork({
                    message: 'set-package',
                    packageName: app.currentPackage,
                    selection: global.dataStore.getProjectMeta(app.projectID, 'selection')
                });
            }
        });

        this.listenTo(global.appStore, 'app', this.onApp);

        global.appStore.set('app', {
            currentPackage: 'RectangleTool'
        });

        this.user = new User();
    }

    onApp(app) {
        if (!this.appView) {
            this.appView = new AppView({el: document.querySelector('.app-view')});
        }

        this.appView.render(app);

        if (!app.userID) {
            new LoginModal();
        }
    }

    sendWork(event) {
        this.packageWorker.postMessage(event);
    }

    fromWorker(event) {
        this.trigger(event.data.message, event.data);
    }
}
