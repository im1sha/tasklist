//namespace.emit(eventName[, …args])
//socket.on(eventName, callback)

const TaskWorker = require('./scripts/task-worker');
const UserWorker = require('./scripts/user-worker');
const SafetyWorker = require('./scripts/safety-worker');
const RequestHandler = require('./scripts/request-handler');
const taskWorker = new TaskWorker();
const userWorker = new UserWorker();
const safetyWorker = new SafetyWorker(userWorker);
const requestHandler = new RequestHandler(taskWorker, userWorker);
const ClientUtils = require('./public/scripts/client-utils');
const statuses = ClientUtils.getStatusCodes();
let io;
const fs  = require('fs');


// todo move Constructor.getPlaceholders() to client
//  and call when render index

///=======================================================================

//socket.request.headers.cookie;

class Core {
    constructor(httpServer) {
        io = require('socket.io')(httpServer);
    }

    //createJwtToken

    initialize() {
        io.on('connection', socket => {
            socket.on('authenticate', (jwt) => {
                let userId = null, userHash = null, userLogin = null;

                if (safetyWorker.isJwtTokenValid(jwt)) {
                    socket.emit('authenticated');

                    const userData = safetyWorker.getUserDataFromJwtToken(jwt);
                    userId = userData.userId;
                    userHash = userData.userHash;
                    userLogin = userData.userLogin;

                    socket.on('logout', () => { });


                    // todo parse ID as middleware
                    // todo CHECK ID ownership as middleware

                    // router.param('id', (req, res, next, id) => {
                    //
                    //     if (!taskWorker.doesExist(id)) {
                    //         res.sendStatus(statuses.notFound).end();
                    //     } else if (!taskWorker.isOwner(req.ownerId, id)) {
                    //         res.sendStatus(statuses.forbidden).end();
                    //     } else {
                    //         if (RequestHandler.retrieveIndexOfRequestedElement(id) === null) {
                    //             res.sendStatus(statuses.badRequest).end();
                    //         } else {
                    //             next();
                    //         }
                    //     }
                    // });

                    // downloads 1 attachment
                    socket.on('downloadTask', (id) => {
                        const pathToAttachment = taskWorker.getAttachmentPathById(id);

                        //pathToAttachment === null | string
                        if (pathToAttachment === null) {
                            socket.emit('downloadTask', null);
                        } else {
                            fs.readFile(pathToAttachment, (err, data) => {
                                socket.emit('downloadTask', data);
                            });
                        }
                    });

                    // gets 1 task
                    socket.on('getTask', (id) => {
                        // task is null | { }
                        socket.emit('getTask', taskWorker.getTaskDataById(id));
                    });

                    // removes 1 task
                    socket.on('deleteTask', (id) => {
                        const status = requestHandler.deleteTask(id).status;
                        socket.emit('deleteTask', status);
                        if (statuses.successNoContent === status) {
                            taskWorker.updateJsonStorage();
                        }
                    });

                    // changes 1 task
                    socket.on('updateTask', (task, file, id) => {

                        //todo
                        // rewrite requestHandler.updateTask
                        // merge requestHandler.patchTask to requestHandler.updateTask
                        const status = requestHandler.patchTask(task, file, id).status;
                        socket.emit('patchTask', status);
                        if (statuses.successNoContent === status) {
                            taskWorker.updateJsonStorage();
                        }
                    });

                    //
                    // no need to check ownership
                    //

                    // creates 1 task
                    socket.on('createTask', (task, file) => {
                        // todo rewrite requestHandler.createTask
                        //  should return task
                        const result = requestHandler.createTask(task, file);
                        socket.emit('createTask', result);
                        if (result !== null) {
                            taskWorker.updateJsonStorage();
                        }
                    });

                    // gets all the tasks
                    socket.on('getAllTasks', (filters) => {
                        // todo rewrite requestHandler.getFilteredTask
                        const tasksToSend = requestHandler.getFilteredTask(filters);
                        socket.emit('getAllTasks', tasksToSend);
                    });

                } else {
                    socket.emit('notAuthenticated');

                    socket.on('login', (login, password) => {
                        const doesUserExist = userWorker.getUserIdByLogin(login) !== null;
                        if (!doesUserExist) {
                            const userData = requestHandler.createUser(login, password);
                            if (userData === null) {
                                socket.emit('notLoggedIn', 'unprocessableEntity');
                            } else {
                                userWorker.updateJsonStorage();
                                socket.emit('loggedIn', safetyWorker.createJwtToken(userData));
                            }
                        } else {
                            const userData = requestHandler.checkUserCredentials(login, password);
                            if (userData === null) {
                                socket.emit('notLoggedIn', 'forbidden');
                            } else {
                                socket.emit('loggedIn', safetyWorker.createJwtToken(userData));
                            }
                        }
                    });
                }
            });
        });
    }
}


// io.on('connection', socket => {
//
//     // socket.use((packet, next) => {
//     //
//     // });
// });

module.exports = Core;

