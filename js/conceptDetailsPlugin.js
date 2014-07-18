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
function removeHighlight(){
    $(document).find('.validtarget').removeClass('validtarget');
}

function allowDrop(ev) {
    ev.preventDefault();
    $(ev.toElement).addClass("validtarget");
}

function drag(ev, id) {
    //$( "[ondragover='allowDrop(event)']" ).addClass("validtarget");
    $.each(ev.target.attributes, function (){
        if (this.name.substr(0, 4) == "data"){
            ev.dataTransfer.setData(this.name.substr(5), this.value);
        }
    });
    ev.dataTransfer.setData("divElementId", id);
}

function dropC(ev, id) {
    $(document).find('.validtarget').removeClass('validtarget');
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



