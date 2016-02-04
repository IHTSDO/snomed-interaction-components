/**
 * Created by alo on 5/9/15.
 */
var e_openCurlyBraces = '<span class="exp-brackets">{</span>';
var e_closeCurlyBraces = '<span class="exp-brackets">}</span>';
var e_colon = '<span class="exp-operators">:</span>';
var e_plus = '<span class="exp-operators">+</span>';
var e_equals = '<span class="exp-operators">=</span>';
var e_pipe = '<span class="exp-pipes">|</span>';

var referenceToExpression = function(conceptReference) {
    return conceptReference.conceptId + " " + e_pipe + "<span class='exp-term'>" +
        conceptReference.defaultTerm + "</span>" + e_pipe;
};

var conceptToPostCoordinatedExpression = function(concept, relsProperty, div, options) {
    var expression = "";
    var tab = "&nbsp;&nbsp;&nbsp;&nbsp;";
    if (concept.definitionStatus == "Fully defined" || concept.definitionStatus == "Sufficiently defined") {
        expression += "<span class='exp-operators'>===</span> ";
    } else {
        expression += "<span class='exp-operators'>&lt;&lt;&lt;</span> ";
    }
    if (concept[relsProperty] && concept[relsProperty].length > 0) {
        //expression += ' <span class="exp-brackets">{</span>';
        var firstParent = true;
        var attributes = {};
        $.each(concept[relsProperty], function(i, rel){
            if (rel.active == true && rel.type.conceptId == "116680003") {
                if (!firstParent) {
                    expression += " " + e_plus + " <br>";
                    expression += tab + referenceToExpression(rel.target);
                } else {
                    expression += referenceToExpression(rel.target);
                }
                firstParent = false;

            } else if (rel.active == true && rel.type.conceptId != "116680003") {
                if (!attributes[rel.groupId]) {
                    attributes[rel.groupId] = [];
                }
                attributes[rel.groupId].push(rel);
            }
        });
        //console.log(attributes);
        var groups = Object.keys(attributes);
        if (groups.length > 0) {
            expression += " " + e_colon;
        }
        $.each(groups, function(i, group){
            expression += "<br>";

            var firstInGroup = true;
            $.each(attributes[group], function(i, rel){
                if (!firstInGroup) {
                    expression += ", <br>";
                }
                if (group > 0) {
                    expression += tab + tab + tab;
                } else {
                    expression += tab + tab;
                }
                if (firstInGroup && group > 0) {
                    expression += e_openCurlyBraces + " ";
                } else if (group > 0){
                    expression += "&nbsp;&nbsp;";
                }
                firstInGroup = false;
                expression += referenceToExpression(rel.type) + " " + e_equals + " " + referenceToExpression(rel.target);
            });
            if (group != 0) {
                expression += " " + e_closeCurlyBraces;
            }
        });
    }
    return expression;
};

var renderExpression = function(concept, inferredConcept, div, options) {
    var preCoordinatedHtml = referenceToExpression(concept);
    var tmp = document.createElement("DIV");
    tmp.innerHTML = preCoordinatedHtml;
    var plainPreCoordinatedExpression =  tmp.textContent || tmp.innerText || "";
    plainPreCoordinatedExpression = plainPreCoordinatedExpression.replace(/\s\s+/g, ' ');

    var statedHtml = conceptToPostCoordinatedExpression(concept, "statedRelationships", div, options);
    var tmp = document.createElement("DIV");
    tmp.innerHTML = statedHtml;
    var plainStatedExpression =  tmp.textContent || tmp.innerText || "";
    plainStatedExpression = plainStatedExpression.replace(/\s\s+/g, ' ');

    var inferredHtml = conceptToPostCoordinatedExpression(concept, "relationships", div, options);
    var tmp = document.createElement("DIV");
    tmp.innerHTML = inferredHtml;
    var plainInferredExpression =  tmp.textContent || tmp.innerText || "";
    plainInferredExpression = plainInferredExpression.replace(/\s\s+/g, ' ');

    console.log(div);

    var context = {
        divElementId: div.attr('id'),
        preCoordinatedExpressionHtml: preCoordinatedHtml,
        statedExpressionHtml: statedHtml,
        inferredExpressionHtml: inferredHtml
    };
    div.html(JST["views/conceptDetailsPlugin/tabs/expression.hbs"](context).trim());

    var preCoordinatedCopy = new ZeroClipboard( document.getElementById(div.attr('id') + "-copy-pre-coordinated-expression") );
    preCoordinatedCopy.on( "ready", function( readyEvent ) {
        preCoordinatedCopy.on( "copy", function (event) {
            $("#" + div.attr('id') + "-copy-pre-coordinated-expression").addClass("animated rubberBand");
            window.setTimeout( function(){
                $("#" + div.attr('id') + "-copy-pre-coordinated-expression").removeClass('animated rubberBand');
            }, 1000);
            alertEvent("Pre-coordinated expression copied to clipboard", "info");
            var clipboard = event.clipboardData;
            clipboard.setData("text/plain", plainPreCoordinatedExpression);
        });
    } );

    var statedCopy = new ZeroClipboard( document.getElementById(div.attr('id') + "-copy-stated-expression") );
    statedCopy.on( "ready", function( readyEvent ) {
        statedCopy.on( "copy", function (event) {
            $("#" + div.attr('id') + "-copy-stated-expression").addClass("animated rubberBand");
            window.setTimeout( function(){
                $("#" + div.attr('id') + "-copy-stated-expression").removeClass('animated rubberBand');
            }, 1000);
            alertEvent("Post-coordinated expression (stated) copied to clipboard", "info");
            var clipboard = event.clipboardData;
            clipboard.setData("text/plain", plainStatedExpression);
        });
    } );

    var inferredCopy = new ZeroClipboard( document.getElementById(div.attr('id') + "-copy-inferred-expression") );
    inferredCopy.on( "ready", function( readyEvent ) {
        inferredCopy.on( "copy", function (event) {
            $("#" + div.attr('id') + "-copy-inferred-expression").addClass("animated rubberBand");
            window.setTimeout( function(){
                $("#" + div.attr('id') + "-copy-inferred-expression").removeClass('animated rubberBand');
            }, 1000);
            alertEvent("Post-coordinated expression (inferred) copied to clipboard", "info");
            var clipboard = event.clipboardData;
            clipboard.setData("text/plain", plainInferredExpression);
        });
    } );
};