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
                const edgeStore = evt.currentTarget.result.createObjectStore('edge', { keyPath: 'relation' });
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
                var tx = db.transaction(storeName, 'readwrite');
                if(method === 'add')
                    tx.oncomplete = (e) => resolve(addUpdate.result);
                    
                var addUpdate = tx.objectStore(storeName)[method](obj);
    
                if(method !== 'add')
                    addUpdate.onsuccess = () => resolve(true);
                    
                addUpdate.onerror = () => resolve(false);
            });
        }

        function doGet(db, storeName, key) {
            return new Promise(resolve => {
                const req = getObjectStore(db, storeName, 'readonly').get(key);
                req.onsuccess = (e) => resolve(req.result);
                req.onerror = () => resolve(false);
            });
        }

        function doGetAll(db, storeName) {
            return new Promise(resolve => {
                const req = getObjectStore(db, storeName, 'readonly').getAll();
                req.onsuccess = (e) => resolve(req.result);
                req.onerror = () => resolve(false);
            });
        }

        this.getEdgeAsync = async (key) => {
            const db = await dbPromise;
            return doGet(db, 'edge', key);
        }

        this.getNodeAsync = async (key) =>{
            const db = await dbPromise;
            return doGet(db, 'node', parseInt(key));
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

        this.getAllEdges = async(value) => {
            const db = await dbPromise;
            return await doGetAll(db, 'edge');
        }

        this.getAllNodes = async(value) => {
            const db = await dbPromise;
            return await doGetAll(db, 'node');
        }

        this.getAllEdgesFrom = async(value) => {
            const db = await dbPromise;
            return await runCursor(getObjectStore(db, 'edge', 'readonly')
                .index('from')
                .openCursor(IDBKeyRange.only(parseInt(value))));
        }
    }
}

export default RelationshipDb;