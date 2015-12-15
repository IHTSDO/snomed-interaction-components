/**
 * Created by termmed on 9/1/14.
 */

function queryComputerPanel(divElement, options) {
    var panel = this;
    panel.showId = false;
    var limit = 100;
    var skip = 0;
    var xhrTotal = null;
    var xhrExecute = null;

    this.divElement = divElement;
    this.options = jQuery.extend(true, {}, options);
    this.type = "query-computer";
    panel.subscribers = [];
    panel.totalResults = [];

    if (!componentsRegistry){
        componentsRegistry = [];
        componentsRegistry.push(panel);
    }else{
        var componentLoaded = false;
        $.each(componentsRegistry, function(i, field) {
            if (field.divElement && field.divElement.id == panel.divElement.id) {
                componentLoaded = true;
            }
        });
        if (componentLoaded == false) {
            componentsRegistry.push(panel);
        }
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
    //panel.markerColor = panel.getNextMarkerColor(globalMarkerColor);
    panel.markerColor = "asdasdasdas";

    this.updateCanvas = function (data, showInPublish){
        if (showInPublish)
            panel.showId = data.id;
        $("#" + panel.divElement.id + "-li").find("a").first().click();
        $("#newQuery").modal("hide");
        $("#" + panel.divElement.id + "-QueryManagerModal").modal("hide");
        $('#' + panel.divElement.id + '-queryTesterTitle').attr("data-temp", "false");
        $('#' + panel.divElement.id + '-queryTesterTitle').html("Name: " + data.name);
        $('#' + panel.divElement.id + '-queryTesterDescription').html("Description: " + data.description);
        $('#' + panel.divElement.id + '-listGroup').html(data.queryJson);
        $("#" + panel.divElement.id + "-saveChanges").attr("data-id", data.id);
        var textSave = "Save changes";
        if (window["i18n_save_changes"])
            textSave = window["i18n_save_changes"];
        $("#" + panel.divElement.id + "-saveChanges").html("<span class='i18n' data-i18n-id='i18n_save_changes'>" + textSave + "</span>");
        if (options.previewQuery)
            $(divElement).find(".removeLi").hide();
        $(divElement).find(".removeLi").unbind();
        $(divElement).find(".removeLi").disableTextSelect();
        $(divElement).find(".removeLi").click(function(e){
            $(e.target).closest("li").remove();
            panel.renumLines();
        });
    }

    this.subscribe = function(panelToSubscribe) {
        var panelId = panelToSubscribe.divElement.id;
        var alreadySubscribed = false;
        if (!alreadySubscribed) {
            var subscription = channel.subscribe(panelId, function(data, envelope) {
                if (data){
                    panel.updateCanvas(data);
                }
            });
        }
        $("#" + panelId + "-ownMarker").show();
        $("#" + panel.divElement.id + "-subscribersMarker").show();
        $("#" + panelId + "-ownMarker").show();
    }

    this.setUpPanel = function (){
        var context = {
            divElementId: panel.divElement.id
        };
        $(divElement).html(JST["views/developmentQueryPlugin/main.hbs"](context));

        var bindAddCriteriaFunction = function(){
            $(divElement).find(".addCriteria").unbind();
            $(divElement).find(".addCriteria").disableTextSelect();
            $(divElement).find(".addCriteria").click(function(e){
                $(e.target).closest("div").hide();
                var criteria = $('#' + panel.divElement.id + '-selectedCriteria').html();
                $(e.target).closest(".form-inline").append(JST["views/developmentQueryPlugin/andCriteria.hbs"]({criteria: criteria}));
                $(divElement).find(".addedCriteria").find("a[data-role='criteria-selector']").unbind();
                $(divElement).find(".addedCriteria").find("a[data-role='criteria-selector']").click(function (e) {
                    $(e.target).closest(".dropdown").find("span").first().html($(e.target).html());
                });
                bindAddCriteriaFunction();
            });
        };
        bindAddCriteriaFunction();

        $('#' + panel.divElement.id + '-addCriteriaAnd').unbind();

        $('#' + panel.divElement.id + '-clearButton').unbind();
        $('#' + panel.divElement.id + '-clearButton').disableTextSelect();
        $('#' + panel.divElement.id + '-clearButton').click(function(){
            panel.setUpPanel();
        });

        $('#' + panel.divElement.id + '-copyConstraint').unbind();
        $("#" + panel.divElement.id + "-copyConstraint").disableTextSelect();
        var clientGrammar = new ZeroClipboard( document.getElementById(panel.divElement.id + "-copyConstraint") );
        clientGrammar.on( "ready", function( readyEvent ) {
            clientGrammar.on( "copy", function (event) {
//                var grammar = panel.exportToConstraintGrammar(false, fullSyntax);
                //console.log(grammar);
                $("#" + panel.divElement.id + "-copyConstraint").addClass("animated rubberBand");
                window.setTimeout( function(){
                    $("#" + panel.divElement.id + "-copyConstraint").removeClass('animated rubberBand');
                }, 1000);
                alertEvent("Constraint Grammar copied to clipboard", "success");
                var clipboard = event.clipboardData;
                clipboard.setData("text/plain", panel.grammarToCopy);
            });
        });

        $('#' + panel.divElement.id + '-switch-query-mode').bootstrapSwitch();

        panel.options.devQuery = true;
        //panel.qpa = new queryPanel(document.getElementById(panel.divElement.id + "-QueryManager"), panel.options);
        //panel.subscribe(panel.qpa);

        $("#" + panel.divElement.id + "-saveChanges").unbind();
        $("#" + panel.divElement.id + "-saveChanges").disableTextSelect();
        $("#" + panel.divElement.id + "-saveChanges").click(function(){
            var queryJson = $("#" + panel.divElement.id + "-listGroup").html();
            if ($('#' + panel.divElement.id + '-queryTesterTitle').attr("data-temp") == "true"){
                $("#newQuery").modal("show");
                $("#inputQuery").val(queryJson);
                $("#newQueryButton").unbind();
                $("#newQueryButton").click(function(){
                    var name = $("#inputQueryTitle").val(), found = false;
                    var description = $("#inputQueryDescription").val();
                    var queryjson = $("#inputQuery").val();
                    var query = {
                        id : guid(),
                        active: "true",
                        name : name,
                        description : description,
//                        pathId : options.path.id,
                        queryJson: queryjson,
                        txTime: "",
                        dev: "true"
                    };
//                    $.get(options.serverUrl.replace("snomed", "") + "versions/" + options.edition + "/query/components/?access_token=" + options.token).done(function (data) {
//                        var queries = [];
//                        if (typeof data == "string") {
//                        } else {
//                            $.each(data, function (i, field) {
//                                if (field.dev && field.dev == "true" && field.name == name) {
//                                    found = true;
//                                }
//                            });
//                        }
//                        if (!found){
//                            $.post(options.serverUrl.replace("snomed", "") + "versions/" + options.edition + "/query/components/" + "?access_token=" + options.token, query).done(function (data) {
                            $.post(options.serverUrl.replace("snomed", "") + "queryServer/" + options.edition + "/user/" + options.username + "/query/", query).done(function (data) {
                                panel.updateCanvas(query);
                                $("#inputQueryTitle").val("");
                                $("#inputQueryDescription").val("");
                                $("#inputQuery").val("");
                                $("#newQuery").modal("hide");
                            }).fail(function(data){
                            });
//                        }else{
//                            alertEvent("There is a query with that name already!", "error");
//                        }
//                    }).fail(function(){
//                        alertEvent("Failed!", "error");
//                    });
                });
            }else{
                $("#" + panel.divElement.id + "-saveChanges").addClass("disabled");
                var id = $("#" + panel.divElement.id + "-saveChanges").attr("data-id");
                var query = {
                    queryJson: queryJson
                };
                $.ajax({
                    type: "PUT",
                    //url: options.serverUrl.replace("snomed", "") + "versions/" + options.edition + "/query/components/" + id + "?access_token=" + options.token,
                    url: options.serverUrl.replace("snomed", "") + "queryServer/" + options.edition + "/" + options.username + "/query/" + id + "?access_token=" + options.token,
                    data: query
                }).done(function(err){
                    $("#" + panel.divElement.id + "-saveChanges").removeClass("disabled");
                    alertEvent("Updated!", "success");
                    channel.publish("UpdatedQuery", {
                        asset:{
                            queryJson: queryJson
                        },
                        id: id
                    });
                }).fail(function(err){
                    $("#" + panel.divElement.id + "-saveChanges").removeClass("disabled");
                    alertEvent("Failed!", "error");
                });
            }

        });

        if (options.guestUser){
            $("#" + panel.divElement.id + "-selectButton").hide();
            $("#" + panel.divElement.id + "-saveChanges").hide();
        }

        if (options.previewQuery){
            $("#" + panel.divElement.id + "-selectButton").hide();
            $("#" + panel.divElement.id + "-saveChanges").hide();
            $("#" + panel.divElement.id + "-addCriteriaButton").closest("form").hide();
            $("#" + panel.divElement.id + "-queryTesterTitle").closest("form").hide();
            $("#" + panel.divElement.id + "-exportResults").closest("div").hide();
        }
        $("#" + panel.divElement.id + "-selectButton").unbind();
        $("#" + panel.divElement.id + "-selectButton").disableTextSelect();
        $("#" + panel.divElement.id + "-selectButton").click(function(){
            $("#" + panel.divElement.id + "-QueryManagerModal").modal("show");
            panel.qpa.updateCanvas();
        });

        $('#' + panel.divElement.id + '-exportXls').unbind();
        $('#' + panel.divElement.id + '-exportXls').click(function (e) {
//            var rowsHtml = "";
//            alertEvent("Please wait", "info");
//            panel.getTotalResults(function(){
//                $.each(panel.allResults, function(i, field){
//                    rowsHtml+= "<tr><td>" + field.defaultTerm + "</td><td>" + field.conceptId + "</td></tr>";
//                });
//                $("#" + panel.divElement.id + "-outputBody2").html(rowsHtml);
            if (panel.allResults){
                return ExcellentExport.excel(this, panel.divElement.id + '-output2');
            }else{
                e.preventDefault();
                e.stopPropagation();
                panel.getTotalResults();
            }
//            });
        });

        $('#' + panel.divElement.id + '-exportBriefcase').unbind();
        $('#' + panel.divElement.id + '-exportBriefcase').click(function (e) {
            function exportToBriefcase(){
                var result = [];
                $.each(panel.allResults, function(i, field){
                    var loopConcept = {};
                    loopConcept.conceptId = field.conceptId;
                    loopConcept.defaultTerm = field.defaultTerm;
                    loopConcept.module = field.module;
                    result.push(loopConcept);
                });
                briefcase.addConcepts(result);
            }
            if (panel.allResults){
                exportToBriefcase();
            }else{
                alertEvent("Exporting concepts, please wait", "info");
                panel.getTotalResults(function(){
                    exportToBriefcase();
                });
            }
        });

        $('#' + panel.divElement.id + '-open-grammar').unbind();
        $("#" + panel.divElement.id + "-open-grammar").disableTextSelect();
        $("#" + panel.divElement.id + "-open-grammar").click(function (e) {
            panel.updateGrammarModal(false);
        });
        //-brief-syntax-button
        $('#home-' + panel.divElement.id + '-full-syntax-button').unbind();
        $('#home-' + panel.divElement.id + '-full-syntax-button').disableTextSelect();
        $('#home-' + panel.divElement.id + '-full-syntax-button').addClass("btn-primary");
        $('#home-' + panel.divElement.id + '-full-syntax-button').removeClass("btn-default");
        $('#home-' + panel.divElement.id + '-full-syntax-button').click(function (event) {
            panel.updateGrammarModal(true);
        });

        $('#home-' + panel.divElement.id + '-brief-syntax-button').unbind();
        $('#home-' + panel.divElement.id + '-brief-syntax-button').disableTextSelect();
        $('#home-' + panel.divElement.id + '-brief-syntax-button').addClass("btn-default");
        $('#home-' + panel.divElement.id + '-brief-syntax-button').removeClass("btn-primary");
        $('#home-' + panel.divElement.id + '-brief-syntax-button').click(function (event) {
            panel.updateGrammarModal(false);
        });

        $('#' + panel.divElement.id + '-exportBriefcaseClean').unbind();
        $('#' + panel.divElement.id + '-exportBriefcaseClean').click(function (e) {
            function exportToBriefcase(){
                var result = [];
                briefcase.emptyBriefcase();
                $.each(panel.allResults, function(i, field){
                    var loopConcept = {};
                    loopConcept.conceptId = field.conceptId;
                    loopConcept.defaultTerm = field.defaultTerm;
                    loopConcept.module = field.module;
                    result.push(loopConcept);
                });
                briefcase.addConcepts(result);
            }
            if (panel.allResults){
                exportToBriefcase();
            }else{
                alertEvent("Exporting concepts, please wait", "info");
                panel.getTotalResults(function(){
                    exportToBriefcase();
                });
            }
        });

        $('#' + panel.divElement.id + '-computeButton').unbind();
        $('#' + panel.divElement.id + '-computeButton').click(function (e) {
            var query = $('#' + panel.divElement.id + '-input').val();
            var request = {
                query : JSON.parse(query),
                pathId : options.path.id
            };
            panel.compute(request);
        });

        $("#" + panel.divElement.id).find("a[data-role='modifier-selector']").unbind();
        $("#" + panel.divElement.id).find("a[data-role='modifier-selector']").click(function (e) {
            $('#' + panel.divElement.id + '-selectedModifier').html($(e.target).html());
        });

        $('#' + panel.divElement.id + '-selectedConcept').show();
        $('#' + panel.divElement.id + '-selectedType').hide();
        $('#' + panel.divElement.id + '-selectedTarget').hide();
        $('#' + panel.divElement.id + '-searchTerm').hide();
        $('#' + panel.divElement.id + '-searchTerm').unbind();
        $('#' + panel.divElement.id + '-searchTerm').keyup(function(e){
            if (e.keyCode === 13) {
                $('#' + panel.divElement.id + '-addCriteriaButton').click();
            }
        });
        $('#' + panel.divElement.id + '-formdropdown').hide();
        $("#" + panel.divElement.id).find("a[data-role='criteria-selector']").unbind();
        $("#" + panel.divElement.id).find("a[data-role='criteria-selector']").click(function (e) {
            $('#' + panel.divElement.id + '-selectedCriteria').html($(e.target).html());
            //$(e.target).closest(".dropdown").find("span").first().html($(e.target).html());
            var selectedCriteria = $(e.target).html();
            if (selectedCriteria == "hasDescription") {
                $('#' + panel.divElement.id + '-selectedConcept').hide();
                $('#' + panel.divElement.id + '-selectedType').hide();
                $('#' + panel.divElement.id + '-selectedTarget').hide();
                $('#' + panel.divElement.id + '-searchTerm').show();
                $('#' + panel.divElement.id + '-formdropdown').hide();
            } else if (selectedCriteria == "hasRelationship") {
                $('#' + panel.divElement.id + '-selectedConcept').hide();
                $('#' + panel.divElement.id + '-selectedType').show();
                $('#' + panel.divElement.id + '-selectedTarget').show();
                $('#' + panel.divElement.id + '-searchTerm').hide();
                $('#' + panel.divElement.id + '-formdropdown').show();
            } else {
                $('#' + panel.divElement.id + '-selectedConcept').show();
                $('#' + panel.divElement.id + '-selectedType').hide();
                $('#' + panel.divElement.id + '-selectedTarget').hide();
                $('#' + panel.divElement.id + '-searchTerm').hide();
                $('#' + panel.divElement.id + '-formdropdown').hide();
            }
        });
        $("#" + panel.divElement.id).find("a[data-role='form-selector']").unbind();
        $("#" + panel.divElement.id).find("a[data-role='form-selector']").click(function (e) {
            $('#' + panel.divElement.id + '-selectedForm').html($(e.target).html());
        });


        $('#' + panel.divElement.id + '-addCriteriaButton').unbind();
        $('#' + panel.divElement.id + '-addCriteriaButton').click(function (e) {
            var modifier = $('#' + panel.divElement.id + '-selectedModifier').html();
            var criteria = $('#' + panel.divElement.id + '-selectedCriteria').html();
            var conceptIdDroped = $('#' + panel.divElement.id + '-selectedConcept').attr("data-conceptId");
            //data-modifier="{{modifier}}" data-criteria="{{criteria}}" data-concept-id="{{conceptId}}" query-condition
            if ($('#' + panel.divElement.id + '-listGroup').find('.query-condition[data-criteria="' + criteria + '"][data-modifier="' + modifier + '"][data-concept-id="' + conceptIdDroped + '"]').length){
                $('#' + panel.divElement.id + '-conceptField').addClass("has-error");
                $('#' + panel.divElement.id + '-addmsg').html("Criteria already added...");
            }else if ($('#' + panel.divElement.id + '-listGroup').find('.query-condition[data-criteria="' + criteria + '"][data-concept-id="' + conceptIdDroped + '"]').length){
                $('#' + panel.divElement.id + '-conceptField').addClass("has-error");
                $('#' + panel.divElement.id + '-addmsg').html("Contradictory criteria...");
            }else if (criteria == "hasDescription") {
                var searchTerm = $('#' + panel.divElement.id + '-searchTerm').val();
                if (searchTerm == "") {
                    $('#' + panel.divElement.id + '-conceptField').addClass("has-error");
                    $('#' + panel.divElement.id + '-addmsg').html("Enter a search term...");
                } else {
                    $('#' + panel.divElement.id + '-addmsg').html("");
                    $('#' + panel.divElement.id + '-conceptField').removeClass("has-error");
                    var context2 = {
                        modifier: modifier,
                        criteria: criteria,
                        searchTerm: searchTerm
                    };
                    $('#' + panel.divElement.id + '-listGroup').append(JST["views/developmentQueryPlugin/searchCriteria.hbs"](context2));
                    panel.renumLines();
                    $(divElement).find(".removeLi").unbind();
                    $(divElement).find(".removeLi").disableTextSelect();
                    $(divElement).find(".removeLi").click(function(e){
                        $(e.target).closest("li").remove();
                        panel.renumLines();
                    });
                    $('#' + panel.divElement.id + '-selectedConcept').val("");
                    $('#' + panel.divElement.id + '-selectedConcept').attr("data-conceptId", "");
                    $('#' + panel.divElement.id + '-selectedType').val("");
                    $('#' + panel.divElement.id + '-selectedType').attr("data-conceptId", "");
                    $('#' + panel.divElement.id + '-selectedTarget').val("");
                    $('#' + panel.divElement.id + '-selectedTarget').attr("data-conceptId", "");
                    $('#' + panel.divElement.id + '-searchTerm').val("");
                }
            } else if (criteria == "hasRelationship") {
                var typeId = $('#' + panel.divElement.id + '-selectedType').attr("data-conceptId");
                var typeTerm = $('#' + panel.divElement.id + '-selectedType').val();
                var targetId = $('#' + panel.divElement.id + '-selectedTarget').attr("data-conceptId");
                var targetTerm = $('#' + panel.divElement.id + '-selectedTarget').val();
                var form = $('#' + panel.divElement.id + '-selectedForm').html();
                if ((typeof typeId == "undefined" || typeId == "") && typeTerm == "" &&
                    (typeof targetId == "undefined" || targetId == "") && targetTerm == "" ) {
                    $('#' + panel.divElement.id + '-conceptField').addClass("has-error");
                    $('#' + panel.divElement.id + '-addmsg').html("Drop a concept...");
                } else {
                    $('#' + panel.divElement.id + '-addmsg').html("");
                    $('#' + panel.divElement.id + '-conceptField').removeClass("has-error");
                    var context2 = {
                        modifier: modifier,
                        criteria: criteria,
                        typeId: typeId,
                        typeTerm: typeTerm,
                        targetId: targetId,
                        targetTerm: targetTerm,
                        form: form
                    };
                    $('#' + panel.divElement.id + '-listGroup').append(JST["views/developmentQueryPlugin/relsCriteria.hbs"](context2));
                    panel.renumLines();
                    $(divElement).find(".removeLi").unbind();
                    $(divElement).find(".removeLi").disableTextSelect();
                    $(divElement).find(".removeLi").click(function(e){
                        $(e.target).closest("li").remove();
                        panel.renumLines();
                    });
                    $('#' + panel.divElement.id + '-selectedConcept').val("");
                    $('#' + panel.divElement.id + '-selectedConcept').attr("data-conceptId", "");
                    $('#' + panel.divElement.id + '-selectedType').val("");
                    $('#' + panel.divElement.id + '-selectedType').attr("data-conceptId", "");
                    $('#' + panel.divElement.id + '-selectedTarget').val("");
                    $('#' + panel.divElement.id + '-selectedTarget').attr("data-conceptId", "");
                    $('#' + panel.divElement.id + '-searchTerm').val("");
                }
            } else {
                var conceptId = $('#' + panel.divElement.id + '-selectedConcept').attr("data-conceptId");
                var term = $('#' + panel.divElement.id + '-selectedConcept').val();
                if (typeof conceptId == "undefined" || conceptId == "" || term == "") {
                    $('#' + panel.divElement.id + '-conceptField').addClass("has-error");
                    $('#' + panel.divElement.id + '-addmsg').html("Drop a concept...");
                } else {
                    $('#' + panel.divElement.id + '-addmsg').html("");
                    $('#' + panel.divElement.id + '-conceptField').removeClass("has-error");
                    var criterias = [{criteria: criteria, conceptId: conceptId, term: term}];
                    if ($(divElement).find(".addedCriteria").length){
                        $(divElement).find(".addedCriteria").each(function(i){
                            var addedConceptId = $(this).find(".andCriteriaConcept").first().attr("data-conceptId");
                            var addedTerm = $(this).find(".andCriteriaConcept").first().val();
                            if (addedConceptId && addedTerm){
                                criterias.push({
                                    criteria: $(this).find(".addSelectCriteria").first().html(),
                                    conceptId: addedConceptId,
                                    term: addedTerm
                                });
                            }else{
                                $('#' + panel.divElement.id + '-conceptField').addClass("has-error");
                                $('#' + panel.divElement.id + '-addmsg').html("Drop a concept...");
                            }
                        });
                    }
                    if ($('#' + panel.divElement.id + '-addmsg').html() != "Drop a concept..."){
                        var context2 = {
                            modifier: modifier,
                            criterias: criterias
                        };
                        // Add Excludes always at the end, and includes before exclude
                        var foundExclude = false;
                        $('#' + panel.divElement.id + '-listGroup').find(".query-condition").each(function (index) {
                            var modifier = $(this).data('modifier');
                            if (modifier == "Exclude") {
                                $(this).before(JST["views/developmentQueryPlugin/criteria.hbs"](context2));
                                foundExclude = true;
                                return false;
                            }
                        });
                        if (!foundExclude) {
                            $('#' + panel.divElement.id + '-listGroup').append(JST["views/developmentQueryPlugin/criteria.hbs"](context2));
                        }
                        panel.renumLines();

                        $(divElement).find(".removeLi").unbind();
                        $(divElement).find(".removeLi").disableTextSelect();
                        $(divElement).find(".removeLi").click(function(e){
                            $(e.target).closest("li").remove();
                            panel.renumLines();
                        });
                        $('#' + panel.divElement.id + '-selectedConcept').val("");
                        $('#' + panel.divElement.id + '-selectedConcept').attr("data-conceptId", "");
                        $('#' + panel.divElement.id + '-selectedType').val("");
                        $('#' + panel.divElement.id + '-selectedType').attr("data-conceptId", "");
                        $('#' + panel.divElement.id + '-selectedTarget').val("");
                        $('#' + panel.divElement.id + '-selectedTarget').attr("data-conceptId", "");
                        $('#' + panel.divElement.id + '-searchTerm').val("");
                    }
                }
            }
        });

        $('#' + panel.divElement.id + '-computeStatedButton').unbind();
        $('#' + panel.divElement.id + '-computeStatedButton').click(function (e) {
//            var request = {
//                form : "stated",
//                pathId : options.path.id
//            };
//            panel.compute(request, true, false);
            panel.execute("stated", panel.exportToConstraintGrammar(false, false), true);
        });
        $('#' + panel.divElement.id + '-computeInferredButton').unbind();
        $('#' + panel.divElement.id + '-computeInferredButton').click(function (e) {
//            var request = {
//                form : "inferred",
//                pathId : options.path.id
//            };
//            panel.compute(request, true, false);
            panel.execute("inferred", panel.exportToConstraintGrammar(false, false), true);
        });
        $('#' + panel.divElement.id + '-sendToBatchComputeStated').unbind();
        $('#' + panel.divElement.id + '-sendToBatchComputeStated').click(function (e) {
            var request = {
                form : "stated",
                pathId : options.path.id,
                path : options.path,
                databaseName: options.edition,
                collectionName: options.release,
                priority: 1,
                user: options.username
            };
            panel.compute(request, true, true);
        });
        $('#' + panel.divElement.id + '-sendToBatchComputeInferred').unbind();
        $('#' + panel.divElement.id + '-sendToBatchComputeInferred').click(function (e) {
            var request = {
                form : "inferred",
                pathId : options.path.id,
                path : options.path,
                databaseName: options.edition,
                collectionName: options.release,
                priority: 1,
                user: options.username
            };
            panel.compute(request, true, true);
        });
        $('#' + panel.divElement.id + '-cloudResults').unbind();
        $('#' + panel.divElement.id + '-cloudResults').click(function (e) {
            var cloudPanel = new batchQueriesPanel(document.getElementById(panel.divElement.id + '-cloud-panel'), options);
        });
//        panel.updateCloudCount();
    };

    panel.updateGrammarModal = function(fullSyntax) {
        if (fullSyntax) {
            $('#home-' + panel.divElement.id + '-full-syntax-button').addClass("btn-primary");
            $('#home-' + panel.divElement.id + '-full-syntax-button').removeClass("btn-default");
            $('#home-' + panel.divElement.id + '-brief-syntax-button').addClass("btn-default");
            $('#home-' + panel.divElement.id + '-brief-syntax-button').removeClass("btn-primary");
        } else {
            $('#home-' + panel.divElement.id + '-full-syntax-button').removeClass("btn-primary");
            $('#home-' + panel.divElement.id + '-full-syntax-button').addClass("btn-default");
            $('#home-' + panel.divElement.id + '-brief-syntax-button').removeClass("btn-default");
            $('#home-' + panel.divElement.id + '-brief-syntax-button').addClass("btn-primary");
        }
        panel.grammarToCopy = panel.exportToConstraintGrammar(false, fullSyntax);
        $("#" + panel.divElement.id + "-constraintGrammar").html(panel.exportToConstraintGrammar(true, fullSyntax));
    };

    panel.updateCloudCount = function() {
        $('#' + panel.divElement.id + '-cloudCount').html("<i class='glyphicon glyphicon-refresh icon-spin'></i>");
//        xhr = $.get(options.inferredViewServerUrl.replace("snomed", "") + "server/query/" + options.edition + "/" + options.release + "/batch?pathId=" + options.path.id + "&user=" + options.username + "&access_token=" + options.token).done(function (data1) {
            $.get(options.serverUrl.replace("snomed", "") + "server/query/" + options.edition + "/" + options.release + "/batch?pathId=" + options.path.id + "&user=" + options.username + "&access_token=" + options.token).done(function (data2) {
                var queries = data2.queries;
                $('#' + panel.divElement.id + '-cloudCount').html(queries.length);
            });
//        });
    };

    panel.setUpPanel();

    this.renumLines = function() {
        $('#' + panel.divElement.id + '-listGroup').find(".query-condition").each(function(index) {
            $(this).find(".line-number").html(index + 1);
        });
    };

    this.getTotalResults = function(callback){
        if (xhrTotal != null){
            xhrTotal.abort();
        }
        panel.lastRequest.skip = 0;
        panel.lastRequest.limit = panel.lastTotalValues + 1;
        $('#' + panel.divElement.id + '-exportXls').html("<i class='glyphicon glyphicon-refresh icon-spin'></i>");
        xhrTotal = $.post(panel.lastUrl + "?access_token=" + options.token, panel.lastRequest).done(function(data){
            xhrTotal = null;
            panel.allResults = data.matches;
            var rowsHtml = "";
            if (panel.allResults && panel.allResults.length){
                $.each(panel.allResults, function(i, field){
                    rowsHtml+= "<tr><td>" + field.defaultTerm + "</td><td>" + field.conceptId + "</td></tr>";
                });
            }
            $("#" + panel.divElement.id + "-outputBody2").html(rowsHtml);
            $('#' + panel.divElement.id + '-exportXls').html('Download XLS <img style="height: 23px;" src="img/excel.png">');
            if (callback)
                callback();
        }).fail(function(){
            alertEvent("Failed!", "error");
        });
    };

    this.getExpressionForCondition = function(condition, htmlFormat, fullSyntax) {
        var grammar = "";
        var operator = "";
        if (condition.criteria == "self") {
            if (fullSyntax) {
                operator = "self ";
            } else {
                operator = "";
            }
        } else if (condition.criteria == "descendantOf") {
            if (fullSyntax) {
                operator = "descendantOf ";
            } else {
                operator = "< ";
            }
        } else if (condition.criteria == "descendantOrSelfOf") {
            if (fullSyntax) {
                operator = "descendantOrSelfOf ";
            } else {
                operator = "<< ";
            }
        } else if (condition.criteria == "childrenOf") {
            if (fullSyntax) {
                operator = "childrenOf ";
            } else {
                operator = "<1 ";
            }
        } else if (condition.criteria == "ancestorOf") {
            if (fullSyntax) {
                operator = "ancestorOf ";
            } else {
                operator = "> ";
            }
        } else if (condition.criteria == "ancestorOrSelfOf") {
            if (fullSyntax) {
                operator = "ancestorOrSelfOf ";
            } else {
                operator = ">> ";
            }
        } else if (condition.criteria == "parentsOf") {
            if (fullSyntax) {
                operator = "parentsOf ";
            } else {
                operator = ">1 ";
            }
        } else if (condition.criteria == "hasDescription") {
            if (fullSyntax) {
                operator = "hasDescription ";
            } else {
                operator = "desc ";
            }
        }  else if (condition.criteria == "hasRelationship") {
            if (fullSyntax) {
                operator = "hasRelationship ";
            } else {
                operator = "rel ";
            }
        }  else if (condition.criteria == "isMemberOf") {
            if (fullSyntax) {
                operator = "isMemberOf ";
            } else {
                operator = "^ ";
            }
        };
        var term = "|" + condition.term + "|";
        if (htmlFormat) {
            operator = "<span class='exp-operators'>" + operator + "</span>";
            term = "<span class='exp-term'>" +  term + "</span>";
        }
        grammar = operator + condition.conceptId + term;
        return grammar;
    };

    this.exportToConstraintGrammar = function(htmlFormat, fullSyntax) {
        var breakLine = " ";
        if (htmlFormat) {
            breakLine = "<br>";
        }
        var grammar = "";
        if ($('#' + panel.divElement.id + '-listGroup').find(".query-condition").length == 0) {
            console.log("Add at least one condition...");
        } else {
            var includes = [];
            var excludes = [];
            $('#' + panel.divElement.id + '-listGroup').find(".query-condition").each(function (index) {
                var conditions = [];
                $(this).find(".constraint").each(function (index2) {
                    var condition = {
                        "criteria": $(this).data('criteria'),
                        "conceptId": $(this).data('concept-id'),
                        "term": $(this).data('term')
                    };
                    conditions.push(condition);
                });
                if ($(this).data('modifier') == "Exclude") {
                    excludes.push(conditions);
                } else {
                    includes.push(conditions);
                }
            });
            //if (includes.length > 1) grammar += "(";
            $.each(includes, function (index, conditions) {
                if (index > 0) grammar += " OR ";
                if (conditions.length > 1) grammar += " (";
                $.each(conditions, function (index2, condition) {
                    if (index2 > 0) grammar += " AND ";
                    grammar += panel.getExpressionForCondition(condition, htmlFormat, fullSyntax);
                });
                if (conditions.length > 1) grammar += ") ";
                if (htmlFormat && index < includes.length -1) {
                    grammar += "<br>";
                }
            });
            //if (includes.length > 1) grammar += ")";

            if (excludes.length > 0 && includes.length > 1) {
                grammar = "(" + grammar;
                grammar += ") MINUS ";
                if (htmlFormat) {
                    grammar += "<br>";
                }
            } else if (excludes.length > 0) {
                grammar += " MINUS ";
                if (htmlFormat) {
                    grammar += "<br>";
                }
            }

            if (excludes.length > 1) grammar += "(";
            $.each(excludes, function (index, condition) {
                if (index > 0) grammar += " OR ";
                grammar += panel.getExpressionForCondition(condition, htmlFormat, fullSyntax);
                if (htmlFormat && index < excludes.length -1) {
                    grammar += "<br>";
                }
            });
            if (excludes.length > 1) grammar += ")";
        }
        grammar = grammar.trim();
        //console.log(grammar.charAt(0));
        //console.log(grammar.charAt(grammar.length-1));
        if (grammar.charAt(0) == "(" && grammar.charAt(grammar.length-1) == ")") {
            grammar = grammar.substr(1,grammar.length-2);
        }
        return grammar;
    };

    this.exportToConstraintGrammarOld = function(htmlFormat, fullSyntax) {
        var breakLine = " ";
        if (htmlFormat) {
            breakLine = "<br>";
        }
        var grammar = "";
        if ($('#' + panel.divElement.id + '-listGroup').find(".query-condition").length == 0) {
            console.log("Add at least one condition...");
        } else {
            var includes = [];
            var excludes = [];
            var first = true;
            $('#' + panel.divElement.id + '-listGroup').find(".query-condition").each(function (index) {
                var criteria = $(this).data('criteria');
                if (criteria == "hasDescription") {
                    var condition = {
                        "criteria": criteria,
                        "conceptId": $(this).data('concept-id'),
                        "searchTerm": $(this).data('search-term')
                    };
                } else if (criteria != "hasRelationship") {
                    var condition = {
                        "criteria": criteria,
                        "conceptId": $(this).data('concept-id'),
                        "term": $(this).data('term')
                    };
                    if ($(this).data('modifier') == "Exclude") {
                        grammar = " ( " + grammar + "MINUS " + panel.getExpressionForCondition(condition, htmlFormat, fullSyntax) + " ) " + breakLine;
                    } else {
                        if (!first) {
                            grammar = grammar + "OR ";
                        } else {
                            first = false;
                        }
                        grammar = grammar + panel.getExpressionForCondition(condition, htmlFormat, fullSyntax) + breakLine;
                    }
                }

            });

            var refinementSeparatorWritten = false;
            $('#' + panel.divElement.id + '-listGroup').find(".query-condition").each(function (index) {
                var criteria = $(this).data('criteria');
                if (criteria == "hasRelationship") {
                    if (!refinementSeparatorWritten) {
                        grammar+= " : ";
                        refinementSeparatorWritten = true;
                    } else {
                        grammar+= " , " + breakLine;
                    }

                    if ($(this).data('type-id') == "") {
                        if (fullSyntax) {
                            grammar+= " ANY";
                        } else {
                            grammar+= " *";
                        }
                    } else {
                        var condition = {
                            "criteria": "self",
                            "conceptId": $(this).data('type-id'),
                            "term": $(this).data('type-term')
                        };
                        grammar = grammar + panel.getExpressionForCondition(condition, htmlFormat, fullSyntax);
                    }
                    grammar += " = ";
                    if ($(this).data('target-id') == "") {
                        if (fullSyntax) {
                            grammar+= " ANY";
                        } else {
                            grammar+= " *";
                        }
                    } else {
                        var condition2 = {
                            "criteria": "self",
                            "conceptId": $(this).data('target-id'),
                            "term": $(this).data('target-term')
                        };
                        grammar = grammar + panel.getExpressionForCondition(condition2, htmlFormat, fullSyntax);
                    }
                }
            });
        }
        grammar = grammar.trim();
        console.log(grammar.charAt(0));
        console.log(grammar.charAt(grammar.length-1));
        if (grammar.charAt(0) == "(" && grammar.charAt(grammar.length-1) == ")") {
            grammar = grammar.substr(1,grammar.length-2);
        }

        return grammar;
    };

    this.execute = function (form, expression, clean){
        //$('#' + panel.divElement.id + '-footer').html("<i class='glyphicon glyphicon-refresh icon-spin'></i>");
        $('#' + panel.divElement.id + '-footer').html('<div class="progress progress-striped active"> <div class="progress-bar"  role="progressbar" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100" style="width: 100%"><span>Searching</span></div> </div>');
        $('#' + panel.divElement.id + '-resultInfo').html("<i class='glyphicon glyphicon-refresh icon-spin'></i>");
        if (clean){
            $('#' + panel.divElement.id + '-outputBody').html("");
            $('#' + panel.divElement.id + '-outputBody2').html("");
            limit = 100;
            skip = 0;
        }
        var data = {
            expression: expression,
            limit : limit,
            skip : skip,
            form: form
        };
        if (xhrExecute != null)
            xhrExecute.abort();
        xhrExecute = $.ajax({
            type: "POST",
            url: options.serverUrl.replace("snomed", "expressions/") + options.edition + "/" + options.release + "/execute/brief?access_token=" + options.token,
            data: data,
            dataType: "json",
            timeout: 300000,
            success: function(result) {
                if (result.paserResponse.validation) {
                    data = result.computeResponse;
                    //result.computeResponse.matches
                    $("#" + panel.divElement.id + "-exportResults").removeClass("disabled");
                    if (data.performanceCutOff) {
                        $('#' + panel.divElement.id + '-resultInfo').html("Found " + data.total + " concepts. <span class='text-danger'>This query cannot be completed in real-time, please schedule a Cloud executions. Results below are incomplete and some conditions were not tested. </span>");
                    } else {
                        $('#' + panel.divElement.id + '-resultInfo').html("Found " + data.total + " concepts");
                    }
                    $.each(data.matches, function (i, row){
                        $('#' + panel.divElement.id + '-outputBody').append("<tr style='cursor: pointer;' class='conceptResult' data-module='" + row.module + "' data-concept-id='" + row.conceptId + "' data-term='" + row.defaultTerm + "'><td>" + row.defaultTerm + "</td><td>" + row.conceptId + "</td></tr>");
                        $('#' + panel.divElement.id + '-outputBody2').append("<tr><td>" + row.defaultTerm + "</td><td>" + row.conceptId + "</td></tr>");
                    });

                    $('#' + panel.divElement.id + '-outputBody').find(".conceptResult").unbind();
                    $('#' + panel.divElement.id + '-outputBody').find(".conceptResult").click(function(event){
                        console.log("clicked",$(event.target).closest("tr").attr('data-term'));
                        channel.publish(panel.divElement.id, {
                            term: $(event.target).closest("tr").attr('data-term'),
                            module: $(event.target).closest("tr").attr("data-module"),
                            conceptId: $(event.target).closest("tr").attr('data-concept-id'),
                            source: panel.divElement.id
                        });
                    });

                    if (limit + skip < data.total) {
                        $('#' + panel.divElement.id + '-footer').html("<span id='" + panel.divElement.id + "-more'>Show more (viewing " + (limit + skip) + " of " + data.total + " total)</span>");
                    } else {
                        $('#' + panel.divElement.id + '-footer').html("Showing all " + data.total + " matches");
                    }

                    $('#' + panel.divElement.id + '-more').unbind();
                    $('#' + panel.divElement.id + '-more').click(function (e) {
                        skip = skip + 100;
                        panel.execute(form, expression, false);
                    });
//                    $("#" + panel.divElement.id + "-syntax-result").html('<span class="label label-success">OK</span>');
//                    var resultsHtml = "";
//                    resultsHtml+='<p><span class="text-success">Total matches: ' + result.computeResponse.total + '</span></p>';
//                    if (result.computeResponse.matches) {
//                        result.computeResponse.matches.forEach(function(match){
//                            resultsHtml+=match.defaultTerm + ' ' + match.conceptId + '<br>';
//                        });
//                    } else {
//                        resultsHtml = result.computeResponse;
//                    }
//                    $("#" + panel.divElement.id + "-results").html(resultsHtml);
                } else {
                    $("#" + panel.divElement.id + "-syntax-result").html('<span class="label label-danger">ERROR</span>');
                    $("#" + panel.divElement.id + "-results").html("Error...");
                }
            }
        }).done(function(result){
            // done
            xhrExecute = null;
        }).fail(function(jqXHR, textStatus){
            xhrExecute = null;
            if(textStatus === 'timeout') {
//                $("#" + panel.divElement.id + "-syntax-result").html('<span class="label label-danger">ERROR</span>');
//                $("#" + panel.divElement.id + "-results").html("Timeout...");
                $('#' + panel.divElement.id + '-resultInfo').html("This query cannot be completed in real-time, please schedule a Cloud executions.");
                $('#' + panel.divElement.id + '-footer').html("Timeout Error, use the Cloud for running this query");
            } else if (textStatus == "abort"){

            } else {
//                $("#" + panel.divElement.id + "-syntax-result").html('<span class="label label-danger">ERROR 500</span>');
//                $("#" + panel.divElement.id + "-results").html("Error...");
                $('#' + panel.divElement.id + '-resultInfo').html("Error.");
                $('#' + panel.divElement.id + '-footer').html("Error");
            }
        });
    }

    this.compute = function(request, clean, batch) {
        request.queryModeOrdered = $('#' + panel.divElement.id + '-switch-query-mode').is(":checked");
        panel.allResults = false;
        $('#' + panel.divElement.id + '-exportXls').html('Export results in XLS <img style="height: 23px;" src="img/excel.png">');
        var query = {};
        if ($('#' + panel.divElement.id + '-listGroup').find(".query-condition").length == 0) {
            $('#' + panel.divElement.id + '-addmsg').html("Add at least one query...");
        } else {
//            console.log($(".query-condition"));
            $('#' + panel.divElement.id + '-listGroup').find(".query-condition").each(function(index) {
                var modifier = "true";
                if ($(this).data('modifier') == "Exclude") {
                    modifier = "false";
                }
                var criteria = $(this).data('criteria');
                if (criteria == "hasDescription") {
                    query["condition" + index] = {
                        "criteria": criteria,
                        "modifier": modifier,
                        "searchTerm":$(this).data('search-term'),
                        "normalize": + options.manifest.textIndexNormalized,
                        "statusFilter": "activeOnly"
                    };
                } else if (criteria == "hasRelationship") {
                    query["condition" + index] = {
                        "criteria": criteria,
                        "modifier": modifier,
                        "typeId":$(this).data('type-id'),
                        "typeTerm":$(this).data('type-term'),
                        "targetId":$(this).data('target-id'),
                        "targetTerm":$(this).data('target-term'),
                        "statusFilter": "activeOnly",
                        "form": $(this).data('form')
                    };
                } else {
                    query["condition" + index] = {
                        "criteria": criteria,
                        "modifier": modifier,
                        "conceptId":$(this).data('concept-id'),
                        "term":$(this).data('term')
                    };
                }
            });
//            console.log(query);
            if (query["condition0"].modifier == "false") {
                $('#' + panel.divElement.id + '-addmsg').html("A query can't start with an exclusion...");
            } else {
                request.query = query;
                $('#' + panel.divElement.id + '-footer').html("<i class='glyphicon glyphicon-refresh icon-spin'></i>");
                $('#' + panel.divElement.id + '-resultInfo').html("<i class='glyphicon glyphicon-refresh icon-spin'></i>");
                if (clean) {
                    $('#' + panel.divElement.id + '-outputBody').html("");
                    $('#' + panel.divElement.id + '-outputBody2').html("");
                    limit = 100;
                    skip = 0;
                }
                request.limit = limit;
                request.skip = skip;
                request.useDb = false;
                var server = options.serverUrl;
//                if (request.form == "inferred")
//                    server = options.inferredViewServerUrl;
                var endpoint;
                if (batch) {
                    server = server.replace("snomed","server");
                    endpoint = "/query/batch";
                } else {
                    endpoint = "/" + options.edition + "/" + options.release + "/query/computer";
                }

                panel.lastRequest = request;
                panel.lastUrl = server + endpoint;
                $.post(server + endpoint + "?access_token=" + options.token, request).done(function(data){
                    panel.lastTotalValues = data.total;
//                    panel.getTotalResults();
                    if (batch) {
                        $('#' + panel.divElement.id + '-resultInfo').html("OK");
                        $('#' + panel.divElement.id + '-footer').html("Batch query scheduled");
                        panel.updateCloudCount();
                    } else {
                        $("#" + panel.divElement.id + "-exportResults").removeClass("disabled");
                        if (data.performanceCutOff) {
                            $('#' + panel.divElement.id + '-resultInfo').html("Found " + data.total + " concepts. <span class='text-danger'>This query cannot be completed in real-time, please schedule a Cloud executions. Results below are incomplete and some conditions were not tested. </span>");
                        } else {
                            $('#' + panel.divElement.id + '-resultInfo').html("Found " + data.total + " concepts");
                        }
                        $.each(data.matches, function (i, row){
                            $('#' + panel.divElement.id + '-outputBody').append("<tr><td>" + row.defaultTerm + "</td><td>" + row.conceptId + "</td></tr>");
                            $('#' + panel.divElement.id + '-outputBody2').append("<tr><td>" + row.defaultTerm + "</td><td>" + row.conceptId + "</td></tr>");
                        });
                        if (limit + skip < data.total) {
                            $('#' + panel.divElement.id + '-footer').html("<span id='" + panel.divElement.id + "-more'>Show more (viewing " + (limit + skip) + " of " + data.total + " total)</span>");
                        } else {
                            $('#' + panel.divElement.id + '-footer').html("Showing all " + data.total + " matches");
                        }

                        $('#' + panel.divElement.id + '-more').unbind();
                        $('#' + panel.divElement.id + '-more').click(function (e) {
                            skip = skip + 100;
                            panel.compute(request, false);
                        });
                    }
                }).error(function (xhr, ajaxOptions, thrownError) {
                    console.log(thrownError);
                    var status = xhr.status;
                    if (status == 504) {
                        $('#' + panel.divElement.id + '-resultInfo').html("This query cannot be completed in real-time, please schedule a Cloud executions.");
                        $('#' + panel.divElement.id + '-footer').html("Timeout Error, use the Cloud for running this query");
                    } else {
                        $('#' + panel.divElement.id + '-resultInfo').html("This query cannot be completed in real-time, please schedule a Cloud executions.");
                        $('#' + panel.divElement.id + '-footer').html("Use the Cloud for running this query");
                    }
                });
            }
        }
    };
}