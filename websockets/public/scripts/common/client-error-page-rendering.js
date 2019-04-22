class ClientErrorPageRendering {

    static showError(errorThrown) {
        $('body').html(errorThrown);
    }

}