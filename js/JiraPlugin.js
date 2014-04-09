$(function () {
    $.extend($.fn.disableTextSelect = function () {
        return this.each(function () {
            $(this).mousedown(function () {
                return false;
            });
        });
    });
    $('.noSelect').disableTextSelect(); //No text selection on elements with a class of 'noSelect'
});
function jiraPlugin(divElement, conceptId, options) {

    if (typeof componentsRegistry == "undefined") {
        componentsRegistry = [];
    }

    var panel = this;
    this.type = "jira-issues";
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

    componentLoaded = false;
    $.each(componentsRegistry, function (i, field) {
        if (field.divElement.id == panel.divElement.id) {
            componentLoaded = true;
        }
    });
    if (componentLoaded == false) {
        componentsRegistry.push(panel);
    }


    this.getConceptId = function () {
        return this.conceptId;
    }

    this.getDivId = function () {
        return this.divId;
    }

    this.setupCanvas = function () {
        panel.attributesPId = panel.divElement.id + "-attributes-panel";
        panel.descsPId = panel.divElement.id + "-descriptions-panel";
        panel.relsPId = panel.divElement.id + "-rels-panel";
        panel.childrenPId = panel.divElement.id + "-children-panel";
        panel.defaultTerm = "";
        $(divElement).html();
        // main panel
        detailsHtml = "<div style='margin: 5px; height:98%; overflow:auto;' class='panel panel-default'>";
        detailsHtml = detailsHtml + "<div class='panel-heading' id='" + panel.divElement.id + "-panelHeading'>";
        detailsHtml = detailsHtml + "<button id='" + panel.divElement.id + "-subscribersMarker' class='btn btn-link btn-lg' style='padding:2px;position: absolute;top: 1px;left: 0px;'><i class='glyphicon glyphicon-bookmark'></i></button>"
        detailsHtml = detailsHtml + "<div class='row'>";
        detailsHtml = detailsHtml + "<div class='col-md-8' id='" + panel.divElement.id + "-panelTitle'>&nbsp&nbsp&nbsp<strong><span class='i18n' data-i18n-id='i18n_concept_details'>Jira Plugin</span></strong></div>";
        detailsHtml = detailsHtml + "<div class='col-md-4 text-right'>";
        detailsHtml = detailsHtml + "<button id='" + panel.divElement.id + "-linkerButton' class='btn btn-link jqui-draggable linker-button' data-panel='" + panel.divElement.id + "' style='padding:2px'><i class='glyphicon glyphicon-link'></i></button>"
        detailsHtml = detailsHtml + "<button id='" + panel.divElement.id + "-historyButton' class='btn btn-link history-button' style='padding:2px'><i class='glyphicon glyphicon-time'></i></button>"
        detailsHtml = detailsHtml + "<button id='" + panel.divElement.id + "-configButton' class='btn btn-link' data-toggle='modal' style='padding:2px' data-target='#" + panel.divElement.id + "-configModal'><i class='glyphicon glyphicon-cog'></i></button>"
        detailsHtml = detailsHtml + "<button id='" + panel.divElement.id + "-collapseButton' class='btn btn-link' style='padding:2px'><i class='glyphicon glyphicon-resize-small'></i></button>"
        detailsHtml = detailsHtml + "<button id='" + panel.divElement.id + "-expandButton' class='btn btn-link' style='padding:2px'><i class='glyphicon glyphicon-resize-full'></i></button>"
        detailsHtml = detailsHtml + "<button id='" + panel.divElement.id + "-closeButton' class='btn btn-link' style='padding:2px'><i class='glyphicon glyphicon-remove'></i></button>"
        detailsHtml = detailsHtml + "</div>";
        detailsHtml = detailsHtml + "</div>";
        detailsHtml = detailsHtml + "</div>";
        detailsHtml = detailsHtml + "<div class='panel-body' id='" + panel.divElement.id + "-panelBody'>";
        detailsHtml = detailsHtml + "</div>";
        // modal config panel
        detailsHtml = detailsHtml + "<div class='modal fade' id='" + panel.divElement.id + "-configModal'>";
        detailsHtml = detailsHtml + "<div class='modal-dialog'>";
        detailsHtml = detailsHtml + "<div class='modal-content'>";
        detailsHtml = detailsHtml + "<div class='modal-header'>";
        detailsHtml = detailsHtml + "<button type='button' class='close' data-dismiss='modal' aria-hidden='true'>&times;</button>";
        detailsHtml = detailsHtml + "<h4 class='modal-title'><span class='i18n' data-i18n-id='i18n_options'>Options</span> (" + panel.divElement.id + ")</h4>";
        detailsHtml = detailsHtml + "</div>";
        detailsHtml = detailsHtml + "<div class='modal-body' id='" + panel.divElement.id + "-modal-body'>";
        detailsHtml = detailsHtml + "<p></p>";
        detailsHtml = detailsHtml + "</div>";
        detailsHtml = detailsHtml + "<div class='modal-footer'>";
        detailsHtml = detailsHtml + "<button type='button' class='btn btn-danger' data-dismiss='modal'><span class='i18n' data-i18n-id='i18n_cancel'>Cancel</span></button>";
        detailsHtml = detailsHtml + "<button id='" + panel.divElement.id + "-apply-button' type='button' class='btn btn-success' data-dismiss='modal'><span class='i18n' data-i18n-id='i18n_apply_changes'>Apply changes</span></button>";
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

        $("#" + panel.divElement.id + "-closeButton").click(function (event) {
            $(divElement).remove();
        });

        if (typeof panel.options.closeButton != "undefined" && panel.options.closeButton == false) {
            $("#" + panel.divElement.id + "-closeButton").hide();
        }

        if (typeof panel.options.linkerButton != "undefined" && panel.options.linkerButton == false) {
            $("#" + panel.divElement.id + "-linkerButton").hide();
        }

        if (typeof panel.options.collapseButton != "undefined" && panel.options.collapseButton == false) {
            $("#" + panel.divElement.id + "-expandButton").hide();
            $("#" + panel.divElement.id + "-collapseButton").hide();
        }

        $("#" + panel.divElement.id + "-expandButton").click(function (event) {
            $("#" + panel.divElement.id + "-panelBody").slideDown("fast");
            $("#" + panel.divElement.id + "-expandButton").hide();
            $("#" + panel.divElement.id + "-collapseButton").show();
            $("#" + panel.divElement.id + "-panelTitle").html("&nbsp&nbsp&nbsp<strong>Concept Details</strong>");
        });

        $("#" + panel.divElement.id + "-collapseButton").click(function (event) {
            $("#" + panel.divElement.id + "-panelBody").slideUp("fast");
            $("#" + panel.divElement.id + "-expandButton").show();
            $("#" + panel.divElement.id + "-collapseButton").hide();
            //if (panel.defaultTerm.length > 25) {
            //    $("#" + panel.divElement.id + "-panelTitle").html("<strong>Concept Details: " + panel.defaultTerm.substring(0, 24).trim() + "...</strong>");
            //} else {
            $("#" + panel.divElement.id + "-panelTitle").html("&nbsp&nbsp&nbsp<strong>Concept Details: " + panel.defaultTerm + "</strong>");
            //}
        });

        $("#" + panel.divElement.id + "-historyButton").click(function (event) {
            $("#" + panel.divElement.id + "-historyButton").popover({
                trigger: 'manual',
                placement: 'bottomRight',
                html: true,
                content: function () {
                    historyHtml = '<div style="height:100px;overflow:auto;">';
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
        $("#" + panel.divElement.id + "-linkerButton").tooltip({
            placement: 'left',
            trigger: 'hover',
            title: i18n_panel_links,
            animation: true,
            delay: 1000
        });

        $("#" + panel.divElement.id + "-apply-button").click(function () {
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

        $("#" + panel.divElement.id + "-linkerButton").click(function (event) {
            $("#" + panel.divElement.id + "-linkerButton").popover({
                trigger: 'manual',
                placement: 'bottomRight',
                html: true,
                content: function () {
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

    this.handleDropEvent = function (event, ui) {
        var draggable = ui.draggable;
        //console.log(draggable.html() + " |  " + draggable.attr('data-concept-id') + ' was dropped onto me!');
        if (!draggable.attr('data-concept-id')) {
            if (!draggable.attr('data-panel')) {
                //console.log("ignore");
            } else {
                //console.log("OK : " + draggable.attr('data-panel'));
                $.each(componentsRegistry, function (i, field) {
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

    this.updateCanvas = function () {
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
        xhr = $.getJSON(options.serverUrl + "/jira/projects", function (result) {

        }).done(function (result) {
            console.log(result);

            //MAIN WRAPPER
            var mainWrapper = $(document.createElement("div"));
            mainWrapper.addClass("col-md-12");

            var toolBarRow = $(document.createElement("div"));
            toolBarRow.addClass("row");
            toolBarRow.css("margin-bottom", "10px");
            var toolbarCol = $(document.createElement("div"));
            toolbarCol.addClass("col-xs-12");

            //CREATE ISSUE BUTTON
            var createIssueButton = $(document.createElement("button"));
            createIssueButton.addClass("btn btn-default pull-right");
            createIssueButton.html("Create Issue");
            createIssueButton.attr("data-toggle", "modal");
            createIssueButton.attr("data-target", "#createIssueModal");


            //PROJECT FORMGROUP
            var projectListFG = $(document.createElement("div"));
            projectListFG.addClass("form-group");

            //PROJECT LABEL
            var projectListLabel = $(document.createElement("label"));
            projectListLabel.addClass("control-label")
            projectListLabel.html("Projects")

            //PROJECT LIST
            var projectsList = $(document.createElement("select"));
            projectsList.addClass("form-control")

            result.forEach(function (project) {
                var projectOption = $(document.createElement("option"));
                projectOption.attr("value", project.id);
                projectOption.html(project.key + ' ' + project.name);
                projectsList.append(projectOption);
            });
            projectListFG.append(projectListLabel);
            projectListFG.append(projectsList);
            toolbarCol.append(projectListFG);
            toolbarCol.append(createIssueButton);
            toolBarRow.append(toolbarCol);

            var contentBody = document.createElement("div");
            var test = $(contentBody);
            var span = $(document.createElement("span"));
            span.html(result)
            test.append(span);

            mainWrapper.append(toolBarRow);
            mainWrapper.append(test);
            mainWrapper.css("padding-top", "10px");
            mainWrapper.css("padding-bottom", "10px");

            var container = $('#' + panel.divElement.id + "-panelBody");
            container.append(mainWrapper);
            $(createIssueModal).appendTo("body");
        }).fail(function () {
            $('#' + panel.attributesPId).html("<div class='alert alert-danger'><span class='i18n' data-i18n-id='i18n_ajax_failed'><strong>Error</strong> while retrieving data from server...</span></div>");
        });
    }


    var createIssueModal = '<div class="modal fade" id="createIssueModal">' +
        '<div class="modal-dialog">' +
        '<div class="modal-content">' +
        '<div class="modal-header">' +
        '         <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>' +
        '           <h4 class="modal-title">Modal title</h4>' +
        '       </div>' +
        '       <div class="modal-body" id="createIssueModalContent">' +
        '<form id="createIssueForm" name="createIssueForm">}' +
        '<div class="form-group">' +
        '<input type="text">' +
        '</div>' +
        '</form>' +
        '       </div>' +
        '       <div class="modal-footer">' +
        '           <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>' +
        '           <button type="button" class="btn btn-primary">Save changes</button>' +
        '       </div>' +
        '   </div>' +
        ' </div>' +
        '</div>';


    this.setSubscription = function (subscriptionPanel) {
        panel.subscription = subscriptionPanel;
        $("#" + panel.divElement.id + "-subscribersMarker").css('color', subscriptionPanel.markerColor);
        $("#" + panel.divElement.id + "-subscribersMarker").show();
    }

    this.clearSubscription = function () {
        panel.subscription = null;
        $("#" + panel.divElement.id + "-subscribersMarker").hide();
    }


    this.setupOptionsPanel = function () {
        optionsHtml = '<form role="form" id="' + panel.divElement.id + '-options-form">';
        optionsHtml = optionsHtml + '<div class="form-group">';
        optionsHtml = optionsHtml + '<label for="displaySynonyms"><span class="i18n" data-i18n-id="i18n_display_synonyms">Display synonyms</span></label>';
        optionsHtml = optionsHtml + '<div class="radio">';
        optionsHtml = optionsHtml + '<label>';
        if (panel.options.displaySynonyms == true) {
            optionsHtml = optionsHtml + '<input type="radio" name="displaySynonyms" id="' + panel.divElement.id + '-displaySynonymsYes" value=true checked>';
        } else {
            optionsHtml = optionsHtml + '<input type="radio" name="displaySynonyms" id="' + panel.divElement.id + '-displaySynonymsYes" value=true>';
        }
        optionsHtml = optionsHtml + '<span class="i18n" data-i18n-id="i18n_display_synonyms2">Display Synonyms along with FSN and preferred terms</span>.';
        optionsHtml = optionsHtml + '</label>';
        optionsHtml = optionsHtml + '</div>';
        optionsHtml = optionsHtml + '<div class="radio">';
        optionsHtml = optionsHtml + '<label>';
        if (panel.options.displaySynonyms == true) {
            optionsHtml = optionsHtml + '<input type="radio" name="displaySynonyms" id="' + panel.divElement.id + '-displaySynonymsNo" value=false>';
        } else {
            optionsHtml = optionsHtml + '<input type="radio" name="displaySynonyms" id="' + panel.divElement.id + '-displaySynonymsNo" value=false checked>';
        }
        optionsHtml = optionsHtml + '<span class="i18n" data-i18n-id="i18n_display_synonyms3">Only display FSN and preferred terms</span>.';
        optionsHtml = optionsHtml + '</label>';
        optionsHtml = optionsHtml + '</div>';
        optionsHtml = optionsHtml + '</div>';
        optionsHtml = optionsHtml + '<div class="form-group">';
        optionsHtml = optionsHtml + '<label for="displayIds"><span class="i18n" data-i18n-id="i18n_display_ids">Display Ids</span></label>';
        optionsHtml = optionsHtml + '<div class="radio">';
        optionsHtml = optionsHtml + '<label>';
        if (panel.options.showIds == true) {
            optionsHtml = optionsHtml + '<input type="radio" name="displayIds" id="' + panel.divElement.id + '-displayIdsYes" value=true checked>';
        } else {
            optionsHtml = optionsHtml + '<input type="radio" name="displayIds" id="' + panel.divElement.id + '-displayIdsYes" value=true>';
        }
        optionsHtml = optionsHtml + '<span class="i18n" data-i18n-id="i18n_display_ids">Display Ids</span>.';
        optionsHtml = optionsHtml + '</label>';
        optionsHtml = optionsHtml + '</div>';
        optionsHtml = optionsHtml + '<div class="radio">';
        optionsHtml = optionsHtml + '<label>';
        if (panel.options.showIds == true) {
            optionsHtml = optionsHtml + '<input type="radio" name="displayIds" id="' + panel.divElement.id + '-displayIdsNo" value=false>';
        } else {
            optionsHtml = optionsHtml + '<input type="radio" name="displayIds" id="' + panel.divElement.id + '-displayIdsNo" value=false checked>';
        }
        optionsHtml = optionsHtml + '<span class="i18n" data-i18n-id="i18n_hide_ids">Hide Ids for all components</span>.';
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
        optionsHtml = optionsHtml + '<div class="checkbox">';
        optionsHtml = optionsHtml + '<label>';
        if (panel.options.displayChildren == false) {
            optionsHtml = optionsHtml + '<input type="checkbox" id="' + panel.divElement.id + '-childrenOption"> <span class="i18n" data-i18n-id="i18n_display_children">Display children</span>';
        } else {
            optionsHtml = optionsHtml + '<input type="checkbox" id="' + panel.divElement.id + '-childrenOption" checked> <span class="i18n" data-i18n-id="i18n_display_children">Display children</span>';
        }
        optionsHtml = optionsHtml + '</label>';
        optionsHtml = optionsHtml + '</div>';
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
        optionsHtml = optionsHtml + '</select>';
        optionsHtml = optionsHtml + '</div>';
        optionsHtml = optionsHtml + '</form>';
        $("#" + panel.divElement.id + "-modal-body").html(optionsHtml);
    }

    this.readOptionsPanel = function () {
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
    $.each(componentsRegistry, function (i, field) {
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
    $.each(componentsRegistry, function (i, field) {
        if (field.divElement.id == divElementId1) {
            d1 = field;
        } else if (field.divElement.id == divElementId2) {
            d2 = field;
        }
    });
    d1.unsubscribe(d2);
    $(d2.divElement).find('.linker-button').popover('toggle');
}

(function ($) {
    $.fn.addJiraPanel = function (conceptId, options) {
        this.filter("div").each(function () {
            var jira = new jiraPanel(this, conceptId, options);
            jira.setupCanvas();
        });
    };
}(jQuery));

$(document).keypress(function (event) {
        if (event.which == '13') {
            event.preventDefault();
        }
    }
);



