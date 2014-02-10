$(function() {
    $.extend($.fn.disableTextSelect = function() {
        return this.each(function() {
            $(this).mousedown(function() {
                return false;
            });
        });
    });
    $('.noSelect').disableTextSelect();//No text selection on elements with a class of 'noSelect'
});

function conceptDetails(divElement, conceptId, options) {
    var panel = this;
    this.conceptId = conceptId;
    this.divElement = divElement;
    this.options = options;
    this.url = "http://ec2-23-22-254-72.compute-1.amazonaws.com/sct-rest-api/";

    this.attributesPId = "";
    this.descsPId = "";
    this.relsPId = "";

    if (typeof options.url != "undefined") {
        this.url = options.url;
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
        $(divElement).html();
        // main panel
        detailsHtml = "<div style='width:500px;'>";
        detailsHtml = detailsHtml +  "<p>Concept Details ";
        detailsHtml = detailsHtml + "<button id='" + panel.divElement.id + "-configButton' class='glyphicon glyphicon-cog' data-toggle='modal' data-target='#" + panel.divElement.id + "-configModal'></button></p>";
        detailsHtml = detailsHtml + "<div id='" + panel.attributesPId + "' class='panel panel-default'>";
        detailsHtml = detailsHtml + "</div>";
        detailsHtml = detailsHtml + "<div id='" + panel.descsPId + "' class='panel panel-default'>";
        detailsHtml = detailsHtml + "</div>";
        detailsHtml = detailsHtml + "<div id='" + panel.relsPId + "' class='panel panel-default'>";
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
        detailsHtml = detailsHtml + "<button id='" + panel.divElement.id + "-apply-button' type='button' class='btn btn-primary'>Apply changes</button>";
        detailsHtml = detailsHtml + "</div>";
        detailsHtml = detailsHtml + "</div><!-- /.modal-content -->";
        detailsHtml = detailsHtml + "</div><!-- /.modal-dialog -->";
        detailsHtml = detailsHtml + "</div><!-- /.modal -->";
        
        $(divElement).html(detailsHtml);
        $("#" + panel.divElement.id + "-configButton").disableTextSelect();
        $("#" + panel.divElement.id + "-apply-button").click(function() {
            console.log("apply!");
            panel.readOptionsPanel();
            panel.updateCanvas();
        });
        panel.updateCanvas();
        panel.setupOptionsPanel();
    }

    this.updateCanvas = function() {
        //console.log("UPDATE:");
        //console.log(JSON.stringify(panel.options));
        $('#' + panel.attributesPId).html($('#' + panel.attributesPId).html() + "<i class='glyphicon glyphicon-refresh icon-spin'></i>");
        $('#' + panel.descsPId).html($('#' + panel.descsPId).html() + "<i class='glyphicon glyphicon-refresh icon-spin'></i>");
        $('#' + panel.relsPId).html($('#' + panel.relsPId).html() + "<i class='glyphicon glyphicon-refresh icon-spin'></i>");
        // load attributes
        $.getJSON(panel.url + "rest/snomed/concepts/" + panel.conceptId, function(result) {
            panel.attributesPId = divElement.id + "-attributes-panel";
            attrHtml = "<div class='jqui-droppable'><h3>" + result.description +  "</h4><br>SCTID: " + result.sctid + ", " + result.definitionStatus.defaultTerm;
            if (result.active == true) {
                attrHtml = attrHtml + ", ACTIVE";
            } else {
                attrHtml = attrHtml + ", INACTIVE";
            }
            attrHtml = attrHtml + "</div>";
            $('#' + panel.attributesPId).html(attrHtml);
            $('#' + panel.attributesPId).find('.jqui-droppable').droppable({
                drop: handleDropEvent,
                hoverClass: "bg-info"
            });
            function handleDropEvent(event, ui) {
                var draggable = ui.draggable;
                console.log(draggable.html() + " |  " + draggable.attr('data-concept-id') + ' was dropped onto me!');
                panel.conceptId = draggable.attr('data-concept-id');
                panel.updateCanvas()
            }
        }).done(function() {
            //$(divElement).html(detailsHtml);
        }).fail(function() {
            $('#' + panel.attributesPId).html("<div class='alert alert-danger'><strong>Error</strong> while retrieving data from server...</div>");
        });

        // load descriptions
        $.getJSON(panel.url + "rest/snomed/concepts/" + panel.conceptId + "/descriptions", function(result) {
            panel.descsPId = divElement.id + "-descriptions-panel";
            descDetailsHtml = "<table class='table table-bordered' id = '" + panel.descsPId + "-table'>";
            descDetailsHtml = descDetailsHtml + "<thead><tr>";
            descDetailsHtml = descDetailsHtml + "<th>Term</th>";
            if (panel.options.showIds == true) {
                descDetailsHtml = descDetailsHtml + "<th>SCTID</th>";
            }
            descDetailsHtml = descDetailsHtml + "</tr></thead><tbody>";
            $.each(result, function(i, field) {
                if (field.active == true) {
                    var row = "";
                    if (field.type.conceptId == "900000000000003001") {
                        row = "<tr class='fsn-row'>";
                    } else {
                        row = "<tr class='synonym-row'>";
                    }

                    row = row + "<td><div class='jqui-draggable' data-concept-id='" + field.conceptId + "'>" + field.term + "</div></td>";

                    if (panel.options.showIds == true) {
                        row = row + "<td>" + field.descSctid + "</td>";
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
                containment: 'window',
                helper: 'clone'
            });
        }).done(function() {
            //$(divElement).html(detailsHtml);
        }).fail(function() {
            $('#' + panel.descsPId).html("<div class='alert alert-danger'><strong>Error</strong> while retrieving data from server...</div>");
        });

        // load relationships
        $.getJSON(panel.url + "rest/snomed/concepts/" + panel.conceptId + "/relationships", function(result) {
            panel.relsPId = divElement.id + "-rels-panel";
            relsDetailsHtml = "<table class='table table-bordered'>";
            relsDetailsHtml = relsDetailsHtml + "<thead><tr>";
            relsDetailsHtml = relsDetailsHtml + "<th>Type</th>";
            relsDetailsHtml = relsDetailsHtml + "<th>Destination</th>";
            relsDetailsHtml = relsDetailsHtml + "<th>Group</th>";
            relsDetailsHtml = relsDetailsHtml + "<th>CharType</th>";
            relsDetailsHtml = relsDetailsHtml + "</tr></thead><tbody>";
            $.each(result, function(i, field) {
                if (field.active = "true") {
                    var row = "";
                    if (field.charType.conceptId == "900000000000010007") {
                        row = "<tr class='stated-rel'>";
                    } else {
                        row = "<tr class='inferred-rel'>";
                    }

                    row = row + "<td><div class='jqui-draggable'data-concept-id='" + field.type.conceptId + "'>" + field.type.defaultTerm + "</div></td>";
                    row = row + "<td><div class='jqui-draggable'data-concept-id='" + field.target.conceptId + "'>" + field.target.defaultTerm + "</div></td>";
                    row = row + "<td>" + field.groupId + "</td>";
                    if (field.charType.conceptId == "900000000000010007") {
                        row = row + "<td>Stated</td>";
                    } else if (field.charType.conceptId == "900000000000011006") {
                        row = row + "<td>Inferred</td>";
                    } else {
                        row = row + "<td>Other</td>";
                    }
                    row = row + "</tr>";
                    relsDetailsHtml = relsDetailsHtml + row;
                }
            });
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
                containment: 'window',
                helper: 'clone'
            });
        }).done(function() {
            //$(divElement).html(detailsHtml);
        }).fail(function() {
            $('#' + panel.relsPId).html("<div class='alert alert-danger'><strong>Error</strong> while retrieving data from server...</div>");
        });
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
        optionsHtml = optionsHtml + '</form>';
        $("#" + panel.divElement.id + "-modal-body").html(optionsHtml);
    }

    this.readOptionsPanel = function() {
        console.log($('input[name=displaySynonyms]:checked', "#" + panel.divElement.id + "-options-form").val());
        panel.options.displaySynonyms = ($('input[name=displaySynonyms]:checked', "#" + panel.divElement.id + "-options-form").val() == "true");
        console.log($('input[name=displayIds]:checked', "#" + panel.divElement.id + "-options-form").val());
        panel.options.showIds = ($('input[name=displayIds]:checked', "#" + panel.divElement.id + "-options-form").val() == "true");
        console.log($("#" + panel.divElement.id + "-relsViewOption").val());
        panel.options.selectedView = $("#" + panel.divElement.id + "-relsViewOption").val();
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



