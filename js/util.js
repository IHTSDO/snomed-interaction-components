/**
 * Created by alo on 7/18/14.
 */

function removeHighlight(){
    $(document).find('.drop-highlighted').removeClass('drop-highlighted');
}

function allowDrop(ev) {
    ev.preventDefault();
    $(ev.toElement).addClass("drop-highlighted");
}

function drag(ev, id) {
    $.each(ev.target.attributes, function (){
        if (this.name.substr(0, 4) == "data"){
            ev.dataTransfer.setData(this.name.substr(5), this.value);
        }
    });
    ev.dataTransfer.setData("divElementId", id);
}

function dropC(ev, id) {
    $(document).find('.drop-highlighted').removeClass('drop-highlighted');
    ev.preventDefault();
    var conceptId = ev.dataTransfer.getData("concept-id");
    var panelD = ev.dataTransfer.getData("panel");
    var divElementID = id;
    var panelAct;
    $.each(componentsRegistry, function (i, field){
        if (field.divElement.id == divElementID){
            panelAct = field;
        }
    });
    if (!conceptId) {
        if (!panelD) {
        } else {
            $.each(componentsRegistry, function(i, field) {
                if (field.divElement.id == panelD) {
                    if (field.type == "search" || field.type == "taxonomy") {
                        field.subscribe(panelAct);
                    }
                }
            });
        }
    } else {
        if (panelAct.conceptId != conceptId) {
            panelAct.conceptId = conceptId;
            panelAct.updateCanvas();
        }
    }
}

function dropT(ev, id) {
    var divElementId = id;
    var panel;
    var panelD = ev.dataTransfer.getData("panel");
    var conceptId = ev.dataTransfer.getData("concept-id");
    var term = ev.dataTransfer.getData("term");
    var definitionStatus = ev.dataTransfer.getData("def-status");
    var module = ev.dataTransfer.getData("module");

    $.each(componentsRegistry, function (i, field){
        if (field.divElement.id == divElementId){
            panel = field;
        }
    });

    if (!conceptId) {
    } else {
        if (panel.options.selectedView == "undefined") {
            panel.options.selectedView = "inferred";
        }
        if (typeof conceptId != "undefined") {
            panel.setToConcept(conceptId, term, definitionStatus, module);
        }
    }
    if (!panelD) {
    } else {
        //console.log("OK : " + draggable.attr('data-panel'));
        $.each(componentsRegistry, function(i, field) {
            if (field.divElement.id == panelD) {
                if (field.type == "concept-details") {
                    panel.subscribe(field);
                }
            }
        });
    }
}
