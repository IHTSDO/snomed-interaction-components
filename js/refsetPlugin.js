/**
 * Created by termmed on 9/2/14.
 */
/**
 * Created by termmed on 9/1/14.
 */

function refsetPanel(divElement, options) {
    var panel = this;
    this.divElement = divElement;
    this.options = jQuery.extend(true, {}, options);
    var favoriteCall = null;
    this.type = "favorites";
    panel.subscribers = [];
    var xhrMembers = null;

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

    this.setUpPanel = function (){
        var context = {
            divElementId: panel.divElement.id
        }
        $(divElement).html(JST["views/refsetPlugin/main.hbs"](context));
    }
    panel.setUpPanel();

    this.loadRefsets = function(){
//        console.log(panel.options.manifest);
        if (panel.options.manifest){
            panel.options.manifest.refsets.sort(function (a, b) {
                if (a.type == "daily-build" && a.type != b.type)
                    return -1;
                if (a.type < b.type)
                    return -1;
                if (a.type > b.type)
                    return 1;
                if (a.defaultTerm < b.defaultTerm)
                    return -1;
                if (a.defaultTerm > b.defaultTerm)
                    return 1;
                return 0;
            });
            var context = {
                divElementId: panel.divElement.id,
                refsets: panel.options.manifest.refsets
            }
            $("#" + panel.divElement.id + "-panelBody").html(JST["views/refsetPlugin/body.hbs"](context));
            $('#' + panel.divElement.id + '-panelBody').find(".refset-item").click(function (event) {
                panel.loadMembers($(event.target).attr('data-concept-id'), $(event.target).attr('data-term'), 100, 0);
                channel.publish(panel.divElement.id, {
                    term: $(event.target).attr('data-term'),
                    module: $(event.target).attr("data-module"),
                    conceptId: $(event.target).attr('data-concept-id'),
                    source: panel.divElement.id
                });
            });
        }else{
            $("#" + panel.divElement.id + "-panelBody").html("<div class='alert alert-danger'><span class='i18n' data-i18n-id='i18n_ajax_failed'><strong>Error</strong> while retrieving data from server...</span></div>");
        }
    }
    panel.loadRefsets();

    this.loadMembers = function(conceptId, term, returnLimit, skipTo, paginate){
        var membersUrl = options.serverUrl + "/" + options.edition + "/" + options.release + "/concepts/" + conceptId + "/members?limit=" + returnLimit;
        if (skipTo > 0){
            membersUrl = membersUrl + "&skip=" + skipTo;
        }else{
            $("#" + panel.divElement.id + "-resultsTable").html("<tr><td class='text-muted' colspan='2'><i class='glyphicon glyphicon-refresh icon-spin'></i></td></tr>");
        }
        var total;
        if (panel.options.manifest){
            $.each(panel.options.manifest.refsets, function (i, field){
                if (field.conceptId == panel.conceptId){
                    if (field.count){
                        total = field.count;
                    }
                }
            });
        }
        if (typeof total != "undefined"){
            //if (total < 25000){
                paginate = 1;
                membersUrl = membersUrl + "&paginate=1";
            //}

        }
//        console.log(membersUrl);
        if (xhrMembers != null) {
            xhrMembers.abort();
            //console.log("aborting call...");
        }
        xhrMembers = $.getJSON(membersUrl, function(result){

        }).done(function(result){
            var remaining = "asd";
            if (typeof total == "undefined") total = result.details.total;
            if (total == skipTo){
                remaining = 0;
            }else{
                if (total > (skipTo + returnLimit)){
                    remaining = total - (skipTo + returnLimit);
                }else{
//                        if (result.details.total < returnLimit && skipTo != 0){
                    remaining = 0;
//                        }else{
//                            remaining = result.details.total;
//                        }
                }
            }
            if (remaining < returnLimit){
                var returnLimit2 = remaining;
            }else{
                if (remaining != 0){
                    var returnLimit2 = returnLimit;
                }else{
                    var returnLimit2 = 0;
                }
            }
            var context = {
                result: result,
                returnLimit: returnLimit2,
                remaining: remaining,
                divElementId: panel.divElement.id,
                skipTo: skipTo,
                term: term,
                conceptId: conceptId
            };
            Handlebars.registerHelper('if_eq', function(a, b, opts) {
                if (opts != "undefined") {
                    if(a == b)
                        return opts.fn(this);
                    else
                        return opts.inverse(this);
                }
            });
            Handlebars.registerHelper('if_gr', function(a,b, opts) {
                if (a){
                    if(a > b)
                        return opts.fn(this);
                    else
                        return opts.inverse(this);
                }
            });
            Handlebars.registerHelper('hasCountryIcon', function(moduleId, opts){
                if (countryIcons[moduleId])
                    return opts.fn(this);
                else
                    return opts.inverse(this);
            });
            if (result.members.length != 0){
                $("#" + panel.divElement.id + "-moreMembers").remove();
                $("#" + panel.divElement.id + "-resultsTable").find(".more-row").remove();
                if (skipTo == 0) {
                    $('#' + panel.divElement.id + "-resultsTable").html(JST["views/refsetPlugin/members.hbs"](context));
                }else{
                    $('#' + panel.divElement.id + "-resultsTable").append(JST["views/refsetPlugin/members.hbs"](context));
                }
                $("#" + panel.divElement.id + "-moreMembers").click(function(){
                    $("#" + panel.divElement.id + "-moreMembers").html("<i class='glyphicon glyphicon-refresh icon-spin'></i>");
                    skipTo = skipTo + returnLimit;
                    panel.loadMembers(conceptId, term, returnLimit2, skipTo , paginate);
                });
                $("#" + panel.divElement.id + "-sort").unbind();
                $("#" + panel.divElement.id + "-sort").click(function(){
                    $("#" + panel.divElement.id + "-sort").blur();
                    panel.loadMembers(conceptId, term, returnLimit2, 0, 1);
                });
            }else{
                if (skipTo != 0){
                    $("#" + panel.divElement.id + "-moreMembers").remove();
                    $("#" + panel.divElement.id + "-resultsTable").find(".more-row").remove();
                    if (skipTo == 0) {
                        $('#' + panel.divElement.id + "-resultsTable").html(JST["views/refsetPlugin/members.hbs"](context));
                    }else{
                        $('#' + panel.divElement.id + "-resultsTable").append(JST["views/refsetPlugin/members.hbs"](context));
                    }
                    $("#" + panel.divElement.id + "-moreMembers").click(function(){
                        $("#" + panel.divElement.id + "-moreMembers").html("<i class='glyphicon glyphicon-refresh icon-spin'></i>");
                        skipTo = skipTo + returnLimit;
                        panel.loadMembers(conceptId, term, returnLimit2, skipTo, paginate);
                    });
                    $("#" + panel.divElement.id + "-sort").unbind();
                    $("#" + panel.divElement.id + "-sort").click(function(){
                        $("#" + panel.divElement.id + "-sort").blur();
                        panel.loadMembers(conceptId, term, returnLimit2, 0, 1);
                    });
                }else{
                    $("#" + panel.divElement.id + "-resultsTable").html("<tr><td class='text-muted' colspan='2'><span data-i18n-id='i18n_no_members' class='i18n'>This concept has no members</span></td></tr>");
                }
            }
            $('#' + panel.divElement.id + '-resultsTable').find(".member-concept-row").click(function (event) {
                var clickedBadge = $(event.target).closest(".member-concept-row").find(".badge");
                channel.publish(panel.divElement.id, {
                    term: clickedBadge.attr('data-term'),
                    module: clickedBadge.attr("data-module"),
                    conceptId: clickedBadge.attr('data-concept-id'),
                    source: panel.divElement.id
                });
            });
        }).fail(function(err){
            if (xhrMembers.status === 0) {
                if (xhrMembers.statusText === 'abort') {
                }else{
                    $("#" + panel.divElement.id + "-resultsTable").html("<tr><td class='text-muted' colspan='2'><span data-i18n-id='i18n_no_members' class='i18n'>This concept has no members</span></td></tr>");
                }
            }else{
                $("#" + panel.divElement.id + "-resultsTable").html("<tr><td class='text-muted' colspan='2'><span data-i18n-id='i18n_no_members' class='i18n'>This concept has no members</span></td></tr>");
            }
        });
    }

}