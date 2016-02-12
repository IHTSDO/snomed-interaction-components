/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

function searchPanel(divElement, options) {
    var thread = null;
    var panel = this;
    var lastT = "";
    var xhr = null;
    if (typeof componentsRegistry == "undefined") {
        componentsRegistry = [];
    }

    this.markerColor = 'black';
    if (typeof globalMarkerColor == "undefined") {
        globalMarkerColor = 'black';
    }
    this.type = "search";
    this.divElement = divElement;
    this.options = jQuery.extend(true, {}, options);
    var componentLoaded = false;
    panel.shown0 = false;
    $.each(componentsRegistry, function (i, field) {
        if (field.divElement.id == panel.divElement.id) {
            componentLoaded = true;
        }
    });
    if (componentLoaded == false) {
        componentsRegistry.push(panel);
    }
    panel.subscribers = [];
    panel.subscriptions = [];
    panel.subscriptionsColor = [];
    this.history = [];

    this.setupCanvas = function () {
        var context = {
            divElementId: panel.divElement.id
        };
        $(divElement).html(JST["views/searchPlugin/aux.hbs"](context));

        $('#' + panel.divElement.id + '-searchBox').keyup(function () {
            clearTimeout(thread);
            var $this = $(this);
            thread = setTimeout(function () {
                panel.search($this.val(),0,100,false);
            }, 500);
        });
//        $("#" + panel.divElement.id + "-linkerButton").disableTextSelect();
        $("#" + panel.divElement.id + "-subscribersMarker").disableTextSelect();
        $("#" + panel.divElement.id + "-configButton").disableTextSelect();
        $("#" + panel.divElement.id + "-historyButton").disableTextSelect();
        $("#" + panel.divElement.id + "-collapseButton").disableTextSelect();
        $("#" + panel.divElement.id + "-expandButton").disableTextSelect();
        $("#" + panel.divElement.id + "-closeButton").disableTextSelect();
        $("#" + panel.divElement.id + "-clearButton").disableTextSelect();
        $("#" + panel.divElement.id + "-expandButton").hide();
        $("#" + panel.divElement.id + "-subscribersMarker").hide();

        $("#" + panel.divElement.id).find('.semtag-button').click(function (event) {
            //console.log("Semtag click: " + $(this).html());
        });

        //$("#" + panel.divElement.id + "-searchConfigBar").slideUp('fast');
        if (options.searchMode != "fullText") {
            $("#" + panel.divElement.id + '-navLanguageLabel').closest('a').hide();
        }

        $("#" + panel.divElement.id + "-configButton").click(function (event) {
            panel.setupOptionsPanel();
//            $("#" + panel.divElement.id + "-searchConfigBar").slideToggle('slow');
        });

        if (typeof panel.options.closeButton != "undefined" && panel.options.closeButton == false) {
            $("#" + panel.divElement.id + "-closeButton").hide();
        }

//        if (typeof panel.options.linkerButton != "undefined" && panel.options.linkerButton == false) {
//            $("#" + panel.divElement.id + "-linkerButton").hide();
//        }

        if (typeof panel.options.subscribersMarker != "undefined" && panel.options.subscribersMarker == false) {
            $("#" + panel.divElement.id + "-subscribersMarker").remove();
        }

        if (typeof panel.options.collapseButton != "undefined" && panel.options.collapseButton == false) {
            $("#" + panel.divElement.id + "-expandButton").hide();
            $("#" + panel.divElement.id + "-collapseButton").hide();
        }

        $("#" + panel.divElement.id + "-expandButton").click(function (event) {
            $("#" + panel.divElement.id + "-panelBody").slideDown("fast");
            $("#" + panel.divElement.id + "-expandButton").hide();
            $("#" + panel.divElement.id + "-collapseButton").show();
        });
        $("#" + panel.divElement.id + "-collapseButton").click(function (event) {
            $("#" + panel.divElement.id + "-panelBody").slideUp("fast");
            $("#" + panel.divElement.id + "-expandButton").show();
            $("#" + panel.divElement.id + "-collapseButton").hide();
        });

        if (typeof i18n_panel_options == "undefined") {
            i18n_panel_options = "Panel options";
        }
        $("#" + panel.divElement.id + "-configButton").tooltip({
            placement : 'left',
            trigger: 'hover',
            title: i18n_panel_options,
            animation: true,
            delay: 1000
        });
        if (typeof i18n_history == "undefined") {
            i18n_history = 'History';
        }
        $("#" + panel.divElement.id + "-historyButton").tooltip({
            placement : 'left',
            trigger: 'hover',
            title: i18n_history,
            animation: true,
            delay: 1000
        });
        if (typeof i18n_panel_links == "undefined") {
            i18n_panel_links = 'Panel links';
        }
//        $("#" + panel.divElement.id + "-linkerButton").tooltip({
//            placement : 'left',
//            trigger: 'hover',
//            title: i18n_panel_links,
//            animation: true,
//            delay: 1000
//        });
        $("#" + panel.divElement.id + "-apply-button").click(function () {
            panel.readOptionsPanel();

        });
        $("#" + panel.divElement.id + "-clearButton").click(function () {
            panel.options.semTagFilter = "none";
            panel.options.langFilter = "none";
            panel.options.moduleFilter ="none";
            panel.options.refsetFilter = "none";
            $('#' + panel.divElement.id + '-searchBox').val('');
            $('#' + panel.divElement.id + '-searchFilters').html("");
            $('#' + panel.divElement.id + '-resultsTable').html("");
            $('#' + panel.divElement.id + '-searchBar').html("");
            $('#' + panel.divElement.id + '-searchBar2').html("");
            $('#' + panel.divElement.id + '-typeIcon').removeClass('glyphicon-ok');
            $('#' + panel.divElement.id + '-typeIcon').removeClass('text-success');
            $('#' + panel.divElement.id + '-typeIcon').addClass('glyphicon-remove');
            $('#' + panel.divElement.id + '-typeIcon').addClass('text-danger');
            lastT = "";
        });
        $("#" + panel.divElement.id + "-historyButton").click(function (event) {
            $("#" + panel.divElement.id + "-historyButton").popover({
                trigger: 'manual',
                placement: 'bottomRight',
                html: true,
                content: function () {
                    historyHtml = '<div style="height:100px;overflow:auto;">';
                    if (typeof i18n_no_search_terms == "undefined") {
                        i18n_no_search_terms = "No search terms"
                    }
                    if (panel.history.length == 0) {
                        historyHtml = historyHtml + '<div class="text-center text-muted" style="width:100%"><em>'+ i18n_no_search_terms + '</span>...</em></div>';
                    }
                    historyHtml = historyHtml + '<table>';
                    var reversedHistory = panel.history.slice(0);
                    reversedHistory.reverse();
                    //console.log(JSON.stringify(reversedHistory));
                    $.each(reversedHistory, function (i, field) {
                        var d = new Date();
                        var curTime = d.getTime();
                        var ago = curTime - field.time;
                        var agoString = "";
                        if (ago < (1000 * 60)) {
                            if (Math.round((ago / 1000)) == 1) {
                                agoString = Math.round((ago / 1000)) + ' second ago';
                            } else {
                                agoString = Math.round((ago / 1000)) + ' seconds ago';
                            }
                        } else if (ago < (1000 * 60 * 60)) {
                            if (Math.round((ago / 1000) / 60) == 1) {
                                agoString = Math.round((ago / 1000) / 60) + ' minute ago';
                            } else {
                                agoString = Math.round((ago / 1000) / 60) + ' minutes ago';
                            }
                        } else if (ago < (1000 * 60 * 60 * 60)) {
                            if (Math.round(((ago / 1000) / 60) / 60) == 1) {
                                agoString = Math.round(((ago / 1000) / 60) / 60) + ' hour ago';
                            } else {
                                agoString = Math.round(((ago / 1000) / 60) / 60) + ' hours ago';
                            }
                        }
                        historyHtml = historyHtml + '<tr><td><a href="javascript:void(0);" onclick="searchInPanel(\'' + panel.divElement.id + '\',\'' + field.searchTerm + '\');">' + field.searchTerm + '</a>';
                        historyHtml = historyHtml + ' <span class="text-muted" style="font-size: 80%"><em>' + agoString + '<em></span>';
                        historyHtml = historyHtml + '</td></tr>';
                    });
                    historyHtml = historyHtml + '</table>';
                    historyHtml = historyHtml + '</div>';
                    return historyHtml;
                }
            });
            $("#" + panel.divElement.id + "-historyButton").popover('toggle');
        });
//        $("#" + panel.divElement.id + "-linkerButton").click(function (event) {
//            $("#" + panel.divElement.id + "-linkerButton").popover({
//                trigger: 'manual',
//                placement: 'bottomRight',
//                html: true,
//                content: function () {
//                    var linkerHtml = '<div class="text-center text-muted"><em><span class="i18n" data-i18n-id="i18n_drag_to_link">Drag to link with other panels</span><br>';
//                    if (panel.subscriptions.length == 1) {
//                        linkerHtml = linkerHtml + panel.subscriptions.length + ' link established</em></div>';
//                    } else {
//                        linkerHtml = linkerHtml + panel.subscriptions.length + ' links established</em></div>';
//                    }
//                    linkerHtml = linkerHtml + '<div class="text-center"><a href="javascript:void(0);" onclick="clearSearchPanelSubscriptions(\'' + panel.divElement.id + '\');"><span class="i18n" data-i18n-id="i18n_clear_links">Clear links</span></a></div>';
//                    return linkerHtml;
//                }
//            });
//            $("#" + panel.divElement.id + "-linkerButton").popover('toggle');
//        });

        $("#" + panel.divElement.id + "-fullTextButton").click(function (event) {
            panel.options.searchMode = 'fullText';
            panel.updateSearchLabel();
            var searchTerm = $('#' + panel.divElement.id + '-searchBox').val();
            $("#" + panel.divElement.id + '-navLanguageLabel').closest('a').show();
            if (searchTerm.charAt(0) == "^") {
                $("#" + panel.divElement.id + '-searchBox').val(searchTerm.slice(1));
            }
            if (searchTerm.length > 0) {
                panel.search(searchTerm,0,100,true);
            }
        });
        $("#" + panel.divElement.id + "-partialMatchingButton").click(function (event) {
            panel.options.searchMode = 'partialMatching';
            panel.updateSearchLabel();
            var searchTerm = $('#' + panel.divElement.id + '-searchBox').val();
            $("#" + panel.divElement.id + '-navLanguageLabel').closest('a').hide();
            if (searchTerm.charAt(0) == "^") {
                $("#" + panel.divElement.id + '-searchBox').val(searchTerm.slice(1));
            }
            if (searchTerm.length > 0) {
                panel.search(searchTerm,0,100,true);
            }
        });
        $("#" + panel.divElement.id + "-regexButton").click(function (event) {
            panel.options.searchMode = 'regex';
            panel.updateSearchLabel();
            var searchTerm = $('#' + panel.divElement.id + '-searchBox').val();
            $("#" + panel.divElement.id + '-navLanguageLabel').closest('a').hide();
            if (searchTerm.charAt(0) != "^") {
                $("#" + panel.divElement.id + '-searchBox').val("^" + searchTerm);
            }
            if (searchTerm.length > 0) {
                panel.search(searchTerm,0,100,true);
            }
        });

        $("#" + panel.divElement.id + "-danishLangButton").click(function (event) {
            panel.options.searchLang = 'danish';
            $("#" + panel.divElement.id + '-navLanguageLabel').html(i18n_danish_stemmer);
            var searchTerm = $('#' + panel.divElement.id + '-searchBox').val();
            if (searchTerm.length > 0) {
                panel.search(searchTerm,0,100,true);
            }
        });
        $("#" + panel.divElement.id + "-englishLangButton").click(function (event) {
            panel.options.searchLang = 'english';
            $("#" + panel.divElement.id + '-navLanguageLabel').html(i18n_english_stemmer);
            var searchTerm = $('#' + panel.divElement.id + '-searchBox').val();
            if (searchTerm.length > 0) {
                panel.search(searchTerm,0,100,true);
            }
        });
        $("#" + panel.divElement.id + "-spanishLangButton").click(function (event) {
            panel.options.searchLang = 'spanish';
            $("#" + panel.divElement.id + '-navLanguageLabel').html(i18n_spanish_stemmer);
            var searchTerm = $('#' + panel.divElement.id + '-searchBox').val();
            if (searchTerm.length > 0) {
                panel.search(searchTerm,0,100,true);
            }
        });
        $("#" + panel.divElement.id + "-swedishLangButton").click(function (event) {
            panel.options.searchLang = 'swedish';
            $("#" + panel.divElement.id + '-navLanguageLabel').html(i18n_swedish_stemmer);
            var searchTerm = $('#' + panel.divElement.id + '-searchBox').val();
            if (searchTerm.length > 0) {
                panel.search(searchTerm,0,100,true);
            }
        });

        panel.updateStatusFilterLabel();

        $("#" + panel.divElement.id + "-activeOnlyButton").click(function (event) {
            panel.options.statusSearchFilter = 'activeOnly';
            panel.updateStatusFilterLabel();
        });

        $("#" + panel.divElement.id + "-activeInactiveButton").click(function (event) {
            panel.options.statusSearchFilter = 'activeAndInactive';
            panel.updateStatusFilterLabel();
        });

        $("#" + panel.divElement.id + "-inactiveOnlyButton").click(function (event) {
            panel.options.statusSearchFilter = 'inactiveOnly';
            panel.updateStatusFilterLabel();
        });
        $("#" + panel.divElement.id + "-partialMatchingButton").click();
        $("#" + panel.divElement.id + "-ownMarker").css('color', panel.markerColor);
    };

    this.setupOptionsPanel = function() {
        var possibleSubscribers = [];
        $.each(componentsRegistry, function(i, field){
            if (field.divElement.id != panel.divElement.id){
                var object = {};
                object.subscriptions = field.subscriptions;
                object.id = field.divElement.id;
                possibleSubscribers.push(object);
            }
        });
        var aux = false;
        $.each(possibleSubscribers, function(i, field){
            aux = false;
            $.each(panel.subscriptions, function(j, subscription){
                if (field.id == subscription.topic){
                    aux = true;
                }
            });
            field.subscribed = aux;
            aux = false;
            $.each(field.subscriptions, function(i, subscription){
                if (subscription.topic == panel.divElement.id){
                    aux = true;
                }
            });
            field.subscriptor = aux;
        });
        panel.options.possibleSubscribers = possibleSubscribers;
        var context = {
            options: panel.options,
            divElementId: panel.divElement.id
        };
        $("#" + panel.divElement.id + "-modal-body").html(JST["views/taxonomyPlugin/options.hbs"](context));
    }

    this.readOptionsPanel = function() {
        $.each(panel.options.possibleSubscribers, function (i, field){
            field.subscribed = $("#" + panel.divElement.id + "-subscribeTo-" + field.id).is(':checked');
            field.subscriptor = $("#" + panel.divElement.id + "-subscriptor-" + field.id).is(':checked');
            var panelToSubscribe = {};
            $.each(componentsRegistry, function(i, panelS){
                if (panelS.divElement.id == field.id){
                    panelToSubscribe = panelS;
                }
            });
            if (field.subscribed){
                panel.subscribe(panelToSubscribe);
            }else{
                panel.unsubscribe(panelToSubscribe);
            }
            if (field.subscriptor){
                panelToSubscribe.subscribe(panel);
            }else{
                panelToSubscribe.unsubscribe(panel);
            }
        });
        $.each(componentsRegistry, function (i, field){
            if (field.loadMarkers)
                field.loadMarkers();
        });
    }

    this.updateStatusFilterLabel = function() {
        if (typeof i18n_active_and_inactive == "undefined") {
            i18n_active_and_inactive = 'Active and Inactive';
        }
        if (typeof i18n_inactive_only == "undefined") {
            i18n_inactive_only = 'Inactive Only';
        }
        if (typeof i18n_active_only == "undefined") {
            i18n_active_only = 'Active Only';
        }
        if (panel.options.statusSearchFilter == 'activeAndInactive') {
            $("#" + panel.divElement.id + '-searchStatus').html(i18n_active_and_inactive);
            $("#" + panel.divElement.id + '-navStatusFilterLabel').html(i18n_active_and_inactive);
        } else if (panel.options.statusSearchFilter == 'inactiveOnly') {
            $("#" + panel.divElement.id + '-searchStatus').html(i18n_inactive_only);
            $("#" + panel.divElement.id + '-navStatusFilterLabel').html(i18n_inactive_only);
        } else {
            panel.options.statusSearchFilter = 'activeOnly';
            $("#" + panel.divElement.id + '-searchStatus').html(i18n_active_only);
            $("#" + panel.divElement.id + '-navStatusFilterLabel').html(i18n_active_only);
        }
        var searchTerm = $('#' + panel.divElement.id + '-searchBox').val();
        if (searchTerm.length > 0) {
            panel.search(searchTerm,0,100,true);
        }
    }

    this.search = function (t, skipTo, returnLimit, forceSearch) {
        if (typeof panel.options.searchMode == "undefined") {
            panel.options.searchMode = "partialMatching";
        }
        if (typeof panel.options.semTagFilter == "undefined") {
            panel.options.semTagFilter = "none";
        }
        if (typeof panel.options.langFilter == "undefined") {
            panel.options.langFilter = "none";
        }
        if (typeof panel.options.moduleFilter == "undefined"){
            panel.options.moduleFilter = "none";
        }
        if (typeof panel.options.textIndexNormalized == "undefined"){
            panel.options.textIndexNormalized = "none";
        }
        if (typeof panel.options.refsetFilter == "undefined"){
            panel.options.refsetFilter = "none";
        }

        if (typeof forceSearch == "undefined") {
            forceSearch = false;
        }
        // panel.divElement.id + '-typeIcon
        if (t != "" && (t != lastT || forceSearch)) {
            if (t.length < 3) {
                $('#' + panel.divElement.id + '-typeIcon').removeClass('glyphicon-ok');
                $('#' + panel.divElement.id + '-typeIcon').removeClass('text-success');
                $('#' + panel.divElement.id + '-typeIcon').addClass('glyphicon-remove');
                $('#' + panel.divElement.id + '-typeIcon').addClass('text-danger');
            } else {
                $('#' + panel.divElement.id + '-typeIcon').removeClass('glyphicon-remove');
                $('#' + panel.divElement.id + '-typeIcon').removeClass('text-danger');
                $('#' + panel.divElement.id + '-typeIcon').addClass('glyphicon-ok');
                $('#' + panel.divElement.id + '-typeIcon').addClass('text-success');
                //if (t != lastT) {
                //    panel.options.semTagFilter = "none";
                //    panel.options.langFilter = "none";
                //    panel.options.moduleFilter ="none";
                //    panel.options.refsetFilter = "none";
                //    //panel.options.textIndexNormalized = "none";
                //}
                lastT = t;
                //console.log(t);
                var d = new Date();
                var time = d.getTime();
                panel.history.push({searchTerm: t, time: time});
                //t = t.charAt(0).toUpperCase() + t.slice(1);
                //console.log("Capitalized t: " + t);
                $('#' + panel.divElement.id + '-searchFilters').html("");
                if (skipTo == 0) {
                    $('#' + panel.divElement.id + '-resultsTable').html("<i class='glyphicon glyphicon-refresh icon-spin'></i>");
                } else {
                    $('#' + panel.divElement.id + '-resultsTable').find('.more-row').html("<td colspan='2' class='text-center'><i class='glyphicon glyphicon-refresh icon-spin'></i>&nbsp;&nbsp;</td>");
                }
                var resultsHtml = "";
                if (xhr != null) {
                    xhr.abort();
                    //console.log("aborting call...");
                }
                $('#' + panel.divElement.id + '-searchBar').html("<span class='text-muted'>Searching..</span>");
                //console.log("panel.options.searchMode " + panel.options.searchMode);
                t = t.trim();
                if (isNumber(t)) {
                    if (t.substr(-2, 1) == "0") {
                        // Search conceptId
                        xhr = $.getJSON(options.serverUrl + "/" + options.edition + "/" + options.release + "/concepts/" + t,function (result) {

                        }).done(function (result) {
                            Handlebars.registerHelper('if_eq', function(a, b, opts) {
                                if (opts != "undefined") {
                                    if(a == b)
                                        return opts.fn(this);
                                    else
                                        return opts.inverse(this);
                                }
                            });
                            Handlebars.registerHelper('hasCountryIcon', function(moduleId, opts){
                                if (countryIcons[moduleId])
                                    return opts.fn(this);
                                else
                                    return opts.inverse(this);
                            });
                            var resDescriptions = [];
                            $.each(result.descriptions, function (i, field){
                                var aux = field;
                                aux.definitionStatus = result.definitionStatus;
                                aux.conceptActive = result.active;
                                if (!aux.active || !aux.conceptActive) {
                                    aux.danger = true;
                                }
                                if(field.active){
                                    if (panel.options.statusSearchFilter=="activeOnly"){
                                        resDescriptions.push(aux);
                                    }
                                    if (panel.options.statusSearchFilter=="activeAndInactive"){
                                        resDescriptions.push(aux);
                                    }
                                }else{
                                    aux.danger = true;
                                    if (panel.options.statusSearchFilter=="inactiveOnly"){
                                        resDescriptions.push(aux);
                                    }
                                    if (panel.options.statusSearchFilter=="activeAndInactive"){
                                        resDescriptions.push(aux);
                                    }
                                }
                            });
                            result.descriptions = resDescriptions;
                            var context = {
                                result: result
                            };
                            //console.log(context);
                            $('#' + panel.divElement.id + '-resultsTable').html(JST["views/searchPlugin/body/0.hbs"](context));
                            $('#' + panel.divElement.id + '-searchBar').html("<span class='text-muted'></span>");
                            $('#' + panel.divElement.id + '-resultsTable').find(".result-item").click(function (event) {
//                                $.each(panel.subscribers, function (i, field) {
//                                    //console.log("Notify to " + field.divElement.id + " selected " + $(event.target).attr('data-concept-id'));
//                                    field.conceptId = $(event.target).attr('data-concept-id');
//                                    field.updateCanvas();
//                                });
                                channel.publish(panel.divElement.id, {
                                    term: $(event.target).attr('data-term'),
                                    module: $(event.target).attr("data-module"),
                                    conceptId: $(event.target).attr('data-concept-id'),
                                    source: panel.divElement.id
                                });
                            });
                        }).fail(function(){
                            resultsHtml = resultsHtml + "<tr><td class='text-muted'>No results</td></tr>";
                            $('#' + panel.divElement.id + '-resultsTable').html(resultsHtml);
                            $('#' + panel.divElement.id + '-searchBar2').html("");
                        });
                    } else if (t.substr(-2, 1) == "1") {
                        xhr = $.getJSON(options.serverUrl + "/" + options.edition + "/" + options.release + "/descriptions/" + t,function (result) {

                        }).done(function (result) {
                            //console.log(result);
                            Handlebars.registerHelper('if_eq', function(a, b, opts) {
                                if (opts != "undefined") {
                                    if(a == b)
                                        return opts.fn(this);
                                    else
                                        return opts.inverse(this);
                                }
                            });
                            Handlebars.registerHelper('hasCountryIcon', function(moduleId, opts){
                                if (countryIcons[moduleId])
                                    return opts.fn(this);
                                else
                                    return opts.inverse(this);
                            });
                            var context = {
                                result: result
                            };
                            $('#' + panel.divElement.id + '-resultsTable').html(JST["views/searchPlugin/body/1.hbs"](context));
                            $('#' + panel.divElement.id + '-searchBar').html("<span class='text-muted'></span>");
                            $('#' + panel.divElement.id + '-resultsTable').find(".result-item").click(function (event) {
//                                $.each(panel.subscribers, function (i, field) {
//                                    //console.log("Notify to " + field.divElement.id + " selected " + $(event.target).attr('data-concept-id'));
//                                    field.conceptId = $(event.target).attr('data-concept-id');
//                                    field.updateCanvas();
//                                });
                                channel.publish(panel.divElement.id, {
                                    term: $(event.target).attr('data-term'),
                                    module: $(event.target).attr("data-module"),
                                    conceptId: $(event.target).attr('data-concept-id'),
                                    source: panel.divElement.id
                                });
                            });
                        }).fail(function(){
                            resultsHtml = resultsHtml + "<tr><td class='text-muted'>No results</td></tr>";
                            $('#' + panel.divElement.id + '-resultsTable').html(resultsHtml);
                            $('#' + panel.divElement.id + '-searchBar2').html("");
                        });
                    } else {
//                        console.log(t.substr(-2, 1));
                        resultsHtml = resultsHtml + "<tr><td class='text-muted'>No results</td></tr>";
                        $('#' + panel.divElement.id + '-resultsTable').html(resultsHtml);
                        $('#' + panel.divElement.id + '-searchBar').html("<span class='text-muted'></span>");
                        $('#' + panel.divElement.id + '-searchBar2').html("");
                    }
                } else {
                    if (panel.options.searchMode == "partialMatching") {
                        t = t.toLowerCase();
                        t = t.replace("(","");
                        t = t.replace(")","");
                    }
                    var startTime = Date.now();
                    var searchUrl = options.serverUrl + "/" + options.edition + "/" + options.release + "/descriptions?query=" + encodeURIComponent(t) + "&limit=50&searchMode=" + panel.options.searchMode + "&lang=" + panel.options.searchLang + "&statusFilter=" + panel.options.statusSearchFilter + "&skipTo=" + skipTo + "&returnLimit=" + returnLimit;
                    if (panel.options.semTagFilter != "none") {
                        searchUrl = searchUrl + "&semanticFilter=" + panel.options.semTagFilter;
                    }
                    if (panel.options.langFilter != "none") {
                        searchUrl = searchUrl + "&langFilter=" + panel.options.langFilter;
                    }
                    if (panel.options.moduleFilter != 'none'){
                        searchUrl = searchUrl + "&moduleFilter=" + panel.options.moduleFilter;
                    }
                    if (panel.options.refsetFilter != 'none'){
                        searchUrl = searchUrl + "&refsetFilter=" + panel.options.refsetFilter;
                    }
                    if (panel.options.textIndexNormalized != "none"){
                        searchUrl = searchUrl + "&normalize=" + panel.options.textIndexNormalized;
                    }
                    if ($("#" + panel.divElement.id + "-groupConcept").is(":checked")){
                        searchUrl = searchUrl + "&groupByConcept=1";
                    }
                    //console.log(searchUrl);
                    xhr = $.getJSON(searchUrl,function (result) {

                    }).done(function (result) {
                        $('#' + panel.divElement.id + '-resultsTable').find('.more-row').remove();
                        var endTime = Date.now();
                        var elapsed = (endTime - startTime)/1000;
                        Handlebars.registerHelper('if_eq', function(a, b, opts) {
                            if (opts != "undefined") {
                                if(a == b)
                                    return opts.fn(this);
                                else
                                    return opts.inverse(this);
                            }
                        });
                        Handlebars.registerHelper('hasCountryIcon', function(moduleId, opts){
                            if (countryIcons[moduleId])
                                return opts.fn(this);
                            else
                                return opts.inverse(this);
                        });
                        Handlebars.registerHelper("first20chars", function(string){
                            return (string.substr(0, 18) + "...");
                        });
//                        console.log(panel.options.manifest);
                        var auxArray = [];
                        if (result.filters && panel.options.manifest){
                            if (result.filters.refsetId){
                                $.each(result.filters.refsetId, function (i, refset){
                                    var found = false;
                                    var auxObject = {};
                                    $.each(panel.options.manifest.refsets, function(j, field){
                                        if (i == field.conceptId){
                                            auxObject.term = field.defaultTerm;
                                            auxObject.value = i;
                                            auxObject.cant = refset;
                                            found = true;
                                        }
                                    })
                                    if (!found){
                                        auxObject.term = null;
                                        auxObject.value = i;
                                        auxObject.cant = refset;
                                    }
                                    auxArray.push(auxObject);
                                });
                                result.filters.refsetId = [];
                                result.filters.refsetId = auxArray;
                                result.filters.refsetId.sort(function (a, b) {
                                    if (a.cant > b.cant)
                                        return -1;
                                    if (a.cant < b.cant)
                                        return 1;
                                    return 0;
                                });
                            }else{
                                result.filters.refsetId = [];
                            }
                            auxArray = [];
                            $.each(result.filters.module, function (i, field){
                                var found = false;
                                var auxObject = {};
                                $.each(panel.options.manifest.modules, function(j, module){
                                    if (i == module.conceptId){
                                        auxObject.term = module.defaultTerm;
                                        auxObject.value = i;
                                        auxObject.cant = field;
                                        found = true;
                                    }
                                })
                                if (!found){
                                    auxObject.term = null;
                                    auxObject.value = i;
                                    auxObject.cant = field;
                                }
                                auxArray.push(auxObject);
//                            console.log(auxObject);
                            });
                            result.filters.module = [];
                            result.filters.module = auxArray;
                            result.filters.module.sort(function (a, b) {
                                if (a.cant > b.cant)
                                    return -1;
                                if (a.cant < b.cant)
                                    return 1;
                                return 0;
                            });
                            if(result.filters.lang && result.filters.semTag){
                                function sortObject(object){
                                    var sortable = [], sortedObj = {};
                                    for (var attr in object)
                                        sortable.push([attr, object[attr]]);
                                    sortable.sort(function(a, b) {return b[1] - a[1]});
                                    $.each(sortable, function (i, field){
                                        sortedObj[field[0]] = field[1];
                                    });
                                    return sortedObj;
                                }
                                result.filters.lang = sortObject(result.filters.lang);
                                result.filters.semTag = sortObject(result.filters.semTag);
                            }
                        }
//                        console.log(auxArray);
//                        console.log(result.filters.module);
//                        var ind = 0;
//                        $.each(result.filters.refsetId, function (i, field){
//                            ind++;
//                        });
//                        if (ind == 0){
//                            result.filters.refsetId = 0;
//                        }
                        var context = {
                            result: result,
                            elapsed: elapsed,
                            divElementId: panel.divElement.id,
                            options: panel.options
                        };
                        $('#' + panel.divElement.id + '-searchBar').html(JST["views/searchPlugin/body/bar.hbs"](context));
                        $('#' + panel.divElement.id + '-searchBar2').html(JST["views/searchPlugin/body/bar2.hbs"](context));

                        $('#' + panel.divElement.id + '-moduleResumed').tooltip({
                            placement: 'left auto',
                            trigger: 'hover',
                            title: $('#' + panel.divElement.id + '-moduleResumed').attr("data-name"),
                            animation: true,
                            delay: 500
                        });

                        $('#' + panel.divElement.id + '-refsetResumed').tooltip({
                            placement: 'left auto',
                            trigger: 'hover',
                            title: $('#' + panel.divElement.id + '-refsetResumed').attr("data-name"),
                            animation: true,
                            delay: 500
                        });

                        $("#" + panel.divElement.id + '-searchBar2').find('.semtag-link').click(function (event) {
                            panel.options.semTagFilter = $(event.target).attr('data-semtag');
                            panel.search(t, 0, returnLimit, true);
                        });
                        $("#" + panel.divElement.id + '-searchBar2').find('.module-link').click(function (event) {
                            panel.options.moduleFilter = $(event.target).attr('data-module');
                            panel.options.moduleFilterName = $(event.target).attr('data-term');
                            panel.search(t, 0, returnLimit, true);
                        });
                        $("#" + panel.divElement.id + '-searchBar2').find('.lang-link').click(function (event) {
                            panel.options.langFilter = $(event.target).attr('data-lang');
                            panel.search(t, 0, returnLimit, true);
                        });
                        $("#" + panel.divElement.id + '-searchBar2').find('.refset-link').click(function (event) {
                            panel.options.refsetFilter = $(event.target).attr('data-refset');
                            panel.options.refsetFilterName = $(event.target).attr('data-term');
                            panel.search(t, 0, returnLimit, true);
                        });
                        $("#" + panel.divElement.id + '-searchBar2').find('.remove-semtag').click(function (event) {
                            panel.options.semTagFilter = "none";
                            panel.search(t, 0, returnLimit, true);
                        });
                        $("#" + panel.divElement.id + '-searchBar2').find('.remove-lang').click(function (event) {
                            panel.options.langFilter = "none";
                            panel.search(t, 0, returnLimit, true);
                        });
                        $("#" + panel.divElement.id + '-searchBar2').find('.remove-module').click(function (event) {
                            panel.options.moduleFilter = "none";
                            panel.options.moduleFilterName = null;
                            panel.search(t, 0, returnLimit, true);
                        });
                        $("#" + panel.divElement.id + '-searchBar2').find('.remove-refset').click(function (event) {
                            panel.options.refsetFilter = "none";
                            panel.options.refsetFilterName = null;
                            panel.search(t, 0, returnLimit, true);
                        });

                        //original filter
                        $("#" + panel.divElement.id + '-searchBar').find('.semtag-link').click(function (event) {
                            panel.options.semTagFilter = $(event.target).attr('data-semtag');
                            panel.search(t, 0, returnLimit, true);
                        });
                        $("#" + panel.divElement.id + '-searchBar').find('.module-link').click(function (event) {
                            panel.options.moduleFilter = $(event.target).attr('data-module');
                            panel.options.moduleFilterName = $(event.target).attr('data-term');
                            panel.search(t, 0, returnLimit, true);
                        });
                        $("#" + panel.divElement.id + '-searchBar').find('.lang-link').click(function (event) {
                            panel.options.langFilter = $(event.target).attr('data-lang');
                            panel.search(t, 0, returnLimit, true);
                        });
                        $("#" + panel.divElement.id + '-searchBar').find('.remove-semtag').click(function (event) {
                            panel.options.semTagFilter = "none";
                            panel.search(t, 0, returnLimit, true);
                        });
                        $("#" + panel.divElement.id + '-searchBar').find('.remove-lang').click(function (event) {
                            panel.options.langFilter = "none";
                            panel.search(t, 0, returnLimit, true);
                        });
                        $("#" + panel.divElement.id + '-searchBar').find('.remove-module').click(function (event) {
                            panel.options.moduleFilter = "none";
                            panel.options.moduleFilterName = null;
                            panel.search(t, 0, returnLimit, true);
                        });
                        if (result.details) {
                            var searchComment = "<span class='text-muted'>" + result.details.total + " matches found in " + elapsed + " seconds.</span>";
                        }
                        xhr = null;
                        var matchedDescriptions = result.matches;
                        //console.log(JSON.stringify(result));
                        var remaining = result.details.total - (skipTo + returnLimit);

                        if (panel.options.searchMode == "regex") {
                            result.matches.sort(function (a, b) {
                                if (a.term.length < b.term.length)
                                    return -1;
                                if (a.term.length > b.term.length)
                                    return 1;
                                return 0;
                            });
                        }
                        Handlebars.registerHelper('if_eq', function(a, b, opts) {
                            if (opts != "undefined") {
                                if(a == b)
                                    return opts.fn(this);
                                else
                                    return opts.inverse(this);
                            }
                        });
                        Handlebars.registerHelper('if_gr', function(a,b, opts) {
                            if (a){
                                if(a > parseInt(b))
                                    return opts.fn(this);
                                else
                                    return opts.inverse(this);
                            }
                        });
                        Handlebars.registerHelper('if_gre', function(a,b, opts) {
                            if (a){
                                if(parseInt(a) >= b)
                                    return opts.fn(this);
                                else
                                    return opts.inverse(this);
                            }
                        });
                        Handlebars.registerHelper('hasCountryIcon', function(moduleId, opts){
                            if (countryIcons[moduleId])
                                return opts.fn(this);
                            else
                                return opts.inverse(this);
                        });

                        Handlebars.registerHelper('hasFilters', function(options, opts){
                            if (options.semTagFilter != "none" ||
                                options.langFilter != "none" ||
                                options.moduleFilter != "none" ||
                                options.refsetFilter != "none") {
                                return  opts.fn(this);;
                            } else {
                                return opts.inverse(this);
                            }
                        });
                        var context = {
                            options: panel.options,
                            result: result,
                            divElementId: panel.divElement.id,
                            remaining: remaining,
                            returnLimit: returnLimit
                        };

                        if (skipTo == 0) {
                            $('#' + panel.divElement.id + '-resultsTable').html(JST["views/searchPlugin/body/default.hbs"](context));
                        } else {
                            $('#' + panel.divElement.id + '-resultsTable').append(JST["views/searchPlugin/body/default.hbs"](context));
                        }
                        $("#" + panel.divElement.id + "-groupConcept").click(function(){
                            panel.search(t, parseInt(skipTo), returnLimit, true);
                        });
                        $("#" + panel.divElement.id + "-remove-all-filters").unbind();
                        $("#" + panel.divElement.id + "-remove-all-filters").click(function (event) {
                            panel.options.semTagFilter = "none";
                            panel.options.langFilter = "none";
                            panel.options.moduleFilter = "none";
                            panel.options.refsetFilter = "none";
                            panel.search(t, 0, returnLimit, true);
                        });
                        $("#" + panel.divElement.id + "-more").unbind();
                        $("#" + panel.divElement.id + "-more").click(function (event) {
                            panel.search(t, (parseInt(skipTo) + parseInt(returnLimit)), returnLimit, true);
                        });
                        $('#' + panel.divElement.id + '-resultsTable').find(".result-item").click(function (event) {
                            channel.publish(panel.divElement.id, {
                                term: $(event.target).attr("data-term"),
                                module: $(event.target).attr("data-module"),
                                conceptId: $(event.target).attr('data-concept-id'),
                                source: panel.divElement.id
                            });
                        });
                        $("[draggable='true']").tooltip({
                            placement: 'left auto',
                            trigger: 'hover',
                            title: i18n_drag_this,
                            animation: true,
                            delay: 500
                        });

                        $("[draggable='true']").mouseover(function(e){
//                console.log(e);
                            var term = $(e.target).attr("data-term");
                            if (typeof term == "undefined"){
                                term = $($(e.target).parent()).attr("data-term");
                            }
                            icon = iconToDrag(term);
                        });

                    }).fail(function () {
                        resultsHtml = resultsHtml + "<tr><td class='text-muted'>No results</td></tr>";
                        $('#' + panel.divElement.id + '-resultsTable').html(resultsHtml);
                        $('#' + panel.divElement.id + '-searchBar2').html("");
                    });
                }
            }
        }
    }


    this.getNextMarkerColor = function(color) {
//console.log(color);
        var returnColor = 'black';
        if (color == 'black') {
            returnColor = 'green';
        } else if (color == 'green') {
            returnColor = 'purple';
        } else if (color == 'purple') {
            returnColor = 'red';
        } else if (color == 'red') {
            returnColor = 'blue';
        } else if (color == 'blue') {
            returnColor = 'green';
        }
//console.log(returnColor);
        globalMarkerColor = returnColor;
        return returnColor;
    }
    panel.markerColor = panel.getNextMarkerColor(globalMarkerColor);

    // Subscription methods
    this.subscribe = function(panelToSubscribe) {
        var panelId = panelToSubscribe.divElement.id;
//        console.log('Subscribing to id: ' + panelId);
        var alreadySubscribed = false;
        $.each(panel.subscriptionsColor, function(i, field){
            if (field == panelToSubscribe.markerColor){
                alreadySubscribed = true;
            }
        });
        if (!alreadySubscribed) {
            var subscription = channel.subscribe(panelId, function(data, envelope) {
//                console.log("listening in " + panel.divElement.id);
                panel.options.searchMode = "fullText";
                panel.search(data.conceptId, 0, 100, false);
                $('#' + panel.divElement.id + '-searchBox').val(data.term);
            });
            panel.subscriptions.push(subscription);
            panelToSubscribe.subscribers.push(panel.divElement.id);
            panel.subscriptionsColor.push(panelToSubscribe.markerColor);
        }
        $("#" + panelId + "-ownMarker").show();
        $("#" + panel.divElement.id + "-subscribersMarker").show();
        $("#" + panelId + "-subscribersMarker").show();
    }

    this.unsubscribe = function(panelToUnsubscribe) {
        var aux = [], colors = [], unsubscribed = true;
        $.each(panel.subscriptionsColor, function(i, field){
            if (field != panelToUnsubscribe.markerColor){
                colors.push(field);
            }else{
                unsubscribed = false;
            }
        });
        if (!unsubscribed){
            panel.subscriptionsColor = colors;
//            console.log(panel.divElement.id);
//            console.log(panel.subscriptionsColor);
            colors = [];
            $.each(panelToUnsubscribe.subscribers, function(i, field){
                if (field != panel.divElement.id){
                    aux.push(field);
                }
            });
            panelToUnsubscribe.subscribers = aux;
            $.each(panelToUnsubscribe.subscriptionsColor, function(i, field){
                colors.push(field);
            });
            if (panelToUnsubscribe.subscribers.length == 0){
                if (panelToUnsubscribe.subscriptions.length == 0){
                    $("#" + panelToUnsubscribe.divElement.id + "-subscribersMarker").hide();
                }
            }else{
//                colors.push(panelToUnsubscribe.markerColor);
            }
            panelToUnsubscribe.subscriptionsColor = colors;
//            console.log(panelToUnsubscribe.divElement.id);
//            console.log(panelToUnsubscribe.subscriptionsColor);
            aux = [];
            $.each(panel.subscriptions, function(i, field){
                if (panelToUnsubscribe.divElement.id == field.topic){
                    field.unsubscribe();
                }else{
                    aux.push(field);
                }
            });
            panel.subscriptions = aux;
            if (panel.subscriptions.length == 0 && panel.subscribers.length == 0){
                $("#" + panel.divElement.id + "-subscribersMarker").hide();
            }
        }
    }

    this.loadMarkers = function (){
        var auxMarker = "", right = 0, top = 0, aux = false, visible = false;
        $.each(componentsRegistry, function(i, field){
            var panelId = field.divElement.id;
            if ($("#" + panelId + "-subscribersMarker").is(':visible')){
                visible = true;
            }
        });
        if (panel.subscribers.length == 0){
            right = 14;
            $("#" + panel.divElement.id + "-ownMarker").hide();
        }else{
            if (!visible){
                $("#" + panel.divElement.id + "-ownMarker").hide();
            }
            aux = true;
        }
        if ($("#" + panel.divElement.id + "-subscribersMarker").is(':visible')){
            $("#" + panel.divElement.id + "-panelTitle").html($("#" + panel.divElement.id + "-panelTitle").html().replace(/&nbsp;/g, ''));
            if (aux){
                $("#" + panel.divElement.id + "-panelTitle").html("&nbsp&nbsp&nbsp&nbsp" + $("#" + panel.divElement.id + "-panelTitle").html());
            }
            $.each(panel.subscriptionsColor, function(i, field){
                auxMarker = auxMarker + "<i class='glyphicon glyphicon-bookmark' style='color: "+ field +"; top:" + top + "px; right: " + right + "px;'></i>";
                $("#" + panel.divElement.id + "-panelTitle").html("&nbsp&nbsp" + $("#" + panel.divElement.id + "-panelTitle").html());
                top = top + 5;
                right = right + 10;
            });
            $("#" + panel.divElement.id + "-subscribersMarker").html(auxMarker);
        }
    }

    this.updateSearchLabel = function () {
        if (typeof panel.options.searchMode == "undefined") {
            panel.options.searchMode = "partialMatching";
        }
        if (typeof i18n_search_examp_1 == "undefined") {
            i18n_search_examp_1 = 'Example 1';
        }
        if (typeof i18n_search_examp_2 == "undefined") {
            i18n_search_examp_2 = 'Example 2';
        }
        if (typeof i18n_search_examp_3 == "undefined") {
            i18n_search_examp_3 = 'Example 3';
        }
        if (typeof i18n_regex_search_mode == "undefined") {
            i18n_regex_search_mode = 'Regex';
        }
        if (typeof i18n_partial_match_search_mode == "undefined") {
            i18n_partial_match_search_mode = 'Partial';
        }
        if (typeof i18n_full_text_search_mode == "undefined") {
            i18n_full_text_search_mode = 'Full';
        }
        if (panel.options.searchMode == "regex") {
            $("#" + panel.divElement.id + "-searchMode").html("<span class='i18n' data-i18n-id='i18n_regex_search_mode'>" + i18n_regex_search_mode + "</span>");
            $("#" + panel.divElement.id + '-searchExample').html("<span class='i18n text-muted' data-i18n-id='i18n_search_examp_1'>" + i18n_search_examp_1  +  "</span> ");
            $("#" + panel.divElement.id + '-navSearchModeLabel').html("<span class='i18n' data-i18n-id='i18n_regex_search_mode'>" + i18n_regex_search_mode  +  "</span>");
        } else if (panel.options.searchMode == "fullText") {
            $("#" + panel.divElement.id + "-searchMode").html("<span class='i18n' data-i18n-id='i18n_full_text_search_mode'>" + i18n_full_text_search_mode + "</span>");
            $("#" + panel.divElement.id + '-searchExample').html("<span class='i18n text-muted' data-i18n-id='i18n_search_examp_2'>" + i18n_search_examp_2  +  "</em></span> ");
            $("#" + panel.divElement.id + '-navSearchModeLabel').html("<span class='i18n' data-i18n-id='i18n_full_text_search_mode'>" + i18n_full_text_search_mode  +  "</span>");
        } else if (panel.options.searchMode == "partialMatching") {
            $("#" + panel.divElement.id + "-searchMode").html("<span class='i18n' data-i18n-id='i18n_partial_match_search_mode'>" + i18n_partial_match_search_mode + "</span>");
            $("#" + panel.divElement.id + '-searchExample').html("<span class='i18n text-muted' data-i18n-id='i18n_search_examp_3'>" + i18n_search_examp_3  +  "</span> ");
            $("#" + panel.divElement.id + '-navSearchModeLabel').html("<span class='i18n' data-i18n-id='i18n_partial_match_search_mode'>" + i18n_partial_match_search_mode  +  "</span>");
        }

        if (typeof panel.options.searchLang == "undefined") {
            panel.options.searchLang = "english";
        }
        if (typeof i18n_danish_stemmer == "undefined") {
            i18n_danish_stemmer = 'Danish Stemmer';
        }
        if (typeof i18n_english_stemmer == "undefined") {
            i18n_english_stemmer = 'English Stemmer';
        }
        if (typeof i18n_spanish_stemmer == "undefined") {
            i18n_spanish_stemmer = 'Spanish Stemmer';
        }
        if (panel.options.searchLang == "danish") {
            $("#" + panel.divElement.id + '-navLanguageLabel').html("<span class='i18n' data-i18n-id='i18n_danish_stemmer'>" + i18n_danish_stemmer  +  "</span>");
        } else if (panel.options.searchLang == "english") {
            $("#" + panel.divElement.id + '-navLanguageLabel').html("<span class='i18n' data-i18n-id='i18n_english_stemmer'>" + i18n_english_stemmer  +  "</span>");
        } else if (panel.options.searchLang == "spanish") {
            $("#" + panel.divElement.id + '-navLanguageLabel').html("<span class='i18n' data-i18n-id='i18n_spanish_stemmer'>" + i18n_spanish_stemmer  +  "</span>");
        }

    }

    this.setupCanvas();
    this.updateSearchLabel();

}

function isNumber(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}

function clearSearchPanelSubscriptions(divElementId1) {
    var d1;
    $.each(componentsRegistry, function(i, field) {
        if (field.divElement.id == divElementId1) {
            d1 = field;
        }
    });
    d1.unsubscribeAll();
    $("#" + divElementId1).find('.linker-button').popover('toggle');
}

function searchInPanel(divElementId, searchTerm) {
    $.each(componentsRegistry, function (i, field) {
//console.log(field.divElement.id + ' == ' + divElementId);
        if (field.divElement.id == divElementId) {
            $('#' + divElementId + '-searchBox').val(searchTerm);
            field.search(searchTerm,0,100,false);
        }
    });
    $('.history-button').popover('hide');
}

$(document).keypress(function (event) {
    if (event.which == '13') {
        event.preventDefault();
    }
});

(function($) {
    $.fn.addSearch = function(options) {
        this.filter("div").each(function() {
            var tx = new conceptDetails(this, options);
        });
    };
}(jQuery));
