"use strict";

function GraphiteTheme() {

    window.jarn.i18n.loadCatalog("bika");
    window.jarn.i18n.loadCatalog("plone");
    var _p = window.jarn.i18n.MessageFactory("plone");
    var _b = window.jarn.i18n.MessageFactory("bika");

    // Navigation menu sections
    var navmenu = {
        'Quick access': {'id':'nav-quick',
                         'items': ['clients',
                                   'batches',
                                   'analysisrequests',
                                   'samples',
                                   'worksheets',
                                   'arimports',
                                   'methods',
                                   'referencesamples',
                                   'supplyorders',
                                   'pricelists',
                                   'invoices'
                                   ],
                         },
        'Laboratory':   {'id': 'nav-setup',
                         'items': ['bika_setup',
                                   'bika_labcontacts',
                                   'bika_departments',
                                   'bika_analysiscategories',
                                   'bika_analysisprofiles',
                                   'analysisrequests',
                                   'bika_artemplates',
                                   'bika_analysisservices',
                                   'bika_analysisspecs',
                                   'arimports',
                                   'arpiorities',
                                   'batches',
                                   'bika_calculations',
                                   'methods',
                                   'worksheets',
                                   'worksheettemplates',
                                  ],
                         },
        'Workflow':     {'id': 'nav-workflow',
                         'items': ['bika_analysiscategories',
                                   'bika_analysisprofiles',
                                   'analysisrequests',
                                   'bika_artemplates',
                                   'analysisservices',
                                   'analysisspecs',
                                   'arimports',
                                   'arpriorities',
                                   'batches',
                                   'bika_calculations',
                                   'methods',
                                   'worksheets',
                                   'worksheettemplates'
                                  ],
                        },
        'Samples':      {'id': 'nav-samples',
                         'items': ['samples',
                                 'bika_sampleconditions',
                                 'bika_samplematrices',
                                 'bika_sampletypes',
                                 'bika_samplingdeviations',
                                 'bika_srtemplates',
                                 'referencesamples',
                                 'bika_referencedefinitions',
                                ],
                        },
        'Management':   {'id': 'nav-management',
                         'items': ['clients',
                                 'bika_instruments',
                                 'bika_instrumenttypes',
                                 'bika_containers',
                                 'bika_products',
                                 'bika_manufacturers',
                                 'bika_preservations',
                                 'bika_storagelocations',
                                 'bika_suppliers'
                                ],
                        },
        'Accounting':   {'id': 'nav-accounting',
                         'items': ['invoices',
                                   'pricelists',
                                   'supplyorders'
                                ],
                        },
        'Tools':        {'id': 'nav-tools',
                         'items': ['report',
                                   'import'
                                ],
                        },
        'Other':        {'id': 'nav-other',
                        'items': ['bika_attachmenttypes',
                                 'bika_batchlabels',
                                 'bika_subgroups',
                                 ],
                        },
    };

    // Omit ajax requests when href contains one of the tokens below
    var omitajaxrequests = ['#',
                            'at_download',
                            '/sticker?',
                            'mailto:'];

    var runtimenav = {};
    var bIsLoading = false
    var currsectionid = window.location.href.replace(window.portal_url, '');
    var that = this;

    that.load = function() {

        $('#portal-logo img')
            .attr('width', '100px')
            .attr('height', '25px');

        loadNavMenu();
        $('.column-center a').click(processLink);
        loadStyles();
        fixLayout();
        $(window).on("resize", fixLayout);

        $('a.hide-column-left').click(function(e) {
            e.preventDefault();
            var colwidth = $('div.column-left').outerWidth();
            var centwidth = $('div.column-left').outerWidth()-5;
            $('div.column-center').animate({'width': '+='+centwidth+'px'},'slow');
            $('#loading-pane').animate({'margin-left': '-='+centwidth+'px'},'slow');
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
            $('#loading-pane').animate({'margin-left': '+='+left+'px'},'slow');
            $('div.column-left').animate({'margin-left': '0px'}, 'slow', function() {
                fixLayout();
            });
        });

        $(window).scroll(function (e) {
            var topoffset = $('#portal-alert').length > 0 && $('#portal-alert').is(':visible') ? $('#portal-alert').outerHeight() : 0;
            $('div.column-left').css('margin-top', $(document).scrollTop()+topoffset+10+"px");
            $('div.column-center').css('margin-top', topoffset+"px");
            $('#loading-pane').css('margin-top', $(document).scrollTop()+topoffset+"px");
            $('#portal-alert').css({
                'position':'fixed',
                'left':'0',
                'right':'0',
                'margin-bottom':'0',
            });
        });

        $("a.back-to-top").click(function(e) {
            e.preventDefault();
            backToTop();
        });

        $('body').append('<div id="tooltip-box"></div>');
        $('#tooltip-box').hide();

        setTimeout(function() {
            $(window).scroll();
        },500);

    }

    function loadPartial() {
        loadBreadcrumbs();
        $('.column-center a').click(processLink);
        loadStyles();
        loadActiveNavSection();
        loadBikaTableBehavior();
        fixLayout();
        initializeJavascripts();
        setTimeout(function() {
            $(window).scroll();
        },500);
        //backToTop();
    }

    function loadNavMenuTransitions() {
        $('ul.navtree li').not("ul.navtree li ul li").mouseenter(function() {
            $(this).addClass('open');
            $(this).find('ul').slideDown('fast', function() {
                $('ul.navtree li').not(".open").find('ul').slideUp('fast');
            });
        });
        $('ul.navtree li').not("ul.navtree li ul li").mouseleave(function() {
            $(this).removeClass('open');
        });
        if ($('ul.navtree li.open').length == 0) {
            $('ul.navtree li.active').closest('li').mouseenter();
        }
    }

    function loadNavMenu() {
        var portal_url = window.portal_url;
        $('ul.navtree li a').each(function() {
            $(this).attr('href', portal_url + $(this).attr('href'));
        });

        // Get all items from Site setup
        var sitesetup_url = portal_url + '/bika_setup?diazo.off=1';
        $.ajax(sitesetup_url)
        .done(function(data) {
            var htmldata = data;
            htmldata = $(htmldata).find('#portal-column-one dl.portletNavigationTree').html();
            $(htmldata).find('a').each(function() {
                var href = $(this).attr('href');
                var id = $(this).attr('href').split("/");
                var img = $(this).find('img');
                id = id[id.length-1];
                runtimenav[id] = [$(this).attr('href'),
                                  $(this).find('span').length ? $.trim($(this).find('span').html()) : $.trim($(this).html()),
                                  $(this).find('img').length ? $(this).find('img').attr('src') : ""];
            });
            // Populate the nav-menu
            var activedetected = false;
            for (var section in navmenu) {
                var items = navmenu[section]['items'];
                $.each(items, function(i, item) {
                    if (item in runtimenav) {
                        var runitem = runtimenav[item];
                        var active = !activedetected && currsectionid.indexOf('/'+item) > -1;
                        var cssclass = '';
                        if (active) {
                            cssclass = ' class="active"';
                            activedetected = true;
                        }
                        var itemli = '<li'+cssclass+'><a href="'+runitem[0]+'"><img src="'+runitem[2]+'">'+runitem[1]+'</a></li>';
                        var sectionid = navmenu[section]['id']
                        var sectionul = null;
                        if ($('ul.navtree li.'+sectionid).length < 1) {
                            var sectionli = '<li class="navtree-item '+sectionid+'"><div class="nav-section-title">'+_b(section)+'</div><ul>'+itemli+'</ul></li>';
                            $('ul.navtree').append(sectionli);
                        } else {
                            $('ul.navtree li.'+sectionid+' ul').append(itemli);
                        }
                    }
                });
            }
        })
        .always(function() {
            loadActiveNavSection();
            loadBreadcrumbs();
            loadNavMenuTransitions();
            $('.nav-container a').click(processLink);
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
        var topoffset = $('#portal-alert').length > 0 && $('#portal-alert').is(':visible') ? $('#portal-alert').offset().top + $('#portal-alert').outerHeight() : 0;
        $('#loading-pane').css('height', $(window).outerHeight()-topoffset);
        $('#loading-pane').css('padding-top', (($(window).outerHeight()/2)-60)+"px");
        $('#loading-pane').css('margin-left', (left-15)+"px");
        $('#loading-pane').css('margin-top', topoffset);
        //$('div.column-left').css('height', $(window).outerHeight());
    }

    var loadpanel = false;
    function showLoadingPanel(message) {
        var left = $("div.column-left").outerWidth();
        left += parseInt($('div.column-center').css('margin-left'));
        left += parseInt($('div.column-left').css('margin-left'));
        left += 15;
        var topoffset = $('#portal-alert').length > 0 && $('#portal-alert').is(':visible') ? $('#portal-alert').offset().top + $('#portal-alert').outerHeight() : 0;
        $('#loading-pane').css('height', $(window).outerHeight()-topoffset);
        $('#loading-pane').css('padding-top', ((($(window).outerHeight()-topoffset)/2)-60)+"px");
        $('#loading-pane').css('margin-left', (left-15)+"px");
        $('#loading-pane').css('margin-top', topoffset);
        $('#loading-pane span.loading-text').html(message);
        loadpanel = true;
        setTimeout(function() {
            if (loadpanel == true) {
                $('#loading-pane').fadeIn('slow',function() {
                    if (loadpanel == false) {
                        hideLoadingPanel();
                    }
                });
            }
        },500);
    }

    function hideLoadingPanel() {
        loadpanel = false;
        $('#loading-pane').fadeOut(10);
    }

    function backToTop() {
        var offset = $('#content-wrapper').offset().top - parseInt($('#content-wrapper').css('margin-top'));
        $('html,body').animate({scrollTop: offset}, 'slow');
    }

    function loadStyles() {
        $('input.context_action_link').filter(function() {
            return $(this).css('background-image') != '';
        }).css("background", "");
        $('.filter-search-button').addClass('ion-ios7-search');
        $('div.alert').prepend('<span class="ion-alert-circled"></span>');
        $('h1 span.documentFirstHeading').css('top','');
        $('h1 a.context_action_link').css('background', '');
        $('table.bika-listing-table tbody.item-listing-tbody tr').each(function() {
            if ($(this).closest('table').hasClass('bika-listing-table')) {
                var td = $(this).find('td');
                if ($(td).length > 0 && $(td).first().hasClass('notDraggable')) {
                    $(td).first().addClass("first-col");
                }
            }
        });

        // Split remarks
        var armks = $('#archetypes-fieldname-Remarks fieldset span');
        if ($(armks).length > 0) {
            var rmks = $(armks).html();
            var items = rmks.split('===');
            $(armks).html(items.join('<hr>'));
        }

        // Empty attachments?
        if ($('.ar_attachments_list').length > 0 && $('.ar_attachments_list').html().trim() == '') {
            $('table.attachments').replaceWith('<div class="attachments table-empty-results"><span class="ico ion-ios7-information-outline"></span>'+_p("No items found")+'</div>');
        }

        loadBikaTableBehavior();
        loadToolTips();
    }

    function loadBreadcrumbs() {
        if ($("#breadcrumbs").html() == '') {
            var breadhtml =
                '<span id="breadcrumbs-you-are-here">'+_p("You are here")+': </span>' +
                '<span class="breadcrumbs-home">' +
                '<a href="'+window.portal_url+'">'+_p("Home")+'</a>' +
                '</span>';

            if ($('ul.navtree li.active').length > 0) {
                var currnode = $('ul.navtree li.active a').clone();
                $(currnode).find('img').remove();
                var currnodetext = $(currnode).find('span').length ? $.trim($(currnode).find('span').html()) : $.trim($(currnode).html());
                breadhtml +=
                    '<span class="breadcrumbSeparator"> › </span>' +
                    '<span id="breadcrumbs-1" dir="ltr">' +
                    '<a href="'+$(currnode).attr('href')+'">'+currnodetext+'</a>' +
                    '</span>';
            }
            $('#breadcrumbs').html(breadhtml);
        }
    }

    function setActiveNavItem(url) {
        var parturl = url.replace(window.portal_url, '');
        $('ul.navtree li a').each(function() {
            var itemurl = $(this).attr('href');
            itemurl = itemurl.replace(window.portal_url, '');
            if (parturl.contains(itemurl)) {
                if ($(this).closest('li').hasClass('active')) {
                    return false;
                }
                $('ul.navtree li.active').removeClass('active');
                $('ul.navtree li.child-active').removeClass('child-active');
                $(this).closest('li').addClass('active');
                $(this).closest('li.nav-tree-item').addClass('child-active');
                return false;
            }
        });
    }

    function loadActiveNavSection() {
        $('ul.navtree li.child-active').removeClass('child-active');
        $('ul.navtree li.active').closest('li.navtree-item').addClass('child-active');
    }

    function loadBikaTableBehavior() {
        // Show the actions pane when at least one checkbox is checked
        $('table.bika-listing-table tfoot td.workflow_actions').hide();
        $('table.bika-listing-table tbody.item-listing-tbody tr').each(function(e) {
            $(this).find('td:first input[type="checkbox"]').on('click change keypress blur keyup',function(e) {
                if ($(this).is(':checked')) {
                    $(this).closest('tr').addClass('selected');
                } else {
                    $(this).closest('tr').removeClass('selected');
                }
                updateSelectedItems($(this).closest('table.bika-listing-table'));
            });
        });
        $('table.bika-listing-table thead th input[type="checkbox"]').click(function(e) {
            if ($(this).is(':checked')) {
                $(this).closest('table.bika-listing-table').find('tbody.item-listing-tbody tr').each(function(e) {
                    if ($(this).find('td:first input[type="checkbox"]').length > 0) {
                        $(this).addClass('selected');
                    }
                });
            } else {
                $(this).closest('table.bika-listing-table').find('tbody.item-listing-tbody tr').removeClass('selected');
            }
            updateSelectedItems($(this).closest('table.bika-listing-table'));
        });
        $('table.bika-listing-table tbody.item-listing-tbody tr').mousemove(function(e) {
            if ($(this).find('td:first input[type="checkbox"]:checked').length > 0) {
                var firstchk = $(this).find('td:first input[type="checkbox"]');
                var leftpos = $(firstchk).offset().left;
                $(this).closest('table.bika-listing-table').find('tfoot td.workflow_actions').css({
                    top: e.pageY - 10,
                    left: leftpos + 20
                });
                recalcSelectedItems($(this).closest('table.bika-listing-table'));
                updateSelectedItems($(this).closest('table.bika-listing-table'));
                firstchk = firstchk.first();
                $(this).closest('table.bika-listing-table').find('tfoot td.workflow_actions').show();
            } else {
                $(this).closest('table.bika-listing-table').find('tfoot td.workflow_actions').hide();
            }
        });

        function recalcSelectedItems(table) {
            $(table).find('tbody.item-listing-tbody tr').each(function(e) {
                var fcheck = $(this).find('td:first input[type="checkbox"]');
                if (fcheck.length > 0) {
                    if (fcheck.is(':checked')) {
                        $(this).addClass('selected');
                    } else {
                        $(this).removeClass('selected');
                    }
                }
            });
        }

        function updateSelectedItems(table) {
            var numsels = $(table).find('tr.selected').length;
            if (numsels > 0) {
                if ($(table).find('tfoot td.workflow_actions div.selection-summary').length == 0) {
                    $(table).find('tfoot td.workflow_actions').prepend('<div class="selection-summary"><span class="num-selected">'+numsels+'</span> '+_p('Items selected')+'</div>');
                } else {
                    $(table).find('tfoot td.workflow_actions div.selection-summary span.num-selected').html(numsels);
                }
                $(this).find('tfoot td.workflow_actions').show();
            } else {
                $(this).find('tfoot td.workflow_actions').hide();
            }
        }

        $('#content .bika-listing-table').each(function(e) {
            // If only on page of results, hide page browser
            if ($(this).find('tfoot td.batching a').length == 0) {
                $(this).find('tfoot td.batching').hide();
            }
            // If no results, show no results found
            if ($(this).find('tbody.item-listing-tbody').length == 0) {
                var colnum = $(this).find('td.listing-filter-row').attr('colspan');
                $(this).find('thead').after('<tbody class="item-listing-tbody"><tr><td colspan="'+colnum+'"><div class="table-empty-results"><span class="ico ion-ios7-information-outline"></span>'+_p("No items found")+'</div></td></tr></tbody>');
                $(this).find('tfoot').remove();
            }
        });

    }

    function loadToolTips() {
        /*$('img[title]').addClass('tooltip');*/
        /*$('img[src$="/sticker_large.png"]').addClass('tooltip');
        $('img[src$="/sticker_small.png"]').addClass('tooltip');*/
        //$('#content .bika-listing-table img[title]').addClass('tooltip');
        $('.tooltip').each(function() {
            $(this).attr('data-title', $(this).attr('title'));
            $(this).attr('title','');
        });
        $('.tooltip').hover(function() {
            if ($(this).attr('data-title') != '') {
                $('#tooltip-box').html($(this).attr('data-title')).fadeIn(100);
            }
        }, function() {
            $('#tooltip-box').html("").hide();
        });

        $('.tooltip').mousemove(function(e) {
            $('#tooltip-box').css({
                top: e.pageY - 10,
                left: e.pageX + 20
            });
        });

        $('.tooltip').click(function(e) {
            e.preventDefault();
        });
    }

    /**
     * If the link href is suitable, tries to fire the request via
     * ajax using requestPage. Otherwise, doesn't remove the normal
     * behavior of the link
     */
    function processLink () {
        var url = $(this).attr('href');
        var omit = false;
        $.each(omitajaxrequests, function(i, item) {
            if (url.indexOf(item) > -1) {
                omit = true;
                return;
            }
        });
        if (!omit) {
            requestPage(this.href, $(this).html());
            return false;
        }
        return true;
    }

    /**
     * Requests a page. If ajax supported, the page will be loaded
     * using an ajax request via getPage method. Otherwise, the page
     * will be redirected as usual.
     */
    function requestPage(url, text) {
        if (history.pushState) {
            getPage(url, text);
        } else {
            /* Ajax navigation is not supported */
            location.assign(url);
        }
    }

    /**
     * Gets a page via ajax call and replaces the current content
     * section with the counterpart response.
     */
    function getPage(url, text) {
        if (bIsLoading) { return; }

        setActiveNavItem(url);
        showLoadingPanel(PMF("Loading")+" "+text+"...");

        $.ajax(url)
            .done(function(data) {
                var htmldata = data;
                loadCSS(data);
                // Get the body class
                var bodyregex = RegExp('body.+class="(.*?)"', 'g');
                var matches = bodyregex.exec(data);
                if (matches != null && matches.length > 1) {
                    $('body').attr('class', matches[1]);
                }
                htmldata = $(htmldata).find('div.column-center').html();
                var breaddata = $(htmldata).find('#breadcrumbs').html();
                $('#breadcrumbs').html(breaddata);
                $('div.column-center').html(htmldata);
            })
            .fail(function(data) {
                var htmldata = $('<div/>').html(data.responseText).text();
                var htmldata = "<p>Request URL: <a href='"+url+"'>"+url+"</a></p>" + htmldata;
                $('div.column-center').html("<div class='error-page'>"+htmldata+"</div>");
            })
            .always(function(data) {
                var title = $(data).filter('title').text();
                var pageInfo = { title: title, url: url };
                history.pushState(pageInfo, pageInfo.title, pageInfo.url);

                currsectionid = url.replace(window.portal_url, '');

                hideLoadingPanel();
                bIsLoading = false;
                loadPartial();
            });
    }

    /**
     * Some CSS are loaded by Bika LIMS dynamically, i.e.
     * hide_editable_border.css and hide_content_menu.css
     * Since the page render the contents asyncronously using ajax
     * requests, the css must be loaded dynamically too.
     */
    function loadCSS(htmlrawdata) {
        var dyncss = ['hide_editable_border', 'hide_content_menu'];
        $.each(dyncss, function(index, value){
            // Already in current head?
            var inhead = $('head link[href*="'+value+'"]').length > 0;

            // In raw data?
            var xml = $.parseXML(htmlrawdata)
            var lnk = $(xml).find('link[href*="hide_editable_border"]');
            var indata = lnk.length > 0;

            if (inhead && !indata) {
                // Remove from current head
                $('head link[href*="'+value+'"]').remove();
            } else if (!inhead && indata) {
                // Add to current head
                var lnk = $(lnk).clone().wrap('<p>').parent().html();
                $('head').append(lnk);
            }
        });
    }

    /**
     * Since the page render the contents asyncronously using ajax
     * requests, the original javascripts must reloaded dynamically
     */
    function initializeJavascripts() {

        $('#portal-alert').html('').fadeOut();

        // Form tabbing
        ploneFormTabbing.initialize()

        // Tiny MCE
        window.initTinyMCE(document);

        // Bika LIMS
        window.bika.lims.initialize();

    }
}


window.graphite = window.graphite || { theme: {} };
window.graphite.theme.initialize = function() {
    new GraphiteTheme().load();
};


(function( $ ) {
$(document).ready(function(){

    // Initializes graphite.theme
    window.graphite.theme.initialize();

});
}(jQuery));