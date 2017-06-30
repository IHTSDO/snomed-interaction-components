/**
 * Created by alo on 5/9/15.
 */
var e_openCurlyBraces = '<span class="exp-brackets">{</span>';
var e_closeCurlyBraces = '<span class="exp-brackets">}</span>';
var e_colon = '<span class="exp-operators">:</span>';
var e_plus = '<span class="exp-operators">+</span>';
var e_equals = '<span class="exp-operators">=</span>';
var e_pipe = '<span class="exp-pipes">|</span>';

var panel = {};

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

    //console.log(div);

    var context = {
        divElementId: div.attr('id'),
        preCoordinatedExpressionHtml: preCoordinatedHtml,
        statedExpressionHtml: statedHtml,
        inferredExpressionHtml: inferredHtml,
        plainPreCoordinatedExpression: plainPreCoordinatedExpression,
        plainStatedExpression: plainStatedExpression,
        plainInferredExpression: plainInferredExpression
    };
    div.html(JST["views/conceptDetailsPlugin/tabs/expression.hbs"](context).trim());

    if (panel.clipboard) panel.clipboard.destroy();
    panel.clipboard = new Clipboard('.clip-btn-exp');
    panel.clipboard.on('success', function(e) {
        // console.info('Action:', e.action);
        // console.info('Text:', e.text);
        // console.info('Trigger:', e.trigger);
        alertEvent("Copied!", "info");
        e.clearSelection();
    });
    panel.clipboard.on('error', function(e) {
        console.log("Error!");
        alertEvent("Error", "error");
    });
};