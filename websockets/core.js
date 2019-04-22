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
const fs  = require('fs');
const Utils = require('./scripts/utils');

// todo move Constructor.getPlaceholders() to client
//  and call when render index


class Core {

    constructor(httpServer) {
        this.io = require('socket.io')(httpServer);
    }

    initialize() {
        this.io.on('connection', socket => {
            socket.on('authenticate', (jwt) => {
                let userId = null; //, userHash = null, userLogin = null;
                if (!safetyWorker.isJwtTokenValid(jwt)) {

                    socket.emit('notAuthenticated');

                    socket.on('logIn', (login, password) => {
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

                } else {

                    socket.emit('authenticated');

                    const userData = safetyWorker.getUserDataFromJwtToken(jwt);
                    userId = userData.userId;
                    // userHash = userData.userHash;
                    // userLogin = userData.userLogin;

                    //
                    // no need to check ownership
                    //

                    //  todo SET AT CLIENT SIDE: task.taskAttachmentFileName === filename

                    // creates 1 task
                    socket.on('createTask', (task, file) => {
                        //  todo should return task | null
                        const result = requestHandler.createTask(userId, task, file);

                        if (result !== null) {
                            taskWorker.updateJsonStorage();
                        }

                        socket.emit('createTask', result);

                    });

                    // gets all the tasks
                    // todo
                    //  filters is { filter1: "all", filter2: "all" }
                    //  emit('getAllTasks', arg) where arg is null | []
                    socket.on('getAllTasks', (filters) => {
                        const tasksToSend = requestHandler.getFilteredTask(userId, filters);
                        socket.emit('getAllTasks', tasksToSend);
                    });

                    socket.use((packet, next) => {
                        const id = Number(packet[1]); // arg0 of client-side emit() call

                        if (Utils.isNonNegativeInt(id)){
                            if (!taskWorker.doesExist(id)) {
                                next(new Error('notFound'));
                            } else if (!taskWorker.isOwner(userId, id)) {
                                next(new Error('forbidden'));
                            } else {
                                return next();
                            }
                        } else {
                            next(new Error('badRequest'));
                        }
                    });

                    // downloads 1 attachment
                    socket.on('downloadTask', (id) => {
                        const pathToAttachment = taskWorker.getAttachmentPathById(id);

                        // pathToAttachment === null | string
                        if (pathToAttachment === null) {
                            socket.emit('downloadTask', null);
                        } else {
                            fs.readFile(pathToAttachment, (err, data) => {
                                if (err) {
                                    socket.emit('downloadTask', null);
                                } else {
                                    socket.emit('downloadTask', data);
                                }
                            });
                        }
                    });

                    // gets 1 task
                    socket.on('getTask', (id) => {
                        // task is null | task
                        socket.emit('getTask', taskWorker.getTaskDataById(id));
                    });

                    // removes 1 task
                    socket.on('deleteTask', (id) => {
                        const status = requestHandler.deleteTask(id); // status is Boolean

                        if (true === status) {
                            taskWorker.updateJsonStorage();
                        }

                        socket.emit('deleteTask', status);
                    });

                    // changes 1 task
                    socket.on('updateTask', (id, task, file) => {

                        //todo
                        // rewrite requestHandler.updateTask

                        const status = requestHandler.updateTask(task, file, id).status;

                        if (statuses.successNoContent === status) {
                            taskWorker.updateJsonStorage();
                        }

                        socket.emit('updateTask', status);
                    });

                    // complete 1 task
                    socket.on('completeTask', (id) => {

                        const status = requestHandler.patchTask(id).status;

                        if (statuses.successNoContent === status) {
                            taskWorker.updateJsonStorage();
                        }

                        socket.emit('completeTask', status);
                    });
                }
            });
        });
    }
}

module.exports = Core;


// io.on('connection', socket => {
//
//     // socket.use((packet, next) => {
//     //
//     // });
// });

