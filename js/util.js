/**
 * Created by alo on 7/18/14.
 */

channel = postal.channel("Selections");

$(document).on('dragend', function(){
    removeHighlight();
});

function removeHighlight(){
    $(document).find('.drop-highlighted').removeClass('drop-highlighted');
}

function allowDrop(ev) {
    ev.preventDefault();
    var aux;
    if (navigator.userAgent.indexOf("Firefox") > -1){
        aux = $(ev.toElement).closest("div");
    }else{
        aux = $(ev.target).closest("div");
    }
    $(aux).addClass("drop-highlighted");
}

//function iconToDrag(text){
//    var CVS = document.createElement('canvas'),
//        ctx = CVS.getContext('2d');
//
//    CVS.width  = 500;
//    CVS.height = 500;
//    document.body.appendChild(CVS); // Add canvas to DOM
//
//// GRAPHICS TO CANVAS /////
//    function sendToCanvas( ob ){
//        var img = new Image();
//        img.onload = function(){
//            ctx.drawImage(img, 0, 0);
//            ctx.font = ob.fontWeight+' '+ob.fontSize+' '+ob.fontFamily;
//            ctx.textAlign = 'center';
//            ctx.fillStyle = ob.color;
//            ctx.fillText(ob.text, CVS.width/2, CVS.height/2.5);
//        };
//        img.src = ob.image;
//        return img;
//    }
/////////////////////////////
//
//// DO IT! /////////////////
//    return sendToCanvas({
//        image      : "http://icons.iconarchive.com/icons/media-design/hydropro/512/HP-Firefox-icon.png",
//        text       : text,
//        fontFamily : "Arial",
//        fontWeight : "bold",
//        fontSize   : "30px",
//        color      : "rgba(0, 0, 0, 0.7)"
//    });
//}

function drag(ev, id) {
    var dataText = "";
    var term = "", conceptId = "";
    $.each(ev.target.attributes, function (){
        if (this.name.substr(0, 4) == "data"){
            ev.dataTransfer.setData(this.name.substr(5), this.value);
            if (this.name.substr(5) == "concept-id"){
                conceptId = this.value;
            }
            if (this.name.substr(5) == "term"){
                term = this.value;
            }
        }
    });
//    var icon = document.createElement("img");
//    var icon = iconToDrag(term);
//    icon.src = "http://icons.iconarchive.com/icons/media-design/hydropro/512/HP-Firefox-icon.png";
//    console.log(icon);
//    ev.dataTransfer.setDragImage(icon, 0, 0);
    dataText = conceptId + "|" + term;
    ev.dataTransfer.setData("Text", dataText);
    ev.dataTransfer.setData("divElementId", id);
}

function dropC(ev, id) {
    $(document).find('.drop-highlighted').removeClass('drop-highlighted');
    ev.preventDefault();
    var text = ev.dataTransfer.getData("Text");
    var i = 0;
    while (text.charAt(i) != "|"){
        i++;
    }
    var conceptId = ev.dataTransfer.getData("concept-id");
    if (typeof conceptId == "undefined"){
        conceptId = text.substr(0, i);
    }
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
                        panelAct.subscribe(field);
                        panelAct.setupOptionsPanel();
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
    $(document).find('.drop-highlighted').removeClass('drop-highlighted');
    ev.preventDefault();
    var text = ev.dataTransfer.getData("Text");
    var i = 0;
    while (text.charAt(i) != "|"){
        i++;
    }
    var divElementId = id;
    var panel;
    var panelD = ev.dataTransfer.getData("panel");
    var conceptId = ev.dataTransfer.getData("concept-id");
    if (typeof conceptId == "undefined"){
        conceptId = text.substr(0, i);
    }
    var term = ev.dataTransfer.getData("term");
    if (typeof term == "undefined"){
        term = text.substr(i);
    }
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
                    field.setupOptionsPanel();
                }
            }
        });
    }
}

function alertEvent(message, type) {
    $.notify(message,type);
}


