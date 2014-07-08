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
        }
        $.get("views/conceptDetailsPlugin/conceptDetailsPlugin-main.hbs").then(function (src) {
            var template = Handlebars.compile(src);
            $(divElement).html(template(context));
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

            $("#" + panel.divElement.id + "-linkerButton").draggable({
                cancel: false,
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
        });
        // main panel
//        var detailsHtml = "<div style='margin: 5px; height:98%; overflow:auto;' class='panel panel-default'>";
//        detailsHtml = detailsHtml + "<div class='panel-heading' id='" + panel.divElement.id + "-panelHeading'>";
//        detailsHtml = detailsHtml + "<button id='" + panel.divElement.id + "-subscribersMarker' class='btn btn-link btn-lg' style='padding:2px;position: absolute;top: 1px;left: 0px;'><i class='glyphicon glyphicon-bookmark'></i></button>"
//        detailsHtml = detailsHtml + "<div class='row'>";
//        detailsHtml = detailsHtml + "<div class='col-md-8' id='" + panel.divElement.id + "-panelTitle'>&nbsp&nbsp&nbsp<strong><span class='i18n' data-i18n-id='i18n_concept_details'>Concept Details</span></strong></div>";
//        detailsHtml = detailsHtml + "<div class='col-md-4 text-right'>";
//        detailsHtml = detailsHtml + "<button id='" + panel.divElement.id + "-linkerButton' class='btn btn-link jqui-draggable linker-button' data-panel='" + panel.divElement.id + "' style='padding:2px'><i class='glyphicon glyphicon-link'></i></button>"
//        detailsHtml = detailsHtml + "<button id='" + panel.divElement.id + "-historyButton' class='btn btn-link history-button' style='padding:2px'><i class='glyphicon glyphicon-time'></i></button>"
//        detailsHtml = detailsHtml + "<button id='" + panel.divElement.id + "-configButton' class='btn btn-link' data-toggle='modal' style='padding:2px' data-target='#" + panel.divElement.id + "-configModal'><i class='glyphicon glyphicon-cog'></i></button>"
//        detailsHtml = detailsHtml + "<button id='" + panel.divElement.id + "-collapseButton' class='btn btn-link' style='padding:2px'><i class='glyphicon glyphicon-resize-small'></i></button>"
//        detailsHtml = detailsHtml + "<button id='" + panel.divElement.id + "-expandButton' class='btn btn-link' style='padding:2px'><i class='glyphicon glyphicon-resize-full'></i></button>"
//        detailsHtml = detailsHtml + "<button id='" + panel.divElement.id + "-closeButton' class='btn btn-link' style='padding:2px'><i class='glyphicon glyphicon-remove'></i></button>"
//        detailsHtml = detailsHtml + "</div>";
//        detailsHtml = detailsHtml + "</div>";
//        detailsHtml = detailsHtml + "</div>";
//        detailsHtml = detailsHtml + "<div class='panel-body' id='" + panel.divElement.id + "-panelBody'>";
//        detailsHtml = detailsHtml + "<!-- Nav tabs -->";
//        detailsHtml = detailsHtml + '<ul class="nav nav-tabs" id="details-tabs-' + panel.divElement.id + '">';
//        detailsHtml = detailsHtml + '    <li class="active"><a href="#home-' + panel.divElement.id + '" data-toggle="tab" style="padding-top: 3px; padding-bottom:3px;"><span class="i18n" data-i18n-id="i18n_summary">Summary</span></a></li>';
//        detailsHtml = detailsHtml + '    <li><a href="#details-' + panel.divElement.id + '" data-toggle="tab" style="padding-top: 3px; padding-bottom:3px;"><span class="i18n" data-i18n-id="i18n_details">Details</span></a></li>';
//        detailsHtml = detailsHtml + '    <li id="diagram-tab"><a href="#diagram-' + panel.divElement.id + '" data-toggle="tab" style="padding-top: 3px; padding-bottom:3px;" id="diagram-tab-link-' + panel.divElement.id + '"><span class="i18n" data-i18n-id="i18n_diagram">Diagram</span></a></li>';
//        detailsHtml = detailsHtml + '    <li><a href="#refsets-' + panel.divElement.id + '" data-toggle="tab" style="padding-top: 3px; padding-bottom:3px;"><span class="i18n" data-i18n-id="i18n_refsets">Refsets</span></a></li>';
//        detailsHtml = detailsHtml + '</ul>';
//        detailsHtml = detailsHtml + "<!-- Tab panes -->";
//        detailsHtml = detailsHtml + '<div class="tab-content" id="details-tab-content-' + panel.divElement.id + '">';
//        detailsHtml = detailsHtml + '    <div class="tab-pane fade in active" id="home-' + panel.divElement.id + '" style="padding: 5px;">';
//        detailsHtml = detailsHtml + '       <div class="row" style="margin-right: 20px"><span class="pull-right text-muted" id="home-' + panel.divElement.id + '-viewLabel"></span></div>';
//        detailsHtml = detailsHtml + '       <div style="margin-left: 0%; margin-bottom: 10px; margin-top: 10px; width: 80%;border: 2px solid forestgreen; border-radius: 4px; padding: 5px;" id="home-parents-' + panel.divElement.id + '">No parents</div>';
//        detailsHtml = detailsHtml + '       <div style="margin-left: 10%; margin-bottom: 10px; margin-top: 10px; width: 80%;border: 2px solid saddlebrown; border-radius: 4px; padding: 5px;" id="home-attributes-' + panel.divElement.id + '">Attributes</div>';
//        detailsHtml = detailsHtml + '       <div style="margin-left: 20%; margin-bottom: 10px; margin-top: 10px; width: 80%;border: 2px solid darkslateblue; border-radius: 4px; padding: 5px;" id="home-roles-' + panel.divElement.id + '">Relationships</div>';
//        detailsHtml = detailsHtml + '       <div><span class="text-muted pull-right" id="footer-' + panel.divElement.id + '"></span></div>';
//        detailsHtml = detailsHtml + '    </div>';
//        detailsHtml = detailsHtml + '    <div class="tab-pane fade" id="details-' + panel.divElement.id + '">';
//        detailsHtml = detailsHtml + "       <div id='" + panel.attributesPId + "' class='panel panel-default'>";
//        detailsHtml = detailsHtml + "       </div>";
//        detailsHtml = detailsHtml + "       <div id='" + panel.descsPId + "' class='panel panel-default'>";
//        detailsHtml = detailsHtml + "       </div>";
//        detailsHtml = detailsHtml + "       <div id='" + panel.relsPId + "' class='panel panel-default'>";
//        detailsHtml = detailsHtml + "       </div>";
//        detailsHtml = detailsHtml + "       <div id='" + panel.childrenPId + "' class='panel panel-default' style='height:100px;overflow:auto;margin-bottom: 15px;'>";
//        detailsHtml = detailsHtml + "       </div>";
//        detailsHtml = detailsHtml + '    </div>';
//        detailsHtml = detailsHtml + '    <div class="tab-pane fade" id="diagram-' + panel.divElement.id + '">';
//        detailsHtml = detailsHtml + '       <div class="row" style="margin-right: 20px"><span class="pull-right text-muted" id="home-' + panel.divElement.id + '-diagram-viewLabel"></span></div>';
//        detailsHtml = detailsHtml + '       <div id="diagram-canvas-' + panel.divElement.id + '" style="position: relative; width: 1000px;"></div>';
//        //detailsHtml = detailsHtml + '       <div><span class="text-muted pull-right"><a href="http://www.ihtsdo.org/fileadmin/user_upload/Docs_01/Publications/SNOMED_CT_Diagramming_Guideline.pdf" target="_blank">Read about the IHTSDO Diagramming Guideline</a></span></div>';
//        detailsHtml = detailsHtml + '    </div>';
//        detailsHtml = detailsHtml + '    <div class="tab-pane fade" id="refsets-' + panel.divElement.id + '">';
//        detailsHtml = detailsHtml + '    </div>';
//        detailsHtml = detailsHtml + '</div>';
//        detailsHtml = detailsHtml + "</div>";
//        detailsHtml = detailsHtml + "</div>";
//        // modal config panel
//        detailsHtml = detailsHtml + "<div class='modal fade' id='" + panel.divElement.id + "-configModal'>";
//        detailsHtml = detailsHtml + "<div class='modal-dialog'>";
//        detailsHtml = detailsHtml + "<div class='modal-content'>";
//        detailsHtml = detailsHtml + "<div class='modal-header'>";
//        detailsHtml = detailsHtml + "<button type='button' class='close' data-dismiss='modal' aria-hidden='true'>&times;</button>";
//        detailsHtml = detailsHtml + "<h4 class='modal-title'><span class='i18n' data-i18n-id='i18n_options'>Options</span> (" + panel.divElement.id + ")</h4>";
//        detailsHtml = detailsHtml + "</div>";
//        detailsHtml = detailsHtml + "<div class='modal-body' id='" + panel.divElement.id + "-modal-body'>";
//        detailsHtml = detailsHtml + "<p></p>";
//        detailsHtml = detailsHtml + "</div>";
//        detailsHtml = detailsHtml + "<div class='modal-footer'>";
//        detailsHtml = detailsHtml + "<button type='button' class='btn btn-danger' data-dismiss='modal'><span class='i18n' data-i18n-id='i18n_cancel'>Cancel</span></button>";
//        detailsHtml = detailsHtml + "<button id='" + panel.divElement.id + "-apply-button' type='button' class='btn btn-success' data-dismiss='modal'><span class='i18n' data-i18n-id='i18n_apply_changes'>Apply changes</span></button>";
//        detailsHtml = detailsHtml + "</div>";
//        detailsHtml = detailsHtml + "</div><!-- /.modal-content -->";
//        detailsHtml = detailsHtml + "</div><!-- /.modal-dialog -->";
//        detailsHtml = detailsHtml + "</div><!-- /.modal -->";
//        $(divElement).html(detailsHtml);

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
            var attrHtml = "";
            attrHtml = attrHtml + "<table class='table table-default' >";
            attrHtml = attrHtml + "<tr ";
            if (firstMatch.effectiveTime == panel.options.highlightByEffectiveTime) {
                attrHtml = attrHtml + "class = 'highlightEffectiveTime'";
            }
            attrHtml = attrHtml + "><td>";
            attrHtml = attrHtml + "<h4>"
            if (firstMatch.definitionStatus == "Primitive") {
                attrHtml = attrHtml + '<a href="javascript:void(0);" style="color: inherit;text-decoration: inherit;"><span class="badge alert-warning jqui-draggable"  data-concept-id="' + firstMatch.conceptId + '" data-term="' + firstMatch.defaultTerm + '" data-def-status="' + firstMatch.definitionStatus + '">&nbsp;</span></a>&nbsp;&nbsp;';
            } else {
                attrHtml = attrHtml + '<a href="javascript:void(0);" style="color: inherit;text-decoration: inherit;"><span class="badge alert-warning jqui-draggable"  data-concept-id="' + firstMatch.conceptId + '" data-term="' + firstMatch.defaultTerm + '" data-def-status="' + firstMatch.definitionStatus + '">&equiv;</span></a>&nbsp;&nbsp;';
            }
            attrHtml = attrHtml + "<span class='jqui-droppable'>" + firstMatch.defaultTerm + "</span></h4>";
            attrHtml = attrHtml + "<br>SCTID: " + firstMatch.conceptId;

            if (firstMatch.definitionStatus == "Primitive") {
                attrHtml = attrHtml + ", <span class='i18n' data-i18n-id='i18n_primitive'>Primitive</span>";
            } else {
                attrHtml = attrHtml + ", <span class='i18n' data-i18n-id='i18n_fully_defined'>Fully defined</span>";
            }
            if (firstMatch.active == true) {
                attrHtml = attrHtml + ", <span class='i18n' data-i18n-id='i18n_active'>Active</span>";
            } else {
                attrHtml = attrHtml + ", <span class='i18n' data-i18n-id='i18n_inactive'>Inactive</span>";
            }
            attrHtml = attrHtml + "</td>";
            var moreDetailsHtml = "<table border='1'><tr><th style='padding: 3px;'>Effective Time</th><th style='padding: 3px;'>ModuleId</th></tr><tr><td style='padding: 3px;'>" + firstMatch.effectiveTime + "</td><td style='padding: 3px;'>" + firstMatch.module + "</td></tr></table>"
            attrHtml = attrHtml + '<td><button type="button" class="btn btn-link unobtrusive-icon more-fields-button pull-right" data-container="body" data-toggle="popover" data-placement="left" data-content="' + moreDetailsHtml + '" data-html="true"><i class="glyphicon glyphicon-info-sign"></i></button>';
            var linkHtml = "<form><input class='form-control' id='share-field-" + panel.divElement.id +"' value='" + document.URL.split("?")[0].split("#")[0] +  "?perspective=full&conceptId1=" + panel.conceptId +"'></form><br>Copy the concept link (e.g. CTRL-C) to save and share a reference to this concept.";
            // additional data to include release info in link  +"&edition=" + options.edition  +"&release=" + options.release
            attrHtml = attrHtml + '&nbsp;<button type="button" id="share-link-' + panel.divElement.id + '" class="btn btn-link more-fields-button pull-right" data-container="body" data-toggle="popover" data-placement="left" data-content="' + linkHtml + '" data-html="true"><i class="glyphicon glyphicon-share-alt"></i></button></td>';

            attrHtml = attrHtml + "</tr></table>";

            $('#' + panel.attributesPId).html(attrHtml);
            $('#' + 'share-link-' + panel.divElement.id).disableTextSelect();
            $('#' + 'share-link-' + panel.divElement.id).click(function(event) {
                setTimeout(function () {
                    $('#' + 'share-field-' + panel.divElement.id).select();
                },300);
            });

            // load home-attributes
            var homeAttrHtml = "";
            if (firstMatch.definitionStatus == "Primitive") {
                homeAttrHtml = homeAttrHtml + '<h4><a href="javascript:void(0);" style="color: inherit;text-decoration: inherit;"><span class="badge alert-warning jqui-draggable"  data-concept-id="' + firstMatch.conceptId + '" data-term="' + firstMatch.defaultTerm + '" data-def-status="' + firstMatch.definitionStatus + '">&nbsp;</span></a>&nbsp;&nbsp;<span class="jqui-droppable">';
            } else {
                homeAttrHtml = homeAttrHtml + '<h4><a href="javascript:void(0);" style="color: inherit;text-decoration: inherit;"><span class="badge alert-warning jqui-draggable"  data-concept-id="' + firstMatch.conceptId + '" data-term="' + firstMatch.defaultTerm + '" data-def-status="' + firstMatch.definitionStatus + '">&equiv;</span></a>&nbsp;&nbsp;<span class="jqui-droppable">';
            }
            homeAttrHtml = homeAttrHtml + firstMatch.defaultTerm + "</span></h4>";
            homeAttrHtml = homeAttrHtml + "<h5>SCTID: " + firstMatch.conceptId + "</h5>";
            homeAttrHtml = homeAttrHtml + '<div id="home-descriptions-' + panel.divElement.id + '"></div>';
            $('#home-attributes-' + panel.divElement.id).html(homeAttrHtml);

            if (!firstMatch.active) {
                $('#home-attributes-' + panel.divElement.id).css("background-color", "LightPink");
            } else {
                $('#home-attributes-' + panel.divElement.id).css("background-color", "white");
            }

            if ($("#" + panel.divElement.id + "-expandButton").is(":visible")) {
                $("#" + panel.divElement.id + "-panelTitle").html("&nbsp;&nbsp;&nbsp;<strong>Concept Details: " + panel.defaultTerm + "</strong>");
            }

            $('#' + panel.attributesPId + ',#home-attributes-' + panel.divElement.id).find('.jqui-droppable').droppable({
                drop: panel.handleDropEvent,
                hoverClass: "bg-info"
            });

            $('#' + panel.attributesPId + ',#home-attributes-' + panel.divElement.id).find(".jqui-draggable").draggable({
                appendTo: 'body',
                helper: 'clone',
                delay: 10
            });
            if (typeof i18n_drag_this == "undefined") {
                i18n_drag_this = "Drag this";
            }
            $('#' + panel.attributesPId + ',#home-attributes-' + panel.divElement.id).find(".jqui-draggable").tooltip({
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
            var descDetailsHtml = "<table class='table table-bordered' id = '" + panel.descsPId + "-table'>";
            descDetailsHtml = descDetailsHtml + "<thead><tr>";
            descDetailsHtml = descDetailsHtml + "<th><span class='i18n' data-i18n-id='i18n_term'>Term</span></th>";
            if (panel.options.showIds == true) {
                descDetailsHtml = descDetailsHtml + "<th>SCTID</th>";
            }
            descDetailsHtml = descDetailsHtml + "<th><span class='i18n' data-i18n-id='i18n_acceptability'>Acceptability</span> " + languageName + "</th>";
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

            var homeDescriptionsHtml = "";
            $.each(allDescriptions, function(i, field) {
                if (panel.options.displayInactiveDescriptions || field.active == true) {
                    if (field.active == true) {
                        if (homeDescriptionsHtml != "") {
                            homeDescriptionsHtml = homeDescriptionsHtml + "<br>";
                        }
                        homeDescriptionsHtml = homeDescriptionsHtml + "&nbsp;&nbsp;&nbsp;&nbsp;" + field.term;
                    }
                    var row = "";
                    var isFsn = false;
                    var isSynonym = false;
                    var isDefinition = false;
                    var isPreferred = false;
                    var isAcceptable = false;

                    if (field.type.conceptId == "900000000000003001") {
                        isFsn = true;
                    } else if (field.type.conceptId == "900000000000013009") {
                        isSynonym = true;
                    } else if (field.type.conceptId == "900000000000550004") {
                        isDefinition = true;
                    }
                    if (typeof field.langMemberships != "undefined") {
                        $.each(field.langMemberships, function(i, lm) {
                            if (lm.refset.conceptId == panel.options.langRefset && lm.acceptability.conceptId == "900000000000548007") {
                                isPreferred = true;
                            } else if (lm.refset.conceptId == panel.options.langRefset && lm.acceptability.conceptId == "900000000000549004") {
                                isAcceptable = true;
                            }
                        });
                    }
                    row = "<tr class='";
                    if (isFsn) {
                        row = row + " fsn-row";
                    } else {
                        row = row + " synonym-row";
                    }
                    if (!field.active) {
                        row = row + " danger";
                    }

                    if (field.effectiveTime == panel.options.highlightByEffectiveTime) {
                        row = row + " highlightEffectiveTime";
                    }

                    row = row + "'><td>";

                    if (typeof i18n_fsn == "undefined") {
                        i18n_fsn = "F";
                    }
                    if (typeof i18n_synonym == "undefined") {
                        i18n_synonym = "S";
                    }
                    if (typeof i18n_definition == "undefined") {
                        i18n_definition = "D";
                    }

                    if (isFsn) {
                        row = row + '<span rel="tooltip-right" title="' + i18n_fsn + '">F</span>';
                    } else if (isSynonym) {
                        row = row + '<span rel="tooltip-right" title="' + i18n_synonym + '">S</span>';
                    } else if (isDefinition) {
                        row = row + '<span rel="tooltip-right" title="' + i18n_definition + '">D</span>';
                    }

                    if (isPreferred && isFsn) {
                        row = row + '&nbsp;<span class="glyphicon glyphicon-star-empty" rel="tooltip-right" title="Preferred"></span>';
                    } else if (isPreferred && !isFsn) {
                        row = row + '&nbsp;<span class="glyphicon glyphicon-star" rel="tooltip-right" title="Preferred"></span>';
                    } else if (isAcceptable){
                        row = row + '&nbsp;<span rel="tooltip-right" title="Acceptable">&#10004;</span></span>';
                    } else {
                        row = row + '&nbsp;&nbsp;&nbsp;';
                    }

                    row = row + "&nbsp;&nbsp;&nbsp;" + field.term + "</td>";
                    if (panel.options.showIds == true) {
                        row = row + "<td>" + field.descriptionId + "</td>";
                    }
                    var includedInLanguage = false;
                    if (typeof field.langMemberships != "undefined") {
                        $.each(field.langMemberships, function(i, lang) {
                            if (lang.refset.conceptId == panel.options.langRefset) {
                                if (lang.acceptability.conceptId == "900000000000548007") {
                                    row = row + "<td><span class='i18n' data-i18n-id='i18n_preferred'>Preferred</span>";
                                } else {
                                    row = row + "<td><span class='i18n' data-i18n-id='i18n_acceptable'>Acceptable</span>";
                                }

                                includedInLanguage = true;
                            }
                        });
                    }
                    if (includedInLanguage == false) {
                        row = row + "<td><span class='i18n' data-i18n-id='i18n_not_acceptable'>Not acceptable</span>";
                    }
                    var moreDetailsHtml = "<table border='1'><tr><th style='padding: 3px;'>DescriptionId</th><th style='padding: 3px;'>Type</th><th style='padding: 3px;'>Language</th><th style='padding: 3px;'>Case Significance</th><th style='padding: 3px;'>Effective Time</th><th style='padding: 3px;'>ModuleId</th></tr>";
                    moreDetailsHtml = moreDetailsHtml + "<tr><td style='padding: 3px;'>" + field.descriptionId + "</td><td style='padding: 3px;'>" + panel.removeSemtag(field.type.defaultTerm) + "</td><td style='padding: 3px;'>" + field.lang + "</td><td style='padding: 3px;'>" + panel.removeSemtag(field.ics.defaultTerm) + "</td><td style='padding: 3px;'>" + field.effectiveTime + "</td><td style='padding: 3px;'>" + field.module + "</td></tr></table>"
                    row = row + '<button type="button" class="btn btn-link unobtrusive-icon more-fields-button pull-right" data-container="body" data-toggle="popover" data-placement="left" data-content="' + moreDetailsHtml + '" data-html="true"><i class="glyphicon glyphicon-info-sign"></i></button>';
                    row = row + "</td></tr>";
                    if (!(includedInLanguage == false && panel.options.hideNotAcceptable) || panel.options.displayInactiveDescriptions) {
                        descDetailsHtml = descDetailsHtml + row;
                    }
                }
            });
            descDetailsHtml = descDetailsHtml + "</tbody></table>";
            $('#' + panel.descsPId).html(descDetailsHtml);
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
            $('#' + panel.descsPId).find(".jqui-draggable").draggable({
                appendTo: 'body',
                helper: 'clone',
                delay: 500
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
            var statedParents = [];
            var inferredParents = [];
            var statedRoles = [];
            var inferredRoles = [];
            var relsDetailsHtml = "<table class='table table-bordered'>";
            relsDetailsHtml = relsDetailsHtml + "<thead><tr>";
            relsDetailsHtml = relsDetailsHtml + "<th><span class='i18n' data-i18n-id='i18n_type'>Type</span></th>";
            relsDetailsHtml = relsDetailsHtml + "<th><span class='i18n' data-i18n-id='i18n_destination'>Destination</span></th>";
            relsDetailsHtml = relsDetailsHtml + "<th><span class='i18n' data-i18n-id='i18n_group'>Group</span></th>";
            relsDetailsHtml = relsDetailsHtml + "<th><span class='i18n' data-i18n-id='i18n_char_type'>CharType</span></th>";
            relsDetailsHtml = relsDetailsHtml + "</tr></thead><tbody>";

            if (typeof firstMatch.relationships != "undefined") {
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
                $.each(firstMatch.relationships, function(i, field) {
                    //console.log(JSON.stringify(field));
                    if (field.active == true) {
                        if (field.type.conceptId == 116680003) {
                            inferredParents.push(field);
                        } else {
                            inferredRoles.push(field);
                        }
                        var row = "";
                        row = "<tr class='inferred-rel";
                        if (field.effectiveTime == panel.options.highlightByEffectiveTime) {
                            row = row + " highlightEffectiveTime";
                        }
                        row = row + "'>";

                        row = row + "<td>";
                        if (field.type.definitionStatus == "Primitive") {
                            row = row + '<a href="javascript:void(0);" style="color: inherit;text-decoration: inherit;"><span class="badge alert-warning jqui-draggable"  data-concept-id="' + field.type.conceptId + '" data-term="' + field.type.defaultTerm + '" data-def-status="' + field.type.definitionStatus + '">&nbsp;</span></a>&nbsp;&nbsp;';
                        } else {
                            row = row + '<a href="javascript:void(0);" style="color: inherit;text-decoration: inherit;"><span class="badge alert-warning jqui-draggable"  data-concept-id="' + field.type.conceptId + '" data-term="' + field.type.defaultTerm + '" data-def-status="' + field.type.definitionStatus + '">&equiv;</span></a>&nbsp;&nbsp;';
                        }
                        row = row + field.type.defaultTerm + "</td>";
                        row = row + "<td>";
                        if (field.target.definitionStatus == "Primitive") {
                            row = row + '<a href="javascript:void(0);" style="color: inherit;text-decoration: inherit;"><span class="badge alert-warning jqui-draggable"  data-concept-id="' + field.target.conceptId + '" data-term="' + field.target.defaultTerm + '" data-def-status="' + field.target.definitionStatus + '">&nbsp;</span></a>&nbsp;&nbsp;';
                        } else {
                            row = row + '<a href="javascript:void(0);" style="color: inherit;text-decoration: inherit;"><span class="badge alert-warning jqui-draggable"  data-concept-id="' + field.target.conceptId + '" data-term="' + field.target.defaultTerm + '" data-def-status="' + field.target.definitionStatus + '">&equiv;</span></a>&nbsp;&nbsp;';
                        }
                        row = row + field.target.defaultTerm + "</td>";
                        row = row + "<td>" + field.groupId + "</td>";
                        if (field.charType.conceptId == "900000000000010007") {
                            row = row + "<td><span class='i18n' data-i18n-id='i18n_stated'>Stated</span>";
                        } else if (field.charType.conceptId == "900000000000011006") {
                            row = row + "<td><span class='i18n' data-i18n-id='i18n_inferred'>Inferred</span>";
                        } else {
                            row = row + "<td><span class='i18n' data-i18n-id='i18n_other'>Other</span>";
                        }
                        var moreDetailsHtml = "<table border='1'><tr><th style='padding: 3px;'>TypeId</th><th style='padding: 3px;'>TargetId</th><th style='padding: 3px;'>Modifier</th><th style='padding: 3px;'>Effective Time</th><th style='padding: 3px;'>ModuleId</th></tr>";
                        moreDetailsHtml = moreDetailsHtml + "<tr><td style='padding: 3px;'>" + field.type.conceptId + "</td><td style='padding: 3px;'>" + field.target.conceptId + "</td><td style='padding: 3px;'>" + field.modifier + "</td><td style='padding: 3px;'>" + field.effectiveTime + "</td><td style='padding: 3px;'>" + field.module + "</td></tr></table>"
                        row = row + '<button type="button" class="btn btn-link unobtrusive-icon more-fields-button pull-right" data-container="body" data-toggle="popover" data-placement="left" data-content="' + moreDetailsHtml + '" data-html="true"><i class="glyphicon glyphicon-info-sign"></i></button>';
                        row = row + "</td></tr>";
                        relsDetailsHtml = relsDetailsHtml + row;
                    }
                });
            }

            if (typeof firstMatch.statedRelationships != "undefined") {
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
                $.each(firstMatch.statedRelationships, function(i, field) {
                    //console.log(JSON.stringify(field));
                    if (field.active == true) {
                        if (field.type.conceptId == 116680003) {
                            statedParents.push(field);
                        } else {
                            statedRoles.push(field);
                        }
                        var row = "";
                        row = "<tr class='stated-rel";
                        if (field.effectiveTime == panel.options.highlightByEffectiveTime) {
                            row = row + " highlightEffectiveTime";
                        }
                        row = row + "'>";

                        row = row + "<td>";
                        if (field.type.definitionStatus == "Primitive") {
                            row = row + '<a href="javascript:void(0);" style="color: inherit;text-decoration: inherit;"><span class="badge alert-warning jqui-draggable"  data-concept-id="' + field.type.conceptId + '" data-term="' + field.type.defaultTerm + '" data-def-status="' + field.type.definitionStatus + '">&nbsp;</span></a>&nbsp;&nbsp;';
                        } else {
                            row = row + '<a href="javascript:void(0);" style="color: inherit;text-decoration: inherit;"><span class="badge alert-warning jqui-draggable"  data-concept-id="' + field.type.conceptId + '" data-term="' + field.type.defaultTerm + '" data-def-status="' + field.type.definitionStatus + '">&equiv;</span></a>&nbsp;&nbsp;';
                        }
                        row = row + field.type.defaultTerm + "</td>";
                        row = row + "<td>";
                        if (field.target.definitionStatus == "Primitive") {
                            row = row + '<a href="javascript:void(0);" style="color: inherit;text-decoration: inherit;"><span class="badge alert-warning jqui-draggable"  data-concept-id="' + field.target.conceptId + '" data-term="' + field.target.defaultTerm + '" data-def-status="' + field.target.definitionStatus + '">&nbsp;</span></a>&nbsp;&nbsp;';
                        } else {
                            row = row + '<a href="javascript:void(0);" style="color: inherit;text-decoration: inherit;"><span class="badge alert-warning jqui-draggable"  data-concept-id="' + field.target.conceptId + '" data-term="' + field.target.defaultTerm + '" data-def-status="' + field.target.definitionStatus + '">&equiv;</span></a>&nbsp;&nbsp;';
                        }
                        row = row + field.target.defaultTerm + "</td>";
                        row = row + "<td>" + field.groupId + "</td>";

                        if (field.charType.conceptId == "900000000000010007") {
                            row = row + "<td><span class='i18n' data-i18n-id='i18n_stated'>Stated</span>";
                        } else if (field.charType.conceptId == "900000000000011006") {
                            row = row + "<td><span class='i18n' data-i18n-id='i18n_inferred'>Inferred</span>";
                        } else {
                            row = row + "<td><span class='i18n' data-i18n-id='i18n_other'>Other</span>";
                        }
                        var moreDetailsHtml = "<table border='1'><tr><th style='padding: 3px;'>Modifier</th><th style='padding: 3px;'>Effective Time</th><th style='padding: 3px;'>ModuleId</th></tr>";
                        moreDetailsHtml = moreDetailsHtml + "<tr><td style='padding: 3px;'>" + field.modifier + "</td><td style='padding: 3px;'>" + field.effectiveTime + "</td><td style='padding: 3px;'>" + field.module + "</td></tr></table>"
                        row = row + '<button type="button" class="btn btn-link unobtrusive-icon more-fields-button pull-right" data-container="body" data-toggle="popover" data-placement="left" data-content="' + moreDetailsHtml + '" data-html="true"><i class="glyphicon glyphicon-info-sign"></i></button>';
                        row = row + "</td></tr>";
                        relsDetailsHtml = relsDetailsHtml + row;
                    }
                });
            }
            if ((inferredParents.length + statedParents.length) == 0) {
                relsDetailsHtml = relsDetailsHtml + "<tr><td colspan='4'><span class='text-muted'>No relationships</span></td></tr>";
            }
            relsDetailsHtml = relsDetailsHtml + "</tbody></table>";
            $('#' + panel.relsPId).html(relsDetailsHtml);

            inferredParents.sort(function(a, b) {
                if (a.target.defaultTerm < b.target.defaultTerm)
                    return -1;
                if (a.target.defaultTerm > b.target.defaultTerm)
                    return 1;
                return 0;
            });

            statedParents.sort(function(a, b) {
                if (a.target.defaultTerm < b.target.defaultTerm)
                    return -1;
                if (a.target.defaultTerm > b.target.defaultTerm)
                    return 1;
                return 0;
            });

            inferredRoles.sort(function(a, b) {
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

            statedRoles.sort(function(a, b) {
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

            var parentsHomeHtml = "";
            if (panel.options.selectedView == "stated") {
                $.each(statedParents, function(i, field) {
                    parentsHomeHtml = parentsHomeHtml + "<span class='jqui-draggable text-warning' data-concept-id='" + field.type.conceptId + "' data-term='" + field.type.defaultTerm + "'>";
                    if (field.type.defaultTerm.lastIndexOf("(") > 0) {
                        parentsHomeHtml = parentsHomeHtml+ field.type.defaultTerm.substr(0, field.type.defaultTerm.lastIndexOf("(")-1) + "</span>&nbsp&rArr;&nbsp;";
                    } else {
                        parentsHomeHtml = parentsHomeHtml+ field.type.defaultTerm + "</span>&nbsp&rArr;&nbsp;";
                    }
                    parentsHomeHtml = parentsHomeHtml + "<span class='jqui-draggable";
                    if (field.target.definitionStatus == "Primitive") {
                        parentsHomeHtml = parentsHomeHtml + " sct-primitive-concept-compact";
                    } else {
                        parentsHomeHtml = parentsHomeHtml + " sct-defined-concept-compact";
                    }
                    parentsHomeHtml = parentsHomeHtml + "' data-concept-id='" + field.target.conceptId + "' data-term='" + field.target.defaultTerm + "'>";                    if (field.target.defaultTerm.lastIndexOf("(") > 0) {
                        parentsHomeHtml = parentsHomeHtml + field.target.defaultTerm.substr(0, field.target.defaultTerm.lastIndexOf("(")-1) + "</span><br>";
                    } else {
                        parentsHomeHtml = parentsHomeHtml + field.target.defaultTerm + "</span><br>";
                    }
                });
                if (statedParents.length == 0) {
                    parentsHomeHtml = parentsHomeHtml + "<span class='text-muted'>No parents</span>";
                }
            } else {
                $.each(inferredParents, function(i, field) {
                    parentsHomeHtml = parentsHomeHtml + "<span class='jqui-draggable text-warning' data-concept-id='" + field.type.conceptId + "' data-term='" + field.type.defaultTerm + "'>";
                    if (field.type.defaultTerm.lastIndexOf("(") > 0) {
                        parentsHomeHtml = parentsHomeHtml+ field.type.defaultTerm.substr(0, field.type.defaultTerm.lastIndexOf("(")-1) + "</span>&nbsp&rArr;&nbsp;";
                    } else {
                        parentsHomeHtml = parentsHomeHtml+ field.type.defaultTerm + "</span>&nbsp&rArr;&nbsp;";
                    }
                    parentsHomeHtml = parentsHomeHtml + "<span class='jqui-draggable";
                    if (field.target.definitionStatus == "Primitive") {
                        parentsHomeHtml = parentsHomeHtml + " sct-primitive-concept-compact";
                    } else {
                        parentsHomeHtml = parentsHomeHtml + " sct-defined-concept-compact";
                    }
                    parentsHomeHtml = parentsHomeHtml + "' data-concept-id='" + field.target.conceptId + "' data-term='" + field.target.defaultTerm + "'>";
                    if (field.target.defaultTerm.lastIndexOf("(") > 0) {
                        parentsHomeHtml = parentsHomeHtml + field.target.defaultTerm.substr(0, field.target.defaultTerm.lastIndexOf("(")-1) + "</span><br>";
                    } else {
                        parentsHomeHtml = parentsHomeHtml + field.target.defaultTerm + "</span><br>";
                    }
                });
                if (inferredParents.length == 0) {
                    parentsHomeHtml = parentsHomeHtml + "<span class='text-muted'>No parents</span>";
                }
            }
            if (!panel.options.diagrammingMarkupEnabled) {
                parentsHomeHtml = panel.stripDiagrammingMarkup(parentsHomeHtml);
            }
            $('#home-parents-' + panel.divElement.id).html(parentsHomeHtml);

            var rolesHomeHtml = "<div style='line-height: 100%;'>";
            if (panel.options.selectedView == "stated") {
                var lastGroup = 0;
                var barHtml = "";
                var barColor = "white";
                $.each(statedRoles, function(i, field) {
                    if (!(lastGroup == field.groupId)) {
                        rolesHomeHtml = rolesHomeHtml + "<br>";
                        lastGroup = field.groupId;
                        barColor = getRandomColor();
                        barHtml = "&nbsp;&nbsp;&nbsp;<span style='background-color: " + barColor + "'>&nbsp;&nbsp;</span>";
                    }
                    rolesHomeHtml = rolesHomeHtml + barHtml;
                    rolesHomeHtml = rolesHomeHtml + "&nbsp;<span class='jqui-draggable sct-attribute-compact' data-concept-id='" + field.type.conceptId + "' data-term='" + field.type.defaultTerm + "'>";
                    rolesHomeHtml = rolesHomeHtml+ panel.removeSemtag(field.type.defaultTerm) + "</span>&nbsp&rarr;&nbsp;";
                    rolesHomeHtml = rolesHomeHtml + "<span class='jqui-draggable";
                    if (field.target.definitionStatus == "Primitive") {
                        rolesHomeHtml = rolesHomeHtml + " sct-primitive-concept-compact";
                    } else {
                        rolesHomeHtml = rolesHomeHtml + " sct-defined-concept-compact";
                    }
                    rolesHomeHtml = rolesHomeHtml + "' data-concept-id='" + field.target.conceptId + "' data-term='" + field.target.defaultTerm + "'>";
                    rolesHomeHtml = rolesHomeHtml + panel.removeSemtag(field.target.defaultTerm) + "</span><br>";
                });
                if (statedRoles.length == 0) {
                    rolesHomeHtml = rolesHomeHtml + "<span class='i18n text-muted' data-i18n-id='i18n_no_relationships'>No relationships</span>";
                }
            } else {
                var lastGroup = 0;
                var barHtml = "";
                var barColor = "white";
                $.each(inferredRoles, function(i, field) {
                    if (!(lastGroup == field.groupId)) {
                        lastGroup = field.groupId;
                        rolesHomeHtml = rolesHomeHtml + "<br>";
                        barColor = getRandomColor();
                        barHtml = "&nbsp;&nbsp;&nbsp;<span style='background-color: " + barColor + "'>&nbsp;&nbsp;</span>";
                    }
                    rolesHomeHtml = rolesHomeHtml + barHtml;
                    rolesHomeHtml = rolesHomeHtml + "&nbsp;<span class='jqui-draggable sct-attribute-compact' data-concept-id='" + field.type.conceptId + "' data-term='" + field.type.defaultTerm + "'>";
                    rolesHomeHtml = rolesHomeHtml+ panel.removeSemtag(field.type.defaultTerm) + "</span>&nbsp&rarr;&nbsp;";
                    rolesHomeHtml = rolesHomeHtml + "<span class='jqui-draggable";
                    if (field.target.definitionStatus == "Primitive") {
                        rolesHomeHtml = rolesHomeHtml + " sct-primitive-concept-compact";
                    } else {
                        rolesHomeHtml = rolesHomeHtml + " sct-defined-concept-compact";
                    }
                    rolesHomeHtml = rolesHomeHtml + "' data-concept-id='" + field.target.conceptId + "' data-term='" + field.target.defaultTerm + "'>";
                    rolesHomeHtml = rolesHomeHtml + panel.removeSemtag(field.target.defaultTerm) + "</span><br>";
                });
                if (inferredRoles.length == 0) {
                    rolesHomeHtml = rolesHomeHtml + "<span class='i18n text-muted' data-i18n-id='i18n_no_relationships'>No relationships</span>";
                }
            }
            rolesHomeHtml = rolesHomeHtml + "</div>";
            if (!panel.options.diagrammingMarkupEnabled) {
                rolesHomeHtml = panel.stripDiagrammingMarkup(rolesHomeHtml);
            }

            if (panel.options.diagrammingMarkupEnabled) {
                $('#footer-' + panel.divElement.id).html('<a href="http://www.ihtsdo.org/fileadmin/user_upload/Docs_01/Publications/SNOMED_CT_Diagramming_Guideline.pdf" target="_blank">Read about the IHTSDO Diagramming Guideline</a>');
            } else {
                $('#footer-' + panel.divElement.id).html('');
            }


            $('#home-roles-' + panel.divElement.id).html(rolesHomeHtml);


            // Load Refsets info
            var refsetsHtml = "";

            if (firstMatch.memberships) {
                var simpleFound = false;
                var simpleRefsetsHtml = "<table class='table table-bordered'>";
                simpleRefsetsHtml = simpleRefsetsHtml + "<thead><tr>";
                simpleRefsetsHtml = simpleRefsetsHtml + "<th><span class='i18n' data-i18n-id='i18n_simple_refset_memberships'>Simple Refsets Memberships</span></th>";
                simpleRefsetsHtml = simpleRefsetsHtml + "</tr></thead><tbody>";
                $.each(firstMatch.memberships, function (i, field) {
                    if (field.type == "SIMPLE_REFSET") {
                        simpleFound = true;
                        simpleRefsetsHtml = simpleRefsetsHtml + "<tr class='";
                        if (!field.active) {
                            simpleRefsetsHtml = simpleRefsetsHtml + " danger";
                        }
                        simpleRefsetsHtml = simpleRefsetsHtml + "'><td>";
                        if (field.refset.definitionStatus == "Primitive") {
                            simpleRefsetsHtml = simpleRefsetsHtml + '<a href="javascript:void(0);" style="color: inherit;text-decoration: inherit;"><span class="badge alert-warning jqui-draggable"  data-concept-id="' + field.refset.conceptId + '" data-term="' + field.refset.defaultTerm + '" data-def-status="' + field.refset.definitionStatus + '">&nbsp;</span></a>&nbsp;&nbsp;';
                        } else {
                            simpleRefsetsHtml = simpleRefsetsHtml + '<a href="javascript:void(0);" style="color: inherit;text-decoration: inherit;"><span class="badge alert-warning jqui-draggable"  data-concept-id="' + field.refset.conceptId + '" data-term="' + field.refset.defaultTerm + '" data-def-status="' + field.refset.definitionStatus + '">&equiv;</span></a>&nbsp;&nbsp;';
                        }
                        simpleRefsetsHtml = simpleRefsetsHtml + field.refset.defaultTerm + "</td>";
                        var moreDetailsHtml = "<table border='1'><tr><th style='padding: 3px;'>RefsetId</th><th style='padding: 3px;'>Effective Time</th><th style='padding: 3px;'>ModuleId</th></tr>";
                        moreDetailsHtml = moreDetailsHtml + "<tr><td style='padding: 3px;'>" + field.refset.conceptId + "</td><td style='padding: 3px;'>" + field.effectiveTime + "</td><td style='padding: 3px;'>" + field.module + "</td></tr></table>"
                        simpleRefsetsHtml = simpleRefsetsHtml + '<button type="button" class="btn btn-link unobtrusive-icon more-fields-button pull-right" data-container="body" data-toggle="popover" data-placement="left" data-content="' + moreDetailsHtml + '" data-html="true"><i class="glyphicon glyphicon-info-sign"></i></button>';
                        simpleRefsetsHtml = simpleRefsetsHtml + "</td></tr>";
                    }
                });
                if (!simpleFound) {
                    simpleRefsetsHtml = simpleRefsetsHtml + "<tr><td><span class='i18n text-muted' data-i18n-id='i18n_no_memberships'>No memberships</span></td></tr>"
                    simpleRefsetsHtml = simpleRefsetsHtml + "</tbody></table>";
                } else {
                    simpleRefsetsHtml = simpleRefsetsHtml + "</tbody></table>";
                    refsetsHtml = refsetsHtml + simpleRefsetsHtml;
                }

                var simpleMapFound = false;
                // collapse <button data-toggle='collapse' href='#simpleMapTable'>X</button><div class='collapse' id='simpleMapTable'>
                var simpleMapRefsetsHtml = "<table class='table table-bordered'>";
                simpleMapRefsetsHtml = simpleMapRefsetsHtml + "<thead><tr>";
                simpleMapRefsetsHtml = simpleMapRefsetsHtml + "<th><span class='i18n' data-i18n-id='i18n_simple_map_refset_name'>Simple Map Refset name</span></th>";
                simpleMapRefsetsHtml = simpleMapRefsetsHtml + "<th><span class='i18n' data-i18n-id='i18n_target_code'>Target code</span></th>";
                simpleMapRefsetsHtml = simpleMapRefsetsHtml + "</tr></thead><tbody>";
                $.each(firstMatch.memberships, function (i, field) {
                    if (field.type == "SIMPLEMAP") {
                        simpleMapFound = true;
                        simpleMapRefsetsHtml = simpleMapRefsetsHtml + "<tr class='";
                        if (!field.active) {
                            simpleMapRefsetsHtml = simpleMapRefsetsHtml + " danger";
                        }
                        simpleMapRefsetsHtml = simpleMapRefsetsHtml + "'><td>";
                        if (field.refset.definitionStatus == "Primitive") {
                            simpleMapRefsetsHtml = simpleMapRefsetsHtml + '<a href="javascript:void(0);" style="color: inherit;text-decoration: inherit;"><span class="badge alert-warning jqui-draggable"  data-concept-id="' + field.refset.conceptId + '" data-term="' + field.refset.defaultTerm + '" data-def-status="' + field.refset.definitionStatus + '">&nbsp;</span></a>&nbsp;&nbsp;';
                        } else {
                            simpleMapRefsetsHtml = simpleMapRefsetsHtml + '<a href="javascript:void(0);" style="color: inherit;text-decoration: inherit;"><span class="badge alert-warning jqui-draggable"  data-concept-id="' + field.refset.conceptId + '" data-term="' + field.refset.defaultTerm + '" data-def-status="' + field.refset.definitionStatus + '">&equiv;</span></a>&nbsp;&nbsp;';
                        }
                        simpleMapRefsetsHtml = simpleMapRefsetsHtml + field.refset.defaultTerm + "</td>";
                        simpleMapRefsetsHtml = simpleMapRefsetsHtml + "<td>" + field.otherValue;
                        var moreDetailsHtml = "<table border='1'><tr><th style='padding: 3px;'>RefsetId</th><th style='padding: 3px;'>Effective Time</th><th style='padding: 3px;'>ModuleId</th></tr>";
                        moreDetailsHtml = moreDetailsHtml + "<tr><td style='padding: 3px;'>" + field.refset.conceptId + "</td><td style='padding: 3px;'>" + field.effectiveTime + "</td><td style='padding: 3px;'>" + field.module + "</td></tr></table>"
                        simpleMapRefsetsHtml = simpleMapRefsetsHtml + '<button type="button" class="btn btn-link unobtrusive-icon more-fields-button pull-right" data-container="body" data-toggle="popover" data-placement="left" data-content="' + moreDetailsHtml + '" data-html="true"><i class="glyphicon glyphicon-info-sign"></i></button>';
                        simpleMapRefsetsHtml = simpleMapRefsetsHtml + "</td></tr>";
                    }
                });
                if (!simpleMapFound) {
                    simpleMapRefsetsHtml = simpleMapRefsetsHtml + "<tr><td colspan='2'><span class='i18n text-muted' data-i18n-id='i18n_no_memberships'>No memberships</span></td></tr>"
                    simpleMapRefsetsHtml = simpleMapRefsetsHtml + "</tbody></table>";
                } else {
                    simpleMapRefsetsHtml = simpleMapRefsetsHtml + "</tbody></table>";
                    refsetsHtml = refsetsHtml + simpleMapRefsetsHtml;
                }

                var attributeValueFound = false;
                var attributeValueRefsetsHtml = "<table class='table table-bordered'>";
                attributeValueRefsetsHtml = attributeValueRefsetsHtml + "<thead><tr>";
                attributeValueRefsetsHtml = attributeValueRefsetsHtml + "<th><span class='i18n' data-i18n-id='i18n_attribute_value_refset_name'>Attribute Value Refset name</span></th>";
                attributeValueRefsetsHtml = attributeValueRefsetsHtml + "<th><span class='i18n' data-i18n-id='i18n_value'>Value</span></th>";
                attributeValueRefsetsHtml = attributeValueRefsetsHtml + "</tr></thead><tbody>";
                $.each(firstMatch.memberships, function (i, field) {
                    if (field.type == "ATTRIBUTE_VALUE") {
                        attributeValueFound = true;
                        attributeValueRefsetsHtml = attributeValueRefsetsHtml + "<tr class='";
                        if (!field.active) {
                            attributeValueRefsetsHtml = attributeValueRefsetsHtml + " danger";
                        }
                        attributeValueRefsetsHtml = attributeValueRefsetsHtml + "'><td>";
                        if (field.refset.definitionStatus == "Primitive") {
                            attributeValueRefsetsHtml = attributeValueRefsetsHtml + '<a href="javascript:void(0);" style="color: inherit;text-decoration: inherit;"><span class="badge alert-warning jqui-draggable"  data-concept-id="' + field.refset.conceptId + '" data-term="' + field.refset.defaultTerm + '" data-def-status="' + field.refset.definitionStatus + '">&nbsp;</span></a>&nbsp;&nbsp;';
                        } else {
                            attributeValueRefsetsHtml = attributeValueRefsetsHtml + '<a href="javascript:void(0);" style="color: inherit;text-decoration: inherit;"><span class="badge alert-warning jqui-draggable"  data-concept-id="' + field.refset.conceptId + '" data-term="' + field.refset.defaultTerm + '" data-def-status="' + field.refset.definitionStatus + '">&equiv;</span></a>&nbsp;&nbsp;';
                        }
                        attributeValueRefsetsHtml = attributeValueRefsetsHtml + field.refset.defaultTerm + "</td>";
                        attributeValueRefsetsHtml = attributeValueRefsetsHtml + "<td>";
                        if (field.cidValue.definitionStatus == "Primitive") {
                            attributeValueRefsetsHtml = attributeValueRefsetsHtml + '<a href="javascript:void(0);" style="color: inherit;text-decoration: inherit;"><span class="badge alert-warning jqui-draggable"  data-concept-id="' + field.cidValue.conceptId + '" data-term="' + field.cidValue.defaultTerm + '" data-def-status="' + field.cidValue.definitionStatus + '">&nbsp;</span></a>&nbsp;&nbsp;';
                        } else {
                            attributeValueRefsetsHtml = attributeValueRefsetsHtml + '<a href="javascript:void(0);" style="color: inherit;text-decoration: inherit;"><span class="badge alert-warning jqui-draggable"  data-concept-id="' + field.cidValue.conceptId + '" data-term="' + field.cidValue.defaultTerm + '" data-def-status="' + field.cidValue.definitionStatus + '">&equiv;</span></a>&nbsp;&nbsp;';
                        }
                        attributeValueRefsetsHtml = attributeValueRefsetsHtml + field.cidValue.defaultTerm + "</td>";
                        var moreDetailsHtml = "<table border='1'><tr><th style='padding: 3px;'>RefsetId</th><th style='padding: 3px;'>Effective Time</th><th style='padding: 3px;'>ModuleId</th></tr>";
                        moreDetailsHtml = moreDetailsHtml + "<tr><td style='padding: 3px;'>" + field.refset.conceptId + "</td><td style='padding: 3px;'>" + field.effectiveTime + "</td><td style='padding: 3px;'>" + field.module + "</td></tr></table>"
                        attributeValueRefsetsHtml = attributeValueRefsetsHtml + '<button type="button" class="btn btn-link unobtrusive-icon more-fields-button pull-right" data-container="body" data-toggle="popover" data-placement="left" data-content="' + moreDetailsHtml + '" data-html="true"><i class="glyphicon glyphicon-info-sign"></i></button>';
                        attributeValueRefsetsHtml = attributeValueRefsetsHtml + "</td></tr>";
                    }
                });
                if (!attributeValueFound) {
                    attributeValueRefsetsHtml = attributeValueRefsetsHtml + "<tr><td colspan='2'><span class='i18n text-muted' data-i18n-id='i18n_no_memberships'>No memberships</span></td></tr>"
                    attributeValueRefsetsHtml = attributeValueRefsetsHtml + "</tbody></table>";
                } else {
                    attributeValueRefsetsHtml = attributeValueRefsetsHtml + "</tbody></table>";
                    refsetsHtml = refsetsHtml + attributeValueRefsetsHtml;
                }

                var associationFound = false;
                var associationRefsetsHtml = "<table class='table table-bordered'>";
                associationRefsetsHtml = associationRefsetsHtml + "<thead><tr>";
                associationRefsetsHtml = associationRefsetsHtml + "<th><span class='i18n' data-i18n-id='i18n_association_refset_name'>Association Refset name</span></th>";
                associationRefsetsHtml = associationRefsetsHtml + "<th><span class='i18n' data-i18n-id='i18n_value'>Value</span></th>";
                associationRefsetsHtml = associationRefsetsHtml + "</tr></thead><tbody>";
                $.each(firstMatch.memberships, function (i, field) {
                    if (field.type == "ASSOCIATION") {
                        associationFound = true;
                        associationRefsetsHtml = associationRefsetsHtml + "<tr class='";
                        if (!field.active) {
                            associationRefsetsHtml = associationRefsetsHtml + " danger";
                        }
                        associationRefsetsHtml = associationRefsetsHtml + "'><td>";
                        if (field.refset.definitionStatus == "Primitive") {
                            associationRefsetsHtml = associationRefsetsHtml + '<a href="javascript:void(0);" style="color: inherit;text-decoration: inherit;"><span class="badge alert-warning jqui-draggable"  data-concept-id="' + field.refset.conceptId + '" data-term="' + field.refset.defaultTerm + '" data-def-status="' + field.refset.definitionStatus + '">&nbsp;</span></a>&nbsp;&nbsp;';
                        } else {
                            associationRefsetsHtml = associationRefsetsHtml + '<a href="javascript:void(0);" style="color: inherit;text-decoration: inherit;"><span class="badge alert-warning jqui-draggable"  data-concept-id="' + field.refset.conceptId + '" data-term="' + field.refset.defaultTerm + '" data-def-status="' + field.refset.definitionStatus + '">&equiv;</span></a>&nbsp;&nbsp;';
                        }
                        associationRefsetsHtml = associationRefsetsHtml + field.refset.defaultTerm + "</td>";
                        associationRefsetsHtml = associationRefsetsHtml + "<td>";
                        if (field.cidValue.definitionStatus == "Primitive") {
                            associationRefsetsHtml = associationRefsetsHtml + '<a href="javascript:void(0);" style="color: inherit;text-decoration: inherit;"><span class="badge alert-warning jqui-draggable"  data-concept-id="' + field.cidValue.conceptId + '" data-term="' + field.cidValue.defaultTerm + '" data-def-status="' + field.cidValue.definitionStatus + '">&nbsp;</span></a>&nbsp;&nbsp;';
                        } else {
                            associationRefsetsHtml = associationRefsetsHtml + '<a href="javascript:void(0);" style="color: inherit;text-decoration: inherit;"><span class="badge alert-warning jqui-draggable"  data-concept-id="' + field.cidValue.conceptId + '" data-term="' + field.cidValue.defaultTerm + '" data-def-status="' + field.cidValue.definitionStatus + '">&equiv;</span></a>&nbsp;&nbsp;';
                        }
                        associationRefsetsHtml = associationRefsetsHtml + field.cidValue.defaultTerm + "</td>";
                        var moreDetailsHtml = "<table border='1'><tr><th style='padding: 3px;'>RefsetId</th><th style='padding: 3px;'>Effective Time</th><th style='padding: 3px;'>ModuleId</th></tr>";
                        moreDetailsHtml = moreDetailsHtml + "<tr><td style='padding: 3px;'>" + field.refset.conceptId + "</td><td style='padding: 3px;'>" + field.effectiveTime + "</td><td style='padding: 3px;'>" + field.module + "</td></tr></table>"
                        associationRefsetsHtml = associationRefsetsHtml + '<button type="button" class="btn btn-link unobtrusive-icon more-fields-button pull-right" data-container="body" data-toggle="popover" data-placement="left" data-content="' + moreDetailsHtml + '" data-html="true"><i class="glyphicon glyphicon-info-sign"></i></button>';
                        associationRefsetsHtml = associationRefsetsHtml + "</td></tr>";
                    }
                });
                if (!associationFound) {
                    associationRefsetsHtml = associationRefsetsHtml + "<tr><td colspan='2'><span class='i18n text-muted' data-i18n-id='i18n_no_memberships'>No memberships</span></td></tr>"
                    associationRefsetsHtml = associationRefsetsHtml + "</tbody></table>";
                } else {
                    associationRefsetsHtml = associationRefsetsHtml + "</tbody></table>";
                    refsetsHtml = refsetsHtml + associationRefsetsHtml;
                }

            }

            $('#refsets-' + panel.divElement.id).html(refsetsHtml);


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
            $('#' + panel.relsPId + ',#home-parents-' + panel.divElement.id + ',#home-roles-' + panel.divElement.id + ',#refsets-' + panel.divElement.id).find(".jqui-draggable").draggable({
                appendTo: 'body',
                helper: 'clone',
                delay: 500
            });
            $('#' + panel.relsPId + ',#home-parents-' + panel.divElement.id + ',#home-roles-' + panel.divElement.id).find(".jqui-draggable").tooltip({
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
                childrenDetailsHtml = "<div>";
                childrenDetailsHtml = "<table class='table table-bordered'>";
                childrenDetailsHtml = childrenDetailsHtml + "<thead><tr>";
                childrenDetailsHtml = childrenDetailsHtml + "<th><span class='i18n' data-i18n-id='i18n_children'>Children</span></th>";
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



;function drawConceptDiagram (concept, div, options) {
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
};/* 
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
        }
        $.get("views/searchPlugin/searchPlugin-main.hbs").then(function (src) {
            var template = Handlebars.compile(src);
            $(divElement).html(template(context));
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

            $("#" + panel.divElement.id + "-linkerButton").draggable({
                cancel: false,
                appendTo: 'body',
                helper: 'clone',
                delay: 500
            });
            $("#" + panel.divElement.id + "-linkerButton").droppable({
                drop: panel.handlePanelDropEvent,
                hoverClass: "bg-info"
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
        });
//        var searchHtml = "<div style='margin: 5px; height:95%;' class='panel panel-default'>";
//        searchHtml = searchHtml + "<div class='panel-heading'>";
//        searchHtml = searchHtml + "<button id='" + panel.divElement.id + "-subscribersMarker' class='btn btn-link btn-lg' style='padding: 2px; position: absolute;top: 1px;left: 0px;'><i class='glyphicon glyphicon-bookmark'></i></button>"
//        searchHtml = searchHtml + "<div class='row'>";
//        searchHtml = searchHtml + "<div class='col-md-8' id='" + panel.divElement.id + "-panelTitle'>&nbsp&nbsp&nbsp<strong><span class='i18n' data-i18n-id='i18n_search'>Search</span></span></strong></div>";
//        searchHtml = searchHtml + "<div class='col-md-4 text-right'>";
//        searchHtml = searchHtml + "<button id='" + panel.divElement.id + "-linkerButton' class='btn btn-link jqui-draggable linker-button' data-panel='" + panel.divElement.id + "' style='padding:2px'><i class='glyphicon glyphicon-link'></i></button>"
//        searchHtml = searchHtml + "<button id='" + panel.divElement.id + "-historyButton' class='btn btn-link history-button' style='padding:2px'><i class='glyphicon glyphicon-time'></i></button>"
//        searchHtml = searchHtml + "<button id='" + panel.divElement.id + "-configButton' class='btn btn-link' style='padding:2px' data-target='#" + panel.divElement.id + "-configModal'><i class='glyphicon glyphicon-cog'></i></button>"
//        searchHtml = searchHtml + "<button id='" + panel.divElement.id + "-collapseButton' class='btn btn-link' style='padding:2px'><i class='glyphicon glyphicon-resize-small'></i></button>"
//        searchHtml = searchHtml + "<button id='" + panel.divElement.id + "-expandButton' class='btn btn-link' style='padding:2px'><i class='glyphicon glyphicon-resize-full'></i></button>"
//        searchHtml = searchHtml + "<button id='" + panel.divElement.id + "-closeButton' class='btn btn-link' style='padding:2px'><i class='glyphicon glyphicon-remove'></i></button>"
//        searchHtml = searchHtml + "</div>";
//        searchHtml = searchHtml + "</div>";
//        searchHtml = searchHtml + "</div>";
//        searchHtml = searchHtml + "<div class='panel-body' style='height:86%' id='" + panel.divElement.id + "-panelBody'>";
//        searchHtml = searchHtml + '<form>';
//        searchHtml = searchHtml + '<div class="form-group" style="margin-bottom: 2px;">';
//        searchHtml = searchHtml + '<label for="' + panel.divElement.id + '-searchBox">';
//        searchHtml = searchHtml + '<span class="i18n" data-i18n-id="i18n_type_3_chars">Type at least 3 characters</span> <i class="glyphicon glyphicon-remove text-danger" id="' + panel.divElement.id + '-typeIcon"></i> <span id="' + panel.divElement.id + '-searchExample"></span></label>';
//        if (typeof i18n_search_placeholder == "undefined") {
//            i18n_search_placeholder = "Search...";
//        }
//        searchHtml = searchHtml + '<br><div class="btn-group" style="width: 100%;"><input type="search" class="form-control" id="' + panel.divElement.id + '-searchBox" placeholder="' + i18n_search_placeholder + '" autocomplete="off">';
//        searchHtml = searchHtml + '<span id="'+ panel.divElement.id + '-clearButton" class="searchclear glyphicon glyphicon-remove-circle"></span></div>';
//        searchHtml = searchHtml + '</div>';
//        searchHtml = searchHtml + '</form>';
//        searchHtml = searchHtml + "<div id='" + panel.divElement.id + "-searchConfigBar' style='margin-bottom: 10px;'><nav class='navbar navbar-default' role='navigation' style='min-height: 28px;border-radius: 0px;border-bottom: 1px lightgray solid;'>";
//        searchHtml = searchHtml + " <ul class='nav navbar-nav navbar-left'>";
//        searchHtml = searchHtml + "     <li class='dropdown' style='margin-bottom: 2px; margin-top: 2px;'>";
//        searchHtml = searchHtml + "         <a href='javascript:void(0);' class='dropdown-toggle' data-toggle='dropdown' style='padding-top: 2px; padding-bottom: 2px;'><span id='" + panel.divElement.id + "-navSearchModeLabel'></span> <b class='caret'></b></a>";
//        searchHtml = searchHtml + "         <ul class='dropdown-menu' role='menu' style='float: none;'>";
//        searchHtml = searchHtml + "             <li><button class='btn btn-link' id='" + panel.divElement.id + "-fullTextButton'><span class='i18n' data-i18n-id='i18n_full_text_search_mode'>Full text search mode</span></button></li>";
//        searchHtml = searchHtml + "             <li><button class='btn btn-link' id='" + panel.divElement.id + "-partialMatchingButton'><span class='i18n' data-i18n-id='i18n_partial_match_search_mode'>Partial matching search mode</span></button></li>";
//        searchHtml = searchHtml + "             <li><button class='btn btn-link' id='" + panel.divElement.id + "-regexButton'><span class='i18n' data-i18n-id='i18n_regex_search_mode'>Regular Expressions search mode</span></button></li>";
//        searchHtml = searchHtml + "         </ul>";
//        searchHtml = searchHtml + "     </li>";
//        searchHtml = searchHtml + "     <li class='dropdown' style='margin-bottom: 2px; margin-top: 2px;'>";
//        searchHtml = searchHtml + "         <a href='javascript:void(0);' class='dropdown-toggle' data-toggle='dropdown' style='padding-top: 2px; padding-bottom: 2px;'><span id='" + panel.divElement.id + "-navLanguageLabel'></span> <b class='caret'></b></a>";
//        searchHtml = searchHtml + "         <ul class='dropdown-menu' role='menu' style='float: none;'>";
//        searchHtml = searchHtml + "             <li><button class='btn btn-link' id='" + panel.divElement.id + "-danishLangButton'><span class='i18n' data-i18n-id='i18n_danish_stemmer'>Danish language stemmer</span></button></li>";
//        searchHtml = searchHtml + "             <li><button class='btn btn-link' id='" + panel.divElement.id + "-englishLangButton'><span class='i18n' data-i18n-id='i18n_english_stemmer'>English language stemmer</span></button></li>";
//        searchHtml = searchHtml + "             <li><button class='btn btn-link' id='" + panel.divElement.id + "-spanishLangButton'><span class='i18n' data-i18n-id='i18n_spanish_stemmer'>Spanish language stemmer</span></button></li>";
//        searchHtml = searchHtml + "             <li><button class='btn btn-link' id='" + panel.divElement.id + "-swedishLangButton'><span class='i18n' data-i18n-id='i18n_swedish_stemmer'>Swedish language stemmer</span></button></li>";
//        searchHtml = searchHtml + "         </ul>";
//        searchHtml = searchHtml + "     </li>";
//        searchHtml = searchHtml + "     <li class='dropdown' style='margin-bottom: 2px; margin-top: 2px;'>";
//        searchHtml = searchHtml + "         <a href='javascript:void(0);' class='dropdown-toggle' data-toggle='dropdown' style='padding-top: 2px; padding-bottom: 2px;'><span id='" + panel.divElement.id + "-navStatusFilterLabel'></span> <b class='caret'></b></a>";
//        searchHtml = searchHtml + "         <ul class='dropdown-menu' role='menu' style='float: none;'>";
//        searchHtml = searchHtml + "             <li><button class='btn btn-link' id='" + panel.divElement.id + "-activeOnlyButton'><span class='i18n' data-i18n-id='i18n_active_only'>Active components only</span></button></li>";
//        searchHtml = searchHtml + "             <li><button class='btn btn-link' id='" + panel.divElement.id + "-activeInactiveButton'><span class='i18n' data-i18n-id='i18n_active_and_inactive'>Active and inactive components</span></button></li>";
//        searchHtml = searchHtml + "             <li><button class='btn btn-link' id='" + panel.divElement.id + "-inactiveOnlyButton'><span class='i18n' data-i18n-id='i18n_inactive_only'>Inactive components only</span></button></li>";
//        searchHtml = searchHtml + "         </ul>";
//        searchHtml = searchHtml + "     </li>";
//        searchHtml = searchHtml + " </ul>";
//        searchHtml = searchHtml + "</nav></div>";
//        searchHtml = searchHtml + "<div class='panel panel-default' style='height:70%;overflow:auto;margin-bottom: 15px;min-height: 300px;' id='" + panel.divElement.id + "-resultsScrollPane'>";
//        searchHtml = searchHtml + '<div id="' + panel.divElement.id + '-searchBar"></div>';
//        searchHtml = searchHtml + '<div id="' + panel.divElement.id + '-searchFilters"></div>';
//        searchHtml = searchHtml + "<table id='" + panel.divElement.id + "-resultsTable' class='table table-bordered'>";
//        searchHtml = searchHtml + "</table>";
//        searchHtml = searchHtml + "</div>";
//        searchHtml = searchHtml + "</div>";
//        searchHtml = searchHtml + "</div>";
//        $(divElement).html(searchHtml);


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
                resultsHtml = "";
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
                                $.each(result.descriptions, function (i, field) {
                                    if (field.active === false || field.conceptActive == false) {
                                        if (panel.options.statusSearchFilter == "inactiveOnly" ||
                                            panel.options.statusSearchFilter == "activeAndInactive") {
                                            resultsHtml = resultsHtml + "<tr class='resultRow selectable-row";
                                            resultsHtml = resultsHtml + " danger";
                                            resultsHtml = resultsHtml + "'><td class='col-md-7'><div class='jqui-draggable result-item' data-concept-id='" + field.conceptId + "' data-term='" + field.term + "'><a href='javascript:void(0);' style='color: inherit;text-decoration: inherit;'  data-concept-id='" + field.conceptId + "' data-term='" + field.term + "'>" + field.term + "</a></div></td><td class='text-muted small-text col-md-5 result-item'  data-concept-id='" + field.conceptId + "' data-term='" + field.term + "'>" + result.defaultTerm + "</td></tr>";
                                        }
                                    } else {
                                        if (panel.options.statusSearchFilter == "activeOnly" ||
                                            panel.options.statusSearchFilter == "activeAndInactive") {
                                            resultsHtml = resultsHtml + "<tr class='resultRow selectable-row";
                                            resultsHtml = resultsHtml + "'><td class='col-md-7'><div class='jqui-draggable result-item' data-concept-id='" + field.conceptId + "' data-term='" + field.term + "'><a href='javascript:void(0);' style='color: inherit;text-decoration: inherit;'  data-concept-id='" + field.conceptId + "' data-term='" + field.term + "'>" + field.term + "</a></div></td><td class='text-muted small-text col-md-5 result-item'  data-concept-id='" + field.conceptId + "' data-term='" + field.term + "'>" + result.defaultTerm + "</td></tr>";
                                        }
                                    }
                                });
                                $('#' + panel.divElement.id + '-resultsTable').html(resultsHtml);
                                $('#' + panel.divElement.id + '-searchBar').html("<span class='text-muted'></span>");
                                $('#' + panel.divElement.id + '-resultsTable').find(".jqui-draggable").draggable({
                                    appendTo: 'body',
                                    helper: 'clone',
                                    delay: 500
                                });
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
                                $.each(result.matches, function (i, field) {
                                    resultsHtml = resultsHtml + "<tr class='resultRow selectable-row";
                                    if (field.active == false || field.conceptActive == false) {
                                        resultsHtml = resultsHtml + " danger";
                                    }
                                    resultsHtml = resultsHtml + "'><td class='col-md-7'><div class='jqui-draggable result-item' data-concept-id='" + field.conceptId + "' data-term='" + field.term + "'><a href='javascript:void(0);' style='color: inherit;text-decoration: inherit;'  data-concept-id='" + field.conceptId + "' data-term='" + field.term + "'>" + field.term + "</a></div></td><td class='text-muted small-text col-md-5 result-item'  data-concept-id='" + field.conceptId + "' data-term='" + field.term + "'>" + field.fsn + "</td></tr>";
                                });
                                $('#' + panel.divElement.id + '-resultsTable').html(resultsHtml);
                                $('#' + panel.divElement.id + '-searchBar').html("<span class='text-muted'></span>");
                                $('#' + panel.divElement.id + '-resultsTable').find(".jqui-draggable").draggable({
                                    appendTo: 'body',
                                    helper: 'clone',
                                    delay: 500
                                });
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
                            if (result.details) {
                                var searchComment = "<span class='text-muted'>" + result.details.total + " matches found in " + elapsed + " seconds.</span>";
                            }
                            $('#' + panel.divElement.id + '-searchBar').html(searchComment);
                            xhr = null;
                            var matchedDescriptions = result.matches;
                            //console.log(JSON.stringify(result));

                            if (!matchedDescriptions || matchedDescriptions.length <= 0) {
                                resultsHtml = resultsHtml + "<tr><td class='text-muted'>No results</td></tr>";
                                $('#' + panel.divElement.id + '-resultsTable').html(resultsHtml);
                            } else {
                                var searchFiltersHtml = "<span class='pull right'><a class='btm btn-xs' style='margin: 3px; color: #777; background-color: #fff; border: 1px #ccc solid; margin-left: 25px;' data-toggle='collapse' href='#" + panel.divElement.id + "-searchFiltersPanel'><span class='i18n' data-i18n-id='i18n_filters'>Filters</span></a>";
                                if (panel.options.semTagFilter != "none") {
                                    searchFiltersHtml = searchFiltersHtml + "&nbsp;&nbsp;<span class='label label-danger'>" + panel.options.semTagFilter + "&nbsp;<a href='javascript:void(0);' style='color: white;text-decoration: none;' class='remove-semtag'>&times;</a></span>&nbsp;&nbsp;";
                                }
                                if (panel.options.langFilter != "none") {
                                    searchFiltersHtml = searchFiltersHtml + "&nbsp;&nbsp;<span class='label label-danger'>" + panel.options.langFilter + "&nbsp;<a href='javascript:void(0);' style='color: white;text-decoration: none;' class='remove-lang'>&times;</a></span>&nbsp;&nbsp;";
                                }
                                searchFiltersHtml = searchFiltersHtml + "</span><div id='" + panel.divElement.id + "-searchFiltersPanel' class='panel-collapse collapse'>";
                                searchFiltersHtml = searchFiltersHtml + "<div class='tree'><ul><li><a>Filter results by Language</a><ul>";
                                for(var key in result.filters.lang) {
                                    searchFiltersHtml = searchFiltersHtml + "<li><a class='lang-link' href='javascript:void(0);' data-lang='" + key + "'>" + key + " (" + result.filters.lang[key] + ")</a></li>";
                                }
                                searchFiltersHtml = searchFiltersHtml + "</ul></li></ul>";
                                searchFiltersHtml = searchFiltersHtml + "<ul><li><a>Filter results by Semantic Tag</a><ul>";
                                for(var key in result.filters.semTag) {
                                    searchFiltersHtml = searchFiltersHtml + "<li><a class='semtag-link' href='javascript:void(0);' data-semtag='" + key + "'>" + key + " (" + result.filters.semTag[key] + ")</a></li>";
                                }
                                searchFiltersHtml = searchFiltersHtml + "</ul></li></ul></div>";
                                $('#' + panel.divElement.id + '-searchBar').html($('#' + panel.divElement.id + '-searchBar').html() + searchFiltersHtml);
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

                                if (panel.options.searchMode == "regex") {
                                    matchedDescriptions.sort(function (a, b) {
                                        if (a.term.length < b.term.length)
                                            return -1;
                                        if (a.term.length > b.term.length)
                                            return 1;
                                        return 0;
                                    });
                                }
                                $.each(matchedDescriptions, function (i, field) {
                                    resultsHtml = resultsHtml + "<tr class='resultRow selectable-row";
                                    //console.log(field.active + " " + field.conceptActive);
                                    if (field.active == false || field.conceptActive == false) {
                                        resultsHtml = resultsHtml + " danger";
                                    }
                                    resultsHtml = resultsHtml + "'><td class='col-md-6'><div class='jqui-draggable result-item' data-concept-id='" + field.conceptId + "' data-term='" + field.term + "'><a href='javascript:void(0);' style='color: inherit;text-decoration: inherit;'  data-concept-id='" + field.conceptId + "' data-term='" + field.term + "'>" + field.term + "</a></div></td><td class='text-muted small-text col-md-6 result-item'  data-concept-id='" + field.conceptId + "' data-term='" + field.term + "'>" + field.fsn + "</td></tr>";
                                });
                                var remaining = result.details.total - (skipTo + returnLimit);
                                if (remaining > 0) {
                                    resultsHtml = resultsHtml + "<tr class='more-row'><td colspan='2' class='text-center'><button class='btn btn-link' id='" + panel.divElement.id + "-more'>Load " + returnLimit +  " more (" + remaining + " remaining on server)</button></td></tr>"
                                } else {
                                    resultsHtml = resultsHtml + "<tr class='more-row'><td colspan='2' class='text-center text-muted'>All " + result.details.total + " results are displayed</td></tr>"
                                }
                                if (skipTo == 0) {
                                    $('#' + panel.divElement.id + '-resultsTable').html(resultsHtml);
                                } else {
                                    $('#' + panel.divElement.id + '-resultsTable').append(resultsHtml);
                                }

                                $("#" + panel.divElement.id + "-more").click(function (event) {
                                    panel.search(t, (parseInt(skipTo) + parseInt(returnLimit)), returnLimit, true);
                                });

                                $('#' + panel.divElement.id + '-resultsTable').find(".jqui-draggable").draggable({
                                    appendTo: 'body',
                                    helper: 'clone',
                                    delay: 500
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
                            }
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
}(jQuery));;/*

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

;/* 
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
//        var taxonomyHtml = "<div style='height:100%;margin: 5px; overflow:auto;' class='panel panel-default' id='" + panel.divElement.id + "-mainPanel'>";
//        taxonomyHtml = taxonomyHtml + "<div class='panel-heading' id='" + panel.divElement.id + "-panelHeading'>";
//        taxonomyHtml = taxonomyHtml + "<button id='" + panel.divElement.id + "-subscribersMarker' class='btn btn-link btn-lg' style='padding: 2px; position: absolute;top: 1px;left: 0px;'><i class='glyphicon glyphicon-bookmark'></i></button>"
//        taxonomyHtml = taxonomyHtml + "<div class='row'>";
//        taxonomyHtml = taxonomyHtml + "<div class='col-md-6' id='" + panel.divElement.id + "-panelTitle'>&nbsp&nbsp&nbsp<strong><span class='i18n' data-i18n-id='i18n_taxonomy'>Taxonomy</span></strong></div>";
//        taxonomyHtml = taxonomyHtml + "<div class='col-md-6 text-right'>";
//        taxonomyHtml = taxonomyHtml + "<button id='" + panel.divElement.id + "-resetButton' class='btn btn-link' data-panel='" + panel.divElement.id + "' style='padding:2px'><i class='glyphicon glyphicon-repeat'></i></button>"
//        taxonomyHtml = taxonomyHtml + "<button id='" + panel.divElement.id + "-linkerButton' class='btn btn-link jqui-draggable linker-button' data-panel='" + panel.divElement.id + "' style='padding:2px'><i class='glyphicon glyphicon-link'></i></button>"
//        taxonomyHtml = taxonomyHtml + "<button id='" + panel.divElement.id + "-configButton' class='btn btn-link' style='padding:2px' data-target='#" + panel.divElement.id + "-configModal'><i class='glyphicon glyphicon-cog'></i></button>"
//        taxonomyHtml = taxonomyHtml + "<button id='" + panel.divElement.id + "-collapseButton' class='btn btn-link' style='padding:2px'><i class='glyphicon glyphicon-resize-small'></i></button>"
//        taxonomyHtml = taxonomyHtml + "<button id='" + panel.divElement.id + "-expandButton' class='btn btn-link' style='padding:2px'><i class='glyphicon glyphicon-resize-full'></i></button>"
//        taxonomyHtml = taxonomyHtml + "<button id='" + panel.divElement.id + "-closeButton' class='btn btn-link' style='padding:2px'><i class='glyphicon glyphicon-remove'></i></button>"
//        taxonomyHtml = taxonomyHtml + "</div>";
//        taxonomyHtml = taxonomyHtml + "</div>";
//        taxonomyHtml = taxonomyHtml + "</div>";
//        taxonomyHtml = taxonomyHtml + "<div id='" + panel.divElement.id + "-taxonomyConfigBar' style='margin-bottom: 10px;'><nav class='navbar navbar-default' role='navigation' style='min-height: 28px;border-radius: 0px;border-bottom: 1px lightgray solid;'>";
//        taxonomyHtml = taxonomyHtml + " <ul class='nav navbar-nav navbar-left'>";
//        taxonomyHtml = taxonomyHtml + "     <li class='dropdown' style='margin-bottom: 2px; margin-top: 2px;'>";
//        taxonomyHtml = taxonomyHtml + "         <a href='javascript:void(0);' class='dropdown-toggle' data-toggle='dropdown' style='padding-top: 2px; padding-bottom: 2px;'><span id='" + panel.divElement.id + "-txViewLabel'></span> <b class='caret'></b></a>";
//        taxonomyHtml = taxonomyHtml + "         <ul class='dropdown-menu' role='menu' style='float: none;'>";
//        taxonomyHtml = taxonomyHtml + "             <li><button class='btn btn-link' id='" + panel.divElement.id + "-inferredViewButton'><span class='i18n' data-i18n-id='i18n_inferred_view'>Inferred view</span></button></li>";
//        taxonomyHtml = taxonomyHtml + "             <li><button class='btn btn-link' id='" + panel.divElement.id + "-statedViewButton'><span class='i18n' data-i18n-id='i18n_stated_view'>Stated view</span></button></li>";
//        taxonomyHtml = taxonomyHtml + "         </ul>";
//        taxonomyHtml = taxonomyHtml + "     </li>";
//        taxonomyHtml = taxonomyHtml + " </ul>";
//        taxonomyHtml = taxonomyHtml + "</nav></div>";
//        taxonomyHtml = taxonomyHtml + "<div class='panel-body' style='height:100%' id='" + panel.divElement.id + "-panelBody'>";
//        taxonomyHtml = taxonomyHtml + "</div>";
//        taxonomyHtml = taxonomyHtml + "</div>";
//        $(divElement).html(taxonomyHtml);
        var context = {
            divElementId: panel.divElement.id
        }
        $.get("views/taxonomyPlugin/taxonomyPlugin-main.hbs").then(function (src) {
            var template = Handlebars.compile(src);
            $(divElement).html(template(context));
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
            $("#" + panel.divElement.id + "-linkerButton").draggable({
                cancel: false,
                appendTo: 'body',
                helper: 'clone',
                delay: 500,
                revert: false
            });

            $("#" + panel.divElement.id + "-panelBody").droppable({
                drop: panel.handleDropEvent,
                hoverClass: "bg-info"
            });

            $("#" + panel.divElement.id + "-panelHeading").droppable({
                drop: panel.handleDropEvent,
                hoverClass: "bg-info"
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
        });

    }

    this.setupParents = function(parents, focusConcept) {
        var treeHtml = "<div style='height:100%;margin-bottom: 15px;'>";
        treeHtml = treeHtml + "<ul style='list-style-type: none; padding-left: 5px;'>";
        var lastParent;
        $.each(parents, function(i, parent) {
            lastParent = parent;
            treeHtml = treeHtml + "<li data-concept-id='" + parent.conceptId + "' data-term='" + parent.defaultTerm + "' class='treeLabel'>";
            treeHtml = treeHtml + "<button class='btn btn-link btn-xs treeButton' style='padding:2px'><i class='glyphicon glyphicon-chevron-up treeButton'  id='" + panel.divElement.id + "-treeicon-" + parent.conceptId + "'></i></button>";
            if (parent.definitionStatus == "Primitive") {
                treeHtml = treeHtml + '<span class="badge alert-warning">&nbsp;</span>&nbsp;&nbsp;';
            } else {
                treeHtml = treeHtml + '<span class="badge alert-warning">&equiv;</span>&nbsp;&nbsp;';
            }
            treeHtml = treeHtml + '<a href="javascript:void(0);" style="color: inherit;text-decoration: inherit;"><span data-concept-id="' + parent.conceptId + '" data-term="' + parent.defaultTerm + '" class="jqui-draggable treeLabel selectable-row" id="' + panel.divElement.id + '-treenode-' + parent.conceptId + '">' + parent.defaultTerm + '</span></a>';
            treeHtml = treeHtml + "</li>";
        });
        if (parents.length > 0) {
            treeHtml = treeHtml.slice(0, -5);
        }
        treeHtml = treeHtml + "<ul style='list-style-type: none; padding-left: 15px;'>";
        treeHtml = treeHtml + "<li data-concept-id='" + focusConcept.conceptId + "' data-term='" + focusConcept.defaultTerm + "' class='treeLabel'>";
        treeHtml = treeHtml + "<button class='btn btn-link btn-xs treeButton' style='padding:2px'><i class='glyphicon glyphicon-chevron-right treeButton'  id='" + panel.divElement.id + "-treeicon-" + focusConcept.conceptId + "'></i></button>";
        if (focusConcept.definitionStatus == "Primitive") {
            treeHtml = treeHtml + '<span class="badge alert-warning">&nbsp;</span>&nbsp;&nbsp;';
        } else {
            treeHtml = treeHtml + '<span class="badge alert-warning">&equiv;</span>&nbsp;&nbsp;';
        }
        treeHtml = treeHtml + '<a href="javascript:void(0);" style="color: inherit;text-decoration: inherit;"><span data-concept-id="' + focusConcept.conceptId + '" data-term="' + focusConcept.defaultTerm + '" class="jqui-draggable treeLabel selectable-row" id="' + panel.divElement.id + '-treenode-' + focusConcept.conceptId + '">' + focusConcept.defaultTerm + "</span></a>";
        treeHtml = treeHtml + "</li>";
        treeHtml = treeHtml + "</ul>";
        if (parents.length > 0) {
            treeHtml = treeHtml + "</li>";
        }
        treeHtml = treeHtml + "</ul>";
        treeHtml = treeHtml + "</div>";
        $("#" + panel.divElement.id + "-panelBody").html(treeHtml);

        $(".treeButton").disableTextSelect();

        $('.jqui-draggable').draggable({
            appendTo: 'body',
            helper: 'clone',
            delay: 500
        });
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
    }

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
            var nodeHtml = "<ul style='list-style-type: none; padding-left: 15px;'>";
            result.sort(function(a, b) {
                if (a.defaultTerm.toLowerCase() < b.defaultTerm.toLowerCase())
                    return -1;
                if (a.defaultTerm.toLowerCase() > b.defaultTerm.toLowerCase())
                    return 1;
                return 0;
            })
            //console.log(JSON.stringify(result));
            var listIconIds = [];
            $.each(result, function(i, field) {
                if (field.active == true) {
                    nodeHtml = nodeHtml + "<li data-concept-id='" + field.conceptId + "' data-term='" + field.defaultTerm + "' class='treeLabel'>";
                    nodeHtml = nodeHtml + "<button class='btn btn-link btn-xs treeButton' style='padding:2px'><i class='glyphicon glyphicon-chevron-right treeButton' id='" + panel.divElement.id + "-treeicon-" + field.conceptId + "'></i></button>";
                    if (field.definitionStatus == "Primitive") {
                        nodeHtml = nodeHtml + '<span class="badge alert-warning">&nbsp;</span>&nbsp;&nbsp;';
                    } else {
                        nodeHtml = nodeHtml + '<span class="badge alert-warning">&equiv;</span>&nbsp;&nbsp;';
                    }
                    nodeHtml = nodeHtml + '<a href="javascript:void(0);" style="color: inherit;text-decoration: inherit;"><span class="jqui-draggable treeLabel selectable-row" data-concept-id="' + field.conceptId + '" data-term="' + field.defaultTerm + '" id="' + panel.divElement.id + '-treenode-' + field.conceptId + '">' + field.defaultTerm + '</span></a>';
                    listIconIds.push(field.conceptId);
                }
            });
            nodeHtml = nodeHtml + "</li>";
            nodeHtml = nodeHtml + "</ul>";
            $("#" + panel.divElement.id + "-treeicon-" + conceptId).removeClass("glyphicon-refresh");
            $("#" + panel.divElement.id + "-treeicon-" + conceptId).removeClass("icon-spin");
            if (result.length > 0) {
                $("#" + panel.divElement.id + "-treeicon-" + conceptId).addClass("glyphicon-chevron-down");
            } else {
                $("#" + panel.divElement.id + "-treeicon-" + conceptId).addClass("glyphicon-minus");
            }
            $("#" + panel.divElement.id + "-treenode-" + conceptId).after(nodeHtml);
            $(".treeButton").disableTextSelect();
            //console.log(JSON.stringify(listIconIds));
            $.each(listIconIds, function(i, nodeId) {
                $('#' + panel.divElement.id + "-treenode-" + nodeId).draggable({
                    appendTo: 'body',
                    helper: 'clone',
                    delay: 500,
                    revert: false
                });
            });
        }).fail(function() {
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
                        parentLiHtml = parentLiHtml + '<a href="javascript:void(0);" style="color: inherit;text-decoration: inherit;"><span data-concept-id="' + parent.conceptId + '" data-term="' + parent.defaultTerm + '" class="jqui-draggable treeLabel selectable-row" id="' + panel.divElement.id + '-treenode-' + parent.conceptId + '">' + parent.defaultTerm + '</span></a>';
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

(function($) {
    $.fn.addTaxonomy = function(options) {
        this.filter("div").each(function() {
            var tx = new conceptDetails(this, options);
        });
    };
}(jQuery));
