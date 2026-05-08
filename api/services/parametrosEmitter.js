import { EventEmitter } from 'events';

const parametrosEmitter = new EventEmitter();
parametrosEmitter.setMaxListeners(100);

export default parametrosEmitter;
