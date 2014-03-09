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
    this.options = options;
    this.attributesPId = "";
    this.descsPId = "";
    this.relsPId = "";
    this.history = [];
    this.subscription = null;
    var xhr = null;
    var xhrChildren = null;

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
        // main panel
        detailsHtml = "<div style='margin: 5px; height:98%; overflow:auto;' class='panel panel-default'>";
        detailsHtml = detailsHtml + "<div class='panel-heading' id='" + panel.divElement.id + "-panelHeading'>";
        detailsHtml = detailsHtml + "<button id='" + panel.divElement.id + "-subscribersMarker' class='btn btn-link btn-lg' style='padding:2px;position: absolute;top: 1px;right: 20px;'><i class='glyphicon glyphicon-bookmark'></i></button>"
        detailsHtml = detailsHtml + "<div class='row'>";
        detailsHtml = detailsHtml + "<div class='col-md-8' id='" + panel.divElement.id + "-panelTitle'><strong>Concept Details</strong></div>";
        detailsHtml = detailsHtml + "<div class='col-md-4 text-right'>";
        detailsHtml = detailsHtml + "<span id='" + panel.divElement.id + "-linkerButton' class='jqui-draggable linker-button' data-panel='" + panel.divElement.id + "' style='padding:2px'><i class='glyphicon glyphicon-link'></i></span>"
        detailsHtml = detailsHtml + "<button id='" + panel.divElement.id + "-historyButton' class='btn btn-link history-button' style='padding:2px'><i class='glyphicon glyphicon-time'></i></button>"
        detailsHtml = detailsHtml + "<button id='" + panel.divElement.id + "-configButton' class='btn btn-link' data-toggle='modal' style='padding:2px' data-target='#" + panel.divElement.id + "-configModal'><i class='glyphicon glyphicon-cog'></i></button>"
        detailsHtml = detailsHtml + "<button id='" + panel.divElement.id + "-collapseButton' class='btn btn-link' style='padding:2px'><i class='glyphicon glyphicon-resize-small'></i></button>"
        detailsHtml = detailsHtml + "<button id='" + panel.divElement.id + "-expandButton' class='btn btn-link' style='padding:2px'><i class='glyphicon glyphicon-resize-full'></i></button>"
        detailsHtml = detailsHtml + "<button id='" + panel.divElement.id + "-closeButton' class='btn btn-link' style='padding:2px'><i class='glyphicon glyphicon-remove'></i></button>"
        detailsHtml = detailsHtml + "</div>";
        detailsHtml = detailsHtml + "</div>";
        detailsHtml = detailsHtml + "</div>";
        detailsHtml = detailsHtml + "<div class='panel-body' id='" + panel.divElement.id + "-panelBody'>";
        detailsHtml = detailsHtml + "<div id='" + panel.attributesPId + "' class='panel panel-default'>";
        detailsHtml = detailsHtml + "</div>";
        detailsHtml = detailsHtml + "<div id='" + panel.descsPId + "' class='panel panel-default'>";
        detailsHtml = detailsHtml + "</div>";
        detailsHtml = detailsHtml + "<div id='" + panel.relsPId + "' class='panel panel-default'>";
        detailsHtml = detailsHtml + "</div>";
        detailsHtml = detailsHtml + "<div id='" + panel.childrenPId + "' class='panel panel-default' style='height:100px;overflow:auto;margin-bottom: 15px;'>";
        detailsHtml = detailsHtml + "</div>";
        detailsHtml = detailsHtml + "</div>";
        detailsHtml = detailsHtml + "</div>";
        // modal config panel
        detailsHtml = detailsHtml + "<div class='modal fade' id='" + panel.divElement.id + "-configModal'>";
        detailsHtml = detailsHtml + "<div class='modal-dialog'>";
        detailsHtml = detailsHtml + "<div class='modal-content'>";
        detailsHtml = detailsHtml + "<div class='modal-header'>";
        detailsHtml = detailsHtml + "<button type='button' class='close' data-dismiss='modal' aria-hidden='true'>&times;</button>";
        detailsHtml = detailsHtml + "<h4 class='modal-title'>Options (" + panel.divElement.id + ")</h4>";
        detailsHtml = detailsHtml + "</div>";
        detailsHtml = detailsHtml + "<div class='modal-body' id='" + panel.divElement.id + "-modal-body'>";
        detailsHtml = detailsHtml + "<p></p>";
        detailsHtml = detailsHtml + "</div>";
        detailsHtml = detailsHtml + "<div class='modal-footer'>";
        detailsHtml = detailsHtml + "<button type='button' class='btn btn-default' data-dismiss='modal'>Close</button>";
        detailsHtml = detailsHtml + "<button id='" + panel.divElement.id + "-apply-button' type='button' class='btn btn-primary' data-dismiss='modal'>Apply changes</button>";
        detailsHtml = detailsHtml + "</div>";
        detailsHtml = detailsHtml + "</div><!-- /.modal-content -->";
        detailsHtml = detailsHtml + "</div><!-- /.modal-dialog -->";
        detailsHtml = detailsHtml + "</div><!-- /.modal -->";
        $(divElement).html(detailsHtml);

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

        $("#" + panel.divElement.id + "-expandButton").click(function(event) {
            $("#" + panel.divElement.id + "-panelBody").slideDown("fast");
            $("#" + panel.divElement.id + "-expandButton").hide();
            $("#" + panel.divElement.id + "-collapseButton").show();
            $("#" + panel.divElement.id + "-panelTitle").html("<strong>Concept Details</strong>");
        });

        $("#" + panel.divElement.id + "-collapseButton").click(function(event) {
            $("#" + panel.divElement.id + "-panelBody").slideUp("fast");
            $("#" + panel.divElement.id + "-expandButton").show();
            $("#" + panel.divElement.id + "-collapseButton").hide();
            //if (panel.defaultTerm.length > 25) {
            //    $("#" + panel.divElement.id + "-panelTitle").html("<strong>Concept Details: " + panel.defaultTerm.substring(0, 24).trim() + "...</strong>");
            //} else {
            $("#" + panel.divElement.id + "-panelTitle").html("<strong>Concept Details: " + panel.defaultTerm + "</strong>");
            //}
        });

        $("#" + panel.divElement.id + "-historyButton").click(function(event) {
            $("#" + panel.divElement.id + "-historyButton").popover({
                trigger: 'manual',
                placement: 'bottomRight',
                html: true,
                content: function() {
                    historyHtml = '<div style="height:100px;overflow:auto;">';
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


        $("#" + panel.divElement.id + "-apply-button").click(function() {
            //console.log("apply!");
            panel.readOptionsPanel();
            panel.updateCanvas();
        });

        $("#" + panel.divElement.id + "-linkerButton").draggable({
            appendTo: 'body',
            helper: 'clone',
            delay: 500
        });

        $(".resizable").resizable();

        $('#' + panel.divElement.id + '-panelHeading').droppable({
            drop: panel.handleDropEvent,
            hoverClass: "bg-info"
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
            //console.log("ignore");
        } else {
            panel.conceptId = draggable.attr('data-concept-id');
            panel.updateCanvas();
        }

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
    }

    this.updateCanvas = function() {
        //console.log("UPDATE:" + panel.conceptId);
        ////console.log(JSON.stringify(panel.options));
//        $('#' + panel.attributesPId).html($('#' + panel.attributesPId).html() + "<i class='glyphicon glyphicon-refresh icon-spin'></i>");
//        $('#' + panel.descsPId).html($('#' + panel.descsPId).html() + "<i class='glyphicon glyphicon-refresh icon-spin'></i>");
//        $('#' + panel.relsPId).html($('#' + panel.relsPId).html() + "<i class='glyphicon glyphicon-refresh icon-spin'></i>");
//        $('#' + panel.childrenPId).html($('#' + panel.childrenPId).html() + "<i class='glyphicon glyphicon-refresh icon-spin'></i>");
        $('#' + panel.attributesPId).html("<i class='glyphicon glyphicon-refresh icon-spin'></i>");
        $('#' + panel.descsPId).html("<i class='glyphicon glyphicon-refresh icon-spin'></i>");
        $('#' + panel.relsPId).html("<i class='glyphicon glyphicon-refresh icon-spin'></i>");
        $('#' + panel.childrenPId).html("<i class='glyphicon glyphicon-refresh icon-spin'></i>");

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
            attrHtml = "<table class='table table-default' ><tr><td class='jqui-droppable' data-concept-id='" + firstMatch.conceptId + "'><h3 class='jqui-draggable' data-concept-id='" + firstMatch.conceptId + "' data-term='" + firstMatch.defaultTerm + "'>" + firstMatch.defaultTerm + "</h4><br>SCTID: " + firstMatch.conceptId;
            if (firstMatch.definitionStatus == "Primitive") {
                attrHtml = attrHtml + ", Primitive";
            } else {
                attrHtml = attrHtml + ", Fully defined";
            }
            if (firstMatch.active == true) {
                attrHtml = attrHtml + ", ACTIVE";
            } else {
                attrHtml = attrHtml + ", INACTIVE";
            }
            attrHtml = attrHtml + "</td></tr></table>";

            $('#' + panel.attributesPId).html(attrHtml);

            if ($("#" + panel.divElement.id + "-expandButton").is(":visible")) {
                $("#" + panel.divElement.id + "-panelTitle").html("<strong>Concept Details: " + panel.defaultTerm + "</strong>");
            }

            $('#' + panel.attributesPId).find('.jqui-droppable').droppable({
                drop: panel.handleDropEvent,
                hoverClass: "bg-info"
            });

            $('#' + panel.attributesPId).find(".jqui-draggable").draggable({
                appendTo: 'body',
                helper: 'clone',
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
            }
            descDetailsHtml = "<table class='table table-bordered' id = '" + panel.descsPId + "-table'>";
            descDetailsHtml = descDetailsHtml + "<thead><tr>";
            descDetailsHtml = descDetailsHtml + "<th>Term</th>";
            if (panel.options.showIds == true) {
                descDetailsHtml = descDetailsHtml + "<th>SCTID</th>";
            }
            descDetailsHtml = descDetailsHtml + "<th>Acceptability " + languageName + "</th>";
            //descDetailsHtml = descDetailsHtml + "<th>Acceptability</th>";
            descDetailsHtml = descDetailsHtml + "</tr></thead><tbody>";

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
            })

            $.each(allDescriptions, function(i, field) {
                if (field.active == true) {
                    var row = "";
                    if (field.type.conceptId == "900000000000003001") {
                        $.each(field.langMemberships, function(i, lm) {
                            if (lm.refset.conceptId == panel.options.langRefset && lm.acceptability.conceptId == "900000000000548007") {
                                row = "<tr class='fsn-row'>";
                            }
                        });
                    } 
                    if (row == "") {
                        row = "<tr class='synonym-row'>";
                    }

                    row = row + "<td><div class='jqui-draggable' data-concept-id='" + field.conceptId + "' data-term='" + field.term + "'>" + field.term + "</div></td>";
                    if (panel.options.showIds == true) {
                        row = row + "<td>" + field.descriptionId + "</td>";
                    }

                    var includedInLanguage = false;
                    $.each(field.langMemberships, function(i, lang) {
                        if (lang.refset.conceptId == panel.options.langRefset) {
                            row = row + "<td><div class='jqui-draggable' data-concept-id='" + lang.acceptability.conceptId + "' data-term='" + lang.acceptability.defaultTerm + "'>" + lang.acceptability.defaultTerm.substring(0, lang.acceptability.defaultTerm.indexOf("(")) + "</div></td>";
                            includedInLanguage = true;
                        }
                    });
                    if (includedInLanguage == false) {
                        row = row + "<td>Not acceptable</td>";
                    }

                    row = row + "</tr>";
                    descDetailsHtml = descDetailsHtml + row;
                }
            });
            descDetailsHtml = descDetailsHtml + "</tbody></table>";
            $('#' + panel.descsPId).html(descDetailsHtml);
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
            $('#' + panel.descsPId).find(".jqui-draggable").draggable({
                appendTo: 'body',
                helper: 'clone',
                delay: 500
            });
            // load relationships panel
            panel.relsPId = divElement.id + "-rels-panel";
            relsDetailsHtml = "<table class='table table-bordered'>";
            relsDetailsHtml = relsDetailsHtml + "<thead><tr>";
            relsDetailsHtml = relsDetailsHtml + "<th>Type</th>";
            relsDetailsHtml = relsDetailsHtml + "<th>Destination</th>";
            relsDetailsHtml = relsDetailsHtml + "<th>Group</th>";
            relsDetailsHtml = relsDetailsHtml + "<th>CharType</th>";
            relsDetailsHtml = relsDetailsHtml + "</tr></thead><tbody>";

            if (typeof firstMatch.relationships != "undefined") {
                $.each(firstMatch.relationships, function(i, field) {
                    //console.log(JSON.stringify(field));
                    if (field.active == true) {
                        var row = "";
                        row = "<tr class='inferred-rel'>";

                        row = row + "<td><div class='jqui-draggable' data-concept-id='" + field.type.conceptId + "' data-term='" + field.type.defaultTerm + "'>" + field.type.defaultTerm + "</div></td>";
                        row = row + "<td><div class='jqui-draggable' data-concept-id='" + field.target.conceptId + "' data-term='" + field.target.defaultTerm + "'>" + field.target.defaultTerm + "</div></td>";
                        row = row + "<td>" + field.groupId + "</td>";
                        if (field.charType.conceptId == "900000000000010007") {
                            row = row + "<td><div class='jqui-draggable' data-concept-id='" + field.charType.conceptId + "' data-term='" + field.charType.defaultTerm + "'>Stated</div></td>";
                        } else if (field.charType.conceptId == "900000000000011006") {
                            row = row + "<td><div class='jqui-draggable' data-concept-id='" + field.charType.conceptId + "' data-term='" + field.charType.defaultTerm + "'>Inferred</div></td>";
                        } else {
                            row = row + "<td>Other</td>";
                        }
                        row = row + "</tr>";
                        relsDetailsHtml = relsDetailsHtml + row;
                    }
                });
            }

            if (typeof firstMatch.statedRelationships != "undefined") {
                $.each(firstMatch.statedRelationships, function(i, field) {
                    //console.log(JSON.stringify(field));
                    if (field.active == true) {
                        var row = "";
//                    if (field.charType.conceptId == "900000000000010007") {
                        row = "<tr class='stated-rel'>";
//                    } else {
//                        row = "<tr class='inferred-rel'>";
//                    }

                        row = row + "<td><div class='jqui-draggable' data-concept-id='" + field.type.conceptId + "' data-term='" + field.type.defaultTerm + "'>" + field.type.defaultTerm + "</div></td>";
                        row = row + "<td><div class='jqui-draggable' data-concept-id='" + field.target.conceptId + "' data-term='" + field.target.defaultTerm + "'>" + field.target.defaultTerm + "</div></td>";
                        row = row + "<td>" + field.groupId + "</td>";
                        if (field.charType.conceptId == "900000000000010007") {
                            row = row + "<td><div class='jqui-draggable' data-concept-id='" + field.charType.conceptId + "' data-term='" + field.charType.defaultTerm + "'>Stated</div></td>";
                        } else if (field.charType.conceptId == "900000000000011006") {
                            row = row + "<td><div class='jqui-draggable' data-concept-id='" + field.charType.conceptId + "' data-term='" + field.charType.defaultTerm + "'>Inferred</div></td>";
                        } else {
                            row = row + "<td>Other</td>";
                        }
                        row = row + "</tr>";
                        relsDetailsHtml = relsDetailsHtml + row;
                    }
                });
            }
            relsDetailsHtml = relsDetailsHtml + "</tbody></table>";
            $('#' + panel.relsPId).html(relsDetailsHtml);
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
            $('#' + panel.relsPId).find(".jqui-draggable").draggable({
                appendTo: 'body',
                helper: 'clone',
                delay: 500
            });
        }).fail(function() {
            $('#' + panel.attributesPId).html("<div class='alert alert-danger'><strong>Error</strong> while retrieving data from server...</div>");
            $('#' + panel.descsPId).html("");
            $('#' + panel.relsPId).html("");
            $('#' + panel.relsPId).html(relsDetailsHtml);
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
                childrenDetailsHtml = "<div>";
                childrenDetailsHtml = "<table class='table table-bordered'>";
                childrenDetailsHtml = childrenDetailsHtml + "<thead><tr>";
                childrenDetailsHtml = childrenDetailsHtml + "<th>Children</th>";
                childrenDetailsHtml = childrenDetailsHtml + "</tr></thead><tbody></div>";
                $.each(result, function(i, field) {
                    if (field.active == true) {
                        childrenDetailsHtml = childrenDetailsHtml + "<tr><td class='jqui-draggable' data-concept-id='" + field.conceptId + "' data-term='" + field.defaultTerm + "'>" + field.defaultTerm + "</td></tr>";
                    }
                });

                childrenDetailsHtml = childrenDetailsHtml + "</tbody></table>";
                //console.log(JSON.stringify(childrenDetailsHtml));
                $('#' + panel.childrenPId).html(childrenDetailsHtml);
                $('#' + panel.childrenPId).find(".jqui-draggable").draggable({
                    appendTo: 'body',
                    helper: 'clone',
                    delay: 500
                });
            }).fail(function() {
                $('#' + panel.childrenPId).html("<div class='alert alert-danger'><strong>Error</strong> while retrieving data from server...</div>");
            });

        }
        // debug
//        $.each(componentsRegistry, function(i, field) {
//            console.log(field.divElement.id + " - " + field.type);
//            if (field.type == "search") {
//                field.subscribe(panel);
//                panel.setSubscription(field);
//            }
//        });
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
        optionsHtml = optionsHtml + '<label for="displaySynonyms">Display synonyms</label>';
        optionsHtml = optionsHtml + '<div class="radio">';
        optionsHtml = optionsHtml + '<label>';
        if (panel.options.displaySynonyms == true) {
            optionsHtml = optionsHtml + '<input type="radio" name="displaySynonyms" id="' + panel.divElement.id + '-displaySynonymsYes" value=true checked>';
        } else {
            optionsHtml = optionsHtml + '<input type="radio" name="displaySynonyms" id="' + panel.divElement.id + '-displaySynonymsYes" value=true>';
        }
        optionsHtml = optionsHtml + 'Display Synonyms along with FSN and preferred terms.';
        optionsHtml = optionsHtml + '</label>';
        optionsHtml = optionsHtml + '</div>';
        optionsHtml = optionsHtml + '<div class="radio">';
        optionsHtml = optionsHtml + '<label>';
        if (panel.options.displaySynonyms == true) {
            optionsHtml = optionsHtml + '<input type="radio" name="displaySynonyms" id="' + panel.divElement.id + '-displaySynonymsNo" value=false>';
        } else {
            optionsHtml = optionsHtml + '<input type="radio" name="displaySynonyms" id="' + panel.divElement.id + '-displaySynonymsNo" value=false checked>';
        }
        optionsHtml = optionsHtml + 'Only display FSN and preferred terms.';
        optionsHtml = optionsHtml + '</label>';
        optionsHtml = optionsHtml + '</div>';
        optionsHtml = optionsHtml + '</div>';
        optionsHtml = optionsHtml + '<div class="form-group">';
        optionsHtml = optionsHtml + '<label for="displayIds">Display Ids</label>';
        optionsHtml = optionsHtml + '<div class="radio">';
        optionsHtml = optionsHtml + '<label>';
        if (panel.options.showIds == true) {
            optionsHtml = optionsHtml + '<input type="radio" name="displayIds" id="' + panel.divElement.id + '-displayIdsYes" value=true checked>';
        } else {
            optionsHtml = optionsHtml + '<input type="radio" name="displayIds" id="' + panel.divElement.id + '-displayIdsYes" value=true>';
        }
        optionsHtml = optionsHtml + 'Display Ids for all components.';
        optionsHtml = optionsHtml + '</label>';
        optionsHtml = optionsHtml + '</div>';
        optionsHtml = optionsHtml + '<div class="radio">';
        optionsHtml = optionsHtml + '<label>';
        if (panel.options.showIds == true) {
            optionsHtml = optionsHtml + '<input type="radio" name="displayIds" id="' + panel.divElement.id + '-displayIdsNo" value=false>';
        } else {
            optionsHtml = optionsHtml + '<input type="radio" name="displayIds" id="' + panel.divElement.id + '-displayIdsNo" value=false checked>';
        }
        optionsHtml = optionsHtml + 'Hide Ids for all components.';
        optionsHtml = optionsHtml + '</label>';
        optionsHtml = optionsHtml + '</div>';
        optionsHtml = optionsHtml + '</div>';
        optionsHtml = optionsHtml + '<div class="form-group">';
        optionsHtml = optionsHtml + '<label for="selectedRelsView">Relationships View</label>';
        optionsHtml = optionsHtml + '<select class="form-control" id="' + panel.divElement.id + '-relsViewOption">';
        if (panel.options.selectedView == "stated") {
            optionsHtml = optionsHtml + '<option value="stated" selected>Stated</option>';
        } else {
            optionsHtml = optionsHtml + '<option value="stated">Stated</option>';
        }
        if (panel.options.selectedView == "inferred") {
            optionsHtml = optionsHtml + '<option value="inferred" selected>Inferred</option>';
        } else {
            optionsHtml = optionsHtml + '<option value="inferred">Inferred</option>';
        }
        if (panel.options.selectedView == "all") {
            optionsHtml = optionsHtml + '<option value="all" selected>All</option>';
        } else {
            optionsHtml = optionsHtml + '<option value="all">All</option>';
        }
        optionsHtml = optionsHtml + '</select>';
        optionsHtml = optionsHtml + '</div>';
        optionsHtml = optionsHtml + '<div class="form-group">';
        optionsHtml = optionsHtml + '<div class="checkbox">';
        optionsHtml = optionsHtml + '<label>';
        if (panel.options.displayChildren == false) {
            optionsHtml = optionsHtml + '<input type="checkbox" id="' + panel.divElement.id + '-childrenOption"> Display children';
        } else {
            optionsHtml = optionsHtml + '<input type="checkbox" id="' + panel.divElement.id + '-childrenOption" checked> Display children';
        }
        optionsHtml = optionsHtml + '</label>';
        optionsHtml = optionsHtml + '</div>';
        optionsHtml = optionsHtml + '</div>';
        optionsHtml = optionsHtml + '<div class="form-group">';
        optionsHtml = optionsHtml + '<label for="' + panel.divElement.id + '-langRefsetOption">Language Refset</label>';
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
        optionsHtml = optionsHtml + '</select>';
        optionsHtml = optionsHtml + '</div>';
        optionsHtml = optionsHtml + '</form>';
        $("#" + panel.divElement.id + "-modal-body").html(optionsHtml);
    }

    this.readOptionsPanel = function() {
        //console.log($('input[name=displaySynonyms]:checked', "#" + panel.divElement.id + "-options-form").val());
        panel.options.displaySynonyms = ($('input[name=displaySynonyms]:checked', "#" + panel.divElement.id + "-options-form").val() == "true");
        //console.log($('input[name=displayIds]:checked', "#" + panel.divElement.id + "-options-form").val());
        panel.options.showIds = ($('input[name=displayIds]:checked', "#" + panel.divElement.id + "-options-form").val() == "true");
        //console.log($("#" + panel.divElement.id + "-relsViewOption").val());
        panel.options.selectedView = $("#" + panel.divElement.id + "-relsViewOption").val();
        panel.options.displayChildren = $("#" + panel.divElement.id + "-childrenOption").is(':checked');
        panel.options.langRefset = $("#" + panel.divElement.id + "-langRefsetOption").val();
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



