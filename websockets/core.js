//namespace.emit(eventName[, …args])
//socket.on(eventName, callback)

const cookie = require('cookie');

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

const jwtlib = require ('jsonwebtoken');


// todo move Constructor.getPlaceholders() to client
//  and call when render index

///=======================================================================

//socket.request.headers.cookie;

class Core {
    constructor(httpServer) {
        io = require('socket.io')(httpServer);
    }

    initialize() {

        const login = 'qazswed';
        const password = '123456';

        io.on('connection', socket => {
            socket.on('authenticate', (jwt) => {

                console.log('_GET_::' + `${jwt}`);

                try {
                    jwtlib.verify(jwt, safetyWorker.getKey());
                    socket.emit('authenticated');
                    console.log('authenticated');
                } catch (e) {
                    socket.emit('notAuthenticated');
                }

                socket.on('login', (l, p) => {
                    if (l === login && p === password) {
                        const t = safetyWorker.createJwtToken(
                            { login: login, password: password });

                        socket.emit('loggedIn', t);
                        console.log('loggedIn::' + `${t}`);
                    } else {
                        socket.emit('notLoggedIn');
                    }
                });


            });
        });
    }

    //var token = jwt.sign(user_profile, jwt_secret, {expiresInMinutes: 60});
        // io.on('connection', socket => {


            // io.use(socketJwt.authorize({
            //     secret: safetyWorker.getKey(),
            //     handshake: true,
            // }));


            // socket.use(function (packet, next) {

            // socket.on('login', (login, password) => {
            //     // console.log(socket.request.headers.cookie);
            //     // console.log(cookie.parse(socket.request.headers.cookie));
            //
            //     let token = safetyWorker.createJwtToken({
            //         login: login,
            //         password: password
            //     });
            //     socket.emit("login", token);
            // });




            // socket.use(socketJwt.authorize({
            //     secret: safetyWorker.getKey(),
            //     handshake: true,
            // }));



            // router.post('api/login', (req, res) => {
            //
            //     const login = RequestHandler.retrieveLogin(req.body);
            //     const password = RequestHandler.retrievePassword(req.body);
            //     const doesUserExist = userWorker.getUserIdByLogin(login) !== null;
            //
            //     if (!doesUserExist) {
            //         const userData = requestHandler.createUser(login, password);
            //         if (userData === null) {
            //             res.status(statuses.unprocessableEntity).end();
            //         } else {
            //             userWorker.updateJsonStorage();
            //             safetyWorker.setCookie(res, userData);
            //             res.status(statuses.ok).end();
            //         }
            //     } else {
            //         const userData = requestHandler.checkUserCredentials(login, password);
            //         if (userData === null) {
            //             res.status(statuses.forbidden).end();
            //         } else {
            //             safetyWorker.setCookie(res, userData);
            //             res.status(statuses.ok).end();
            //         }
            //     }
            // });
            //
            //
            // router.use((req, res, next) => {
            //     const token = safetyWorker.getJwtTokenFromCookie(req.cookies);
            //     const authorized = safetyWorker.isJwtTokenValid(token);
            //
            //     if (!authorized) {
            //         res.sendStatus(statuses.forbidden).end()
            //     } else {
            //         req.ownerId = Number(safetyWorker.getUserDataFromJwtToken(token).userId);
            //         next();
            //     }
            // });
            //
            //
            //
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
            //
            //
            //
            // // downloads 1 attachment
            // router.get('/api/attachments/:id', (req, res) => {
            //     const pathToAttachment = taskWorker.getAttachmentPathById(req.params);
            //     if (pathToAttachment) {
            //         res.status(statuses.ok).download(pathToAttachment);
            //     } else {
            //         res.sendStatus(statuses.notFound).end();
            //     }
            // });
            //
            //
            //
            // // gets 1 task
            // router.get('/api/tasks/:id', (req, res) => {
            //
            //     const task = taskWorker.getTaskDataById(req.params.id);
            //     if (task !== null) {
            //         res.status(statuses.ok).json(task);
            //     } else {
            //         res.sendStatus(statuses.notFound).end();
            //     }
            // });
            //
            // //
            // // following routers change state of server's file storage
            // // so there is last router which updates JSON storage file
            // //
            //
            // // removes 1 task
            // router.delete('/api/tasks/:id', (req, res) => {
            //     const status = requestHandler.deleteTask(req.params.id).status;
            //     res.sendStatus(status).end();
            //
            //     if (statuses.successNoContent === status) {
            //         taskWorker.updateJsonStorage();
            //     }
            // });
            //
            // // partial update of 1 task.
            // // it should process complete request here
            // router.patch('/api/tasks/:id', (req, res) => {
            //     const status = requestHandler.patchTask(req.body, req.files, req.params.id).status;
            //     res.sendStatus(status).end();
            //
            //     if (statuses.successNoContent === status) {
            //         taskWorker.updateJsonStorage();
            //     }
            // });
            //
            //
            // // changes 1 task
            // router.put('/api/tasks/:id', (req, res) => {
            //     const status = requestHandler.updateTask(req.body, req.files, req.params.id).status;
            //     res.sendStatus(status).end();
            //
            //     if (statuses.successNoContent === status) {
            //         taskWorker.updateJsonStorage();
            //     }
            // });
            //
            //
            //
            // //
            // // no need to check ownership when:
            // //      POST '/api/tasks' because of creation new task
            // //      GET  '/api/tasks' because of checks while filtering
            // //
            //
            //
            //
            // // creates 1 task
            // router.post('/api/tasks', (req, res) => {
            //     const result = requestHandler.createTask(req.ownerId, req.body, req.files);
            //     if (result.newItemIndex === null) {
            //         res.sendStatus(result.status).end();
            //     } else {
            //         res.status(result.status).json(result.newItemIndex);
            //         taskWorker.updateJsonStorage();
            //     }
            // });
            //
            // // gets all the tasks
            // router.get('/api/tasks', (req, res) => {
            //     const tasksToSend = requestHandler.getFilteredTask(req.ownerId, req.query);
            //
            //     if (tasksToSend) {
            //         res.status(statuses.ok).json(tasksToSend);
            //     } else {
            //         res.status(statuses.ok).json([]);
            //     }
            // });

        //});

}


        //     if (packet[0].includes('login') || isTokenValid(getSocketToken(socket))) {
        //         next();
        //     } else {
        //         sendLoginPage(socket);
        //     }
        // });
        // }).on('authenticated', function(socket) {
        //     //this socket is authenticated, we are good to handle more events from it.
        //     console.log('hello! ' + socket.decoded_token.ownerId_);
        //    })
        // });
        // io.on('connection', socket => {
        //
        //     // socket.use((packet, next) => {
        //     //
        //     // });
        //
        //
        //     socket.on('event', () => {
        //         console.log(socket.request.headers.cookie);
        //         console.log(cookie.parse(socket.request.headers.cookie));
        //
        //         // socket.request.setHeader('Set-Cookie',
        //         //     cookie.serialize('name', 'iiii', { httpOnly: true,  maxAge: 60 * 60 * 24 * 7 }
        //         // ));
        //
        //         //socket.request.headers.cookie = cookie.serialize('dsgre', 'wg');
        //
        //         console.log(socket.request.headers.cookie);
        //         console.log(cookie.parse(socket.request.headers.cookie));
        //
        //         // console.log(old );
        //         // old.
        //         // socket.request.headers.cookie += cookie.serialize('uuu', "vfsbvedrb");
        //         //
        //         // console.log( cookie.parse(socket.request.headers.cookie) );
        //
        //         socket.emit("x", 1, 2, 3);
        //     });


module.exports = Core;

