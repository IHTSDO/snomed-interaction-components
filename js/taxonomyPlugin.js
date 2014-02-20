/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

function taxonomyPanel(divElement, options) {
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
    this.options = options;
    this.url = "http://107.170.33.116:3000/";
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
        var taxonomyHtml = "<div style='height:100%;margin: 5px;' class='panel panel-default' id='" + panel.divElement.id + "-mainPanel'>";
        taxonomyHtml = taxonomyHtml + "<div class='panel-heading' id='" + panel.divElement.id + "-panelHeading'>";
        taxonomyHtml = taxonomyHtml + "<button id='" + panel.divElement.id + "-subscribersMarker' class='btn btn-link btn-lg' style='padding: 2px; position: absolute;top: 1px;right: 20px;'><i class='glyphicon glyphicon-bookmark'></i></button>"
        taxonomyHtml = taxonomyHtml + "<div class='row'>";
        taxonomyHtml = taxonomyHtml + "<div class='col-md-6' id='" + panel.divElement.id + "-panelTitle'><strong>Taxonomy</strong></div>";
        taxonomyHtml = taxonomyHtml + "<div class='col-md-6 text-right'>";
        taxonomyHtml = taxonomyHtml + "<span id='" + panel.divElement.id + "-linkerButton' class='jqui-draggable' data-panel='" + panel.divElement.id + "' style='padding:2px'><i class='glyphicon glyphicon-link'></i></span>"
        taxonomyHtml = taxonomyHtml + "<button id='" + panel.divElement.id + "-configButton' class='btn btn-link' data-toggle='modal' style='padding:2px' data-target='#" + panel.divElement.id + "-configModal'><i class='glyphicon glyphicon-cog'></i></button>"
        taxonomyHtml = taxonomyHtml + "<button id='" + panel.divElement.id + "-collapseButton' class='btn btn-link' style='padding:2px'><i class='glyphicon glyphicon-resize-small'></i></button>"
        taxonomyHtml = taxonomyHtml + "<button id='" + panel.divElement.id + "-expandButton' class='btn btn-link' style='padding:2px'><i class='glyphicon glyphicon-resize-full'></i></button>"
        taxonomyHtml = taxonomyHtml + "<button id='" + panel.divElement.id + "-closeButton' class='btn btn-link' style='padding:2px'><i class='glyphicon glyphicon-remove'></i></button>"
        taxonomyHtml = taxonomyHtml + "</div>";
        taxonomyHtml = taxonomyHtml + "</div>";
        taxonomyHtml = taxonomyHtml + "</div>";
        taxonomyHtml = taxonomyHtml + "<div class='panel-body' id='" + panel.divElement.id + "-panelBody'>";
        taxonomyHtml = taxonomyHtml + "</div>";
        taxonomyHtml = taxonomyHtml + "</div>";
        $(divElement).html(taxonomyHtml);
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
        $("#" + panel.divElement.id + "-linkerButton").draggable({
            appendTo: 'body',
            helper: 'clone',
            delay: 500
        });
        
        $("#" + panel.divElement.id + "-panelBody").droppable({
            drop: panel.handleDropEvent,
            hoverClass: "bg-info"
        });
        
        $("#" + panel.divElement.id + "-panelHeading").droppable({
            drop: panel.handleDropEvent,
            hoverClass: "bg-info"
        });

        //$("#"  + panel.divElement.id +  "-mainPanel").resizable();

        $("#" + panel.divElement.id + "-linkerButton").click(function(event) {
            $("#" + panel.divElement.id + "-linkerButton").popover({
                trigger: 'manual',
                placement: 'bottom',
                html: true,
                content: function() {
                    linkerHtml = '<div class="text-center text-muted"><em>Drag to link with other panels<br>';
                    if (panel.subscribers.length == 1) {
                        linkerHtml = linkerHtml + panel.subscribers.length + ' link established</em></div>';
                    } else {
                        linkerHtml = linkerHtml + panel.subscribers.length + ' links established</em></div>';
                    }
                    return linkerHtml;
                }
            });
            $("#" + panel.divElement.id + "-linkerButton").popover('toggle');
        });
    }

    this.setupParents = function(parents, focusConcept) {
        var treeHtml = "<div style='height:100%;overflow:auto;margin-bottom: 15px;'>";
        treeHtml = treeHtml + "<ul style='list-style-type: none; padding-left: 5px;'>";
        var lastParent;
        $.each(parents, function(i, parent) {
            lastParent = parent;
            treeHtml = treeHtml + "<li id='" + panel.divElement.id + "-treenode-" + parent.conceptId + "' data-concept-id='" + parent.conceptId + "' data-term='" + parent.defaultTerm + "' class='jqui-draggable treeLabel'>";
            //treeHtml = treeHtml + "<button class='btn btn-link btn-xs load-children-button treeButton' style='padding:2px'><i class='glyphicon glyphicon-chevron-right treeButton'  id='" + panel.divElement.id + "-treeicon-" + parent.conceptId + "'></i></button>";
            treeHtml = treeHtml + parent.defaultTerm;
            treeHtml = treeHtml + "</li>";
        });
        if (parents.length > 0) {
            treeHtml = treeHtml.slice(0, -5);
        }
        treeHtml = treeHtml + "<ul style='list-style-type: none; padding-left: 15px;'>";
        treeHtml = treeHtml + "<li id='" + panel.divElement.id + "-treenode-" + focusConcept.conceptId + "' data-concept-id='" + focusConcept.conceptId + "' data-term='" + focusConcept.defaultTerm + "' class='jqui-draggable treeLabel'>";
        treeHtml = treeHtml + "<button class='btn btn-link btn-xs load-children-button treeButton' style='padding:2px'><i class='glyphicon glyphicon-chevron-right treeButton'  id='" + panel.divElement.id + "-treeicon-" + focusConcept.conceptId + "'></i></button>";
        treeHtml = treeHtml + focusConcept.defaultTerm;
        treeHtml = treeHtml + "</li>";
        treeHtml = treeHtml + "</ul>";
        if (parents.length > 0) {
            treeHtml = treeHtml + "</li>";
        }
        treeHtml = treeHtml + "</ul>";
        treeHtml = treeHtml + "</div>";
        $("#" + panel.divElement.id + "-panelBody").html(treeHtml);

        $(".load-children-button").disableTextSelect();

        $('#' + panel.divElement.id + "-treenode-" + 138875005).draggable({
            appendTo: 'body',
            helper: 'clone',
            delay: 500
        });

        $("#" + panel.divElement.id + "-panelBody").dblclick(function(event) {
            if ($(event.target).hasClass("treeLabel")) {
                var selectedId = $(event.target).attr('data-concept-id');
                var selectedLabel = $(event.target).attr('data-term');
                if (typeof selectedId != "undefined") {
                    $.getJSON(panel.url + "browser-2/snomed/concepts/" + selectedId + "/parents?form=inferred", function(result) {
                        // done
                    }).done(function(result) {
                        panel.setupParents(result, {conceptId: selectedId, defaultTerm: selectedLabel});
                    }).fail(function() {
                    });
                }
            }
        });
        $("#" + panel.divElement.id + "-panelBody").unbind( "click" );
        $("#" + panel.divElement.id + "-panelBody").click(function(event) {
            console.log("pasando");
            if ($(event.target).hasClass("treeButton")) {
                var conceptId = $(event.target).closest("li").attr('data-concept-id');
                var iconId = panel.divElement.id + "-treeicon-" + conceptId;
                event.preventDefault();
                if ($("#" + iconId).hasClass("glyphicon-chevron-down")) {
                    //console.log("close");
                    $(event.target).closest("li").find("ul").remove();
                    $("#" + iconId).removeClass("glyphicon-chevron-down");
                    $("#" + iconId).addClass("glyphicon-chevron-right");
                } else {
                    //console.log("open");
                    $("#" + iconId).removeClass("glyphicon-chevron-right");
                    $("#" + iconId).addClass("glyphicon-refresh");
                    $("#" + iconId).addClass("icon-spin");
                    panel.getChildren($(event.target).closest("li").attr('data-concept-id'));
                }

            } else if ($(event.target).hasClass("treeLabel")) {
                var selectedId = $(event.target).attr('data-concept-id');
                if (typeof selectedId != "undefined") {
                    $.each(panel.subscribers, function(i, suscriberPanel) {
                        suscriberPanel.conceptId = selectedId;
                        suscriberPanel.updateCanvas();
                    });
                }
            }

        });

        var iconId = panel.divElement.id + "-treeicon-" + focusConcept.conceptId;
        $("#" + iconId).removeClass("glyphicon-chevron-right");
        $("#" + iconId).addClass("glyphicon-refresh");
        $("#" + iconId).addClass("icon-spin");
        panel.getChildren(focusConcept.conceptId);
    }

    this.getChildren = function(conceptId) {
        $.getJSON(panel.url + "browser-2/snomed/concepts/" + conceptId + "/children?form=inferred", function(result) {
        }).done(function(result) {
            var nodeHtml = "<ul style='list-style-type: none; padding-left: 15px;'>";
            result.sort(function(a, b) {
                if (a.defaultTerm < b.defaultTerm)
                    return -1;
                if (a.defaultTerm > b.defaultTerm)
                    return 1;
                return 0;
            })
            //console.log(JSON.stringify(result));
            var listIconIds = [];
            $.each(result, function(i, field) {
                if (field.active == true) {
                    nodeHtml = nodeHtml + "<li id='" + panel.divElement.id + "-treenode-" + field.conceptId + "'  data-concept-id='" + field.conceptId + "' data-term='" + field.defaultTerm + "' class='jqui-draggable treeLabel'>";
                    nodeHtml = nodeHtml + "<button class='btn btn-link btn-xs load-children-button treeButton' style='padding:2px'><i class='glyphicon glyphicon-chevron-right treeButton' id='" + panel.divElement.id + "-treeicon-" + field.conceptId + "'></i></button>";
                    nodeHtml = nodeHtml + field.defaultTerm;
                    listIconIds.push(field.conceptId);
                }
            });
            nodeHtml = nodeHtml + "</li>";
            nodeHtml = nodeHtml + "</ul>";
            $("#" + panel.divElement.id + "-treeicon-" + conceptId).removeClass("glyphicon-refresh");
            $("#" + panel.divElement.id + "-treeicon-" + conceptId).removeClass("icon-spin");
            $("#" + panel.divElement.id + "-treeicon-" + conceptId).addClass("glyphicon-chevron-down");

            $("#" + panel.divElement.id + "-treenode-" + conceptId).append(nodeHtml);
            $(".load-children-button").disableTextSelect();
            //console.log(JSON.stringify(listIconIds));
            $.each(listIconIds, function(i, nodeId) {
                $('#' + panel.divElement.id + "-treenode-" + nodeId).draggable({
                    appendTo: 'body',
                    helper: 'clone',
                    delay: 500
                });
            });
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
            if (typeof conceptId != "undefined") {
                $("#" + panel.divElement.id + "-panelBody").html("<i class='glyphicon glyphicon-refresh icon-spin'></i>");
                $.getJSON(panel.url + "browser-2/snomed/concepts/" + conceptId + "/parents?form=inferred", function(result) {
                    // done
                }).done(function(result) {
                    panel.setupParents(result, {conceptId: conceptId, defaultTerm: term});
                }).fail(function() {
                });
            }
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
        $.each(panel.subscribers, function(i, field) {
            this.unsubscribe(field);
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
    this.setupParents([], {conceptId: 138875005, defaultTerm: "SNOMED CT Concept"});
}
