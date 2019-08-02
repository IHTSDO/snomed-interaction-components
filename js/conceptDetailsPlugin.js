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

    var languageNameOfLangRefset = {
        "20581000087109": "fr-CA",
        "19491000087109": "en-CA",
        "900000000000508004": "en-GB",
        "900000000000509007": "en-US",
        "450828004": "es",
        "900000701000122101": "es-ES",
        "554461000005103": "DA",
        "46011000052107": "SV",
        "32570271000036106": "AU",
        "999001251000000103": "UK",
        "11000146104": "NL"
    };

    var longLanguageNameOfLangRefset = {
        "900000000000509007": "United States of America English language reference set",
        "900000000000508004": "Great Britain English language reference set"
    };

    if (options.languageNameOfLangRefset)
        languageNameOfLangRefset = options.languageNameOfLangRefset;

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
    var xhrReferences = null;
    var xhrParents = null;
    var xhrMembers = null;
    var xhrRefsets = null;
    var componentConceptPanel = null;
    var conceptRequested = 0;
    panel.subscriptionsColor = [];
    panel.subscriptions = [];
    panel.subscribers = [];

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

    this.setupCanvas = function() {
        panel.attributesPId = panel.divElement.id + "-attributes-panel";
        panel.descsPId = panel.divElement.id + "-descriptions-panel";
        panel.relsPId = panel.divElement.id + "-rels-panel";
        panel.childrenPId = panel.divElement.id + "-children-panel";
        panel.defaultTerm = "";
        $(divElement).html();
        var context = {
            divElementId: panel.divElement.id,
        };
        //        options statedParents inferredParents firstMatch statedRoles inferredRoles allDescriptions
        // dataContentValue = document.URL.split("?")[0].split("#")[0]

        $(divElement).html(JST["views/conceptDetailsPlugin/main.hbs"](context));

        //        $("#" + panel.divElement.id + "-linkerButton").disableTextSelect();
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

        $("#" + panel.divElement.id + "-configButton").click(function(event) {
            panel.setupOptionsPanel();
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
            placement: 'left',
            trigger: 'hover',
            title: i18n_panel_options,
            animation: true,
            delay: 1000
        });
        if (typeof i18n_history == "undefined") {
            i18n_history = 'History';
        }
        $("#" + panel.divElement.id + "-historyButton").tooltip({
            placement: 'left',
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

        $("#" + panel.divElement.id + "-apply-button").click(function() {
            //console.log("apply!");
            panel.readOptionsPanel();
            //            panel.updateCanvas();
        });

        //        $("#" + panel.divElement.id + "-linkerButton").click(function(event) {
        //            $("#" + panel.divElement.id + "-linkerButton").popover({
        //                trigger: 'manual',
        //                placement: 'bottomRight',
        //                html: true,
        //                content: function() {
        //                    if (panel.subscriptions.length == 0) {
        //                        linkerHtml = '<div class="text-center text-muted"><em>Not linked yet<br>Drag to link with other panels</em></div>';
        //                    } else {
        //                        var linkHtml = '';
        //                        $.each(panel.subscriptions, function(i, field){
        //                            var panelLink = {};
        //                            $.each(componentsRegistry, function(i, panl){
        //                                if (panl.divElement.id == field.topic){
        //                                    panelLink = panl;
        //                                }
        //                            });
        //                            linkHtml = linkHtml + '<div class="text-center"><a href="javascript:void(0);" onclick="\'' + panel.unsubscribe(panelLink) + '\'">Clear link with '+ field.topic +'</a><br></div>';
        //                        });
        //                        linkHtml = linkHtml + '';
        //                        linkerHtml = linkHtml;
        //                    }
        //                    return linkerHtml;
        //                }
        //            });
        //            $("#" + panel.divElement.id + "-linkerButton").popover('toggle');
        //        });

        panel.updateCanvas();
        channel.publish(panel.divElement.id, {
            term: panel.term,
            module: panel.module,
            conceptId: panel.conceptId,
            source: panel.divElement.id
        });
        panel.setupOptionsPanel();
        if (panel.subscriptions.length > 0 || panel.subscribers.length > 0) {
            $("#" + panel.divElement.id + "-subscribersMarker").show();
        }
        $("#" + panel.divElement.id + "-ownMarker").css('color', panel.markerColor);
    }

    this.updateCanvas = function() {
        //        $("#members-" + panel.divElement.id).html("");
        $("#home-children-cant-" + panel.divElement.id).html("");
        $('.more-fields-button').popover('hide');
        if (conceptRequested == panel.conceptId) {
            return;
        }
        conceptRequested = panel.conceptId;
        $("#home-children-" + panel.divElement.id + "-body").html("<i class='glyphicon glyphicon-refresh icon-spin'></i>");
        $('#' + panel.attributesPId).html("<i class='glyphicon glyphicon-refresh icon-spin'></i>");
        $('#home-attributes-' + panel.divElement.id).html("<i class='glyphicon glyphicon-refresh icon-spin'></i>");
        $('#' + panel.descsPId).html("<i class='glyphicon glyphicon-refresh icon-spin'></i>");
        $('#' + panel.relsPId).html("<i class='glyphicon glyphicon-refresh icon-spin'></i>");
        $('#home-parents-' + panel.divElement.id).html("<i class='glyphicon glyphicon-refresh icon-spin'></i>");
        $('#home-roles-' + panel.divElement.id).html("<i class='glyphicon glyphicon-refresh icon-spin'></i>");
        $('#' + panel.childrenPId).html("<i class='glyphicon glyphicon-refresh icon-spin'></i>");
        $("#diagram-canvas-" + panel.divElement.id).html("<i class='glyphicon glyphicon-refresh icon-spin'></i>");
        $('#refsets-' + panel.divElement.id).html("<i class='glyphicon glyphicon-refresh icon-spin'></i>");
        $('#product-details-' + panel.divElement.id).html("<i class='glyphicon glyphicon-refresh icon-spin'></i>");

        // load attributes
        if (xhr != null) {
            xhr.abort();
            xhr = null;
            //console.log("aborting call...");
        }
        var branch = options.edition;
        if(options.release.length > 0 && options.release !== 'None'){
            branch = branch + "/" + options.release;
        };
        $.ajaxSetup({
          headers : {
            'Accept-Language': options.languages
          }
        });
        xhr = $.getJSON(options.serverUrl + "/browser/" + branch + "/concepts/" + panel.conceptId, function(result) {

        }).done(function(result) {
            setDefaultTerm(result);
            var pt = {};
            $.each(result.descriptions, function(i, description) {
                if (description.lang == options.defaultLanguage && description.active) {
                    $.each(description.acceptabilityMap, function(i, map){
                        if(map == "PREFERRED"){
                            pt = description;
                        }
                    })
                }
            });
            if(pt.lang === options.defaultLanguage && options.defaultLanguage != 'en' && result.fsn.lang != options.defaultLanguage){
                result.defaultTerm = pt.term;
            }
            else{
                result.defaultTerm = result.fsn.term;
            }
            var firstMatch = result;
            xhr = null;
            panel.attributesPId = divElement.id + "-attributes-panel";
            panel.defaultTerm = firstMatch.defaultTerm;
            var d = new Date();
            var time = d.getTime();
            panel.history.push({ defaultTerm: firstMatch.defaultTerm, conceptId: firstMatch.conceptId, time: time });
            Handlebars.registerHelper('if_eq', function(a, b, opts) {
                if (opts != "undefined") {
                    if (a == b)
                        return opts.fn(this);
                    else
                        return opts.inverse(this);
                }
            });
            Handlebars.registerHelper('parseCS', function (search, replacement, string) {
                var str = string.split(search).join(replacement).toLowerCase();

                return str.charAt(0).toUpperCase() + str.slice(1);
            });
            panel.statedParents = [];
            panel.inferredParents = [];
            panel.statedRoles = [];
            panel.inferredRoles = [];
            panel.statedParentsFromAxioms = [];
            panel.attributesFromAxioms = [];

            firstMatch.relationships.forEach(function(loopRel) {
                if(loopRel.type.pt.lang === options.defaultLanguage && options.defaultLanguage != 'en' && loopRel.type.fsn.lang != options.defaultLanguage){
                    loopRel.type.defaultTerm = loopRel.type.pt.term;
                }
                else{
                    loopRel.type.defaultTerm = loopRel.type.fsn.term;
                }
                if(loopRel.target.pt.lang === options.defaultLanguage && options.defaultLanguage != 'en' && loopRel.target.fsn.lang != options.defaultLanguage){
                    loopRel.target.defaultTerm = loopRel.target.pt.term;
                }
                else{
                    loopRel.target.defaultTerm = loopRel.target.fsn.term;
                }
                if (loopRel.characteristicType == "INFERRED_RELATIONSHIP" && loopRel.active && loopRel.type.conceptId != "116680003") {
                    panel.inferredRoles.push(loopRel);
                }
                else if(loopRel.characteristicType == "INFERRED_RELATIONSHIP" && loopRel.active && loopRel.type.conceptId === "116680003"){
                    panel.inferredParents.push(loopRel);
                }
            });

            firstMatch.statedRelationships.forEach(function(loopRel) {
                if(loopRel.type.pt.lang === options.defaultLanguage && options.defaultLanguage != 'en' && loopRel.type.fsn.lang != options.defaultLanguage){
                    loopRel.type.defaultTerm = loopRel.type.pt.term;
                }
                else{
                    loopRel.type.defaultTerm = loopRel.type.fsn.term;
                }
                if(loopRel.target.pt.lang === options.defaultLanguage && options.defaultLanguage != 'en' && loopRel.target.fsn.lang != options.defaultLanguage){
                    loopRel.target.defaultTerm = loopRel.target.pt.term;
                }
                else{
                    loopRel.target.defaultTerm = loopRel.target.fsn.term;
                }
                if(loopRel.active == true){
                    firstMatch.statedActive = "true";
                }
                if(loopRel.characteristicType === "STATED_RELATIONSHIP" && loopRel.active && loopRel.type.conceptId != "116680003"){
                    panel.statedRoles.push(loopRel);
                }
                else if(loopRel.characteristicType === "STATED_RELATIONSHIP" && loopRel.active && loopRel.type.conceptId === "116680003") {
                    panel.statedParents.push(loopRel);
                }
            });

            function sortAxiomRelationships (relationships){
                relationships.sort(function(a, b) {
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
            };

            firstMatch.classAxioms.forEach(function(axiom) {
                if(axiom.active){
                    axiom.relationships.forEach(function(rel) {
                        if(rel.type.pt.lang === options.defaultLanguage && options.defaultLanguage != 'en' && rel.type.fsn.lang != options.defaultLanguage){
                            rel.type.defaultTerm = rel.type.pt.term;
                        }
                        else{
                            rel.type.defaultTerm = rel.type.fsn.term;
                        }
                        if(rel.target.pt.lang === options.defaultLanguage && options.defaultLanguage != 'en' && rel.target.fsn.lang != options.defaultLanguage){
                            rel.target.defaultTerm = rel.target.pt.term;
                        }
                        else{
                            rel.target.defaultTerm = rel.target.fsn.term;
                        }
                        if(rel.active && rel.type.conceptId === "116680003"){
                            rel.effectiveTime = axiom.effectiveTime;
                            panel.statedParentsFromAxioms.push(rel);
                        }
                        else if(rel.active){
                            rel.axiomId = axiom.axiomId;
                            rel.effectiveTime = axiom.effectiveTime;
                            panel.attributesFromAxioms.push(rel);
                        }
                    });
                }
                sortAxiomRelationships(axiom.relationships);
            });
            firstMatch.gciAxioms.forEach(function(axiom) {
                if(axiom.active){
                    axiom.relationships.forEach(function(rel) {
                        if(rel.type.pt.lang === options.defaultLanguage && options.defaultLanguage != 'en' && rel.type.fsn.lang != options.defaultLanguage){
                            rel.type.defaultTerm = rel.type.pt.term;
                        }
                        else{
                            rel.type.defaultTerm = rel.type.fsn.term;
                        }
                        if(rel.target.pt.lang === options.defaultLanguage && options.defaultLanguage != 'en' && rel.target.fsn.lang != options.defaultLanguage){
                            rel.target.defaultTerm = rel.target.pt.term;
                        }
                        else{
                            rel.target.defaultTerm = rel.target.fsn.term;
                        }
                        if(rel.active && rel.type.conceptId !== "116680003"){
                            rel.axiomId = axiom.axiomId;
                            rel.effectiveTime = axiom.effectiveTime;
                            panel.attributesFromAxioms.push(rel);
                        }
                        else if(rel.active){
                            rel.axiomId = axiom.axiomId;
                            rel.effectiveTime = axiom.effectiveTime;
                        }
                    });
                }
                sortAxiomRelationships(axiom.relationships);
            });

            if (firstMatch.statedDescendants) {
                firstMatch.statedDescendantsString = firstMatch.statedDescendants.toLocaleString();
            }
            if (firstMatch.inferredDescendants) {
                firstMatch.inferredDescendantsString = firstMatch.inferredDescendants.toLocaleString();
            }
            var context = {
                options: panel.options,
                firstMatch: firstMatch,
                divElementId: panel.divElement.id,
                edition: options.edition,
                release: options.release,
                server: options.serverUrl.substr(0, options.serverUrl.length - 10),
                langRefset: panel.options.languages,
                link: document.URL.split("?")[0].split("#")[0] + "?perspective=full&conceptId1=" + firstMatch.conceptId + "&edition=" + panel.options.edition + "&release=" + panel.options.release + "&server=" + panel.options.serverUrl + "&languages=" + panel.options.languages,
                //                dataContentValue: options.serverUrl.substr(0, options.serverUrl.length - 10)
                dataContentValue: document.URL.split("?")[0].split("#")[0]
            };

            $('#' + panel.attributesPId).html(JST["views/conceptDetailsPlugin/tabs/details/attributes-panel.hbs"](context));
            $('#' + 'share-link-' + panel.divElement.id).disableTextSelect();
            $('#' + 'share-link-' + panel.divElement.id).click(function(event) {
                setTimeout(function() {
                    $('#' + 'share-field-' + panel.divElement.id).select();
                }, 300);
            });


            // load home-attributes
            Handlebars.registerHelper('if_eq', function(a, b, opts) {
                if (opts != "undefined") {
                    if (a == b)
                        return opts.fn(this);
                    else
                        return opts.inverse(this);
                }
            });
            Handlebars.registerHelper("if_fav", function(concept, opts) {
                var favs = stringToArray(localStorage.getItem("favs"));
                var found = false;
                if (favs) {
                    $.each(favs, function(i, field) {
                        if (field == concept) {
                            found = true;
                        }
                    });
                    if (found) {
                        return opts.fn(this);
                    } else {
                        return opts.inverse(this);
                    }
                } else {
                    return opts.inverse(this);
                }
            });
            var context = {
                panel: panel,
                firstMatch: firstMatch,
                divElementId: panel.divElement.id,
                link: document.URL.split("?")[0].split("#")[0] + "?perspective=full&conceptId1=" + firstMatch.conceptId + "&edition=" + panel.options.edition + "&release=" + panel.options.release + "&server=" + panel.options.serverUrl + "&languages=" + panel.options.languages
            };
            $('#home-attributes-' + panel.divElement.id).html(JST["views/conceptDetailsPlugin/tabs/home/attributes.hbs"](context));

            // Update browser history
            var historyUrl = "?perspective=full&conceptId1=" + firstMatch.conceptId + "&edition=" + options.edition + "&release=" + options.release + "&server=" + options.serverUrl + "&languages=" + options.languages;
            manualStateChange = false;
            var state = {
                name: firstMatch.defaultTerm,
                conceptId: firstMatch.conceptId,
                url: historyUrl
            };
            History.pushState(state, "SNOMED CT - " + firstMatch.defaultTerm, historyUrl);

            $(".glyphicon-star-empty").click(function(e) {
                var concept = {
                    module: firstMatch.module,
                    conceptId: firstMatch.conceptId,
                    defaultTerm: firstMatch.defaultTerm
                };
                if ($(e.target).hasClass("glyphicon-star")) {
                    var favs = stringToArray(localStorage.getItem("favs")),
                        auxFavs = [];
                    $.each(favs, function(i, field) {
                        if (field != $(e.target).attr("data-conceptId")) {
                            auxFavs.push(field);
                        }
                    });
                    localStorage.setItem("favs", auxFavs);
                    localStorage.removeItem("conceptId:" + $(e.target).attr("data-conceptId"));
                    $(e.target).addClass("glyphicon-star-empty");
                    $(e.target).removeClass("glyphicon-star");
                    //                            console.log("removed from favs");
                } else {
                    var favs = stringToArray(localStorage.getItem("favs")),
                        auxFavs = [];
                    if (!favs) {
                        favs = [];
                        favs.push($(e.target).attr("data-conceptId"));
                        localStorage.setItem("favs", favs);
                        localStorage.setItem("conceptId:" + $(e.target).attr("data-conceptId"), JSON.stringify(concept));
                    } else {
                        $.each(favs, function(i, field) {
                            if (field != $(e.target).attr("data-conceptId")) {
                                auxFavs.push(field);
                            }
                        });
                        auxFavs.push($(e.target).attr("data-conceptId"));
                        localStorage.setItem("favs", auxFavs);
                        localStorage.setItem("conceptId:" + $(e.target).attr("data-conceptId"), JSON.stringify(concept));
                    }
                    $(e.target).addClass("glyphicon-star");
                    $(e.target).removeClass("glyphicon-star-empty");
                }
                channel.publish("favsAction");
            });
            // console.log("paso");
            //$('.clip-btn').unbind();
            if (panel.clipboard) panel.clipboard.destroy();
            panel.clipboard = new Clipboard('.clip-btn');
            panel.clipboard.on('success', function(e) {
                // console.info('Action:', e.action);
                // console.info('Text:', e.text);
                // console.info('Trigger:', e.trigger);
                alertEvent("Copied!", "info");
                e.clearSelection();
            });
            panel.clipboard.on('error', function(e) {
                console.log("Error!");
                alertEvent("Error", "error");
            });

            //var ctrlDown = false,
            //    ctrlKey = 17,
            //    cmdKey = 91,
            //    vKey = 86,
            //    cKey = 67;
            //
            //$(document).keydown(function(e) {
            //    if (e.keyCode == ctrlKey || e.keyCode == cmdKey) ctrlDown = true;
            //}).keyup(function(e) {
            //    if (e.keyCode == ctrlKey || e.keyCode == cmdKey) ctrlDown = false;
            //});
            //
            //$(document).keydown(function(e) {
            //    if (ctrlDown && e.keyCode == cKey){
            //        //var copyContent = document.getElementById("copy-content");
            //        e.clipboardData.setData('text/plain', firstMatch.term);
            //        e.preventDefault();
            //        //$("#" + panel.divElement.id + "-copy-sctid-term-details").click();
            //        //console.log("asd");
            //    }
            //});
            document.addEventListener("copy", copyHandler, false);

            function copyHandler(e) {
                if (window.getSelection().isCollapsed) {
                    if (e.srcElement && e.srcElement.value) {} else {
                        e.clipboardData.setData('text/plain', firstMatch.conceptId + " | " + firstMatch.defaultTerm + " |");
                        e.preventDefault();
                        alertEvent("Copied!", "info");
                    }
                }
            }


            //Swedish extension; capture synonyms using JIRA issue collector
            //start
            var scriptUrl = "https://jira.ihtsdotools.org/s/9152b378d577114d19d6cfdcdfdeb45e-T/en_US-i9n6p8/70120/a1623a9e469981bb7c457209f1507980/2.0.8/_/download/batch/com.atlassian.jira.collector.plugin.jira-issue-collector-plugin:issuecollector/com.atlassian.jira.collector.plugin.jira-issue-collector-plugin:issuecollector.js?locale=en-US&collectorId=41bec258";

            $.getScript(scriptUrl);

            window.ATL_JQ_PAGE_PROPS = {
                "triggerFunction": function(showCollectorDialog) {
                    //Requires that jQuery is available!
                    jQuery("#fh-cd1_canvas-addsyn-sctid-details").click(function(e) {
                        e.preventDefault();
                        showCollectorDialog();
                    });
                },

                fieldValues: {
                    'summary': 'Förslag på synonymer för begreppet: ' + state.conceptId,
                    'customfield_10602': state.conceptId,
                    'customfield_10601': state.name
                }
            };
            //end

            $(".glyphicon-star").click(function(e) {
                var concept = {
                    module: firstMatch.module,
                    conceptId: firstMatch.conceptId,
                    defaultTerm: firstMatch.defaultTerm
                };
                if ($(e.target).hasClass("glyphicon-star")) {
                    var favs = stringToArray(localStorage.getItem("favs")),
                        auxFavs = [];
                    $.each(favs, function(i, field) {
                        if (field != $(e.target).attr("data-conceptId")) {
                            auxFavs.push(field);
                        }
                    });
                    localStorage.setItem("favs", auxFavs);
                    localStorage.removeItem("conceptId:" + $(e.target).attr("data-conceptId"));
                    $(e.target).addClass("glyphicon-star-empty");
                    $(e.target).removeClass("glyphicon-star");
                    //                            console.log("removed from favs");
                } else {
                    var favs = stringToArray(localStorage.getItem("favs")),
                        auxFavs = [];
                    if (!favs) {
                        favs = [];
                        favs.push($(e.target).attr("data-conceptId"));
                        localStorage.setItem("favs", favs);
                        localStorage.setItem("conceptId:" + $(e.target).attr("data-conceptId"), JSON.stringify(concept));
                    } else {
                        $.each(favs, function(i, field) {
                            if (field != $(e.target).attr("data-conceptId")) {
                                auxFavs.push(field);
                            }
                        });
                        auxFavs.push($(e.target).attr("data-conceptId"));
                        localStorage.setItem("favs", auxFavs);
                        localStorage.setItem("conceptId:" + $(e.target).attr("data-conceptId"), JSON.stringify(concept));
                    }
                    $(e.target).addClass("glyphicon-star");
                    $(e.target).removeClass("glyphicon-star-empty");
                }
                channel.publish("favsAction");
            });

            if (!firstMatch.active) {
                $('#home-attributes-' + panel.divElement.id).css("background-color", "LightPink");
            } else {
                $('#home-attributes-' + panel.divElement.id).css("background-color", "#428bca");
            }

            if ($("#" + panel.divElement.id + "-expandButton").is(":visible")) {
                $("#" + panel.divElement.id + "-panelTitle").html("&nbsp;&nbsp;&nbsp;<strong>Concept Details: " + panel.defaultTerm + "</strong>");
            }
            if (typeof i18n_drag_this == "undefined") {
                i18n_drag_this = "Drag this";
            }
            $("[draggable='true']").tooltip({
                placement: 'left auto',
                trigger: 'hover',
                title: i18n_drag_this,
                animation: true,
                delay: 500
            });

            $("[draggable='true']").mouseover(function(e) {
                //                console.log(e);
                var term = $(e.target).attr("data-term");
                if (typeof term == "undefined") {
                    term = $($(e.target).parent()).attr("data-term");
                }
                icon = iconToDrag(term);
            });

            // load descriptions panel
            panel.descsPId = divElement.id + "-descriptions-panel";
            var languageName = "";
//            if (panel.options.langRefset == "900000000000508004") {
//                languageName = "(GB)";
//            } else if (panel.options.langRefset == "900000000000509007") {
//                languageName = "(US)";
//            } else if (panel.options.langRefset == "450828004") {
//                languageName = "(ES)";
//            } else if (panel.options.langRefset == "554461000005103") {
//                languageName = "(DA)";
//            } else if (panel.options.langRefset == "46011000052107") {
//                languageName = "(SV)";
//            } else if (panel.options.langRefset == "32570271000036106") {
//                languageName = "(AU)";
//            } else if (panel.options.langRefset == "999001251000000103") {
//                languageName = "(UK)";
//            } else if (panel.options.langRefset == "31000146106") {
//                languageName = "(NL)";
//            }
            // START FOR
            var allLangsHtml = "";
            firstMatch.descriptions.sort(function(a, b) {
                if (a.lang == options.defaultLanguage && b.lang != options.defaultLanguage)
                    return -1;
                if (a.lang != options.defaultLanguage && b.lang == options.defaultLanguage)
                    return 1;
                return 0;
            });
            for (var language in options.languageObject) {
                var allDescriptions = firstMatch.descriptions.slice(0);
                var homeDescriptionsHtml = "";
                $.each(allDescriptions, function(i, field) {
                    field.included = false;
                    field.preferred = false;
                    field.acceptable = false;
                    if (panel.options.displayInactiveDescriptions || field.active == true) {
                        if (field.active == true) {
                            if (homeDescriptionsHtml != "") {
                                homeDescriptionsHtml = homeDescriptionsHtml + "<br>";
                            }
                            homeDescriptionsHtml = homeDescriptionsHtml + "&nbsp;&nbsp;<i>" + field.lang + "</i>&nbsp;&nbsp;&nbsp;" + field.term;
                        }
                    }
                });
                Handlebars.registerHelper('removeSemtag', function(term) {
                    return panel.removeSemtag(term);
                });
                Handlebars.registerHelper('if_eq', function(a, b, opts) {
                    if (opts != "undefined") {
                        if (a == b)
                            return opts.fn(this);
                        else
                            return opts.inverse(this);
                    }
                });

                var auxDescriptions = [];
                $.each(allDescriptions, function(i, description) {
                    var included = false;
                    if(description.lang === language){
                        included = true;
                    }
                    if (description.acceptabilityMap) {
                        $.each(description.acceptabilityMap, function(langref, acceptability) {
                            acceptabilityPair = description.acceptabilityMap[i];
                                if (acceptability == "PREFERRED") {
                                    description.preferred = true;
                                } else {
                                    if (acceptability == "ACCEPTABLE") {
                                        description.acceptable = true;
                                    }
                                }
                        });
                    }

                    if (included) {
                        if (panel.options.displayInactiveDescriptions) {
                            auxDescriptions.push(description);
                        } else {
                            if (description.active) {
                                auxDescriptions.push(description);
                            }
                        }
                    } else {
                        description.acceptable = false;
                        if (panel.options.hideNotAcceptable) {
                            if (panel.options.displayInactiveDescriptions) {
                                auxDescriptions.push(description);
                            }
                        } else {
                            if (options.displayInactiveDescriptions) {
                                auxDescriptions.push(description);
                            } else {
                                if (description.active) {
                                    auxDescriptions.push(description);
                                }
                            }
                        }
                    }
                });
                allDescriptions = auxDescriptions.slice(0);
                allDescriptions.sort(function(a, b) {
                    if (a.active && !b.active)
                        return -1;
                    if (!a.active && b.active)
                        return 1;
                    if (a.active == b.active) {
                        if ((a.acceptable || a.preferred) && (!b.preferred && !b.acceptable))
                            return -1;
                        if ((!a.preferred && !a.acceptable) && (b.acceptable || b.preferred))
                            return 1;
                        if (a.typeId < b.typeId)
                            return -1;
                        if (a.typeId > b.typeId)
                            return 1;
                        if (a.typeId == b.typeId) {
                            if (a.preferred && !b.preferred)
                                return -1;
                            if (!a.preferred && b.preferred)
                                return 1;
                            if (a.preferred == b.preferred) {
                                if (a.term < b.term)
                                    return -1;
                                if (a.term > b.term)
                                    return 1;
                            }
                        }
                    }

                    return 0;
                });

                var context = {
                    options: panel.options,
                    languageName: "(" + language + ")",
                    longLangName: panel.options.languagesArray[language],
                    divElementId: panel.divElement.id,
                    allDescriptions: allDescriptions
                };

                /*if (panel.options.manifest) {
                    $.each(panel.options.manifest.languageRefsets, function(i, looplr) {
                        if (looplr.conceptId == loopSelectedLangRefset) {
                            context.longLangName = looplr.defaultTerm;
                        }
                    });
                }*/

                allLangsHtml += JST["views/conceptDetailsPlugin/tabs/details/descriptions-panel.hbs"](context);
                //if (panel.options.displaySynonyms) {
                $('#home-descriptions-' + panel.divElement.id).html(homeDescriptionsHtml);
                //}
            }
            // END FOR
            $("#" + panel.descsPId).html(allLangsHtml);


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

            $('#' + panel.descsPId).find("[rel=tooltip-right]").tooltip({ placement: 'right' });


            // load relationships panel and home parents/roles
            if (panel.options.selectedView == "stated") {
                //$('#home-' + panel.divElement.id + '-viewLabel').html("<span class='i18n' data-i18n-id='i18n_stated_view'>Stated view</span>");
                //$('#home-' + panel.divElement.id + '-diagram-viewLabel').html("<span class='i18n' data-i18n-id='i18n_stated_view'>Stated view</span>");
                $('#home-' + panel.divElement.id + '-stated-button').unbind();
                $('#home-' + panel.divElement.id + '-inferred-button').unbind();
                $('#details-' + panel.divElement.id + '-stated-button').unbind();
                $('#details-' + panel.divElement.id + '-inferred-button').unbind();
                $('#home-' + panel.divElement.id + '-stated-button').addClass("btn-primary");
                $('#home-' + panel.divElement.id + '-stated-button').removeClass("btn-default");
                $('#home-' + panel.divElement.id + '-inferred-button').addClass("btn-default");
                $('#home-' + panel.divElement.id + '-inferred-button').removeClass("btn-primary");
                $('#details-' + panel.divElement.id + '-stated-button').addClass("btn-primary");
                $('#details-' + panel.divElement.id + '-stated-button').removeClass("btn-default");
                $('#details-' + panel.divElement.id + '-inferred-button').addClass("btn-default");
                $('#details-' + panel.divElement.id + '-inferred-button').removeClass("btn-primary");
                $('#home-' + panel.divElement.id + '-inferred-button').click(function(event) {
                    panel.options.selectedView = "inferred";
                    panel.updateCanvas();
                });
                $('#details-' + panel.divElement.id + '-inferred-button').click(function(event) {
                    panel.options.selectedView = "inferred";
                    panel.updateCanvas();
                });
            } else {
                //$('#home-' + panel.divElement.id + '-viewLabel').html("<span class='i18n' data-i18n-id='i18n_inferred_view'>Inferred view</span>");
                //$('#home-' + panel.divElement.id + '-diagram-viewLabel').html("<span class='i18n' data-i18n-id='i18n_inferred_view'>Inferred view</span>");
                $('#home-' + panel.divElement.id + '-stated-button').unbind();
                $('#home-' + panel.divElement.id + '-inferred-button').unbind();
                $('#home-' + panel.divElement.id + '-inferred-button').addClass("btn-primary");
                $('#home-' + panel.divElement.id + '-inferred-button').removeClass("btn-default");
                $('#home-' + panel.divElement.id + '-stated-button').addClass("btn-default");
                $('#home-' + panel.divElement.id + '-stated-button').removeClass("btn-primary");
                $('#details-' + panel.divElement.id + '-stated-button').unbind();
                $('#details-' + panel.divElement.id + '-inferred-button').unbind();
                $('#details-' + panel.divElement.id + '-inferred-button').addClass("btn-primary");
                $('#details-' + panel.divElement.id + '-inferred-button').removeClass("btn-default");
                $('#details-' + panel.divElement.id + '-stated-button').addClass("btn-default");
                $('#details-' + panel.divElement.id + '-stated-button').removeClass("btn-primary");
                $('#home-' + panel.divElement.id + '-stated-button').click(function(event) {
                    panel.options.selectedView = "stated";
                    panel.updateCanvas();
                });
                $('#details-' + panel.divElement.id + '-stated-button').click(function(event) {
                    panel.options.selectedView = "stated";
                    panel.updateCanvas();
                });
            }
            panel.relsPId = divElement.id + "-rels-panel";


            if (firstMatch.relationships) {
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

            if (firstMatch.statedRelationships) {
                firstMatch.statedRelationships.forEach(function(loopRel) {
                    if(loopRel.active == true){
                        firstMatch.statedActive = "true";
                    }
                });
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
            Handlebars.registerHelper('push', function(element, array) {
                array.push(element);
                // return ;
            });
            Handlebars.registerHelper('if_eq', function(a, b, opts) {
                if (opts != "undefined") {
                    if (a == b)
                        return opts.fn(this);
                    else
                        return opts.inverse(this);
                }
            });
            var additionalRels;
            if (firstMatch.additionalRelationships) {
                $.each(firstMatch.additionalRelationships, function(i, looplr) {
                    if (looplr.active) {
                        if (typeof additionalRels == "undefined")
                            additionalRels = [];
                        additionalRels.push(looplr);
                    }
                });
            }
            var context = {
                options: panel.options,
                firstMatch: firstMatch,
                inferredParents: panel.inferredParents,
                inferredRoles: panel.inferredRoles,
                statedParents: panel.statedParents,
                statedRoles: panel.statedRoles,
                additionalRels: additionalRels,
                statedParentsFromAxioms: panel.statedParentsFromAxioms,
                attributesFromAxioms : panel.attributesFromAxioms
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

            panel.statedParentsFromAxioms.sort(function(a, b) {
                if (a.target.defaultTerm < b.target.defaultTerm)
                    return -1;
                if (a.target.defaultTerm > b.target.defaultTerm)
                    return 1;
                return 0;
            });

            panel.attributesFromAxioms.sort(function(a, b) {
                if (a.target.axiomId < b.target.axiomId)
                    return -1;
                if (a.target.axiomId > b.target.axiomId)
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

            Handlebars.registerHelper('substr', function(string, start) {
                var l = string.lastIndexOf("(") - 1;
                return string.substr(start, l);
            });
            Handlebars.registerHelper('if_eq', function(a, b, opts) {
                if (opts != "undefined") {
                    if (a == b)
                        return opts.fn(this);
                    else
                        return opts.inverse(this);
                }
            });
            Handlebars.registerHelper('if_gr', function(a, b, opts) {
                if (a) {
                    var s = a.lastIndexOf("(");
                    if (s > b)
                        return opts.fn(this);
                    else
                        return opts.inverse(this);
                }
            });
            Handlebars.registerHelper('hasCountryIcon', function(moduleId, opts) {
                if (countryIcons[moduleId])
                    return opts.fn(this);
                else
                    return opts.inverse(this);
            });

            var axioms = false;

            if(firstMatch.classAxioms.length > 0 || firstMatch.gciAxioms.length > 0) {
                axioms = true;
            } else {
                axioms = false;
            }

            var context = {
                divElementId: panel.divElement.id,
                statedParents: panel.statedParents,
                inferredParents: panel.inferredParents,
                options: panel.options,
                firstMatch: firstMatch,
                statedParentsFromAxioms: panel.statedParentsFromAxioms,
                attributesFromAxioms : panel.attributesFromAxioms,
                axioms: axioms
            };

            $('#home-parents-' + panel.divElement.id).html(JST["views/conceptDetailsPlugin/tabs/home/parents.hbs"](context));
            if (!panel.options.diagrammingMarkupEnabled) {
                $('#home-parents-' + panel.divElement.id).html(panel.stripDiagrammingMarkup($('#home-parents-' + panel.divElement.id).html()));
            }
            $(".treeButton").disableTextSelect();
            $("[draggable='true']").tooltip({
                placement: 'left auto',
                trigger: 'hover',
                title: i18n_drag_this,
                animation: true,
                delay: 500
            });

            $("[draggable='true']").mouseover(function(e) {
                //                console.log(e);
                var term = $(e.target).attr("data-term");
                if (typeof term == "undefined") {
                    term = $($(e.target).parent()).attr("data-term");
                }
                icon = iconToDrag(term);
            });
            $("#home-parents-" + panel.divElement.id).unbind();
            $("#home-parents-" + panel.divElement.id).click(function(event) {
                if ($(event.target).hasClass("treeButton")) {
                    var ev = event.target;
                    //firefox issue!
                    if (navigator.userAgent.indexOf("Firefox") > -1) {
                        ev = $(ev).context.children;
                    }
                    var conceptId = $(ev).closest("li").attr('data-concept-id');
                    event.preventDefault();
                    if ($(ev).hasClass("glyphicon-chevron-up")) {
                        $(ev).closest("li").find("ul").remove();
                        $(ev).removeClass("glyphicon-chevron-up");
                        $(ev).addClass("glyphicon-chevron-right");
                    } else if ($(ev).hasClass("glyphicon-chevron-right")) {
                        $(ev).removeClass("glyphicon-chevron-right");
                        $(ev).addClass("glyphicon-refresh");
                        $(ev).addClass("icon-spin");
                        panel.getParent(conceptId, ev);
                    } else if ($(ev).hasClass("glyphicon-minus")) {
                        //                      $("#" + iconId).removeClass("glyphicon-minus");
                        //                    $("#" + iconId).addClass("glyphicon-chevron-right");
                    }
                } else if ($(event.target).hasClass("treeLabel")) {
                    var selectedId = $(event.target).attr('data-concept-id');
                    if (typeof selectedId != "undefined") {
                        channel.publish(panel.divElement.id, {
                            term: $(event.target).attr('data-term'),
                            module: $(event.target).attr("data-module"),
                            conceptId: selectedId,
                            source: panel.divElement.id
                        });
                    }
                }
            });
            $("#home-parents-" + panel.divElement.id).dblclick(function(event) {
                var conceptId = $(event.target).closest("li").attr('data-concept-id');
                panel.conceptId = conceptId;
                panel.updateCanvas();
                channel.publish(panel.divElement.id, {
                    term: $(event.target).attr('data-term'),
                    module: $(event.target).attr("data-module"),
                    conceptId: conceptId,
                    source: panel.divElement.id
                });
            });

            Handlebars.registerHelper('eqLastGroup', function(a, opts) {
                //                console.log(a, panel.lastGroup);
                if (panel.lastGroup == null) {
                    panel.lastGroup = a;
                    return opts.fn(this);
                }
                if (a != panel.lastGroup)
                    return opts.fn(this);
                else
                    return opts.inverse(this);
            });
            Handlebars.registerHelper('if_eq', function(a, b, opts) {
                if (opts != "undefined") {
                    if (a == b)
                        return opts.fn(this);
                    else
                        return opts.inverse(this);
                }
            });
            Handlebars.registerHelper('removeSemtag', function(term) {
                return panel.removeSemtag(term);
            });
            Handlebars.registerHelper('setLastGroup', function(a) {
                panel.lastGroup = a;
            });
            Handlebars.registerHelper('lastColor', function(a) {
                if (a == "get") {
                    return "";
                    //                    return panel.color;
                } else {
                    if (a == "random") {
                        panel.color = getRandomColor();
                    } else {
                        panel.color = a;
                    }
                }
            });
            Handlebars.registerHelper('getRandomColor', function() {
                //                return getRandomColor();
                return "";
            });
            var context = {
                options: panel.options,
                statedRoles: panel.statedRoles,
                inferredRoles: panel.inferredRoles,
                firstMatch: firstMatch,
                statedParentsFromAxioms: panel.statedParentsFromAxioms,
                attributesFromAxioms : panel.attributesFromAxioms
            };
            //            console.log(panel.statedRoles);
            //            console.log(panel.inferredRoles);
            $('#home-roles-' + panel.divElement.id).html(JST["views/conceptDetailsPlugin/tabs/home/roles.hbs"](context));

            if (!panel.options.diagrammingMarkupEnabled) {
                $('#home-roles-' + panel.divElement.id).html(panel.stripDiagrammingMarkup($('#home-roles-' + panel.divElement.id).html()));
            }


            Handlebars.registerHelper('if_eq', function(a, b, opts) {
                if (opts != "undefined") {
                    if (a == b)
                        return opts.fn(this);
                    else
                        return opts.inverse(this);
                }
            });
            Handlebars.registerHelper('refset', function(type, data, opts) {
                if (data == "get") {
                    if (panel.refset[type]) {
                        return opts.fn(this);
                    } else {
                        return opts.inverse(this);
                    }
                } else {
                    panel.refset[type] = data;
                }
            });

            if (xhrRefsets != null) {
                xhrRefsets.abort();
            }

            xhrRefsets = $.getJSON(options.serverUrl + "/" + options.edition + "/" + ((options.release && options.release !== 'None') ? options.release + '/': '') + "members?referencedComponentId=" + firstMatch.conceptId, function(result) {
                }).done(function(result) {
                    var simpleRefsetMembers = [];
                    var simpleMapRefsetMembers = [];
                    var attributeValueRefsetMembers = [];
                    var associationRefsetMembers = [];
                    var ids = [];
                    if (result.total > 0) {
                        var initializeRefsetMemberByType = function(item, type) {
                            var refset = {};
                            refset.active = item.active;
                            refset.refsetId = item.refsetId;
                            refset.otherValue = item.additionalFields[type];

                            return refset;
                        }

                        result.items.forEach(function(item) {
                            if (Object.keys(item.additionalFields).length === 0) {
                                var refset = {};
                                refset.active = item.active;
                                refset.refsetId = item.refsetId;

                                simpleRefsetMembers.push(refset)
                                ids.push(item.refsetId);
                            }
                            else if (item.additionalFields.hasOwnProperty('mapTarget')) {
                                var refset = initializeRefsetMemberByType(item,'mapTarget');
                                simpleMapRefsetMembers.push(refset)
                                ids.push(item.refsetId);
                            }
                            else if (item.additionalFields.hasOwnProperty('valueId')) {
                                var refset = initializeRefsetMemberByType(item,'valueId');
                                attributeValueRefsetMembers.push(refset)
                                ids.push(item.refsetId);
                                ids.push(refset.otherValue);
                            }
                            else if (item.additionalFields.hasOwnProperty('targetComponent') || item.additionalFields.hasOwnProperty('targetComponentId')) {
                                var refset = {};
                                refset.active = item.active;
                                refset.refsetId = item.refsetId;
                                if (item.additionalFields.hasOwnProperty('targetComponent')) {
                                    refset.otherValue = item.additionalFields.targetComponent['id'];
                                }
                                else {
                                    refset.otherValue = item.additionalFields['targetComponentId'];
                                }

                                associationRefsetMembers.push(refset)
                                ids.push(item.refsetId);
                                ids.push(refset.otherValue);
                            }
                            else {
                                // do nothing
                            }
                        });
                    }

                    if (ids.length > 0) {
                        Handlebars.registerHelper('if_not_empty', function(list, opts) {
                            if (list) {
                                if (list.length > 0)
                                    return opts.fn(this);
                                else
                                    return opts.inverse(this);
                            }
                        });

                        var getConcepts =  function(list) {
							var dfd = $.Deferred();
							var result = {concepts: []};
							for (var i = 0 ; i < list.length; i++) {
								$.getJSON(options.serverUrl + "/browser/" + options.edition + "/" + ((options.release && options.release !== 'None') ? options.release + '/' : '') + "concepts/" + list[i], function (concept) {
								}).done(function (concept) {
									result.concepts.push(concept)
									if (result.concepts.length  === list.length) {
									  dfd.resolve(result);
									}
								}).fail(function (xhr, textStatus, error) {
									// do nothing
								});
							}
							return dfd.promise();
						};

						$.when(getConcepts(ids)).then(
							function( respone ) {
								var populateRefsetMember = function (list, type, conceptsMap) {
                                    if (type === 'simple' || type === 'simplemap'){
                                        list.forEach(function(item) {
                                            var concept = conceptsMap[item.refsetId];

                                            item.definitionStatus = concept.definitionStatus;
                                            item.defaultTerm = concept.pt ? concept.pt.term : concept.fsn.term;
                                            item.module = concept.moduleId;
                                            item.effectiveTime = concept.effectiveTime;
                                            item.conceptId = concept.conceptId;
                                        });
                                    }
                                    else if (type === 'attr' || type === 'assoc') {
                                        list.forEach(function(item) {
                                            var concept = conceptsMap[item.refsetId];

                                            item.definitionStatus = concept.definitionStatus;
                                            item.defaultTerm =  concept.pt ? concept.pt.term : concept.fsn.term;
                                            item.module = concept.moduleId;
                                            item.effectiveTime = concept.effectiveTime;
                                            item.conceptId = concept.conceptId;

                                            var cidConcept = conceptsMap[item.otherValue];
                                            var cidValue = {};
                                            cidValue.module = cidConcept.moduleId;
                                            cidValue.defaultTerm =  cidConcept.pt ? cidConcept.pt.term : cidConcept.fsn.term;
                                            cidValue.conceptId = cidConcept.conceptId;
                                            cidValue.definitionStatus = cidConcept.definitionStatus;

                                            item.cidValue = cidValue;
                                        });
                                    }
                                    else {
                                        // do nothing
                                    }
                                }

                                var conceptsMap = {};
                                respone.concepts.forEach(function(item) {
                                    conceptsMap[item.conceptId] = item;
                                });

                                populateRefsetMember(simpleRefsetMembers,'simple',conceptsMap);
                                populateRefsetMember(simpleMapRefsetMembers,'simplemap',conceptsMap);
                                populateRefsetMember(attributeValueRefsetMembers,'attr',conceptsMap);
                                populateRefsetMember(associationRefsetMembers,'assoc',conceptsMap);

                                var context = {
                                    firstMatch : firstMatch,
                                    simpleRefsetMembers: simpleRefsetMembers,
                                    simpleMapRefsetMembers: simpleMapRefsetMembers,
                                    attributeValueRefsetMembers: attributeValueRefsetMembers,
                                    associationRefsetMembers: associationRefsetMembers
                                };

                                $('#refsets-' + panel.divElement.id).html(JST["views/conceptDetailsPlugin/tabs/refset.hbs"](context));
							},
							function( status ) {
								// do nothing
							}
						);
                    } else {
                        var context = {
                            firstMatch : firstMatch,
                            simpleRefsetMembers: [],
                            simpleMapRefsetMembers: [],
                            attributeValueRefsetMembers: [],
                            associationRefsetMembers: []
                        };

                        $('#refsets-' + panel.divElement.id).html(JST["views/conceptDetailsPlugin/tabs/refset.hbs"](context));
                    }
                }).fail(function() {
                    $("#refsets-" + panel.divElement.id).html("<div class='alert alert-danger'><span class='i18n' data-i18n-id='i18n_ajax_failed'><strong>Error</strong> while retrieving data from server...</span></div>");
                }
            );

            if ($('ul#details-tabs-' + panel.divElement.id + ' li.active').attr('id') == "references-tab") {
                $("#references-" + panel.divElement.id + "-resultsTable").html("");
                panel.getReferences(firstMatch.conceptId);
            }

            if ($('ul#details-tabs-' + panel.divElement.id + ' li.active').attr('id') == "diagram-tab") {
                drawConceptDiagram(firstMatch, $("#diagram-canvas-" + panel.divElement.id), panel.options, panel);
            }

            if ($('ul#details-tabs-' + panel.divElement.id + ' li.active').attr('id') == "expression-tab") {
                $("#expression-canvas-" + panel.divElement.id).html("<i class='glyphicon glyphicon-refresh icon-spin'></i>");
                setTimeout(function() {
                    renderExpression(firstMatch, firstMatch, $("#expression-canvas-" + panel.divElement.id), options);
                }, 300);
            }

            $("#references-tab-link-" + panel.divElement.id).unbind();
            $("#references-tab-link-" + panel.divElement.id).click(function(e) {
                $("#references-" + panel.divElement.id + "-resultsTable").html("<i class='glyphicon glyphicon-refresh icon-spin'></i>");
                panel.getReferences(firstMatch.conceptId);
            });
            $("#diagram-tab-link-" + panel.divElement.id).unbind();
            $("#diagram-tab-link-" + panel.divElement.id).click(function(e) {
                $("#diagram-canvas-" + panel.divElement.id).html("<i class='glyphicon glyphicon-refresh icon-spin'></i>");
                setTimeout(function() {
                    $("#diagram-canvas-" + panel.divElement.id).html("");
                    drawConceptDiagram(firstMatch, $("#diagram-canvas-" + panel.divElement.id), panel.options, panel);
                }, 1000);
            });

            $("#expression-tab-link-" + panel.divElement.id).unbind();
            $("#expression-tab-link-" + panel.divElement.id).click(function(e) {
                $("#expression-canvas-" + panel.divElement.id).html("<i class='glyphicon glyphicon-refresh icon-spin'></i>");
                setTimeout(function() {
                    $("#expression-canvas-" + panel.divElement.id).html("");
                    renderExpression(firstMatch, firstMatch, $("#expression-canvas-" + panel.divElement.id), options);
                }, 1000)
            });

            if (firstMatch.defaultTerm.endsWith("(clinical drug)")) {
                $("#product-details-tab").show();
                var productData = {
                    defaultTerm: firstMatch.defaultTerm,
                    forms: [],
                    groups: {},
                    ingredients: []
                };
                firstMatch.relationships.forEach(function(loopRel) {
                    if (loopRel.type.conceptId == "411116001" && loopRel.active) {
                        productData.forms.push(loopRel);
                    } else if (loopRel.active && loopRel.groupId != 0) {
                        if (typeof productData.groups[loopRel.groupId] == "undefined") {
                            productData.groups[loopRel.groupId] = [];
                        }
                        productData.groups[loopRel.groupId].push(loopRel);
                    }
                });
                Object.keys(productData.groups).forEach(function(loopKey) {
                    var loopGroup = productData.groups[loopKey];
                    var loopIngredient = {};
                    loopGroup.forEach(function(loopRel) {
                        if (loopRel.type.conceptId == "127489000") {
                            loopIngredient.ingredient = loopRel.target;
                        } else if (loopRel.type.conceptId == "732946004") {
                            loopIngredient.denominatorValue = loopRel.target;
                        } else if (loopRel.type.conceptId == "732944001") {
                            loopIngredient.numeratorValue = loopRel.target;
                        } else if (loopRel.type.conceptId == "732943007") {
                            loopIngredient.boss = loopRel.target;
                        } else if (loopRel.type.conceptId == "732947008") {
                            loopIngredient.denominatorUnit = loopRel.target;
                        } else if (loopRel.type.conceptId == "732945000") {
                            loopIngredient.numeratorUnit = loopRel.target;
                        }
                    });
                    productData.ingredients.push(loopIngredient);
                    // var demoIngredient1 = {
                    //     ingredient: {definitionStatus: "PRIMITIVE",conceptId:1,defaultTerm:"Atenolol (substance)"},
                    //     boss: {definitionStatus: "PRIMITIVE",conceptId:1,defaultTerm:"Atenolol (substance)"},
                    //     numeratorValue: {definitionStatus: "PRIMITIVE",conceptId:1,defaultTerm:"50 (qualifier value)"},
                    //     numeratorUnit: {definitionStatus: "PRIMITIVE",conceptId:1,defaultTerm:"milligram (qualifier value)"},
                    //     denominatorValue: {definitionStatus: "PRIMITIVE",conceptId:1,defaultTerm:"1 (qualifier value)"},
                    //     denominatorUnit: {definitionStatus: "PRIMITIVE",conceptId:1,defaultTerm:"Tablet (unit of presentation)"}
                    // };
                    // var demoIngredient2 = {
                    //     ingredient: {definitionStatus: "PRIMITIVE",conceptId:1,defaultTerm:"Chlorthalidone (substance)"},
                    //     boss: {definitionStatus: "PRIMITIVE",conceptId:1,defaultTerm:"Chlorthalidone (substance)"},
                    //     numeratorValue: {definitionStatus: "PRIMITIVE",conceptId:1,defaultTerm:"12.5 (qualifier value)"},
                    //     numeratorUnit: {definitionStatus: "PRIMITIVE",conceptId:1,defaultTerm:"milligram (qualifier value)"},
                    //     denominatorValue: {definitionStatus: "PRIMITIVE",conceptId:1,defaultTerm:"1 (qualifier value)"},
                    //     denominatorUnit: {definitionStatus: "PRIMITIVE",conceptId:1,defaultTerm:"Tablet (unit of presentation)"}
                    // };
                    //productData.ingredients = [demoIngredient1, demoIngredient2];
                });
                console.log(productData);
                var context = {
                    productData: productData
                };
                $('#product-details-' + panel.divElement.id).html(
                    JST["views/conceptDetailsPlugin/tabs/product.hbs"](context));
            } else {
                if ($("#product-details-tab").hasClass("active")) {
                    $('#details-tabs-' + panel.divElement.id + ' a:first').tab('show');
                }
                $("#product-details-tab").hide();
            }

            $('.more-fields-button').disableTextSelect();
            $('.more-fields-button').popover();

            //          firefox popover
            if (navigator.userAgent.indexOf("Firefox") > -1) {
                $(".more-fields-button").optionsPopover({
                    contents: "",
                    disableBackButton: true
                });

                $(".more-fields-button").click(function(e) {
                    var auxHtml = $(e.target).attr('data-content');
                    $("#popoverContent").html(auxHtml);
                });
            }

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
            $("[draggable='true']").tooltip({
                placement: 'left auto',
                trigger: 'hover',
                title: i18n_drag_this,
                animation: true,
                delay: 500
            });

            $("[draggable='true']").mouseover(function(e) {
                //                console.log(e);
                var term = $(e.target).attr("data-term");
                if (typeof term == "undefined") {
                    term = $($(e.target).parent()).attr("data-term");
                }
                icon = iconToDrag(term);
            });

            if (typeof(switchLanguage) == "function") {
                switchLanguage(selectedLanguage, selectedFlag, false);
            }
            conceptRequested = 0;

            //            membersUrl = options.serverUrl + "/" + options.edition + "/" + options.release + "/concepts/" + panel.conceptId + "/members";

        }).fail(function(xhr, textStatus, error) {
            if (textStatus !== 'abort') {
                panel.relsPId = divElement.id + "-rels-panel";
                panel.attributesPId = divElement.id + "-attributes-panel";
                panel.descsPId = divElement.id + "-descriptions-panel";
                $("#home-" + panel.divElement.id).html("<div class='alert alert-danger'><span class='i18n' data-i18n-id='i18n_ajax_failed'><strong>Error</strong> while retrieving data from server...</span></div>");
                $("#diagram-" + panel.divElement.id).html("<div class='alert alert-danger'><span class='i18n' data-i18n-id='i18n_ajax_failed'><strong>Error</strong> while retrieving data from server...</span></div>");
                $("#members-" + panel.divElement.id).html("<div class='alert alert-danger'><span class='i18n' data-i18n-id='i18n_ajax_failed'><strong>Error</strong> while retrieving data from server...</span></div>");
                $("#references-" + panel.divElement.id).html("<div class='alert alert-danger'><span class='i18n' data-i18n-id='i18n_ajax_failed'><strong>Error</strong> while retrieving data from server...</span></div>");
                $("#refsets-" + panel.divElement.id).html("<div class='alert alert-danger'><span class='i18n' data-i18n-id='i18n_ajax_failed'><strong>Error</strong> while retrieving data from server...</span></div>");
                $('#' + panel.attributesPId).html("<div class='alert alert-danger'><span class='i18n' data-i18n-id='i18n_ajax_failed'><strong>Error</strong> while retrieving data from server...</span></div>");
                $('#' + panel.descsPId).html("");
                $('#' + panel.relsPId).html("");
            }
        });
        //        if (typeof xhr != "undefined") {
        //            console.log("aborting call...");
        //
        //        }
        if (panel.options.displayChildren) {
            var context = {

            };
        } else {}

        //        if (panel.options.displayChildren == false) {
        ////            $("#home-children-" + panel.divElement.id).hide();
        //            $('#' + panel.childrenPId).html("");
        //            $('#' + panel.childrenPId).hide();
        //        } else {
        //            $("#home-children-" + panel.divElement.id).show();
        //            $('#' + panel.childrenPId).show();
        if (xhrChildren != null) {
            xhrChildren.abort();
            //console.log("aborting children call...");
        };
        var branch = options.edition;
        if(options.release.length > 0 && options.release !== 'None'){
            branch = branch + "/" + options.release;
        };
        $.ajaxSetup({
          headers : {
            'Accept-Language': options.languages
          }
        });
        xhrChildren = $.getJSON(options.serverUrl + "/browser/" + branch + "/concepts/" + panel.conceptId + "/children?form=" + panel.options.selectedView, function(result) {
            //$.getJSON(panel.url + "rest/browser/concepts/" + panel.conceptId + "/children", function(result) {
        }).done(function(result) {
            result.forEach(function(item) {
                if(item.pt.lang === options.defaultLanguage && options.defaultLanguage != 'en' && item.fsn.lang != options.defaultLanguage){
                    item.defaultTerm = item.pt.term;
                }
                else{
                    item.defaultTerm = item.fsn.term;
                }
            });
            // load relationships panel
            result.sort(function(a, b) {
                if (a.defaultTerm.toLowerCase() < b.defaultTerm.toLowerCase())
                    return -1;
                if (a.defaultTerm.toLowerCase() > b.defaultTerm.toLowerCase())
                    return 1;
                return 0;
            });
            Handlebars.registerHelper('if_gr', function(a, b, opts) {
                if (a) {
                    if (a > b)
                        return opts.fn(this);
                    else
                        return opts.inverse(this);
                }
            });
            xhrChildren = null;
            panel.childrenPId = divElement.id + "-children-panel";
            //                console.log(result);
            var context = {
                displayChildren: panel.options.displayChildren,
                divElementId: panel.divElement.id,
                childrenResult: result,
                selectedView: panel.options.selectedView
            };
            $("#home-children-cant-" + panel.divElement.id).html("(" + result.length + ")");
            $('#' + panel.childrenPId).html(JST["views/conceptDetailsPlugin/tabs/details/children-panel.hbs"](context));
            $("#home-children-" + panel.divElement.id + "-body").html(JST["views/conceptDetailsPlugin/tabs/home/children.hbs"](context));
            $(".treeButton").disableTextSelect();
            if (typeof i18n_drag_this == "undefined") {
                i18n_drag_this = "Drag this";
            }
            $("[draggable='true']").tooltip({
                placement: 'left auto',
                trigger: 'hover',
                title: i18n_drag_this,
                animation: true,
                delay: 500
            });

            $("[draggable='true']").mouseover(function(e) {
                //                console.log(e);
                var term = $(e.target).attr("data-term");
                if (typeof term == "undefined") {
                    term = $($(e.target).parent()).attr("data-term");
                }
                icon = iconToDrag(term);
            });
            $("#home-children-" + panel.divElement.id + "-body").unbind();
            $("#home-children-" + panel.divElement.id + "-body").click(function(event) {
                if ($(event.target).hasClass("treeButton")) {
                    var conceptId = $(event.target).closest("li").attr('data-concept-id');
                    var iconId = panel.divElement.id + "-treeicon-" + conceptId;
                    event.preventDefault();
                    if ($("#" + iconId).hasClass("glyphicon-chevron-down")) {
                        //console.log("close");
                        $(event.target).closest("li").find("ul").remove();
                        $("#" + iconId).removeClass("glyphicon-chevron-down");
                        $("#" + iconId).addClass("glyphicon-chevron-right");
                    } else if ($("#" + iconId).hasClass("glyphicon-chevron-right")) {
                        //console.log("open");
                        $("#" + iconId).removeClass("glyphicon-chevron-right");
                        $("#" + iconId).addClass("glyphicon-refresh");
                        $("#" + iconId).addClass("icon-spin");
                        panel.getChildren($(event.target).closest("li").attr('data-concept-id'), true);
                    } else if ($("#" + iconId).hasClass("glyphicon-minus")) {
                        //                    $("#" + iconId).removeClass("glyphicon-minus");
                        //                    $("#" + iconId).addClass("glyphicon-chevron-right");
                    }
                } else if ($(event.target).hasClass("treeLabel")) {
                    var selectedId = $(event.target).attr('data-concept-id');
                    if (typeof selectedId != "undefined") {
                        channel.publish(panel.divElement.id, {
                            term: $(event.target).attr('data-term'),
                            module: $(event.target).attr("data-module"),
                            conceptId: selectedId,
                            source: panel.divElement.id
                        });
                    }
                }
            });

            $("#home-children-" + panel.divElement.id + "-body").dblclick(function(event) {
                var conceptId = $(event.target).closest("li").attr('data-concept-id');
                panel.conceptId = conceptId;
                panel.updateCanvas();
                channel.publish(panel.divElement.id, {
                    term: $(event.target).attr('data-term'),
                    module: $(event.target).attr("data-module"),
                    conceptId: conceptId,
                    source: panel.divElement.id
                });
            });
            if (typeof i18n_display_children == "undefined") {
                i18n_display_children = "Display Children";
            }
            $("#" + panel.divElement.id + "-showChildren").tooltip({
                placement: 'right',
                trigger: 'hover',
                title: i18n_display_children,
                animation: true,
                delay: 500
            });
            $("#" + panel.divElement.id + "-showChildren").click(function() {
                panel.options.displayChildren = true;
                panel.updateCanvas();
            });
        }).fail(function() {
            $('#' + panel.childrenPId).html("<div class='alert alert-danger'><span class='i18n' data-i18n-id='i18n_ajax_failed'><strong>Error</strong> while retrieving data from server...</span></div>");
        });
        //    }
        panel.loadMembers(100, 0);
    }

    this.getReferences = function(conceptId) {
        $("#references-" + panel.divElement.id + "-accordion").html("<i class='glyphicon glyphicon-refresh icon-spin'></i>");
        //console.log(options.serverUrl + "/" + options.edition + "/" + options.release + "/concepts/" + conceptId + "/references");
        if (xhrReferences != null) {
            xhrReferences.abort();
            xhrReferences = null;
        };
        var branch = options.edition;
        if(options.release.length > 0 && options.release !== 'None'){
            branch = branch + "/" + options.release;
        };
        $.ajaxSetup({
          headers : {
            'Accept-Language': options.languages
          }
        });
        xhrReferences = $.getJSON(options.serverUrl + "/" + branch + "/concepts/" + conceptId + "/references?stated=" + (panel.options.selectedView === 'stated') + '&offset=0&limit=10000', function(result) {

        }).done(function(result) {
            Handlebars.registerHelper('if_gr', function(a, b, opts) {
                if (a) {
                    if (a > b)
                        return opts.fn(this);
                    else
                        return opts.inverse(this);
                }
            });

            result.referencesByType.sort(function(a, b) {
                if (a.referenceType.id === '116680003' || b.referenceType.id === '116680003') {
                    return -1;
                }
                if (a.referenceType.fsn.term >  b.referenceType.fsn.term) {
                    return 1;
                }
                if (a.referenceType.fsn.term <  b.referenceType.fsn.term) {
                    return -1;
                }

                return 0;
            });

            result.referencesByType.forEach(function(item) {
                item.referencingConcepts.sort(function(a, b) {
                    if (a.fsn.term >  b.fsn.term) {
                        return 1;
                    }
                    if (a.fsn.term <  b.fsn.term) {
                        return -1;
                    }

                    return 0;
                });
            });

            var context = {
                divElementId: panel.divElement.id,
                result: result
            };
            //            $("#references-" + panel.divElement.id + "-total").html(result.length  + " references");
            $("#references-" + panel.divElement.id + "-accordion").html(JST["views/conceptDetailsPlugin/tabs/references.hbs"](context));
            $("#references-" + panel.divElement.id + "-accordion").click(function(e) {
                if ($($(e.target).closest("a").attr("href")).hasClass("collapse")) {
                    //console.log("finded");
                    var target = $($(e.target).closest("a").attr("href") + "-span");
                    if (target.hasClass("glyphicon-chevron-right")) {
                        target.removeClass("glyphicon-chevron-right");
                        target.addClass("glyphicon-chevron-down");
                    } else {
                        target.addClass("glyphicon-chevron-right");
                        target.removeClass("glyphicon-chevron-down");
                    }
                }
            });
            //            console.log(result, result.length);
        }).fail(function() {
            $("#references-" + panel.divElement.id + "-accordion").html("<div class='alert alert-danger'><span class='i18n' data-i18n-id='i18n_ajax_failed'><strong>Error</strong> while retrieving data from server...</span></div>");
        });

    }

    this.getChildren = function(conceptId, forceShow) {
        if (typeof panel.options.selectedView == "undefined") {
            panel.options.selectedView = "inferred";
        }

        if (panel.options.selectedView == "inferred") {
            $("#" + panel.divElement.id + "-txViewLabel").html("<span class='i18n' data-i18n-id='i18n_inferred_view'>Inferred view</span>");
        } else {
            $("#" + panel.divElement.id + "-txViewLabel").html("<span class='i18n' data-i18n-id='i18n_stated_view'>Stated view</span>");
        }

        if (xhrChildren != null) {
            xhrChildren.abort();
            //console.log("aborting children call...");
        };
        var branch = options.edition;
        if(options.release.length > 0 && options.release !== 'None'){
            branch = branch + "/" + options.release;
        };
        $.ajaxSetup({
          headers : {
            'Accept-Language': options.languages
          }
        });
        xhrChildren = $.getJSON(options.serverUrl + "/browser/" + branch + "/concepts/" + conceptId + "/children?form=" + panel.options.selectedView, function(result) {}).done(function(result) {
            result.forEach(function(c) { setDefaultTerm(c) });
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
                displayChildren: panel.options.displayChildren,
                childrenResult: result,
                divElementId: panel.divElement.id,
                selectedView: panel.options.selectedView
            };
            if (typeof forceShow != "undefined") {
                if (forceShow) {
                    context.displayChildren = forceShow;
                }
            }
            Handlebars.registerHelper('hasCountryIcon', function(moduleId, opts) {
                if (countryIcons[moduleId])
                    return opts.fn(this);
                else
                    return opts.inverse(this);
            });
            Handlebars.registerHelper('if_eq', function(a, b, opts) {
                if (opts != "undefined") {
                    if (a == b)
                        return opts.fn(this);
                    else
                        return opts.inverse(this);
                }
            });
            Handlebars.registerHelper('push', function(element) {
                listIconIds.push(element);
            });
            $("#" + panel.divElement.id + "-treeicon-" + conceptId).removeClass("glyphicon-refresh");
            $("#" + panel.divElement.id + "-treeicon-" + conceptId).removeClass("icon-spin");
            if (result.length > 0) {
                $("#" + panel.divElement.id + "-treeicon-" + conceptId).addClass("glyphicon-chevron-down");
            } else {
                $("#" + panel.divElement.id + "-treeicon-" + conceptId).addClass("glyphicon-minus");
            }
            $("#" + panel.divElement.id + "-treenode-" + conceptId).closest("li").append(JST["views/conceptDetailsPlugin/tabs/home/children.hbs"](context));
            $(".treeButton").disableTextSelect();
            $("[draggable='true']").tooltip({
                placement: 'left auto',
                trigger: 'hover',
                title: i18n_drag_this,
                animation: true,
                delay: 500
            });

            $("[draggable='true']").mouseover(function(e) {
                //                console.log(e);
                var term = $(e.target).attr("data-term");
                if (typeof term == "undefined") {
                    term = $($(e.target).parent()).attr("data-term");
                }
                icon = iconToDrag(term);
            });

        }).fail(function() {
            $("#" + panel.divElement.id + "-treeicon-" + conceptId).removeClass("icon-spin");
            $("#" + panel.divElement.id + "-treeicon-" + conceptId).removeClass("glyphicon-refresh");
            $("#" + panel.divElement.id + "-treeicon-" + conceptId).addClass("glyphicon-minus");
        });
    }

    this.getParent = function(conceptId, target) {
        if (xhrParents != null) {
            xhrParents.abort();
            //console.log("aborting children call...");
        };
        var branch = "" + options.edition;
        if(options.release.length > 0 && options.release !== 'None'){
            branch = branch + "/" + options.release;
        };
        $.ajaxSetup({
          headers : {
            'Accept-Language': options.languages
          }
        });
        xhrParents = $.getJSON(options.serverUrl + "/browser/" + branch + "/concepts/" + conceptId + "/parents?form=" + panel.options.selectedView, function(result) {
            //$.getJSON(panel.url + "rest/browser/concepts/" + panel.conceptId + "/children", function(result) {
        }).done(function(result) {
            result.forEach(function(c) {
                if(c.pt.lang === options.defaultLanguage && options.defaultLanguage != 'en' && c.fsn.lang != options.defaultLanguage){
                    c.defaultTerm = c.pt.term;
                }
                else{
                    c.defaultTerm = c.fsn.term;
                }
            });
            result.sort(function(a, b) {
                if (a.defaultTerm.toLowerCase() < b.defaultTerm.toLowerCase())
                    return -1;
                if (a.defaultTerm.toLowerCase() > b.defaultTerm.toLowerCase())
                    return 1;
                return 0;
            });
            var auxHtml = "";
            var ind = $(target).attr('data-ind');
            if (result.length > 0) {
                if ($(target).attr('data-firstt')) {
                    auxHtml = "<ul style='margin-left: 95px; list-style-type: none; padding-left: 15px'>";
                } else {
                    auxHtml = "<ul style='list-style-type: none; padding-left: 15px'>";
                }
                $.each(result, function(i, field) {
                    //                    console.log(field);
                    auxHtml = auxHtml + "<li class='treeLabel' data-module='" + field.module + "' data-concept-id='" + field.conceptId + "' data-term='" + field.defaultTerm + "'><button class='btn btn-link btn-xs treeButton' style='padding:2px'>";
                    if (field.conceptId == "138875005" || field.conceptId == "9999999999") {
                        auxHtml = auxHtml + "<i class='glyphicon glyphicon-minus treeButton' data-ind='" + ind + "'></i></button>";
                    } else {
                        auxHtml = auxHtml + "<i class='glyphicon glyphicon-chevron-right treeButton' data-ind='" + ind + "'></i></button>";
                    }
                    if (field.definitionStatus == "PRIMITIVE") {
                        auxHtml = auxHtml + "<span class='badge alert-warning' draggable='true' ondragstart='drag(event)' data-module='" + field.module + "' data-concept-id='" + field.conceptId + "' data-term='" + field.defaultTerm + "'>&nbsp;&nbsp;</span>&nbsp;&nbsp";
                    } else {
                        auxHtml = auxHtml + "<span class='badge alert-warning' draggable='true' ondragstart='drag(event)' data-module='" + field.module + "' data-concept-id='" + field.conceptId + "' data-term='" + field.defaultTerm + "'>&equiv;</span>&nbsp;&nbsp";
                    }
                    if (countryIcons[field.module]) {
                        auxHtml = auxHtml + "<div class='phoca-flagbox' style='width:26px;height:26px'><span class='phoca-flag " + countryIcons[field.module] + "'></span></div>&nbsp";
                    }
                    auxHtml = auxHtml + "<a id='" + ind + panel.divElement.id + "-treeicon-" + field.conceptId + "' href='javascript:void(0);' style='color: inherit;text-decoration: inherit;'>";
                    auxHtml = auxHtml + "<span class='treeLabel selectable-row' data-module='" + field.module + "' data-concept-id='" + field.conceptId + "' data-term='" + field.defaultTerm + "'>" + field.defaultTerm + "</span></a></li>";
                });
                auxHtml = auxHtml + "</ul>";
            }
            $(target).removeClass("glyphicon-refresh");
            $(target).removeClass("icon-spin");
            if (result.length > 0) {
                $(target).addClass("glyphicon-chevron-up");
            } else {
                $(target).addClass("glyphicon-minus");
            }
            $(target).closest("li").prepend(auxHtml);
            //            $("#" + ind + panel.divElement.id + "-treeicon-" + conceptId).after(auxHtml);
            $(".treeButton").disableTextSelect();
            $("[draggable='true']").tooltip({
                placement: 'left auto',
                trigger: 'hover',
                title: i18n_drag_this,
                animation: true,
                delay: 500
            });

            $("[draggable='true']").mouseover(function(e) {
                //                console.log(e);
                var term = $(e.target).attr("data-term");
                if (typeof term == "undefined") {
                    term = $($(e.target).parent()).attr("data-term");
                }
                icon = iconToDrag(term);
            });
        }).fail(function() {});
    }

    this.loadMembers = function(returnLimit, skipTo, paginate) {
        var branch = options.edition;
        if(options.release.length > 0 && options.release !== 'None'){
            branch = branch + "/" + options.release;
        };
        var membersUrl = options.serverUrl + "/" + branch + "/members?referenceSet=" + panel.conceptId + "&limit=100";
        if (skipTo > 0) {
            membersUrl = membersUrl + "&offset=" + skipTo;
        } else {
            $('#members-' + panel.divElement.id + "-resultsTable").html("<tr><td class='text-muted' colspan='2'><i class='glyphicon glyphicon-refresh icon-spin'></i></td></tr>");
        }
        var total;
        if (typeof total != "undefined") {
            paginate = 1;
            membersUrl = membersUrl + "&paginate=1";
        }

        if (xhrMembers != null) {
            xhrMembers.abort();
            xhrMembers = null;
        }

        xhrMembers = $.getJSON(membersUrl, function(result) {

        }).done(function(result) {
            var remaining = "asd";
            if (typeof total == "undefined") total = result.total;
            if (total == skipTo) {
                remaining = 0;
            } else {
                if (total > (skipTo + returnLimit)) {
                    remaining = total - (skipTo + returnLimit);
                } else {
                    remaining = 0;
                }
            }
            if (remaining < returnLimit) {
                var returnLimit2 = remaining;
            } else {
                if (remaining != 0) {
                    var returnLimit2 = returnLimit;
                } else {
                    var returnLimit2 = 0;
                }
            }

            var isReferenceComponentsOfRefsetNotConcepts = false;
            if (result.items && result.items.length > 0) {
                result.items.forEach(function(item){
                    if(!item.hasOwnProperty('referencedComponent')){
                        isReferenceComponentsOfRefsetNotConcepts = true;
                        return;
                    }
                });
            }
            var context = {};
            if (isReferenceComponentsOfRefsetNotConcepts) {
                context = {
                    result: {'items':[]},
                    divElementId: panel.divElement.id,
                    total: total,
                    skipTo: 0,
                    referenceComponentsOfRefsetAreNotConcepts: true
                };
            }
            else {
                context = {
                    result: result,
                    returnLimit: returnLimit2,
                    remaining: remaining,
                    divElementId: panel.divElement.id,
                    skipTo: skipTo,
                    panel: panel,
                    total: total,
                    referenceComponentsOfRefsetAreNotConcepts: false
                };
            }
            Handlebars.registerHelper('if_eq', function(a, b, opts) {
                if (opts != "undefined") {
                    if (a == b)
                        return opts.fn(this);
                    else
                        return opts.inverse(this);
                }
            });
            Handlebars.registerHelper('if_gr', function(a, b, opts) {
                if (a) {
                    if (a > b)
                        return opts.fn(this);
                    else
                        return opts.inverse(this);
                }
            });
            Handlebars.registerHelper('hasCountryIcon', function(moduleId, opts) {
                if (countryIcons[moduleId])
                    return opts.fn(this);
                else
                    return opts.inverse(this);
            });
            if (result.total != 0) {
                $("#" + panel.divElement.id + "-moreMembers").remove();
                $("#members-" + panel.divElement.id + "-resultsTable").find(".more-row").remove();
                if (skipTo == 0) {
                    $('#members-' + panel.divElement.id + "-resultsTable").html(JST["views/conceptDetailsPlugin/tabs/members.hbs"](context));
                } else {
                    $('#members-' + panel.divElement.id + "-resultsTable").append(JST["views/conceptDetailsPlugin/tabs/members.hbs"](context));
                }
                $("#" + panel.divElement.id + "-moreMembers").click(function() {
                    $("#" + panel.divElement.id + "-moreMembers").html("<i class='glyphicon glyphicon-refresh icon-spin'></i>");
                    panel.loadMembers(returnLimit2, skipTo + returnLimit, paginate);
                });
                $("#members-" + panel.divElement.id + "-sort").unbind();
                $("#members-" + panel.divElement.id + "-sort").click(function() {
                    $("#members-" + panel.divElement.id + "-sort").blur();
                    panel.loadMembers(returnLimit, 0, 1);
                });
            } else {
                if (skipTo != 0) {
                    $("#" + panel.divElement.id + "-moreMembers").remove();
                    $("#members-" + panel.divElement.id + "-resultsTable").find(".more-row").remove();
                    if (skipTo == 0) {
                        $('#members-' + panel.divElement.id + "-resultsTable").html(JST["views/conceptDetailsPlugin/tabs/members.hbs"](context));
                    } else {
                        $('#members-' + panel.divElement.id + "-resultsTable").append(JST["views/conceptDetailsPlugin/tabs/members.hbs"](context));
                    }
                    $("#" + panel.divElement.id + "-moreMembers").click(function() {
                        $("#" + panel.divElement.id + "-moreMembers").html("<i class='glyphicon glyphicon-refresh icon-spin'></i>");
                        panel.loadMembers(returnLimit2, skipTo + returnLimit, paginate);
                    });
                    $("#members-" + panel.divElement.id + "-sort").unbind();
                    $("#members-" + panel.divElement.id + "-sort").click(function() {
                        $("#members-" + panel.divElement.id + "-sort").blur();
                        panel.loadMembers(returnLimit, 0, 1);
                    });
                } else {
                    $('#members-' + panel.divElement.id + "-resultsTable").html("<tr><td class='text-muted' colspan='2'><span data-i18n-id='i18n_no_members' class='i18n'>This concept has no members</span></td></tr>");
                }
            }
            $('#members-' + panel.divElement.id).find(".member-row").unbind();
            $('#members-' + panel.divElement.id).find(".member-row").click(function(e) {
                var clickedConceptId = $(e.target).data("concept-id");
                //var clickedTerm = $(e.target).data("term");
                panel.conceptId = clickedConceptId;
                $('#details-tabs-' + panel.divElement.id + ' a:first').tab('show');
                panel.updateCanvas();
            });
        }).fail(function() {
            $('#members-' + panel.divElement.id + "-resultsTable").html("<tr><td class='text-muted' colspan='2'><span data-i18n-id='i18n_no_members' class='i18n'>This concept has no members</span></td></tr>");
        });
    };

    this.stripDiagrammingMarkup = function(htmlString) {
        if (!htmlString)
            htmlString = "";
        htmlString = htmlString.replace(new RegExp(panel.escapeRegExp("sct-primitive-concept-compact"), 'g'), "");
        htmlString = htmlString.replace(new RegExp(panel.escapeRegExp("sct-defined-concept-compact"), 'g'), "");
        htmlString = htmlString.replace(new RegExp(panel.escapeRegExp("sct-attribute-compact"), 'g'), "");
        return htmlString;
    };
    this.escapeRegExp = function(str) {
        return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
    };

    //    this.setSubscription = function(subscriptionPanel) {
    //        panel.subscription = subscriptionPanel;
    //        $("#" + panel.divElement.id + "-subscribersMarker").css('color', subscriptionPanel.markerColor);
    //        $("#" + panel.divElement.id + "-subscribersMarker").show();
    //    }

    //    this.clearSubscription = function() {
    //        panel.subscription = null;
    //        $("#" + panel.divElement.id + "-subscribersMarker").hide();
    //    }

    this.removeSemtag = function(term) {
        if (term) {
            if (term.lastIndexOf("(") > 0) {
                return term.substr(0, term.lastIndexOf("(") - 1)
            } else {
                return term;
            }
        }
    }

    this.loadMarkers = function() {
        var auxMarker = "",
            right = 0,
            top = 0,
            aux = false,
            visible = false;
        $.each(componentsRegistry, function(i, field) {
            var panelId = field.divElement.id;
            if ($("#" + panelId + "-subscribersMarker").is(':visible')) {
                visible = true;
            }
        });
        if (panel.subscribers.length == 0) {
            right = 14;
            $("#" + panel.divElement.id + "-ownMarker").hide();
        } else {
            if (!visible) {
                $("#" + panel.divElement.id + "-ownMarker").hide();
            }
            aux = true;
        }
        if ($("#" + panel.divElement.id + "-subscribersMarker").is(':visible')) {
            $("#" + panel.divElement.id + "-panelTitle").html($("#" + panel.divElement.id + "-panelTitle").html().replace(/&nbsp;/g, ''));
            if (aux) {
                $("#" + panel.divElement.id + "-panelTitle").html("&nbsp&nbsp&nbsp&nbsp" + $("#" + panel.divElement.id + "-panelTitle").html());
            }
            $.each(panel.subscriptionsColor, function(i, field) {
                auxMarker = auxMarker + "<i class='glyphicon glyphicon-bookmark' style='color: " + field + "; top:" + top + "px; right: " + right + "px;'></i>";
                $("#" + panel.divElement.id + "-panelTitle").html("&nbsp&nbsp" + $("#" + panel.divElement.id + "-panelTitle").html());
                top = top + 5;
                right = right + 10;
            });
            $("#" + panel.divElement.id + "-subscribersMarker").html(auxMarker);
        }
    }

    // Subsription methods
    this.subscribe = function(panelToSubscribe) {
        var panelId = panelToSubscribe.divElement.id;
        var alreadySubscribed = false;
        $.each(panel.subscriptionsColor, function(i, field) {
            if (field == panelToSubscribe.markerColor) {
                alreadySubscribed = true;
            }
        });
        //console.log('Subscribing to id: ' + panelId, !alreadySubscribed);
        if (!alreadySubscribed) {
            var subscription = channel.subscribe(panelId, function(data, envelope) {
                //                console.log("listening in " + panel.divElement.id);
                panel.conceptId = data.conceptId;
                if (data.showConcept) {
                    $('a[href="#fh-cd1_canvas-pane"]').click();
                }
                if ($("#home-children-" + panel.divElement.id + "-body").length > 0) {} else {
                    panel.setupCanvas();
                    if (panel.loadMarkers)
                        panel.loadMarkers();
                }
                panel.updateCanvas();
                //            This creates a cycle
                //            channel.publish(panel.divElement.id, {
                //                term: data.term,
                //                conceptId: data.conceptId,
                //                source: data.source
                //            });
            });
            panel.subscriptions.push(subscription);
            panelToSubscribe.subscribers.push(panel.divElement.id);
            panel.subscriptionsColor.push(panelToSubscribe.markerColor);
        }
        // $("#" + panelId + "-ownMarker").show();
        $("#" + panel.divElement.id + "-subscribersMarker").show();
        // $("#" + panelId + "-ownMarker").show();
    }

    this.unsubscribe = function(panelToUnsubscribe) {
        var aux = [],
            colors = [],
            unsubscribed = true;
        $.each(panel.subscriptionsColor, function(i, field) {
            if (field != panelToUnsubscribe.markerColor) {
                colors.push(field);
            } else {
                unsubscribed = false;
            }
        });
        if (!unsubscribed) {
            panel.subscriptionsColor = colors;
            //            console.log(panel.divElement.id);
            //            console.log(panel.subscriptionsColor);
            colors = [];
            $.each(panelToUnsubscribe.subscribers, function(i, field) {
                if (field != panel.divElement.id) {
                    aux.push(field);
                }
            });
            panelToUnsubscribe.subscribers = aux;
            $.each(panelToUnsubscribe.subscriptionsColor, function(i, field) {
                colors.push(field);
            });
            if (panelToUnsubscribe.subscribers.length == 0) {
                if (panelToUnsubscribe.subscriptions.length == 0) {
                    $("#" + panelToUnsubscribe.divElement.id + "-subscribersMarker").hide();
                }
            } else {
                //                colors.push(panelToUnsubscribe.markerColor);
            }
            panelToUnsubscribe.subscriptionsColor = colors;
            //            console.log(panelToUnsubscribe.divElement.id);
            //            console.log(panelToUnsubscribe.subscriptionsColor);
            aux = [];
            $.each(panel.subscriptions, function(i, field) {
                if (panelToUnsubscribe.divElement.id == field.topic) {
                    field.unsubscribe();
                } else {
                    aux.push(field);
                }
            });
            panel.subscriptions = aux;
            if (panel.subscriptions.length == 0 && panel.subscribers.length == 0) {
                $("#" + panel.divElement.id + "-subscribersMarker").hide();
            }
        }
    }

    this.setupOptionsPanel = function() {
        //var possibleSubscribers = [];
        //$.each(componentsRegistry, function(i, field){
        //    if (field.divElement.id != panel.divElement.id){
        //        var object = {};
        //        object.subscriptions = field.subscriptions;
        //        object.id = field.divElement.id;
        //        possibleSubscribers.push(object);
        //    }
        //});
        //var aux = false;
        //$.each(possibleSubscribers, function(i, field){
        //    aux = false;
        //    $.each(panel.subscriptions, function(j, subscription){
        //        if (field.id == subscription.topic){
        //            aux = true;
        //        }
        //    });
        //    field.subscribed = aux;
        //    aux = false;
        //    $.each(field.subscriptions, function(i, subscription){
        //        if (subscription.topic == panel.divElement.id){
        //            aux = true;
        //        }
        //    });
        //    field.subscriptor = aux;
        //});
        //panel.options.possibleSubscribers = possibleSubscribers;
        /*if (!panel.options.manifest) {
            $("#" + panel.divElement.id + "-modal-body").html("<i class='glyphicon glyphicon-refresh icon-spin'></i>");
            xhr = $.getJSON(options.serverUrl.replace("snomed", "") + "server/releases", function(result) {
                // nothing
            }).done(function(result) {
                $.each(result, function(i, field) {
                    manifests.push(field);
                    if (field.databaseName == options.edition) {
                        panel.options.manifest = field;
                    }
                });
                var context = {
                    options: panel.options,
                    divElementId: panel.divElement.id
                };
                Handlebars.registerHelper('if_eq', function(a, b, opts) {
                    if (opts != "undefined") {
                        if (a == b)
                            return opts.fn(this);
                        else
                            return opts.inverse(this);
                    }
                });
                Handlebars.registerHelper('ifIn', function(elem, list, options) {
                    if (list.indexOf(elem) > -1) {
                        return options.fn(this);
                    }
                    return options.inverse(this);
                });
                $("#" + panel.divElement.id + "-modal-body").html(JST["views/conceptDetailsPlugin/options.hbs"](context));
            });
        } else {*/
            var context = {
                options: panel.options,
                divElementId: panel.divElement.id
            };
            Handlebars.registerHelper('if_eq', function(a, b, opts) {
                if (opts != "undefined") {
                    if (a == b)
                        return opts.fn(this);
                    else
                        return opts.inverse(this);
                }
            });
            Handlebars.registerHelper('ifIn', function(elem, list, options) {
                if (list.indexOf(elem) > -1) {
                    return options.fn(this);
                }
                return options.inverse(this);
            });
            $("#" + panel.divElement.id + "-modal-body").html(JST["views/conceptDetailsPlugin/options.hbs"](context));
        //}
    }

    this.readOptionsPanel = function() {
        panel.options.displaySynonyms = $("#" + panel.divElement.id + "-displaySynonymsOption").is(':checked');
        panel.options.showIds = $("#" + panel.divElement.id + "-displayIdsOption").is(':checked');
        panel.options.displayChildren = $("#" + panel.divElement.id + "-childrenOption").is(':checked');
        panel.options.hideNotAcceptable = $("#" + panel.divElement.id + "-hideNotAcceptableOption").is(':checked');
        panel.options.displayInactiveDescriptions = $("#" + panel.divElement.id + "-displayInactiveDescriptionsOption").is(':checked');
        panel.options.diagrammingMarkupEnabled = $("#" + panel.divElement.id + "-diagrammingMarkupEnabledOption").is(':checked');
        panel.options.selectedView = $("#" + panel.divElement.id + "-relsViewOption").val();

        //panel.options.langRefset = [];
//        $.each($("#" + panel.divElement.id).find(".langOption"), function(i, field) {
//            if ($(field).is(':checked')) {
//                panel.options.langRefset.push($(field).val());
//            }
//        });
        //console.log(panel.options.langRefset);
        //panel.options.langRefset = $("#" + panel.divElement.id + "-langRefsetOption").val();

        panel.options.displayChildren = $("#" + panel.divElement.id + "-displayChildren").is(':checked');
        //$.each(panel.options.possibleSubscribers, function (i, field){
        //    field.subscribed = $("#" + panel.divElement.id + "-subscribeTo-" + field.id).is(':checked');
        //    field.subscriptor = $("#" + panel.divElement.id + "-subscriptor-" + field.id).is(':checked');
        //    var panelToSubscribe = {};
        //    $.each(componentsRegistry, function(i, panelS){
        //        if (panelS.divElement.id == field.id){
        //            panelToSubscribe = panelS;
        //        }
        //    });
        //    if (field.subscribed){
        //        panel.subscribe(panelToSubscribe);
        //    }else{
        //        panel.unsubscribe(panelToSubscribe);
        //    }
        //    if (field.subscriptor){
        //        panelToSubscribe.subscribe(panel);
        //    }else{
        //        panelToSubscribe.unsubscribe(panel);
        //    }
        //});
        $.each(componentsRegistry, function(i, field) {
            if (field.loadMarkers)
                field.loadMarkers();
        });
        panel.updateCanvas();
    }
}

function updateCD(divElementId, conceptId) {
    $.each(componentsRegistry, function(i, field) {
        //console.log(field.divElement.id + ' == ' + divElementId.id);
        if (field.divElement.id == divElementId) {
            field.conceptId = conceptId;
            field.updateCanvas();
            channel.publish(field.divElement.id, {
                term: field.term,
                conceptId: field.conceptId,
                module: field.module,
                source: field.divElement.id
            });
        }
    });
    $('.history-button').popover('hide');
}

//function cancelSubscription(divElementId1, divElementId2) {
//    var d1;
//    var d2;
//    $.each(componentsRegistry, function(i, field) {
//        if (field.divElement.id == divElementId1) {
//            d1 = field;
//        } else if (field.divElement.id == divElementId2) {
//            d2 = field;
//        }
//    });
//    d1.unsubscribe(d2);
//    $(d2.divElement).find('.linker-button').popover('toggle');
//}

function getRandomColor() {
    var letters = '0123456789ABCDEF'.split('');
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.round(Math.random() * 15)];
    }
    return color;
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
});
