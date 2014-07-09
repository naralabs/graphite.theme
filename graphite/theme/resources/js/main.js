$(document).ready(function(){

    loadNavMenuTransitions();
    loadNavMenuAnchorHandlers();
    fixLayout();
    $(window).on("resize", fixLayout);

    $('a.hide-column-left').click(function(e) {
        e.preventDefault();
        var colwidth = $('div.column-left').outerWidth();
        var centwidth = $('div.column-left').outerWidth()-5;
        $('div.column-center').animate({'width': '+='+centwidth+'px'},'slow');
        $('div.column-left').animate({'margin-left': '-'+colwidth+'px'},'slow', function() {
            $('div.column-left div.column-content').hide();
            $('div.show-column-left').fadeIn();
            fixLayout();
        });
    });
    $('div.show-column-left a').click(function(e) {
        e.preventDefault();
        var left = -parseInt($('div.column-left').css('margin-left'))+5;
        $('div.show-column-left').fadeOut('slow');
        $('div.column-left div.column-content').show();
        $('div.column-center').animate({'width': '-='+left+'px'},'slow');
        $('div.column-left').animate({'margin-left': '0px'}, 'slow', function() {
            fixLayout();
        });
    });


    $(window).scroll(function (e) {
        $('div.column-left').css('margin-top', $(document).scrollTop()+"px");
    });


    function loadNavMenuTransitions() {
        $('ul.navtree li').not("ul.navtree li ul li").mouseenter(function() {
            $(this).addClass('open');
            $(this).find('ul').slideDown(function() {
                $('ul.navtree li').not(".open").find('ul').slideUp();
            });
        });
        $('ul.navtree li').not("ul.navtree li ul li").mouseleave(function() {
            $(this).removeClass('open');
        });
    }

    function loadNavMenuAnchorHandlers() {
        $('ul.navtree li a').click(function(e) {
            e.preventDefault();
            $('div.column-center').animate({opacity:0.2});
            $('ul.navtree li.active').removeClass('active');
            $(this).closest('li').addClass('active');
            var url = $(this).attr('href');
            $('div.column-center').before("<div class='column-center-loading'></div>");
            $.ajax({
                url: url,
                type: 'GET',
                success: function(data, textStatus, $XHR){
                    var htmldata = data;
                    htmldata = $(htmldata).find('div.column-center').html();
                    $('div.column-center').html(htmldata);
                    $('div.column-center').animate({opacity:1});
                    $('div.column-center-loading').hide().remove();
                    fixLayout();
                    var offset = $('#content-wrapper').offset().top - parseInt($('#content-wrapper').css('margin-top'));
                    $('html,body').animate({scrollTop: offset}, 'slow');
                }
            });
        });
    }

    function fixLayout() {
        var winwidth  = $("#content-wrapper").innerWidth();
        var left = $("div.column-left").outerWidth();
        left += parseInt($('div.column-center').css('margin-left'));
        left += parseInt($('div.column-left').css('margin-left'));
        left += 15;
        var col2width = $("div.column-right").outerWidth();
        //var margins = $("#columns").outerWidth - $("#columns").innerWidth();
        var contentw = Math.floor(winwidth - left);
        $('div.column-center').css('width', contentw);
    }
});
