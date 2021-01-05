import engine from 'store/src/store-engine';
import localStorage from 'store/storages/localStorage';
import memoryStorage from 'store/storages/memoryStorage';
import expirePlugin from 'store/plugins/expire';

const communityDB = engine.createStore([localStorage, memoryStorage], [expirePlugin]);
export default communityDB;
