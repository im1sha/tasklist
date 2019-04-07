
const request = new XMLHttpRequest();
request.open("GET", 'http://localhost:3000/login', true);
request.onload = function() {
    switch (request.status) {
        case 401:

            break;
        case 200:

            break;
        default:
            document.body = request.statusText;
            break;
    }
};