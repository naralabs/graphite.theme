'use strict;'

function GraphiteTheme() {

    /** CUSTOM VARS **/

    // Use dynamic load of pages via ajax?
    var dynamic_load = false;

    // Navigator menu layout
    // top: shows the nav menu on the top.
    // left: shows the nav menu on the left. (experimental)
    // By default: top
    var navmenu_layout = 'top';

    // Portal Logo dimensions
    // default: {'width': '100px', 'height': '25px'};
    var portal_logo_dimensions = {'width': '100px',
                                  'height': '25px'};

    // Delay (in ms) before loading pane being shown.
    // If <0, the loading panel will not never be shown when dynamic
    // content being loaded.
    // default: 500
    var loading_panel_delay = 500;

    // Enables/Disables the in-line behavior when items get selected in
    // tables: a baloon with the actions available for the selected
    // items appear and actions panel from the footer is hidded.
    // default: true
    var inline_table_actions_behavior = true;

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
                                   'bika_arpriorities',
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
                                   'bika_arpriorities',
                                   'analysisservices',
                                   'analysisspecs',
                                   'arimports',
                                   'arpriorities',
                                   'batches',
                                   'bika_calculations',
                                   'methods',
                                   'worksheets',
                                   'worksheettemplates',
                                   'bika_worksheettemplates',
                                  ],
                        },
        'Samples':      {'id': 'nav-samples',
                         'items': ['samples',
                                 'bika_sampleconditions',
                                 'bika_samplematrices',
                                 'bika_samplepoints',
                                 'bika_sampletypes',
                                 'bika_samplingdeviations',
                                 'referencesamples',
                                 'bika_referencedefinitions',
                                 'bika_srtemplates',
                                ],
                        },
        'Management':   {'id': 'nav-management',
                         'items': [
                                 'laboratory',
                                 'clients',
                                 'bika_instruments',
                                 'bika_instrumenttypes',
                                 'bika_containers',
                                 'bika_containertypes',
                                 'bika_products',
                                 'bika_labproducts',
                                 'bika_manufacturers',
                                 'bika_preservations',
                                 'bika_storagelocations',
                                 'bika_suppliers',
                                 'bika_attachmenttypes',
                                 'bika_batchlabels',
                                 'bika_subgroups',
                                ],
                        },
        'Accounting':   {'id': 'nav-accounting',
                         'items': ['invoices',
                                   'pricelists',
                                   'supplyorders'
                                ],
                        },
        'Tools':        {'id': 'nav-tools',
                         'items': ['reports',
                                   'import'
                                ],
                        },
        'Other':        {'id': 'nav-other',
                        'items': [
                                 ],
                        },
    };


    /** PRIVATE VARS **/
    window.jarn.i18n.loadCatalog("bika");
    window.jarn.i18n.loadCatalog("plone");
    var _p = window.jarn.i18n.MessageFactory("plone");
    var _b = window.jarn.i18n.MessageFactory("bika");

    // Caches the items to be loaded in the navmenu at runtime
    var runtimenav = {};

    // Controls if a page is being currently loaded dynamically
    var bIsLoading = false

    // Controls if the loading panel is displayed
    var loadpanel = false;

    // The current loaded 'section'.
    var currsectionid = window.location.href.replace(window.portal_url, '');

    // Top offset for positioning the contents
    var topoffset = 0;

    // Omit ajax requests when href contains one of the tokens below
    var omitajaxrequests = ['#',
                            'at_download',
                            '/sticker?',
                            'mailto:',
                            'error_log/getLogEntryAsText',
                            'workflow_action=',
                            '/Request new analyses/ar_add',
                            '/invoice_print',
                            '/print',
                            'bika-dashboard?p='];

    var omitajaxrequests_css = ['referencewidget-',
                                'ws-analyses-search-button',
                                'bika_listing_show_more',];

    // After every request, unbind events with a 'live' handler attached
    // which don't follow the recommended behavior and their 'live'
    // event is still triggered after new requests loaded dynamically.
    // Mostly related with BikaListingTable
    var unbindelements = ["th.sortable",
                          "input[id*='select_all']",
                          "input[id*='_cb_']",
                          ".listing_string_entry,.listing_select_entry",
                          "select.pagesize",
                          ".bika-listing-table th.collapsed",
                          ".bika-listing-table th.expanded",
                          ".listing_select_entry",
                          ".filter-search-input",
                          ".filter-search-button",
                          ".workflow_action_button",
                          "th[id^='foldercontents-']",
                          ".contextmenu tr"];

    var that = this;

    that.load = function() {

        // Theme enabled?
        var disabled = readCookie("bika.graphite.disabled");
        var disabled = disabled == '1';

        /*$('head link[type="text/css"]').each(function(e) {
            console.log($(this).attr('href'));
        });*/

        // Graphite Theme control bar
        $('#portal-theme a').click(function(e) {
            e.preventDefault();
            if (disabled) {
                createCookie("bika.graphite.disabled", "0");
            } else {
                createCookie("bika.graphite.disabled", "1");
            }
            window.location.href=window.document.URL;
        });

        if (disabled) {
            // No theme. Do nothing!
            return;
        }

        // A client?

        if ($("body.userrole-client").length > 0) {
            navmenu = {
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
            };
        }


        $('#portal-logo img')
            .attr('width', portal_logo_dimensions['width'])
            .attr('height', portal_logo_dimensions['height']);

        // Loads left-navigation menu
        loadNavMenu();

        // Loads right column
        loadRightColumn();

        // Dynamic page load behavior to links
        if (dynamic_load===true) {
            $('#contentActionMenus #plone-contentmenu-workflow dt.actionMenuHeader a').attr('href', '#');
            $('#lims-nav li a').unbind("click");
            $('#lims-nav li a').click(processLink);

            // Bind ajax call for content's links, but only for those to not
            // be omitted (omitajaxrequests array)
            $('.column-center a').each(function(i) {
                bindAnchor(this);
            });
        }

        // User link from top-right must display the options on hover
        // This prevents the user to do an additional click
        $('#portal-personaltools dt.actionMenuHeader #user-name').mouseover(function() {
            if ($(this).closest('dl').hasClass('deactivated')) {
                $(this).click();
            }
        });
        $('#portal-personaltools dd.actionMenuContent').mouseleave(function() {
            $(this).closest('dl').removeClass('activated').addClass('deactivated');
        });

        $('.column-center').mouseenter(function() {
            if ($('#contextual-menu-wrapper').is(':visible')) {
                $('#lims-nav li.selected').removeClass('selected').addClass('plain');
                $('#contextual-menu-wrapper').hide();
                $('#content-wrapper').animate({'margin-top': 70}, 'fast');
            }
        });

        // Loads additional JS styling
        loadStyles();

        loadDeferredActions();

        // Fix layout in accordance to the window dimensions
        fixLayout();
        $(window).on("resize", fixLayout);

        // Set left's nav-menu fixed position when scrolling
        $(window).scroll(function (e) {
            var docst = $(document).scrollTop();
            var topfixed = docst + topoffset;
            var winheight = $(window).outerHeight();
            $('div.column-left').css('margin-top', topfixed + 10);
            $('div.column-center').css('margin-top', topoffset);
            $('#loading-pane').css('height', winheight - topoffset);
            $('#loading-pane').css('padding-top',((winheight - topoffset)/2)-60);
            $('#loading-pane').css('margin-top', topfixed);
        });

        $('body').append('<div id="tooltip-box"></div>');
        $('#tooltip-box').hide();

        fixTopPosition(500);
    }

    /**
     * Adjusts the content's top position, as well as left and right
     * columns. If a timeout greather than 0 is set, the function will
     * be triggered every timeout millisec.
     */
    function fixTopPosition(timeout) {
        var offset = 0;
        if (offset != topoffset) {
            topoffset = offset;
            $(window).scroll();
        }
        if (timeout > 0) {
            setTimeout(function() {
                fixTopPosition(timeout);
            },timeout);
        }
    }

    /**
     * Loads the actions to be done after a new content being loaded
     * dynamically inside the column-center: reload the breadcrumb bar,
     * the dynamic page load behavoir for links, styling, layout and
     * javascript purge and reload.
     */
    function loadPartial() {
        loadBreadcrumbs();
        $('#contentActionMenus #plone-contentmenu-workflow dt.actionMenuHeader a').attr('href', '#');
        $('.column-center a').each(function(i) {
            bindAnchor(this);
        });
        // Disable content-status history link
        loadStyles();
        loadActiveNavSection();
        loadBikaTableBehavior();
        fixLayout();
        initializeJavascripts();
        loadDeferredActions();
    }

    function loadDeferredActions() {
        // GRTH-50 Worksheet filter doesn't work
        $("a.ws-analyses-search-button").mouseup(function() {
            setTimeout(function() {
                if ($('td.workflow_actions').is(':visible')) {
                    loadBikaTableBehavior();
                } else {
                    $("a.ws-analyses-search-button").mouseup();
                }
            }, 500);
        });
    }

    /**
     * Binds ajax call to an anchor element, but only if not to be
     * be omitted (omitajaxrequests or omitajazrequests_css)
     */
    function bindAnchor(el) {
        if (dynamic_load===false) {
            return;
        }
        var omit = false;
        var url = $(el).attr('href');
        if (url !== undefined) {
            var css = el.className;
            if (css !== undefined) {
                $.each(omitajaxrequests_css, function(i, item) {
                    try {
                        if (css.match(item)) {
                            omit = true;
                            return;
                        }
                    } catch (e) {}
                });
                if (omit == true) {
                    return;
                }
            }
            $.each(omitajaxrequests, function(i, item) {
                if (url.indexOf(item) > -1) {
                    omit = true;
                    return;
                }
            });
        }
        if (omit == false) {
            $(el).unbind("click");
            $(el).click(processLink);
        }
    }

    /**
     * Loads the nav menu in accordance to the navmenu_layout value.
     * If navmenu_layout = 'left', loads the left menu. Otherwise,
     * loads the top menu
     */
    function loadNavMenu() {
        if (navmenu_layout == 'left') {
            loadLeftNavMenu();
        } else {
            loadTopNavMenu();
        }
    }

    /**
     * Loads the top menu dynamically, grouping the items in accordance
     * to the values assigned to the navmenu bar.
     */
    function loadTopNavMenu() {
        var portal_url = window.portal_url;
        $('ul.navtree li a').each(function() {
            $(this).attr('href', portal_url + $(this).attr('href'));
        });
        // Anonymous access.. we'll not categorize the nav items.
        // Retrieve the menus from the nav-bar
        if ($("body.userrole-anonymous").length > 0) {
            $('#portal-nav-1 li:not(.section-bika-lims) a').each(function() {
                var href = $(this).attr('href');
                var id = $(this).attr('href').split("/");
                var img = $(this).find('img');
                id = id[id.length-1];
                runtimenav[id] = [$(this).attr('href'),
                                  $(this).find('span').length ? $.trim($(this).find('span').html()) : $.trim($(this).html()),
                                  $(this).find('img').length ? $(this).find('img').attr('src') : ""];
                var sectionli = '<li class="plain '+id+'"><a href="'+$(this).attr('href')+'" data-section="'+id+'">'+runtimenav[id][1]+'</a></li>';
                $('#portal-tools-wrapper ul#portal-globalnav').append(sectionli);
            });
            loadBreadcrumbs();
            $('#portal-globalnav').fadeIn();

        } else {
            // Get all items from Site setup
            var sitesetup_url = portal_url + '/bika_setup?bika.graphite.disabled=1';
            $.ajax(sitesetup_url)
            .done(function(data) {
                var htmldata = data;
                var filled = false;
                var grabbed = []
                htmldata = $(htmldata).find('#portal-column-one dl.portletNavigationTree').html();
                $(htmldata).find('a').each(function() {
                    var href = $(this).attr('href');
                    var id = $(this).attr('href').split("/");
                    var img = $(this).find('img');
                    id = id[id.length-1];
                    runtimenav[id] = [$(this).attr('href'),
                                      $(this).find('span').length ? $.trim($(this).find('span').html()) : $.trim($(this).html()),
                                      $(this).find('img').length ? $(this).find('img').attr('src') : "",
                                      $(this).attr('class')];
                    filled = true;
                    grabbed.push(id);
                });
                if (!filled) {
                    // Not a LabMan? Use the portal-nav instead
                    $('#portal-nav-1 li a').each(function() {
                        var href = $(this).attr('href');
                        var id = $(this).attr('href').split("/");
                        var img = $(this).find('img');
                        id = id[id.length-1];
                        runtimenav[id] = [$(this).attr('href'),
                                          $(this).find('span').length ? $.trim($(this).find('span').html()) : $.trim($(this).html()),
                                          $(this).find('img').length ? $(this).find('img').attr('src') : "",
                                          $(this).attr('class')];
                        grabbed.push(id);
                    });
                }
                // Find orphan menuitems and populate 'Others'
                var registered = [];
                for (var section in navmenu) {
                    var items = navmenu[section]['items'];
                    $.each(items, function(i, item) {
                        registered.push(item);
                        return;
                    });
                }
                if (!('Other' in navmenu)) {
                    navmenu['Other'] = {'id': 'nav-other',
                                        'items': []};
                }
                for (var key in runtimenav) {
                    if (key != 'sitemap' && key!='Plone' && registered.indexOf(key) < 0) {
                        navmenu['Other']['items'].push(key);
                    }
                }

                // Populate the nav-menu
                var activedetected = false;
                for (var section in navmenu) {
                    var items = navmenu[section]['items'];
                    $.each(items, function(i, item) {
                        if (item in runtimenav) {
                            var runitem = runtimenav[item];
                            var active = !activedetected && currsectionid.indexOf('/'+item) > -1;
                            var cssclass = ' class="'+item;
                            if (active) {
                                cssclass += " active";
                                activedetected = true;
                            }
                            var aclass = '';
                            if (runitem[3] !== undefined) {
                                // We only need the contentype-xx class
                                try {
                                    var re = /contenttype-.+/g;
                                    var matches = runitem[3].match(re);
                                    if (matches && matches.length > 0) {
                                        aclass = 'class="'+matches[0]+'"';
                                    }
                                } catch (e) {}
                            }
                            cssclass += '"';
                            var itemli = '<li'+cssclass+'><a '+aclass+' href="'+runitem[0]+'">';
                            itemli += runitem[2] != '' ? '<img src="'+runitem[2]+'">' : '';
                            itemli += runitem[1]+'</a></li>';
                            var sectionid = navmenu[section]['id']
                            var sectionul = null;
                            if ($('#portal-tools-wrapper ul#lims-nav li.'+sectionid).length < 1) {
                                var sectionli = '<li class="plain '+sectionid+'"><a href="#" data-section="'+sectionid+'">'+_b(section)+'</a></li>';
                                var contextmenu = '<ul class="'+sectionid+' hidden" data-section="'+sectionid+'">'+itemli+'</ul>';
                                $('#portal-tools-wrapper ul#lims-nav').append(sectionli);
                                $('#contextual-menu-wrapper').append(contextmenu);
                            } else {
                                $('#contextual-menu-wrapper ul.'+sectionid).append(itemli);
                            }
                            $('#portal-nav-1 li.section-'+item).remove();
                        }
                    });
                }
            })
            .always(function() {
                // Move all plone's portaltab-* menus inside Tools section
                if ($('#portal-tools-wrapper ul#lims-nav li.tools').length < 1) {
                    // Add the tools section
                    $('#portal-tools-wrapper ul#lims-nav').append('<li class="tools"><a data-section="tools" href="#">'+_b('Tools')+'</a></li>');
                    $('#contextual-menu-wrapper').append('<ul class="tools hidden" data-section="tools"></ul>');
                }
                $('#portal-tools-wrapper ul#portal-globalnav li[id^="portaltab-"]').each(function() {
                    $(this).detach().appendTo($('#contextual-menu-wrapper ul.tools'));
                });

                // Move all remaining items to the portal-globalnav
                $('#portal-nav-1 li a').each(function() {
                    var href = $(this).attr('href');
                    var id = $(this).attr('href').split("/");
                    var img = $(this).find('img');
                    id = id[id.length-1];
                    runtimenav[id] = [$(this).attr('href'),
                                      $(this).find('span').length ? $.trim($(this).find('span').html()) : $.trim($(this).html()),
                                      $(this).find('img').length ? $(this).find('img').attr('src') : ""];
                    var cssclass = $(this).closest('li').hasClass('navTreeCurrentNode') ? 'selected' : 'plain';
                    var sectionli = '<li class="'+cssclass+' '+id+'"><a href="'+$(this).attr('href')+'" data-section="'+id+'">'+runtimenav[id][1]+'</a></li>';
                    $('#portal-tools-wrapper ul#portal-globalnav').append(sectionli);
                });

                loadActiveNavSection();
                loadBreadcrumbs();
                loadNavMenuTransitions();
                if (dynamic_load===true) {
                    $('#contextual-menu-wrapper a').unbind("click");
                    $('#contextual-menu-wrapper a').click(processLink);
                }
                $('#portal-globalnav').fadeIn();
                $('#lims-nav-wrapper').fadeIn();
                $('#contextual-menu-wrapper').hide();
                $('#content-wrapper').animate({'margin-top': 70}, 'fast');
                //$('#lims-nav').fadeIn();
                setActiveNavItem(window.location.href);
            });
        }
    }

    /**
     * Loads the left nav menu dynamically, grouping the items in
     * accordance with the values assigned to the navmenu var
     */
    function loadLeftNavMenu() {
        $('#portal-globalnav').fadeIn();
        var portal_url = window.portal_url;
        $('ul.navtree li a').each(function() {
            $(this).attr('href', portal_url + $(this).attr('href'));
        });
        // Get all items from Site setup
        var sitesetup_url = portal_url + '/bika_setup?bika.graphite.disabled=1';
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
                        var cssclass = ' class="'+item;
                        if (active) {
                            cssclass += " active";
                            activedetected = true;
                        }
                        cssclass += '"';
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
            $('div.column-left').fadeIn();
            loadActiveNavSection();
            loadBreadcrumbs();
            loadNavMenuTransitions();
            if (dynamic_load===true) {
                $('.nav-container a').unbind("click");
                $('.nav-container a').click(processLink);
            }
        });

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
    }

    /**
     * Nav menu transitions effects. If the navmenu_layout is left, loads
     * the transitions for the left menu. Otherwise, the transitions
     * for the top menu
     */
    function loadNavMenuTransitions() {
        if (navmenu_layout == 'left') {
            loadLeftNavMenuTransitions();
        } else {
            loadTopNavMenuTransitions();
        }
    }

    /**
     * Transition effects (slide up and slide down) for the top
     * nav-menu when main section links get hover and/or selected.
     */
    function loadTopNavMenuTransitions() {
        $('#portal-tools-wrapper ul#lims-nav li a').click(function(e) {
            e.preventDefault();
            var section = $(this).attr('data-section');
            $('#contextual-menu-wrapper').show();
            $('#contextual-menu-wrapper ul.active').hide().removeClass('active');
            $('#contextual-menu-wrapper ul.'+section).show().addClass('active');
            $('#portal-tools-wrapper ul#lims-nav li.selected').removeClass('selected').addClass('plain');
            $(this).closest('li').addClass('selected').remove('plain');
            var height = $('#lims-nav-wrapper').innerHeight() + $('#logo').innerHeight() + 5;
            $('#content-wrapper').animate({'margin-top': height+'px'}, 'fast');
        });
        $('#portal-tools-wrapper ul#lims-nav li a').mouseenter(function(e) {
            var section = $(this).attr('data-section');
            if (!$('#contextual-menu-wrapper ul.'+section).hasClass('selected')) {
                $(this).click();
            }
            ;
        });
    }

    /**
     * Transition effects (slide up and slide down) for the left
     * nav-menu when links get hover and/or selected.
     */
    function loadLeftNavMenuTransitions() {
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

    /**
     * Transition effects for right column (with portlets)
     */
    function loadRightColumn() {
        "use strict";
        $('#column-right-toggle').click(function(e) {
            e.preventDefault();
            if ($(this).hasClass('expand')) {
                // Expand the right column
                $('#column-right-wrapper').animate({'margin-right':'0px'}, 'fast', function() {
                    $('#column-right-toggle').removeClass('expand').addClass('collapse');
                    $('#portal-column-two').removeClass('expanded').css('min-height','');
                    $(this).addClass('expanded');
                    $('#column-right-wrapper').css('height','100%');
                });
            } else {
                // Collapse the right column
                $('#column-right-wrapper').animate({'margin-right':'-350px'}, 'fast', function() {
                    $(this).removeClass('expanded');
                    $('#column-right-toggle').removeClass('collapse').addClass('expand');
                    $('#column-right-wrapper').css('height', '200px');
                });
            }
        });
        // Late analyses? other alerts?
        if ($('#portlet-late-analysis dd').not('.portletFooter').length > 0) {
            // There is the late analysis portlet, with late analyses. Set
            // a prominent icon to the toggle button
            $('#column-right-toggle').addClass('alert').attr('title', "Late analyses");
        }
    }

    /**
     * Adjusts the current contents to the window's width
     */
    function fixLayout() {
        "use strict";
        var winwidth  = $("#content-wrapper").innerWidth();
        var left = $("div.column-left").is(':visible') ? $("div.column-left").outerWidth() : 0;
        var margin = $("div.column-center").outerWidth()-$("div.column-center").width();
        // The may be fractional and is not guaranteed to be accurate and we
        // cannot assume it is an integer, so we substract 15px to avoid
        // potential problems.
        var width = Math.floor(winwidth - left) - 15 - margin;
        $('div.column-center').css('width', width);
        $('#loading-pane').css('margin-left', (left-15)+"px");
        $('#portal-column-two').css('min-height', $(document).height());
    }

    /**
     * Displays the loading pane
     */
    function showLoadingPanel(message) {
        if (loading_panel_delay >= 0) {
        $('#loading-pane span.loading-text').html(message);
            loadpanel = true;
            setTimeout(function() {
                if (loadpanel == true) {
                    $(window).scroll();
                    $('#loading-pane').fadeIn('slow',function() {
                        if (loadpanel == false) {
                            hideLoadingPanel();
                        }
                    });
                } else {
                    hideLoadingPanel();
                }
            },loading_panel_delay);
        }
    }

    /**
     * Hides the loading pane
     */
    function hideLoadingPanel() {
        loadpanel = false;
        $('#loading-pane').fadeOut(10);
    }

    /**
     * Scrolls the content to the top
     */
    function backToTop() {
        $('html,body').animate({scrollTop: topoffset}, 'slow');
    }

    /**
     * Loads additional js stylings
     */
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

        // Empty contentActions?
        if ($('#edit-bar .contentActions').length > 0 && $('#edit-bar .contentActions').children().length == 0) {
            $('#edit-bar .contentActions').hide();
        }

        loadBikaTableBehavior();
        loadToolTips();
    }

    /**
     * Loads the breadcrumbs bar for the current page
     */
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
            } else if ($('#lims-nav li.selected').length > 0) {
                var currnode = $('#lims-nav li.selected a');
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

    /**
     * Sets the left-nav item menu active for an url
     */
    function setActiveNavItem(url) {
        console.log(url)
        var parturl = url.replace(window.portal_url, '');
        if (navmenu_layout == 'left') {
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
        } else {
            // Està ja obert el context-nav que toca?
            var found = false;
            $('#contextual-menu-wrapper ul li').removeClass('active');
            $('#contextual-menu-wrapper ul.active li a').each(function() {
                var itemurl = $(this).attr('href');
                itemurl = itemurl.replace(window.portal_url, '');
                if (parturl.contains(itemurl)) {
                    $(this).closest('li').addClass('active');
                    var sectionid = $(this).closest('ul').attr('data-section');
                    //$('#lims-nav li.'+sectionid).addClass('selected').removeClass('plain');
                    found = true;
                    return false;
                }
            });
            if (!found) {
                // No està obert, cal obrir el primer que tingui l'item
                $('#contextual-menu-wrapper ul li a').each(function() {
                    var itemurl = $(this).attr('href');
                    itemurl = itemurl.replace(window.portal_url, '');
                    //---if (parturl.contains(itemurl))--- doesn't work on chrome
                    if (parturl.indexOf(itemurl) != -1){
                        $(this).closest('li').addClass('active');
                        var sectionid = $(this).closest('ul').attr('data-section');
                       // $('#lims-nav li.'+sectionid+' a').click();
                        found = true;
                        return false;
                    }
                });
            }
            if (!found) {
                // By default, Quick access
                //$('#lims-nav li.nav-quick a').click();
            }
        }
    }

    function loadActiveNavSection() {
        if (navmenu_layout == 'left') {
            $('ul.navtree li.child-active').removeClass('child-active');
            $('ul.navtree li.active').closest('li.navtree-item').addClass('child-active');
        }
    }

    /**
     * Bika-table custom behaviors
     */
    function loadBikaTableBehavior() {
        if (inline_table_actions_behavior == true) {
            // Show the actions pane when at least one checkbox is checked
            $('table.bika-listing-table:not(.bika-listing-table-transposed) tfoot td.workflow_actions').hide();
            $('table.bika-listing-table:not(.bika-listing-table-transposed) tbody.item-listing-tbody tr').each(function(e) {
                $(this).find('td:first input[type="checkbox"]').on('click change keypress blur keyup',function(e) {
                    if ($(this).is(':checked')) {
                        $(this).closest('tr').addClass('selected');
                    } else {
                        $(this).closest('tr').removeClass('selected');
                    }
                    updateSelectedItems($(this).closest('table.bika-listing-table'));
                });
            });
            $('table.bika-listing-table:not(.bika-listing-table-transposed) thead th input[type="checkbox"]').click(function(e) {
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
            $('table.bika-listing-table:not(.bika-listing-table-transposed) tbody.item-listing-tbody tr').mousemove(function(e) {
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

    /**
     * Loads a fancy tooltip for every element with 'tooltip' class
     */
    function loadToolTips() {
        /*$('img[title]').addClass('tooltip');*/
        /*$('img[src$="/sticker_large.png"]').addClass('tooltip');
        $('img[src$="/sticker_small.png"]').addClass('tooltip');*/
        //$('#content .bika-listing-table img[title]').addClass('tooltip');

        $('div.field label span.formHelp').each(function(i) {
            $(this).hide();
            var helpinfo = $(this).html();
            if (helpinfo !== '') {
                $(this).before('<span data-id="'+$(this).attr('id')+'" class="tooltip tooltip-form-help"/>');
            }
        });
        $('.tooltip').each(function() {
            $(this).attr('data-title', $(this).attr('title'));
            $(this).attr('title','');
        });
        $('.tooltip').hover(function() {
            if ($(this).attr('data-title') !== undefined && $(this).attr('data-title') !== '') {
                $('#tooltip-box').html($(this).attr('data-title')).fadeIn(100);
            } else if ($(this).attr('data-id') !== undefined && $(this).attr('data-id') !== '') {
                $('#tooltip-box').html($('#'+$(this).attr('data-id')).html()).fadeIn(100);
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
            $('#lims-nav li a').each(function() {
                if (url.lastIndexOf($(this).attr('href'), 0) === 0) {
                    $(this).parent('li').removeClass('plain').addClass('selected');
                } else {
                    $(this).parent('li').removeClass('selected').addClass('plain');
                }
            });
            $('#portal-globalnav li.selected').removeClass('selected').addClass('plain');
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

        // Unbind unrecommended live handlers
        // http://api.jquery.com/die/
        unbind();

        // Call the page, but wait until unbinding gets finished
        setTimeout(function() {
            delayGetPage(500, url, text);
        }, 200);

    }

    var _unbinding = false;
    /**
     *  After every request, unbind events with a 'live' handler attached
     * which don't follow the recommended behavior and their 'live'
     * event is still triggered after new requests loaded dynamically.
     * Uses the unbindelements array values
     */
    function unbind() {
        $.each(unbindelements, function(index, value){
            $(value).die();
            _unbinding = true;
        });
        _unbinding = false;
    }

    function delayGetPage(timeout, url, text) {
        // Theme enabled?
        var disabled = readCookie("bika.graphite.disabled");
        var disabled = disabled == '1';
        if (disabled) {
            window.location.href = url;
        } else if (_unbinding == true) {
            setTimeout(function() {
                delayGetPage(timeout, url, text);
            }, timeout);
        } else {
            $.ajax(url)
            .done(function(data) {
                var htmldata = data;
                try {
                    var xml = $.parseXML(data);
                    $('head base').attr('href', xml.baseURI);
                    loadCSS(data);
                    loadDynJS(data);
                    // Get the body class
                    var bodyregex = RegExp('body.+class="(.*?)"', 'g');
                    var matches = bodyregex.exec(data);
                    if (matches != null && matches.length > 1) {
                        $('body').attr('class', matches[1]);
                    }
                    htmldata = $(htmldata).find('div.column-center').html();
                    var breaddata = $(htmldata).find('#breadcrumbs').html();
                    $('#breadcrumbs').html(breaddata);
                    $('#viewlet-above-content').html('');
                    $('div.column-center').html(htmldata);
                } catch (e) {
                    // Fallback to the failed url
                    window.location.href = url;
                }
            })
            .fail(function(data) {
                // Fallback to the failed url
                window.location.href = url;
               /* var htmldata = $('<div/>').html(data.responseText).text();
                var htmldata = "<p>Request URL: <a href='"+url+"'>"+url+"</a></p>" + htmldata;
                $('div.column-center').html("<div class='error-page'>"+htmldata+"</div>");*/
            })
            .always(function(data) {
                var title = $(data).filter('title').text();
                var pageInfo = { title: title, url: url };
                history.pushState(pageInfo, pageInfo.title, pageInfo.url);
                currsectionid = url.replace(window.portal_url, '');
                fixUrls(pageInfo.url);
                loadPartial();
                hideLoadingPanel();
                bIsLoading = false;
            });
        }
    }

    function fixUrls(url) {
        var basehref = $('head base').attr('href');
        basehref = basehref.trim();
        if (basehref.lastIndexOf("/") == basehref.length -1) {
            basehref = basehref.slice(0,-1);
        }
        var baseaction = basehref.split('/');
        if (baseaction.length > 0) {
            baseaction = baseaction[baseaction.length-1];
        }
        $('form').each(function() {
            var action = $(this).attr('action');
            if (action == undefined || action == null) {
                action = url.split("?")[0].split("#")[0].split("/@")[0];
                action = action.split('/');
                if (action.length > 0) {
                    action = action[action.length-1];
                    action = (baseaction != action) ? action : '';
                } else {
                    action = '';
                }
            }
            if (action.lastIndexOf("http", 0) == 0) {
                $(this).attr('action', action);
            } else if (action != '') {
                $(this).attr('action', basehref+"/"+action);
            } else {
                $(this).attr('action', basehref);
            }
        });
        $('#content a').each(function() {
            var href = $(this).attr('href');
            if (href == undefined || href == null) {
                href = '';
            }
            if (href.lastIndexOf("/", 0) === 0
                || href.lastIndexOf("http", 0) == 0) {
                // Do nothing
            } else {
                $(this).attr('href', basehref+"/"+href);
            }
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
     * Some JS are loaded by Plone/Bika LIMS dynamically, i.e.
     * datetimewidget.js.
     * Since the page renders the contents asyncronously using ajax
     * requests, the scripts must be loaded dynamically too.
     */
    function loadDynJS(htmlrawdata) {
        var xml = $.parseXML(htmlrawdata)
        var links = $('body script[src], head script[src]').map(function() { return $(this).attr('src').split('?')[0]; }).get();
        $(xml).find('body script[src]').each(function() {
            var outsrc = $(this).attr('src');
            var arrpos = $.inArray(outsrc, links);
            if (arrpos==-1) {
                // Adding the script as a link in the head doesn't work.
                // Must be added as an embedded script for being loaded
                // at runtime
                $.get($(this).attr("src"), function(data){
                    $('head').append('<script type="text/javascript">'+data+'</script>');
                });
            } else {
                links.splice(arrpos, 1);
            }
        });
        $(xml).find('head script[src]').each(function() {
            var outsrc = $(this).attr('src');
            var arrpos = $.inArray(outsrc, links);
            if (arrpos==-1) {
                // Adding the script as a link in the head doesn't work.
                // Must be added as an embedded script for being loaded
                // at runtime
                $.get($(this).attr("src"), function(data){
                    $('head').append('<script type="text/javascript">'+data+'</script>');
                });
            } else {
                links.splice(arrpos, 1);
            }
        });
        $.each(links, function(i, value) {
            $('head script[src="'+value+'"]').remove();
        });
        $('head script').not('[src]').remove();
        $(xml).find('head script').not('[src]').each(function() {
            $(this).detach().appendTo($('head'));
        });
    }

    function loadNonInitializableJS() {

        var js = ['popupforms.js',
                  'jquery.highlightsearchterms.js',
                  'accessibility.js',
                  'styleswitcher.js',
                  'comments.js',
                  'inline_validation.js',
                  'kss-bbb.js',
                  'table_sorter.js',
                  'calendar_formfield.js',
                  'formUnload.js',
                  'formsubmithelpers.js',
                  'datetimewidget.js'
                  //'jquery-timepicker.js'
                  ];

        $.each(js, function(index, value){
            var sc = $('head script[src*="'+value+'"][type="text/javascript"]');
            if ($(sc).length > 0) {
                $(sc).attr('src', $(sc).attr('src').split('?')[0]+"?_="+Date.now());
            }
            /*$.get($(sc).attr("src"), function(data){
               var script = $(data).text();
            });*/
        });

        // ALL
        /*$('head script[src][type="text/javascript"]').each(function(){
            $(this).attr('src', $(this).attr('src')+"?"+Date.now());
            $.get($(this).attr("src"), $(this).serialize(), function(data){
                //eval($(data).text());
               //var nfunc = new Function(data).text();
               //nfunc();
               //var script = $(data).text();
            });
        });*/

    }

    /**
     * Since the page render the contents asyncronously using ajax
     * requests, the original javascripts must reloaded dynamically
     */
    function initializeJavascripts() {

        // Drag and drop reordering of folder contents (ploneDnDReorder)
        initializeDnDReorder('#listing-table');

        // collapsiblesections.js
        $(activateCollapsibles);

        // Form tabbing
        ploneFormTabbing.initialize()

        // Focus on error or first element in a form with class="enableAutoFocus"
        if ($("form div.error :input:first").focus().length) {return;}
        $("form.enableAutoFocus :input:not(.formTabs):visible:first").focus();

        // collapsibleformfields.js
        $('.field.collapsible').do_search_collapse();

        // dropdown.js
        initializeMenus();

        // calendar_formfield.js
        /*$(plone.jscalendar.init);
        $('.plone-jscalendar-popup').each(function() {
            var jqt = $(this),
            widget_id = this.id.replace('_popup', ''),
            year_start = $('#' + widget_id + '_yearStart').val(),
            year_end = $('#' + widget_id + '_yearEnd').val();
            if (year_start && year_end) {
                jqt.css('cursor', 'pointer')
                .show()
                .click(function(e) {
                    return plone.jscalendar.show('#' + widget_id, year_start, year_end);
                });
            }
        });

        // formsubmithelpers.js
        $('input:submit,input:image').each(function() {
            if (!this.onclick)
            $(this).click(inputSubmitOnClick);
        });
        */

        // unlockOnFormUnload.js
        try {
            $(plone.UnlockHandler.init);
        } catch (e) { }

        // Tiny MCE
        try {
            window.initTinyMCE(document);
        } catch (e) { }

        // Reload other js by reheading
        //loadNonInitializableJS();

        // Bika LIMS
        window.bika.lims.loadControllers(true);

        // Remove bika-spinner
        $(document).unbind("ajaxStart");
        $(document).unbind("ajaxStop");
        $('#bika-spinner').remove();

        // personal-tools
        $('#portal-personaltools #user-name').unbind('click');
        $('#portal-personaltools #user-name').click(function(e) {
            e.preventDefault();
            var pt = $(this).closest('#portal-personaltools');
            if (pt.hasClass('deactivated')) {
                pt.removeClass('deactivated');
            } else {
                pt.addClass('deactivated');
            }
        });
    }

    function deactivateTheme() {
        var url = portal_url+"/@@theming-controlpanel";
        var auth = $('input[name="_authenticator"]').val();
        $.post(url, {
            _authenticator: auth,
            themeName: 'graphite.theme',
            "form.button.Disable": "Deactivate"})
        .done(function( data ) {
            window.location.href=window.document.URL;
        });
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

    // Remove bika-spinner
    $(document).unbind("ajaxStart");
    $(document).unbind("ajaxStop");
    $('#bika-spinner').remove();

});
}(jQuery));
