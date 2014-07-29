$(document).ready(function(){

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
    var runtimenav = {};
    var currsectionid = window.location.href.replace(window.portal_url, '');

    window.jarn.i18n.loadCatalog("bika");
    window.jarn.i18n.loadCatalog("plone");
    var _p = window.jarn.i18n.MessageFactory("plone");
    var _b = window.jarn.i18n.MessageFactory("bika");

    $('#portal-logo img')
        .attr('width', '100px')
        .attr('height', '25px');
    loadNavMenu();
    loadContentAnchorHandlers();
    loadStyles();
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
        $('div.column-left').css('margin-top', $(document).scrollTop()+10+"px");
        $('#loading-pane').css('margin-top', $(document).scrollTop()+"px");
    });

    $("a.back-to-top").click(function(e) {
        e.preventDefault();
        backToTop();
    });

    $('body').append('<div id="tooltip-box"></div>');
    $('#tooltip-box').hide();

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

    function loadContentAnchorHandlers() {
        $('div.column-center a').click(function(e) {
            e.preventDefault();
            var text = $(this).html();
            var url = $(this).attr('href');
            setActiveNavItem(url);
            toggleLoading("Loading "+text+"...");
            $.ajax(url)
            .done(function(data) {
                var htmldata = data;
                // Get the body class
                var bodyregex = RegExp('body.+class="(.*?)"', 'g');
                var matches = bodyregex.exec(data);
                if (matches.length > 1) {
                    $('body').attr('css', matches[1]);
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
                toggleLoading();
                fixLayout();
            })
            .always(function() {
                currsectionid = url.replace(window.portal_url, '');
                window.history.pushState(currsectionid, '', url);
                loadBreadcrumbs();
                loadContentAnchorHandlers();
                loadStyles();
                toggleLoading();
                loadActiveNavSection();
                loadBikaTableBehavior();
                fixLayout();
                backToTop();
            });

        });
    }

    function loadNavMenuAnchorHandlers() {
        $('ul.navtree li a').click(function(e) {
            e.preventDefault();
            $('ul.navtree li.active').removeClass('active');
            $(this).closest('li').addClass('active');
            var text = $(this).html();
            var url = $(this).attr('href');
            toggleLoading(text+"...");
            $.ajax(url)
            .done(function(data) {
                var htmldata = data;
                // Get the body class
                var bodyregex = RegExp('body.+class="(.*?)"', 'g');
                var matches = bodyregex.exec(data);
                if (matches.length > 1) {
                    $('body').attr('css', matches[1]);
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
                toggleLoading();
                fixLayout();
            })
            .always(function() {
                currsectionid = url.replace(window.portal_url, '');
                window.history.pushState(currsectionid, '', url);
                loadBreadcrumbs();
                loadContentAnchorHandlers();
                loadStyles();
                toggleLoading();
                loadActiveNavSection();
                fixLayout();
                backToTop();
            });
        });
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
                            sectionli = '<li class="navtree-item '+sectionid+'"><div class="nav-section-title">'+_b(section)+'</div><ul>'+itemli+'</ul></li>';
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
            loadNavMenuAnchorHandlers();
            $(document.body).trigger('load');
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
        $('#loading-pane').css('height', $(window).outerHeight());
        $('#loading-pane').css('padding-top', (($(window).outerHeight()/2)-60)+"px");
        $('#loading-pane').css('margin-left', ($('div.column-left').outerWidth())+"px");
        //$('div.column-left').css('height', $(window).outerHeight());
    }

    function toggleLoading(message) {
        if ($('#loading-pane').is(':visible')) {
            $('#loading-pane').fadeOut('fast');
        } else {
            $('#loading-pane span.loading-text').html(message);
            $('#loading-pane').fadeIn('fast');
        }
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
            $(this).find('td').first().addClass("first-col");
        });
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
        $('ul.navtree li.active').removeClass('active');
        $('ul.navtree li.child-active').removeClass('child-active');
        var parturl = url.replace(window.portal_url, '');
        $('ul.navtree li a').each(function() {
            var itemurl = $(this).attr('href');
            itemurl = itemurl.replace(window.portal_url, '');
            if (parturl.contains(itemurl)) {
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
        $('table.bika-listing-table tbody.item-listing-tbody tr td input[type="checkbox"]').click(function(e) {
            if ($(this).closest('table.bika-listing-table').find('tbody.item-listing-tbody tr td input[type="checkbox"]:checked').length > 0) {
                var numsels = $(this).closest('table.bika-listing-table').find('tbody.item-listing-tbody tr td input[type="checkbox"]:checked').length;
                if ($(this).closest('table.bika-listing-table').find('tfoot td.workflow_actions div.selection-summary').length == 0) {
                    $(this).closest('table.bika-listing-table').find('tfoot td.workflow_actions').prepend('<div class="selection-summary"><span class="num-selected">'+numsels+'</span> '+_p('Items selected')+'</div>');
                } else {
                    $(this).closest('table.bika-listing-table').find('tfoot td.workflow_actions div.selection-summary span.num-selected').html(numsels);
                }
                $(this).closest('table.bika-listing-table').find('tfoot td.workflow_actions').show();
            } else {
                $(this).closest('table.bika-listing-table').find('tfoot td.workflow_actions').hide();
            }
        });
        $('table.bika-listing-table tbody.item-listing-tbody tr').mousemove(function(e) {
            var leftpos = $(this).find('td input[type="checkbox"]').first().offset().left;
            $(this).closest('table.bika-listing-table').find('tfoot td.workflow_actions').css({
                top: e.pageY - 10,
                left: leftpos + 20
            });
            if ($(this).find('td input[type="checkbox"]:checked').length > 0) {
                $(this).closest('table.bika-listing-table').find('tfoot td.workflow_actions').show();
            } else {
                $(this).closest('table.bika-listing-table').find('tfoot td.workflow_actions').hide();
            }
        });
    }

    function loadToolTips() {
        /*$('img[title]').addClass('tooltip');*/
        $('.tooltip').each(function() {
            $(this).attr('data-title', $(this).attr('title'));
            $(this).attr('title','');
        });
        $('.tooltip').hover(function() {
            $('#tooltip-box').html($(this).attr('data-title')).fadeIn(100);
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
});
