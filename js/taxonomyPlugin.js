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
        var taxonomyHtml = "<div style='width:500px; margin: 5px;' class='panel panel-default'>";
        taxonomyHtml = taxonomyHtml + "<div class='panel-heading'>";
        taxonomyHtml = taxonomyHtml + "<button id='" + panel.divElement.id + "-subscribersMarker' class='btn btn-link btn-lg' style='padding: 2px; position: absolute;top: 1px;right: 4px;'><i class='glyphicon glyphicon-bookmark'></i></button>"
        taxonomyHtml = taxonomyHtml + "<div class='row'>";
        taxonomyHtml = taxonomyHtml + "<div class='col-md-8' id='" + panel.divElement.id + "-panelTitle'><strong>Taxonomy</strong></div>";
        taxonomyHtml = taxonomyHtml + "<div class='col-md-4 text-right'>";
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
            containment: 'window',
            helper: 'clone'
        });
        $("#" + panel.divElement.id + "-linkerButton").droppable({
            drop: panel.handlePanelDropEvent,
            hoverClass: "bg-info"
        });
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

    this.addTree = function() {
        var treeHtml = "<div style='height:400px;overflow:auto;margin-bottom: 15px;'>";
        treeHtml = treeHtml + "<ul style='list-style-type: none; padding-left: 5px;'>";
        treeHtml = treeHtml + "<li id='" + panel.divElement.id + "-treenode-" + 138875005 + "' data-concept-id='138875005' class='jqui-draggable'>";
        treeHtml = treeHtml + "<button class='btn btn-link btn-xs load-children-button' style='padding:2px'><i class='glyphicon glyphicon-chevron-right'  id='" + panel.divElement.id + "-treeicon-" + 138875005 + "'></i></button>";
        treeHtml = treeHtml + "SNOMED CT Root";
        treeHtml = treeHtml + "</li>";
        treeHtml = treeHtml + "</ul>";
        treeHtml = treeHtml + "</div>";
        $("#" + panel.divElement.id + "-panelBody").html(treeHtml);

        $(".load-children-button").disableTextSelect();

        $('#' + panel.divElement.id + "-treenode-" + 138875005).draggable({
            containment: 'window',
            helper: 'clone'
        });
        $('#' + panel.divElement.id + "-treenode-" + 138875005).click(function(event) {
            var selectedId = $(event.target).attr('data-concept-id');
            if (typeof selectedId != "undefined") {
                $.each(panel.subscribers, function(i, suscriberPanel) {
                    suscriberPanel.conceptId = selectedId;
                    suscriberPanel.updateCanvas();
                });
            }
        });

        this.addOpenTreeClickAction(panel.divElement.id + "-treeicon-" + 138875005);
    }

    this.addOpenTreeClickAction = function(iconId) {
        $("#" + iconId).click(function(event) {
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
        });
    }

    this.getChildren = function(conceptId) {
        $.getJSON(panel.url + "browser-2/snomed?query=%7B%22relationships%22%3A%7B%22%24elemMatch%22%3A%7B%22target.conceptId%22%20%3A%20" + conceptId + "%2C%20%22active%22%3A%20true%2C%20%22type.conceptId%22%3A%20116680003%7D%7D%7D&fields=%7B%22defaultTerm%22%3A1%2C%22conceptId%22%3A1%2C%22active%22%3A1%7D", function(result) {
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
                    nodeHtml = nodeHtml + "<li id='" + panel.divElement.id + "-treenode-" + field.conceptId + "'  data-concept-id='" + field.conceptId + "' class='jqui-draggable'>";
                    nodeHtml = nodeHtml + "<button class='btn btn-link btn-xs load-children-button' style='padding:2px'><i class='glyphicon glyphicon-chevron-right' id='" + panel.divElement.id + "-treeicon-" + field.conceptId + "'></i></button>";
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
                panel.addOpenTreeClickAction(panel.divElement.id + "-treeicon-" + nodeId);
                $('#' + panel.divElement.id + "-treenode-" + nodeId).draggable({
                    containment: 'window',
                    helper: 'clone'
                });
//                $('#' + panel.divElement.id + "-treenode-" + nodeId).click(function(event) {
//                    $.each(panel.subscribers, function(i, suscriberPanel) {
//                        console.log("click " + nodeId)
//                        suscriberPanel.conceptId = nodeId;
//                        suscriberPanel.updateCanvas();
//                    });
//                });
            });
        });
    }

    this.handlePanelDropEvent = function(event, ui) {
        var draggable = ui.draggable;
        if (!draggable.attr('data-panel')) {
        } else {
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
    this.addTree();
}