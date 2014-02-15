/* 
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
        searchHtml = "<div style='width:500px; margin: 5px;' class='panel panel-default'>";
        searchHtml = searchHtml + "<div class='panel-heading'>";
        searchHtml = searchHtml + "<button id='" + panel.divElement.id + "-subscribersMarker' class='btn btn-link btn-lg' style='padding: 2px; position: absolute;top: 1px;right: 64px;'><i class='glyphicon glyphicon-bookmark'></i></button>"
        searchHtml = searchHtml + "<div class='row'>";
        searchHtml = searchHtml + "<div class='col-md-8' id='" + panel.divElement.id + "-panelTitle'><strong>Search</strong></div>";
        searchHtml = searchHtml + "<div class='col-md-4 text-right'>";
        searchHtml = searchHtml + "<span id='" + panel.divElement.id + "-linkerButton' class='jqui-draggable' data-panel='" + panel.divElement.id + "' style='padding:2px'><i class='glyphicon glyphicon-link'></i></span>"
        searchHtml = searchHtml + "<button id='" + panel.divElement.id + "-historyButton' class='btn btn-link history-button' style='padding:2px'><i class='glyphicon glyphicon-time'></i></button>"
        searchHtml = searchHtml + "<button id='" + panel.divElement.id + "-configButton' class='btn btn-link' data-toggle='modal' style='padding:2px' data-target='#" + panel.divElement.id + "-configModal'><i class='glyphicon glyphicon-cog'></i></button>"
        searchHtml = searchHtml + "<button id='" + panel.divElement.id + "-collapseButton' class='btn btn-link' style='padding:2px'><i class='glyphicon glyphicon-resize-small'></i></button>"
        searchHtml = searchHtml + "<button id='" + panel.divElement.id + "-expandButton' class='btn btn-link' style='padding:2px'><i class='glyphicon glyphicon-resize-full'></i></button>"
        searchHtml = searchHtml + "<button id='" + panel.divElement.id + "-closeButton' class='btn btn-link' style='padding:2px'><i class='glyphicon glyphicon-remove'></i></button>"
        searchHtml = searchHtml + "</div>";
        searchHtml = searchHtml + "</div>";
        searchHtml = searchHtml + "</div>";
        searchHtml = searchHtml + "<div class='panel-body' id='" + panel.divElement.id + "-panelBody'>";
        searchHtml = searchHtml + '<form>';
        searchHtml = searchHtml + '<div class="form-group">';
        searchHtml = searchHtml + '<label for="' + panel.divElement.id + '-searchBox">Type at least 5 characters <i class="glyphicon glyphicon-remove text-danger" id="' + panel.divElement.id + '-typeIcon"></i></label>';
        searchHtml = searchHtml + '<input type="search" class="form-control" id="' + panel.divElement.id + '-searchBox" placeholder="Search..." autocomplete="off">';
        searchHtml = searchHtml + '</div>';
        searchHtml = searchHtml + '</form>';
        searchHtml = searchHtml + "<div id='searchResultItems' class='panel panel-default' style='height:100px;overflow:auto;margin-bottom: 15px;'>";
        searchHtml = searchHtml + "<table id='" + panel.divElement.id + "-resultsTable' class='table table-bordered'>";
        searchHtml = searchHtml + "</table>";
        searchHtml = searchHtml + "</div>";
        searchHtml = searchHtml + "</div>";
        searchHtml = searchHtml + "</div>";
        $(divElement).html(searchHtml);
        $('#' + panel.divElement.id + '-searchBox').keyup(function() {
            clearTimeout(thread);
            var $this = $(this);
            thread = setTimeout(function() {
                panel.search($this.val())
            }, 500);
        });
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
            helper: 'clone',
            delay: 500
        });
        $("#" + panel.divElement.id + "-linkerButton").droppable({
            drop: panel.handlePanelDropEvent,
            hoverClass: "bg-info"
        });
        $("#" + panel.divElement.id + "-historyButton").click(function(event) {
            $("#" + panel.divElement.id + "-historyButton").popover({
                trigger: 'manual',
                placement: 'bottom',
                html: true,
                content: function() {
                    historyHtml = '<div style="width:300px;height:100px;overflow:auto;">';
                    if (panel.history.length == 0) {
                        historyHtml = historyHtml + '<div class="text-center text-muted" style="width:100%"><em>No search terms yet...</em></div>';
                    }
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

    this.handlePanelDropEvent = function(event, ui) {
        var draggable = ui.draggable;
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

    this.search = function(t) {
        // panel.divElement.id + '-typeIcon
        if (t != "" && t != lastT) {
            if (t.length < 5) {
                $('#' + panel.divElement.id + '-typeIcon').removeClass('glyphicon-ok');
                $('#' + panel.divElement.id + '-typeIcon').removeClass('text-success');
                $('#' + panel.divElement.id + '-typeIcon').addClass('glyphicon-remove');
                $('#' + panel.divElement.id + '-typeIcon').addClass('text-danger');
            } else {
                $('#' + panel.divElement.id + '-typeIcon').removeClass('glyphicon-remove');
                $('#' + panel.divElement.id + '-typeIcon').removeClass('text-danger');
                $('#' + panel.divElement.id + '-typeIcon').addClass('glyphicon-ok');
                $('#' + panel.divElement.id + '-typeIcon').addClass('text-success');
                lastT = t;
                //console.log(t);
                var d = new Date();
                var time = d.getTime();
                panel.history.push({searchTerm: t, time: time});
                t = t.charAt(0).toUpperCase() + t.slice(1);
                //console.log("Capitalized t: " + t);
                $('#' + panel.divElement.id + '-resultsTable').html("<i class='glyphicon glyphicon-refresh icon-spin'></i>");
                resultsHtml = "";
                //%7B%22descriptions%22%3A%7B%24elemMatch%3A%7B%22term%22%3A%7B%24regex%3A%22%5EAsthma*%22%7D%2C%22active%22%3Atrue%7D%7D%2C%22active%22%3Atrue%7D
                if (xhr != null) {
                    xhr.abort();
                    console.log("aborting call...");
                }
                xhr = $.getJSON(panel.url + "browser-2/snomed?query=%7B%22descriptions%22%3A%7B%22%24elemMatch%22%3A%7B%22term%22%3A%7B%22%24regex%22%3A%22%5E" + t + "x*%22%7D%2C%22active%22%3Atrue%7D%7D%2C%22active%22%3Atrue%7D&limit=50&fields=%7B%22descriptions.term%22%3A1%2C%22descriptions.conceptId%22%3A1%2C%22descriptions.active%22%3A1%7D", function(result) {

                }).done(function(result) {
                    xhr = null;
                    var matchedDescriptions = [];
                    $.each(result, function(i, matchedConcept) {
                        $.each(matchedConcept.descriptions, function(i, loopDesc) {
                            //console.log(loopDesc.term.substring(0, t.length) + '-' + t.substring(0, t.length));
                            if (loopDesc.term.substring(0, t.length) == t.substring(0, t.length) && loopDesc.active == true) {
                                matchedDescriptions.push({term: loopDesc.term, conceptId: loopDesc.conceptId});
                            }
                        });
                    });
                    matchedDescriptions.sort(function(a, b) {
                        if (a.term.length < b.term.length)
                            return -1;
                        if (a.term.length > b.term.length)
                            return 1;
                        return 0;
                    })
                    $.each(matchedDescriptions, function(i, field) {
                        resultsHtml = resultsHtml + "<tr class='resultRow selectable-row'><td><div class='jqui-draggable result-item' data-concept-id='" + field.conceptId + "'>" + field.term + "</div></td></tr>";
                    });
                    if (matchedDescriptions.length == 0) {
                        resultsHtml = resultsHtml + "<tr><td><em>No results</em></td></tr>";
                    }
                    $('#' + panel.divElement.id + '-resultsTable').html(resultsHtml);
                    $('#' + panel.divElement.id + '-resultsTable').find(".jqui-draggable").draggable({
                        containment: 'window',
                        helper: 'clone',
                        delay: 500
                    });
                    $('#' + panel.divElement.id + '-resultsTable').find(".result-item").click(function(event) {
                        $.each(panel.subscribers, function(i, field) {
//console.log("Notify to " + field.divElement.id + " selected " + $(event.target).attr('data-concept-id'));
                            field.conceptId = $(event.target).attr('data-concept-id');
                            field.updateCanvas();
                        });
                    });
                }).fail(function() {
//$('#resultsTable').html("<div class='alert alert-danger'><strong>Error</strong> while retrieving data from server...</div>");
                });
            }
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
}

function searchInPanel(divElementId, searchTerm) {
    $.each(componentsRegistry, function(i, field) {
//console.log(field.divElement.id + ' == ' + divElementId);
        if (field.divElement.id == divElementId) {
            $('#' + divElementId + '-searchBox').val(searchTerm);
            field.search(searchTerm);
        }
    });
    $('.history-button').popover('hide');
}

$(document).keypress(function(event) {
    if (event.which == '13') {
        event.preventDefault();
    }
});