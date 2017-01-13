/**
 * Created by stefan on 12.01.17.
 */



importScripts('/js/lib/require.js');
importScripts('/js/config.js');

self.postMessage({
    event: ['gameWorker', 'ready'],
    data: ''
})
require(['eventDispatcher'], function (events) {

    self.addEventListener('message', function (e) {
        try {
            dispatcher[e.data.event[0]][e.data.event[1]].trigger(e.data.data);
        } catch (ex) {
            console.error('Dispatch message from Window: ', ex, e.data);
        }
    });

    events.gameWorker.ready.claimTrigger()();

});