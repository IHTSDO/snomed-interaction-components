$(function() {
    $.extend($.fn.disableTextSelect = function() {
        return this.each(function() {
            $(this).mousedown(function() {
                return false;
            });
        });
    });
    $('.noSelect').disableTextSelect(); //No text selection on elements with a class of 'noSelect'
});

function conceptDetails(divElement, conceptId, options) {

    if (typeof componentsRegistry == "undefined") {
        componentsRegistry = [];
    }

    var panel = this;
    this.type = "concept-details";
    this.conceptId = conceptId;
    this.divElement = divElement;
    this.options = jQuery.extend(true, {}, options);
    this.attributesPId = "";
    this.descsPId = "";
    this.relsPId = "";
    this.history = [];
    this.color = "white";
    panel.preferred = false;
    panel.acceptable = false;
    panel.included = false;
    panel.refset = {};
    panel.refset.simple = false;
    panel.refset.simplemap = false;
    panel.refset.attr = false;
    panel.refset.assoc = false;
    this.lastGroup = null;
    this.subscription = null;
    var xhr = null;
    var xhrChildren = null;
    var conceptRequested = 0;

    componentLoaded = false;
    $.each(componentsRegistry, function(i, field) {
        if (field.divElement.id == panel.divElement.id) {
            componentLoaded = true;
        }
    });
    if (componentLoaded == false) {
        componentsRegistry.push(panel);
    }


    this.getConceptId = function() {
        return this.conceptId;
    }

    this.getDivId = function() {
        return this.divId;
    }

    this.setupCanvas = function() {
        panel.attributesPId = panel.divElement.id + "-attributes-panel";
        panel.descsPId = panel.divElement.id + "-descriptions-panel";
        panel.relsPId = panel.divElement.id + "-rels-panel";
        panel.childrenPId = panel.divElement.id + "-children-panel";
        panel.defaultTerm = "";
        $(divElement).html();
        var context = {
            divElementId: panel.divElement.id
        };
        //        options statedParents inferredParents firstMatch statedRoles inferredRoles allDescriptions
        // dataContentValue = document.URL.split("?")[0].split("#")[0]

        $(divElement).html(JST["views/conceptDetailsPlugin/main.hbs"](context));

        $("#" + panel.divElement.id + "-linkerButton").disableTextSelect();
        $("#" + panel.divElement.id + "-subscribersMarker").disableTextSelect();
        $("#" + panel.divElement.id + "-configButton").disableTextSelect();
        $("#" + panel.divElement.id + "-historyButton").disableTextSelect();
        $("#" + panel.divElement.id + "-collapseButton").disableTextSelect();
        $("#" + panel.divElement.id + "-expandButton").disableTextSelect();
        $("#" + panel.divElement.id + "-closeButton").disableTextSelect();

        $("#" + panel.divElement.id + "-expandButton").hide();
        $("#" + panel.divElement.id + "-subscribersMarker").hide();

        $("#" + panel.divElement.id + "-closeButton").click(function(event) {
            $(divElement).remove();
        });

        if (typeof panel.options.closeButton != "undefined" && panel.options.closeButton == false) {
            $("#" + panel.divElement.id + "-closeButton").hide();
        }

        if (typeof panel.options.linkerButton != "undefined" && panel.options.linkerButton == false) {
            $("#" + panel.divElement.id + "-linkerButton").hide();
        }

        if (typeof panel.options.subscribersMarker != "undefined" && panel.options.subscribersMarker == false) {
            $("#" + panel.divElement.id + "-subscribersMarker").remove();
        }

        if (typeof panel.options.collapseButton != "undefined" && panel.options.collapseButton == false) {
            $("#" + panel.divElement.id + "-expandButton").hide();
            $("#" + panel.divElement.id + "-collapseButton").hide();
        }

        $("#" + panel.divElement.id + "-expandButton").click(function(event) {
            $("#" + panel.divElement.id + "-panelBody").slideDown("fast");
            $("#" + panel.divElement.id + "-expandButton").hide();
            $("#" + panel.divElement.id + "-collapseButton").show();
            $("#" + panel.divElement.id + "-panelTitle").html("&nbsp&nbsp&nbsp<strong>Concept Details</strong>");
        });

        $("#" + panel.divElement.id + "-collapseButton").click(function(event) {
            $("#" + panel.divElement.id + "-panelBody").slideUp("fast");
            $("#" + panel.divElement.id + "-expandButton").show();
            $("#" + panel.divElement.id + "-collapseButton").hide();
            //if (panel.defaultTerm.length > 25) {
            //    $("#" + panel.divElement.id + "-panelTitle").html("<strong>Concept Details: " + panel.defaultTerm.substring(0, 24).trim() + "...</strong>");
            //} else {
            $("#" + panel.divElement.id + "-panelTitle").html("&nbsp&nbsp&nbsp<strong>Concept Details: " + panel.defaultTerm + "</strong>");
            //}
        });

        $('#' + panel.divElement.id).click(function(event) {
            if (!$(event.target).hasClass('glyphicon')) {
                $('#' + panel.divElement.id).find('.more-fields-button').popover('hide');
            }
        });

        $("#" + panel.divElement.id + "-historyButton").click(function(event) {
            $("#" + panel.divElement.id + "-historyButton").popover({
                trigger: 'manual',
                placement: 'bottomRight',
                html: true,
                content: function() {
                    var historyHtml = '<div style="height:100px;overflow:auto;">';
                    historyHtml = historyHtml + '<table>';
                    var reversedHistory = panel.history.slice(0);
                    reversedHistory.reverse();
                    //console.log(JSON.stringify(reversedHistory));
                    $.each(reversedHistory, function(i, field) {
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
                        historyHtml = historyHtml + '<tr><td><a href="javascript:void(0);" onclick="updateCD(\'' + panel.divElement.id + '\',' + field.conceptId + ');">' + field.defaultTerm + '</a>';
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
        $("#" + panel.divElement.id + "-linkerButton").tooltip({
            placement : 'left',
            trigger: 'hover',
            title: i18n_panel_links,
            animation: true,
            delay: 1000
        });

        $("#" + panel.divElement.id + "-apply-button").click(function() {
            //console.log("apply!");
            panel.readOptionsPanel();
            panel.updateCanvas();
        });

        $("#" + panel.divElement.id + "-linkerButton").click(function(event) {
            $("#" + panel.divElement.id + "-linkerButton").popover({
                trigger: 'manual',
                placement: 'bottomRight',
                html: true,
                content: function() {
                    if (!panel.subscription) {
                        linkerHtml = '<div class="text-center text-muted"><em>Not linked yet<br>Drag to link with other panels</em></div>';
                    } else {
                        linkerHtml = '<div class="text-center"><a href="javascript:void(0);" onclick="cancelSubscription(\'' + panel.subscription.divElement.id + '\',\'' + panel.divElement.id + '\');">Clear link</a></div>';
                    }
                    return linkerHtml;
                }
            });
            $("#" + panel.divElement.id + "-linkerButton").popover('toggle');
        });

        panel.updateCanvas();
        panel.setupOptionsPanel();
    }

    this.handleDropEvent = function(event, ui) {
        var draggable = ui.draggable;
        //console.log(draggable.html() + " |  " + draggable.attr('data-concept-id') + ' was dropped onto me!');
        if (!draggable.attr('data-concept-id')) {
            if (!draggable.attr('data-panel')) {
                //console.log("ignore");
            } else {
                //console.log("OK : " + draggable.attr('data-panel'));
                $.each(componentsRegistry, function(i, field) {
                    if (field.divElement.id == draggable.attr('data-panel')) {
                        if (field.type == "search" || field.type == "taxonomy") {
                            field.subscribe(panel);
                        }
                    }
                });
            }
        } else {
            if (panel.conceptId != draggable.attr('data-concept-id')) {
                if ($.contains($("#" + panel.divElement.id).get(0), $(draggable).get(0))) {
                    draggable.remove();
                }
                panel.conceptId = draggable.attr('data-concept-id');
                panel.updateCanvas();
            }
        }


    }

    this.updateCanvas = function() {
        $('.more-fields-button').popover('hide');
        if (conceptRequested == panel.conceptId) {
            return;
        }
        conceptRequested = panel.conceptId;
        $('#' + panel.attributesPId).html("<i class='glyphicon glyphicon-refresh icon-spin'></i>");
        $('#home-attributes-' + panel.divElement.id).html("<i class='glyphicon glyphicon-refresh icon-spin'></i>");
        $('#' + panel.descsPId).html("<i class='glyphicon glyphicon-refresh icon-spin'></i>");
        $('#' + panel.relsPId).html("<i class='glyphicon glyphicon-refresh icon-spin'></i>");
        $('#home-parents-' + panel.divElement.id).html("<i class='glyphicon glyphicon-refresh icon-spin'></i>");
        $('#home-roles-' + panel.divElement.id).html("<i class='glyphicon glyphicon-refresh icon-spin'></i>");
        $('#' + panel.childrenPId).html("<i class='glyphicon glyphicon-refresh icon-spin'></i>");
        $("#diagram-canvas-" + panel.divElement.id).html("<i class='glyphicon glyphicon-refresh icon-spin'></i>");
        $('#refsets-' + panel.divElement.id).html("<i class='glyphicon glyphicon-refresh icon-spin'></i>");

        // load attributes
        if (xhr != null) {
            xhr.abort();
            console.log("aborting call...");
        }
        xhr = $.getJSON(options.serverUrl + "/" + options.edition + "/" + options.release + "/concepts/" + panel.conceptId, function(result) {

        }).done(function(result) {
            var firstMatch = result;
            xhr = null;
            panel.attributesPId = divElement.id + "-attributes-panel";
            panel.defaultTerm = firstMatch.defaultTerm;
            var d = new Date();
            var time = d.getTime();
            panel.history.push({defaultTerm: firstMatch.defaultTerm, conceptId: firstMatch.conceptId, time: time});
            Handlebars.registerHelper('if_eq', function(a, b, opts) {
                if (opts != "undefined") {
                    if(a == b)
                        return opts.fn(this);
                    else
                        return opts.inverse(this);
                }
            });
            var context = {
                firstMatch: firstMatch,
                divElementId: panel.divElement.id,
                dataContentValue: document.URL.split("?")[0].split("#")[0]
            };
            $('#' + panel.attributesPId).html(JST["views/conceptDetailsPlugin/tabs/details/attributes-panel.hbs"](context));
            $('#' + 'share-link-' + panel.divElement.id).disableTextSelect();
            $('#' + 'share-link-' + panel.divElement.id).click(function(event) {
                setTimeout(function () {
                    $('#' + 'share-field-' + panel.divElement.id).select();
                },300);
            });


            // load home-attributes
            Handlebars.registerHelper('if_eq', function(a, b, opts) {
                if (opts != "undefined") {
                    if(a == b)
                        return opts.fn(this);
                    else
                        return opts.inverse(this);
                }
            });
            var context = {
                panel: panel,
                firstMatch: firstMatch,
                divElementId: panel.divElement.id
            };
            $('#home-attributes-' + panel.divElement.id).html(JST["views/conceptDetailsPlugin/tabs/home/attributes.hbs"](context));

            if (!firstMatch.active) {
                $('#home-attributes-' + panel.divElement.id).css("background-color", "LightPink");
            } else {
                $('#home-attributes-' + panel.divElement.id).css("background-color", "white");
            }

            if ($("#" + panel.divElement.id + "-expandButton").is(":visible")) {
                $("#" + panel.divElement.id + "-panelTitle").html("&nbsp;&nbsp;&nbsp;<strong>Concept Details: " + panel.defaultTerm + "</strong>");
            }
            if (typeof i18n_drag_this == "undefined") {
                i18n_drag_this = "Drag this";
            }
            $( "span[draggable='true']" ).tooltip({
                placement : 'left auto',
                trigger: 'hover',
                title: i18n_drag_this,
                animation: true,
                delay: 500
            });



            // load descriptions panel
            panel.descsPId = divElement.id + "-descriptions-panel";
            var languageName = "";
            if (panel.options.langRefset == "900000000000508004") {
                languageName = "(GB)";
            } else if (panel.options.langRefset == "900000000000509007") {
                languageName = "(US)";
            } else if (panel.options.langRefset == "450828004") {
                languageName = "(ES)";
            } else if (panel.options.langRefset == "554461000005103") {
                languageName = "(DA)";
            }

            var allDescriptions = firstMatch.descriptions.slice(0);
            allDescriptions.sort(function(a, b) {
                if (a.type.conceptId < b.type.conceptId)
                    return -1;
                if (a.type.conceptId > b.type.conceptId)
                    return 1;
                if (a.type.conceptId == b.type.conceptId) {
                    if (a.term < b.term)
                        return -1;
                    if (a.term > b.term)
                        return 1;
                }
                return 0;
            });
            var homeDescriptionsHtml = "";
            $.each(allDescriptions, function(i, field) {
                if (panel.options.displayInactiveDescriptions || field.active == true) {
                    if (field.active == true) {
                        if (homeDescriptionsHtml != "") {
                            homeDescriptionsHtml = homeDescriptionsHtml + "<br>";
                        }
                        homeDescriptionsHtml = homeDescriptionsHtml + "&nbsp;&nbsp;&nbsp;&nbsp;" + field.term;
                    }
                }
            });
                Handlebars.registerHelper('removeSemtag', function (term){
                    return panel.removeSemtag(term);
                });
                Handlebars.registerHelper('if_eq', function(a, b, opts) {
                    if (opts != "undefined") {
                        if(a == b)
                            return opts.fn(this);
                        else
                            return opts.inverse(this);
                    }
                });
                Handlebars.registerHelper('preferred', function (a, opts) {
                    if (a == "get") {
                        if (panel.preferred) {
                            return opts.fn(this);
                        }else{
                            return opts.inverse(this);
                        }
                    }else {
                        panel.preferred = a;
                    }
                });
                Handlebars.registerHelper('acceptable', function (a, opts) {
                    if (a == "get") {
                        if (panel.acceptable) {
                            return opts.fn(this);
                        }else{
                            return opts.inverse(this);
                        }
                    }else {
                        panel.acceptable = a;
                    }
                });
                Handlebars.registerHelper('included', function (a, opts) {
                    if (a == "get") {
                        if (panel.included) {
                            return opts.fn(this);
                        }else{
                            return opts.inverse(this);
                        }
                    }else {
                        panel.included = a;
                    }
                });
                var context = {
                    options: panel.options,
                    languageName: languageName,
                    divElementId: panel.divElement.id,
                    allDescriptions: allDescriptions
                };
                $("#" + panel.descsPId).html(JST["views/conceptDetailsPlugin/tabs/details/descriptions-panel.hbs"](context));
                if (panel.options.displaySynonyms) {
                    $('#home-descriptions-' + panel.divElement.id).html(homeDescriptionsHtml);
                }

                if (panel.options.displaySynonyms != true) { // hide synonyms
                    $('#' + panel.descsPId).find('.synonym-row').each(function(i, val) {
                        $(val).toggle();
                    });
                    $(this).toggleClass('glyphicon-plus');
                    $(this).toggleClass('glyphicon-minus');
                }
                $("#" + panel.descsPId + "-descButton").disableTextSelect();
                $("#" + panel.descsPId + "-descButton").click(function() {
                    table = $(this).closest("table").first();
                    $(this).toggleClass('glyphicon-plus');
                    $(this).toggleClass('glyphicon-minus');
                    table.find('.synonym-row').each(function(i, val) {
                        $(val).toggle();
                    });
                });
                $('#' + panel.descsPId).find("[rel=tooltip-right]").tooltip({ placement: 'right'});



            // load relationships panel and home parents/roles
            if (panel.options.selectedView == "inferred") {
                $('#home-' + panel.divElement.id + '-viewLabel').html("<span class='i18n' data-i18n-id='i18n_inferred_view'>Inferred view</span>");
                $('#home-' + panel.divElement.id + '-diagram-viewLabel').html("<span class='i18n' data-i18n-id='i18n_inferred_view'>Inferred view</span>");
            } else {
                $('#home-' + panel.divElement.id + '-viewLabel').html("<span class='i18n' data-i18n-id='i18n_stated_view'>Stated view</span>");
                $('#home-' + panel.divElement.id + '-diagram-viewLabel').html("<span class='i18n' data-i18n-id='i18n_stated_view'>Stated view</span>");
            }
            panel.relsPId = divElement.id + "-rels-panel";
            panel.statedParents = [];
            panel.inferredParents = [];
            panel.statedRoles = [];
            panel.inferredRoles = [];


            if (firstMatch.relationships){
                firstMatch.relationships.sort(function(a, b) {
                    if (a.groupId < b.groupId) {
                        return -1;
                    } else if (a.groupId > b.groupId) {
                        return 1;
                    } else {
                        if (a.type.conceptId == 116680003) {
                            return -1;
                        }
                        if (b.type.conceptId == 116680003) {
                            return 1;
                        }
                        if (a.target.defaultTerm < b.target.defaultTerm)
                            return -1;
                        if (a.target.defaultTerm > b.target.defaultTerm)
                            return 1;
                        return 0;
                    }
                });
            }
            if (firstMatch.statedRelationships){
                firstMatch.statedRelationships.sort(function(a, b) {
                    if (a.groupId < b.groupId) {
                        return -1;
                    } else if (a.groupId > b.groupId) {
                        return 1;
                    } else {
                        if (a.type.conceptId == 116680003) {
                            return -1;
                        }
                        if (b.type.conceptId == 116680003) {
                            return 1;
                        }
                        if (a.target.defaultTerm < b.target.defaultTerm)
                            return -1;
                        if (a.target.defaultTerm > b.target.defaultTerm)
                            return 1;
                        return 0;
                    }
                });
            }
            Handlebars.registerHelper('push', function (element, array){
                array.push(element);
                // return ;
            });
            Handlebars.registerHelper('if_eq', function(a, b, opts) {
                if (opts != "undefined") {
                    if(a == b)
                        return opts.fn(this);
                    else
                        return opts.inverse(this);
                }
            });
            var context = {
                firstMatch: firstMatch,
                inferredParents: panel.inferredParents,
                inferredRoles: panel.inferredRoles,
                statedParents: panel.statedParents,
                statedRoles: panel.statedRoles
            };
            $("#" + panel.relsPId).html(JST["views/conceptDetailsPlugin/tabs/details/rels-panel.hbs"](context));


            panel.inferredParents.sort(function(a, b) {
                if (a.target.defaultTerm < b.target.defaultTerm)
                    return -1;
                if (a.target.defaultTerm > b.target.defaultTerm)
                    return 1;
                return 0;
            });

            panel.statedParents.sort(function(a, b) {
                if (a.target.defaultTerm < b.target.defaultTerm)
                    return -1;
                if (a.target.defaultTerm > b.target.defaultTerm)
                    return 1;
                return 0;
            });

            panel.inferredRoles.sort(function(a, b) {
                if (a.groupId < b.groupId) {
                    return -1;
                } else if (a.groupId > b.groupId) {
                    return 1;
                } else {
                    if (a.target.defaultTerm < b.target.defaultTerm)
                        return -1;
                    if (a.target.defaultTerm > b.target.defaultTerm)
                        return 1;
                    return 0;
                }
            });

            panel.statedRoles.sort(function(a, b) {
                if (a.groupId < b.groupId) {
                    return -1;
                } else if (a.groupId > b.groupId) {
                    return 1;
                } else {
                    if (a.target.defaultTerm < b.target.defaultTerm)
                        return -1;
                    if (a.target.defaultTerm > b.target.defaultTerm)
                        return 1;
                    return 0;
                }
            });

            Handlebars.registerHelper('substr', function (string, start){
                var l = string.lastIndexOf("(") - 1;
                return string.substr(start, l);
            });
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
                    var s = a.lastIndexOf("(");
                    if(s > b)
                        return opts.fn(this);
                    else
                        return opts.inverse(this);
                }
            });
            var context = {
                statedParents: panel.statedParents,
                inferredParents: panel.inferredParents,
                options: panel.options
            };
            $('#home-parents-' + panel.divElement.id).html(JST["views/conceptDetailsPlugin/tabs/home/parents.hbs"](context));
            if (!panel.options.diagrammingMarkupEnabled) {
                $('#home-parents-' + panel.divElement.id).html(panel.stripDiagrammingMarkup($('#home-parents-' + panel.divElement.id).html()));
            }


            Handlebars.registerHelper('eqLastGroup', function (a, opts){
                if(!a == panel.lastGroup)
                    return opts.fn(this);
                else
                    return opts.inverse(this);
            });
            Handlebars.registerHelper('if_eq', function(a, b, opts) {
                if (opts != "undefined") {
                    if(a == b)
                        return opts.fn(this);
                    else
                        return opts.inverse(this);
                }
            });
            Handlebars.registerHelper('removeSemtag', function (term){
                return panel.removeSemtag(term);
            });
            Handlebars.registerHelper('setLastGroup', function (a){
                panel.lastGroup = a;
            });
            Handlebars.registerHelper('lastColor', function (a) {
                if (a == "get") {
                    return panel.color;
                }else {
                    panel.color = a;
                }
            });
            Handlebars.registerHelper('getRandomColor' , function (){
                return getRandomColor();
            });
            var context = {
                options: options,
                statedRoles: panel.statedRoles,
                inferredRoles: panel.inferredRoles
            };
            $('#home-roles-' + panel.divElement.id).html(JST["views/conceptDetailsPlugin/tabs/home/roles.hbs"](context));

            if (!panel.options.diagrammingMarkupEnabled) {
                $('#home-roles-' + panel.divElement.id).html(panel.stripDiagrammingMarkup($('#home-roles-' + panel.divElement.id).html()));
            }


            Handlebars.registerHelper('if_eq', function(a, b, opts) {
                if (opts != "undefined") {
                    if(a == b)
                        return opts.fn(this);
                    else
                        return opts.inverse(this);
                }
            });
            Handlebars.registerHelper('refset', function(type, data, opts){
                if (data == "get"){
                    if (panel.refset[type]) {
                        return opts.fn(this);
                    }else{
                        return opts.inverse(this);
                    }
                }else{
                    panel.refset[type] = data;
                }
            });
            var context = {
                firstMatch: firstMatch
            };
            $('#refsets-' + panel.divElement.id).html(JST["views/conceptDetailsPlugin/tabs/refset.hbs"](context));

            if ($('ul#details-tabs-' + panel.divElement.id + ' li.active').attr('id') == "diagram-tab") {
                $("#diagram-canvas-" + panel.divElement.id).html("");
                drawConceptDiagram(firstMatch, $("#diagram-canvas-" + panel.divElement.id), panel.options);
            }

            $("#diagram-tab-link-" + panel.divElement.id).click(function (e) {
                $("#diagram-canvas-" + panel.divElement.id).html("<i class='glyphicon glyphicon-refresh icon-spin'></i>");
                setTimeout(function () {
                    $("#diagram-canvas-" + panel.divElement.id).html("");
                    drawConceptDiagram(firstMatch, $("#diagram-canvas-" + panel.divElement.id), panel.options);
                }, 1000)

            });

            $('.more-fields-button').disableTextSelect();
            $('.more-fields-button').popover();

            if (panel.options.selectedView == "stated") {
                $('#' + panel.relsPId).find('.inferred-rel').each(function(i, val) {
                    $(val).toggle();
                });
            } else if (panel.options.selectedView == "inferred") {
                $('#' + panel.relsPId).find('.stated-rel').each(function(i, val) {
                    $(val).toggle();
                });
            } else if (panel.options.selectedView != "all") {
                // show all
            }
            $( "span[draggable='true']" ).tooltip({
                placement : 'left auto',
                trigger: 'hover',
                title: i18n_drag_this,
                animation: true,
                delay: 500
            });
            if (typeof(switchLanguage) == "function") {
                switchLanguage(selectedLanguage, selectedFlag, false);
            }
            conceptRequested = 0;


        }).fail(function() {
            $('#' + panel.attributesPId).html("<div class='alert alert-danger'><span class='i18n' data-i18n-id='i18n_ajax_failed'><strong>Error</strong> while retrieving data from server...</span></div>");
            $('#' + panel.descsPId).html("");
            $('#' + panel.relsPId).html("");
            $('#' + panel.relsPId).html("");
        });
//        if (typeof xhr != "undefined") {
//            console.log("aborting call...");
//
//        }
        if (panel.options.displayChildren == false) {
            $('#' + panel.childrenPId).html("");
            $('#' + panel.childrenPId).hide();
        } else {
            $('#' + panel.childrenPId).show();
            if (xhrChildren != null) {
                xhrChildren.abort();
                console.log("aborting children call...");
            }
            xhrChildren = $.getJSON(options.serverUrl + "/" + options.edition + "/" + options.release + "/concepts/" + panel.conceptId + "/children?form=inferred", function(result) {
                //$.getJSON(panel.url + "rest/browser/concepts/" + panel.conceptId + "/children", function(result) {
            }).done(function(result) {
                // load relationships panel
                xhrChildren = null;
                panel.childrenPId = divElement.id + "-children-panel";

                var context = {
                    childrenResult: result
                };
                $('#' + panel.childrenPId).html(JST["views/conceptDetailsPlugin/tabs/details/children-panel.hbs"](context));
            }).fail(function() {
                $('#' + panel.childrenPId).html("<div class='alert alert-danger'><span class='i18n' data-i18n-id='i18n_ajax_failed'><strong>Error</strong> while retrieving data from server...</span></div>");
            });

        }
    }

    this.stripDiagrammingMarkup = function(htmlString) {
        htmlString = htmlString.replace(new RegExp(panel.escapeRegExp("sct-primitive-concept-compact"), 'g'), "");
        htmlString = htmlString.replace(new RegExp(panel.escapeRegExp("sct-defined-concept-compact"), 'g'), "");
        htmlString = htmlString.replace(new RegExp(panel.escapeRegExp("sct-attribute-compact"), 'g'), "");
        return htmlString;
    }
    this.escapeRegExp = function(str) {
        return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
    }

    this.setSubscription = function(subscriptionPanel) {
        panel.subscription = subscriptionPanel;
        $("#" + panel.divElement.id + "-subscribersMarker").css('color', subscriptionPanel.markerColor);
        $("#" + panel.divElement.id + "-subscribersMarker").show();
    }

    this.clearSubscription = function() {
        panel.subscription = null;
        $("#" + panel.divElement.id + "-subscribersMarker").hide();
    }


    this.setupOptionsPanel = function() {
        optionsHtml = '<form role="form" id="' + panel.divElement.id + '-options-form">';

        optionsHtml = optionsHtml + '<div class="form-group">';
        optionsHtml = optionsHtml + '<div class="checkbox">';
        optionsHtml = optionsHtml + '<label>';
        if (panel.options.displaySynonyms == false) {
            optionsHtml = optionsHtml + '<input type="checkbox" id="' + panel.divElement.id + '-displaySynonymsOption"> <span class="i18n" data-i18n-id="i18n_display_synonyms2">Display Synonyms along with FSN and preferred terms</span>';
        } else {
            optionsHtml = optionsHtml + '<input type="checkbox" id="' + panel.divElement.id + '-displaySynonymsOption" checked> <span class="i18n" data-i18n-id="i18n_display_synonyms2">Display Synonyms along with FSN and preferred terms</span>';
        }
        optionsHtml = optionsHtml + '</label>';
        optionsHtml = optionsHtml + '</div>';

        optionsHtml = optionsHtml + '<div class="checkbox">';
        optionsHtml = optionsHtml + '<label>';
        if (panel.options.showIds == false) {
            optionsHtml = optionsHtml + '<input type="checkbox" id="' + panel.divElement.id + '-displayIdsOption"> <span class="i18n" data-i18n-id="i18n_display_ids">Display Ids</span>';
        } else {
            optionsHtml = optionsHtml + '<input type="checkbox" id="' + panel.divElement.id + '-displayIdsOption" checked> <span class="i18n" data-i18n-id="i18n_display_ids">Display Ids</span>';
        }
        optionsHtml = optionsHtml + '</label>';
        optionsHtml = optionsHtml + '</div>';

        optionsHtml = optionsHtml + '<div class="checkbox">';
        optionsHtml = optionsHtml + '<label>';
        if (panel.options.displayInactiveDescriptions == false) {
            optionsHtml = optionsHtml + '<input type="checkbox" id="' + panel.divElement.id + '-displayInactiveDescriptionsOption"> <span class="i18n" data-i18n-id="i18n_display_inactive_descriptions">Display inactive descriptions</span>';
        } else {
            optionsHtml = optionsHtml + '<input type="checkbox" id="' + panel.divElement.id + '-displayInactiveDescriptionsOption" checked> <span class="i18n" data-i18n-id="i18n_display_inactive_descriptions">Display inactive descriptions</span>';
        }
        optionsHtml = optionsHtml + '</label>';
        optionsHtml = optionsHtml + '</div>';

        optionsHtml = optionsHtml + '<div class="checkbox">';
        optionsHtml = optionsHtml + '<label>';
        if (panel.options.hideNotAcceptable == false) {
            optionsHtml = optionsHtml + '<input type="checkbox" id="' + panel.divElement.id + '-hideNotAcceptableOption"> <span class="i18n" data-i18n-id="i18n_hide_not_acceptable">Hide descriptions with no acceptability</span>';
        } else {
            optionsHtml = optionsHtml + '<input type="checkbox" id="' + panel.divElement.id + '-hideNotAcceptableOption" checked> <span class="i18n" data-i18n-id="i18n_hide_not_acceptable">Hide descriptions with no acceptability</span>';
        }
        optionsHtml = optionsHtml + '</label>';
        optionsHtml = optionsHtml + '</div>';

        optionsHtml = optionsHtml + '<div class="checkbox">';
        optionsHtml = optionsHtml + '<label>';
        if (panel.options.diagrammingMarkupEnabled == false) {
            optionsHtml = optionsHtml + '<input type="checkbox" id="' + panel.divElement.id + '-diagrammingMarkupEnabledOption"> <span class="i18n" data-i18n-id="i18n_diagramming_markup_enabled">Diagramming Guideline colors enabled</span>';
        } else {
            optionsHtml = optionsHtml + '<input type="checkbox" id="' + panel.divElement.id + '-diagrammingMarkupEnabledOption" checked> <span class="i18n" data-i18n-id="i18n_diagramming_markup_enabled">Diagramming Guideline colors enabled</span>';
        }
        optionsHtml = optionsHtml + '</label>';
        optionsHtml = optionsHtml + '</div>';
        optionsHtml = optionsHtml + '</div>';

        optionsHtml = optionsHtml + '<div class="form-group">';
        optionsHtml = optionsHtml + '<label for="selectedRelsView"><span class="i18n" data-i18n-id="i18n_rels_view">Relationships View</span></label>';
        optionsHtml = optionsHtml + '<select class="form-control" id="' + panel.divElement.id + '-relsViewOption">';
        if (typeof i18n_inferred == "undefined") {
            i18n_inferred = "Inferred";
        }
        if (typeof i18n_stated == "undefined") {
            i18n_stated = "Stated";
        }
        if (typeof i18n_all == "undefined") {
            i18n_all = "All";
        }
        if (panel.options.selectedView == "stated") {
            optionsHtml = optionsHtml + '<option value="stated" selected>' + i18n_stated + '</option>';
        } else {
            optionsHtml = optionsHtml + '<option value="stated">' + i18n_stated + '</option>';
        }
        if (panel.options.selectedView == "inferred") {
            optionsHtml = optionsHtml + '<option value="inferred" selected>' + i18n_inferred + '</option>';
        } else {
            optionsHtml = optionsHtml + '<option value="inferred">' + i18n_inferred + '</option>';
        }
        if (panel.options.selectedView == "all") {
            optionsHtml = optionsHtml + '<option value="all" selected>' + i18n_all + '</option>';
        } else {
            optionsHtml = optionsHtml + '<option value="all">' + i18n_all + '</option>';
        }
        optionsHtml = optionsHtml + '</select>';
        optionsHtml = optionsHtml + '</div>';

        optionsHtml = optionsHtml + '<div class="form-group">';
        optionsHtml = optionsHtml + '<label for="' + panel.divElement.id + '-langRefsetOption"><span class="i18n" data-i18n-id="i18n_language_refset">Language Refset</span></label>';
        optionsHtml = optionsHtml + '<select class="form-control" id="' + panel.divElement.id + '-langRefsetOption">';
        if (panel.options.langRefset == "900000000000508004") {
            optionsHtml = optionsHtml + '<option value="900000000000508004" selected>GB Language Refset</option>';
        } else {
            optionsHtml = optionsHtml + '<option value="900000000000508004">GB Language Refset</option>';
        }
        if (panel.options.langRefset == "900000000000509007") {
            optionsHtml = optionsHtml + '<option value="900000000000509007" selected>US Language Refset</option>';
        } else {
            optionsHtml = optionsHtml + '<option value="900000000000509007">US Language Refset</option>';
        }
        if (panel.options.langRefset == "450828004") {
            optionsHtml = optionsHtml + '<option value="450828004" selected>ES Language Refset</option>';
        } else {
            optionsHtml = optionsHtml + '<option value="450828004">ES Language Refset</option>';
        }
        if (panel.options.langRefset == "554461000005103") {
            optionsHtml = optionsHtml + '<option value="554461000005103" selected>DA Language Refset</option>';
        } else {
            optionsHtml = optionsHtml + '<option value="554461000005103">DA Language Refset</option>';
        }
        if (panel.options.langRefset == "46011000052107") {
            optionsHtml = optionsHtml + '<option value="46011000052107" selected>SV Language Refset</option>';
        } else {
            optionsHtml = optionsHtml + '<option value="46011000052107">SV Language Refset</option>';
        }
        optionsHtml = optionsHtml + '</select>';
        optionsHtml = optionsHtml + '</div>';
        optionsHtml = optionsHtml + '</form>';
        $("#" + panel.divElement.id + "-modal-body").html(optionsHtml);
    }

    this.readOptionsPanel = function() {
        panel.options.displaySynonyms = $("#" + panel.divElement.id + "-displaySynonymsOption").is(':checked');
        panel.options.showIds = $("#" + panel.divElement.id + "-displayIdsOption").is(':checked');
        panel.options.displayChildren = $("#" + panel.divElement.id + "-childrenOption").is(':checked');
        panel.options.hideNotAcceptable = $("#" + panel.divElement.id + "-hideNotAcceptableOption").is(':checked');
        panel.options.displayInactiveDescriptions = $("#" + panel.divElement.id + "-displayInactiveDescriptionsOption").is(':checked');
        panel.options.diagrammingMarkupEnabled = $("#" + panel.divElement.id + "-diagrammingMarkupEnabledOption").is(':checked');
        panel.options.selectedView = $("#" + panel.divElement.id + "-relsViewOption").val();
        panel.options.langRefset = $("#" + panel.divElement.id + "-langRefsetOption").val();
    }

    this.removeSemtag = function(term) {
        if (term.lastIndexOf("(") > 0) {
            return term.substr(0, term.lastIndexOf("(")-1)
        } else {
            return term;
        }
    }
}

function updateCD(divElementId, conceptId) {
    $.each(componentsRegistry, function(i, field) {
        //console.log(field.divElement.id + ' == ' + divElementId.id);
        if (field.divElement.id == divElementId) {
            field.conceptId = conceptId;
            field.updateCanvas();
        }
    });
    $('.history-button').popover('hide');
}

function cancelSubscription(divElementId1, divElementId2) {
    var d1;
    var d2;
    $.each(componentsRegistry, function(i, field) {
        if (field.divElement.id == divElementId1) {
            d1 = field;
        } else if (field.divElement.id == divElementId2) {
            d2 = field;
        }
    });
    d1.unsubscribe(d2);
    $(d2.divElement).find('.linker-button').popover('toggle');
}

function getRandomColor() {
    var letters = '0123456789ABCDEF'.split('');
    var color = '#';
    for (var i = 0; i < 6; i++ ) {
        color += letters[Math.round(Math.random() * 15)];
    }
    return color;
}

function allowDrop(ev) {
    ev.preventDefault();
}

function drag(ev, id) {
    $.each(ev.target.attributes, function (){
        if (this.name.substr(0, 4) == "data"){
            ev.dataTransfer.setData(this.name.substr(5), this.value);
        }
    });
    ev.dataTransfer.setData("divElementId", id);
}

function dropC(ev, id) {
    ev.preventDefault();
    var conceptId = ev.dataTransfer.getData("concept-id");
    var panelD = ev.dataTransfer.getData("panel");
    var divElementID = id;
    var panelAct;
    $.each(componentsRegistry, function (i, field){
        if (field.divElement.id == divElementID){
            panelAct = field;
        }
    });
    if (!conceptId) {
        if (!panelD) {
        } else {
            $.each(componentsRegistry, function(i, field) {
                if (field.divElement.id == panelD) {
                    if (field.type == "search" || field.type == "taxonomy") {
                        field.subscribe(panelAct);
                    }
                }
            });
        }
    } else {
        if (panelAct.conceptId != conceptId) {
            panelAct.conceptId = conceptId;
            panelAct.updateCanvas();
        }
    }
}

(function($) {
    $.fn.addConceptDetails = function(conceptId, options) {
        this.filter("div").each(function() {
            var cd = new conceptDetails(this, conceptId, options);
            cd.setupCanvas();
        });
    };
}(jQuery));

$(document).keypress(function(event) {
    if (event.which == '13') {
        event.preventDefault();
    }
}
);




function drawConceptDiagram (concept, div, options) {
    var svgIsaModel = [];
    var svgAttrModel = [];
    if (options.selectedView == "stated") {
        $.each(concept.statedRelationships, function(i, field) {
            if (field.active == true) {
                if (field.type.conceptId == 116680003) {
                    svgIsaModel.push(field);
                } else {
                    svgAttrModel.push(field);
                }
            }
        });
    } else {
        $.each(concept.relationships, function(i, field) {
            if (field.active == true) {
                if (field.type.conceptId == 116680003) {
                    svgIsaModel.push(field);
                } else {
                    svgAttrModel.push(field);
                }
            }
        });
    }
    var parentDiv = div;

    parentDiv.svg('destroy');
    parentDiv.svg({
        settings: {
            width: '1000px',
            height: '2000px'}});
    var svg = parentDiv.svg('get');
    loadDefs(svg);
    var x = 10;
    var y = 10;
    var sctClass = "";
    if (concept.definitionStatus == "Primitive") {
        sctClass = "sct-primitive-concept";
    } else {
        sctClass = "sct-defined-concept";
    }
    //console.log("In draw: " + concept.defaultTerm + " " + concept.conceptId + " " + sctClass);
    var rect1 = drawSctBox(svg, x, y, concept.defaultTerm, concept.conceptId, sctClass);
    x = x + 90;
    y = y + rect1.getBBox().height + 40;
    var circle1;
    if (concept.definitionStatus == "Primitive") {
        circle1 = drawSubsumedByNode(svg, x, y);
    } else {
        circle1 = drawEquivalentNode(svg, x, y);
    }
    connectElements(svg, rect1, circle1, 'bottom-50', 'left');
    x = x + 55;
    var circle2 = drawConjunctionNode(svg, x, y);
    connectElements(svg, circle1, circle2, 'right', 'left', 'LineMarker');
    x = x + 40;
    y = y - 18;
    // load stated parents
    sctClass = "sct-defined-concept";
    $.each(svgIsaModel, function(i, relationship) {
        if (relationship.target.definitionStatus == "Primitive") {
            sctClass = "sct-primitive-concept";
        } else {
            sctClass = "sct-defined-concept";
        }
        var rectParent = drawSctBox(svg, x, y, relationship.target.defaultTerm, relationship.target.conceptId, sctClass);
        // $("#" + rectParent.id).css({"top":
        // (rectParent.outerHeight()/2) + "px"});
        connectElements(svg, circle2, rectParent, 'center', 'left', 'ClearTriangle');
        y = y + rectParent.getBBox().height + 25;
    });

    // load ungrouped attributes
    var maxRoleNumber = 0;
    $.each(svgAttrModel, function(i, relationship) {
        if (relationship.target.definitionStatus == "Primitive") {
            sctClass = "sct-primitive-concept";
        } else {
            sctClass = "sct-defined-concept";
        }
        if (relationship.groupId == 0) {
            var rectAttr = drawSctBox(svg, x, y, relationship.type.defaultTerm,relationship.type.conceptId, "sct-attribute");
            connectElements(svg, circle2, rectAttr, 'center', 'left');
            var rectTarget = drawSctBox(svg, x + rectAttr.getBBox().width + 50, y, relationship.target.defaultTerm,relationship.target.conceptId, sctClass);
            connectElements(svg, rectAttr, rectTarget, 'right', 'left');
            y = y + rectTarget.getBBox().height + 25;
        } else {
            if (relationship.groupId > maxRoleNumber) {
                maxRoleNumber = relationship.groupId;
            }
        }
    });
    y = y + 15;
    for (var i = 1; i <= maxRoleNumber; i++) {
        var groupNode = drawAttributeGroupNode(svg, x, y);
        connectElements(svg, circle2, groupNode, 'center', 'left');
        var conjunctionNode = drawConjunctionNode(svg, x + 55, y);
        connectElements(svg, groupNode, conjunctionNode, 'right', 'left');
        $.each(svgAttrModel, function(m, relationship) {
            if (relationship.groupId == i) {
                if (relationship.target.definitionStatus == "Primitive") {
                    sctClass = "sct-primitive-concept";
                } else {
                    sctClass = "sct-defined-concept";
                }
                var rectRole = drawSctBox(svg, x + 85, y - 18, relationship.type.defaultTerm, relationship.type.conceptId,"sct-attribute");
                connectElements(svg, conjunctionNode, rectRole, 'center', 'left');
                var rectRole2 = drawSctBox(svg, x + 85 + rectRole.getBBox().width + 30, y - 18, relationship.target.defaultTerm,relationship.target.conceptId, sctClass);
                connectElements(svg, rectRole, rectRole2, 'right', 'left');
                y = y + rectRole2.getBBox().height + 25;
            }
        });
    }
    var svgCode = '<?xml version="1.0" encoding="UTF-8" standalone="no"?>' + parentDiv.html();
    svgCode = svgCode.substr(0, svgCode.indexOf("svg") + 4) +
        ' xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:cc="http://web.resource.org/cc/" xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" xmlns:svg="http://www.w3.org/2000/svg" xmlns="http://www.w3.org/2000/svg" ' +
        svgCode.substr(svgCode.indexOf("svg") + 5)
    var b64 = Base64.encode(svgCode);
    $(div).prepend($("<a href-lang='image/svg+xml' href='data:image/svg+xml;base64,\n"+b64+"' download='diagram.svg'>Download</a>"));

}

function saveAsPng(svg) {
    //Create PNG Image
    //Get the svg
    //Create the canvas element
    var canvas = document.createElement('canvas');
    canvas.id = "canvas";
    document.body.appendChild(canvas);

    //Load the canvas element with our svg
    canvg(document.getElementById('canvas'), svg);

    //Save the svg to png
    Canvas2Image.saveAsPNG(canvas);

    //Clear the canvas
    canvas.width = canvas.width;
}
/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

function searchPanel(divElement, options) {
    var thread = null;
    var panel = this;
    this.subscribers = [];
    var lastT = "";
    var xhr = null;
    if (typeof componentsRegistry == "undefined") {
        componentsRegistry = [];
    }

    this.markerColor = 'black';
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

    this.history = [];
    this.setupCanvas = function () {
        var context = {
            divElementId: panel.divElement.id
        };
        $(divElement).html(JST["views/searchPlugin/main.hbs"](context));

        $('#' + panel.divElement.id + '-searchBox').keyup(function () {
            clearTimeout(thread);
            var $this = $(this);
            thread = setTimeout(function () {
                panel.search($this.val(),0,100,false);
            }, 500);
        });
        $("#" + panel.divElement.id + "-linkerButton").disableTextSelect();
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
            console.log("Semtag click: " + $(this).html());
        });

        //$("#" + panel.divElement.id + "-searchConfigBar").slideUp('fast');
        if (options.searchMode != "fullText") {
            $("#" + panel.divElement.id + '-navLanguageLabel').closest('a').hide();
        }

        $("#" + panel.divElement.id + "-configButton").click(function (event) {
            $("#" + panel.divElement.id + "-searchConfigBar").slideToggle('slow');
        });

        if (typeof panel.options.closeButton != "undefined" && panel.options.closeButton == false) {
            $("#" + panel.divElement.id + "-closeButton").hide();
        }

        if (typeof panel.options.linkerButton != "undefined" && panel.options.linkerButton == false) {
            $("#" + panel.divElement.id + "-linkerButton").hide();
        }

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
        $("#" + panel.divElement.id + "-linkerButton").tooltip({
            placement : 'left',
            trigger: 'hover',
            title: i18n_panel_links,
            animation: true,
            delay: 1000
        });
        $("#" + panel.divElement.id + "-apply-button").click(function () {
            panel.readOptionsPanel();
            var searchTerm = $('#' + panel.divElement.id + '-searchBox').val();
            console.log("searchTerm: " + searchTerm);
            if (searchTerm.length > 0) {
                panel.search(searchTerm + " ",0,100,false);
            }
        });
        $("#" + panel.divElement.id + "-clearButton").click(function () {
            panel.options.semTagFilter = "none";
            panel.options.langFilter = "none";
            $('#' + panel.divElement.id + '-searchBox').val('');
            $('#' + panel.divElement.id + '-searchFilters').html("");
            $('#' + panel.divElement.id + '-resultsTable').html("");
            $('#' + panel.divElement.id + '-searchBar').html("");
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
        $("#" + panel.divElement.id + "-linkerButton").click(function (event) {
            $("#" + panel.divElement.id + "-linkerButton").popover({
                trigger: 'manual',
                placement: 'bottomRight',
                html: true,
                content: function () {
                    var linkerHtml = '<div class="text-center text-muted"><em><span class="i18n" data-i18n-id="i18n_drag_to_link">Drag to link with other panels</span><br>';
                    if (panel.subscribers.length == 1) {
                        linkerHtml = linkerHtml + panel.subscribers.length + ' link established</em></div>';
                    } else {
                        linkerHtml = linkerHtml + panel.subscribers.length + ' links established</em></div>';
                    }
                    linkerHtml = linkerHtml + '<div class="text-center"><a href="javascript:void(0);" onclick="clearSearchPanelSubscriptions(\'' + panel.divElement.id + '\');"><span class="i18n" data-i18n-id="i18n_clear_links">Clear links</span></a></div>';
                    return linkerHtml;
                }
            });
            $("#" + panel.divElement.id + "-linkerButton").popover('toggle');
        });

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
    };

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
            $("#" + panel.divElement.id + '-navStatusFilterLabel').html(i18n_active_and_inactive);
        } else if (panel.options.statusSearchFilter == 'inactiveOnly') {
            $("#" + panel.divElement.id + '-navStatusFilterLabel').html(i18n_inactive_only);
        } else {
            panel.options.statusSearchFilter = 'activeOnly';
            $("#" + panel.divElement.id + '-navStatusFilterLabel').html(i18n_active_only);
        }
        var searchTerm = $('#' + panel.divElement.id + '-searchBox').val();
        if (searchTerm.length > 0) {
            panel.search(searchTerm,0,100,true);
        }
    }

    this.handlePanelDropEvent = function (event, ui) {
        var draggable = ui.draggable;
        if (!draggable.attr('data-panel')) {
            //console.log("ignore");
        } else {
            //console.log("OK : " + draggable.attr('data-panel'));
            $.each(componentsRegistry, function (i, field) {
                if (field.divElement.id == draggable.attr('data-panel')) {
                    if (field.type == "concept-details") {
                        panel.subscribe(field);
                    }
                }
            });
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
                if (t != lastT) {
                    panel.options.semTagFilter = "none";
                    panel.options.langFilter = "none";
                }
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
                    console.log("aborting call...");
                }
                $('#' + panel.divElement.id + '-searchBar').html("<span class='text-muted'>Searching..</span>");
                //console.log("panel.options.searchMode " + panel.options.searchMode);
                t = t.trim();
                if (isNumber(t)) {
                    if (t.substr(-2, 1) == "0") {
                        // Search conceptId
                        xhr = $.getJSON(options.serverUrl + "/" + options.edition + "/" + options.release + "/concepts/" + t,function (result) {

                        }).done(function (result) {
                            Handlebars.registerHelper('shown', function(data, opts){
                                if (data == "get"){
                                    if (panel.shown0) {
                                        return opts.fn(this);
                                    }else{
                                        return opts.inverse(this);
                                    }
                                }else{
                                    panel.shown0 = data;
                                }
                            });
                            Handlebars.registerHelper('if_eq', function(a, b, opts) {
                                if (opts != "undefined") {
                                    if(a == b)
                                        return opts.fn(this);
                                    else
                                        return opts.inverse(this);
                                }
                            });
                            var res={};
                            res.descriptions = [];
                            $.each(result.descriptions, function (i, field){
                                var aux=field;
                                if(field.active){
                                    if (panel.options.statusSearchFilter=="activeOnly"){
                                        res.descriptions.push(aux);
                                    }
                                    if (panel.options.statusSearchFilter=="activeAndInactive"){
                                        res.descriptions.push(aux);
                                    }
                                }else{
                                    aux.danger = true;
                                    if (panel.options.statusSearchFilter=="inactiveOnly"){
                                        res.descriptions.push(aux);
                                    }
                                    if (panel.options.statusSearchFilter=="activeAndInactive"){
                                        res.descriptions.push(aux);
                                    }
                                }
                            });
                            result.descriptions = res.descriptions;
                            var context = {
                                result: result
                            };

                            $('#' + panel.divElement.id + '-resultsTable').html(JST["views/searchPlugin/body/0.hbs"](context));
                            $('#' + panel.divElement.id + '-searchBar').html("<span class='text-muted'></span>");
                            $('#' + panel.divElement.id + '-resultsTable').find(".result-item").click(function (event) {
                                $.each(panel.subscribers, function (i, field) {
                                    //console.log("Notify to " + field.divElement.id + " selected " + $(event.target).attr('data-concept-id'));
                                    field.conceptId = $(event.target).attr('data-concept-id');
                                    field.updateCanvas();
                                });
                            });
                        });
                    } else if (t.substr(-2, 1) == "1") {
                        xhr = $.getJSON(options.serverUrl + "/" + options.edition + "/" + options.release + "/descriptions/" + t,function (result) {

                        }).done(function (result) {
                            Handlebars.registerHelper('if_eq', function(a, b, opts) {
                                if (opts != "undefined") {
                                    if(a == b)
                                        return opts.fn(this);
                                    else
                                        return opts.inverse(this);
                                }
                            });
                            var context = {
                                result: result
                            };
                            $('#' + panel.divElement.id + '-resultsTable').html(JST["views/searchPlugin/body/1.hbs"](context));
                            $('#' + panel.divElement.id + '-searchBar').html("<span class='text-muted'></span>");
                            $('#' + panel.divElement.id + '-resultsTable').find(".result-item").click(function (event) {
                                $.each(panel.subscribers, function (i, field) {
                                    //console.log("Notify to " + field.divElement.id + " selected " + $(event.target).attr('data-concept-id'));
                                    field.conceptId = $(event.target).attr('data-concept-id');
                                    field.updateCanvas();
                                });
                            });
                        });
                    } else {
                        resultsHtml = resultsHtml + "<tr><td class='text-muted'>No results</td></tr>";
                        $('#' + panel.divElement.id + '-resultsTable').html(resultsHtml);
                        $('#' + panel.divElement.id + '-searchBar').html("<span class='text-muted'></span>");
                    }
                } else {
                    if (panel.options.searchMode == "partialMatching") {
                        t = t.toLowerCase();
                    }
                    var startTime = Date.now();
                    var searchUrl = options.serverUrl + "/" + options.edition + "/" + options.release + "/descriptions?query=" + t + "&limit=50&searchMode=" + panel.options.searchMode + "&lang=" + panel.options.searchLang + "&statusFilter=" + panel.options.statusSearchFilter + "&skipTo=" + skipTo + "&returnLimit=" + returnLimit;
                    if (panel.options.semTagFilter != "none") {
                        searchUrl = searchUrl + "&semanticFilter=" + panel.options.semTagFilter;
                    }
                    if (panel.options.langFilter != "none") {
                        searchUrl = searchUrl + "&langFilter=" + panel.options.langFilter;
                    }
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
                        var context = {
                            result: result,
                            elapsed: elapsed,
                            divElementId: panel.divElement.id,
                            options: panel.options
                        };
                        $('#' + panel.divElement.id + '-searchBar').html(JST["views/searchPlugin/body/bar.hbs"](context));
                        $("#" + panel.divElement.id + '-searchBar').find('.semtag-link').click(function (event) {
                            panel.options.semTagFilter = $(event.target).attr('data-semtag');
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
                        if (result.details) {
                            var searchComment = "<span class='text-muted'>" + result.details.total + " matches found in " + elapsed + " seconds.</span>";
                        }
                        xhr = null;
                        var matchedDescriptions = result.matches;
                        //console.log(JSON.stringify(result));
                        var remaining = result.details.total - (skipTo + returnLimit);

//                        if (!matchedDescriptions || matchedDescriptions.length <= 0) {
//                            resultsHtml = resultsHtml + "<tr><td class='text-muted'>No results</td></tr>";
//                            $('#' + panel.divElement.id + '-resultsTable').html(resultsHtml);
//                        } else {
//                            var searchFiltersHtml = "<span class='pull right'><a class='btm btn-xs' style='margin: 3px; color: #777; background-color: #fff; border: 1px #ccc solid; margin-left: 25px;' data-toggle='collapse' href='#" + panel.divElement.id + "-searchFiltersPanel'><span class='i18n' data-i18n-id='i18n_filters'>Filters</span></a>";
//                            if (panel.options.semTagFilter != "none") {
//                                searchFiltersHtml = searchFiltersHtml + "&nbsp;&nbsp;<span class='label label-danger'>" + panel.options.semTagFilter + "&nbsp;<a href='javascript:void(0);' style='color: white;text-decoration: none;' class='remove-semtag'>&times;</a></span>&nbsp;&nbsp;";
//                            }
//                            if (panel.options.langFilter != "none") {
//                                searchFiltersHtml = searchFiltersHtml + "&nbsp;&nbsp;<span class='label label-danger'>" + panel.options.langFilter + "&nbsp;<a href='javascript:void(0);' style='color: white;text-decoration: none;' class='remove-lang'>&times;</a></span>&nbsp;&nbsp;";
//                            }
//                            searchFiltersHtml = searchFiltersHtml + "</span><div id='" + panel.divElement.id + "-searchFiltersPanel' class='panel-collapse collapse'>";
//                            searchFiltersHtml = searchFiltersHtml + "<div class='tree'><ul><li><a>Filter results by Language</a><ul>";
//                            for(var key in result.filters.lang) {
//                                searchFiltersHtml = searchFiltersHtml + "<li><a class='lang-link' href='javascript:void(0);' data-lang='" + key + "'>" + key + " (" + result.filters.lang[key] + ")</a></li>";
//                            }
//                            searchFiltersHtml = searchFiltersHtml + "</ul></li></ul>";
//                            searchFiltersHtml = searchFiltersHtml + "<ul><li><a>Filter results by Semantic Tag</a><ul>";
//                            for(var key in result.filters.semTag) {
//                                searchFiltersHtml = searchFiltersHtml + "<li><a class='semtag-link' href='javascript:void(0);' data-semtag='" + key + "'>" + key + " (" + result.filters.semTag[key] + ")</a></li>";
//                            }
//                            searchFiltersHtml = searchFiltersHtml + "</ul></li></ul></div>";
                            //$('#' + panel.divElement.id + '-searchBar').html($('#' + panel.divElement.id + '-searchBar').html() + searchFiltersHtml);
                        if (panel.options.searchMode == "regex") {
                            result.matches.sort(function (a, b) {
                                if (a.term.length < b.term.length)
                                    return -1;
                                if (a.term.length > b.term.length)
                                    return 1;
                                return 0;
                            });
                        }
//                            $.each(matchedDescriptions, function (i, field) {
//                                resultsHtml = resultsHtml + "<tr class='resultRow selectable-row";
//                                //console.log(field.active + " " + field.conceptActive);
//                                if (field.active == false || field.conceptActive == false) {
//                                    resultsHtml = resultsHtml + " danger";
//                                }
//                                resultsHtml = resultsHtml + "'><td class='col-md-6'><div draggable='true' ondragstart='drag(event)' class='result-item' data-concept-id='" + field.conceptId + "' data-term='" + field.term + "'><a href='javascript:void(0);' style='color: inherit;text-decoration: inherit;'  data-concept-id='" + field.conceptId + "' data-term='" + field.term + "'>" + field.term + "</a></div></td><td class='text-muted small-text col-md-6 result-item'  data-concept-id='" + field.conceptId + "' data-term='" + field.term + "'>" + field.fsn + "</td></tr>";
//                            });
//                            if (remaining > 0) {
//                                resultsHtml = resultsHtml + "<tr class='more-row'><td colspan='2' class='text-center'><button class='btn btn-link' id='" + panel.divElement.id + "-more'>Load " + returnLimit +  " more (" + remaining + " remaining on server)</button></td></tr>"
//                            } else {
//                                resultsHtml = resultsHtml + "<tr class='more-row'><td colspan='2' class='text-center text-muted'>All " + result.details.total + " results are displayed</td></tr>"
//                            }
//                        }
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
                        var context = {
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
                        $("#" + panel.divElement.id + "-more").click(function (event) {
                            panel.search(t, (parseInt(skipTo) + parseInt(returnLimit)), returnLimit, true);
                        });
                        $('#' + panel.divElement.id + '-resultsTable').find(".result-item").click(function (event) {
                            $.each(panel.subscribers, function (i, field) {
                                //console.log("Notify to " + field.divElement.id + " selected " + $(event.target).attr('data-concept-id'));
                                field.conceptId = $(event.target).attr('data-concept-id');
                                field.updateCanvas();
                                lastClickedSctid = $(event.target).attr('data-concept-id');
                                lastClickTime = Date.now();
                            });
                        });

                    }).fail(function () {
                        resultsHtml = resultsHtml + "<tr><td class='text-muted'>No results</td></tr>";
                        $('#' + panel.divElement.id + '-resultsTable').html(resultsHtml);
                    });
                }
            }
        }
    }

    this.subscribe = function (subscriber) {
        var alreadySubscribed = false;
        $.each(panel.subscribers, function (i, field) {
            if (subscriber.divElement.id == field.divElement.id) {
                alreadySubscribed = true;
            }
        });
        if (!alreadySubscribed) {
            if (panel.subscribers.length == 0) {
                if (typeof globalMarkerColor == "undefined") {
                    globalMarkerColor = 'black';
                }
                panel.markerColor = panel.getNextMarkerColor(globalMarkerColor);
                //console.log(panel.markerColor);
                $("#" + panel.divElement.id + "-subscribersMarker").css('color', panel.markerColor);
                $("#" + panel.divElement.id + "-subscribersMarker").show();
            }
            panel.subscribers.push(subscriber);
            subscriber.setSubscription(panel);
        }
    }

    this.unsubscribe = function (subscriber) {
        var indexToRemove = -1;
        var i = 0;
        $.each(panel.subscribers, function (i, field) {
            if (subscriber.divElement.id == field.divElement.id) {
                indexToRemove = i;
            }
            i = i + 1;
        });
        if (indexToRemove > -1) {
            panel.subscribers.splice(indexToRemove, 1);
        }
        if (panel.subscribers.length == 0) {
            $("#" + panel.divElement.id + "-subscribersMarker").hide();
        }
        subscriber.clearSubscription();
    }

    this.unsubscribeAll = function () {
        var subscribersClone = panel.subscribers.slice(0);
        $.each(subscribersClone, function (i, field) {
            panel.unsubscribe(field);
        });
    }

    this.getNextMarkerColor = function (color) {
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
            $("#" + panel.divElement.id + '-searchExample').html("<span class='i18n text-muted' data-i18n-id='i18n_search_examp_1'>" + i18n_search_examp_1  +  "</span> ");
            $("#" + panel.divElement.id + '-navSearchModeLabel').html("<span class='i18n' data-i18n-id='i18n_regex_search_mode'>" + i18n_regex_search_mode  +  "</span>");
        } else if (panel.options.searchMode == "fullText") {
            $("#" + panel.divElement.id + '-searchExample').html("<span class='i18n text-muted' data-i18n-id='i18n_search_examp_2'>" + i18n_search_examp_2  +  "</em></span> ");
            $("#" + panel.divElement.id + '-navSearchModeLabel').html("<span class='i18n' data-i18n-id='i18n_full_text_search_mode'>" + i18n_full_text_search_mode  +  "</span>");
        } else if (panel.options.searchMode == "partialMatching") {
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
/*

 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

var idSequence = 0;

function drawSctBox(svg, x, y, label, sctid, cssClass) {
    //console.log("In svg: " + label + " " + sctid + " " + cssClass);
    // x,y coordinates of the top-left corner
    var testText = "Test";
    if (label && sctid) {
        if (label.length > sctid.toString().length) {
            testText = label;
        } else {
            testText = sctid.toString();
        }
    } else if (label) {
        testText = label;
    } else if (sctid) {
        testText = sctid.toString();
    }
    var tempText = svg.text(x, y , testText, {fontFamily: '"Helvetica Neue",Helvetica,Arial,sans-serif', fontSize: '12', fill: 'black'});
    var textHeight = tempText.getBBox().height;
    var textWidth = tempText.getBBox().width;
    svg.remove(tempText);

    var rect = null;
    var widthPadding = 20;
    var heightpadding = 25;

    if (!sctid || !label) {
        heightpadding = 15;
    }

    if (cssClass == "sct-primitive-concept") {
        rect = svg.rect(x, y, textWidth + widthPadding, textHeight + heightpadding, {id: 'rect'+idSequence, fill: '#99ccff', stroke: '#333', strokeWidth: 2});
    } else if (cssClass == "sct-defined-concept") {
        rect = svg.rect(x-2, y-2, textWidth + widthPadding + 4, textHeight + heightpadding + 4, {fill: 'white', stroke: '#333', strokeWidth: 1});
        var innerRect = svg.rect(x, y, textWidth + widthPadding, textHeight + heightpadding, {id: 'rect'+idSequence, fill: '#ccccff', stroke: '#333', strokeWidth: 1});
    } else if (cssClass == "sct-attribute") {
        rect = svg.rect(x-2, y-2, textWidth + widthPadding + 4, textHeight + heightpadding + 4, 18, 18, {fill: 'white', stroke: '#333', strokeWidth: 1});
        var innerRect = svg.rect(x, y, textWidth + widthPadding, textHeight + heightpadding, 18, 18, {id: 'rect'+idSequence, fill: '#ffffcc', stroke: '#333', strokeWidth: 1});
    }else if (cssClass == "sct-slot") {
        rect = svg.rect(x, y, textWidth + widthPadding, textHeight + heightpadding, {id: 'rect'+idSequence, fill: '#99ccff', stroke: '#333', strokeWidth: 2});
    } else {
        rect = svg.rect(x, y, textWidth + widthPadding, textHeight + heightpadding, {id: 'rect'+idSequence, fill: 'white', stroke: 'black', strokeWidth: 1});
    }

    if (sctid && label) {
        svg.text(x + 10, y + 16, sctid.toString(), {fontFamily: '"Helvetica Neue",Helvetica,Arial,sans-serif', fontSize: '10', fill: 'black'});
        svg.text(x + 10, y + 31, label, {fontFamily: '"Helvetica Neue",Helvetica,Arial,sans-serif', fontSize: '12', fill: 'black'});
    } else if (label) {
        svg.text(x + 10, y + 18, label, {fontFamily: '"Helvetica Neue",Helvetica,Arial,sans-serif', fontSize: '12', fill: 'black'});
    } else if (sctid) {
        svg.text(x + 10, y + 18, sctid.toString(), {fontFamily: '"Helvetica Neue",Helvetica,Arial,sans-serif', fontSize: '12', fill: 'black'});
    }

    idSequence++;
    $('rect').click(function(evt){
        console.log(evt.target);
    });

    return rect;
}

function connectElements(svg, fig1, fig2, side1, side2, endMarker) {
    var rect1cx = fig1.getBBox().x;
    var rect1cy = fig1.getBBox().y;
    var rect1cw = fig1.getBBox().width;
    var rect1ch = fig1.getBBox().height;

    var rect2cx = fig2.getBBox().x;
    var rect2cy = fig2.getBBox().y ;
    var rect2cw = fig2.getBBox().width;
    var rect2ch = fig2.getBBox().height;

    var markerCompensantion1 = 15;
    var markerCompensantion2 = 15;
    
    switch(side1) {
        case 'top':
            originY = rect1cy;
            originX = rect1cx + (rect1cw/2);
            break;
        case 'bottom':
            originY = rect1cy + rect1ch;
            originX = rect1cx + (rect1cw/2);
            break;
        case 'left':
            originX = rect1cx - markerCompensantion1;
            originY = rect1cy + (rect1ch/2);
            break;
        case 'right':
            originX = rect1cx + rect1cw;
            originY = rect1cy + (rect1ch/2);
            break;
        case 'bottom-50':
            originY = rect1cy + rect1ch;
            originX = rect1cx + 40;
            break;
        default:
            originX = rect1cx + (rect1cw/2);
            originY = rect1cy + (rect1ch/2);
            break;
    }
    
    switch(side2) {
        case 'top':
            destinationY = rect2cy;
            destinationX = rect2cx + (rect2cw/2);
            break;
        case 'bottom':
            destinationY = rect2cy + rect2ch;
            destinationX = rect2cx + (rect2cw/2);
            break;
        case 'left':
            destinationX = rect2cx - markerCompensantion2;
            destinationY = rect2cy + (rect2ch/2);
            break;
        case 'right':
            destinationX = rect2cx + rect2cw;
            destinationY = rect2cy + (rect2ch/2);
            break;
        case 'bottom-50':
            destinationY = rect2cy + rect2ch;
            destinationX = rect2cx + 50;
            break;
        default:
            destinationX = rect2cx + (rect2cw/2);
            destinationY = rect2cy + (rect2ch/2);
            break;
    }
    
    if (endMarker == null) endMarker = "BlackTriangle";

    polyline1 = svg.polyline([[originX, originY],
            [originX, destinationY], [destinationX, destinationY]]
        , {id: 'poly1', fill: 'none', stroke: 'black', strokeWidth: 2, 'marker-end': 'url(#' + endMarker + ')'});

}

function loadDefs(svg) {
    var defs = svg.defs('SctDiagramsDefs');
    blackTriangle = svg.marker(defs, 'BlackTriangle', 0, 0, 20, 20, {
        viewBox: '0 0 22 20', refX: '0', refY: '10', markerUnits: 'strokeWidth', markerWidth: '8', markerHeight: '6',
        fill: 'black',stroke: 'black', strokeWidth: 2});
    svg.path(blackTriangle, 'M 0 0 L 20 10 L 0 20 z');
    
    clearTriangle = svg.marker(defs, 'ClearTriangle', 0, 0, 20, 20, {
        viewBox: '0 0 22 20', refX: '0', refY: '10', markerUnits: 'strokeWidth', markerWidth: '8', markerHeight: '8', 
        fill: 'white',stroke: 'black', strokeWidth: 2});
    svg.path(clearTriangle, 'M 0 0 L 20 10 L 0 20 z');

    lineMarker = svg.marker(defs, 'LineMarker', 0, 0, 20, 20, {
        viewBox: '0 0 22 20', refX: '0', refY: '10', markerUnits: 'strokeWidth', markerWidth: '8', markerHeight: '8',
        fill: 'white',stroke: 'black', strokeWidth: 2});
    svg.path(lineMarker, 'M 0 10 L 20 10');
}

function drawAttributeGroupNode(svg, x, y) {
    circle = svg.circle(x, y, 20, {fill: 'white',stroke: 'black', strokeWidth: 2});
    return circle;
}

function drawConjunctionNode(svg, x, y) {
    circle = svg.circle(x, y, 10, {fill: 'black',stroke: 'black', strokeWidth: 2});
    return circle;
}

function drawEquivalentNode(svg, x, y) {
    g = svg.group();
    svg.circle(g, x, y, 20, {fill: 'white',stroke: 'black', strokeWidth: 2});
    svg.line(g, x-7, y-5, x+7, y-5, {stroke: 'black', strokeWidth: 2});
    svg.line(g, x-7, y, x+7, y, {stroke: 'black', strokeWidth: 2});
    svg.line(g, x-7, y+5, x+7, y+5, {stroke: 'black', strokeWidth: 2});
    return g;
}

function drawSubsumedByNode(svg, x, y) {
    g = svg.group();
    svg.circle(g, x, y, 20, {fill: 'white',stroke: 'black', strokeWidth: 2});
    svg.line(g, x-7, y-8, x+7, y-8, {stroke: 'black', strokeWidth: 2});
    svg.line(g, x-7, y+3, x+7, y+3, {stroke: 'black', strokeWidth: 2});
    svg.line(g, x-6, y-8, x-6, y+3, {stroke: 'black', strokeWidth: 2});
    svg.line(g, x-7, y+7, x+7, y+7, {stroke: 'black', strokeWidth: 2});
    return g;
}

function drawSubsumesNode(svg, x, y) {
    g = svg.group();
    svg.circle(g, x, y, 20, {fill: 'white',stroke: 'black', strokeWidth: 2});
    svg.line(g, x-7, y-8, x+7, y-8, {stroke: 'black', strokeWidth: 2});
    svg.line(g, x-7, y+3, x+7, y+3, {stroke: 'black', strokeWidth: 2});
    svg.line(g, x+6, y-8, x+6, y+3, {stroke: 'black', strokeWidth: 2});
    svg.line(g, x-7, y+7, x+7, y+7, {stroke: 'black', strokeWidth: 2});
    return g;
}


/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

function taxonomyPanel(divElement, conceptId, options) {
    var nodeCount = 0;
    var panel = this;
    this.subscribers = [];
    var xhr = null;
    if (typeof componentsRegistry == "undefined") {
        componentsRegistry = [];
    }

    this.markerColor = 'black';
    this.type = "taxonomy";
    this.divElement = divElement;
    this.options = jQuery.extend(true, {}, options);
    var componentLoaded = false;
    $.each(componentsRegistry, function(i, field) {
        if (field.divElement.id == panel.divElement.id) {
            componentLoaded = true;
        }
    });
    if (componentLoaded == false) {
        componentsRegistry.push(panel);
    }

    this.history = [];

    this.setupCanvas = function() {
        var context = {
            divElementId: panel.divElement.id
        };
        $(divElement).html(JST["views/taxonomyPlugin/main.hbs"](context));
        $("#" + panel.divElement.id + "-resetButton").disableTextSelect();
        $("#" + panel.divElement.id + "-linkerButton").disableTextSelect();
        $("#" + panel.divElement.id + "-subscribersMarker").disableTextSelect();
        $("#" + panel.divElement.id + "-configButton").disableTextSelect();
        $("#" + panel.divElement.id + "-collapseButton").disableTextSelect();
        $("#" + panel.divElement.id + "-expandButton").disableTextSelect();
        $("#" + panel.divElement.id + "-closeButton").disableTextSelect();
        $("#" + panel.divElement.id + "-expandButton").hide();
        $("#" + panel.divElement.id + "-subscribersMarker").hide();

        $("#" + panel.divElement.id + "-closeButton").click(function(event) {
            $(divElement).remove();
        });

        $("#" + panel.divElement.id + "-configButton").click(function (event) {
            $("#" + panel.divElement.id + "-taxonomyConfigBar").slideToggle('slow');
        });

        if (typeof panel.options.closeButton != "undefined" && panel.options.closeButton == false) {
            $("#" + panel.divElement.id + "-closeButton").hide();
        }

        if (typeof panel.options.linkerButton != "undefined" && panel.options.linkerButton == false) {
            $("#" + panel.divElement.id + "-linkerButton").hide();
        }

        if (typeof panel.options.subscribersMarker != "undefined" && panel.options.subscribersMarker == false) {
            $("#" + panel.divElement.id + "-subscribersMarker").remove();
        }

        if (typeof panel.options.collapseButton != "undefined" && panel.options.collapseButton == false) {
            $("#" + panel.divElement.id + "-expandButton").hide();
            $("#" + panel.divElement.id + "-collapseButton").hide();
        }

        $("#" + panel.divElement.id + "-expandButton").click(function(event) {
            $("#" + panel.divElement.id + "-panelBody").slideDown("fast");
            $("#" + panel.divElement.id + "-expandButton").hide();
            $("#" + panel.divElement.id + "-collapseButton").show();
        });
        $("#" + panel.divElement.id + "-collapseButton").click(function(event) {
            $("#" + panel.divElement.id + "-panelBody").slideUp("fast");
            $("#" + panel.divElement.id + "-expandButton").show();
            $("#" + panel.divElement.id + "-collapseButton").hide();
        });
        if (typeof i18n_panel_options == "undefined") {
            i18n_panel_options = 'Options';
        }
        $("#" + panel.divElement.id + "-configButton").tooltip({
            placement : 'left',
            trigger: 'hover',
            title: i18n_panel_options,
            animation: true,
            delay: 1000
        });
        if (typeof i18n_reset == "undefined") {
            i18n_reset = 'Reset';
        }
        $("#" + panel.divElement.id + "-resetButton").tooltip({
            placement : 'left',
            trigger: 'hover',
            title: i18n_reset,
            animation: true,
            delay: 1000
        });
        if (typeof i18n_panel_links == "undefined") {
            i18n_panel_links = 'Panel links';
        }
        $("#" + panel.divElement.id + "-linkerButton").tooltip({
            placement : 'left',
            trigger: 'hover',
            title: i18n_panel_links,
            animation: true,
            delay: 1000
        });

        $("#" + panel.divElement.id + "-resetButton").click(function() {
            panel.setupParents([], {conceptId: 138875005, defaultTerm: "SNOMED CT Concept", definitionStatus: "Primitive"});
        });

        $("#" + panel.divElement.id + "-apply-button").click(function() {
            //console.log("apply!");
            panel.readOptionsPanel();
            panel.setupParents([], {conceptId: 138875005, defaultTerm: "SNOMED CT Concept", definitionStatus: "Primitive"});
        });


        $("#" + panel.divElement.id + "-linkerButton").click(function(event) {
            $("#" + panel.divElement.id + "-linkerButton").popover({
                trigger: 'manual',
                placement: 'bottomRight',
                html: true,
                content: function() {
                    linkerHtml = '<div class="text-center text-muted"><em>Drag to link with other panels<br>';
                    if (panel.subscribers.length == 1) {
                        linkerHtml = linkerHtml + panel.subscribers.length + ' link established</em></div>';
                    } else {
                        linkerHtml = linkerHtml + panel.subscribers.length + ' links established</em></div>';
                    }
                    linkerHtml = linkerHtml + '<div class="text-center"><a href="javascript:void(0);" onclick="clearTaxonomyPanelSubscriptions(\'' + panel.divElement.id + '\');">Clear links</a></div>';
                    return linkerHtml;
                }
            });
            $("#" + panel.divElement.id + "-linkerButton").popover('toggle');
        });

        $("#" + panel.divElement.id + "-inferredViewButton").click(function (event) {
            panel.options.selectedView = 'inferred';
            $("#" + panel.divElement.id + '-txViewLabel').html("<span class='i18n' data-i18n-id='i18n_inferred_view'>Inferred view</span>");
            panel.setupParents([], {conceptId: 138875005, defaultTerm: "SNOMED CT Concept", definitionStatus: "Primitive"});
        });

        $("#" + panel.divElement.id + "-statedViewButton").click(function (event) {
            panel.options.selectedView = 'stated';
            $("#" + panel.divElement.id + '-txViewLabel').html("<span class='i18n' data-i18n-id='i18n_stated_view'>Stated view</span>");
            panel.setupParents([], {conceptId: 138875005, defaultTerm: "SNOMED CT Concept", definitionStatus: "Primitive"});
        });
        $("#" + panel.divElement.id + "-inferredViewButton").click();
    }

    this.setupParents = function(parents, focusConcept) {
        var lastParent;
        $.each(parents, function(i, parent){
            lastParent = parent;
        });
        Handlebars.registerHelper('if_eq', function(a, b, opts) {
            if (opts != "undefined") {
                if(a == b)
                    return opts.fn(this);
                else
                    return opts.inverse(this);
            }
        });
        Handlebars.registerHelper('if_gr', function(a,b, opts) {
            if(a > b)
                return opts.fn(this);
            else
                return opts.inverse(this);
        });
        var context = {
            parents: parents,
            focusConcept: focusConcept,
            divElementId: panel.divElement.id
        };
        Handlebars.registerHelper('slice', function (a, b) {
            $("#" + panel.divElement.id + "-panelBody").html($("#" + panel.divElement.id + "-panelBody").html().slice(a, b));
        });
        $("#" + panel.divElement.id + "-panelBody").html(JST["views/taxonomyPlugin/body/parents.hbs"](context));
        $(".treeButton").disableTextSelect();
        $("#" + panel.divElement.id + "-panelBody").unbind("dblclick");
        $("#" + panel.divElement.id + "-panelBody").dblclick(function(event) {
            if ($(event.target).hasClass("treeLabel")) {
                var selectedId = $(event.target).attr('data-concept-id');
                var selectedLabel = $(event.target).attr('data-term');
                if (typeof selectedId != "undefined") {
                    console.log(panel.options.selectedView);
                    $.getJSON(options.serverUrl + "/" + options.edition + "/" + options.release + "/concepts/" + selectedId + "/parents?form=" + panel.options.selectedView, function(result) {
                        // done
                    }).done(function(result) {
                        panel.setupParents(result, {conceptId: selectedId, defaultTerm: selectedLabel, definitionStatus: "Primitive"});
                    }).fail(function() {
                    });
                }
            }
        });
        $("#" + panel.divElement.id + "-panelBody").unbind("click");
        $("#" + panel.divElement.id + "-panelBody").click(function(event) {
            if ($(event.target).hasClass("treeButton")) {
                var conceptId = $(event.target).closest("li").attr('data-concept-id');
                var iconId = panel.divElement.id + "-treeicon-" + conceptId;
                event.preventDefault();
                if ($("#" + iconId).hasClass("glyphicon-chevron-down")) {
                    //console.log("close");
                    $(event.target).closest("li").find("ul").remove();
                    $("#" + iconId).removeClass("glyphicon-chevron-down");
                    $("#" + iconId).addClass("glyphicon-chevron-right");
                } else if ($("#" + iconId).hasClass("glyphicon-chevron-right")){
                    //console.log("open");
                    $("#" + iconId).removeClass("glyphicon-chevron-right");
                    $("#" + iconId).addClass("glyphicon-refresh");
                    $("#" + iconId).addClass("icon-spin");
                    panel.getChildren($(event.target).closest("li").attr('data-concept-id'));
                } else if ($("#" + iconId).hasClass("glyphicon-chevron-up")){
                    $("#" + iconId).removeClass("glyphicon-chevron-up");
                    $("#" + iconId).addClass("glyphicon-refresh");
                    $("#" + iconId).addClass("icon-spin");
                    panel.wrapInParents($(event.target).closest("li").attr('data-concept-id'), $(event.target).closest("li"));
                } else if ($("#" + iconId).hasClass("glyphicon-minus")){
                    $("#" + iconId).removeClass("glyphicon-minus");
                    $("#" + iconId).addClass("glyphicon-chevron-right");
                }
            } else if ($(event.target).hasClass("treeLabel")) {
                var selectedId = $(event.target).attr('data-concept-id');
                if (typeof selectedId != "undefined") {
                    $.each(panel.subscribers, function(i, suscriberPanel) {
                        if (suscriberPanel.conceptId != selectedId) {
                            suscriberPanel.conceptId = selectedId;
                            suscriberPanel.updateCanvas();
                        }
                    });
                }
            }

        });

        var iconId = panel.divElement.id + "-treeicon-" + focusConcept.conceptId;
        $("#" + iconId).removeClass("glyphicon-chevron-right");
        $("#" + iconId).addClass("glyphicon-refresh");
        $("#" + iconId).addClass("icon-spin");
        //console.log("getChildren..." + focusConcept.conceptId);
        panel.getChildren(focusConcept.conceptId);

    };

    this.getChildren = function(conceptId) {
        if (typeof panel.options.selectedView == "undefined") {
            panel.options.selectedView = "inferred";
        }

        if (panel.options.selectedView == "inferred") {
            $("#" + panel.divElement.id + "-txViewLabel").html("<span class='i18n' data-i18n-id='i18n_inferred_view'>Inferred view</span>");
        } else {
            $("#" + panel.divElement.id + "-txViewLabel").html("<span class='i18n' data-i18n-id='i18n_stated_view'>Stated view</span>");
        }

        $.getJSON(options.serverUrl + "/" + options.edition + "/" + options.release + "/concepts/" + conceptId + "/children?form=" + panel.options.selectedView, function(result) {
        }).done(function(result) {
            result.sort(function(a, b) {
                if (a.defaultTerm.toLowerCase() < b.defaultTerm.toLowerCase())
                    return -1;
                if (a.defaultTerm.toLowerCase() > b.defaultTerm.toLowerCase())
                    return 1;
                return 0;
            });
            //console.log(JSON.stringify(result));
            var listIconIds = [];
            //console.log(JSON.stringify(listIconIds));
            var context = {
                result: result,
                divElementId: panel.divElement.id
            };
            Handlebars.registerHelper('if_eq', function(a, b, opts) {
                if (opts != "undefined") {
                    if(a == b)
                        return opts.fn(this);
                    else
                        return opts.inverse(this);
                }
            });
            Handlebars.registerHelper('push', function (element){
                listIconIds.push(element);
            });
            $("#" + panel.divElement.id + "-treeicon-" + conceptId).removeClass("glyphicon-refresh");
            $("#" + panel.divElement.id + "-treeicon-" + conceptId).removeClass("icon-spin");
            if (result.length > 0) {
                $("#" + panel.divElement.id + "-treeicon-" + conceptId).addClass("glyphicon-chevron-down");
            } else {
                $("#" + panel.divElement.id + "-treeicon-" + conceptId).addClass("glyphicon-minus");
            }
            $("#" + panel.divElement.id + "-treenode-" + conceptId).after(JST["views/taxonomyPlugin/body/children.hbs"](context));
            $(".treeButton").disableTextSelect();
        }).fail(function() {
            $("#" + panel.divElement.id + "-treeicon-" + conceptId).removeClass("icon-spin");
            $("#" + panel.divElement.id + "-treeicon-" + conceptId).removeClass("glyphicon-refresh");
            $("#" + panel.divElement.id + "-treeicon-" + conceptId).addClass("glyphicon-minus");
        });
    }

    this.wrapInParents = function(conceptId, liItem) {
        var topUl = $("#" + panel.divElement.id + "-panelBody").find('ul:first');
        $.getJSON(options.serverUrl + "/" + options.edition + "/" + options.release + "/concepts/" + conceptId + "/parents?form=" + panel.options.selectedView, function(parents) {
            // done
        }).done(function(parents) {
            if (parents.length > 0) {
                var firstParent = "empty";
                var parentsStrs = [];
                $.each(parents, function(i, parent) {
                    var parentLiHtml = "<li data-concept-id='" + parent.conceptId + "' data-term='" + parent.defaultTerm + "' class='treeLabel'>";
                    parentLiHtml = parentLiHtml + "<button class='btn btn-link btn-xs treeButton' style='padding:2px'><i class='glyphicon glyphicon-chevron-up treeButton'  id='" + panel.divElement.id + "-treeicon-" + parent.conceptId + "'></i></button>";
                    if (parent.definitionStatus == "Primitive") {
                        parentLiHtml = parentLiHtml + '<span class="badge alert-warning">&nbsp;</span>&nbsp;&nbsp;';
                    } else {
                        parentLiHtml = parentLiHtml + '<span class="badge alert-warning">&equiv;</span>&nbsp;&nbsp;';
                    }
                    parentLiHtml = parentLiHtml + '<a href="javascript:void(0);" style="color: inherit;text-decoration: inherit;"><span data-concept-id="' + parent.conceptId + '" data-term="' + parent.defaultTerm + '" draggable="true" ondragstart="drag(event)" class="treeLabel selectable-row" id="' + panel.divElement.id + '-treenode-' + parent.conceptId + '">' + parent.defaultTerm + '</span></a>';
                    parentLiHtml = parentLiHtml + "</li>";
                    parentsStrs.push(parentLiHtml);
                    if (firstParent == "empty") {
                        firstParent = parent.conceptId;
                    }
                });

                var staticChildren = topUl.children().slice(0);
                topUl.append(parentsStrs[0]);
                $('#' + panel.divElement.id + '-treenode-' + firstParent).closest('li').append("<ul id='parent-ul-id-" + firstParent + "' style='list-style-type: none; padding-left: 15px;'></ul>");
                var newMainChild;
                $.each(staticChildren, function(i, child) {
                    if ($(child).attr('data-concept-id') == conceptId) {
                        newMainChild = $(child);
                        var newUl = $('#' + panel.divElement.id + '-treenode-' + firstParent).closest('li').find('ul:first');
                        newUl.append($(child));
                        $(child).find('i:first').removeClass("glyphicon-chevron-up");
                        $(child).find('i:first').addClass("glyphicon-chevron-down");
                    }
                });
                $.each(staticChildren, function(i, child) {
                    if ($(child).attr('data-concept-id') != conceptId) {
                        $.each($(child).children(), function(i, subchild) {
                            if ($(subchild).is('ul')) {
                                newMainChild.append(subchild);
                            }
                        });
                        $('#' + panel.divElement.id + '-treenode-' +$(child).attr('data-concept-id')).closest('li').remove();
                    }
                });
                $.each(parentsStrs, function(i, parentsStr) {
                    if (parentsStr != parentsStrs[0]) {
                        topUl.prepend(parentsStr);
                    }
                });
                $("#" + panel.divElement.id + "-treeicon-" + conceptId).removeClass("glyphicon-refresh");
                $("#" + panel.divElement.id + "-treeicon-" + conceptId).removeClass("icon-spin");
                $("#" + panel.divElement.id + "-treeicon-" + conceptId).addClass("glyphicon-chevron-down");
            } else {
                $("#" + panel.divElement.id + "-treeicon-" + conceptId).removeClass("glyphicon-refresh");
                $("#" + panel.divElement.id + "-treeicon-" + conceptId).removeClass("icon-spin");
                $("#" + panel.divElement.id + "-treeicon-" + conceptId).addClass("glyphicon-chevron-up");
            }
        }).fail(function() {
        });
    }

    this.setToConcept = function(conceptId, term, definitionStatus) {
        $("#" + panel.divElement.id + "-panelBody").html("<i class='glyphicon glyphicon-refresh icon-spin'></i>");
        console.log(panel.options.selectedView);
        $.getJSON(options.serverUrl + "/" + options.edition + "/" + options.release + "/concepts/" + conceptId + "/parents?form="+panel.options.selectedView, function(result) {
            // done
        }).done(function(result) {
            if (definitionStatus != "Primitive" && definitionStatus != "Fully defined") {
                definitionStatus = "Primitive";
            }
            panel.setupParents(result, {conceptId: conceptId, defaultTerm: term, definitionStatus: definitionStatus});
        }).fail(function() {
        });
    }

    this.handleDropEvent = function(event, ui) {
        var draggable = ui.draggable;

        //console.log(draggable.html() + " |  " + draggable.attr('data-concept-id') + ' was dropped onto me!');
        if (!draggable.attr('data-concept-id')) {
            //console.log("ignore");
        } else {
            var conceptId = draggable.attr('data-concept-id');
            var term = draggable.attr('data-term');
            var definitionStatus = draggable.attr('data-def-status');
            if (panel.options.selectedView == "undefined") {
                panel.options.selectedView = "inferred";
            }
            if (typeof conceptId != "undefined") {
                panel.setToConcept(conceptId, term, definitionStatus);
            }
            $(ui.helper).remove(); //destroy clone
        }


        if (!draggable.attr('data-panel')) {
            //console.log("ignore");
        } else {
            //console.log("OK : " + draggable.attr('data-panel'));
            $.each(componentsRegistry, function(i, field) {
                if (field.divElement.id == draggable.attr('data-panel')) {
                    if (field.type == "concept-details") {
                        panel.subscribe(field);
                    }
                }
            });
        }
    }

    this.subscribe = function(subscriber) {
        var alreadySubscribed = false;
        $.each(panel.subscribers, function(i, field) {
            if (subscriber.divElement.id == field.divElement.id) {
                alreadySubscribed = true;
            }
        });
        if (!alreadySubscribed) {
            if (panel.subscribers.length == 0) {
                if (typeof globalMarkerColor == "undefined") {
                    globalMarkerColor = 'black';
                }
                panel.markerColor = panel.getNextMarkerColor(globalMarkerColor);
                //console.log(panel.markerColor);
                $("#" + panel.divElement.id + "-subscribersMarker").css('color', panel.markerColor);
                $("#" + panel.divElement.id + "-subscribersMarker").show();
            }
            panel.subscribers.push(subscriber);
            subscriber.setSubscription(panel);
        }
    }

    this.unsubscribe = function(subscriber) {
        var indexToRemove = -1;
        var i = 0;
        $.each(panel.subscribers, function(i, field) {
            if (subscriber.divElement.id == field.divElement.id) {
                indexToRemove = i;
            }
            i = i + 1;
        });
        if (indexToRemove > -1) {
            panel.subscribers.splice(indexToRemove, 1);
        }
        if (panel.subscribers.length == 0) {
            $("#" + panel.divElement.id + "-subscribersMarker").hide();
        }
        subscriber.clearSubscription();
    }

    this.unsubscribeAll = function() {
        var subscribersClone = panel.subscribers.slice(0);
        $.each(subscribersClone, function (i, field) {
            panel.unsubscribe(field);
        });
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

    this.setupCanvas();
    if (!conceptId || conceptId == 138875005) {
        this.setupParents([], {conceptId: 138875005, defaultTerm: "SNOMED CT Concept", definitionStatus: "Primitive"});
    } else {
        if (xhr != null) {
            xhr.abort();
            console.log("aborting call...");
        }
        xhr = $.getJSON(options.serverUrl + "/" + options.edition + "/" + options.release + "/concepts/" + conceptId, function(result) {

        }).done(function(result) {
            panel.setToConcept(conceptId, result.defaultTerm);
        }).fail(function() {
            console.log("Error");
        });
    }
}

function clearTaxonomyPanelSubscriptions(divElementId1) {
    var d1;
    $.each(componentsRegistry, function(i, field) {
        if (field.divElement.id == divElementId1) {
            d1 = field;
        }
    });
    d1.unsubscribeAll();
    $("#" + divElementId1).find('.linker-button').popover('toggle');
}

function dropT(ev, id) {
    var divElementId = id;
    var panel;
    var panelD = ev.dataTransfer.getData("panel");
    var conceptId = ev.dataTransfer.getData("concept-id");
    var term = ev.dataTransfer.getData("term");
    var definitionStatus = ev.dataTransfer.getData("def-status");

    $.each(componentsRegistry, function (i, field){
        if (field.divElement.id == divElementId){
            panel = field;
        }
    });

    if (!conceptId) {
        //console.log("ignore");
    } else {
        if (panel.options.selectedView == "undefined") {
            panel.options.selectedView = "inferred";
        }
        if (typeof conceptId != "undefined") {
            panel.setToConcept(conceptId, term, definitionStatus);
        }
        //$(ui.helper).remove(); //destroy clone
    }
    if (!panelD) {
        //console.log("ignore");
    } else {
        //console.log("OK : " + draggable.attr('data-panel'));
        $.each(componentsRegistry, function(i, field) {
            if (field.divElement.id == panelD) {
                if (field.type == "concept-details") {
                    panel.subscribe(field);
                }
            }
        });
    }
}

(function($) {
    $.fn.addTaxonomy = function(options) {
        this.filter("div").each(function() {
            var tx = new conceptDetails(this, options);
        });
    };
}(jQuery));

this["JST"] = this["JST"] || {};

this["JST"]["views/conceptDetailsPlugin/main.hbs"] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, helper, functionType="function", escapeExpression=this.escapeExpression;


  buffer += "<div style='margin: 5px; height:98%; overflow:auto;' class='panel panel-default'>\n    <div class='panel-heading' id='";
  if (helper = helpers.divElementId) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.divElementId); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "-panelHeading'>\n        <button id='";
  if (helper = helpers.divElementId) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.divElementId); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "-subscribersMarker' class='btn btn-link btn-lg' style='padding:2px;position: absolute;top: 1px;left: 0px;'><i class='glyphicon glyphicon-bookmark'></i></button>\n        <div class='row'>\n            <div class='col-md-8' id='";
  if (helper = helpers.divElementId) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.divElementId); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "-panelTitle'>&nbsp&nbsp&nbsp<strong><span class='i18n' data-i18n-id='i18n_concept_details'>Concept Details</span></strong></div>\n            <div class='col-md-4 text-right'>\n                <button id='";
  if (helper = helpers.divElementId) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.divElementId); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "-linkerButton' draggable = \"true\" ondragstart = \"drag(event, '";
  if (helper = helpers.divElementId) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.divElementId); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "')\" class='btn btn-link linker-button' data-panel='";
  if (helper = helpers.divElementId) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.divElementId); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "' style='padding:2px'><i class='glyphicon glyphicon-link'></i></button>\n                <button id='";
  if (helper = helpers.divElementId) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.divElementId); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "-historyButton' class='btn btn-link history-button' style='padding:2px'><i class='glyphicon glyphicon-time'></i></button>\n                <button id='";
  if (helper = helpers.divElementId) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.divElementId); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "-configButton' class='btn btn-link' data-toggle='modal' style='padding:2px' data-target='#";
  if (helper = helpers.divElementId) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.divElementId); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "-configModal'><i class='glyphicon glyphicon-cog'></i></button>\n                <button id='";
  if (helper = helpers.divElementId) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.divElementId); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "-collapseButton' class='btn btn-link' style='padding:2px'><i class='glyphicon glyphicon-resize-small'></i></button>\n                <button id='";
  if (helper = helpers.divElementId) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.divElementId); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "-expandButton' class='btn btn-link' style='padding:2px'><i class='glyphicon glyphicon-resize-full'></i></button>\n                <button id='";
  if (helper = helpers.divElementId) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.divElementId); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "-closeButton' class='btn btn-link' style='padding:2px'><i class='glyphicon glyphicon-remove'></i></button>\n            </div>\n        </div>\n    </div>\n    <div class='panel-body' id='";
  if (helper = helpers.divElementId) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.divElementId); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "-panelBody'>\n        <!-- Nav tabs -->\n        <ul class=\"nav nav-tabs\" id=\"details-tabs-";
  if (helper = helpers.divElementId) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.divElementId); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "\">\n            <li class=\"active\"><a href=\"#home-";
  if (helper = helpers.divElementId) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.divElementId); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "\" data-toggle=\"tab\" style=\"padding-top: 3px; padding-bottom:3px;\"><span class=\"i18n\" data-i18n-id=\"i18n_summary\">Summary</span></a></li>\n            <li><a href=\"#details-";
  if (helper = helpers.divElementId) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.divElementId); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "\" data-toggle=\"tab\" style=\"padding-top: 3px; padding-bottom:3px;\"><span class=\"i18n\" data-i18n-id=\"i18n_details\">Details</span></a></li>\n            <li id=\"diagram-tab\"><a href=\"#diagram-";
  if (helper = helpers.divElementId) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.divElementId); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "\" data-toggle=\"tab\" style=\"padding-top: 3px; padding-bottom:3px;\" id=\"diagram-tab-link-";
  if (helper = helpers.divElementId) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.divElementId); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "\"><span class=\"i18n\" data-i18n-id=\"i18n_diagram\">Diagram</span></a></li>\n            <li><a href=\"#refsets-";
  if (helper = helpers.divElementId) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.divElementId); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "\" data-toggle=\"tab\" style=\"padding-top: 3px; padding-bottom:3px;\"><span class=\"i18n\" data-i18n-id=\"i18n_refsets\">Refsets</span></a></li>\n        </ul>\n        <!-- Tab panes -->\n        <div class=\"tab-content\" id=\"details-tab-content-";
  if (helper = helpers.divElementId) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.divElementId); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "\">\n            <div class=\"tab-pane fade in active\" id=\"home-";
  if (helper = helpers.divElementId) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.divElementId); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "\" style=\"padding: 5px;\">\n                <div class=\"row\" style=\"margin-right: 20px\"><span class=\"pull-right text-muted\" id=\"home-";
  if (helper = helpers.divElementId) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.divElementId); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "-viewLabel\"></span></div>\n                <div style=\"margin-left: 0%; margin-bottom: 10px; margin-top: 10px; width: 80%;border: 2px solid forestgreen; border-radius: 4px; padding: 5px;\" id=\"home-parents-";
  if (helper = helpers.divElementId) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.divElementId); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "\">No parents</div>\n                <div style=\"margin-left: 10%; margin-bottom: 10px; margin-top: 10px; width: 80%;border: 2px solid saddlebrown; border-radius: 4px; padding: 5px;\" id=\"home-attributes-";
  if (helper = helpers.divElementId) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.divElementId); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "\">Attributes</div>\n                <div style=\"margin-left: 20%; margin-bottom: 10px; margin-top: 10px; width: 80%;border: 2px solid darkslateblue; border-radius: 4px; padding: 5px;\" id=\"home-roles-";
  if (helper = helpers.divElementId) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.divElementId); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "\">Relationships</div>\n                <div><span class=\"text-muted pull-right\" id=\"footer-";
  if (helper = helpers.divElementId) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.divElementId); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "\"></span></div>\n            </div>\n            <div class=\"tab-pane fade\" id=\"details-";
  if (helper = helpers.divElementId) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.divElementId); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "\">\n                <div id='";
  if (helper = helpers.divElementId) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.divElementId); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "-attributes-panel' class='panel panel-default'>\n                </div>\n                <div id='";
  if (helper = helpers.divElementId) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.divElementId); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "-descriptions-panel' class='panel panel-default'>\n                </div>\n                <div id='";
  if (helper = helpers.divElementId) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.divElementId); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "-rels-panel' class='panel panel-default'>\n                </div>\n                <div id='";
  if (helper = helpers.divElementId) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.divElementId); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "-children-panel' class='panel panel-default' style='height:100px;overflow:auto;margin-bottom: 15px;'>\n                </div>\n            </div>\n            <div class=\"tab-pane fade\" id=\"diagram-";
  if (helper = helpers.divElementId) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.divElementId); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "\">\n                <div class=\"row\" style=\"margin-right: 20px\"><span class=\"pull-right text-muted\" id=\"home-";
  if (helper = helpers.divElementId) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.divElementId); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "-diagram-viewLabel\"></span></div>\n                <div id=\"diagram-canvas-";
  if (helper = helpers.divElementId) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.divElementId); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "\" style=\"position: relative; width: 1000px;\"></div>\n            </div>\n            <div class=\"tab-pane fade\" id=\"refsets-";
  if (helper = helpers.divElementId) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.divElementId); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "\">\n            </div>\n        </div>\n    </div>\n</div>\n<div class='modal fade' id='";
  if (helper = helpers.divElementId) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.divElementId); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "-configModal'>\n    <div class='modal-dialog'>\n        <div class='modal-content'>\n            <div class='modal-header'>\n                <button type='button' class='close' data-dismiss='modal' aria-hidden='true'>&times;</button>\n                <h4 class='modal-title'><span class='i18n' data-i18n-id='i18n_options'>Options</span> (";
  if (helper = helpers.divElementId) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.divElementId); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + ")</h4>\n            </div>\n            <div class='modal-body' id='";
  if (helper = helpers.divElementId) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.divElementId); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "-modal-body'>\n                <p></p>\n            </div>\n            <div class='modal-footer'>\n                <button type='button' class='btn btn-danger' data-dismiss='modal'><span class='i18n' data-i18n-id='i18n_cancel'>Cancel</span></button>\n                <button id='";
  if (helper = helpers.divElementId) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.divElementId); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "-apply-button' type='button' class='btn btn-success' data-dismiss='modal'><span class='i18n' data-i18n-id='i18n_apply_changes'>Apply changes</span></button>\n            </div>\n        </div><!-- /.modal-content -->\n    </div><!-- /.modal-dialog -->\n</div><!-- /.modal -->\n        ";
  return buffer;
  });

this["JST"]["views/conceptDetailsPlugin/tabs/details/attributes-panel.hbs"] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, helper, options, functionType="function", escapeExpression=this.escapeExpression, self=this, helperMissing=helpers.helperMissing;

function program1(depth0,data) {
  
  
  return "\n        class = 'highlightEffectiveTime'\n        ";
  }

function program3(depth0,data) {
  
  var buffer = "", stack1, helper;
  buffer += "\n                    <a href=\"javascript:void(0);\" draggable = \"true\" ondragstart=\"drag(event, '";
  if (helper = helpers.divElementId) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.divElementId); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "')\" style=\"color: inherit;text-decoration: inherit;\"><span class=\"badge alert-warning\"  data-concept-id=\""
    + escapeExpression(((stack1 = ((stack1 = (depth0 && depth0.firstMatch)),stack1 == null || stack1 === false ? stack1 : stack1.conceptId)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "\" data-term=\""
    + escapeExpression(((stack1 = ((stack1 = (depth0 && depth0.firstMatch)),stack1 == null || stack1 === false ? stack1 : stack1.defaultTerm)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "\" data-def-status=\""
    + escapeExpression(((stack1 = ((stack1 = (depth0 && depth0.firstMatch)),stack1 == null || stack1 === false ? stack1 : stack1.definitionStatus)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "\">&nbsp;</span></a>&nbsp;&nbsp;\n                ";
  return buffer;
  }

function program5(depth0,data) {
  
  var buffer = "", stack1, helper;
  buffer += "\n                    <a href=\"javascript:void(0);\" draggable = \"true\" ondragstart=\"drag(event, '";
  if (helper = helpers.divElementId) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.divElementId); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "')\" style=\"color: inherit;text-decoration: inherit;\"><span class=\"badge alert-warning\"  data-concept-id=\""
    + escapeExpression(((stack1 = ((stack1 = (depth0 && depth0.firstMatch)),stack1 == null || stack1 === false ? stack1 : stack1.conceptId)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "\" data-term=\""
    + escapeExpression(((stack1 = ((stack1 = (depth0 && depth0.firstMatch)),stack1 == null || stack1 === false ? stack1 : stack1.defaultTerm)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "\" data-def-status=\""
    + escapeExpression(((stack1 = ((stack1 = (depth0 && depth0.firstMatch)),stack1 == null || stack1 === false ? stack1 : stack1.definitionStatus)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "\">&equiv;</span></a>&nbsp;&nbsp;\n                ";
  return buffer;
  }

function program7(depth0,data) {
  
  
  return "\n                , <span class='i18n' data-i18n-id='i18n_primitive'>Primitive</span>\n            ";
  }

function program9(depth0,data) {
  
  
  return "\n                , <span class='i18n' data-i18n-id='i18n_fully_defined'>Fully defined</span>\n            ";
  }

function program11(depth0,data) {
  
  
  return "\n                , <span class='i18n' data-i18n-id='i18n_active'>Active</span>\n            ";
  }

function program13(depth0,data) {
  
  
  return "\n                , <span class='i18n' data-i18n-id='i18n_inactive'>Inactive</span>\n            ";
  }

  buffer += "<table class='table table-default' >\n    <tr\n        ";
  stack1 = (helper = helpers.if_eq || (depth0 && depth0.if_eq),options={hash:{},inverse:self.noop,fn:self.program(1, program1, data),data:data},helper ? helper.call(depth0, ((stack1 = (depth0 && depth0.firstMatch)),stack1 == null || stack1 === false ? stack1 : stack1.effectiveTime), ((stack1 = (depth0 && depth0.options)),stack1 == null || stack1 === false ? stack1 : stack1.highlightByEffectiveTime), options) : helperMissing.call(depth0, "if_eq", ((stack1 = (depth0 && depth0.firstMatch)),stack1 == null || stack1 === false ? stack1 : stack1.effectiveTime), ((stack1 = (depth0 && depth0.options)),stack1 == null || stack1 === false ? stack1 : stack1.highlightByEffectiveTime), options));
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n            >\n        <td>\n            <h4>\n                ";
  stack1 = (helper = helpers.if_eq || (depth0 && depth0.if_eq),options={hash:{},inverse:self.program(5, program5, data),fn:self.program(3, program3, data),data:data},helper ? helper.call(depth0, ((stack1 = (depth0 && depth0.firstMatch)),stack1 == null || stack1 === false ? stack1 : stack1.definitionStatus), "Primitive", options) : helperMissing.call(depth0, "if_eq", ((stack1 = (depth0 && depth0.firstMatch)),stack1 == null || stack1 === false ? stack1 : stack1.definitionStatus), "Primitive", options));
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n\n                <span ondrop=\"dropC(event, '";
  if (helper = helpers.divElementId) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.divElementId); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "')\" ondragover=\"allowDrop(event)\">"
    + escapeExpression(((stack1 = ((stack1 = (depth0 && depth0.firstMatch)),stack1 == null || stack1 === false ? stack1 : stack1.defaultTerm)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "</span>\n            </h4>\n            <br>SCTID: "
    + escapeExpression(((stack1 = ((stack1 = (depth0 && depth0.firstMatch)),stack1 == null || stack1 === false ? stack1 : stack1.conceptId)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "\n\n            ";
  stack1 = (helper = helpers.if_eq || (depth0 && depth0.if_eq),options={hash:{},inverse:self.program(9, program9, data),fn:self.program(7, program7, data),data:data},helper ? helper.call(depth0, ((stack1 = (depth0 && depth0.firstMatch)),stack1 == null || stack1 === false ? stack1 : stack1.definitionStatus), "Primitive", options) : helperMissing.call(depth0, "if_eq", ((stack1 = (depth0 && depth0.firstMatch)),stack1 == null || stack1 === false ? stack1 : stack1.definitionStatus), "Primitive", options));
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n\n            ";
  stack1 = (helper = helpers.if_eq || (depth0 && depth0.if_eq),options={hash:{},inverse:self.program(13, program13, data),fn:self.program(11, program11, data),data:data},helper ? helper.call(depth0, ((stack1 = (depth0 && depth0.firstMatch)),stack1 == null || stack1 === false ? stack1 : stack1.active), true, options) : helperMissing.call(depth0, "if_eq", ((stack1 = (depth0 && depth0.firstMatch)),stack1 == null || stack1 === false ? stack1 : stack1.active), true, options));
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n        </td>\n        <td><button type=\"button\" class=\"btn btn-link unobtrusive-icon more-fields-button pull-right\" data-container=\"body\" data-toggle=\"popover\" data-placement=\"left\" data-content=\"\n                <table border='1'><tr><th style='padding: 3px;'>Effective Time</th><th style='padding: 3px;'>ModuleId</th></tr><tr><td style='padding: 3px;'>"
    + escapeExpression(((stack1 = ((stack1 = (depth0 && depth0.firstMatch)),stack1 == null || stack1 === false ? stack1 : stack1.effectiveTime)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "</td><td style='padding: 3px;'>"
    + escapeExpression(((stack1 = ((stack1 = (depth0 && depth0.firstMatch)),stack1 == null || stack1 === false ? stack1 : stack1.module)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "</td></tr></table>\n                \" data-html=\"true\"><i class=\"glyphicon glyphicon-info-sign\"></i></button>\n            &nbsp;<button type=\"button\" id=\"share-link-";
  if (helper = helpers.divElementId) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.divElementId); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "\" class=\"btn btn-link more-fields-button pull-right\" data-container=\"body\" data-toggle=\"popover\" data-placement=\"left\" data-content=\"\n                    <form><input class='form-control' id='share-field-";
  if (helper = helpers.divElementId) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.divElementId); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "' value='";
  if (helper = helpers.dataContentValue) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.dataContentValue); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "?perspective=full&conceptId1=";
  if (helper = helpers.conceptId) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.conceptId); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "'></form><br>Copy the concept link (e.g. CTRL-C) to save and share a reference to this concept.\n                    \" data-html=\"true\"><i class=\"glyphicon glyphicon-share-alt\"></i></button></td>\n\n    </tr>\n</table>";
  return buffer;
  });

this["JST"]["views/conceptDetailsPlugin/tabs/details/children-panel.hbs"] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, functionType="function", escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "\n    ";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.active), {hash:{},inverse:self.noop,fn:self.program(2, program2, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n";
  return buffer;
  }
function program2(depth0,data) {
  
  var buffer = "", stack1, helper;
  buffer += "\n        <tr><td draggable=\"true\" ondragstart=\"drag(event, '";
  if (helper = helpers.divElementId) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.divElementId); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "')\" data-concept-id='";
  if (helper = helpers.conceptId) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.conceptId); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "' data-term='";
  if (helper = helpers.defaultTerm) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.defaultTerm); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "'>";
  if (helper = helpers.defaultTerm) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.defaultTerm); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "</td></tr>\n    ";
  return buffer;
  }

  buffer += "<div>\n    <table class='table table-bordered'>\n        <thead>\n        <tr>\n            <th>\n                <span class='i18n' data-i18n-id='i18n_children'>Children</span>\n            </th>\n        </tr>\n        </thead>\n        <tbody>\n</div>\n";
  stack1 = helpers.each.call(depth0, (depth0 && depth0.childrenResult), {hash:{},inverse:self.noop,fn:self.program(1, program1, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n</tbody>\n</table>";
  return buffer;
  });

this["JST"]["views/conceptDetailsPlugin/tabs/details/descriptions-panel.hbs"] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, helper, helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression, self=this, functionType="function";

function program1(depth0,data) {
  
  
  return "\n            <th>SCTID</th>\n        ";
  }

function program3(depth0,data,depth1) {
  
  var buffer = "", stack1, helper, options;
  buffer += "\n            "
    + escapeExpression((helper = helpers.included || (depth0 && depth0.included),options={hash:{},data:data},helper ? helper.call(depth0, false, options) : helperMissing.call(depth0, "included", false, options)))
    + "\n            ";
  stack1 = helpers.each.call(depth0, (depth0 && depth0.langMemberships), {hash:{},inverse:self.noop,fn:self.programWithDepth(4, program4, data, depth1),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n            ";
  stack1 = (helper = helpers.included || (depth0 && depth0.included),options={hash:{},inverse:self.programWithDepth(57, program57, data, depth0, depth1),fn:self.programWithDepth(7, program7, data, depth1),data:data},helper ? helper.call(depth0, "get", options) : helperMissing.call(depth0, "included", "get", options));
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n        ";
  return buffer;
  }
function program4(depth0,data,depth2) {
  
  var buffer = "", stack1, helper, options;
  buffer += "\n                ";
  stack1 = (helper = helpers.if_eq || (depth0 && depth0.if_eq),options={hash:{},inverse:self.noop,fn:self.program(5, program5, data),data:data},helper ? helper.call(depth0, ((stack1 = (depth0 && depth0.refset)),stack1 == null || stack1 === false ? stack1 : stack1.conceptId), ((stack1 = (depth2 && depth2.options)),stack1 == null || stack1 === false ? stack1 : stack1.langRefset), options) : helperMissing.call(depth0, "if_eq", ((stack1 = (depth0 && depth0.refset)),stack1 == null || stack1 === false ? stack1 : stack1.conceptId), ((stack1 = (depth2 && depth2.options)),stack1 == null || stack1 === false ? stack1 : stack1.langRefset), options));
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n            ";
  return buffer;
  }
function program5(depth0,data) {
  
  var buffer = "", helper, options;
  buffer += "\n                    "
    + escapeExpression((helper = helpers.included || (depth0 && depth0.included),options={hash:{},data:data},helper ? helper.call(depth0, true, options) : helperMissing.call(depth0, "included", true, options)))
    + "\n                ";
  return buffer;
  }

function program7(depth0,data,depth2) {
  
  var buffer = "", stack1, helper, options;
  buffer += "\n                <tr class='";
  stack1 = (helper = helpers.if_eq || (depth0 && depth0.if_eq),options={hash:{},inverse:self.program(10, program10, data),fn:self.program(8, program8, data),data:data},helper ? helper.call(depth0, ((stack1 = (depth0 && depth0.type)),stack1 == null || stack1 === false ? stack1 : stack1.conceptId), "900000000000003001", options) : helperMissing.call(depth0, "if_eq", ((stack1 = (depth0 && depth0.type)),stack1 == null || stack1 === false ? stack1 : stack1.conceptId), "900000000000003001", options));
  if(stack1 || stack1 === 0) { buffer += stack1; }
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.active), {hash:{},inverse:self.program(14, program14, data),fn:self.program(12, program12, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  stack1 = (helper = helpers.if_eq || (depth0 && depth0.if_eq),options={hash:{},inverse:self.noop,fn:self.program(16, program16, data),data:data},helper ? helper.call(depth0, (depth0 && depth0.effectiveTime), ((stack1 = (depth2 && depth2.options)),stack1 == null || stack1 === false ? stack1 : stack1.highlightByEffectiveTime), options) : helperMissing.call(depth0, "if_eq", (depth0 && depth0.effectiveTime), ((stack1 = (depth2 && depth2.options)),stack1 == null || stack1 === false ? stack1 : stack1.highlightByEffectiveTime), options));
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "'>\n                    <td>\n                        ";
  stack1 = (helper = helpers.if_eq || (depth0 && depth0.if_eq),options={hash:{},inverse:self.program(20, program20, data),fn:self.program(18, program18, data),data:data},helper ? helper.call(depth0, ((stack1 = (depth0 && depth0.type)),stack1 == null || stack1 === false ? stack1 : stack1.conceptId), "900000000000003001", options) : helperMissing.call(depth0, "if_eq", ((stack1 = (depth0 && depth0.type)),stack1 == null || stack1 === false ? stack1 : stack1.conceptId), "900000000000003001", options));
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n\n                        ";
  stack1 = (helper = helpers.if_eq || (depth0 && depth0.if_eq),options={hash:{},inverse:self.programWithDepth(28, program28, data, depth2),fn:self.program(26, program26, data),data:data},helper ? helper.call(depth0, (depth0 && depth0.langMemberships), "undefined", options) : helperMissing.call(depth0, "if_eq", (depth0 && depth0.langMemberships), "undefined", options));
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n                        ";
  stack1 = (helper = helpers.preferred || (depth0 && depth0.preferred),options={hash:{},inverse:self.program(41, program41, data),fn:self.program(36, program36, data),data:data},helper ? helper.call(depth0, "get", options) : helperMissing.call(depth0, "preferred", "get", options));
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n\n                        &nbsp;&nbsp;&nbsp;";
  if (helper = helpers.term) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.term); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "</td>\n                    ";
  stack1 = helpers['if'].call(depth0, ((stack1 = (depth2 && depth2.options)),stack1 == null || stack1 === false ? stack1 : stack1.showIds), {hash:{},inverse:self.noop,fn:self.program(46, program46, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n\n                    <td>\n                        "
    + escapeExpression((helper = helpers.included || (depth2 && depth2.included),options={hash:{},data:data},helper ? helper.call(depth0, false, options) : helperMissing.call(depth0, "included", false, options)))
    + "\n                        ";
  stack1 = (helper = helpers.if_eq || (depth0 && depth0.if_eq),options={hash:{},inverse:self.programWithDepth(48, program48, data, depth2),fn:self.program(26, program26, data),data:data},helper ? helper.call(depth0, (depth0 && depth0.langMemberships), "undefined", options) : helperMissing.call(depth0, "if_eq", (depth0 && depth0.langMemberships), "undefined", options));
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n\n                        ";
  stack1 = (helper = helpers.included || (depth0 && depth0.included),options={hash:{},inverse:self.program(55, program55, data),fn:self.program(26, program26, data),data:data},helper ? helper.call(depth0, "get", options) : helperMissing.call(depth0, "included", "get", options));
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n                        <button type=\"button\" class=\"btn btn-link unobtrusive-icon more-fields-button pull-right\" data-container=\"body\" data-toggle=\"popover\" data-placement=\"left\" data-content=\"\n                        <table border='1'><tr><th style='padding: 3px;'>DescriptionId</th><th style='padding: 3px;'>Type</th><th style='padding: 3px;'>Language</th><th style='padding: 3px;'>Case Significance</th><th style='padding: 3px;'>Effective Time</th><th style='padding: 3px;'>ModuleId</th></tr>\n                                <tr><td style='padding: 3px;'>";
  if (helper = helpers.descriptionId) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.descriptionId); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "</td><td style='padding: 3px;'>"
    + escapeExpression((helper = helpers.removeSemtag || (depth0 && depth0.removeSemtag),options={hash:{},data:data},helper ? helper.call(depth0, ((stack1 = (depth0 && depth0.type)),stack1 == null || stack1 === false ? stack1 : stack1.defaultTerm), options) : helperMissing.call(depth0, "removeSemtag", ((stack1 = (depth0 && depth0.type)),stack1 == null || stack1 === false ? stack1 : stack1.defaultTerm), options)))
    + "</td><td style='padding: 3px;'>";
  if (helper = helpers.lang) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.lang); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "</td><td style='padding: 3px;'>"
    + escapeExpression((helper = helpers.removeSemtag || (depth0 && depth0.removeSemtag),options={hash:{},data:data},helper ? helper.call(depth0, ((stack1 = (depth0 && depth0.ics)),stack1 == null || stack1 === false ? stack1 : stack1.defaultTerm), options) : helperMissing.call(depth0, "removeSemtag", ((stack1 = (depth0 && depth0.ics)),stack1 == null || stack1 === false ? stack1 : stack1.defaultTerm), options)))
    + "</td><td style='padding: 3px;'>";
  if (helper = helpers.effectiveTime) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.effectiveTime); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "</td><td style='padding: 3px;'>";
  if (helper = helpers.module) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.module); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "</td></tr>\n                        </table>\n                        \" data-html=\"true\"><i class=\"glyphicon glyphicon-info-sign\"></i></button>\n                    </td>\n                </tr>\n                <!--descDetailsHtml = descDetailsHtml + row;-->\n            ";
  return buffer;
  }
function program8(depth0,data) {
  
  
  return " fsn-row";
  }

function program10(depth0,data) {
  
  
  return " synonym-row";
  }

function program12(depth0,data) {
  
  var buffer = "";
  return buffer;
  }

function program14(depth0,data) {
  
  
  return " danger";
  }

function program16(depth0,data) {
  
  
  return " highlightEffectiveTime";
  }

function program18(depth0,data) {
  
  
  return "\n                            <span rel=\"tooltip-right\" title=\"F\">F</span>\n                        ";
  }

function program20(depth0,data) {
  
  var buffer = "", stack1, helper, options;
  buffer += "\n                            ";
  stack1 = (helper = helpers.if_eq || (depth0 && depth0.if_eq),options={hash:{},inverse:self.program(23, program23, data),fn:self.program(21, program21, data),data:data},helper ? helper.call(depth0, ((stack1 = (depth0 && depth0.type)),stack1 == null || stack1 === false ? stack1 : stack1.conceptId), "900000000000013009", options) : helperMissing.call(depth0, "if_eq", ((stack1 = (depth0 && depth0.type)),stack1 == null || stack1 === false ? stack1 : stack1.conceptId), "900000000000013009", options));
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n                        ";
  return buffer;
  }
function program21(depth0,data) {
  
  
  return "\n                                <span rel=\"tooltip-right\" title=\"S\">S</span>\n                            ";
  }

function program23(depth0,data) {
  
  var buffer = "", stack1, helper, options;
  buffer += "\n                                ";
  stack1 = (helper = helpers.if_eq || (depth0 && depth0.if_eq),options={hash:{},inverse:self.noop,fn:self.program(24, program24, data),data:data},helper ? helper.call(depth0, ((stack1 = (depth0 && depth0.type)),stack1 == null || stack1 === false ? stack1 : stack1.conceptId), "900000000000550004", options) : helperMissing.call(depth0, "if_eq", ((stack1 = (depth0 && depth0.type)),stack1 == null || stack1 === false ? stack1 : stack1.conceptId), "900000000000550004", options));
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n                            ";
  return buffer;
  }
function program24(depth0,data) {
  
  
  return "\n                                    <span rel=\"tooltip-right\" title=\"D\">D</span>\n                                ";
  }

function program26(depth0,data) {
  
  
  return "\n                        ";
  }

function program28(depth0,data,depth3) {
  
  var buffer = "", stack1;
  buffer += "\n                            ";
  stack1 = helpers.each.call(depth0, (depth0 && depth0.langMemberships), {hash:{},inverse:self.noop,fn:self.programWithDepth(29, program29, data, depth3),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n                        ";
  return buffer;
  }
function program29(depth0,data,depth4) {
  
  var buffer = "", stack1, helper, options;
  buffer += "\n                                ";
  stack1 = (helper = helpers.if_eq || (depth0 && depth0.if_eq),options={hash:{},inverse:self.noop,fn:self.program(30, program30, data),data:data},helper ? helper.call(depth0, ((stack1 = (depth0 && depth0.refset)),stack1 == null || stack1 === false ? stack1 : stack1.conceptId), ((stack1 = (depth4 && depth4.options)),stack1 == null || stack1 === false ? stack1 : stack1.langRefset), options) : helperMissing.call(depth0, "if_eq", ((stack1 = (depth0 && depth0.refset)),stack1 == null || stack1 === false ? stack1 : stack1.conceptId), ((stack1 = (depth4 && depth4.options)),stack1 == null || stack1 === false ? stack1 : stack1.langRefset), options));
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n                            ";
  return buffer;
  }
function program30(depth0,data) {
  
  var buffer = "", stack1, helper, options;
  buffer += "\n                                    ";
  stack1 = (helper = helpers.if_eq || (depth0 && depth0.if_eq),options={hash:{},inverse:self.program(33, program33, data),fn:self.program(31, program31, data),data:data},helper ? helper.call(depth0, ((stack1 = (depth0 && depth0.acceptability)),stack1 == null || stack1 === false ? stack1 : stack1.conceptId), "900000000000548007", options) : helperMissing.call(depth0, "if_eq", ((stack1 = (depth0 && depth0.acceptability)),stack1 == null || stack1 === false ? stack1 : stack1.conceptId), "900000000000548007", options));
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n                                ";
  return buffer;
  }
function program31(depth0,data) {
  
  var buffer = "", helper, options;
  buffer += "\n                                        <!--isPreferred = true;-->\n                                        "
    + escapeExpression((helper = helpers.preferred || (depth0 && depth0.preferred),options={hash:{},data:data},helper ? helper.call(depth0, true, options) : helperMissing.call(depth0, "preferred", true, options)))
    + "\n                                    ";
  return buffer;
  }

function program33(depth0,data) {
  
  var buffer = "", stack1, helper, options;
  buffer += "\n                                        ";
  stack1 = (helper = helpers.if_eq || (depth0 && depth0.if_eq),options={hash:{},inverse:self.noop,fn:self.program(34, program34, data),data:data},helper ? helper.call(depth0, ((stack1 = (depth0 && depth0.acceptability)),stack1 == null || stack1 === false ? stack1 : stack1.conceptId), "900000000000549004", options) : helperMissing.call(depth0, "if_eq", ((stack1 = (depth0 && depth0.acceptability)),stack1 == null || stack1 === false ? stack1 : stack1.conceptId), "900000000000549004", options));
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n                                    ";
  return buffer;
  }
function program34(depth0,data) {
  
  var buffer = "", helper, options;
  buffer += "\n                                            <!--isAcceptable = true;-->\n                                            "
    + escapeExpression((helper = helpers.acceptable || (depth0 && depth0.acceptable),options={hash:{},data:data},helper ? helper.call(depth0, true, options) : helperMissing.call(depth0, "acceptable", true, options)))
    + "\n                                        ";
  return buffer;
  }

function program36(depth0,data) {
  
  var buffer = "", stack1, helper, options;
  buffer += "\n                            ";
  stack1 = (helper = helpers.if_eq || (depth0 && depth0.if_eq),options={hash:{},inverse:self.program(39, program39, data),fn:self.program(37, program37, data),data:data},helper ? helper.call(depth0, ((stack1 = (depth0 && depth0.type)),stack1 == null || stack1 === false ? stack1 : stack1.conceptId), "900000000000003001", options) : helperMissing.call(depth0, "if_eq", ((stack1 = (depth0 && depth0.type)),stack1 == null || stack1 === false ? stack1 : stack1.conceptId), "900000000000003001", options));
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n                        ";
  return buffer;
  }
function program37(depth0,data) {
  
  
  return "\n                                &nbsp;<span class=\"glyphicon glyphicon-star-empty\" rel=\"tooltip-right\" title=\"Preferred\"></span>\n                            ";
  }

function program39(depth0,data) {
  
  
  return "\n                                &nbsp;<span class=\"glyphicon glyphicon-star\" rel=\"tooltip-right\" title=\"Preferred\"></span>\n                            ";
  }

function program41(depth0,data) {
  
  var buffer = "", stack1, helper, options;
  buffer += "\n                            ";
  stack1 = (helper = helpers.acceptable || (depth0 && depth0.acceptable),options={hash:{},inverse:self.program(44, program44, data),fn:self.program(42, program42, data),data:data},helper ? helper.call(depth0, "get", options) : helperMissing.call(depth0, "acceptable", "get", options));
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n                        ";
  return buffer;
  }
function program42(depth0,data) {
  
  
  return "\n                                &nbsp;<span rel=\"tooltip-right\" title=\"Acceptable\">&#10004;</span></span>\n                            ";
  }

function program44(depth0,data) {
  
  
  return "\n                                &nbsp;&nbsp;&nbsp;\n                            ";
  }

function program46(depth0,data) {
  
  var buffer = "", stack1, helper;
  buffer += "\n                        <td>";
  if (helper = helpers.descriptionId) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.descriptionId); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "</td>\n                    ";
  return buffer;
  }

function program48(depth0,data,depth3) {
  
  var buffer = "", stack1;
  buffer += "\n                            ";
  stack1 = helpers.each.call(depth0, (depth0 && depth0.langMemberships), {hash:{},inverse:self.noop,fn:self.programWithDepth(49, program49, data, depth3),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n                        ";
  return buffer;
  }
function program49(depth0,data,depth4) {
  
  var buffer = "", stack1, helper, options;
  buffer += "\n                                ";
  stack1 = (helper = helpers.if_eq || (depth0 && depth0.if_eq),options={hash:{},inverse:self.noop,fn:self.program(50, program50, data),data:data},helper ? helper.call(depth0, ((stack1 = (depth0 && depth0.refset)),stack1 == null || stack1 === false ? stack1 : stack1.conceptId), ((stack1 = (depth4 && depth4.options)),stack1 == null || stack1 === false ? stack1 : stack1.langRefset), options) : helperMissing.call(depth0, "if_eq", ((stack1 = (depth0 && depth0.refset)),stack1 == null || stack1 === false ? stack1 : stack1.conceptId), ((stack1 = (depth4 && depth4.options)),stack1 == null || stack1 === false ? stack1 : stack1.langRefset), options));
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n                            ";
  return buffer;
  }
function program50(depth0,data) {
  
  var buffer = "", stack1, helper, options;
  buffer += "\n                                    ";
  stack1 = (helper = helpers.if_eq || (depth0 && depth0.if_eq),options={hash:{},inverse:self.program(53, program53, data),fn:self.program(51, program51, data),data:data},helper ? helper.call(depth0, ((stack1 = (depth0 && depth0.acceptability)),stack1 == null || stack1 === false ? stack1 : stack1.conceptId), "900000000000548007", options) : helperMissing.call(depth0, "if_eq", ((stack1 = (depth0 && depth0.acceptability)),stack1 == null || stack1 === false ? stack1 : stack1.conceptId), "900000000000548007", options));
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n                                    "
    + escapeExpression((helper = helpers.included || (depth0 && depth0.included),options={hash:{},data:data},helper ? helper.call(depth0, true, options) : helperMissing.call(depth0, "included", true, options)))
    + "\n                                ";
  return buffer;
  }
function program51(depth0,data) {
  
  
  return "\n                                        <span class='i18n' data-i18n-id='i18n_preferred'>Preferred</span>\n                                    ";
  }

function program53(depth0,data) {
  
  
  return "\n                                        <span class='i18n' data-i18n-id='i18n_acceptable'>Acceptable</span>\n                                    ";
  }

function program55(depth0,data) {
  
  
  return "\n                            <span class='i18n' data-i18n-id='i18n_not_acceptable'>Not acceptable</span>\n                        ";
  }

function program57(depth0,data,depth1,depth2) {
  
  var buffer = "", stack1;
  buffer += "\n                ";
  stack1 = helpers['if'].call(depth0, ((stack1 = (depth2 && depth2.options)),stack1 == null || stack1 === false ? stack1 : stack1.hideNotAcceptable), {hash:{},inverse:self.programWithDepth(141, program141, data, depth2),fn:self.programWithDepth(58, program58, data, depth1, depth2),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n            ";
  return buffer;
  }
function program58(depth0,data,depth2,depth3) {
  
  var buffer = "", stack1;
  buffer += "\n                    ";
  stack1 = helpers['if'].call(depth0, ((stack1 = (depth3 && depth3.options)),stack1 == null || stack1 === false ? stack1 : stack1.displayInactiveDescriptions), {hash:{},inverse:self.noop,fn:self.programWithDepth(59, program59, data, depth2, depth3),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n                ";
  return buffer;
  }
function program59(depth0,data,depth3,depth4) {
  
  var buffer = "", stack1;
  buffer += "\n                        ";
  stack1 = helpers['if'].call(depth0, ((stack1 = (depth4 && depth4.options)),stack1 == null || stack1 === false ? stack1 : stack1.displayInactiveDescriptions), {hash:{},inverse:self.programWithDepth(100, program100, data, depth3, depth4),fn:self.programWithDepth(60, program60, data, depth4),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n                        <!--descDetailsHtml = descDetailsHtml + row;-->\n                    ";
  return buffer;
  }
function program60(depth0,data,depth5) {
  
  var buffer = "", stack1, helper, options;
  buffer += "\n                            <tr class='";
  stack1 = (helper = helpers.if_eq || (depth0 && depth0.if_eq),options={hash:{},inverse:self.program(10, program10, data),fn:self.program(8, program8, data),data:data},helper ? helper.call(depth0, ((stack1 = (depth0 && depth0.type)),stack1 == null || stack1 === false ? stack1 : stack1.conceptId), "900000000000003001", options) : helperMissing.call(depth0, "if_eq", ((stack1 = (depth0 && depth0.type)),stack1 == null || stack1 === false ? stack1 : stack1.conceptId), "900000000000003001", options));
  if(stack1 || stack1 === 0) { buffer += stack1; }
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.active), {hash:{},inverse:self.program(14, program14, data),fn:self.program(12, program12, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  stack1 = (helper = helpers.if_eq || (depth0 && depth0.if_eq),options={hash:{},inverse:self.noop,fn:self.program(16, program16, data),data:data},helper ? helper.call(depth0, (depth0 && depth0.effectiveTime), ((stack1 = (depth5 && depth5.options)),stack1 == null || stack1 === false ? stack1 : stack1.highlightByEffectiveTime), options) : helperMissing.call(depth0, "if_eq", (depth0 && depth0.effectiveTime), ((stack1 = (depth5 && depth5.options)),stack1 == null || stack1 === false ? stack1 : stack1.highlightByEffectiveTime), options));
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "'>\n                                <td>\n                                    ";
  stack1 = (helper = helpers.if_eq || (depth0 && depth0.if_eq),options={hash:{},inverse:self.program(63, program63, data),fn:self.program(61, program61, data),data:data},helper ? helper.call(depth0, ((stack1 = (depth0 && depth0.type)),stack1 == null || stack1 === false ? stack1 : stack1.conceptId), "900000000000003001", options) : helperMissing.call(depth0, "if_eq", ((stack1 = (depth0 && depth0.type)),stack1 == null || stack1 === false ? stack1 : stack1.conceptId), "900000000000003001", options));
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n\n                                    ";
  stack1 = (helper = helpers.if_eq || (depth0 && depth0.if_eq),options={hash:{},inverse:self.programWithDepth(71, program71, data, depth5),fn:self.program(69, program69, data),data:data},helper ? helper.call(depth0, (depth0 && depth0.langMemberships), "undefined", options) : helperMissing.call(depth0, "if_eq", (depth0 && depth0.langMemberships), "undefined", options));
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n                                    ";
  stack1 = (helper = helpers.preferred || (depth0 && depth0.preferred),options={hash:{},inverse:self.program(84, program84, data),fn:self.program(79, program79, data),data:data},helper ? helper.call(depth0, "get", options) : helperMissing.call(depth0, "preferred", "get", options));
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n\n                                    &nbsp;&nbsp;&nbsp;";
  if (helper = helpers.term) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.term); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "</td>\n                                ";
  stack1 = helpers['if'].call(depth0, ((stack1 = (depth5 && depth5.options)),stack1 == null || stack1 === false ? stack1 : stack1.showIds), {hash:{},inverse:self.noop,fn:self.program(89, program89, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n\n                                <td>\n                                    "
    + escapeExpression((helper = helpers.included || (depth5 && depth5.included),options={hash:{},data:data},helper ? helper.call(depth0, false, options) : helperMissing.call(depth0, "included", false, options)))
    + "\n                                    ";
  stack1 = (helper = helpers.if_eq || (depth0 && depth0.if_eq),options={hash:{},inverse:self.programWithDepth(91, program91, data, depth5),fn:self.program(69, program69, data),data:data},helper ? helper.call(depth0, (depth0 && depth0.langMemberships), "undefined", options) : helperMissing.call(depth0, "if_eq", (depth0 && depth0.langMemberships), "undefined", options));
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n\n                                    ";
  stack1 = (helper = helpers.included || (depth0 && depth0.included),options={hash:{},inverse:self.program(98, program98, data),fn:self.program(69, program69, data),data:data},helper ? helper.call(depth0, "get", options) : helperMissing.call(depth0, "included", "get", options));
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n                                    <button type=\"button\" class=\"btn btn-link unobtrusive-icon more-fields-button pull-right\" data-container=\"body\" data-toggle=\"popover\" data-placement=\"left\" data-content=\"\n                                    <table border='1'><tr><th style='padding: 3px;'>DescriptionId</th><th style='padding: 3px;'>Type</th><th style='padding: 3px;'>Language</th><th style='padding: 3px;'>Case Significance</th><th style='padding: 3px;'>Effective Time</th><th style='padding: 3px;'>ModuleId</th></tr>\n                                            <tr><td style='padding: 3px;'>";
  if (helper = helpers.descriptionId) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.descriptionId); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "</td><td style='padding: 3px;'>"
    + escapeExpression((helper = helpers.removeSemtag || (depth0 && depth0.removeSemtag),options={hash:{},data:data},helper ? helper.call(depth0, ((stack1 = (depth0 && depth0.type)),stack1 == null || stack1 === false ? stack1 : stack1.defaultTerm), options) : helperMissing.call(depth0, "removeSemtag", ((stack1 = (depth0 && depth0.type)),stack1 == null || stack1 === false ? stack1 : stack1.defaultTerm), options)))
    + "</td><td style='padding: 3px;'>";
  if (helper = helpers.lang) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.lang); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "</td><td style='padding: 3px;'>"
    + escapeExpression((helper = helpers.removeSemtag || (depth0 && depth0.removeSemtag),options={hash:{},data:data},helper ? helper.call(depth0, ((stack1 = (depth0 && depth0.ics)),stack1 == null || stack1 === false ? stack1 : stack1.defaultTerm), options) : helperMissing.call(depth0, "removeSemtag", ((stack1 = (depth0 && depth0.ics)),stack1 == null || stack1 === false ? stack1 : stack1.defaultTerm), options)))
    + "</td><td style='padding: 3px;'>";
  if (helper = helpers.effectiveTime) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.effectiveTime); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "</td><td style='padding: 3px;'>";
  if (helper = helpers.module) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.module); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "</td></tr>\n                                    </table>\n                                    \" data-html=\"true\"><i class=\"glyphicon glyphicon-info-sign\"></i></button>\n                                </td>\n                            </tr>\n                        ";
  return buffer;
  }
function program61(depth0,data) {
  
  
  return "\n                                        <span rel=\"tooltip-right\" title=\"F\">F</span>\n                                    ";
  }

function program63(depth0,data) {
  
  var buffer = "", stack1, helper, options;
  buffer += "\n                                        ";
  stack1 = (helper = helpers.if_eq || (depth0 && depth0.if_eq),options={hash:{},inverse:self.program(66, program66, data),fn:self.program(64, program64, data),data:data},helper ? helper.call(depth0, ((stack1 = (depth0 && depth0.type)),stack1 == null || stack1 === false ? stack1 : stack1.conceptId), "900000000000013009", options) : helperMissing.call(depth0, "if_eq", ((stack1 = (depth0 && depth0.type)),stack1 == null || stack1 === false ? stack1 : stack1.conceptId), "900000000000013009", options));
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n                                    ";
  return buffer;
  }
function program64(depth0,data) {
  
  
  return "\n                                            <span rel=\"tooltip-right\" title=\"S\">S</span>\n                                        ";
  }

function program66(depth0,data) {
  
  var buffer = "", stack1, helper, options;
  buffer += "\n                                            ";
  stack1 = (helper = helpers.if_eq || (depth0 && depth0.if_eq),options={hash:{},inverse:self.noop,fn:self.program(67, program67, data),data:data},helper ? helper.call(depth0, ((stack1 = (depth0 && depth0.type)),stack1 == null || stack1 === false ? stack1 : stack1.conceptId), "900000000000550004", options) : helperMissing.call(depth0, "if_eq", ((stack1 = (depth0 && depth0.type)),stack1 == null || stack1 === false ? stack1 : stack1.conceptId), "900000000000550004", options));
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n                                        ";
  return buffer;
  }
function program67(depth0,data) {
  
  
  return "\n                                                <span rel=\"tooltip-right\" title=\"D\">D</span>\n                                            ";
  }

function program69(depth0,data) {
  
  
  return "\n                                    ";
  }

function program71(depth0,data,depth6) {
  
  var buffer = "", stack1;
  buffer += "\n                                        ";
  stack1 = helpers.each.call(depth0, (depth0 && depth0.langMemberships), {hash:{},inverse:self.noop,fn:self.programWithDepth(72, program72, data, depth6),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n                                    ";
  return buffer;
  }
function program72(depth0,data,depth7) {
  
  var buffer = "", stack1, helper, options;
  buffer += "\n                                            ";
  stack1 = (helper = helpers.if_eq || (depth0 && depth0.if_eq),options={hash:{},inverse:self.noop,fn:self.program(73, program73, data),data:data},helper ? helper.call(depth0, ((stack1 = (depth0 && depth0.refset)),stack1 == null || stack1 === false ? stack1 : stack1.conceptId), ((stack1 = (depth7 && depth7.options)),stack1 == null || stack1 === false ? stack1 : stack1.langRefset), options) : helperMissing.call(depth0, "if_eq", ((stack1 = (depth0 && depth0.refset)),stack1 == null || stack1 === false ? stack1 : stack1.conceptId), ((stack1 = (depth7 && depth7.options)),stack1 == null || stack1 === false ? stack1 : stack1.langRefset), options));
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n                                        ";
  return buffer;
  }
function program73(depth0,data) {
  
  var buffer = "", stack1, helper, options;
  buffer += "\n                                                ";
  stack1 = (helper = helpers.if_eq || (depth0 && depth0.if_eq),options={hash:{},inverse:self.program(76, program76, data),fn:self.program(74, program74, data),data:data},helper ? helper.call(depth0, ((stack1 = (depth0 && depth0.acceptability)),stack1 == null || stack1 === false ? stack1 : stack1.conceptId), "900000000000548007", options) : helperMissing.call(depth0, "if_eq", ((stack1 = (depth0 && depth0.acceptability)),stack1 == null || stack1 === false ? stack1 : stack1.conceptId), "900000000000548007", options));
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n                                            ";
  return buffer;
  }
function program74(depth0,data) {
  
  var buffer = "", helper, options;
  buffer += "\n                                                    <!--isPreferred = true;-->\n                                                    "
    + escapeExpression((helper = helpers.preferred || (depth0 && depth0.preferred),options={hash:{},data:data},helper ? helper.call(depth0, true, options) : helperMissing.call(depth0, "preferred", true, options)))
    + "\n                                                ";
  return buffer;
  }

function program76(depth0,data) {
  
  var buffer = "", stack1, helper, options;
  buffer += "\n                                                    ";
  stack1 = (helper = helpers.if_eq || (depth0 && depth0.if_eq),options={hash:{},inverse:self.noop,fn:self.program(77, program77, data),data:data},helper ? helper.call(depth0, ((stack1 = (depth0 && depth0.acceptability)),stack1 == null || stack1 === false ? stack1 : stack1.conceptId), "900000000000549004", options) : helperMissing.call(depth0, "if_eq", ((stack1 = (depth0 && depth0.acceptability)),stack1 == null || stack1 === false ? stack1 : stack1.conceptId), "900000000000549004", options));
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n                                                ";
  return buffer;
  }
function program77(depth0,data) {
  
  var buffer = "", helper, options;
  buffer += "\n                                                        <!--isAcceptable = true;-->\n                                                        "
    + escapeExpression((helper = helpers.acceptable || (depth0 && depth0.acceptable),options={hash:{},data:data},helper ? helper.call(depth0, true, options) : helperMissing.call(depth0, "acceptable", true, options)))
    + "\n                                                    ";
  return buffer;
  }

function program79(depth0,data) {
  
  var buffer = "", stack1, helper, options;
  buffer += "\n                                        ";
  stack1 = (helper = helpers.if_eq || (depth0 && depth0.if_eq),options={hash:{},inverse:self.program(82, program82, data),fn:self.program(80, program80, data),data:data},helper ? helper.call(depth0, ((stack1 = (depth0 && depth0.type)),stack1 == null || stack1 === false ? stack1 : stack1.conceptId), "900000000000003001", options) : helperMissing.call(depth0, "if_eq", ((stack1 = (depth0 && depth0.type)),stack1 == null || stack1 === false ? stack1 : stack1.conceptId), "900000000000003001", options));
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n                                    ";
  return buffer;
  }
function program80(depth0,data) {
  
  
  return "\n                                            &nbsp;<span class=\"glyphicon glyphicon-star-empty\" rel=\"tooltip-right\" title=\"Preferred\"></span>\n                                        ";
  }

function program82(depth0,data) {
  
  
  return "\n                                            &nbsp;<span class=\"glyphicon glyphicon-star\" rel=\"tooltip-right\" title=\"Preferred\"></span>\n                                        ";
  }

function program84(depth0,data) {
  
  var buffer = "", stack1, helper, options;
  buffer += "\n                                        ";
  stack1 = (helper = helpers.acceptable || (depth0 && depth0.acceptable),options={hash:{},inverse:self.program(87, program87, data),fn:self.program(85, program85, data),data:data},helper ? helper.call(depth0, "get", options) : helperMissing.call(depth0, "acceptable", "get", options));
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n                                    ";
  return buffer;
  }
function program85(depth0,data) {
  
  
  return "\n                                            &nbsp;<span rel=\"tooltip-right\" title=\"Acceptable\">&#10004;</span></span>\n                                        ";
  }

function program87(depth0,data) {
  
  
  return "\n                                            &nbsp;&nbsp;&nbsp;\n                                        ";
  }

function program89(depth0,data) {
  
  var buffer = "", stack1, helper;
  buffer += "\n                                    <td>";
  if (helper = helpers.descriptionId) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.descriptionId); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "</td>\n                                ";
  return buffer;
  }

function program91(depth0,data,depth6) {
  
  var buffer = "", stack1;
  buffer += "\n                                        ";
  stack1 = helpers.each.call(depth0, (depth0 && depth0.langMemberships), {hash:{},inverse:self.noop,fn:self.programWithDepth(92, program92, data, depth6),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n                                    ";
  return buffer;
  }
function program92(depth0,data,depth7) {
  
  var buffer = "", stack1, helper, options;
  buffer += "\n                                            ";
  stack1 = (helper = helpers.if_eq || (depth0 && depth0.if_eq),options={hash:{},inverse:self.noop,fn:self.program(93, program93, data),data:data},helper ? helper.call(depth0, ((stack1 = (depth0 && depth0.refset)),stack1 == null || stack1 === false ? stack1 : stack1.conceptId), ((stack1 = (depth7 && depth7.options)),stack1 == null || stack1 === false ? stack1 : stack1.langRefset), options) : helperMissing.call(depth0, "if_eq", ((stack1 = (depth0 && depth0.refset)),stack1 == null || stack1 === false ? stack1 : stack1.conceptId), ((stack1 = (depth7 && depth7.options)),stack1 == null || stack1 === false ? stack1 : stack1.langRefset), options));
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n                                        ";
  return buffer;
  }
function program93(depth0,data) {
  
  var buffer = "", stack1, helper, options;
  buffer += "\n                                                ";
  stack1 = (helper = helpers.if_eq || (depth0 && depth0.if_eq),options={hash:{},inverse:self.program(96, program96, data),fn:self.program(94, program94, data),data:data},helper ? helper.call(depth0, ((stack1 = (depth0 && depth0.acceptability)),stack1 == null || stack1 === false ? stack1 : stack1.conceptId), "900000000000548007", options) : helperMissing.call(depth0, "if_eq", ((stack1 = (depth0 && depth0.acceptability)),stack1 == null || stack1 === false ? stack1 : stack1.conceptId), "900000000000548007", options));
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n                                                "
    + escapeExpression((helper = helpers.included || (depth0 && depth0.included),options={hash:{},data:data},helper ? helper.call(depth0, true, options) : helperMissing.call(depth0, "included", true, options)))
    + "\n                                            ";
  return buffer;
  }
function program94(depth0,data) {
  
  
  return "\n                                                    <span class='i18n' data-i18n-id='i18n_preferred'>Preferred</span>\n                                                ";
  }

function program96(depth0,data) {
  
  
  return "\n                                                    <span class='i18n' data-i18n-id='i18n_acceptable'>Acceptable</span>\n                                                ";
  }

function program98(depth0,data) {
  
  
  return "\n                                        <span class='i18n' data-i18n-id='i18n_not_acceptable'>Not acceptable</span>\n                                    ";
  }

function program100(depth0,data,depth4,depth5) {
  
  var buffer = "", stack1;
  buffer += "\n                            ";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.active), {hash:{},inverse:self.noop,fn:self.programWithDepth(101, program101, data, depth4, depth5),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n                        ";
  return buffer;
  }
function program101(depth0,data,depth5,depth6) {
  
  var buffer = "", stack1, helper, options;
  buffer += "\n                                <tr class='";
  stack1 = (helper = helpers.if_eq || (depth0 && depth0.if_eq),options={hash:{},inverse:self.program(10, program10, data),fn:self.program(8, program8, data),data:data},helper ? helper.call(depth0, ((stack1 = (depth0 && depth0.type)),stack1 == null || stack1 === false ? stack1 : stack1.conceptId), "900000000000003001", options) : helperMissing.call(depth0, "if_eq", ((stack1 = (depth0 && depth0.type)),stack1 == null || stack1 === false ? stack1 : stack1.conceptId), "900000000000003001", options));
  if(stack1 || stack1 === 0) { buffer += stack1; }
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.active), {hash:{},inverse:self.program(14, program14, data),fn:self.program(12, program12, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  stack1 = (helper = helpers.if_eq || (depth0 && depth0.if_eq),options={hash:{},inverse:self.noop,fn:self.program(16, program16, data),data:data},helper ? helper.call(depth0, (depth0 && depth0.effectiveTime), ((stack1 = (depth6 && depth6.options)),stack1 == null || stack1 === false ? stack1 : stack1.highlightByEffectiveTime), options) : helperMissing.call(depth0, "if_eq", (depth0 && depth0.effectiveTime), ((stack1 = (depth6 && depth6.options)),stack1 == null || stack1 === false ? stack1 : stack1.highlightByEffectiveTime), options));
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "'>\n                                    <td>\n                                        ";
  stack1 = (helper = helpers.if_eq || (depth0 && depth0.if_eq),options={hash:{},inverse:self.program(104, program104, data),fn:self.program(102, program102, data),data:data},helper ? helper.call(depth0, ((stack1 = (depth0 && depth0.type)),stack1 == null || stack1 === false ? stack1 : stack1.conceptId), "900000000000003001", options) : helperMissing.call(depth0, "if_eq", ((stack1 = (depth0 && depth0.type)),stack1 == null || stack1 === false ? stack1 : stack1.conceptId), "900000000000003001", options));
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n\n                                        ";
  stack1 = (helper = helpers.if_eq || (depth0 && depth0.if_eq),options={hash:{},inverse:self.programWithDepth(112, program112, data, depth6),fn:self.program(110, program110, data),data:data},helper ? helper.call(depth0, (depth0 && depth0.langMemberships), "undefined", options) : helperMissing.call(depth0, "if_eq", (depth0 && depth0.langMemberships), "undefined", options));
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n                                        ";
  stack1 = (helper = helpers.preferred || (depth0 && depth0.preferred),options={hash:{},inverse:self.program(125, program125, data),fn:self.program(120, program120, data),data:data},helper ? helper.call(depth0, "get", options) : helperMissing.call(depth0, "preferred", "get", options));
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n\n                                        &nbsp;&nbsp;&nbsp;";
  if (helper = helpers.term) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.term); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "</td>\n                                    ";
  stack1 = helpers['if'].call(depth0, ((stack1 = (depth5 && depth5.options)),stack1 == null || stack1 === false ? stack1 : stack1.showIds), {hash:{},inverse:self.noop,fn:self.program(130, program130, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n\n                                    <td>\n                                        "
    + escapeExpression((helper = helpers.included || (depth5 && depth5.included),options={hash:{},data:data},helper ? helper.call(depth0, false, options) : helperMissing.call(depth0, "included", false, options)))
    + "\n                                        ";
  stack1 = (helper = helpers.if_eq || (depth0 && depth0.if_eq),options={hash:{},inverse:self.programWithDepth(132, program132, data, depth6),fn:self.program(110, program110, data),data:data},helper ? helper.call(depth0, (depth0 && depth0.langMemberships), "undefined", options) : helperMissing.call(depth0, "if_eq", (depth0 && depth0.langMemberships), "undefined", options));
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n\n                                        ";
  stack1 = (helper = helpers.included || (depth0 && depth0.included),options={hash:{},inverse:self.program(139, program139, data),fn:self.program(110, program110, data),data:data},helper ? helper.call(depth0, "get", options) : helperMissing.call(depth0, "included", "get", options));
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n                                        <button type=\"button\" class=\"btn btn-link unobtrusive-icon more-fields-button pull-right\" data-container=\"body\" data-toggle=\"popover\" data-placement=\"left\" data-content=\"\n                                        <table border='1'><tr><th style='padding: 3px;'>DescriptionId</th><th style='padding: 3px;'>Type</th><th style='padding: 3px;'>Language</th><th style='padding: 3px;'>Case Significance</th><th style='padding: 3px;'>Effective Time</th><th style='padding: 3px;'>ModuleId</th></tr>\n                                                <tr><td style='padding: 3px;'>";
  if (helper = helpers.descriptionId) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.descriptionId); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "</td><td style='padding: 3px;'>"
    + escapeExpression((helper = helpers.removeSemtag || (depth0 && depth0.removeSemtag),options={hash:{},data:data},helper ? helper.call(depth0, ((stack1 = (depth0 && depth0.type)),stack1 == null || stack1 === false ? stack1 : stack1.defaultTerm), options) : helperMissing.call(depth0, "removeSemtag", ((stack1 = (depth0 && depth0.type)),stack1 == null || stack1 === false ? stack1 : stack1.defaultTerm), options)))
    + "</td><td style='padding: 3px;'>";
  if (helper = helpers.lang) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.lang); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "</td><td style='padding: 3px;'>"
    + escapeExpression((helper = helpers.removeSemtag || (depth0 && depth0.removeSemtag),options={hash:{},data:data},helper ? helper.call(depth0, ((stack1 = (depth0 && depth0.ics)),stack1 == null || stack1 === false ? stack1 : stack1.defaultTerm), options) : helperMissing.call(depth0, "removeSemtag", ((stack1 = (depth0 && depth0.ics)),stack1 == null || stack1 === false ? stack1 : stack1.defaultTerm), options)))
    + "</td><td style='padding: 3px;'>";
  if (helper = helpers.effectiveTime) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.effectiveTime); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "</td><td style='padding: 3px;'>";
  if (helper = helpers.module) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.module); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "</td></tr>\n                                        </table>\n                                        \" data-html=\"true\"><i class=\"glyphicon glyphicon-info-sign\"></i></button>\n                                    </td>\n                                </tr>\n                            ";
  return buffer;
  }
function program102(depth0,data) {
  
  
  return "\n                                            <span rel=\"tooltip-right\" title=\"F\">F</span>\n                                        ";
  }

function program104(depth0,data) {
  
  var buffer = "", stack1, helper, options;
  buffer += "\n                                            ";
  stack1 = (helper = helpers.if_eq || (depth0 && depth0.if_eq),options={hash:{},inverse:self.program(107, program107, data),fn:self.program(105, program105, data),data:data},helper ? helper.call(depth0, ((stack1 = (depth0 && depth0.type)),stack1 == null || stack1 === false ? stack1 : stack1.conceptId), "900000000000013009", options) : helperMissing.call(depth0, "if_eq", ((stack1 = (depth0 && depth0.type)),stack1 == null || stack1 === false ? stack1 : stack1.conceptId), "900000000000013009", options));
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n                                        ";
  return buffer;
  }
function program105(depth0,data) {
  
  
  return "\n                                                <span rel=\"tooltip-right\" title=\"S\">S</span>\n                                            ";
  }

function program107(depth0,data) {
  
  var buffer = "", stack1, helper, options;
  buffer += "\n                                                ";
  stack1 = (helper = helpers.if_eq || (depth0 && depth0.if_eq),options={hash:{},inverse:self.noop,fn:self.program(108, program108, data),data:data},helper ? helper.call(depth0, ((stack1 = (depth0 && depth0.type)),stack1 == null || stack1 === false ? stack1 : stack1.conceptId), "900000000000550004", options) : helperMissing.call(depth0, "if_eq", ((stack1 = (depth0 && depth0.type)),stack1 == null || stack1 === false ? stack1 : stack1.conceptId), "900000000000550004", options));
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n                                            ";
  return buffer;
  }
function program108(depth0,data) {
  
  
  return "\n                                                    <span rel=\"tooltip-right\" title=\"D\">D</span>\n                                                ";
  }

function program110(depth0,data) {
  
  
  return "\n                                        ";
  }

function program112(depth0,data,depth7) {
  
  var buffer = "", stack1;
  buffer += "\n                                            ";
  stack1 = helpers.each.call(depth0, (depth0 && depth0.langMemberships), {hash:{},inverse:self.noop,fn:self.programWithDepth(113, program113, data, depth7),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n                                        ";
  return buffer;
  }
function program113(depth0,data,depth8) {
  
  var buffer = "", stack1, helper, options;
  buffer += "\n                                                ";
  stack1 = (helper = helpers.if_eq || (depth0 && depth0.if_eq),options={hash:{},inverse:self.noop,fn:self.program(114, program114, data),data:data},helper ? helper.call(depth0, ((stack1 = (depth0 && depth0.refset)),stack1 == null || stack1 === false ? stack1 : stack1.conceptId), ((stack1 = (depth8 && depth8.options)),stack1 == null || stack1 === false ? stack1 : stack1.langRefset), options) : helperMissing.call(depth0, "if_eq", ((stack1 = (depth0 && depth0.refset)),stack1 == null || stack1 === false ? stack1 : stack1.conceptId), ((stack1 = (depth8 && depth8.options)),stack1 == null || stack1 === false ? stack1 : stack1.langRefset), options));
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n                                            ";
  return buffer;
  }
function program114(depth0,data) {
  
  var buffer = "", stack1, helper, options;
  buffer += "\n                                                    ";
  stack1 = (helper = helpers.if_eq || (depth0 && depth0.if_eq),options={hash:{},inverse:self.program(117, program117, data),fn:self.program(115, program115, data),data:data},helper ? helper.call(depth0, ((stack1 = (depth0 && depth0.acceptability)),stack1 == null || stack1 === false ? stack1 : stack1.conceptId), "900000000000548007", options) : helperMissing.call(depth0, "if_eq", ((stack1 = (depth0 && depth0.acceptability)),stack1 == null || stack1 === false ? stack1 : stack1.conceptId), "900000000000548007", options));
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n                                                ";
  return buffer;
  }
function program115(depth0,data) {
  
  var buffer = "", helper, options;
  buffer += "\n                                                        <!--isPreferred = true;-->\n                                                        "
    + escapeExpression((helper = helpers.preferred || (depth0 && depth0.preferred),options={hash:{},data:data},helper ? helper.call(depth0, true, options) : helperMissing.call(depth0, "preferred", true, options)))
    + "\n                                                    ";
  return buffer;
  }

function program117(depth0,data) {
  
  var buffer = "", stack1, helper, options;
  buffer += "\n                                                        ";
  stack1 = (helper = helpers.if_eq || (depth0 && depth0.if_eq),options={hash:{},inverse:self.noop,fn:self.program(118, program118, data),data:data},helper ? helper.call(depth0, ((stack1 = (depth0 && depth0.acceptability)),stack1 == null || stack1 === false ? stack1 : stack1.conceptId), "900000000000549004", options) : helperMissing.call(depth0, "if_eq", ((stack1 = (depth0 && depth0.acceptability)),stack1 == null || stack1 === false ? stack1 : stack1.conceptId), "900000000000549004", options));
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n                                                    ";
  return buffer;
  }
function program118(depth0,data) {
  
  var buffer = "", helper, options;
  buffer += "\n                                                            <!--isAcceptable = true;-->\n                                                            "
    + escapeExpression((helper = helpers.acceptable || (depth0 && depth0.acceptable),options={hash:{},data:data},helper ? helper.call(depth0, true, options) : helperMissing.call(depth0, "acceptable", true, options)))
    + "\n                                                        ";
  return buffer;
  }

function program120(depth0,data) {
  
  var buffer = "", stack1, helper, options;
  buffer += "\n                                            ";
  stack1 = (helper = helpers.if_eq || (depth0 && depth0.if_eq),options={hash:{},inverse:self.program(123, program123, data),fn:self.program(121, program121, data),data:data},helper ? helper.call(depth0, ((stack1 = (depth0 && depth0.type)),stack1 == null || stack1 === false ? stack1 : stack1.conceptId), "900000000000003001", options) : helperMissing.call(depth0, "if_eq", ((stack1 = (depth0 && depth0.type)),stack1 == null || stack1 === false ? stack1 : stack1.conceptId), "900000000000003001", options));
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n                                        ";
  return buffer;
  }
function program121(depth0,data) {
  
  
  return "\n                                                &nbsp;<span class=\"glyphicon glyphicon-star-empty\" rel=\"tooltip-right\" title=\"Preferred\"></span>\n                                            ";
  }

function program123(depth0,data) {
  
  
  return "\n                                                &nbsp;<span class=\"glyphicon glyphicon-star\" rel=\"tooltip-right\" title=\"Preferred\"></span>\n                                            ";
  }

function program125(depth0,data) {
  
  var buffer = "", stack1, helper, options;
  buffer += "\n                                            ";
  stack1 = (helper = helpers.acceptable || (depth0 && depth0.acceptable),options={hash:{},inverse:self.program(128, program128, data),fn:self.program(126, program126, data),data:data},helper ? helper.call(depth0, "get", options) : helperMissing.call(depth0, "acceptable", "get", options));
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n                                        ";
  return buffer;
  }
function program126(depth0,data) {
  
  
  return "\n                                                &nbsp;<span rel=\"tooltip-right\" title=\"Acceptable\">&#10004;</span></span>\n                                            ";
  }

function program128(depth0,data) {
  
  
  return "\n                                                &nbsp;&nbsp;&nbsp;\n                                            ";
  }

function program130(depth0,data) {
  
  var buffer = "", stack1, helper;
  buffer += "\n                                        <td>";
  if (helper = helpers.descriptionId) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.descriptionId); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "</td>\n                                    ";
  return buffer;
  }

function program132(depth0,data,depth7) {
  
  var buffer = "", stack1;
  buffer += "\n                                            ";
  stack1 = helpers.each.call(depth0, (depth0 && depth0.langMemberships), {hash:{},inverse:self.noop,fn:self.programWithDepth(133, program133, data, depth7),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n                                        ";
  return buffer;
  }
function program133(depth0,data,depth8) {
  
  var buffer = "", stack1, helper, options;
  buffer += "\n                                                ";
  stack1 = (helper = helpers.if_eq || (depth0 && depth0.if_eq),options={hash:{},inverse:self.noop,fn:self.program(134, program134, data),data:data},helper ? helper.call(depth0, ((stack1 = (depth0 && depth0.refset)),stack1 == null || stack1 === false ? stack1 : stack1.conceptId), ((stack1 = (depth8 && depth8.options)),stack1 == null || stack1 === false ? stack1 : stack1.langRefset), options) : helperMissing.call(depth0, "if_eq", ((stack1 = (depth0 && depth0.refset)),stack1 == null || stack1 === false ? stack1 : stack1.conceptId), ((stack1 = (depth8 && depth8.options)),stack1 == null || stack1 === false ? stack1 : stack1.langRefset), options));
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n                                            ";
  return buffer;
  }
function program134(depth0,data) {
  
  var buffer = "", stack1, helper, options;
  buffer += "\n                                                    ";
  stack1 = (helper = helpers.if_eq || (depth0 && depth0.if_eq),options={hash:{},inverse:self.program(137, program137, data),fn:self.program(135, program135, data),data:data},helper ? helper.call(depth0, ((stack1 = (depth0 && depth0.acceptability)),stack1 == null || stack1 === false ? stack1 : stack1.conceptId), "900000000000548007", options) : helperMissing.call(depth0, "if_eq", ((stack1 = (depth0 && depth0.acceptability)),stack1 == null || stack1 === false ? stack1 : stack1.conceptId), "900000000000548007", options));
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n                                                    "
    + escapeExpression((helper = helpers.included || (depth0 && depth0.included),options={hash:{},data:data},helper ? helper.call(depth0, true, options) : helperMissing.call(depth0, "included", true, options)))
    + "\n                                                ";
  return buffer;
  }
function program135(depth0,data) {
  
  
  return "\n                                                        <span class='i18n' data-i18n-id='i18n_preferred'>Preferred</span>\n                                                    ";
  }

function program137(depth0,data) {
  
  
  return "\n                                                        <span class='i18n' data-i18n-id='i18n_acceptable'>Acceptable</span>\n                                                    ";
  }

function program139(depth0,data) {
  
  
  return "\n                                            <span class='i18n' data-i18n-id='i18n_not_acceptable'>Not acceptable</span>\n                                        ";
  }

function program141(depth0,data,depth3) {
  
  var buffer = "", stack1;
  buffer += "\n                    ";
  stack1 = helpers['if'].call(depth0, ((stack1 = (depth3 && depth3.options)),stack1 == null || stack1 === false ? stack1 : stack1.displayInactiveDescriptions), {hash:{},inverse:self.programWithDepth(182, program182, data, depth3),fn:self.programWithDepth(142, program142, data, depth3),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n                    <!--descDetailsHtml = descDetailsHtml + row;-->\n                ";
  return buffer;
  }
function program142(depth0,data,depth4) {
  
  var buffer = "", stack1, helper, options;
  buffer += "\n                        <tr class='";
  stack1 = (helper = helpers.if_eq || (depth0 && depth0.if_eq),options={hash:{},inverse:self.program(10, program10, data),fn:self.program(8, program8, data),data:data},helper ? helper.call(depth0, ((stack1 = (depth0 && depth0.type)),stack1 == null || stack1 === false ? stack1 : stack1.conceptId), "900000000000003001", options) : helperMissing.call(depth0, "if_eq", ((stack1 = (depth0 && depth0.type)),stack1 == null || stack1 === false ? stack1 : stack1.conceptId), "900000000000003001", options));
  if(stack1 || stack1 === 0) { buffer += stack1; }
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.active), {hash:{},inverse:self.program(14, program14, data),fn:self.program(12, program12, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  stack1 = (helper = helpers.if_eq || (depth0 && depth0.if_eq),options={hash:{},inverse:self.noop,fn:self.program(16, program16, data),data:data},helper ? helper.call(depth0, (depth0 && depth0.effectiveTime), ((stack1 = (depth4 && depth4.options)),stack1 == null || stack1 === false ? stack1 : stack1.highlightByEffectiveTime), options) : helperMissing.call(depth0, "if_eq", (depth0 && depth0.effectiveTime), ((stack1 = (depth4 && depth4.options)),stack1 == null || stack1 === false ? stack1 : stack1.highlightByEffectiveTime), options));
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "'>\n                            <td>\n                                ";
  stack1 = (helper = helpers.if_eq || (depth0 && depth0.if_eq),options={hash:{},inverse:self.program(145, program145, data),fn:self.program(143, program143, data),data:data},helper ? helper.call(depth0, ((stack1 = (depth0 && depth0.type)),stack1 == null || stack1 === false ? stack1 : stack1.conceptId), "900000000000003001", options) : helperMissing.call(depth0, "if_eq", ((stack1 = (depth0 && depth0.type)),stack1 == null || stack1 === false ? stack1 : stack1.conceptId), "900000000000003001", options));
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n\n                                ";
  stack1 = (helper = helpers.if_eq || (depth0 && depth0.if_eq),options={hash:{},inverse:self.programWithDepth(153, program153, data, depth4),fn:self.program(151, program151, data),data:data},helper ? helper.call(depth0, (depth0 && depth0.langMemberships), "undefined", options) : helperMissing.call(depth0, "if_eq", (depth0 && depth0.langMemberships), "undefined", options));
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n                                ";
  stack1 = (helper = helpers.preferred || (depth0 && depth0.preferred),options={hash:{},inverse:self.program(166, program166, data),fn:self.program(161, program161, data),data:data},helper ? helper.call(depth0, "get", options) : helperMissing.call(depth0, "preferred", "get", options));
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n\n                                &nbsp;&nbsp;&nbsp;";
  if (helper = helpers.term) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.term); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "</td>\n                            ";
  stack1 = helpers['if'].call(depth0, ((stack1 = (depth4 && depth4.options)),stack1 == null || stack1 === false ? stack1 : stack1.showIds), {hash:{},inverse:self.noop,fn:self.program(171, program171, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n\n                            <td>\n                                "
    + escapeExpression((helper = helpers.included || (depth4 && depth4.included),options={hash:{},data:data},helper ? helper.call(depth0, false, options) : helperMissing.call(depth0, "included", false, options)))
    + "\n                                ";
  stack1 = (helper = helpers.if_eq || (depth0 && depth0.if_eq),options={hash:{},inverse:self.programWithDepth(173, program173, data, depth4),fn:self.program(151, program151, data),data:data},helper ? helper.call(depth0, (depth0 && depth0.langMemberships), "undefined", options) : helperMissing.call(depth0, "if_eq", (depth0 && depth0.langMemberships), "undefined", options));
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n\n                                ";
  stack1 = (helper = helpers.included || (depth0 && depth0.included),options={hash:{},inverse:self.program(180, program180, data),fn:self.program(151, program151, data),data:data},helper ? helper.call(depth0, "get", options) : helperMissing.call(depth0, "included", "get", options));
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n                                <button type=\"button\" class=\"btn btn-link unobtrusive-icon more-fields-button pull-right\" data-container=\"body\" data-toggle=\"popover\" data-placement=\"left\" data-content=\"\n                                <table border='1'><tr><th style='padding: 3px;'>DescriptionId</th><th style='padding: 3px;'>Type</th><th style='padding: 3px;'>Language</th><th style='padding: 3px;'>Case Significance</th><th style='padding: 3px;'>Effective Time</th><th style='padding: 3px;'>ModuleId</th></tr>\n                                        <tr><td style='padding: 3px;'>";
  if (helper = helpers.descriptionId) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.descriptionId); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "</td><td style='padding: 3px;'>"
    + escapeExpression((helper = helpers.removeSemtag || (depth0 && depth0.removeSemtag),options={hash:{},data:data},helper ? helper.call(depth0, ((stack1 = (depth0 && depth0.type)),stack1 == null || stack1 === false ? stack1 : stack1.defaultTerm), options) : helperMissing.call(depth0, "removeSemtag", ((stack1 = (depth0 && depth0.type)),stack1 == null || stack1 === false ? stack1 : stack1.defaultTerm), options)))
    + "</td><td style='padding: 3px;'>";
  if (helper = helpers.lang) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.lang); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "</td><td style='padding: 3px;'>"
    + escapeExpression((helper = helpers.removeSemtag || (depth0 && depth0.removeSemtag),options={hash:{},data:data},helper ? helper.call(depth0, ((stack1 = (depth0 && depth0.ics)),stack1 == null || stack1 === false ? stack1 : stack1.defaultTerm), options) : helperMissing.call(depth0, "removeSemtag", ((stack1 = (depth0 && depth0.ics)),stack1 == null || stack1 === false ? stack1 : stack1.defaultTerm), options)))
    + "</td><td style='padding: 3px;'>";
  if (helper = helpers.effectiveTime) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.effectiveTime); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "</td><td style='padding: 3px;'>";
  if (helper = helpers.module) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.module); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "</td></tr>\n                                </table>\n                                \" data-html=\"true\"><i class=\"glyphicon glyphicon-info-sign\"></i></button>\n                            </td>\n                        </tr>\n                    ";
  return buffer;
  }
function program143(depth0,data) {
  
  
  return "\n                                    <span rel=\"tooltip-right\" title=\"F\">F</span>\n                                ";
  }

function program145(depth0,data) {
  
  var buffer = "", stack1, helper, options;
  buffer += "\n                                    ";
  stack1 = (helper = helpers.if_eq || (depth0 && depth0.if_eq),options={hash:{},inverse:self.program(148, program148, data),fn:self.program(146, program146, data),data:data},helper ? helper.call(depth0, ((stack1 = (depth0 && depth0.type)),stack1 == null || stack1 === false ? stack1 : stack1.conceptId), "900000000000013009", options) : helperMissing.call(depth0, "if_eq", ((stack1 = (depth0 && depth0.type)),stack1 == null || stack1 === false ? stack1 : stack1.conceptId), "900000000000013009", options));
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n                                ";
  return buffer;
  }
function program146(depth0,data) {
  
  
  return "\n                                        <span rel=\"tooltip-right\" title=\"S\">S</span>\n                                    ";
  }

function program148(depth0,data) {
  
  var buffer = "", stack1, helper, options;
  buffer += "\n                                        ";
  stack1 = (helper = helpers.if_eq || (depth0 && depth0.if_eq),options={hash:{},inverse:self.noop,fn:self.program(149, program149, data),data:data},helper ? helper.call(depth0, ((stack1 = (depth0 && depth0.type)),stack1 == null || stack1 === false ? stack1 : stack1.conceptId), "900000000000550004", options) : helperMissing.call(depth0, "if_eq", ((stack1 = (depth0 && depth0.type)),stack1 == null || stack1 === false ? stack1 : stack1.conceptId), "900000000000550004", options));
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n                                    ";
  return buffer;
  }
function program149(depth0,data) {
  
  
  return "\n                                            <span rel=\"tooltip-right\" title=\"D\">D</span>\n                                        ";
  }

function program151(depth0,data) {
  
  
  return "\n                                ";
  }

function program153(depth0,data,depth5) {
  
  var buffer = "", stack1;
  buffer += "\n                                    ";
  stack1 = helpers.each.call(depth0, (depth0 && depth0.langMemberships), {hash:{},inverse:self.noop,fn:self.programWithDepth(154, program154, data, depth5),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n                                ";
  return buffer;
  }
function program154(depth0,data,depth6) {
  
  var buffer = "", stack1, helper, options;
  buffer += "\n                                        ";
  stack1 = (helper = helpers.if_eq || (depth0 && depth0.if_eq),options={hash:{},inverse:self.noop,fn:self.program(155, program155, data),data:data},helper ? helper.call(depth0, ((stack1 = (depth0 && depth0.refset)),stack1 == null || stack1 === false ? stack1 : stack1.conceptId), ((stack1 = (depth6 && depth6.options)),stack1 == null || stack1 === false ? stack1 : stack1.langRefset), options) : helperMissing.call(depth0, "if_eq", ((stack1 = (depth0 && depth0.refset)),stack1 == null || stack1 === false ? stack1 : stack1.conceptId), ((stack1 = (depth6 && depth6.options)),stack1 == null || stack1 === false ? stack1 : stack1.langRefset), options));
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n                                    ";
  return buffer;
  }
function program155(depth0,data) {
  
  var buffer = "", stack1, helper, options;
  buffer += "\n                                            ";
  stack1 = (helper = helpers.if_eq || (depth0 && depth0.if_eq),options={hash:{},inverse:self.program(158, program158, data),fn:self.program(156, program156, data),data:data},helper ? helper.call(depth0, ((stack1 = (depth0 && depth0.acceptability)),stack1 == null || stack1 === false ? stack1 : stack1.conceptId), "900000000000548007", options) : helperMissing.call(depth0, "if_eq", ((stack1 = (depth0 && depth0.acceptability)),stack1 == null || stack1 === false ? stack1 : stack1.conceptId), "900000000000548007", options));
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n                                        ";
  return buffer;
  }
function program156(depth0,data) {
  
  var buffer = "", helper, options;
  buffer += "\n                                                <!--isPreferred = true;-->\n                                                "
    + escapeExpression((helper = helpers.preferred || (depth0 && depth0.preferred),options={hash:{},data:data},helper ? helper.call(depth0, true, options) : helperMissing.call(depth0, "preferred", true, options)))
    + "\n                                            ";
  return buffer;
  }

function program158(depth0,data) {
  
  var buffer = "", stack1, helper, options;
  buffer += "\n                                                ";
  stack1 = (helper = helpers.if_eq || (depth0 && depth0.if_eq),options={hash:{},inverse:self.noop,fn:self.program(159, program159, data),data:data},helper ? helper.call(depth0, ((stack1 = (depth0 && depth0.acceptability)),stack1 == null || stack1 === false ? stack1 : stack1.conceptId), "900000000000549004", options) : helperMissing.call(depth0, "if_eq", ((stack1 = (depth0 && depth0.acceptability)),stack1 == null || stack1 === false ? stack1 : stack1.conceptId), "900000000000549004", options));
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n                                            ";
  return buffer;
  }
function program159(depth0,data) {
  
  var buffer = "", helper, options;
  buffer += "\n                                                    <!--isAcceptable = true;-->\n                                                    "
    + escapeExpression((helper = helpers.acceptable || (depth0 && depth0.acceptable),options={hash:{},data:data},helper ? helper.call(depth0, true, options) : helperMissing.call(depth0, "acceptable", true, options)))
    + "\n                                                ";
  return buffer;
  }

function program161(depth0,data) {
  
  var buffer = "", stack1, helper, options;
  buffer += "\n                                    ";
  stack1 = (helper = helpers.if_eq || (depth0 && depth0.if_eq),options={hash:{},inverse:self.program(164, program164, data),fn:self.program(162, program162, data),data:data},helper ? helper.call(depth0, ((stack1 = (depth0 && depth0.type)),stack1 == null || stack1 === false ? stack1 : stack1.conceptId), "900000000000003001", options) : helperMissing.call(depth0, "if_eq", ((stack1 = (depth0 && depth0.type)),stack1 == null || stack1 === false ? stack1 : stack1.conceptId), "900000000000003001", options));
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n                                ";
  return buffer;
  }
function program162(depth0,data) {
  
  
  return "\n                                        &nbsp;<span class=\"glyphicon glyphicon-star-empty\" rel=\"tooltip-right\" title=\"Preferred\"></span>\n                                    ";
  }

function program164(depth0,data) {
  
  
  return "\n                                        &nbsp;<span class=\"glyphicon glyphicon-star\" rel=\"tooltip-right\" title=\"Preferred\"></span>\n                                    ";
  }

function program166(depth0,data) {
  
  var buffer = "", stack1, helper, options;
  buffer += "\n                                    ";
  stack1 = (helper = helpers.acceptable || (depth0 && depth0.acceptable),options={hash:{},inverse:self.program(169, program169, data),fn:self.program(167, program167, data),data:data},helper ? helper.call(depth0, "get", options) : helperMissing.call(depth0, "acceptable", "get", options));
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n                                ";
  return buffer;
  }
function program167(depth0,data) {
  
  
  return "\n                                        &nbsp;<span rel=\"tooltip-right\" title=\"Acceptable\">&#10004;</span></span>\n                                    ";
  }

function program169(depth0,data) {
  
  
  return "\n                                        &nbsp;&nbsp;&nbsp;\n                                    ";
  }

function program171(depth0,data) {
  
  var buffer = "", stack1, helper;
  buffer += "\n                                <td>";
  if (helper = helpers.descriptionId) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.descriptionId); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "</td>\n                            ";
  return buffer;
  }

function program173(depth0,data,depth5) {
  
  var buffer = "", stack1;
  buffer += "\n                                    ";
  stack1 = helpers.each.call(depth0, (depth0 && depth0.langMemberships), {hash:{},inverse:self.noop,fn:self.programWithDepth(174, program174, data, depth5),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n                                ";
  return buffer;
  }
function program174(depth0,data,depth6) {
  
  var buffer = "", stack1, helper, options;
  buffer += "\n                                        ";
  stack1 = (helper = helpers.if_eq || (depth0 && depth0.if_eq),options={hash:{},inverse:self.noop,fn:self.program(175, program175, data),data:data},helper ? helper.call(depth0, ((stack1 = (depth0 && depth0.refset)),stack1 == null || stack1 === false ? stack1 : stack1.conceptId), ((stack1 = (depth6 && depth6.options)),stack1 == null || stack1 === false ? stack1 : stack1.langRefset), options) : helperMissing.call(depth0, "if_eq", ((stack1 = (depth0 && depth0.refset)),stack1 == null || stack1 === false ? stack1 : stack1.conceptId), ((stack1 = (depth6 && depth6.options)),stack1 == null || stack1 === false ? stack1 : stack1.langRefset), options));
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n                                    ";
  return buffer;
  }
function program175(depth0,data) {
  
  var buffer = "", stack1, helper, options;
  buffer += "\n                                            ";
  stack1 = (helper = helpers.if_eq || (depth0 && depth0.if_eq),options={hash:{},inverse:self.program(178, program178, data),fn:self.program(176, program176, data),data:data},helper ? helper.call(depth0, ((stack1 = (depth0 && depth0.acceptability)),stack1 == null || stack1 === false ? stack1 : stack1.conceptId), "900000000000548007", options) : helperMissing.call(depth0, "if_eq", ((stack1 = (depth0 && depth0.acceptability)),stack1 == null || stack1 === false ? stack1 : stack1.conceptId), "900000000000548007", options));
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n                                            "
    + escapeExpression((helper = helpers.included || (depth0 && depth0.included),options={hash:{},data:data},helper ? helper.call(depth0, true, options) : helperMissing.call(depth0, "included", true, options)))
    + "\n                                        ";
  return buffer;
  }
function program176(depth0,data) {
  
  
  return "\n                                                <span class='i18n' data-i18n-id='i18n_preferred'>Preferred</span>\n                                            ";
  }

function program178(depth0,data) {
  
  
  return "\n                                                <span class='i18n' data-i18n-id='i18n_acceptable'>Acceptable</span>\n                                            ";
  }

function program180(depth0,data) {
  
  
  return "\n                                    <span class='i18n' data-i18n-id='i18n_not_acceptable'>Not acceptable</span>\n                                ";
  }

function program182(depth0,data,depth4) {
  
  var buffer = "", stack1;
  buffer += "\n                        ";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.active), {hash:{},inverse:self.noop,fn:self.programWithDepth(60, program60, data, depth4),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n                    ";
  return buffer;
  }

  buffer += "<table class='table table-bordered' id = '";
  if (helper = helpers.divElementId) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.divElementId); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "-descriptions-panel-table'>\n    <thead><tr>\n        <th><span class='i18n' data-i18n-id='i18n_term'>Term</span></th>\n        ";
  stack1 = helpers['if'].call(depth0, ((stack1 = (depth0 && depth0.options)),stack1 == null || stack1 === false ? stack1 : stack1.showIds), {hash:{},inverse:self.noop,fn:self.program(1, program1, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n        <th><span class='i18n' data-i18n-id='i18n_acceptability'>Acceptability</span>";
  if (helper = helpers.languageName) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.languageName); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "</th>\n        </tr>\n    </thead>\n    <tbody>\n        ";
  stack1 = helpers.each.call(depth0, (depth0 && depth0.allDescriptions), {hash:{},inverse:self.noop,fn:self.programWithDepth(3, program3, data, depth0),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n    </tbody>\n</table>";
  return buffer;
  });

this["JST"]["views/conceptDetailsPlugin/tabs/details/rels-panel.hbs"] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, helper, options, self=this, helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression, functionType="function";

function program1(depth0,data) {
  
  var buffer = "", stack1, helper, options;
  buffer += "\n        ";
  stack1 = (helper = helpers.if_eq || (depth0 && depth0.if_eq),options={hash:{},inverse:self.noop,fn:self.program(2, program2, data),data:data},helper ? helper.call(depth0, ((stack1 = (depth0 && depth0.firstMatch)),stack1 == null || stack1 === false ? stack1 : stack1.statedRelationships), "undefined", options) : helperMissing.call(depth0, "if_eq", ((stack1 = (depth0 && depth0.firstMatch)),stack1 == null || stack1 === false ? stack1 : stack1.statedRelationships), "undefined", options));
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n    ";
  return buffer;
  }
function program2(depth0,data) {
  
  
  return "\n            <tr><td colspan='4'><span class='text-muted'>No relationships</span></td></tr>\n        ";
  }

function program4(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "\n\n        ";
  stack1 = helpers.each.call(depth0, ((stack1 = (depth0 && depth0.firstMatch)),stack1 == null || stack1 === false ? stack1 : stack1.relationships), {hash:{},inverse:self.noop,fn:self.programWithDepth(5, program5, data, depth0),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n    ";
  return buffer;
  }
function program5(depth0,data,depth1) {
  
  var buffer = "", stack1;
  buffer += "\n            ";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.active), {hash:{},inverse:self.noop,fn:self.programWithDepth(6, program6, data, depth1),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n        ";
  return buffer;
  }
function program6(depth0,data,depth2) {
  
  var buffer = "", stack1, helper, options;
  buffer += "\n                ";
  stack1 = (helper = helpers.if_eq || (depth0 && depth0.if_eq),options={hash:{},inverse:self.programWithDepth(9, program9, data, depth2),fn:self.programWithDepth(7, program7, data, depth2),data:data},helper ? helper.call(depth0, ((stack1 = (depth0 && depth0.type)),stack1 == null || stack1 === false ? stack1 : stack1.conceptId), 116680003, options) : helperMissing.call(depth0, "if_eq", ((stack1 = (depth0 && depth0.type)),stack1 == null || stack1 === false ? stack1 : stack1.conceptId), 116680003, options));
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n                <tr class='inferred-rel\n                            ";
  stack1 = (helper = helpers.if_eq || (depth0 && depth0.if_eq),options={hash:{},inverse:self.noop,fn:self.program(11, program11, data),data:data},helper ? helper.call(depth0, (depth0 && depth0.effectiveTime), ((stack1 = (depth0 && depth0.options)),stack1 == null || stack1 === false ? stack1 : stack1.highlightByEffectiveTime), options) : helperMissing.call(depth0, "if_eq", (depth0 && depth0.effectiveTime), ((stack1 = (depth0 && depth0.options)),stack1 == null || stack1 === false ? stack1 : stack1.highlightByEffectiveTime), options));
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n                            '>\n                    <td>\n                        ";
  stack1 = (helper = helpers.if_eq || (depth0 && depth0.if_eq),options={hash:{},inverse:self.program(15, program15, data),fn:self.program(13, program13, data),data:data},helper ? helper.call(depth0, ((stack1 = (depth0 && depth0.type)),stack1 == null || stack1 === false ? stack1 : stack1.definitionStatus), "Primitive", options) : helperMissing.call(depth0, "if_eq", ((stack1 = (depth0 && depth0.type)),stack1 == null || stack1 === false ? stack1 : stack1.definitionStatus), "Primitive", options));
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n                        "
    + escapeExpression(((stack1 = ((stack1 = (depth0 && depth0.type)),stack1 == null || stack1 === false ? stack1 : stack1.defaultTerm)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "\n                    </td>\n                    <td>\n                        ";
  stack1 = (helper = helpers.if_eq || (depth0 && depth0.if_eq),options={hash:{},inverse:self.program(19, program19, data),fn:self.program(17, program17, data),data:data},helper ? helper.call(depth0, ((stack1 = (depth0 && depth0.target)),stack1 == null || stack1 === false ? stack1 : stack1.definitionStatus), "Primitive", options) : helperMissing.call(depth0, "if_eq", ((stack1 = (depth0 && depth0.target)),stack1 == null || stack1 === false ? stack1 : stack1.definitionStatus), "Primitive", options));
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n                        "
    + escapeExpression(((stack1 = ((stack1 = (depth0 && depth0.target)),stack1 == null || stack1 === false ? stack1 : stack1.defaultTerm)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "</td>\n                    <td>";
  if (helper = helpers.groupId) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.groupId); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "</td>\n                    ";
  stack1 = (helper = helpers.if_eq || (depth0 && depth0.if_eq),options={hash:{},inverse:self.program(23, program23, data),fn:self.program(21, program21, data),data:data},helper ? helper.call(depth0, ((stack1 = (depth0 && depth0.charType)),stack1 == null || stack1 === false ? stack1 : stack1.conceptId), "900000000000010007", options) : helperMissing.call(depth0, "if_eq", ((stack1 = (depth0 && depth0.charType)),stack1 == null || stack1 === false ? stack1 : stack1.conceptId), "900000000000010007", options));
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n                    <button type=\"button\" class=\"btn btn-link unobtrusive-icon more-fields-button pull-right\" data-container=\"body\" data-toggle=\"popover\" data-placement=\"left\" data-content=\"\n                                <table border='1'><tr><th style='padding: 3px;'>TypeId</th><th style='padding: 3px;'>TargetId</th><th style='padding: 3px;'>Modifier</th><th style='padding: 3px;'>Effective Time</th><th style='padding: 3px;'>ModuleId</th></tr>\n                                    <tr><td style='padding: 3px;'>"
    + escapeExpression(((stack1 = ((stack1 = (depth0 && depth0.type)),stack1 == null || stack1 === false ? stack1 : stack1.conceptId)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "</td><td style='padding: 3px;'>"
    + escapeExpression(((stack1 = ((stack1 = (depth0 && depth0.target)),stack1 == null || stack1 === false ? stack1 : stack1.conceptId)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "</td><td style='padding: 3px;'>";
  if (helper = helpers.modifier) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.modifier); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "</td><td style='padding: 3px;'>";
  if (helper = helpers.effectiveTime) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.effectiveTime); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "</td><td style='padding: 3px;'>";
  if (helper = helpers.module) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.module); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "</td></tr>\n                                </table>\n                                \" data-html=\"true\"><i class=\"glyphicon glyphicon-info-sign\"></i></button>\n                </td>\n                </tr>\n            ";
  return buffer;
  }
function program7(depth0,data,depth3) {
  
  var buffer = "", helper, options;
  buffer += "\n                    "
    + escapeExpression((helper = helpers.push || (depth0 && depth0.push),options={hash:{},data:data},helper ? helper.call(depth0, depth0, (depth3 && depth3.inferredParents), options) : helperMissing.call(depth0, "push", depth0, (depth3 && depth3.inferredParents), options)))
    + "\n                ";
  return buffer;
  }

function program9(depth0,data,depth3) {
  
  var buffer = "", helper, options;
  buffer += "\n                    "
    + escapeExpression((helper = helpers.push || (depth0 && depth0.push),options={hash:{},data:data},helper ? helper.call(depth0, depth0, (depth3 && depth3.inferredRoles), options) : helperMissing.call(depth0, "push", depth0, (depth3 && depth3.inferredRoles), options)))
    + "\n                ";
  return buffer;
  }

function program11(depth0,data) {
  
  
  return "\n                                 highlightEffectiveTime\n                            ";
  }

function program13(depth0,data) {
  
  var buffer = "", stack1, helper;
  buffer += "\n                            <a href=\"javascript:void(0);\" style=\"color: inherit;text-decoration: inherit;\"><span draggable = \"true\" ondragstart=\"drag(event, '";
  if (helper = helpers.divElementId) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.divElementId); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "')\" class=\"badge alert-warning\"  data-concept-id=\""
    + escapeExpression(((stack1 = ((stack1 = (depth0 && depth0.type)),stack1 == null || stack1 === false ? stack1 : stack1.conceptId)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "\" data-term=\""
    + escapeExpression(((stack1 = ((stack1 = (depth0 && depth0.type)),stack1 == null || stack1 === false ? stack1 : stack1.defaultTerm)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "\" data-def-status=\""
    + escapeExpression(((stack1 = ((stack1 = (depth0 && depth0.type)),stack1 == null || stack1 === false ? stack1 : stack1.definitionStatus)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "\">&nbsp;</span></a>&nbsp;&nbsp;\n                        ";
  return buffer;
  }

function program15(depth0,data) {
  
  var buffer = "", stack1, helper;
  buffer += "\n                            <a href=\"javascript:void(0);\" style=\"color: inherit;text-decoration: inherit;\"><span draggable = \"true\" ondragstart=\"drag(event, '";
  if (helper = helpers.divElementId) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.divElementId); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "')\" class=\"badge alert-warning\"  data-concept-id=\""
    + escapeExpression(((stack1 = ((stack1 = (depth0 && depth0.type)),stack1 == null || stack1 === false ? stack1 : stack1.conceptId)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "\" data-term=\""
    + escapeExpression(((stack1 = ((stack1 = (depth0 && depth0.type)),stack1 == null || stack1 === false ? stack1 : stack1.defaultTerm)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "\" data-def-status=\""
    + escapeExpression(((stack1 = ((stack1 = (depth0 && depth0.type)),stack1 == null || stack1 === false ? stack1 : stack1.definitionStatus)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "\">&equiv;</span></a>&nbsp;&nbsp;\n                        ";
  return buffer;
  }

function program17(depth0,data) {
  
  var buffer = "", stack1, helper;
  buffer += "\n                            <a href=\"javascript:void(0);\" style=\"color: inherit;text-decoration: inherit;\"><span draggable = \"true\" ondragstart=\"drag(event, '";
  if (helper = helpers.divElementId) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.divElementId); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "')\" class=\"badge alert-warning\"  data-concept-id=\""
    + escapeExpression(((stack1 = ((stack1 = (depth0 && depth0.target)),stack1 == null || stack1 === false ? stack1 : stack1.conceptId)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "\" data-term=\""
    + escapeExpression(((stack1 = ((stack1 = (depth0 && depth0.target)),stack1 == null || stack1 === false ? stack1 : stack1.defaultTerm)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "\" data-def-status=\""
    + escapeExpression(((stack1 = ((stack1 = (depth0 && depth0.target)),stack1 == null || stack1 === false ? stack1 : stack1.definitionStatus)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "\">&nbsp;</span></a>&nbsp;&nbsp;\n                        ";
  return buffer;
  }

function program19(depth0,data) {
  
  var buffer = "", stack1, helper;
  buffer += "\n                            <a href=\"javascript:void(0);\" style=\"color: inherit;text-decoration: inherit;\"><span draggable = \"true\" ondragstart=\"drag(event, '";
  if (helper = helpers.divElementId) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.divElementId); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "')\" class=\"badge alert-warning\"  data-concept-id=\""
    + escapeExpression(((stack1 = ((stack1 = (depth0 && depth0.target)),stack1 == null || stack1 === false ? stack1 : stack1.conceptId)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "\" data-term=\""
    + escapeExpression(((stack1 = ((stack1 = (depth0 && depth0.target)),stack1 == null || stack1 === false ? stack1 : stack1.defaultTerm)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "\" data-def-status=\""
    + escapeExpression(((stack1 = ((stack1 = (depth0 && depth0.target)),stack1 == null || stack1 === false ? stack1 : stack1.definitionStatus)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "\">&equiv;</span></a>&nbsp;&nbsp;\n                        ";
  return buffer;
  }

function program21(depth0,data) {
  
  
  return "\n                    <td><span class='i18n' data-i18n-id='i18n_stated'>Stated</span>\n                    ";
  }

function program23(depth0,data) {
  
  var buffer = "", stack1, helper, options;
  buffer += "\n                        ";
  stack1 = (helper = helpers.if_eq || (depth0 && depth0.if_eq),options={hash:{},inverse:self.program(26, program26, data),fn:self.program(24, program24, data),data:data},helper ? helper.call(depth0, ((stack1 = (depth0 && depth0.charType)),stack1 == null || stack1 === false ? stack1 : stack1.conceptId), "900000000000011006", options) : helperMissing.call(depth0, "if_eq", ((stack1 = (depth0 && depth0.charType)),stack1 == null || stack1 === false ? stack1 : stack1.conceptId), "900000000000011006", options));
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n                    ";
  return buffer;
  }
function program24(depth0,data) {
  
  
  return "\n                        <td><span class='i18n' data-i18n-id='i18n_inferred'>Inferred</span>\n                        ";
  }

function program26(depth0,data) {
  
  
  return "\n                        <td><span class='i18n' data-i18n-id='i18n_other'>Other</span>\n                        ";
  }

function program28(depth0,data) {
  
  
  return "\n    ";
  }

function program30(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "\n\n        ";
  stack1 = helpers.each.call(depth0, ((stack1 = (depth0 && depth0.firstMatch)),stack1 == null || stack1 === false ? stack1 : stack1.statedRelationships), {hash:{},inverse:self.noop,fn:self.programWithDepth(31, program31, data, depth0),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n    ";
  return buffer;
  }
function program31(depth0,data,depth1) {
  
  var buffer = "", stack1;
  buffer += "\n            ";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.active), {hash:{},inverse:self.noop,fn:self.programWithDepth(32, program32, data, depth1),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n        ";
  return buffer;
  }
function program32(depth0,data,depth2) {
  
  var buffer = "", stack1, helper, options;
  buffer += "\n                ";
  stack1 = (helper = helpers.if_eq || (depth0 && depth0.if_eq),options={hash:{},inverse:self.programWithDepth(35, program35, data, depth2),fn:self.programWithDepth(33, program33, data, depth2),data:data},helper ? helper.call(depth0, ((stack1 = (depth0 && depth0.type)),stack1 == null || stack1 === false ? stack1 : stack1.conceptId), 116680003, options) : helperMissing.call(depth0, "if_eq", ((stack1 = (depth0 && depth0.type)),stack1 == null || stack1 === false ? stack1 : stack1.conceptId), 116680003, options));
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n                <tr class='stated-rel\n                            ";
  stack1 = (helper = helpers.if_eq || (depth0 && depth0.if_eq),options={hash:{},inverse:self.noop,fn:self.program(11, program11, data),data:data},helper ? helper.call(depth0, (depth0 && depth0.effectiveTime), ((stack1 = (depth0 && depth0.options)),stack1 == null || stack1 === false ? stack1 : stack1.highlightByEffectiveTime), options) : helperMissing.call(depth0, "if_eq", (depth0 && depth0.effectiveTime), ((stack1 = (depth0 && depth0.options)),stack1 == null || stack1 === false ? stack1 : stack1.highlightByEffectiveTime), options));
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n                            '>\n                    <td>\n                        ";
  stack1 = (helper = helpers.if_eq || (depth0 && depth0.if_eq),options={hash:{},inverse:self.program(15, program15, data),fn:self.program(13, program13, data),data:data},helper ? helper.call(depth0, ((stack1 = (depth0 && depth0.type)),stack1 == null || stack1 === false ? stack1 : stack1.definitionStatus), "Primitive", options) : helperMissing.call(depth0, "if_eq", ((stack1 = (depth0 && depth0.type)),stack1 == null || stack1 === false ? stack1 : stack1.definitionStatus), "Primitive", options));
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n                        "
    + escapeExpression(((stack1 = ((stack1 = (depth0 && depth0.type)),stack1 == null || stack1 === false ? stack1 : stack1.defaultTerm)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "</td>\n                    <td>\n                        ";
  stack1 = (helper = helpers.if_eq || (depth0 && depth0.if_eq),options={hash:{},inverse:self.program(19, program19, data),fn:self.program(17, program17, data),data:data},helper ? helper.call(depth0, ((stack1 = (depth0 && depth0.target)),stack1 == null || stack1 === false ? stack1 : stack1.definitionStatus), "Primitive", options) : helperMissing.call(depth0, "if_eq", ((stack1 = (depth0 && depth0.target)),stack1 == null || stack1 === false ? stack1 : stack1.definitionStatus), "Primitive", options));
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n                        "
    + escapeExpression(((stack1 = ((stack1 = (depth0 && depth0.target)),stack1 == null || stack1 === false ? stack1 : stack1.defaultTerm)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "</td>\n                    <td>";
  if (helper = helpers.groupId) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.groupId); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "</td>\n                    ";
  stack1 = (helper = helpers.if_eq || (depth0 && depth0.if_eq),options={hash:{},inverse:self.program(23, program23, data),fn:self.program(21, program21, data),data:data},helper ? helper.call(depth0, ((stack1 = (depth0 && depth0.charType)),stack1 == null || stack1 === false ? stack1 : stack1.conceptId), "900000000000010007", options) : helperMissing.call(depth0, "if_eq", ((stack1 = (depth0 && depth0.charType)),stack1 == null || stack1 === false ? stack1 : stack1.conceptId), "900000000000010007", options));
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n                    <button type=\"button\" class=\"btn btn-link unobtrusive-icon more-fields-button pull-right\" data-container=\"body\" data-toggle=\"popover\" data-placement=\"left\" data-content=\"\n                                <table border='1'><tr><th style='padding: 3px;'>Modifier</th><th style='padding: 3px;'>Effective Time</th><th style='padding: 3px;'>ModuleId</th></tr>\n                                    <tr><td style='padding: 3px;'>";
  if (helper = helpers.modifier) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.modifier); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "</td><td style='padding: 3px;'>";
  if (helper = helpers.effectiveTime) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.effectiveTime); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "</td><td style='padding: 3px;'>";
  if (helper = helpers.module) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.module); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "</td></tr>\n                                </table>\n                                \" data-html=\"true\"><i class=\"glyphicon glyphicon-info-sign\"></i></button>\n                </td>\n                </tr>\n            ";
  return buffer;
  }
function program33(depth0,data,depth3) {
  
  var buffer = "", helper, options;
  buffer += "\n                    "
    + escapeExpression((helper = helpers.push || (depth0 && depth0.push),options={hash:{},data:data},helper ? helper.call(depth0, depth0, (depth3 && depth3.statedParents), options) : helperMissing.call(depth0, "push", depth0, (depth3 && depth3.statedParents), options)))
    + "\n                ";
  return buffer;
  }

function program35(depth0,data,depth3) {
  
  var buffer = "", helper, options;
  buffer += "\n                    "
    + escapeExpression((helper = helpers.push || (depth0 && depth0.push),options={hash:{},data:data},helper ? helper.call(depth0, depth0, (depth3 && depth3.statedRoles), options) : helperMissing.call(depth0, "push", depth0, (depth3 && depth3.statedRoles), options)))
    + "\n                ";
  return buffer;
  }

  buffer += "<table class='table table-bordered'>\n    <thead>\n    <tr>\n        <th><span class='i18n' data-i18n-id='i18n_type'>Type</span></th>\n        <th><span class='i18n' data-i18n-id='i18n_destination'>Destination</span></th>\n        <th><span class='i18n' data-i18n-id='i18n_group'>Group</span></th>\n        <th><span class='i18n' data-i18n-id='i18n_char_type'>CharType</span></th>\n    </tr>\n    </thead>\n    <tbody>\n    ";
  stack1 = (helper = helpers.if_eq || (depth0 && depth0.if_eq),options={hash:{},inverse:self.program(4, program4, data),fn:self.program(1, program1, data),data:data},helper ? helper.call(depth0, ((stack1 = (depth0 && depth0.firstMatch)),stack1 == null || stack1 === false ? stack1 : stack1.relationships), "undefined", options) : helperMissing.call(depth0, "if_eq", ((stack1 = (depth0 && depth0.firstMatch)),stack1 == null || stack1 === false ? stack1 : stack1.relationships), "undefined", options));
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n    ";
  stack1 = (helper = helpers.if_eq || (depth0 && depth0.if_eq),options={hash:{},inverse:self.program(30, program30, data),fn:self.program(28, program28, data),data:data},helper ? helper.call(depth0, ((stack1 = (depth0 && depth0.firstMatch)),stack1 == null || stack1 === false ? stack1 : stack1.statedRelationships), "undefined", options) : helperMissing.call(depth0, "if_eq", ((stack1 = (depth0 && depth0.firstMatch)),stack1 == null || stack1 === false ? stack1 : stack1.statedRelationships), "undefined", options));
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n\n    </tbody>\n</table>";
  return buffer;
  });

this["JST"]["views/conceptDetailsPlugin/tabs/home/attributes.hbs"] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, helper, options, functionType="function", escapeExpression=this.escapeExpression, self=this, helperMissing=helpers.helperMissing;

function program1(depth0,data) {
  
  var buffer = "", stack1, helper;
  buffer += "\n    <h4><a href=\"javascript:void(0);\" style=\"color: inherit;text-decoration: inherit;\"><span draggable = \"true\" ondragstart=\"drag(event, '";
  if (helper = helpers.divElementId) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.divElementId); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "')\" class=\"badge alert-warning\"  data-concept-id=\""
    + escapeExpression(((stack1 = ((stack1 = (depth0 && depth0.firstMatch)),stack1 == null || stack1 === false ? stack1 : stack1.conceptId)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "\" data-term=\""
    + escapeExpression(((stack1 = ((stack1 = (depth0 && depth0.firstMatch)),stack1 == null || stack1 === false ? stack1 : stack1.defaultTerm)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "\" data-def-status=\""
    + escapeExpression(((stack1 = ((stack1 = (depth0 && depth0.firstMatch)),stack1 == null || stack1 === false ? stack1 : stack1.definitionStatus)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "\">&nbsp;</span></a>&nbsp;&nbsp;<span ondrop=\"dropC(event, '";
  if (helper = helpers.divElementId) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.divElementId); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "')\" ondragover=\"allowDrop(event)\">\n";
  return buffer;
  }

function program3(depth0,data) {
  
  var buffer = "", stack1, helper;
  buffer += "\n    <h4><a href=\"javascript:void(0);\" style=\"color: inherit;text-decoration: inherit;\"><span draggable = \"true\" ondragstart=\"drag(event, '";
  if (helper = helpers.divElementId) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.divElementId); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "')\" class=\"badge alert-warning\"  data-concept-id=\""
    + escapeExpression(((stack1 = ((stack1 = (depth0 && depth0.firstMatch)),stack1 == null || stack1 === false ? stack1 : stack1.conceptId)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "\" data-term=\""
    + escapeExpression(((stack1 = ((stack1 = (depth0 && depth0.firstMatch)),stack1 == null || stack1 === false ? stack1 : stack1.defaultTerm)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "\" data-def-status=\""
    + escapeExpression(((stack1 = ((stack1 = (depth0 && depth0.firstMatch)),stack1 == null || stack1 === false ? stack1 : stack1.definitionStatus)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "\">&equiv;</span></a>&nbsp;&nbsp;<span ondrop=\"dropC(event, '";
  if (helper = helpers.divElementId) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.divElementId); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "')\" ondragover=\"allowDrop(event)\">\n";
  return buffer;
  }

  stack1 = (helper = helpers.if_eq || (depth0 && depth0.if_eq),options={hash:{},inverse:self.program(3, program3, data),fn:self.program(1, program1, data),data:data},helper ? helper.call(depth0, ((stack1 = (depth0 && depth0.firstMatch)),stack1 == null || stack1 === false ? stack1 : stack1.definitionStatus), "Primitive", options) : helperMissing.call(depth0, "if_eq", ((stack1 = (depth0 && depth0.firstMatch)),stack1 == null || stack1 === false ? stack1 : stack1.definitionStatus), "Primitive", options));
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n"
    + escapeExpression(((stack1 = ((stack1 = (depth0 && depth0.firstMatch)),stack1 == null || stack1 === false ? stack1 : stack1.defaultTerm)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "\n</span></h4>\n<h5>SCTID: "
    + escapeExpression(((stack1 = ((stack1 = (depth0 && depth0.firstMatch)),stack1 == null || stack1 === false ? stack1 : stack1.conceptId)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "</h5>\n<div id=\"home-descriptions-";
  if (helper = helpers.divElementId) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.divElementId); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "\"></div>";
  return buffer;
  });

this["JST"]["views/conceptDetailsPlugin/tabs/home/parents.hbs"] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var stack1, helper, options, helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression, functionType="function", self=this;

function program1(depth0,data) {
  
  var buffer = "", stack1, helper, options;
  buffer += "\n    ";
  stack1 = helpers.each.call(depth0, (depth0 && depth0.statedParents), {hash:{},inverse:self.noop,fn:self.program(2, program2, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n    ";
  stack1 = (helper = helpers.if_eq || (depth0 && depth0.if_eq),options={hash:{},inverse:self.noop,fn:self.program(15, program15, data),data:data},helper ? helper.call(depth0, ((stack1 = (depth0 && depth0.statedParents)),stack1 == null || stack1 === false ? stack1 : stack1.length), 0, options) : helperMissing.call(depth0, "if_eq", ((stack1 = (depth0 && depth0.statedParents)),stack1 == null || stack1 === false ? stack1 : stack1.length), 0, options));
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n";
  return buffer;
  }
function program2(depth0,data) {
  
  var buffer = "", stack1, helper, options;
  buffer += "\n        <span draggable = \"true\" ondragstart=\"drag(event, '";
  if (helper = helpers.divElementId) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.divElementId); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "')\" class='text-warning' data-concept-id='"
    + escapeExpression(((stack1 = ((stack1 = (depth0 && depth0.type)),stack1 == null || stack1 === false ? stack1 : stack1.conceptId)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "' data-term='"
    + escapeExpression(((stack1 = ((stack1 = (depth0 && depth0.type)),stack1 == null || stack1 === false ? stack1 : stack1.defaultTerm)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "'>\n            ";
  stack1 = (helper = helpers.if_gr || (depth0 && depth0.if_gr),options={hash:{},inverse:self.program(5, program5, data),fn:self.program(3, program3, data),data:data},helper ? helper.call(depth0, ((stack1 = (depth0 && depth0.type)),stack1 == null || stack1 === false ? stack1 : stack1.defaultTerm), 0, options) : helperMissing.call(depth0, "if_gr", ((stack1 = (depth0 && depth0.type)),stack1 == null || stack1 === false ? stack1 : stack1.defaultTerm), 0, options));
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n        </span>&nbsp;&rArr;&nbsp;\n\n        ";
  stack1 = (helper = helpers.if_eq || (depth0 && depth0.if_eq),options={hash:{},inverse:self.program(9, program9, data),fn:self.program(7, program7, data),data:data},helper ? helper.call(depth0, ((stack1 = (depth0 && depth0.target)),stack1 == null || stack1 === false ? stack1 : stack1.definitionStatus), "Primitive", options) : helperMissing.call(depth0, "if_eq", ((stack1 = (depth0 && depth0.target)),stack1 == null || stack1 === false ? stack1 : stack1.definitionStatus), "Primitive", options));
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n\n        ";
  stack1 = (helper = helpers.if_gr || (depth0 && depth0.if_gr),options={hash:{},inverse:self.program(13, program13, data),fn:self.program(11, program11, data),data:data},helper ? helper.call(depth0, ((stack1 = (depth0 && depth0.target)),stack1 == null || stack1 === false ? stack1 : stack1.defaultTerm), 0, options) : helperMissing.call(depth0, "if_gr", ((stack1 = (depth0 && depth0.target)),stack1 == null || stack1 === false ? stack1 : stack1.defaultTerm), 0, options));
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n\n        </span>\n        <br>\n    ";
  return buffer;
  }
function program3(depth0,data) {
  
  var buffer = "", stack1, helper, options;
  buffer += "\n                "
    + escapeExpression((helper = helpers.substr || (depth0 && depth0.substr),options={hash:{},data:data},helper ? helper.call(depth0, ((stack1 = (depth0 && depth0.type)),stack1 == null || stack1 === false ? stack1 : stack1.defaultTerm), 0, options) : helperMissing.call(depth0, "substr", ((stack1 = (depth0 && depth0.type)),stack1 == null || stack1 === false ? stack1 : stack1.defaultTerm), 0, options)))
    + "\n            ";
  return buffer;
  }

function program5(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "\n                "
    + escapeExpression(((stack1 = ((stack1 = (depth0 && depth0.type)),stack1 == null || stack1 === false ? stack1 : stack1.defaultTerm)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "\n            ";
  return buffer;
  }

function program7(depth0,data) {
  
  var buffer = "", stack1, helper;
  buffer += "\n            <span draggable = \"true\" ondragstart=\"drag(event, '";
  if (helper = helpers.divElementId) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.divElementId); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "')\" class='sct-primitive-concept-compact' data-concept-id='"
    + escapeExpression(((stack1 = ((stack1 = (depth0 && depth0.target)),stack1 == null || stack1 === false ? stack1 : stack1.conceptId)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "' data-term='"
    + escapeExpression(((stack1 = ((stack1 = (depth0 && depth0.target)),stack1 == null || stack1 === false ? stack1 : stack1.defaultTerm)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "'>\n        ";
  return buffer;
  }

function program9(depth0,data) {
  
  var buffer = "", stack1, helper;
  buffer += "\n            <span draggable = \"true\" ondragstart=\"drag(event, '";
  if (helper = helpers.divElementId) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.divElementId); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "')\" class='sct-defined-concept-compact' data-concept-id='"
    + escapeExpression(((stack1 = ((stack1 = (depth0 && depth0.target)),stack1 == null || stack1 === false ? stack1 : stack1.conceptId)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "' data-term='"
    + escapeExpression(((stack1 = ((stack1 = (depth0 && depth0.target)),stack1 == null || stack1 === false ? stack1 : stack1.defaultTerm)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "'>\n        ";
  return buffer;
  }

function program11(depth0,data) {
  
  var buffer = "", stack1, helper, options;
  buffer += "\n            "
    + escapeExpression((helper = helpers.substr || (depth0 && depth0.substr),options={hash:{},data:data},helper ? helper.call(depth0, ((stack1 = (depth0 && depth0.target)),stack1 == null || stack1 === false ? stack1 : stack1.defaultTerm), 0, options) : helperMissing.call(depth0, "substr", ((stack1 = (depth0 && depth0.target)),stack1 == null || stack1 === false ? stack1 : stack1.defaultTerm), 0, options)))
    + "\n        ";
  return buffer;
  }

function program13(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "\n            "
    + escapeExpression(((stack1 = ((stack1 = (depth0 && depth0.target)),stack1 == null || stack1 === false ? stack1 : stack1.defaultTerm)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "\n        ";
  return buffer;
  }

function program15(depth0,data) {
  
  
  return "\n        <span class='text-muted'>No parents</span>\n    ";
  }

function program17(depth0,data) {
  
  var buffer = "", stack1, helper, options;
  buffer += "\n    ";
  stack1 = helpers.each.call(depth0, (depth0 && depth0.inferredParents), {hash:{},inverse:self.noop,fn:self.program(18, program18, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n    ";
  stack1 = (helper = helpers.if_eq || (depth0 && depth0.if_eq),options={hash:{},inverse:self.noop,fn:self.program(15, program15, data),data:data},helper ? helper.call(depth0, ((stack1 = (depth0 && depth0.inferredParents)),stack1 == null || stack1 === false ? stack1 : stack1.length), 0, options) : helperMissing.call(depth0, "if_eq", ((stack1 = (depth0 && depth0.inferredParents)),stack1 == null || stack1 === false ? stack1 : stack1.length), 0, options));
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n";
  return buffer;
  }
function program18(depth0,data) {
  
  var buffer = "", stack1, helper, options;
  buffer += "\n        <span draggable = \"true\" ondragstart=\"drag(event, '";
  if (helper = helpers.divElementId) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.divElementId); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "')\" class='text-warning' data-concept-id='"
    + escapeExpression(((stack1 = ((stack1 = (depth0 && depth0.type)),stack1 == null || stack1 === false ? stack1 : stack1.conceptId)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "' data-term='"
    + escapeExpression(((stack1 = ((stack1 = (depth0 && depth0.type)),stack1 == null || stack1 === false ? stack1 : stack1.defaultTerm)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "'>\n            ";
  stack1 = (helper = helpers.if_gr || (depth0 && depth0.if_gr),options={hash:{},inverse:self.program(5, program5, data),fn:self.program(3, program3, data),data:data},helper ? helper.call(depth0, ((stack1 = (depth0 && depth0.type)),stack1 == null || stack1 === false ? stack1 : stack1.defaultTerm), 0, options) : helperMissing.call(depth0, "if_gr", ((stack1 = (depth0 && depth0.type)),stack1 == null || stack1 === false ? stack1 : stack1.defaultTerm), 0, options));
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n        </span>&nbsp;&rArr;&nbsp;\n\n        ";
  stack1 = (helper = helpers.if_eq || (depth0 && depth0.if_eq),options={hash:{},inverse:self.program(9, program9, data),fn:self.program(7, program7, data),data:data},helper ? helper.call(depth0, ((stack1 = (depth0 && depth0.target)),stack1 == null || stack1 === false ? stack1 : stack1.definitionStatus), "Primitive", options) : helperMissing.call(depth0, "if_eq", ((stack1 = (depth0 && depth0.target)),stack1 == null || stack1 === false ? stack1 : stack1.definitionStatus), "Primitive", options));
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n\n        ";
  stack1 = (helper = helpers.if_gr || (depth0 && depth0.if_gr),options={hash:{},inverse:self.program(13, program13, data),fn:self.program(11, program11, data),data:data},helper ? helper.call(depth0, ((stack1 = (depth0 && depth0.target)),stack1 == null || stack1 === false ? stack1 : stack1.defaultTerm), 0, options) : helperMissing.call(depth0, "if_gr", ((stack1 = (depth0 && depth0.target)),stack1 == null || stack1 === false ? stack1 : stack1.defaultTerm), 0, options));
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n\n        </span><br>\n    ";
  return buffer;
  }

  stack1 = (helper = helpers.if_eq || (depth0 && depth0.if_eq),options={hash:{},inverse:self.program(17, program17, data),fn:self.program(1, program1, data),data:data},helper ? helper.call(depth0, ((stack1 = (depth0 && depth0.options)),stack1 == null || stack1 === false ? stack1 : stack1.selectedView), "stated", options) : helperMissing.call(depth0, "if_eq", ((stack1 = (depth0 && depth0.options)),stack1 == null || stack1 === false ? stack1 : stack1.selectedView), "stated", options));
  if(stack1 || stack1 === 0) { return stack1; }
  else { return ''; }
  });

this["JST"]["views/conceptDetailsPlugin/tabs/home/roles.hbs"] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, helper, options, helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression, functionType="function", self=this;

function program1(depth0,data) {
  
  var buffer = "", stack1, helper, options;
  buffer += "\n        ";
  stack1 = helpers.each.call(depth0, (depth0 && depth0.statedRoles), {hash:{},inverse:self.noop,fn:self.program(2, program2, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n        ";
  stack1 = (helper = helpers.if_eq || (depth0 && depth0.if_eq),options={hash:{},inverse:self.noop,fn:self.program(11, program11, data),data:data},helper ? helper.call(depth0, ((stack1 = (depth0 && depth0.statedRoles)),stack1 == null || stack1 === false ? stack1 : stack1.length), 0, options) : helperMissing.call(depth0, "if_eq", ((stack1 = (depth0 && depth0.statedRoles)),stack1 == null || stack1 === false ? stack1 : stack1.length), 0, options));
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n    ";
  return buffer;
  }
function program2(depth0,data) {
  
  var buffer = "", stack1, helper, options;
  buffer += "\n            <br>\n            ";
  stack1 = (helper = helpers.eqLastGroup || (depth0 && depth0.eqLastGroup),options={hash:{},inverse:self.program(5, program5, data),fn:self.program(3, program3, data),data:data},helper ? helper.call(depth0, (depth0 && depth0.groupId), options) : helperMissing.call(depth0, "eqLastGroup", (depth0 && depth0.groupId), options));
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n            &nbsp;<span draggable = \"true\" ondragstart=\"drag(event, '";
  if (helper = helpers.divElementId) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.divElementId); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "')\" class='sct-attribute-compact' data-concept-id='"
    + escapeExpression(((stack1 = ((stack1 = (depth0 && depth0.type)),stack1 == null || stack1 === false ? stack1 : stack1.conceptId)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "' data-term='"
    + escapeExpression(((stack1 = ((stack1 = (depth0 && depth0.type)),stack1 == null || stack1 === false ? stack1 : stack1.defaultTerm)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "'>\n                "
    + escapeExpression((helper = helpers.removeSemtag || (depth0 && depth0.removeSemtag),options={hash:{},data:data},helper ? helper.call(depth0, ((stack1 = (depth0 && depth0.type)),stack1 == null || stack1 === false ? stack1 : stack1.defaultTerm), options) : helperMissing.call(depth0, "removeSemtag", ((stack1 = (depth0 && depth0.type)),stack1 == null || stack1 === false ? stack1 : stack1.defaultTerm), options)))
    + "</span>&nbsp;&rarr;&nbsp;\n\n            ";
  stack1 = (helper = helpers.if_eq || (depth0 && depth0.if_eq),options={hash:{},inverse:self.program(9, program9, data),fn:self.program(7, program7, data),data:data},helper ? helper.call(depth0, ((stack1 = (depth0 && depth0.target)),stack1 == null || stack1 === false ? stack1 : stack1.definitionStatus), "Primitive", options) : helperMissing.call(depth0, "if_eq", ((stack1 = (depth0 && depth0.target)),stack1 == null || stack1 === false ? stack1 : stack1.definitionStatus), "Primitive", options));
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n            "
    + escapeExpression((helper = helpers.removeSemtag || (depth0 && depth0.removeSemtag),options={hash:{},data:data},helper ? helper.call(depth0, ((stack1 = (depth0 && depth0.target)),stack1 == null || stack1 === false ? stack1 : stack1.defaultTerm), options) : helperMissing.call(depth0, "removeSemtag", ((stack1 = (depth0 && depth0.target)),stack1 == null || stack1 === false ? stack1 : stack1.defaultTerm), options)))
    + "\n        </span><br>\n        ";
  return buffer;
  }
function program3(depth0,data) {
  
  var buffer = "", helper, options;
  buffer += "\n                "
    + escapeExpression((helper = helpers.setLastGroup || (depth0 && depth0.setLastGroup),options={hash:{},data:data},helper ? helper.call(depth0, (depth0 && depth0.groupId), options) : helperMissing.call(depth0, "setLastGroup", (depth0 && depth0.groupId), options)))
    + "\n                "
    + escapeExpression((helper = helpers.lastColor || (depth0 && depth0.lastColor),options={hash:{},data:data},helper ? helper.call(depth0, (depth0 && depth0.getRandomColor), options) : helperMissing.call(depth0, "lastColor", (depth0 && depth0.getRandomColor), options)))
    + "\n                &nbsp;&nbsp;&nbsp;<span style='background-color: "
    + escapeExpression((helper = helpers.lastColor || (depth0 && depth0.lastColor),options={hash:{},data:data},helper ? helper.call(depth0, "get", options) : helperMissing.call(depth0, "lastColor", "get", options)))
    + "'>&nbsp;&nbsp;</span>\n            ";
  return buffer;
  }

function program5(depth0,data) {
  
  var buffer = "", helper, options;
  buffer += "\n                &nbsp;&nbsp;&nbsp;<span style='background-color: "
    + escapeExpression((helper = helpers.lastColor || (depth0 && depth0.lastColor),options={hash:{},data:data},helper ? helper.call(depth0, "get", options) : helperMissing.call(depth0, "lastColor", "get", options)))
    + "'>&nbsp;&nbsp;</span>\n            ";
  return buffer;
  }

function program7(depth0,data) {
  
  var buffer = "", stack1, helper;
  buffer += "\n                <span draggable = \"true\" ondragstart=\"drag(event, '";
  if (helper = helpers.divElementId) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.divElementId); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "')\" class='sct-primitive-concept-compact' data-concept-id='"
    + escapeExpression(((stack1 = ((stack1 = (depth0 && depth0.target)),stack1 == null || stack1 === false ? stack1 : stack1.conceptId)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "' data-term='"
    + escapeExpression(((stack1 = ((stack1 = (depth0 && depth0.target)),stack1 == null || stack1 === false ? stack1 : stack1.defaultTerm)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "'>\n            ";
  return buffer;
  }

function program9(depth0,data) {
  
  var buffer = "", stack1, helper;
  buffer += "\n                <span draggable = \"true\" ondragstart=\"drag(event, '";
  if (helper = helpers.divElementId) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.divElementId); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "')\" class='sct-defined-concept-compact' data-concept-id='"
    + escapeExpression(((stack1 = ((stack1 = (depth0 && depth0.target)),stack1 == null || stack1 === false ? stack1 : stack1.conceptId)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "' data-term='"
    + escapeExpression(((stack1 = ((stack1 = (depth0 && depth0.target)),stack1 == null || stack1 === false ? stack1 : stack1.defaultTerm)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "'>\n            ";
  return buffer;
  }

function program11(depth0,data) {
  
  
  return "\n            <span class='i18n text-muted' data-i18n-id='i18n_no_relationships'>No relationships</span>\n        ";
  }

function program13(depth0,data) {
  
  var buffer = "", stack1, helper, options;
  buffer += "\n        ";
  stack1 = helpers.each.call(depth0, (depth0 && depth0.inferredRoles), {hash:{},inverse:self.noop,fn:self.program(14, program14, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n        ";
  stack1 = (helper = helpers.if_eq || (depth0 && depth0.if_eq),options={hash:{},inverse:self.noop,fn:self.program(11, program11, data),data:data},helper ? helper.call(depth0, ((stack1 = (depth0 && depth0.inferredRoles)),stack1 == null || stack1 === false ? stack1 : stack1.length), 0, options) : helperMissing.call(depth0, "if_eq", ((stack1 = (depth0 && depth0.inferredRoles)),stack1 == null || stack1 === false ? stack1 : stack1.length), 0, options));
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n    ";
  return buffer;
  }
function program14(depth0,data) {
  
  var buffer = "", stack1, helper, options;
  buffer += "\n            <br>\n            ";
  stack1 = (helper = helpers.eqLastGroup || (depth0 && depth0.eqLastGroup),options={hash:{},inverse:self.program(5, program5, data),fn:self.program(3, program3, data),data:data},helper ? helper.call(depth0, (depth0 && depth0.groupId), options) : helperMissing.call(depth0, "eqLastGroup", (depth0 && depth0.groupId), options));
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n            &nbsp;<span draggable = \"true\" class='sct-attribute-compact' data-concept-id='"
    + escapeExpression(((stack1 = ((stack1 = (depth0 && depth0.type)),stack1 == null || stack1 === false ? stack1 : stack1.conceptId)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "' data-term='"
    + escapeExpression(((stack1 = ((stack1 = (depth0 && depth0.type)),stack1 == null || stack1 === false ? stack1 : stack1.defaultTerm)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "'>\n                "
    + escapeExpression((helper = helpers.removeSemtag || (depth0 && depth0.removeSemtag),options={hash:{},data:data},helper ? helper.call(depth0, ((stack1 = (depth0 && depth0.type)),stack1 == null || stack1 === false ? stack1 : stack1.defaultTerm), options) : helperMissing.call(depth0, "removeSemtag", ((stack1 = (depth0 && depth0.type)),stack1 == null || stack1 === false ? stack1 : stack1.defaultTerm), options)))
    + "</span>&nbsp;&rarr;&nbsp;\n            <span draggable = \"true\" ondragstart=\"drag(event, '";
  if (helper = helpers.divElementId) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.divElementId); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "')\" class='\n                ";
  stack1 = (helper = helpers.if_eq || (depth0 && depth0.if_eq),options={hash:{},inverse:self.program(17, program17, data),fn:self.program(15, program15, data),data:data},helper ? helper.call(depth0, ((stack1 = (depth0 && depth0.target)),stack1 == null || stack1 === false ? stack1 : stack1.definitionStatus), "Primitive", options) : helperMissing.call(depth0, "if_eq", ((stack1 = (depth0 && depth0.target)),stack1 == null || stack1 === false ? stack1 : stack1.definitionStatus), "Primitive", options));
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n                ' data-concept-id='"
    + escapeExpression(((stack1 = ((stack1 = (depth0 && depth0.target)),stack1 == null || stack1 === false ? stack1 : stack1.conceptId)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "' data-term='"
    + escapeExpression(((stack1 = ((stack1 = (depth0 && depth0.target)),stack1 == null || stack1 === false ? stack1 : stack1.defaultTerm)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "'>\n                "
    + escapeExpression((helper = helpers.removeSemtag || (depth0 && depth0.removeSemtag),options={hash:{},data:data},helper ? helper.call(depth0, ((stack1 = (depth0 && depth0.target)),stack1 == null || stack1 === false ? stack1 : stack1.defaultTerm), options) : helperMissing.call(depth0, "removeSemtag", ((stack1 = (depth0 && depth0.target)),stack1 == null || stack1 === false ? stack1 : stack1.defaultTerm), options)))
    + "</span><br>\n        ";
  return buffer;
  }
function program15(depth0,data) {
  
  
  return "\n                     sct-primitive-concept-compact\n                ";
  }

function program17(depth0,data) {
  
  
  return "\n                     sct-defined-concept-compact\n                ";
  }

  buffer += "<div style='line-height: 100%;'>\n    ";
  stack1 = (helper = helpers.if_eq || (depth0 && depth0.if_eq),options={hash:{},inverse:self.program(13, program13, data),fn:self.program(1, program1, data),data:data},helper ? helper.call(depth0, ((stack1 = (depth0 && depth0.options)),stack1 == null || stack1 === false ? stack1 : stack1.selectedView), "stated", options) : helperMissing.call(depth0, "if_eq", ((stack1 = (depth0 && depth0.options)),stack1 == null || stack1 === false ? stack1 : stack1.selectedView), "stated", options));
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n</div>";
  return buffer;
  });

this["JST"]["views/conceptDetailsPlugin/tabs/refset.hbs"] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression, self=this, functionType="function";

function program1(depth0,data) {
  
  var buffer = "", stack1, helper, options;
  buffer += "\n    "
    + escapeExpression((helper = helpers.refset || (depth0 && depth0.refset),options={hash:{},data:data},helper ? helper.call(depth0, "simple", false, options) : helperMissing.call(depth0, "refset", "simple", false, options)))
    + "\n    "
    + escapeExpression((helper = helpers.refset || (depth0 && depth0.refset),options={hash:{},data:data},helper ? helper.call(depth0, "simplemap", false, options) : helperMissing.call(depth0, "refset", "simplemap", false, options)))
    + "\n    "
    + escapeExpression((helper = helpers.refset || (depth0 && depth0.refset),options={hash:{},data:data},helper ? helper.call(depth0, "attr", false, options) : helperMissing.call(depth0, "refset", "attr", false, options)))
    + "\n    "
    + escapeExpression((helper = helpers.refset || (depth0 && depth0.refset),options={hash:{},data:data},helper ? helper.call(depth0, "assoc", false, options) : helperMissing.call(depth0, "refset", "assoc", false, options)))
    + "\n\n    ";
  stack1 = helpers.each.call(depth0, ((stack1 = (depth0 && depth0.firstMatch)),stack1 == null || stack1 === false ? stack1 : stack1.memberships), {hash:{},inverse:self.noop,fn:self.program(2, program2, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n\n    <table class='table table-hover'>\n        <thead><tr>\n            <th colspan=\"2\"><span class='i18n' data-i18n-id='i18n_simple_refset_memberships'>Simple Refsets Memberships</span></th>\n        </tr></thead>\n    <tbody>\n        ";
  stack1 = helpers.each.call(depth0, ((stack1 = (depth0 && depth0.firstMatch)),stack1 == null || stack1 === false ? stack1 : stack1.memberships), {hash:{},inverse:self.noop,fn:self.program(13, program13, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n        ";
  stack1 = (helper = helpers.refset || (depth0 && depth0.refset),options={hash:{},inverse:self.program(25, program25, data),fn:self.program(23, program23, data),data:data},helper ? helper.call(depth0, "simple", "get", options) : helperMissing.call(depth0, "refset", "simple", "get", options));
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n    </table>\n\n    <table class='table table-hover'>\n        <thead><tr>\n            <th colspan=\"2\"><span class='i18n' data-i18n-id='i18n_simple_map_refset_name'>Simple Map Refset name</span></th>\n        </tr></thead>\n    <tbody>\n\n        ";
  stack1 = helpers.each.call(depth0, ((stack1 = (depth0 && depth0.firstMatch)),stack1 == null || stack1 === false ? stack1 : stack1.memberships), {hash:{},inverse:self.noop,fn:self.program(27, program27, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n        ";
  stack1 = (helper = helpers.refset || (depth0 && depth0.refset),options={hash:{},inverse:self.program(25, program25, data),fn:self.program(23, program23, data),data:data},helper ? helper.call(depth0, "simplemap", "get", options) : helperMissing.call(depth0, "refset", "simplemap", "get", options));
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n    </table>\n\n        <table class='table table-hover'>\n            <thead><tr>\n                <th colspan=\"2\"><span class='i18n' data-i18n-id='i18n_attribute_value_refset_name'>Attribute Value Refset name</span></th>\n            </tr></thead>\n        <tbody>\n\n            ";
  stack1 = helpers.each.call(depth0, ((stack1 = (depth0 && depth0.firstMatch)),stack1 == null || stack1 === false ? stack1 : stack1.memberships), {hash:{},inverse:self.noop,fn:self.program(30, program30, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n            ";
  stack1 = (helper = helpers.refset || (depth0 && depth0.refset),options={hash:{},inverse:self.program(42, program42, data),fn:self.program(40, program40, data),data:data},helper ? helper.call(depth0, "attr", "get", options) : helperMissing.call(depth0, "refset", "attr", "get", options));
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n        </table>\n\n        <table class='table table-hover'>\n            <thead><tr>\n                <th colspan=\"2\"><span class='i18n' data-i18n-id='i18n_association_refset_name'>Association Refset name</span></th>\n            </tr></thead>\n        <tbody>\n            ";
  stack1 = helpers.each.call(depth0, ((stack1 = (depth0 && depth0.firstMatch)),stack1 == null || stack1 === false ? stack1 : stack1.memberships), {hash:{},inverse:self.noop,fn:self.program(44, program44, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n            ";
  stack1 = (helper = helpers.refset || (depth0 && depth0.refset),options={hash:{},inverse:self.program(42, program42, data),fn:self.program(40, program40, data),data:data},helper ? helper.call(depth0, "assoc", "get", options) : helperMissing.call(depth0, "refset", "assoc", "get", options));
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n        </table>\n";
  return buffer;
  }
function program2(depth0,data) {
  
  var buffer = "", stack1, helper, options;
  buffer += "\n        ";
  stack1 = (helper = helpers.if_eq || (depth0 && depth0.if_eq),options={hash:{},inverse:self.program(5, program5, data),fn:self.program(3, program3, data),data:data},helper ? helper.call(depth0, (depth0 && depth0.type), "SIMPLE_REFSET", options) : helperMissing.call(depth0, "if_eq", (depth0 && depth0.type), "SIMPLE_REFSET", options));
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n    ";
  return buffer;
  }
function program3(depth0,data) {
  
  var buffer = "", helper, options;
  buffer += "\n            "
    + escapeExpression((helper = helpers.refset || (depth0 && depth0.refset),options={hash:{},data:data},helper ? helper.call(depth0, "simple", true, options) : helperMissing.call(depth0, "refset", "simple", true, options)))
    + "\n        ";
  return buffer;
  }

function program5(depth0,data) {
  
  var buffer = "", stack1, helper, options;
  buffer += "\n            ";
  stack1 = (helper = helpers.if_eq || (depth0 && depth0.if_eq),options={hash:{},inverse:self.program(8, program8, data),fn:self.program(6, program6, data),data:data},helper ? helper.call(depth0, (depth0 && depth0.type), "SIMPLEMAP", options) : helperMissing.call(depth0, "if_eq", (depth0 && depth0.type), "SIMPLEMAP", options));
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n        ";
  return buffer;
  }
function program6(depth0,data) {
  
  var buffer = "", helper, options;
  buffer += "\n                "
    + escapeExpression((helper = helpers.refset || (depth0 && depth0.refset),options={hash:{},data:data},helper ? helper.call(depth0, "simplemap", true, options) : helperMissing.call(depth0, "refset", "simplemap", true, options)))
    + "\n            ";
  return buffer;
  }

function program8(depth0,data) {
  
  var buffer = "", stack1, helper, options;
  buffer += "\n                ";
  stack1 = (helper = helpers.if_eq || (depth0 && depth0.if_eq),options={hash:{},inverse:self.program(11, program11, data),fn:self.program(9, program9, data),data:data},helper ? helper.call(depth0, (depth0 && depth0.type), "ATTRIBUTE_VALUE", options) : helperMissing.call(depth0, "if_eq", (depth0 && depth0.type), "ATTRIBUTE_VALUE", options));
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n            ";
  return buffer;
  }
function program9(depth0,data) {
  
  var buffer = "", helper, options;
  buffer += "\n                    "
    + escapeExpression((helper = helpers.refset || (depth0 && depth0.refset),options={hash:{},data:data},helper ? helper.call(depth0, "attr", true, options) : helperMissing.call(depth0, "refset", "attr", true, options)))
    + "\n                ";
  return buffer;
  }

function program11(depth0,data) {
  
  var buffer = "", helper, options;
  buffer += "\n                    "
    + escapeExpression((helper = helpers.refset || (depth0 && depth0.refset),options={hash:{},data:data},helper ? helper.call(depth0, "assoc", true, options) : helperMissing.call(depth0, "refset", "assoc", true, options)))
    + "\n                ";
  return buffer;
  }

function program13(depth0,data) {
  
  var buffer = "", stack1, helper, options;
  buffer += "\n            ";
  stack1 = (helper = helpers.if_eq || (depth0 && depth0.if_eq),options={hash:{},inverse:self.noop,fn:self.program(14, program14, data),data:data},helper ? helper.call(depth0, (depth0 && depth0.type), "SIMPLE_REFSET", options) : helperMissing.call(depth0, "if_eq", (depth0 && depth0.type), "SIMPLE_REFSET", options));
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n        ";
  return buffer;
  }
function program14(depth0,data) {
  
  var buffer = "", stack1, helper, options;
  buffer += "\n            <tr class='";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.active), {hash:{},inverse:self.program(17, program17, data),fn:self.program(15, program15, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "'>\n                <td>\n                    ";
  stack1 = (helper = helpers.if_eq || (depth0 && depth0.if_eq),options={hash:{},inverse:self.program(21, program21, data),fn:self.program(19, program19, data),data:data},helper ? helper.call(depth0, ((stack1 = (depth0 && depth0.refset)),stack1 == null || stack1 === false ? stack1 : stack1.definitionStatus), "Primitive", options) : helperMissing.call(depth0, "if_eq", ((stack1 = (depth0 && depth0.refset)),stack1 == null || stack1 === false ? stack1 : stack1.definitionStatus), "Primitive", options));
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n                    "
    + escapeExpression(((stack1 = ((stack1 = (depth0 && depth0.refset)),stack1 == null || stack1 === false ? stack1 : stack1.defaultTerm)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "\n                </td>\n                <td>";
  if (helper = helpers.otherValue) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.otherValue); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "\n                    <button type=\"button\" class=\"btn btn-link unobtrusive-icon more-fields-button pull-right\" data-container=\"body\" data-toggle=\"popover\" data-placement=\"left\" data-content=\"\n                        <table border='1'>\n                            <tr><th style='padding: 3px;'>RefsetId</th><th style='padding: 3px;'>Effective Time</th><th style='padding: 3px;'>ModuleId</th></tr>\n                            <tr><td style='padding: 3px;'>"
    + escapeExpression(((stack1 = ((stack1 = (depth0 && depth0.refset)),stack1 == null || stack1 === false ? stack1 : stack1.conceptId)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "</td><td style='padding: 3px;'>";
  if (helper = helpers.effectiveTime) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.effectiveTime); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "</td><td style='padding: 3px;'>";
  if (helper = helpers.module) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.module); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "</td></tr>\n                        </table>\"data-html=\"true\"><i class=\"glyphicon glyphicon-info-sign\"></i>\n                    </button>\n                </td>\n            </tr>\n            ";
  return buffer;
  }
function program15(depth0,data) {
  
  var buffer = "";
  return buffer;
  }

function program17(depth0,data) {
  
  
  return "danger";
  }

function program19(depth0,data) {
  
  var buffer = "", stack1, helper;
  buffer += "\n                        <a href=\"javascript:void(0);\" style=\"color: inherit;text-decoration: inherit;\"><span draggable = \"true\" ondragstart = \"drag(event, '";
  if (helper = helpers.divElementId) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.divElementId); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "')\" class=\"badge alert-warning\"  data-concept-id=\""
    + escapeExpression(((stack1 = ((stack1 = (depth0 && depth0.refset)),stack1 == null || stack1 === false ? stack1 : stack1.conceptId)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "\" data-term=\""
    + escapeExpression(((stack1 = ((stack1 = (depth0 && depth0.refset)),stack1 == null || stack1 === false ? stack1 : stack1.defaultTerm)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "\" data-def-status=\""
    + escapeExpression(((stack1 = ((stack1 = (depth0 && depth0.refset)),stack1 == null || stack1 === false ? stack1 : stack1.definitionStatus)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "\">&nbsp;</span></a>&nbsp;&nbsp;\n                    ";
  return buffer;
  }

function program21(depth0,data) {
  
  var buffer = "", stack1, helper;
  buffer += "\n                        <a href=\"javascript:void(0);\" style=\"color: inherit;text-decoration: inherit;\"><span draggable = \"true\" ondragstart = \"drag(event, '";
  if (helper = helpers.divElementId) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.divElementId); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "')\" class=\"badge alert-warning\"  data-concept-id=\""
    + escapeExpression(((stack1 = ((stack1 = (depth0 && depth0.refset)),stack1 == null || stack1 === false ? stack1 : stack1.conceptId)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "\" data-term=\""
    + escapeExpression(((stack1 = ((stack1 = (depth0 && depth0.refset)),stack1 == null || stack1 === false ? stack1 : stack1.defaultTerm)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "\" data-def-status=\""
    + escapeExpression(((stack1 = ((stack1 = (depth0 && depth0.refset)),stack1 == null || stack1 === false ? stack1 : stack1.definitionStatus)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "\">&equiv;</span></a>&nbsp;&nbsp;\n                    ";
  return buffer;
  }

function program23(depth0,data) {
  
  
  return "\n            </tbody>\n        ";
  }

function program25(depth0,data) {
  
  
  return "\n            <tr><td><span class='i18n text-muted' data-i18n-id='i18n_no_memberships'>No memberships</span></td></tr>\n            </tbody>\n        ";
  }

function program27(depth0,data) {
  
  var buffer = "", stack1, helper, options;
  buffer += "\n            ";
  stack1 = (helper = helpers.if_eq || (depth0 && depth0.if_eq),options={hash:{},inverse:self.noop,fn:self.program(28, program28, data),data:data},helper ? helper.call(depth0, (depth0 && depth0.type), "SIMPLEMAP", options) : helperMissing.call(depth0, "if_eq", (depth0 && depth0.type), "SIMPLEMAP", options));
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n        ";
  return buffer;
  }
function program28(depth0,data) {
  
  var buffer = "", stack1, helper, options;
  buffer += "\n            <tr class='";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.active), {hash:{},inverse:self.program(17, program17, data),fn:self.program(15, program15, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "'>\n                <td>\n                    ";
  stack1 = (helper = helpers.if_eq || (depth0 && depth0.if_eq),options={hash:{},inverse:self.program(21, program21, data),fn:self.program(19, program19, data),data:data},helper ? helper.call(depth0, ((stack1 = (depth0 && depth0.refset)),stack1 == null || stack1 === false ? stack1 : stack1.definitionStatus), "Primitive", options) : helperMissing.call(depth0, "if_eq", ((stack1 = (depth0 && depth0.refset)),stack1 == null || stack1 === false ? stack1 : stack1.definitionStatus), "Primitive", options));
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n                    "
    + escapeExpression(((stack1 = ((stack1 = (depth0 && depth0.refset)),stack1 == null || stack1 === false ? stack1 : stack1.defaultTerm)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "\n                </td>\n                <td>";
  if (helper = helpers.otherValue) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.otherValue); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "\n                    <button type=\"button\" class=\"btn btn-link unobtrusive-icon more-fields-button pull-right\" data-container=\"body\" data-toggle=\"popover\" data-placement=\"left\" data-content=\"\n                        <table border='1'><tr><th style='padding: 3px;'>RefsetId</th><th style='padding: 3px;'>Effective Time</th><th style='padding: 3px;'>ModuleId</th></tr>\n                            <tr><td style='padding: 3px;'>"
    + escapeExpression(((stack1 = ((stack1 = (depth0 && depth0.refset)),stack1 == null || stack1 === false ? stack1 : stack1.conceptId)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "</td><td style='padding: 3px;'>";
  if (helper = helpers.effectiveTime) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.effectiveTime); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "</td><td style='padding: 3px;'>";
  if (helper = helpers.module) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.module); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "</td></tr>\n                        </table>\n                        \" data-html=\"true\"><i class=\"glyphicon glyphicon-info-sign\"></i>\n                    </button>\n                </td>\n            </tr>\n            ";
  return buffer;
  }

function program30(depth0,data) {
  
  var buffer = "", stack1, helper, options;
  buffer += "\n                ";
  stack1 = (helper = helpers.if_eq || (depth0 && depth0.if_eq),options={hash:{},inverse:self.noop,fn:self.program(31, program31, data),data:data},helper ? helper.call(depth0, (depth0 && depth0.type), "ATTRIBUTE_VALUE", options) : helperMissing.call(depth0, "if_eq", (depth0 && depth0.type), "ATTRIBUTE_VALUE", options));
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n            ";
  return buffer;
  }
function program31(depth0,data) {
  
  var buffer = "", stack1, helper, options;
  buffer += "\n                <tr class='";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.active), {hash:{},inverse:self.program(17, program17, data),fn:self.program(15, program15, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "'>\n                    <td>\n                        ";
  stack1 = (helper = helpers.if_eq || (depth0 && depth0.if_eq),options={hash:{},inverse:self.program(34, program34, data),fn:self.program(32, program32, data),data:data},helper ? helper.call(depth0, ((stack1 = (depth0 && depth0.refset)),stack1 == null || stack1 === false ? stack1 : stack1.definitionStatus), "Primitive", options) : helperMissing.call(depth0, "if_eq", ((stack1 = (depth0 && depth0.refset)),stack1 == null || stack1 === false ? stack1 : stack1.definitionStatus), "Primitive", options));
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n                        "
    + escapeExpression(((stack1 = ((stack1 = (depth0 && depth0.refset)),stack1 == null || stack1 === false ? stack1 : stack1.defaultTerm)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "\n                    </td>\n                    <td>\n                        ";
  stack1 = (helper = helpers.if_eq || (depth0 && depth0.if_eq),options={hash:{},inverse:self.program(38, program38, data),fn:self.program(36, program36, data),data:data},helper ? helper.call(depth0, ((stack1 = (depth0 && depth0.cidValue)),stack1 == null || stack1 === false ? stack1 : stack1.definitionStatus), "Primitive", options) : helperMissing.call(depth0, "if_eq", ((stack1 = (depth0 && depth0.cidValue)),stack1 == null || stack1 === false ? stack1 : stack1.definitionStatus), "Primitive", options));
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n                        "
    + escapeExpression(((stack1 = ((stack1 = (depth0 && depth0.cidValue)),stack1 == null || stack1 === false ? stack1 : stack1.defaultTerm)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "</td>\n                    <button type=\"button\" class=\"btn btn-link unobtrusive-icon more-fields-button pull-right\" data-container=\"body\" data-toggle=\"popover\" data-placement=\"left\" data-content=\"\n                            <table border='1'><tr><th style='padding: 3px;'>RefsetId</th><th style='padding: 3px;'>Effective Time</th><th style='padding: 3px;'>ModuleId</th></tr>\n                                <tr><td style='padding: 3px;'>"
    + escapeExpression(((stack1 = ((stack1 = (depth0 && depth0.refset)),stack1 == null || stack1 === false ? stack1 : stack1.conceptId)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "</td><td style='padding: 3px;'>";
  if (helper = helpers.effectiveTime) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.effectiveTime); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "</td><td style='padding: 3px;'>";
  if (helper = helpers.module) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.module); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "</td></tr>\n                            </table>\n                            \" data-html=\"true\"><i class=\"glyphicon glyphicon-info-sign\"></i>\n                    </button>\n                    </td>\n                </tr>\n                ";
  return buffer;
  }
function program32(depth0,data) {
  
  var buffer = "", stack1, helper;
  buffer += "\n                            <a href=\"javascript:void(0);\" style=\"color: inherit;text-decoration: inherit;\"><span draggable = \"true\" ondragstart = \"drag(event, '";
  if (helper = helpers.divElementId) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.divElementId); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "')\" class=\"badge alert-warning\"  data-concept-id=\""
    + escapeExpression(((stack1 = ((stack1 = (depth0 && depth0.refset)),stack1 == null || stack1 === false ? stack1 : stack1.conceptId)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "\" data-term=\""
    + escapeExpression(((stack1 = ((stack1 = (depth0 && depth0.refset)),stack1 == null || stack1 === false ? stack1 : stack1.defaultTerm)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "\" data-def-status=\""
    + escapeExpression(((stack1 = ((stack1 = (depth0 && depth0.refset)),stack1 == null || stack1 === false ? stack1 : stack1.definitionStatus)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "\">&nbsp;</span></a>&nbsp;&nbsp;\n                        ";
  return buffer;
  }

function program34(depth0,data) {
  
  var buffer = "", stack1, helper;
  buffer += "\n                            <a href=\"javascript:void(0);\" style=\"color: inherit;text-decoration: inherit;\"><span draggable = \"true\" ondragstart = \"drag(event, '";
  if (helper = helpers.divElementId) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.divElementId); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "')\" class=\"badge alert-warning\"  data-concept-id=\""
    + escapeExpression(((stack1 = ((stack1 = (depth0 && depth0.refset)),stack1 == null || stack1 === false ? stack1 : stack1.conceptId)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "\" data-term=\""
    + escapeExpression(((stack1 = ((stack1 = (depth0 && depth0.refset)),stack1 == null || stack1 === false ? stack1 : stack1.defaultTerm)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "\" data-def-status=\""
    + escapeExpression(((stack1 = ((stack1 = (depth0 && depth0.refset)),stack1 == null || stack1 === false ? stack1 : stack1.definitionStatus)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "\">&equiv;</span></a>&nbsp;&nbsp;\n                        ";
  return buffer;
  }

function program36(depth0,data) {
  
  var buffer = "", stack1, helper;
  buffer += "\n                            <a href=\"javascript:void(0);\" style=\"color: inherit;text-decoration: inherit;\"><span draggable = \"true\" ondragstart = \"drag(event, '";
  if (helper = helpers.divElementId) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.divElementId); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "')\" class=\"badge alert-warning\"  data-concept-id=\""
    + escapeExpression(((stack1 = ((stack1 = (depth0 && depth0.cidValue)),stack1 == null || stack1 === false ? stack1 : stack1.conceptId)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "\" data-term=\""
    + escapeExpression(((stack1 = ((stack1 = (depth0 && depth0.cidValue)),stack1 == null || stack1 === false ? stack1 : stack1.defaultTerm)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "\" data-def-status=\""
    + escapeExpression(((stack1 = ((stack1 = (depth0 && depth0.cidValue)),stack1 == null || stack1 === false ? stack1 : stack1.definitionStatus)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "\">&nbsp;</span></a>&nbsp;&nbsp;\n                        ";
  return buffer;
  }

function program38(depth0,data) {
  
  var buffer = "", stack1, helper;
  buffer += "\n                            <a href=\"javascript:void(0);\" style=\"color: inherit;text-decoration: inherit;\"><span draggable = \"true\" ondragstart = \"drag(event, '";
  if (helper = helpers.divElementId) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.divElementId); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "')\" class=\"badge alert-warning\"  data-concept-id=\""
    + escapeExpression(((stack1 = ((stack1 = (depth0 && depth0.cidValue)),stack1 == null || stack1 === false ? stack1 : stack1.conceptId)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "\" data-term=\""
    + escapeExpression(((stack1 = ((stack1 = (depth0 && depth0.cidValue)),stack1 == null || stack1 === false ? stack1 : stack1.defaultTerm)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "\" data-def-status=\""
    + escapeExpression(((stack1 = ((stack1 = (depth0 && depth0.cidValue)),stack1 == null || stack1 === false ? stack1 : stack1.definitionStatus)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "\">&equiv;</span></a>&nbsp;&nbsp;\n                        ";
  return buffer;
  }

function program40(depth0,data) {
  
  
  return "\n                </tbody>\n            ";
  }

function program42(depth0,data) {
  
  
  return "\n                <tr><td><span class='i18n text-muted' data-i18n-id='i18n_no_memberships'>No memberships</span></td></tr>\n                </tbody>\n            ";
  }

function program44(depth0,data) {
  
  var buffer = "", stack1, helper, options;
  buffer += "\n                ";
  stack1 = (helper = helpers.if_eq || (depth0 && depth0.if_eq),options={hash:{},inverse:self.noop,fn:self.program(45, program45, data),data:data},helper ? helper.call(depth0, (depth0 && depth0.type), "ASSOCIATION", options) : helperMissing.call(depth0, "if_eq", (depth0 && depth0.type), "ASSOCIATION", options));
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n            ";
  return buffer;
  }
function program45(depth0,data) {
  
  var buffer = "", stack1, helper, options;
  buffer += "\n                <tr class='";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.active), {hash:{},inverse:self.program(17, program17, data),fn:self.program(15, program15, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "'>\n                    <td>\n                        ";
  stack1 = (helper = helpers.if_eq || (depth0 && depth0.if_eq),options={hash:{},inverse:self.program(34, program34, data),fn:self.program(32, program32, data),data:data},helper ? helper.call(depth0, ((stack1 = (depth0 && depth0.refset)),stack1 == null || stack1 === false ? stack1 : stack1.definitionStatus), "Primitive", options) : helperMissing.call(depth0, "if_eq", ((stack1 = (depth0 && depth0.refset)),stack1 == null || stack1 === false ? stack1 : stack1.definitionStatus), "Primitive", options));
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n                        "
    + escapeExpression(((stack1 = ((stack1 = (depth0 && depth0.refset)),stack1 == null || stack1 === false ? stack1 : stack1.defaultTerm)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "\n                    </td>\n                    <td>\n                        ";
  stack1 = (helper = helpers.if_eq || (depth0 && depth0.if_eq),options={hash:{},inverse:self.program(38, program38, data),fn:self.program(36, program36, data),data:data},helper ? helper.call(depth0, ((stack1 = (depth0 && depth0.cidValue)),stack1 == null || stack1 === false ? stack1 : stack1.definitionStatus), "Primitive", options) : helperMissing.call(depth0, "if_eq", ((stack1 = (depth0 && depth0.cidValue)),stack1 == null || stack1 === false ? stack1 : stack1.definitionStatus), "Primitive", options));
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n                        "
    + escapeExpression(((stack1 = ((stack1 = (depth0 && depth0.cidValue)),stack1 == null || stack1 === false ? stack1 : stack1.defaultTerm)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "</td>\n                    <button type=\"button\" class=\"btn btn-link unobtrusive-icon more-fields-button pull-right\" data-container=\"body\" data-toggle=\"popover\" data-placement=\"left\" data-content=\"\n                                <table border='1'><tr><th style='padding: 3px;'>RefsetId</th><th style='padding: 3px;'>Effective Time</th><th style='padding: 3px;'>ModuleId</th></tr>\n                                    <tr>\n                                        <td style='padding: 3px;'>"
    + escapeExpression(((stack1 = ((stack1 = (depth0 && depth0.refset)),stack1 == null || stack1 === false ? stack1 : stack1.conceptId)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "</td><td style='padding: 3px;'>";
  if (helper = helpers.effectiveTime) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.effectiveTime); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "</td><td style='padding: 3px;'>";
  if (helper = helpers.module) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.module); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "\n                                        </td>\n                                    </tr>\n                                </table>\n                                \" data-html=\"true\"><i class=\"glyphicon glyphicon-info-sign\"></i>\n                    </button>\n                    </td>\n                </tr>\n                ";
  return buffer;
  }

  stack1 = helpers['if'].call(depth0, ((stack1 = (depth0 && depth0.firstMatch)),stack1 == null || stack1 === false ? stack1 : stack1.memberships), {hash:{},inverse:self.noop,fn:self.program(1, program1, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n";
  return buffer;
  });

this["JST"]["views/searchPlugin/body/0.hbs"] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, helper, options, self=this, functionType="function", escapeExpression=this.escapeExpression, helperMissing=helpers.helperMissing;

function program1(depth0,data,depth1) {
  
  var buffer = "", stack1, helper;
  buffer += "\n    <tr class='resultRow selectable-row ";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.danger), {hash:{},inverse:self.noop,fn:self.program(2, program2, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "'>\n        <td class='col-md-7'>\n            <div draggable=\"true\" ondragstart=\"drag(event, '";
  if (helper = helpers.divElementId) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.divElementId); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "')\" class='result-item' data-concept-id='";
  if (helper = helpers.conceptId) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.conceptId); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "' data-term='";
  if (helper = helpers.term) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.term); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "'>\n                <a href='javascript:void(0);' style='color: inherit;text-decoration: inherit;'  data-concept-id='";
  if (helper = helpers.conceptId) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.conceptId); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "' data-term='";
  if (helper = helpers.term) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.term); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "'>";
  if (helper = helpers.term) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.term); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "</a>\n            </div>\n        </td>\n        <td class='text-muted small-text col-md-5 result-item'  data-concept-id='";
  if (helper = helpers.conceptId) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.conceptId); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "' data-term='";
  if (helper = helpers.term) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.term); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "'>\n            "
    + escapeExpression(((stack1 = ((stack1 = (depth1 && depth1.result)),stack1 == null || stack1 === false ? stack1 : stack1.defaultTerm)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "\n        </td>\n    </tr>\n";
  return buffer;
  }
function program2(depth0,data) {
  
  
  return "danger";
  }

function program4(depth0,data) {
  
  
  return "\n    <tr><td class='text-muted'>No results</td></tr>\n";
  }

  stack1 = helpers.each.call(depth0, ((stack1 = (depth0 && depth0.result)),stack1 == null || stack1 === false ? stack1 : stack1.descriptions), {hash:{},inverse:self.noop,fn:self.programWithDepth(1, program1, data, depth0),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n\n";
  stack1 = (helper = helpers.if_eq || (depth0 && depth0.if_eq),options={hash:{},inverse:self.noop,fn:self.program(4, program4, data),data:data},helper ? helper.call(depth0, ((stack1 = ((stack1 = (depth0 && depth0.result)),stack1 == null || stack1 === false ? stack1 : stack1.descriptions)),stack1 == null || stack1 === false ? stack1 : stack1.length), 0, options) : helperMissing.call(depth0, "if_eq", ((stack1 = ((stack1 = (depth0 && depth0.result)),stack1 == null || stack1 === false ? stack1 : stack1.descriptions)),stack1 == null || stack1 === false ? stack1 : stack1.length), 0, options));
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n";
  return buffer;
  });

this["JST"]["views/searchPlugin/body/1.hbs"] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, self=this, helperMissing=helpers.helperMissing, functionType="function", escapeExpression=this.escapeExpression;

function program1(depth0,data) {
  
  var buffer = "", stack1, helper, options;
  buffer += "\n    <tr class='resultRow selectable-row";
  stack1 = (helper = helpers.if_eq || (depth0 && depth0.if_eq),options={hash:{},inverse:self.program(4, program4, data),fn:self.program(2, program2, data),data:data},helper ? helper.call(depth0, (depth0 && depth0.active), false, options) : helperMissing.call(depth0, "if_eq", (depth0 && depth0.active), false, options));
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "'>\n        <td class='col-md-7'>\n            <div draggable=\"true\" ondragstart=\"drag(event, '";
  if (helper = helpers.divElementId) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.divElementId); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "')\" class='result-item' data-concept-id='";
  if (helper = helpers.conceptId) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.conceptId); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "' data-term='";
  if (helper = helpers.term) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.term); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "'>\n                <a href='javascript:void(0);' style='color: inherit;text-decoration: inherit;'  data-concept-id='";
  if (helper = helpers.conceptId) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.conceptId); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "' data-term='";
  if (helper = helpers.term) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.term); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "'>";
  if (helper = helpers.term) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.term); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "</a>\n            </div>\n        </td>\n        <td class='text-muted small-text col-md-5 result-item'  data-concept-id='";
  if (helper = helpers.conceptId) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.conceptId); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "' data-term='";
  if (helper = helpers.term) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.term); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "'>\n            ";
  if (helper = helpers.fsn) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.fsn); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "\n        </td>\n    </tr>\n";
  return buffer;
  }
function program2(depth0,data) {
  
  
  return "danger";
  }

function program4(depth0,data) {
  
  var stack1, helper, options;
  stack1 = (helper = helpers.if_eq || (depth0 && depth0.if_eq),options={hash:{},inverse:self.noop,fn:self.program(2, program2, data),data:data},helper ? helper.call(depth0, (depth0 && depth0.conceptActive), false, options) : helperMissing.call(depth0, "if_eq", (depth0 && depth0.conceptActive), false, options));
  if(stack1 || stack1 === 0) { return stack1; }
  else { return ''; }
  }

  stack1 = helpers.each.call(depth0, ((stack1 = (depth0 && depth0.result)),stack1 == null || stack1 === false ? stack1 : stack1.matches), {hash:{},inverse:self.noop,fn:self.program(1, program1, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n";
  return buffer;
  });

this["JST"]["views/searchPlugin/body/bar.hbs"] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, helper, options, functionType="function", escapeExpression=this.escapeExpression, self=this, helperMissing=helpers.helperMissing;

function program1(depth0,data) {
  
  var buffer = "", stack1, helper;
  buffer += "\n    <span class='text-muted'>"
    + escapeExpression(((stack1 = ((stack1 = ((stack1 = (depth0 && depth0.result)),stack1 == null || stack1 === false ? stack1 : stack1.details)),stack1 == null || stack1 === false ? stack1 : stack1.total)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + " matches found in ";
  if (helper = helpers.elapsed) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.elapsed); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + " seconds.</span>\n";
  return buffer;
  }

function program3(depth0,data) {
  
  
  return "\n";
  }

function program5(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "\n    &nbsp;&nbsp;<span class='label label-danger'>"
    + escapeExpression(((stack1 = ((stack1 = (depth0 && depth0.options)),stack1 == null || stack1 === false ? stack1 : stack1.semTagFilter)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "&nbsp;<a href='javascript:void(0);' style='color: white;text-decoration: none;' class='remove-semtag'>&times;</a></span>&nbsp;&nbsp;\n";
  return buffer;
  }

function program7(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "\n    &nbsp;&nbsp;<span class='label label-danger'>"
    + escapeExpression(((stack1 = ((stack1 = (depth0 && depth0.options)),stack1 == null || stack1 === false ? stack1 : stack1.langFilter)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "&nbsp;<a href='javascript:void(0);' style='color: white;text-decoration: none;' class='remove-lang'>&times;</a></span>&nbsp;&nbsp;\n";
  return buffer;
  }

function program9(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "\n                        <li><a class='lang-link' href='javascript:void(0);' data-lang='"
    + escapeExpression(((stack1 = (data == null || data === false ? data : data.key)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "'>"
    + escapeExpression(((stack1 = (data == null || data === false ? data : data.key)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + " ("
    + escapeExpression((typeof depth0 === functionType ? depth0.apply(depth0) : depth0))
    + ")</a></li>\n                    ";
  return buffer;
  }

function program11(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "\n                        <li><a class='semtag-link' href='javascript:void(0);' data-semtag='"
    + escapeExpression(((stack1 = (data == null || data === false ? data : data.key)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "'>"
    + escapeExpression(((stack1 = (data == null || data === false ? data : data.key)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + " ("
    + escapeExpression((typeof depth0 === functionType ? depth0.apply(depth0) : depth0))
    + ")</a></li>\n                    ";
  return buffer;
  }

  stack1 = helpers['if'].call(depth0, ((stack1 = (depth0 && depth0.result)),stack1 == null || stack1 === false ? stack1 : stack1.details), {hash:{},inverse:self.noop,fn:self.program(1, program1, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n<span class='pull right'>\n<a class='btm btn-xs' style='margin: 3px; color: #777; background-color: #fff; border: 1px #ccc solid; margin-left: 25px;' data-toggle='collapse' href='#";
  if (helper = helpers.divElementId) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.divElementId); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "-searchFiltersPanel'>\n    <span class='i18n' data-i18n-id='i18n_filters'>Filters</span>\n</a>\n";
  stack1 = (helper = helpers.if_eq || (depth0 && depth0.if_eq),options={hash:{},inverse:self.program(5, program5, data),fn:self.program(3, program3, data),data:data},helper ? helper.call(depth0, ((stack1 = (depth0 && depth0.options)),stack1 == null || stack1 === false ? stack1 : stack1.semTagFilter), "none", options) : helperMissing.call(depth0, "if_eq", ((stack1 = (depth0 && depth0.options)),stack1 == null || stack1 === false ? stack1 : stack1.semTagFilter), "none", options));
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n";
  stack1 = (helper = helpers.if_eq || (depth0 && depth0.if_eq),options={hash:{},inverse:self.program(7, program7, data),fn:self.program(3, program3, data),data:data},helper ? helper.call(depth0, ((stack1 = (depth0 && depth0.options)),stack1 == null || stack1 === false ? stack1 : stack1.langFilter), "none", options) : helperMissing.call(depth0, "if_eq", ((stack1 = (depth0 && depth0.options)),stack1 == null || stack1 === false ? stack1 : stack1.langFilter), "none", options));
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n</span>\n<div id='";
  if (helper = helpers.divElementId) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.divElementId); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "-searchFiltersPanel' class='panel-collapse collapse'>\n    <div class='tree'>\n        <ul>\n            <li><a>Filter results by Language</a>\n                <ul>\n                    ";
  stack1 = helpers.each.call(depth0, ((stack1 = ((stack1 = (depth0 && depth0.result)),stack1 == null || stack1 === false ? stack1 : stack1.filters)),stack1 == null || stack1 === false ? stack1 : stack1.lang), {hash:{},inverse:self.noop,fn:self.program(9, program9, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n                </ul>\n            </li>\n        </ul>\n        <ul>\n            <li><a>Filter results by Semantic Tag</a>\n                <ul>\n                    ";
  stack1 = helpers.each.call(depth0, ((stack1 = ((stack1 = (depth0 && depth0.result)),stack1 == null || stack1 === false ? stack1 : stack1.filters)),stack1 == null || stack1 === false ? stack1 : stack1.semTag), {hash:{},inverse:self.noop,fn:self.program(11, program11, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n                </ul>\n            </li>\n        </ul>\n    </div>\n</div>";
  return buffer;
  });

this["JST"]["views/searchPlugin/body/default.hbs"] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, self=this, helperMissing=helpers.helperMissing, functionType="function", escapeExpression=this.escapeExpression;

function program1(depth0,data) {
  
  var buffer = "", stack1, helper, options;
  buffer += "\n    ";
  stack1 = (helper = helpers.if_gre || (depth0 && depth0.if_gre),options={hash:{},inverse:self.program(4, program4, data),fn:self.program(2, program2, data),data:data},helper ? helper.call(depth0, "0", ((stack1 = ((stack1 = (depth0 && depth0.result)),stack1 == null || stack1 === false ? stack1 : stack1.matches)),stack1 == null || stack1 === false ? stack1 : stack1.length), options) : helperMissing.call(depth0, "if_gre", "0", ((stack1 = ((stack1 = (depth0 && depth0.result)),stack1 == null || stack1 === false ? stack1 : stack1.matches)),stack1 == null || stack1 === false ? stack1 : stack1.length), options));
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n";
  return buffer;
  }
function program2(depth0,data) {
  
  
  return "\n        <tr><td class='text-muted'>No results</td></tr>\n    ";
  }

function program4(depth0,data) {
  
  var buffer = "", stack1, helper, options;
  buffer += "\n        ";
  stack1 = helpers.each.call(depth0, ((stack1 = (depth0 && depth0.result)),stack1 == null || stack1 === false ? stack1 : stack1.matches), {hash:{},inverse:self.noop,fn:self.programWithDepth(5, program5, data, depth0),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n        ";
  stack1 = (helper = helpers.if_gr || (depth0 && depth0.if_gr),options={hash:{},inverse:self.program(12, program12, data),fn:self.program(10, program10, data),data:data},helper ? helper.call(depth0, (depth0 && depth0.remaining), 0, options) : helperMissing.call(depth0, "if_gr", (depth0 && depth0.remaining), 0, options));
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n    ";
  return buffer;
  }
function program5(depth0,data,depth1) {
  
  var buffer = "", stack1, helper, options;
  buffer += "\n            <tr class='resultRow selectable-row";
  stack1 = (helper = helpers.if_eq || (depth0 && depth0.if_eq),options={hash:{},inverse:self.program(8, program8, data),fn:self.program(6, program6, data),data:data},helper ? helper.call(depth0, (depth0 && depth0.active), false, options) : helperMissing.call(depth0, "if_eq", (depth0 && depth0.active), false, options));
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "'>\n                <td class='col-md-6'>\n                    <div draggable='true' ondragstart=\"drag(event, '"
    + escapeExpression(((stack1 = (depth1 && depth1.divElementId)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "')\" class='result-item' data-concept-id='";
  if (helper = helpers.conceptId) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.conceptId); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "' data-term='";
  if (helper = helpers.term) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.term); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "'>\n                        <a href='javascript:void(0);' style='color: inherit;text-decoration: inherit;'  data-concept-id='";
  if (helper = helpers.conceptId) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.conceptId); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "' data-term='";
  if (helper = helpers.term) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.term); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "'>";
  if (helper = helpers.term) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.term); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "</a>\n                    </div>\n                </td>\n                <td class='text-muted small-text col-md-6 result-item'  data-concept-id='";
  if (helper = helpers.conceptId) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.conceptId); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "' data-term='";
  if (helper = helpers.term) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.term); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "'>";
  if (helper = helpers.fsn) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.fsn); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "</td>\n            </tr>\n        ";
  return buffer;
  }
function program6(depth0,data) {
  
  
  return " danger";
  }

function program8(depth0,data) {
  
  var stack1, helper, options;
  stack1 = (helper = helpers.if_eq || (depth0 && depth0.if_eq),options={hash:{},inverse:self.noop,fn:self.program(6, program6, data),data:data},helper ? helper.call(depth0, (depth0 && depth0.conceptActive), false, options) : helperMissing.call(depth0, "if_eq", (depth0 && depth0.conceptActive), false, options));
  if(stack1 || stack1 === 0) { return stack1; }
  else { return ''; }
  }

function program10(depth0,data) {
  
  var buffer = "", stack1, helper;
  buffer += "\n            <tr class='more-row'><td colspan='2' class='text-center'><button class='btn btn-link' id='";
  if (helper = helpers.divElementId) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.divElementId); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "-more'>Load ";
  if (helper = helpers.returnLimit) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.returnLimit); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + " more (";
  if (helper = helpers.remaining) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.remaining); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + " remaining on server)</button></td></tr>\n        ";
  return buffer;
  }

function program12(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "\n            <tr class='more-row'><td colspan='2' class='text-center text-muted'>All "
    + escapeExpression(((stack1 = ((stack1 = ((stack1 = (depth0 && depth0.result)),stack1 == null || stack1 === false ? stack1 : stack1.details)),stack1 == null || stack1 === false ? stack1 : stack1.total)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + " results are displayed</td></tr>\n        ";
  return buffer;
  }

function program14(depth0,data) {
  
  
  return "\n    <tr><td class='text-muted'>No results</td></tr>\n";
  }

  stack1 = helpers['if'].call(depth0, ((stack1 = (depth0 && depth0.result)),stack1 == null || stack1 === false ? stack1 : stack1.matches), {hash:{},inverse:self.program(14, program14, data),fn:self.program(1, program1, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n";
  return buffer;
  });

this["JST"]["views/searchPlugin/main.hbs"] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, helper, functionType="function", escapeExpression=this.escapeExpression;


  buffer += "<div style='margin: 5px; height:95%;' class='panel panel-default'>\n    <div class='panel-heading'>\n        <button id='";
  if (helper = helpers.divElementId) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.divElementId); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "-subscribersMarker' class='btn btn-link btn-lg' style='padding: 2px; position: absolute;top: 1px;left: 0px;'><i class='glyphicon glyphicon-bookmark'></i></button>\n        <div class='row'>\n            <div class='col-md-8' id='";
  if (helper = helpers.divElementId) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.divElementId); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "-panelTitle'>&nbsp&nbsp&nbsp<strong><span class='i18n' data-i18n-id='i18n_search'>Search</span></span></strong></div>\n            <div class='col-md-4 text-right'>\n                <button id='";
  if (helper = helpers.divElementId) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.divElementId); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "-linkerButton' draggable=\"true\" ondragstart=\"drag(event, '";
  if (helper = helpers.divElementId) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.divElementId); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "')\" class='btn btn-link linker-button' data-panel='";
  if (helper = helpers.divElementId) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.divElementId); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "' style='padding:2px'><i class='glyphicon glyphicon-link'></i></button>\n                <button id='";
  if (helper = helpers.divElementId) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.divElementId); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "-historyButton' class='btn btn-link history-button' style='padding:2px'><i class='glyphicon glyphicon-time'></i></button>\n                <button id='";
  if (helper = helpers.divElementId) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.divElementId); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "-configButton' class='btn btn-link' style='padding:2px' data-target='#";
  if (helper = helpers.divElementId) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.divElementId); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "-configModal'><i class='glyphicon glyphicon-cog'></i></button>\n                <button id='";
  if (helper = helpers.divElementId) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.divElementId); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "-collapseButton' class='btn btn-link' style='padding:2px'><i class='glyphicon glyphicon-resize-small'></i></button>\n                <button id='";
  if (helper = helpers.divElementId) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.divElementId); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "-expandButton' class='btn btn-link' style='padding:2px'><i class='glyphicon glyphicon-resize-full'></i></button>\n                <button id='";
  if (helper = helpers.divElementId) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.divElementId); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "-closeButton' class='btn btn-link' style='padding:2px'><i class='glyphicon glyphicon-remove'></i></button>\n            </div>\n        </div>\n    </div>\n    <div class='panel-body' style='height:86%' id='";
  if (helper = helpers.divElementId) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.divElementId); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "-panelBody'>\n        <form>\n            <div class=\"form-group\" style=\"margin-bottom: 2px;\">\n                <label for=\"";
  if (helper = helpers.divElementId) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.divElementId); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "-searchBox\">\n                    <span class=\"i18n\" data-i18n-id=\"i18n_type_3_chars\">Type at least 3 characters</span> <i class=\"glyphicon glyphicon-remove text-danger\" id=\"";
  if (helper = helpers.divElementId) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.divElementId); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "-typeIcon\"></i> <span id=\"";
  if (helper = helpers.divElementId) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.divElementId); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "-searchExample\"></span></label>\n                <br><div class=\"btn-group\" style=\"width: 100%;\"><input type=\"search\" class=\"form-control\" id=\"";
  if (helper = helpers.divElementId) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.divElementId); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "-searchBox\" placeholder=\"Search...\" autocomplete=\"off\">\n                <span id=\"";
  if (helper = helpers.divElementId) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.divElementId); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "-clearButton\" class=\"searchclear glyphicon glyphicon-remove-circle\"></span></div>\n            </div>\n        </form>\n        <div id='";
  if (helper = helpers.divElementId) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.divElementId); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "-searchConfigBar' style='margin-bottom: 10px;'><nav class='navbar navbar-default' role='navigation' style='min-height: 28px;border-radius: 0px;border-bottom: 1px lightgray solid;'>\n            <ul class='nav navbar-nav navbar-left'>\n                <li class='dropdown' style='margin-bottom: 2px; margin-top: 2px;'>\n                    <a href='javascript:void(0);' class='dropdown-toggle' data-toggle='dropdown' style='padding-top: 2px; padding-bottom: 2px;'><span id='";
  if (helper = helpers.divElementId) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.divElementId); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "-navSearchModeLabel'></span> <b class='caret'></b></a>\n                    <ul class='dropdown-menu' role='menu' style='float: none;'>\n                        <li><button class='btn btn-link' id='";
  if (helper = helpers.divElementId) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.divElementId); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "-fullTextButton'><span class='i18n' data-i18n-id='i18n_full_text_search_mode'>Full text search mode</span></button></li>\n                        <li><button class='btn btn-link' id='";
  if (helper = helpers.divElementId) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.divElementId); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "-partialMatchingButton'><span class='i18n' data-i18n-id='i18n_partial_match_search_mode'>Partial matching search mode</span></button></li>\n                        <li><button class='btn btn-link' id='";
  if (helper = helpers.divElementId) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.divElementId); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "-regexButton'><span class='i18n' data-i18n-id='i18n_regex_search_mode'>Regular Expressions search mode</span></button></li>\n                    </ul>\n                </li>\n                <li class='dropdown' style='margin-bottom: 2px; margin-top: 2px;'>\n                    <a href='javascript:void(0);' class='dropdown-toggle' data-toggle='dropdown' style='padding-top: 2px; padding-bottom: 2px;'><span id='";
  if (helper = helpers.divElementId) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.divElementId); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "-navLanguageLabel'></span> <b class='caret'></b></a>\n                    <ul class='dropdown-menu' role='menu' style='float: none;'>\n                        <li><button class='btn btn-link' id='";
  if (helper = helpers.divElementId) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.divElementId); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "-danishLangButton'><span class='i18n' data-i18n-id='i18n_danish_stemmer'>Danish language stemmer</span></button></li>\n                        <li><button class='btn btn-link' id='";
  if (helper = helpers.divElementId) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.divElementId); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "-englishLangButton'><span class='i18n' data-i18n-id='i18n_english_stemmer'>English language stemmer</span></button></li>\n                        <li><button class='btn btn-link' id='";
  if (helper = helpers.divElementId) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.divElementId); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "-spanishLangButton'><span class='i18n' data-i18n-id='i18n_spanish_stemmer'>Spanish language stemmer</span></button></li>\n                        <li><button class='btn btn-link' id='";
  if (helper = helpers.divElementId) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.divElementId); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "-swedishLangButton'><span class='i18n' data-i18n-id='i18n_swedish_stemmer'>Swedish language stemmer</span></button></li>\n                    </ul>\n                </li>\n                <li class='dropdown' style='margin-bottom: 2px; margin-top: 2px;'>\n                    <a href='javascript:void(0);' class='dropdown-toggle' data-toggle='dropdown' style='padding-top: 2px; padding-bottom: 2px;'><span id='";
  if (helper = helpers.divElementId) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.divElementId); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "-navStatusFilterLabel'></span> <b class='caret'></b></a>\n                    <ul class='dropdown-menu' role='menu' style='float: none;'>\n                        <li><button class='btn btn-link' id='";
  if (helper = helpers.divElementId) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.divElementId); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "-activeOnlyButton'><span class='i18n' data-i18n-id='i18n_active_only'>Active components only</span></button></li>\n                        <li><button class='btn btn-link' id='";
  if (helper = helpers.divElementId) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.divElementId); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "-activeInactiveButton'><span class='i18n' data-i18n-id='i18n_active_and_inactive'>Active and inactive components</span></button></li>\n                        <li><button class='btn btn-link' id='";
  if (helper = helpers.divElementId) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.divElementId); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "-inactiveOnlyButton'><span class='i18n' data-i18n-id='i18n_inactive_only'>Inactive components only</span></button></li>\n                    </ul>\n                </li>\n            </ul>\n        </nav></div>\n        <div class='panel panel-default' style='height:70%;overflow:auto;margin-bottom: 15px;min-height: 300px;' id='";
  if (helper = helpers.divElementId) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.divElementId); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "-resultsScrollPane'>\n            <div id=\"";
  if (helper = helpers.divElementId) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.divElementId); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "-searchBar\"></div>\n            <div id=\"";
  if (helper = helpers.divElementId) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.divElementId); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "-searchFilters\"></div>\n            <table class='table table-bordered'>\n                <tbody  id='";
  if (helper = helpers.divElementId) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.divElementId); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "-resultsTable'>\n                </tbody>\n            </table>\n        </div>\n    </div>\n</div>\n        ";
  return buffer;
  });

this["JST"]["views/taxonomyPlugin/body/children.hbs"] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, functionType="function", escapeExpression=this.escapeExpression, self=this, helperMissing=helpers.helperMissing;

function program1(depth0,data,depth1) {
  
  var buffer = "", stack1;
  buffer += "\n        ";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.active), {hash:{},inverse:self.noop,fn:self.programWithDepth(2, program2, data, depth1),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n    ";
  return buffer;
  }
function program2(depth0,data,depth2) {
  
  var buffer = "", stack1, helper, options;
  buffer += "\n            <li data-concept-id='";
  if (helper = helpers.conceptId) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.conceptId); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "' data-term='";
  if (helper = helpers.defaultTerm) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.defaultTerm); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "' class='treeLabel'>\n                <button class='btn btn-link btn-xs treeButton' style='padding:2px'><i class='glyphicon glyphicon-chevron-right treeButton' id='"
    + escapeExpression(((stack1 = (depth2 && depth2.divElementId)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "-treeicon-";
  if (helper = helpers.conceptId) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.conceptId); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "'></i></button>\n                ";
  stack1 = (helper = helpers.if_eq || (depth0 && depth0.if_eq),options={hash:{},inverse:self.program(5, program5, data),fn:self.program(3, program3, data),data:data},helper ? helper.call(depth0, (depth0 && depth0.definitionStatus), "Primitive", options) : helperMissing.call(depth0, "if_eq", (depth0 && depth0.definitionStatus), "Primitive", options));
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n                <a href=\"javascript:void(0);\" style=\"color: inherit;text-decoration: inherit;\"><span draggable=\"true\" ondragstart=\"drag(event, '"
    + escapeExpression(((stack1 = (depth2 && depth2.divElementId)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "')\" class=\"treeLabel selectable-row\" data-concept-id=\"";
  if (helper = helpers.conceptId) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.conceptId); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "\" data-term=\"";
  if (helper = helpers.defaultTerm) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.defaultTerm); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "\" id=\""
    + escapeExpression(((stack1 = (depth2 && depth2.divElementId)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "-treenode-";
  if (helper = helpers.conceptId) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.conceptId); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "\">";
  if (helper = helpers.defaultTerm) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.defaultTerm); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "</span></a>\n                "
    + escapeExpression((helper = helpers.push || (depth0 && depth0.push),options={hash:{},data:data},helper ? helper.call(depth0, (depth0 && depth0.conceptId), options) : helperMissing.call(depth0, "push", (depth0 && depth0.conceptId), options)))
    + "\n            </li>\n        ";
  return buffer;
  }
function program3(depth0,data) {
  
  
  return "\n                    <span class=\"badge alert-warning\">&nbsp;</span>&nbsp;&nbsp;\n                ";
  }

function program5(depth0,data) {
  
  
  return "\n                    <span class=\"badge alert-warning\">&equiv;</span>&nbsp;&nbsp;\n                ";
  }

  buffer += "<ul style='list-style-type: none; padding-left: 15px;'>\n    ";
  stack1 = helpers.each.call(depth0, (depth0 && depth0.result), {hash:{},inverse:self.noop,fn:self.programWithDepth(1, program1, data, depth0),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n</ul>\n\n";
  return buffer;
  });

this["JST"]["views/taxonomyPlugin/body/parents.hbs"] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data,depth1) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, helper, options, functionType="function", escapeExpression=this.escapeExpression, self=this, helperMissing=helpers.helperMissing;

function program1(depth0,data,depth1,depth2) {
  
  var buffer = "", stack1, helper, options;
  buffer += "\n            <li data-concept-id='";
  if (helper = helpers.conceptId) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.conceptId); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "' data-term='";
  if (helper = helpers.defaultTerm) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.defaultTerm); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "' class='treeLabel'>\n                <button class='btn btn-link btn-xs treeButton' style='padding:2px'>\n                    <i class='glyphicon glyphicon-chevron-up treeButton' id='"
    + escapeExpression(((stack1 = (depth1 && depth1.divElementId)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "-treeicon-";
  if (helper = helpers.conceptId) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.conceptId); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "'></i>\n                </button>\n                ";
  stack1 = (helper = helpers.if_eq || (depth0 && depth0.if_eq),options={hash:{},inverse:self.program(4, program4, data),fn:self.program(2, program2, data),data:data},helper ? helper.call(depth0, (depth0 && depth0.definitionStatus), "Primitive", options) : helperMissing.call(depth0, "if_eq", (depth0 && depth0.definitionStatus), "Primitive", options));
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n                <a href=\"javascript:void(0);\" style=\"color: inherit;text-decoration: inherit;\"><span data-concept-id=\"";
  if (helper = helpers.conceptId) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.conceptId); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "\" data-term=\"";
  if (helper = helpers.defaultTerm) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.defaultTerm); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "\" draggable=\"true\" ondragstart=\"drag(event, '";
  if (helper = helpers.divElementId) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.divElementId); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "')\" class=\"treeLabel selectable-row\" id=\""
    + escapeExpression(((stack1 = (depth2 && depth2.divElementId)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "-treenode-";
  if (helper = helpers.conceptId) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.conceptId); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "\">";
  if (helper = helpers.defaultTerm) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.defaultTerm); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "</span></a>\n        ";
  return buffer;
  }
function program2(depth0,data) {
  
  
  return "\n                    <span class=\"badge alert-warning\">&nbsp;</span>&nbsp;&nbsp;\n                ";
  }

function program4(depth0,data) {
  
  
  return "\n                    <span class=\"badge alert-warning\">&equiv;</span>&nbsp;&nbsp;\n                ";
  }

function program6(depth0,data) {
  
  var buffer = "", helper, options;
  buffer += "\n            "
    + escapeExpression((helper = helpers.slice || (depth0 && depth0.slice),options={hash:{},data:data},helper ? helper.call(depth0, 0, -5, options) : helperMissing.call(depth0, "slice", 0, -5, options)))
    + "\n        ";
  return buffer;
  }

function program8(depth0,data) {
  
  
  return "\n            </li>\n        ";
  }

  buffer += "<div style='height:100%;margin-bottom: 15px;'>\n    <ul style='list-style-type: none; padding-left: 5px;'>\n        ";
  stack1 = helpers.each.call(depth0, (depth0 && depth0.parents), {hash:{},inverse:self.noop,fn:self.programWithDepth(1, program1, data, depth0, depth1),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n        ";
  stack1 = (helper = helpers.if_gr || (depth0 && depth0.if_gr),options={hash:{},inverse:self.noop,fn:self.program(6, program6, data),data:data},helper ? helper.call(depth0, ((stack1 = (depth0 && depth0.parents)),stack1 == null || stack1 === false ? stack1 : stack1.length), 0, options) : helperMissing.call(depth0, "if_gr", ((stack1 = (depth0 && depth0.parents)),stack1 == null || stack1 === false ? stack1 : stack1.length), 0, options));
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n        <ul style='list-style-type: none; padding-left: 15px;'>\n            <li data-concept-id='"
    + escapeExpression(((stack1 = ((stack1 = (depth0 && depth0.focusConcept)),stack1 == null || stack1 === false ? stack1 : stack1.conceptId)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "' data-term='"
    + escapeExpression(((stack1 = ((stack1 = (depth0 && depth0.focusConcept)),stack1 == null || stack1 === false ? stack1 : stack1.defaultTerm)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "' class='treeLabel'>\n                <button class='btn btn-link btn-xs treeButton' style='padding:2px'><i class='glyphicon glyphicon-chevron-right treeButton'  id='";
  if (helper = helpers.divElementId) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.divElementId); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "-treeicon-"
    + escapeExpression(((stack1 = ((stack1 = (depth0 && depth0.focusConcept)),stack1 == null || stack1 === false ? stack1 : stack1.conceptId)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "'></i></button>\n                ";
  stack1 = (helper = helpers.if_eq || (depth0 && depth0.if_eq),options={hash:{},inverse:self.program(4, program4, data),fn:self.program(2, program2, data),data:data},helper ? helper.call(depth0, ((stack1 = (depth0 && depth0.focusConcept)),stack1 == null || stack1 === false ? stack1 : stack1.definitionStatus), "Primitive", options) : helperMissing.call(depth0, "if_eq", ((stack1 = (depth0 && depth0.focusConcept)),stack1 == null || stack1 === false ? stack1 : stack1.definitionStatus), "Primitive", options));
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n                <a href=\"javascript:void(0);\" style=\"color: inherit;text-decoration: inherit;\"><span data-concept-id=\""
    + escapeExpression(((stack1 = ((stack1 = (depth0 && depth0.focusConcept)),stack1 == null || stack1 === false ? stack1 : stack1.conceptId)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "\" data-term=\""
    + escapeExpression(((stack1 = ((stack1 = (depth0 && depth0.focusConcept)),stack1 == null || stack1 === false ? stack1 : stack1.defaultTerm)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "\" draggable=\"true\" ondragstart=\"drag(event, '";
  if (helper = helpers.divElementId) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.divElementId); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "')\" class=\"treeLabel selectable-row\" id=\"";
  if (helper = helpers.divElementId) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.divElementId); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "-treenode-"
    + escapeExpression(((stack1 = ((stack1 = (depth0 && depth0.focusConcept)),stack1 == null || stack1 === false ? stack1 : stack1.conceptId)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "\">"
    + escapeExpression(((stack1 = ((stack1 = (depth0 && depth0.focusConcept)),stack1 == null || stack1 === false ? stack1 : stack1.defaultTerm)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "</span></a>\n            </li>\n        </ul>\n        ";
  stack1 = (helper = helpers.if_gr || (depth0 && depth0.if_gr),options={hash:{},inverse:self.noop,fn:self.program(8, program8, data),data:data},helper ? helper.call(depth0, ((stack1 = (depth0 && depth0.parents)),stack1 == null || stack1 === false ? stack1 : stack1.length), 0, options) : helperMissing.call(depth0, "if_gr", ((stack1 = (depth0 && depth0.parents)),stack1 == null || stack1 === false ? stack1 : stack1.length), 0, options));
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n    </ul>\n</div>";
  return buffer;
  });

this["JST"]["views/taxonomyPlugin/main.hbs"] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, helper, functionType="function", escapeExpression=this.escapeExpression;


  buffer += "<div style='height:100%;margin: 5px; overflow:auto;' class='panel panel-default' id='";
  if (helper = helpers.divElementId) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.divElementId); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "-mainPanel'>\n    <div ondrop=\"dropT(event, '";
  if (helper = helpers.divElementId) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.divElementId); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "')\" ondragover=\"allowDrop(event)\" class='panel-heading' id='";
  if (helper = helpers.divElementId) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.divElementId); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "-panelHeading'>\n        <button id='";
  if (helper = helpers.divElementId) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.divElementId); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "-subscribersMarker' class='btn btn-link btn-lg' style='padding: 2px; position: absolute;top: 1px;left: 0px;'><i class='glyphicon glyphicon-bookmark'></i></button>\n        <div class='row'>\n            <div class='col-md-6' id='";
  if (helper = helpers.divElementId) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.divElementId); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "-panelTitle'>&nbsp&nbsp&nbsp<strong><span class='i18n' data-i18n-id='i18n_taxonomy'>Taxonomy</span></strong></div>\n            <div class='col-md-6 text-right'>\n                <button id='";
  if (helper = helpers.divElementId) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.divElementId); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "-resetButton' class='btn btn-link' data-panel='";
  if (helper = helpers.divElementId) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.divElementId); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "' style='padding:2px'><i class='glyphicon glyphicon-repeat'></i></button>\n                <button id='";
  if (helper = helpers.divElementId) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.divElementId); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "-linkerButton' draggable=\"true\" ondragstart=\"drag(event, '";
  if (helper = helpers.divElementId) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.divElementId); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "')\" class='btn btn-link linker-button' data-panel='";
  if (helper = helpers.divElementId) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.divElementId); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "' style='padding:2px'><i class='glyphicon glyphicon-link'></i></button>\n                <button id='";
  if (helper = helpers.divElementId) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.divElementId); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "-configButton' class='btn btn-link' style='padding:2px' data-target='#";
  if (helper = helpers.divElementId) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.divElementId); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "-configModal'><i class='glyphicon glyphicon-cog'></i></button>\n                <button id='";
  if (helper = helpers.divElementId) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.divElementId); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "-collapseButton' class='btn btn-link' style='padding:2px'><i class='glyphicon glyphicon-resize-small'></i></button>\n                <button id='";
  if (helper = helpers.divElementId) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.divElementId); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "-expandButton' class='btn btn-link' style='padding:2px'><i class='glyphicon glyphicon-resize-full'></i></button>\n                <button id='";
  if (helper = helpers.divElementId) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.divElementId); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "-closeButton' class='btn btn-link' style='padding:2px'><i class='glyphicon glyphicon-remove'></i></button>\n            </div>\n        </div>\n    </div>\n    <div id='";
  if (helper = helpers.divElementId) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.divElementId); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "-taxonomyConfigBar' style='margin-bottom: 10px;'><nav class='navbar navbar-default' role='navigation' style='min-height: 28px;border-radius: 0px;border-bottom: 1px lightgray solid;'>\n        <ul class='nav navbar-nav navbar-left'>\n            <li class='dropdown' style='margin-bottom: 2px; margin-top: 2px;'>\n                <a href='javascript:void(0);' class='dropdown-toggle' data-toggle='dropdown' style='padding-top: 2px; padding-bottom: 2px;'><span id='";
  if (helper = helpers.divElementId) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.divElementId); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "-txViewLabel'></span> <b class='caret'></b></a>\n                <ul class='dropdown-menu' role='menu' style='float: none;'>\n                    <li><button class='btn btn-link' id='";
  if (helper = helpers.divElementId) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.divElementId); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "-inferredViewButton'><span class='i18n' data-i18n-id='i18n_inferred_view'>Inferred view</span></button></li>\n                    <li><button class='btn btn-link' id='";
  if (helper = helpers.divElementId) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.divElementId); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "-statedViewButton'><span class='i18n' data-i18n-id='i18n_stated_view'>Stated view</span></button></li>\n                </ul>\n            </li>\n        </ul>\n    </nav></div>\n    <div ondrop=\"dropT(event, '";
  if (helper = helpers.divElementId) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.divElementId); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "')\" ondragover=\"allowDrop(event)\" class='panel-body' style='height:100%' id='";
  if (helper = helpers.divElementId) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.divElementId); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "-panelBody'>\n    </div>\n</div>";
  return buffer;
  });