'use strict';

(function( $ ) {
$(document).ready(function(){

    var themewrapper = "<div id='portal-theme'>" +
                            "<a href='/'>Graphite Theme" +
                                "<span id='graphite-theme-status'>" +
                                    "<span class='on'>ON</span>" +
                                    "<span class='off'>OFF</span>" +
                                "</span>" +
                            "</a>"
                        "</div>";

    $('#portal-personaltools-wrapper').after(themewrapper);

    // Graphite Theme control bar
    $('#portal-theme a').click(function(e) {
        e.preventDefault();
        createCookie("bika.graphite.disabled", "0");
        window.location.href=window.document.URL;
    });

});
}(jQuery));