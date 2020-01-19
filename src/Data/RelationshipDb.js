class RelationshipDb {
    constructor(storyName) {
        var dbPromise = new Promise((resolve, reject) => {
            var req = indexedDB.open(`${storyName}-relationship-graph`, 1);
            req.onsuccess = function (evt) {
                resolve(this.result);
            };
        
            req.onerror = function (evt) {
                reject(`openDb: ${evt.target.errorCode}`);
            };
        
            req.onupgradeneeded = function (evt) {
                const edgeStore = evt.currentTarget.result.createObjectStore('edge', { keyPath: 'id', autoIncrement: true });
                evt.currentTarget.result.createObjectStore('node', { keyPath: 'id', autoIncrement: true });

                edgeStore.createIndex('from', 'from', { unique: false });
            };
        });

        function getObjectStore(db, storeName, mode) {
            var tx = db.transaction(storeName, mode);
            return tx.objectStore(storeName);
        }

        function runCursor(openCursor) {
            return new Promise((resolve, reject) => {
                const result = [];
                openCursor.onsuccess = (event) => {
                    var cursor = event.target.result;
                    if(cursor) {
                        result.push(cursor.value);
                        cursor.continue();
                    } else {
                    resolve(result);
                    }
                };    
                openCursor.onerror = (e) => reject(e);
            });
        }

        function doUpdate(db, storeName, obj, method) {
            return new Promise((resolve) => {
                var add = getObjectStore(db, storeName, 'readwrite')[method](obj);
                add.onsuccess = () => resolve(true);
                add.onerror = () => resolve(false);
            });
        }

        function doGet(db, storeName, key) {
            return new Promise(resolve => {
                const req = getObjectStore(db, storeName, 'readonly').get(key);
                req.onsuccess = (e) => resolve(e.target.result);
                req.onerror = () => resolve(false);
            });
        }

        function doGetCollection(db, storeName, keyRange) {
            const store = getObjectStore(db, storeName, 'readonly');
            return runCursor(store.openCursor(keyRange));
        }

        this.getEdgeAsync = async (key) => {
            const db = await dbPromise;
            return doGet(db, 'edge', key);
        }

        this.getNodeAsync = async (key) =>{
            const db = await dbPromise;
            return doGet(db, 'node', key);
        }

        this.addEdgeAsync = async (edge) => {
            const db = await dbPromise;
            return await doUpdate(db, 'edge', edge, 'add');
        }

        this.addNodeAsync = async (node) => {
            const db = await dbPromise;
            return await doUpdate(db, 'node', node, 'add');
        }

        this.updateEdgeAsync = async (edge) => {
            const db = await dbPromise;
            return await doUpdate(db, 'edge', edge, 'put');
        }

        this.updateNodeAsync = async (node) => {
            const db = await dbPromise;
            return await doUpdate(db, 'node', node, 'put');
        }

        this.getEdgesGreaterThanOrEqualToId = async(value) => {
            const db = await dbPromise;
            return await doGetCollection(db, 'edge', IDBKeyRange.lowerBound(value));
        }

        this.getNodesGreaterThanOrEqualToId = async(value) => {
            const db = await dbPromise;
            return await doGetCollection(db, 'node', IDBKeyRange.lowerBound(value));
        }

        this.getAllEdgesFrom = async(value) => {
            const db = await dbPromise;
            await runCursor(getObjectStore(db, 'edge', 'readonly').index('from').openCursor(IDBKeyRange.only(value)));
        }
    }
}

export default RelationshipDb;