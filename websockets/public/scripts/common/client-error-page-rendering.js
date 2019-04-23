class ClientErrorPageRendering {

    static showError(jqXHR, textStatus, errorThrown, additionalParams) {
        $('body').html(errorThrown);
    }

}