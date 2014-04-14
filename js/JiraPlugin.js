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
    var issueTypeXhr = null;
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


        // load attributes
        if (xhr != null) {
            xhr.abort();
            console.log("aborting call...");
        }
        // load attributes
        if (issueTypeXhr != null) {
            issueTypeXhr.abort();
            console.log("aborting call...");
        }
        //LOAD ISSUE TYPES
        issueTypeXhr = $.getJSON(options.serverUrl + "/jira/issueTypes", function (result) {

        }).done(function (result) {
            console.log("issue types loaded")
            result.forEach(function (issueType) {
                var issueTypeOption = $(document.createElement("option"));
                issueTypeOption.attr("value", issueType.id);
                issueTypeOption.html(issueType.name);
                $('#create_issue_issue_types').append(issueTypeOption);
            });

        }).fail(function () {
            $('#' + panel.attributesPId).html("<div class='alert alert-danger'><span class='i18n' data-i18n-id='i18n_ajax_failed'><strong>Error</strong> while retrieving data from server...</span></div>");
        });

        var projects = $("#create_issue_projects");
        var opitions_default_projects = $("#opitions_default_projects");
        //INITIALIZE PROJECT OPTIONS
        xhr = $.getJSON(options.serverUrl + "/jira/projects", function (result) {

        }).done(function (result) {
            console.log("Projects loaded")
            result.forEach(function (project) {
                var projectOption = $(document.createElement("option"));
                projectOption.attr("value", project.id);
                projectOption.html(project.key + ' - ' + project.name);
                opitions_default_projects.append(projectOption);
                var projectOption = $(document.createElement("option"));
                projectOption.attr("value", project.id);
                projectOption.html(project.key + ' - ' + project.name);
                projects.append(projectOption);

            });
            opitions_default_projects.val(options.defaultProjectId);
            projects.val(options.defaultProjectId);
        }).fail(function () {
            $('#' + panel.attributesPId).html("<div class='alert alert-danger'><span class='i18n' data-i18n-id='i18n_ajax_failed'><strong>Error</strong> while retrieving data from server...</span></div>");
        });

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

    function searchConceptIssues(issuesListGroup, currentConceptId) {
//LOADING LIST ITEM
        var issueLoadingListItem = $(document.createElement("a"));
        issuesListGroup.html("");
        var loadingSpan = $(document.createElement("span"));
        loadingSpan.addClass("glyphicon");
        loadingSpan.addClass("glyphicon-refresh");
        loadingSpan.addClass("icon-spin");

        issueLoadingListItem.addClass("list-group-item");
        issueLoadingListItem.attr("href", "#");
        issueLoadingListItem.append(loadingSpan);
        issueLoadingListItem.append(" Loading concept issues.");

        issuesListGroup.append(issueLoadingListItem);

        issueTypeXhr = $.getJSON(options.serverUrl + "/jira/issues/" + options.defaultProjectName + '/' + currentConceptId, function (result) {

        }).done(function (result) {
            issuesListGroup.html("");
            if (result.total > 0) {
                result.issues.forEach(function (issue) {
                    console.log(JSON.stringify(issue));
                    var issueListItem = $(document.createElement("a"));
                    issueListItem.addClass("list-group-item");
                    issueListItem.attr("href", "#");
                    issueListItem.html(issue.fields.summary);

                    issuesListGroup.append(issueListItem);
                });
            } else {
                issueLoadingListItem.html("No issues found for selected concept");
                issuesListGroup.append(issueLoadingListItem);
            }
        }).fail(function () {
            $('#' + panel.attributesPId).html("<div class='alert alert-danger'><span class='i18n' data-i18n-id='i18n_ajax_failed'><strong>Error</strong> while retrieving data from server...</span></div>");
        });
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


        var container = $('#' + panel.divElement.id + "-panelBody");
        container.html("");
        //MAIN WRAPPER
        var mainWrapper = $(document.createElement("div"));
        mainWrapper.addClass("col-md-12");

        //CREATE ROW CONTAING PROJECT FORM GROUP
        var toolBarRow = $(document.createElement("div"));
        toolBarRow.addClass("row");
        toolBarRow.css("margin-bottom", "10px");
        var toolbarCol = $(document.createElement("div"));
        toolbarCol.addClass("col-xs-12");


        //CREATE ROW FOR ACTIVE CONCEPT
        var conceptRow = $(document.createElement("div"));
        conceptRow.addClass("row");
        conceptRow.css("margin-bottom", "10px");
        var conceptCol = $(document.createElement("div"));
        conceptCol.addClass("col-xs-12");
        conceptRow.append(conceptCol);

        var conceptPlaceHolder = $(document.createElement("h4"));
        conceptPlaceHolder.addClass('jqui-droppable');
        conceptPlaceHolder.addClass('ui-droppable');
        conceptPlaceHolder.css("height", "40px");
        conceptPlaceHolder.css("border", "1px solid red");
        conceptPlaceHolder.css("border-radius", "4px");

        conceptCol.append(conceptPlaceHolder);


        //CREATE ROW FOR CONCEPT ISSUES
        var concpetIssuesRow = $(document.createElement("div"));
        concpetIssuesRow.addClass("row");

        concpetIssuesRow.css("margin-bottom", "10px");
        var conceptIssueColumn = $(document.createElement("div"));
        conceptIssueColumn.addClass("col-xs-12");

        var issuesListGroup = $(document.createElement("div"));
        issuesListGroup.addClass("list-group");

        conceptIssueColumn.append(issuesListGroup);
        concpetIssuesRow.append(conceptIssueColumn);


        //CREATE ISSUE BUTTON
        var createIssueButton = $(document.createElement("button"));
        createIssueButton.addClass("btn btn-default pull-right");
        createIssueButton.html("Create Issue");
        createIssueButton.attr("data-toggle", "modal");
        createIssueButton.attr("data-target", "#createIssueModal");
        createIssueButton.attr("disabled", "disabled");

        mainWrapper.append(toolBarRow);
        mainWrapper.append(conceptRow);
        mainWrapper.append(concpetIssuesRow);
        mainWrapper.append(createIssueButton);
        mainWrapper.css("padding-top", "10px");
        mainWrapper.css("padding-bottom", "10px");


        //CONTROLLER FUNCTIONS
        var container = $('#' + panel.divElement.id + "-panelBody");
        container.append(mainWrapper);
        $(createIssueModal).appendTo($(divElement));

        //CREATE ISSUE MODAL CREATE BUTTON
        $('#crete_issue_button').click(function () {
            var summary = $('#create_issue_summary').val();
            var validationFaild = false;
            if (!summary || summary === '' || summary.trim() === '') {
                console.log('empty summary');
                validationFaild = true;
                $('#summary_form_group').addClass('has-error');
                $('#summary_form_group').keyup(function () {
                    $('#summary_form_group').removeClass("has-error")
                });
            }
            console.log($('#create_issue_summary').val());
            if (!validationFaild) {

                var newIssue = {};

                var newIssue = {
                    'fields': {
                        project: {id: $('#create_issue_projects').val()},
                        summary: summary,
                        issuetype: {id: $('#create_issue_issue_types').val()},
                        customfield_10570: parseFloat($('#create_issue_conceptid').val())
                    }
                }

                $.ajax({
                    type: 'POST',
                    data: newIssue,
                    url: options.serverUrl + '/jira/issues',
                    dataType: 'JSON'
                }).done(function (response) {
                    searchConceptIssues(issuesListGroup, currentConceptId);
                    $("#createIssueModal").modal('hide');
                });
            }
        });

        var currentConceptId = '';
        conceptPlaceHolder.droppable({
            drop: function (event, ui) {
                var draggable = ui.draggable;
                //console.log(draggable.html() + " |  " + draggable.attr('data-concept-id') + ' was dropped onto me!');
                if (draggable.attr('data-concept-id')) {
                    console.log("OK : " + draggable.attr('data-concept-id') + ' ' + draggable.attr('data-term'));
                    conceptPlaceHolder.html(draggable.attr('data-concept-id') + ' ' + draggable.attr('data-term'));
                    createIssueButton.removeAttr("disabled");
                    currentConceptId = draggable.attr('data-concept-id');
                    $('#create_issue_conceptid').attr("disabled", "disabled")
                    $('#create_issue_conceptid').val(currentConceptId);
                    searchConceptIssues(issuesListGroup, currentConceptId);
                }
            },
            hoverClass: "bg-info"
        });

    }

    this.createIssue = function () {

    }
    var createIssueModal = '<div class="modal fade" id="createIssueModal">' +
        '<div class="modal-dialog">' +
        '<div class="modal-content">' +
        '       <div class="modal-header">' +
        '           <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>' +
        '           <h4 class="modal-title">Create Issue</h4>' +
        '       </div>' +
        '       <div class="modal-body" id="createIssueModalContent">' +
        '<form id="createIssueForm" name="createIssueForm" class="css-form">' +
        '   <div class="form-group">' +
        '       <label class="control-label">Project</label>' +
        '       <select class="form-control" id="create_issue_projects">' +
        '       </select>' +
        '   </div>' +
        '   <div class="form-group">' +
        '       <label class="control-label">Concpet ID</label>' +
        '       <input type="number" class="form-control" id="create_issue_conceptid">' +
        '   </div>' +
        '   <div class="form-group" id="summary_form_group">' +
        '       <label class="control-label" for="create_issue_summary">Summary</label>' +
        '       <input type="text" class="form-control" required="required" id="create_issue_summary">' +
        '   </div>' +
        '   <div class="form-group">' +
        '       <label class="control-label">Project</label>' +
        '       <select class="form-control" id="create_issue_issue_types">' +
        '       </select>' +
        '   </div>' +
        '</form>' +
        '       </div>' +
        '       <div class="modal-footer">' +
        '           <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>' +
        '           <button type="button" class="btn btn-primary" id="crete_issue_button">Create issue</button>' +
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
        //DEFAULT PROJECT ROW
        var defaultProjectRow = $(document.createElement("div"));
        var defaultProjectCol = $(document.createElement("div"));
        defaultProjectCol.addClass("form-group");
        var defaultProjectLabel = $(document.createElement("label"));
        defaultProjectLabel.html("Default Project");

        var projectSelect = $(document.createElement("select"));
        projectSelect.addClass("form-control");
        projectSelect.attr("id", "opitions_default_projects");

        projectSelect.on("change", function (element) {

        });

        defaultProjectCol.append(defaultProjectLabel);
        defaultProjectCol.append(projectSelect);

        defaultProjectRow.append(defaultProjectCol);


        $("#" + panel.divElement.id + "-modal-body").append(defaultProjectRow);
    }

    this.readOptionsPanel = function () {
        var projects = $("#create_issue_projects");
        var opitions_default_projects = $("#opitions_default_projects");
        options.defaultProjectId = opitions_default_projects.val();
        opitions_default_projects.val(options.defaultProjectId);
        projects.val(options.defaultProjectId);
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



