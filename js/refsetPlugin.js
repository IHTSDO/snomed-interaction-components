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
                if (a.defaultTerm < b.defaultTerm)
                    return -1;
                if (a.defaultTerm > b.defaultTerm)
                    return 1;
                return 0;
            });
            var context = {
                refsets: panel.options.manifest.refsets
            }
            $("#" + panel.divElement.id + "-panelBody").html(JST["views/refsetPlugin/body.hbs"](context));
            $('#' + panel.divElement.id + '-panelBody').find(".refset-item").click(function (event) {
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
}