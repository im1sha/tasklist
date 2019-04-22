class ClientStorageWorker {

    static getToken() {
        return localStorage.getItem("jwt");
    }

    // value is String
    static setToken(value) {
        localStorage.setItem("jwt",value);
    }

    static  removeToken(){
        localStorage.removeItem("jwt");
    }

}


