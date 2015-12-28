/**
 * Created by termmed on 9/1/14.
 */

function queryComputerPanel(divElement, options) {
    var panel = this;
    panel.showId = false;
    var limit = 100;
    var skip = 0;
    var xhrTotal = null;
    var xhrExecute = null;
    panel.currentEx = 0;
    this.divElement = divElement;
    this.options = jQuery.extend(true, {}, options);
    this.type = "query-computer";
    panel.subscribers = [];
    panel.totalResults = [];

    if (!componentsRegistry){
        componentsRegistry = [];
        componentsRegistry.push(panel);
    }else{
        var componentLoaded = false;
        $.each(componentsRegistry, function(i, field) {
            if (field.divElement && field.divElement.id == panel.divElement.id) {
                componentLoaded = true;
            }
        });
        if (componentLoaded == false) {
            componentsRegistry.push(panel);
        }
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
    //panel.markerColor = panel.getNextMarkerColor(globalMarkerColor);
    panel.markerColor = "asdasdasdas";

    this.subscribe = function(panelToSubscribe) {
        var panelId = panelToSubscribe.divElement.id;
        var alreadySubscribed = false;
        if (!alreadySubscribed) {
            var subscription = channel.subscribe(panelId, function(data, envelope) {
                if (data){
                    panel.updateCanvas(data);
                }
            });
        }
        $("#" + panelId + "-ownMarker").show();
        $("#" + panel.divElement.id + "-subscribersMarker").show();
        $("#" + panelId + "-ownMarker").show();
    }

    this.setUpPanel = function (){
        var context = {
            divElementId: panel.divElement.id,
            examples: [
                {title: "All excision procedures performed on the digestive system", htmlValue: '<li data-modifier="Include" class="list-group-item clearfix query-condition"> <span class="text-muted line-number" style="font-size: 200%;">1</span>&nbsp;&nbsp; <span style="position: relative; top: -5px;"> <div style="width: 45px;display: inline-block;">Include,</div> <span class="constraint" data-term="Excision (procedure)" data-criteria="descendantOf" data-concept-id="65801008"> <!--descendantOf&nbsp;--> <div style="display: inline-block;" class="dropdown"> <button style="text-decoration: inherit; color: inherit; display: inline-block; padding: 0px;" class="btn btn-link dropdown-toggle" type="button" data-toggle="dropdown" aria-expanded="true"> descendantOf&nbsp; </button> <ul class="dropdown-menu" role="menu"> <li role="presentation"><a class="criteriaDropdownOption" role="menuitem" tabindex="-1" href="javascript:void(0);">descendantOf</a></li> <li role="presentation"><a class="criteriaDropdownOption" role="menuitem" tabindex="-1" href="javascript:void(0);">descendantOrSelfOf</a></li> <li role="presentation"><a class="criteriaDropdownOption" role="menuitem" tabindex="-1" href="javascript:void(0);">self</a></li> <li role="presentation"><a class="criteriaDropdownOption" role="menuitem" tabindex="-1" href="javascript:void(0);">isMemberOf</a></li> </ul> </div> <span style="color: forestgreen;">65801008</span>&nbsp; | <span style="color: firebrick;">Excision (procedure)</span> | </span> <br> <div style="margin-left: 45px; display: inline-block">AND</div> <span class="constraint" data-term="Procedure on digestive system (procedure)" data-criteria="descendantOf" data-concept-id="118673008"> <!--descendantOf&nbsp;--> <div style="display: inline-block;" class="dropdown"> <button style="text-decoration: inherit; color: inherit; display: inline-block; padding: 0px;" class="btn btn-link dropdown-toggle" type="button" data-toggle="dropdown" aria-expanded="true"> descendantOf&nbsp; </button> <ul class="dropdown-menu" role="menu"> <li role="presentation"><a class="criteriaDropdownOption" role="menuitem" tabindex="-1" href="javascript:void(0);">descendantOf</a></li> <li role="presentation"><a class="criteriaDropdownOption" role="menuitem" tabindex="-1" href="javascript:void(0);">descendantOrSelfOf</a></li> <li role="presentation"><a class="criteriaDropdownOption" role="menuitem" tabindex="-1" href="javascript:void(0);">self</a></li> <li role="presentation"><a class="criteriaDropdownOption" role="menuitem" tabindex="-1" href="javascript:void(0);">isMemberOf</a></li> </ul> </div> <span style="color: forestgreen;">118673008</span>&nbsp; | <span style="color: firebrick;">Procedure on digestive system (procedure)</span> | </span> </span> <button class="pull-right btn btn-link removeLi" style="position: relative; top: 3px;"> <i class="glyphicon glyphicon-remove"></i> </button> <small class="text-muted pull-right" style="position: relative; top: 10px;" title="This instruction involves the selection of 694 concepts">694 cpts</small></li>'},
                {title: "All pneumonias except intersticial pneumonias", htmlValue: '<li data-modifier="Include" class="list-group-item clearfix query-condition"> <span class="text-muted line-number" style="font-size: 200%;">1</span>&nbsp;&nbsp; <span style="position: relative; top: -5px;"> <div style="width: 45px;display: inline-block;">Include,</div> <span class="constraint" data-term="Pneumonia (disorder)" data-criteria="descendantOf" data-concept-id="233604007"> <!--descendantOf&nbsp;--> <div style="display: inline-block;" class="dropdown"> <button style="text-decoration: inherit; color: inherit; display: inline-block; padding: 0px;" class="btn btn-link dropdown-toggle" type="button" data-toggle="dropdown" aria-expanded="true"> descendantOf&nbsp; </button> <ul class="dropdown-menu" role="menu"> <li role="presentation"><a class="criteriaDropdownOption" role="menuitem" tabindex="-1" href="javascript:void(0);">descendantOf</a></li> <li role="presentation"><a class="criteriaDropdownOption" role="menuitem" tabindex="-1" href="javascript:void(0);">descendantOrSelfOf</a></li> <li role="presentation"><a class="criteriaDropdownOption" role="menuitem" tabindex="-1" href="javascript:void(0);">self</a></li> <li role="presentation"><a class="criteriaDropdownOption" role="menuitem" tabindex="-1" href="javascript:void(0);">isMemberOf</a></li> </ul> </div> <span style="color: forestgreen;">233604007</span>&nbsp; | <span style="color: firebrick;">Pneumonia (disorder)</span> | </span> </span> <button class="pull-right btn btn-link removeLi" style="position: relative; top: 3px;"> <i class="glyphicon glyphicon-remove"></i> </button> <small class="text-muted pull-right" style="position: relative; top: 10px;" title="This instruction involves the selection of 220 concepts">220 cpts</small></li><li data-modifier="Exclude" class="list-group-item clearfix query-condition"> <span class="text-muted line-number" style="font-size: 200%;">2</span>&nbsp;&nbsp; <span style="position: relative; top: -5px;"> <div style="width: 45px;display: inline-block;">Exclude,</div> <span class="constraint" data-term="Interstitial pneumonia (disorder)" data-criteria="descendantOrSelfOf" data-concept-id="64667001"> <!--descendantOrSelfOf&nbsp;--> <div style="display: inline-block;" class="dropdown"> <button style="text-decoration: inherit; color: inherit; display: inline-block; padding: 0px;" class="btn btn-link dropdown-toggle" type="button" data-toggle="dropdown" aria-expanded="true">descendantOrSelfOf&nbsp;</button> <ul class="dropdown-menu" role="menu"> <li role="presentation"><a class="criteriaDropdownOption" role="menuitem" tabindex="-1" href="javascript:void(0);">descendantOf</a></li> <li role="presentation"><a class="criteriaDropdownOption" role="menuitem" tabindex="-1" href="javascript:void(0);">descendantOrSelfOf</a></li> <li role="presentation"><a class="criteriaDropdownOption" role="menuitem" tabindex="-1" href="javascript:void(0);">self</a></li> <li role="presentation"><a class="criteriaDropdownOption" role="menuitem" tabindex="-1" href="javascript:void(0);">isMemberOf</a></li> </ul> </div> <span style="color: forestgreen;">64667001</span>&nbsp; | <span style="color: firebrick;">Interstitial pneumonia (disorder)</span> | </span> </span> <button class="pull-right btn btn-link removeLi" style="position: relative; top: 3px;"> <i class="glyphicon glyphicon-remove"></i> </button> <small class="text-muted pull-right" style="position: relative; top: 10px;" title="This instruction involves the selection of 24 concepts">24 cpts</small></li>'},
                {title: "Hypertension related concepts, disorders, personal history and family history", htmlValue: '<li data-modifier="Include" class="list-group-item clearfix query-condition"> <span class="text-muted line-number" style="font-size: 200%;">1</span>&nbsp;&nbsp; <span style="position: relative; top: -5px;"> <div style="width: 45px;display: inline-block;">Include,</div> <span class="constraint" data-term="Hypertensive disorder, systemic arterial (disorder)" data-criteria="descendantOf" data-concept-id="38341003"> <!--descendantOf&nbsp;--> <div style="display: inline-block;" class="dropdown"> <button style="text-decoration: inherit; color: inherit; display: inline-block; padding: 0px;" class="btn btn-link dropdown-toggle" type="button" data-toggle="dropdown" aria-expanded="true"> descendantOf&nbsp; </button> <ul class="dropdown-menu" role="menu"> <li role="presentation"><a class="criteriaDropdownOption" role="menuitem" tabindex="-1" href="javascript:void(0);">descendantOf</a></li> <li role="presentation"><a class="criteriaDropdownOption" role="menuitem" tabindex="-1" href="javascript:void(0);">descendantOrSelfOf</a></li> <li role="presentation"><a class="criteriaDropdownOption" role="menuitem" tabindex="-1" href="javascript:void(0);">self</a></li> <li role="presentation"><a class="criteriaDropdownOption" role="menuitem" tabindex="-1" href="javascript:void(0);">isMemberOf</a></li> </ul> </div> <span style="color: forestgreen;">38341003</span>&nbsp; | <span style="color: firebrick;">Hypertensive disorder, systemic arterial (disorder)</span> | </span> </span> <button class="pull-right btn btn-link removeLi" style="position: relative; top: 3px;"> <i class="glyphicon glyphicon-remove"></i> </button> <small class="text-muted pull-right" style="position: relative; top: 10px;" title="This instruction involves the selection of 125 concepts">125 cpts</small></li><li data-modifier="Include" class="list-group-item clearfix query-condition"> <span class="text-muted line-number" style="font-size: 200%;">2</span>&nbsp;&nbsp; <span style="position: relative; top: -5px;"> <div style="width: 45px;display: inline-block;">Include,</div> <span class="constraint" data-term="No family history: Hypertension (situation)" data-criteria="self" data-concept-id="160273004"> <!--self&nbsp;--> <div style="display: inline-block;" class="dropdown"> <button style="text-decoration: inherit; color: inherit; display: inline-block; padding: 0px;" class="btn btn-link dropdown-toggle" type="button" data-toggle="dropdown" aria-expanded="true"> self&nbsp; </button> <ul class="dropdown-menu" role="menu"> <li role="presentation"><a class="criteriaDropdownOption" role="menuitem" tabindex="-1" href="javascript:void(0);">descendantOf</a></li> <li role="presentation"><a class="criteriaDropdownOption" role="menuitem" tabindex="-1" href="javascript:void(0);">descendantOrSelfOf</a></li> <li role="presentation"><a class="criteriaDropdownOption" role="menuitem" tabindex="-1" href="javascript:void(0);">self</a></li> <li role="presentation"><a class="criteriaDropdownOption" role="menuitem" tabindex="-1" href="javascript:void(0);">isMemberOf</a></li> </ul> </div> <span style="color: forestgreen;">160273004</span>&nbsp; | <span style="color: firebrick;">No family history: Hypertension (situation)</span> | </span> </span> <button class="pull-right btn btn-link removeLi" style="position: relative; top: 3px;"> <i class="glyphicon glyphicon-remove"></i> </button> <small class="text-muted pull-right" style="position: relative; top: 10px;" title="This instruction involves the selection of 1 concepts">1 cpts</small></li><li data-modifier="Include" class="list-group-item clearfix query-condition"> <span class="text-muted line-number" style="font-size: 200%;">3</span>&nbsp;&nbsp; <span style="position: relative; top: -5px;"> <div style="width: 45px;display: inline-block;">Include,</div> <span class="constraint" data-term="History of hypertension (situation)" data-criteria="descendantOrSelfOf" data-concept-id="161501007"> <!--descendantOrSelfOf&nbsp;--> <div style="display: inline-block;" class="dropdown"> <button style="text-decoration: inherit; color: inherit; display: inline-block; padding: 0px;" class="btn btn-link dropdown-toggle" type="button" data-toggle="dropdown" aria-expanded="true"> descendantOrSelfOf&nbsp; </button> <ul class="dropdown-menu" role="menu"> <li role="presentation"><a class="criteriaDropdownOption" role="menuitem" tabindex="-1" href="javascript:void(0);">descendantOf</a></li> <li role="presentation"><a class="criteriaDropdownOption" role="menuitem" tabindex="-1" href="javascript:void(0);">descendantOrSelfOf</a></li> <li role="presentation"><a class="criteriaDropdownOption" role="menuitem" tabindex="-1" href="javascript:void(0);">self</a></li> <li role="presentation"><a class="criteriaDropdownOption" role="menuitem" tabindex="-1" href="javascript:void(0);">isMemberOf</a></li> </ul> </div> <span style="color: forestgreen;">161501007</span>&nbsp; | <span style="color: firebrick;">History of hypertension (situation)</span> | </span> </span> <button class="pull-right btn btn-link removeLi" style="position: relative; top: 3px;"> <i class="glyphicon glyphicon-remove"></i> </button> <small class="text-muted pull-right" style="position: relative; top: 10px;" title="This instruction involves the selection of 4 concepts">4 cpts</small></li><li data-modifier="Include" class="list-group-item clearfix query-condition"> <span class="text-muted line-number" style="font-size: 200%;">4</span>&nbsp;&nbsp; <span style="position: relative; top: -5px;"> <div style="width: 45px;display: inline-block;">Include,</div> <span class="constraint" data-term="Family history: Hypertension (situation)" data-criteria="descendantOrSelfOf" data-concept-id="160357008"> <!--descendantOrSelfOf&nbsp;--> <div style="display: inline-block;" class="dropdown"> <button style="text-decoration: inherit; color: inherit; display: inline-block; padding: 0px;" class="btn btn-link dropdown-toggle" type="button" data-toggle="dropdown" aria-expanded="true"> descendantOrSelfOf&nbsp; </button> <ul class="dropdown-menu" role="menu"> <li role="presentation"><a class="criteriaDropdownOption" role="menuitem" tabindex="-1" href="javascript:void(0);">descendantOf</a></li> <li role="presentation"><a class="criteriaDropdownOption" role="menuitem" tabindex="-1" href="javascript:void(0);">descendantOrSelfOf</a></li> <li role="presentation"><a class="criteriaDropdownOption" role="menuitem" tabindex="-1" href="javascript:void(0);">self</a></li> <li role="presentation"><a class="criteriaDropdownOption" role="menuitem" tabindex="-1" href="javascript:void(0);">isMemberOf</a></li> </ul> </div> <span style="color: forestgreen;">160357008</span>&nbsp; | <span style="color: firebrick;">Family history: Hypertension (situation)</span> | </span> </span> <button class="pull-right btn btn-link removeLi" style="position: relative; top: 3px;"> <i class="glyphicon glyphicon-remove"></i> </button> <small class="text-muted pull-right" style="position: relative; top: 10px;" title="This instruction involves the selection of 3 concepts">3 cpts</small></li>'},
                {title: "Disorders that descendants of Necrosis of an anatomical site and of a disorder of the heart muscle", htmlValue: '<li data-modifier="Include" class="list-group-item clearfix query-condition"> <span class="text-muted line-number" style="font-size: 200%;">1</span>&nbsp;&nbsp; <span style="position: relative; top: -5px;"> <div style="width: 45px;display: inline-block;">Include,</div> <span class="constraint" data-term="Necrosis of anatomical site (disorder)" data-criteria="descendantOf" data-concept-id="609410002"> <!--descendantOf&nbsp;--> <div style="display: inline-block;" class="dropdown"> <button style="text-decoration: inherit; color: inherit; display: inline-block; padding: 0px;" class="btn btn-link dropdown-toggle" type="button" data-toggle="dropdown" aria-expanded="true"> descendantOf&nbsp; </button> <ul class="dropdown-menu" role="menu"> <li role="presentation"><a class="criteriaDropdownOption" role="menuitem" tabindex="-1" href="javascript:void(0);">descendantOf</a></li> <li role="presentation"><a class="criteriaDropdownOption" role="menuitem" tabindex="-1" href="javascript:void(0);">descendantOrSelfOf</a></li> <li role="presentation"><a class="criteriaDropdownOption" role="menuitem" tabindex="-1" href="javascript:void(0);">self</a></li> <li role="presentation"><a class="criteriaDropdownOption" role="menuitem" tabindex="-1" href="javascript:void(0);">isMemberOf</a></li> </ul> </div> <span style="color: forestgreen;">609410002</span>&nbsp; | <span style="color: firebrick;">Necrosis of anatomical site (disorder)</span> | </span> <br> <div style="margin-left: 45px; display: inline-block">AND</div> <span class="constraint" data-term="Myocardial disease (disorder)" data-criteria="descendantOf" data-concept-id="57809008"> <!--descendantOf&nbsp;--> <div style="display: inline-block;" class="dropdown"> <button style="text-decoration: inherit; color: inherit; display: inline-block; padding: 0px;" class="btn btn-link dropdown-toggle" type="button" data-toggle="dropdown" aria-expanded="true"> descendantOf&nbsp; </button> <ul class="dropdown-menu" role="menu"> <li role="presentation"><a class="criteriaDropdownOption" role="menuitem" tabindex="-1" href="javascript:void(0);">descendantOf</a></li> <li role="presentation"><a class="criteriaDropdownOption" role="menuitem" tabindex="-1" href="javascript:void(0);">descendantOrSelfOf</a></li> <li role="presentation"><a class="criteriaDropdownOption" role="menuitem" tabindex="-1" href="javascript:void(0);">self</a></li> <li role="presentation"><a class="criteriaDropdownOption" role="menuitem" tabindex="-1" href="javascript:void(0);">isMemberOf</a></li> </ul> </div> <span style="color: forestgreen;">57809008</span>&nbsp; | <span style="color: firebrick;">Myocardial disease (disorder)</span> | </span> </span> <button class="pull-right btn btn-link removeLi" style="position: relative; top: 3px;"> <i class="glyphicon glyphicon-remove"></i> </button> <small class="text-muted pull-right" style="position: relative; top: 10px;" title="This instruction involves the selection of 84 concepts">84 cpts</small></li>'}
            ]
        };
        $(divElement).html(JST["views/developmentQueryPlugin/main.hbs"](context));

        $.ajax({
            type: "POST",
            url: options.serverUrl.replace("snomed", "expressions/") + options.edition + "/" + options.release + "/execute/brief?access_token=" + options.token,
            data: {
                expression: "< 410662002|Concept model attribute (attribute)|",
                limit : 5000,
                skip : 0,
                form: "inferred"
            },
            dataType: "json",
            //timeout: 300000,
            success: function(result) {
                //console.log(result);
                //console.log(result.computeResponse.matches);
                panel.typeArray = result.computeResponse.matches;
            }
        }).done(function(result){

        });

        $("#" + panel.divElement.id + "-ExamplesModal").find(".btn").addClass("disabled");
        $("#" + panel.divElement.id + "-ExamplesModal").find(".loadExample").removeClass("disabled");
        $("#" + panel.divElement.id + "-constraintGrammarModal-close").removeClass("disabled");

        $(divElement).find(".loadExample").unbind();
        $(divElement).find(".loadExample").click(function(e){
            var htmlToPut = $(e.target).attr("data-htmlValue");
            $('#' + panel.divElement.id + '-listGroup').html(htmlToPut);
            $('#' + panel.divElement.id + '-listGroup').find(".query-condition").each(function(i){
                var critToUpdate = $(this);
                $(critToUpdate).find("small").remove();
                $(critToUpdate).append('<small class="text-muted pull-right glyphicon glyphicon-refresh icon-spin" style="position: relative; top: 12px;"></small>');
                $("#" + panel.divElement.id + "-ExamplesModal").modal("hide");
                panel.execute("inferred", panel.exportToConstraintGrammar(false, false, critToUpdate), true, function(resultCount){
                    $(critToUpdate).find("small").remove();
                    $(critToUpdate).find(".glyphicon-refresh").first().remove();
                    var cont = parseInt(resultCount);
                    $(critToUpdate).append('<small class="text-muted pull-right" style="position: relative; top: 10px;" title="This instruction involves the selection of ' + cont + ' concepts">' + cont + ' cpts</small>');
                });

                $('#' + panel.divElement.id + '-listGroup').find(".criteriaDropdownOption").unbind();
                $('#' + panel.divElement.id + '-listGroup').find(".criteriaDropdownOption").click(function(e){
                    var prevValue = $(e.target).closest(".constraint").attr('data-criteria');
                    var newValue = $(e.target).html();
                    if (prevValue != newValue){
                        $(e.target).closest(".constraint").attr('data-criteria', newValue);
                        $(e.target).closest("div").find("button").first().html(newValue + "&nbsp;");
                        var critToUpdate = $(e.target).closest(".query-condition");
                        $(critToUpdate).find("small").remove();
                        $(critToUpdate).append('<small class="text-muted pull-right glyphicon glyphicon-refresh icon-spin" style="position: relative; top: 12px;"></small>');
                        panel.execute("inferred", panel.exportToConstraintGrammar(false, false, critToUpdate), true, function(resultCount){
                            $(critToUpdate).find("small").remove();
                            $(critToUpdate).find(".glyphicon-refresh").first().remove();
                            var cont = parseInt(resultCount);
                            $(critToUpdate).append('<small class="text-muted pull-right" style="position: relative; top: 10px;" title="This instruction involves the selection of ' + cont + ' concepts">' + cont + ' cpts</small>');
                        });
                    }
                });

                $(divElement).find(".removeLi").unbind();
                $(divElement).find(".removeLi").disableTextSelect();
                $(divElement).find(".removeLi").click(function(e){
                    $(e.target).closest("li").remove();
                    panel.renumLines();
                });
            });
        });

        var bindAddCriteriaFunction = function(){
            $(divElement).find(".addCriteria").unbind();
            $(divElement).find(".addCriteria").disableTextSelect();
            $(divElement).find(".addCriteria").click(function(e){
                $(e.target).closest(".form-group").hide();
                var criteria = $('#' + panel.divElement.id + '-selectedCriteria').html();
                var typeSelected = $(e.target).attr("data-type");
                if ($(divElement).find(".addedCriteria").length)
                    typeSelected = $(divElement).find(".addedCriteria").first().attr("data-typeSelected");
                $(e.target).closest(".form-inline").append(JST["views/developmentQueryPlugin/andCriteria.hbs"]({criteria: criteria, typeSelected: typeSelected, types: panel.typeArray}));

                $(divElement).find(".addedCriteria").find(".selectTypeOpt").unbind();
                $(divElement).find(".addedCriteria").find(".selectTypeOpt").click(function(e){
                    $(e.target).closest(".typeCritCombo").attr("data-type-term", $(e.target).attr("data-term"));
                    $(e.target).closest(".typeCritCombo").attr("data-type-concept-id", $(e.target).attr("data-id"));
                    $(e.target).closest("div").find("span").first().html($(e.target).attr("data-term"));
                });

                $(divElement).find(".addedCriteria").find(".selectTypeAnd").unbind();
                $(divElement).find(".addedCriteria").find(".selectTypeAnd").click(function(e){
                    var typeSel = $(e.target).html();
                    $(e.target).closest(".addedCriteria").attr("data-typeSelected", typeSel);
                    $(e.target).closest(".dropdown").find("span").first().html(typeSel);
                    if (typeSel == "Refinement")
                        $(divElement).find(".typeCritCombo").show();
                    else
                        $(divElement).find(".typeCritCombo").hide();
                });

                $(divElement).find(".addedCriteria").find(".removeCriteria").unbind();
                $(divElement).find(".addedCriteria").find(".removeCriteria").click(function(e){
                    $(e.target).closest(".addedCriteria").remove();
                    var foundAddedCriteria = $(divElement).find(".addedCriteria");
                    if (!foundAddedCriteria.length){
                        $("#" + panel.divElement.id + "-addCriteriaAnd").show();
                    }else{
                        $(divElement).find(".addedCriteria").find(".dropFirstType").hide();
                        $(divElement).find(".addedCriteria").first().find(".dropFirstType").first().show();
                        //console.log($(foundAddedCriteria[foundAddedCriteria.length - 1]).find(".addCriteria").first().closest(".form-group"));
                        $(foundAddedCriteria[foundAddedCriteria.length - 1]).find(".addCriteria").first().closest(".form-group").show();
                    }
                });
                $(divElement).find(".addedCriteria").find("a[data-role='criteria-selector']").unbind();
                $(divElement).find(".addedCriteria").find("a[data-role='criteria-selector']").click(function (e) {
                    $(e.target).closest(".dropdown").find("span").first().html($(e.target).html());
                });
                bindAddCriteriaFunction();
            });
        };
        bindAddCriteriaFunction();

        $('#' + panel.divElement.id + '-addCriteriaAnd').unbind();

        $('#' + panel.divElement.id + '-clearButton').unbind();
        $('#' + panel.divElement.id + '-clearButton').disableTextSelect();
        $('#' + panel.divElement.id + '-clearButton').click(function(){
            panel.setUpPanel();
        });

        $('#' + panel.divElement.id + '-copyConstraint').unbind();
        $("#" + panel.divElement.id + "-copyConstraint").disableTextSelect();
        var clientGrammar = new ZeroClipboard( document.getElementById(panel.divElement.id + "-copyConstraint") );
        clientGrammar.on( "ready", function( readyEvent ) {
            clientGrammar.on( "copy", function (event) {
//                var grammar = panel.exportToConstraintGrammar(false, fullSyntax);
                //console.log(grammar);
                $("#" + panel.divElement.id + "-copyConstraint").addClass("animated rubberBand");
                window.setTimeout( function(){
                    $("#" + panel.divElement.id + "-copyConstraint").removeClass('animated rubberBand');
                }, 1000);
                alertEvent("Constraint Grammar copied to clipboard", "success");
                var clipboard = event.clipboardData;
                clipboard.setData("text/plain", panel.grammarToCopy);
            });
        });


        panel.options.devQuery = true;

        $('#' + panel.divElement.id + '-exportXls').unbind();
        $('#' + panel.divElement.id + '-exportXls').click(function (e) {
//            var rowsHtml = "";
//            alertEvent("Please wait", "info");
//            panel.getTotalResults(function(){
//                $.each(panel.allResults, function(i, field){
//                    rowsHtml+= "<tr><td>" + field.defaultTerm + "</td><td>" + field.conceptId + "</td></tr>";
//                });
//                $("#" + panel.divElement.id + "-outputBody2").html(rowsHtml);
            if (panel.allResults){
                return ExcellentExport.excel(this, panel.divElement.id + '-output2');
            }else{
                e.preventDefault();
                e.stopPropagation();
                panel.getTotalResults();
            }
//            });
        });

        $('#' + panel.divElement.id + '-exportBriefcase').unbind();
        $('#' + panel.divElement.id + '-exportBriefcase').click(function (e) {
            function exportToBriefcase(){
                var result = [];
                $.each(panel.allResults, function(i, field){
                    var loopConcept = {};
                    loopConcept.conceptId = field.conceptId;
                    loopConcept.defaultTerm = field.defaultTerm;
                    loopConcept.module = field.module;
                    result.push(loopConcept);
                });
                briefcase.addConcepts(result);
            }
            if (panel.allResults){
                exportToBriefcase();
            }else{
                alertEvent("Exporting concepts, please wait", "info");
                panel.getTotalResults(function(){
                    exportToBriefcase();
                });
            }
        });

        $('#' + panel.divElement.id + '-open-grammar').unbind();
        $("#" + panel.divElement.id + "-open-grammar").disableTextSelect();
        $("#" + panel.divElement.id + "-open-grammar").click(function (e) {
            panel.updateGrammarModal(false);
        });
        //-brief-syntax-button
        $('#home-' + panel.divElement.id + '-full-syntax-button').unbind();
        $('#home-' + panel.divElement.id + '-full-syntax-button').disableTextSelect();
        $('#home-' + panel.divElement.id + '-full-syntax-button').addClass("btn-primary");
        $('#home-' + panel.divElement.id + '-full-syntax-button').removeClass("btn-default");
        $('#home-' + panel.divElement.id + '-full-syntax-button').click(function (event) {
            panel.updateGrammarModal(true);
        });

        $('#home-' + panel.divElement.id + '-brief-syntax-button').unbind();
        $('#home-' + panel.divElement.id + '-brief-syntax-button').disableTextSelect();
        $('#home-' + panel.divElement.id + '-brief-syntax-button').addClass("btn-default");
        $('#home-' + panel.divElement.id + '-brief-syntax-button').removeClass("btn-primary");
        $('#home-' + panel.divElement.id + '-brief-syntax-button').click(function (event) {
            panel.updateGrammarModal(false);
        });

        $('#' + panel.divElement.id + '-exportBriefcaseClean').unbind();
        $('#' + panel.divElement.id + '-exportBriefcaseClean').click(function (e) {
            function exportToBriefcase(){
                var result = [];
                briefcase.emptyBriefcase();
                $.each(panel.allResults, function(i, field){
                    var loopConcept = {};
                    loopConcept.conceptId = field.conceptId;
                    loopConcept.defaultTerm = field.defaultTerm;
                    loopConcept.module = field.module;
                    result.push(loopConcept);
                });
                briefcase.addConcepts(result);
            }
            if (panel.allResults){
                exportToBriefcase();
            }else{
                alertEvent("Exporting concepts, please wait", "info");
                panel.getTotalResults(function(){
                    exportToBriefcase();
                });
            }
        });

        $('#' + panel.divElement.id + '-computeButton').unbind();
        $('#' + panel.divElement.id + '-computeButton').click(function (e) {
            var query = $('#' + panel.divElement.id + '-input').val();
            var request = {
                query : JSON.parse(query),
                pathId : options.path.id
            };
            panel.compute(request);
        });

        $("#" + panel.divElement.id).find("a[data-role='modifier-selector']").unbind();
        $("#" + panel.divElement.id).find("a[data-role='modifier-selector']").click(function (e) {
            $('#' + panel.divElement.id + '-selectedModifier').html($(e.target).html());
        });

        $('#' + panel.divElement.id + '-selectedConcept').show();
        $('#' + panel.divElement.id + '-selectedType').hide();
        $('#' + panel.divElement.id + '-selectedTarget').hide();
        $('#' + panel.divElement.id + '-searchTerm').hide();
        $('#' + panel.divElement.id + '-searchTerm').unbind();
        $('#' + panel.divElement.id + '-searchTerm').keyup(function(e){
            if (e.keyCode === 13) {
                $('#' + panel.divElement.id + '-addCriteriaButton').click();
            }
        });
        $('#' + panel.divElement.id + '-formdropdown').hide();
        $("#" + panel.divElement.id).find("a[data-role='criteria-selector']").unbind();
        $("#" + panel.divElement.id).find("a[data-role='criteria-selector']").click(function (e) {
            $('#' + panel.divElement.id + '-selectedCriteria').html($(e.target).html());
            //$(e.target).closest(".dropdown").find("span").first().html($(e.target).html());
            var selectedCriteria = $(e.target).html();
            if (selectedCriteria == "hasDescription") {
                $('#' + panel.divElement.id + '-selectedConcept').hide();
                $('#' + panel.divElement.id + '-selectedType').hide();
                $('#' + panel.divElement.id + '-selectedTarget').hide();
                $('#' + panel.divElement.id + '-searchTerm').show();
                $('#' + panel.divElement.id + '-formdropdown').hide();
            } else if (selectedCriteria == "hasRelationship") {
                $('#' + panel.divElement.id + '-selectedConcept').hide();
                $('#' + panel.divElement.id + '-selectedType').show();
                $('#' + panel.divElement.id + '-selectedTarget').show();
                $('#' + panel.divElement.id + '-searchTerm').hide();
                $('#' + panel.divElement.id + '-formdropdown').show();
            } else {
                $('#' + panel.divElement.id + '-selectedConcept').show();
                $('#' + panel.divElement.id + '-selectedType').hide();
                $('#' + panel.divElement.id + '-selectedTarget').hide();
                $('#' + panel.divElement.id + '-searchTerm').hide();
                $('#' + panel.divElement.id + '-formdropdown').hide();
            }
        });
        $("#" + panel.divElement.id).find("a[data-role='form-selector']").unbind();
        $("#" + panel.divElement.id).find("a[data-role='form-selector']").click(function (e) {
            $('#' + panel.divElement.id + '-selectedForm').html($(e.target).html());
        });

        $('#' + panel.divElement.id + '-addCriteriaButton').unbind();
        $('#' + panel.divElement.id + '-addCriteriaButton').click(function (e) {
            var modifier = $('#' + panel.divElement.id + '-selectedModifier').html();
            var criteria = $('#' + panel.divElement.id + '-selectedCriteria').html();
            var conceptIdDroped = $('#' + panel.divElement.id + '-selectedConcept').attr("data-conceptId");
            if ($('#' + panel.divElement.id + '-listGroup').find('.constraint[data-criteria="' + criteria + '"][data-concept-id="' + conceptIdDroped + '"]').length){
                if ($('#' + panel.divElement.id + '-listGroup').find('.constraint[data-criteria="' + criteria + '"][data-concept-id="' + conceptIdDroped + '"]').closest(".query-condition").attr("data-modifier") == modifier){
                    $('#' + panel.divElement.id + '-conceptField').addClass("has-error");
                    $('#' + panel.divElement.id + '-addmsg').html("Criteria already added...");
                }else{
                    $('#' + panel.divElement.id + '-conceptField').addClass("has-error");
                    $('#' + panel.divElement.id + '-addmsg').html("Contradictory criteria...");
                }
            }
            //if ($('#' + panel.divElement.id + '-listGroup').find('.query-condition[data-criteria="' + criteria + '"][data-modifier="' + modifier + '"][data-concept-id="' + conceptIdDroped + '"]').length){
            //    $('#' + panel.divElement.id + '-conceptField').addClass("has-error");
            //    $('#' + panel.divElement.id + '-addmsg').html("Criteria already added...");
            //}else if ($('#' + panel.divElement.id + '-listGroup').find('.query-condition[data-criteria="' + criteria + '"][data-concept-id="' + conceptIdDroped + '"]').length){
            //    $('#' + panel.divElement.id + '-conceptField').addClass("has-error");
            //    $('#' + panel.divElement.id + '-addmsg').html("Contradictory criteria...");
            //}
            else if (criteria == "hasDescription") {
                var searchTerm = $('#' + panel.divElement.id + '-searchTerm').val();
                if (searchTerm == "") {
                    $('#' + panel.divElement.id + '-conceptField').addClass("has-error");
                    $('#' + panel.divElement.id + '-addmsg').html("Enter a search term...");
                } else {
                    $('#' + panel.divElement.id + '-addmsg').html("");
                    $('#' + panel.divElement.id + '-conceptField').removeClass("has-error");
                    var context2 = {
                        modifier: modifier,
                        criteria: criteria,
                        searchTerm: searchTerm
                    };
                    $('#' + panel.divElement.id + '-listGroup').append(JST["views/developmentQueryPlugin/searchCriteria.hbs"](context2));
                    panel.renumLines();
                    $(divElement).find(".removeLi").unbind();
                    $(divElement).find(".removeLi").disableTextSelect();
                    $(divElement).find(".removeLi").click(function(e){
                        $(e.target).closest("li").remove();
                        panel.renumLines();
                    });
                    $('#' + panel.divElement.id + '-selectedConcept').val("");
                    $('#' + panel.divElement.id + '-selectedConcept').attr("data-conceptId", "");
                    $('#' + panel.divElement.id + '-selectedType').val("");
                    $('#' + panel.divElement.id + '-selectedType').attr("data-conceptId", "");
                    $('#' + panel.divElement.id + '-selectedTarget').val("");
                    $('#' + panel.divElement.id + '-selectedTarget').attr("data-conceptId", "");
                    $('#' + panel.divElement.id + '-searchTerm').val("");
                }
            } else if (criteria == "hasRelationship") {
                var typeId = $('#' + panel.divElement.id + '-selectedType').attr("data-conceptId");
                var typeTerm = $('#' + panel.divElement.id + '-selectedType').val();
                var targetId = $('#' + panel.divElement.id + '-selectedTarget').attr("data-conceptId");
                var targetTerm = $('#' + panel.divElement.id + '-selectedTarget').val();
                var form = $('#' + panel.divElement.id + '-selectedForm').html();
                if ((typeof typeId == "undefined" || typeId == "") && typeTerm == "" &&
                    (typeof targetId == "undefined" || targetId == "") && targetTerm == "" ) {
                    $('#' + panel.divElement.id + '-conceptField').addClass("has-error");
                    $('#' + panel.divElement.id + '-addmsg').html("Drop a concept...");
                } else {
                    $('#' + panel.divElement.id + '-addmsg').html("");
                    $('#' + panel.divElement.id + '-conceptField').removeClass("has-error");
                    var context2 = {
                        modifier: modifier,
                        criteria: criteria,
                        typeId: typeId,
                        typeTerm: typeTerm,
                        targetId: targetId,
                        targetTerm: targetTerm,
                        form: form
                    };
                    $('#' + panel.divElement.id + '-listGroup').append(JST["views/developmentQueryPlugin/relsCriteria.hbs"](context2));
                    panel.renumLines();
                    $(divElement).find(".removeLi").unbind();
                    $(divElement).find(".removeLi").disableTextSelect();
                    $(divElement).find(".removeLi").click(function(e){
                        $(e.target).closest("li").remove();
                        panel.renumLines();
                    });
                    $('#' + panel.divElement.id + '-selectedConcept').val("");
                    $('#' + panel.divElement.id + '-selectedConcept').attr("data-conceptId", "");
                    $('#' + panel.divElement.id + '-selectedType').val("");
                    $('#' + panel.divElement.id + '-selectedType').attr("data-conceptId", "");
                    $('#' + panel.divElement.id + '-selectedTarget').val("");
                    $('#' + panel.divElement.id + '-selectedTarget').attr("data-conceptId", "");
                    $('#' + panel.divElement.id + '-searchTerm').val("");
                }
            } else {
                var conceptId = $('#' + panel.divElement.id + '-selectedConcept').attr("data-conceptId");
                var term = $('#' + panel.divElement.id + '-selectedConcept').val();
                if (typeof conceptId == "undefined" || conceptId == "" || term == "") {
                    $('#' + panel.divElement.id + '-conceptField').addClass("has-error");
                    $('#' + panel.divElement.id + '-addmsg').html("Drop a concept...");
                } else {
                    $('#' + panel.divElement.id + '-addmsg').html("");
                    $('#' + panel.divElement.id + '-conceptField').removeClass("has-error");
                    var criterias = [{criteria: criteria, conceptId: conceptId, term: term}];
                    if ($(divElement).find(".addedCriteria").length){
                        var typeSelected = $(divElement).find(".addedCriteria").first().attr("data-typeSelected");
                        $(divElement).find(".addedCriteria").each(function(i){
                            var addedConceptId = $(this).find(".andCriteriaConcept").first().attr("data-conceptId");
                            var addedTerm = $(this).find(".andCriteriaConcept").first().val();
                            var addedCrit = $(this).find(".addSelectCriteria").first().html();
                            if (addedConceptId && addedTerm){
                                criterias.forEach(function(criteriaAdded){
                                    if (criteriaAdded.criteria == addedCrit && criteriaAdded.conceptId == addedConceptId){
                                        $('#' + panel.divElement.id + '-conceptField').addClass("has-error");
                                        $('#' + panel.divElement.id + '-addmsg').html("Criteria already added...");
                                        return false;
                                    }
                                });
                                var crit = {
                                    criteria: addedCrit,
                                    conceptId: addedConceptId,
                                    term: addedTerm
                                };
                                if (typeSelected == "Refinement"){
                                    if ($(this).find(".typeCritCombo").first().attr("data-type-concept-id") == "false"){
                                        $('#' + panel.divElement.id + '-addmsg').html("Select a type...");
                                        return false;
                                    }else{
                                        crit.type = {
                                            conceptId: $(this).find(".typeCritCombo").first().attr("data-type-concept-id"),
                                            term: $(this).find(".typeCritCombo").first().attr("data-type-term")
                                        };
                                    }
                                }
                                criterias.push(crit);
                            }else{
                                $('#' + panel.divElement.id + '-conceptField').addClass("has-error");
                                $('#' + panel.divElement.id + '-addmsg').html("Drop a concept...");
                                return false;
                            }
                        });
                    }
                    if ($('#' + panel.divElement.id + '-addmsg').html() == ""){
                        $(divElement).find(".addedCriteria").remove();
                        $("#" + panel.divElement.id + "-addCriteriaAnd").show();
                        var context2 = {
                            modifier: modifier,
                            criterias: criterias
                        };
                        // Add Excludes always at the end, and includes before exclude
                        var foundExclude = false;
                        $('#' + panel.divElement.id + '-listGroup').find(".query-condition").each(function (index) {
                            var modifier = $(this).data('modifier');
                            if (modifier == "Exclude") {
                                $(this).before(JST["views/developmentQueryPlugin/criteria.hbs"](context2));
                                var critAdded = $('#' + panel.divElement.id + '-listGroup').find(".query-condition")[index];
                                $(critAdded).append('<small class="text-muted pull-right glyphicon glyphicon-refresh icon-spin" style="position: relative; top: 12px;"></small>');
                                panel.execute("inferred", panel.exportToConstraintGrammar(false, false, critAdded), true, function(resultCount){
                                    $(critAdded).find(".glyphicon-refresh").first().remove();
                                    var cont = parseInt(resultCount);
                                    $(critAdded).append('<small class="text-muted pull-right" style="position: relative; top: 10px;" title="This instruction involves the selection of ' + cont + ' concepts">' + cont + ' cpts</small>');
                                });
                                foundExclude = true;
                                return false;
                            }
                        });
                        if (!foundExclude) {
                            $('#' + panel.divElement.id + '-listGroup').append(JST["views/developmentQueryPlugin/criteria.hbs"](context2));
                            var critAdded = $('#' + panel.divElement.id + '-listGroup').find(".query-condition")[$('#' + panel.divElement.id + '-listGroup').find(".query-condition").length - 1];
                            $(critAdded).append('<small class="text-muted pull-right glyphicon glyphicon-refresh icon-spin" style="position: relative; top: 12px;"></small>');
                            panel.execute("inferred", panel.exportToConstraintGrammar(false, false, critAdded), true, function(resultCount){
                                $(critAdded).find(".glyphicon-refresh").first().remove();
                                var cont = parseInt(resultCount);
                                $(critAdded).append('<small class="text-muted pull-right" style="position: relative; top: 10px;" title="This instruction involves the selection of ' + cont + ' concepts">' + cont + ' cpts</small>');
                            });
                        }
                        $('#' + panel.divElement.id + '-listGroup').find(".criteriaDropdownOption").unbind();
                        $('#' + panel.divElement.id + '-listGroup').find(".criteriaDropdownOption").click(function(e){
                            var prevValue = $(e.target).closest(".constraint").attr('data-criteria');
                            var newValue = $(e.target).html();
                            if (prevValue != newValue){
                                $(e.target).closest(".constraint").attr('data-criteria', newValue);
                                $(e.target).closest("div").find("button").first().html(newValue + "&nbsp;");
                                var critToUpdate = $(e.target).closest(".query-condition");
                                $(critToUpdate).find("small").remove();
                                $(critToUpdate).append('<small class="text-muted pull-right glyphicon glyphicon-refresh icon-spin" style="position: relative; top: 12px;"></small>');
                                panel.execute("inferred", panel.exportToConstraintGrammar(false, false, critToUpdate), true, function(resultCount){
                                    $(critToUpdate).find("small").remove();
                                    $(critToUpdate).find(".glyphicon-refresh").first().remove();
                                    var cont = parseInt(resultCount);
                                    $(critToUpdate).append('<small class="text-muted pull-right" style="position: relative; top: 10px;" title="This instruction involves the selection of ' + cont + ' concepts">' + cont + ' cpts</small>');
                                });
                            }
                        });
                        panel.renumLines();

                        $(divElement).find(".removeLi").unbind();
                        $(divElement).find(".removeLi").disableTextSelect();
                        $(divElement).find(".removeLi").click(function(e){
                            $(e.target).closest("li").remove();
                            panel.renumLines();
                        });
                        $('#' + panel.divElement.id + '-selectedConcept').val("");
                        $('#' + panel.divElement.id + '-selectedConcept').attr("data-conceptId", "");
                        $('#' + panel.divElement.id + '-selectedType').val("");
                        $('#' + panel.divElement.id + '-selectedType').attr("data-conceptId", "");
                        $('#' + panel.divElement.id + '-selectedTarget').val("");
                        $('#' + panel.divElement.id + '-selectedTarget').attr("data-conceptId", "");
                        $('#' + panel.divElement.id + '-searchTerm').val("");
                    }
                }
            }
        });

        $('#' + panel.divElement.id + '-computeInferredButton').unbind();
        $('#' + panel.divElement.id + '-computeInferredButton').click(function (e) {
            var grammar = panel.exportToConstraintGrammar(false, false);
            if ($('#' + panel.divElement.id + '-listGroup').find('.query-condition[data-modifier="Include"]').length){
                panel.execute("inferred", grammar, true);
            }else{
                console.log("add at least one include");
                $('#' + panel.divElement.id + '-resultInfo').html('<span class="label label-danger">ERROR</span>');
                $('#' + panel.divElement.id + '-resultInfo').html('ERROR');
                $("#" + panel.divElement.id + "-footer").html("Add at least one include...");
            }
        });
    };

    panel.updateGrammarModal = function(fullSyntax) {
        if (fullSyntax) {
            $('#home-' + panel.divElement.id + '-full-syntax-button').addClass("btn-primary");
            $('#home-' + panel.divElement.id + '-full-syntax-button').removeClass("btn-default");
            $('#home-' + panel.divElement.id + '-brief-syntax-button').addClass("btn-default");
            $('#home-' + panel.divElement.id + '-brief-syntax-button').removeClass("btn-primary");
        } else {
            $('#home-' + panel.divElement.id + '-full-syntax-button').removeClass("btn-primary");
            $('#home-' + panel.divElement.id + '-full-syntax-button').addClass("btn-default");
            $('#home-' + panel.divElement.id + '-brief-syntax-button').removeClass("btn-default");
            $('#home-' + panel.divElement.id + '-brief-syntax-button').addClass("btn-primary");
        }
        panel.grammarToCopy = panel.exportToConstraintGrammar(false, fullSyntax);
        $("#" + panel.divElement.id + "-constraintGrammar").html(panel.exportToConstraintGrammar(true, fullSyntax));
    };

    panel.setUpPanel();

    this.renumLines = function() {
        $('#' + panel.divElement.id + '-listGroup').find(".query-condition").each(function(index) {
            $(this).find(".line-number").html(index + 1);
        });
    };

    this.getTotalResults = function(callback){
        if (xhrTotal != null){
            xhrTotal.abort();
        }
        panel.lastRequest.skip = 0;
        panel.lastRequest.limit = panel.lastTotalValues + 1;
        $('#' + panel.divElement.id + '-exportXls').html("<i class='glyphicon glyphicon-refresh icon-spin'></i>");
        xhrTotal = $.post(panel.lastUrl + "?access_token=" + options.token, panel.lastRequest).done(function(data){
            xhrTotal = null;
            panel.allResults = data.matches;
            var rowsHtml = "";
            if (panel.allResults && panel.allResults.length){
                $.each(panel.allResults, function(i, field){
                    rowsHtml+= "<tr><td>" + field.defaultTerm + "</td><td>" + field.conceptId + "</td></tr>";
                });
            }
            $("#" + panel.divElement.id + "-outputBody2").html(rowsHtml);
            $('#' + panel.divElement.id + '-exportXls').html('Download XLS <img style="height: 23px;" src="img/excel.png">');
            if (callback)
                callback();
        }).fail(function(){
            alertEvent("Failed!", "error");
        });
    };

    this.getExpressionForCondition = function(condition, htmlFormat, fullSyntax) {
        var grammar = "";
        var operator = "";
        if (condition.criteria == "self") {
            if (fullSyntax) {
                operator = "self ";
            } else {
                operator = "";
            }
        } else if (condition.criteria == "descendantOf") {
            if (fullSyntax) {
                operator = "descendantOf ";
            } else {
                operator = "< ";
            }
        } else if (condition.criteria == "descendantOrSelfOf") {
            if (fullSyntax) {
                operator = "descendantOrSelfOf ";
            } else {
                operator = "<< ";
            }
        } else if (condition.criteria == "childrenOf") {
            if (fullSyntax) {
                operator = "childrenOf ";
            } else {
                operator = "<1 ";
            }
        } else if (condition.criteria == "ancestorOf") {
            if (fullSyntax) {
                operator = "ancestorOf ";
            } else {
                operator = "> ";
            }
        } else if (condition.criteria == "ancestorOrSelfOf") {
            if (fullSyntax) {
                operator = "ancestorOrSelfOf ";
            } else {
                operator = ">> ";
            }
        } else if (condition.criteria == "parentsOf") {
            if (fullSyntax) {
                operator = "parentsOf ";
            } else {
                operator = ">1 ";
            }
        } else if (condition.criteria == "hasDescription") {
            if (fullSyntax) {
                operator = "hasDescription ";
            } else {
                operator = "desc ";
            }
        }  else if (condition.criteria == "hasRelationship") {
            if (fullSyntax) {
                operator = "hasRelationship ";
            } else {
                operator = "rel ";
            }
        }  else if (condition.criteria == "isMemberOf") {
            if (fullSyntax) {
                operator = "isMemberOf ";
            } else {
                operator = "^ ";
            }
        };
        var term = "|" + condition.term + "|";
        if (htmlFormat) {
            operator = "<span class='exp-operators'>" + operator + "</span>";
            term = "<span class='exp-term'>" +  term + "</span>";
        }
        if (condition.typeId) {
            var typeTerm = "|" + condition.typeTerm + "|";
            if (htmlFormat) {
                term = "<span class='exp-term'>" +  typeTerm + "</span>";
            }
            grammar = condition.typeId + typeTerm + " = " + operator + condition.conceptId + term;
        } else {
            grammar = operator + condition.conceptId + term;
        }
        return grammar;
    };

    this.exportToConstraintGrammar = function(htmlFormat, fullSyntax, htmlObj) {
        var breakLine = " ";
        if (htmlFormat) {
            breakLine = "<br>";
        }
        var grammar = "";
        if ($('#' + panel.divElement.id + '-listGroup').find(".query-condition").length == 0) {
            console.log("Add at least one instruction...");
        } else {
            var includes = [];
            var excludes = [];
            if (htmlObj){
                var conditions = [];
                $(htmlObj).find(".constraint").each(function (index2) {
                    var condition = {
                        "criteria": $(this).attr('data-criteria'),
                        "typeId": $(this).attr('data-type-concept-id'),
                        "typeTerm": $(this).attr('data-type-term'),
                        "conceptId": $(this).attr('data-concept-id'),
                        "term": $(this).attr('data-term')
                    };
                    conditions.push(condition);
                });
                includes.push(conditions);
            }else{
                $('#' + panel.divElement.id + '-listGroup').find(".query-condition").each(function (index) {
                    var conditions = [];
                    $(this).find(".constraint").each(function (index2) {
                        var condition = {
                            "criteria": $(this).attr('data-criteria'),
                            "typeId": $(this).attr('data-type-concept-id'),
                            "typeTerm": $(this).attr('data-type-term'),
                            "conceptId": $(this).attr('data-concept-id'),
                            "term": $(this).attr('data-term')
                        };
                        conditions.push(condition);
                    });
                    if ($(this).data('modifier') == "Exclude") {
                        excludes.push(conditions);
                    } else {
                        includes.push(conditions);
                    }
                });
            }
            var isRefined = function(conditions) {
                var refined = false;
                if (conditions.length > 1) {
                    if (conditions[1].typeId) {
                        refined = true;
                    }
                }
                return refined;
            };
            //if (includes.length > 1) grammar += "(";
            $.each(includes, function (index, conditions) {
                if (index > 0) grammar += " OR ";
                if (conditions.length > 1 || isRefined(conditions)) grammar += " (";
                if (isRefined(conditions)) {
                    $.each(conditions, function (index2, condition) {
                        grammar += panel.getExpressionForCondition(condition, htmlFormat, fullSyntax);
                        if (index2 == 0) {
                            grammar += " : ";
                        } else if(index2 < conditions.length -1) {
                            grammar += " , ";
                        }
                        if (htmlFormat && index2 < conditions.length -1) {
                            grammar += "<br>";
                        }
                    });
                } else {
                    $.each(conditions, function (index2, condition) {
                        if (index2 > 0) grammar += " AND ";
                        grammar += panel.getExpressionForCondition(condition, htmlFormat, fullSyntax);
                        if (htmlFormat && index2 < conditions.length -1) {
                            grammar += "<br>";
                        }
                    });
                }
                if (conditions.length > 1 || isRefined(conditions)) grammar += ") ";
                if (htmlFormat && index < includes.length -1) {
                    grammar += "<br>";
                }
            });
            //if (includes.length > 1) grammar += ")";

            if (excludes.length > 0 && includes.length > 1) {
                grammar = "(" + grammar;
                grammar += ") MINUS ";
                if (htmlFormat) {
                    grammar += "<br>";
                }
            } else if (excludes.length > 0) {
                grammar += " MINUS ";
                if (htmlFormat) {
                    grammar += "<br>";
                }
            }
            if (excludes.length > 1) grammar += "(";
            $.each(excludes, function (index, conditions) {
                if (index > 0) grammar += " OR ";
                if (conditions.length > 1 || isRefined(conditions)) grammar += " (";
                if (isRefined(conditions)) {
                    $.each(conditions, function (index2, condition) {
                        grammar += panel.getExpressionForCondition(condition, htmlFormat, fullSyntax);
                        if (index2 == 0) {
                            grammar += " : ";
                        } else if(index2 < conditions.length -1) {
                            grammar += " , ";
                        }
                        if (htmlFormat && index2 < conditions.length -1) {
                            grammar += "<br>";
                        }
                    });
                } else {
                    $.each(conditions, function (index2, condition) {
                        if (index2 > 0) grammar += " AND ";
                        grammar += panel.getExpressionForCondition(condition, htmlFormat, fullSyntax);
                        if (htmlFormat && index2 < conditions.length -1) {
                            grammar += "<br>";
                        }
                    });
                }
                if (conditions.length > 1 || isRefined(conditions)) grammar += ") ";
                if (htmlFormat && index < excludes.length -1) {
                    grammar += "<br>";
                }
            });
            if (excludes.length > 1) grammar += ")";
        }
        grammar = grammar.trim();
        //console.log(grammar.charAt(0));
        //console.log(grammar.charAt(grammar.length-1));
        //if (grammar.charAt(0) == "(" && grammar.charAt(grammar.length-1) == ")") {
        //    grammar = grammar.substr(1,grammar.length-2);
        //}
        return grammar;
    };

    this.exportToConstraintGrammarOld = function(htmlFormat, fullSyntax) {
        var breakLine = " ";
        if (htmlFormat) {
            breakLine = "<br>";
        }
        var grammar = "";
        if ($('#' + panel.divElement.id + '-listGroup').find(".query-condition").length == 0) {
            console.log("Add at least one condition...");
        } else {
            var includes = [];
            var excludes = [];
            var first = true;
            $('#' + panel.divElement.id + '-listGroup').find(".query-condition").each(function (index) {
                var criteria = $(this).data('criteria');
                if (criteria == "hasDescription") {
                    var condition = {
                        "criteria": criteria,
                        "conceptId": $(this).data('concept-id'),
                        "searchTerm": $(this).data('search-term')
                    };
                } else if (criteria != "hasRelationship") {
                    var condition = {
                        "criteria": criteria,
                        "conceptId": $(this).data('concept-id'),
                        "term": $(this).data('term')
                    };
                    if ($(this).data('modifier') == "Exclude") {
                        grammar = " ( " + grammar + "MINUS " + panel.getExpressionForCondition(condition, htmlFormat, fullSyntax) + " ) " + breakLine;
                    } else {
                        if (!first) {
                            grammar = grammar + "OR ";
                        } else {
                            first = false;
                        }
                        grammar = grammar + panel.getExpressionForCondition(condition, htmlFormat, fullSyntax) + breakLine;
                    }
                }

            });

            var refinementSeparatorWritten = false;
            $('#' + panel.divElement.id + '-listGroup').find(".query-condition").each(function (index) {
                var criteria = $(this).data('criteria');
                if (criteria == "hasRelationship") {
                    if (!refinementSeparatorWritten) {
                        grammar+= " : ";
                        refinementSeparatorWritten = true;
                    } else {
                        grammar+= " , " + breakLine;
                    }

                    if ($(this).data('type-id') == "") {
                        if (fullSyntax) {
                            grammar+= " ANY";
                        } else {
                            grammar+= " *";
                        }
                    } else {
                        var condition = {
                            "criteria": "self",
                            "conceptId": $(this).data('type-id'),
                            "term": $(this).data('type-term')
                        };
                        grammar = grammar + panel.getExpressionForCondition(condition, htmlFormat, fullSyntax);
                    }
                    grammar += " = ";
                    if ($(this).data('target-id') == "") {
                        if (fullSyntax) {
                            grammar+= " ANY";
                        } else {
                            grammar+= " *";
                        }
                    } else {
                        var condition2 = {
                            "criteria": "self",
                            "conceptId": $(this).data('target-id'),
                            "term": $(this).data('target-term')
                        };
                        grammar = grammar + panel.getExpressionForCondition(condition2, htmlFormat, fullSyntax);
                    }
                }
            });
        }
        grammar = grammar.trim();
        console.log(grammar.charAt(0));
        console.log(grammar.charAt(grammar.length-1));
        if (grammar.charAt(0) == "(" && grammar.charAt(grammar.length-1) == ")") {
            grammar = grammar.substr(1,grammar.length-2);
        }

        return grammar;
    };

    this.execute = function (form, expression, clean, onlyTotal){
        panel.currentEx++;
        var currentEx = panel.currentEx;
        //$('#' + panel.divElement.id + '-footer').html("<i class='glyphicon glyphicon-refresh icon-spin'></i>");
        if (onlyTotal){
            limit = 1;
            skip = 0;
        }else{
            $('#' + panel.divElement.id + '-footer').html('<div class="progress progress-striped active"> <div class="progress-bar"  role="progressbar" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100" style="width: 100%"><span>Searching</span></div></div><p id="' + panel.divElement.id + '-waitingSearch-text" class="lead animated"></p>');
            $("#" + panel.divElement.id + "-waitingSearch-text").html("The server is processing your instructions...");
            $("#" + panel.divElement.id + "-waitingSearch-text").addClass("fadeInRight");
            setTimeout(function(){
                $("#" + panel.divElement.id + "-waitingSearch-text").removeClass("fadeInRight");
            }, 600);
            setTimeout(function(){
                $("#" + panel.divElement.id + "-waitingSearch-text").addClass("fadeOutLeft");
                setTimeout(function(){
                    $("#" + panel.divElement.id + "-waitingSearch-text").removeClass("fadeOutLeft");
                    if (xhrExecute != null && currentEx == panel.currentEx){
                        $("#" + panel.divElement.id + "-waitingSearch-text").html("The server is still processing your instructions...");
                        $("#" + panel.divElement.id + "-waitingSearch-text").addClass("fadeInRight");
                        setTimeout(function(){
                            $("#" + panel.divElement.id + "-waitingSearch-text").removeClass("fadeInRight");
                        }, 600);
                    }
                }, 600);
            }, 15000);
            setTimeout(function(){
                $("#" + panel.divElement.id + "-waitingSearch-text").addClass("fadeOutLeft");
                setTimeout(function(){
                    $("#" + panel.divElement.id + "-waitingSearch-text").removeClass("fadeOutLeft");
                    if (xhrExecute != null && currentEx == panel.currentEx){
                        $("#" + panel.divElement.id + "-waitingSearch-text").html("This seems to be a complex set of instructions, still processing...");
                        $("#" + panel.divElement.id + "-waitingSearch-text").addClass("fadeInRight");
                        setTimeout(function(){
                            $("#" + panel.divElement.id + "-waitingSearch-text").removeClass("fadeInRight");
                        }, 600);
                    }
                }, 600);
            }, 30000);
            setTimeout(function(){
                $("#" + panel.divElement.id + "-waitingSearch-text").addClass("fadeOutLeft");
                setTimeout(function(){
                    $("#" + panel.divElement.id + "-waitingSearch-text").removeClass("fadeOutLeft");
                    if (xhrExecute != null && currentEx == panel.currentEx){
                        $("#" + panel.divElement.id + "-waitingSearch-text").html("The server is processing a complex set of instructions. This action might not be supported in a public server. Some times instructions can be simplified by specifying conditions using concepts closer in the hierarchy to the intended results, avoiding unnecessary selections of large portions of the terminology.");
                        $("#" + panel.divElement.id + "-waitingSearch-text").addClass("fadeInRight");
                        setTimeout(function(){
                            $("#" + panel.divElement.id + "-waitingSearch-text").removeClass("fadeInRight");
                        }, 600);
                    }
                }, 600);
            }, 45000);
            setTimeout(function(){
                $("#" + panel.divElement.id + "-waitingSearch-text").addClass("fadeOutLeft");
                setTimeout(function(){
                    $("#" + panel.divElement.id + "-waitingSearch-text").removeClass("fadeOutLeft");
                    if (xhrExecute != null && currentEx == panel.currentEx){
                        $("#" + panel.divElement.id + "-waitingSearch-text").html("Instruction set exceeds maximum allowed time for computation. Some times instructions can be simplified by specifying conditions using concepts closer in the hierarchy to the intended results, avoiding unnecessary selections of large portions of the terminology.");
                        $("#" + panel.divElement.id + "-waitingSearch-text").addClass("fadeInRight");
                        setTimeout(function(){
                            $("#" + panel.divElement.id + "-waitingSearch-text").removeClass("fadeInRight");
                        }, 600);
                    }
                }, 600);
            }, 61000);

            $('#' + panel.divElement.id + '-resultInfo').html("<i class='glyphicon glyphicon-refresh icon-spin'></i>");
            if (clean){
                $('#' + panel.divElement.id + '-outputBody').html("");
                $('#' + panel.divElement.id + '-outputBody2').html("");
                limit = 100;
                skip = 0;
            }
        }
        var data = {
            expression: expression,
            limit : limit,
            skip : skip,
            form: form
        };
        if (xhrExecute != null && !onlyTotal)
            xhrExecute.abort();
        var xhrExecute2 = $.ajax({
            type: "POST",
            url: options.serverUrl.replace("snomed", "expressions/") + options.edition + "/" + options.release + "/execute/brief?access_token=" + options.token,
            data: data,
            dataType: "json",
            //timeout: 300000,
            success: function(result) {
                if (result.paserResponse.validation) {
                    data = result.computeResponse;
                    //result.computeResponse.matches
                    if (!onlyTotal){
                        $("#" + panel.divElement.id + "-exportResults").removeClass("disabled");
                        if (data.performanceCutOff) {
                            $('#' + panel.divElement.id + '-resultInfo').html("Found " + data.total + " concepts. <span class='text-danger'>This query cannot be completed in real-time, please schedule a Cloud executions. Results below are incomplete and some conditions were not tested. </span>");
                        } else {
                            $('#' + panel.divElement.id + '-resultInfo').html("Found " + data.total + " concepts");
                        }
                        $.each(data.matches, function (i, row){
                            $('#' + panel.divElement.id + '-outputBody').append("<tr style='cursor: pointer;' class='conceptResult' data-module='" + row.module + "' data-concept-id='" + row.conceptId + "' data-term='" + row.defaultTerm + "'><td>" + row.defaultTerm + "</td><td>" + row.conceptId + "</td></tr>");
                            $('#' + panel.divElement.id + '-outputBody2').append("<tr><td>" + row.defaultTerm + "</td><td>" + row.conceptId + "</td></tr>");
                        });

                        $('#' + panel.divElement.id + '-outputBody').find(".conceptResult").unbind();
                        $('#' + panel.divElement.id + '-outputBody').find(".conceptResult").click(function(event){
                            //console.log("clicked",$(event.target).closest("tr").attr('data-term'));
                            channel.publish(panel.divElement.id, {
                                term: $(event.target).closest("tr").attr('data-term'),
                                module: $(event.target).closest("tr").attr("data-module"),
                                conceptId: $(event.target).closest("tr").attr('data-concept-id'),
                                source: panel.divElement.id
                            });
                        });

                        if (limit + skip < data.total) {
                            $('#' + panel.divElement.id + '-footer').html("<span id='" + panel.divElement.id + "-more'>Show more (viewing " + (limit + skip) + " of " + data.total + " total)</span>");
                        } else {
                            $('#' + panel.divElement.id + '-footer').html("Showing all " + data.total + " matches");
                        }

                        $('#' + panel.divElement.id + '-more').unbind();
                        $('#' + panel.divElement.id + '-more').click(function (e) {
                            skip = skip + 100;
                            panel.execute(form, expression, false);
                        });
                    }else{
                        onlyTotal(data.total);
                    }

//                    $("#" + panel.divElement.id + "-syntax-result").html('<span class="label label-success">OK</span>');
//                    var resultsHtml = "";
//                    resultsHtml+='<p><span class="text-success">Total matches: ' + result.computeResponse.total + '</span></p>';
//                    if (result.computeResponse.matches) {
//                        result.computeResponse.matches.forEach(function(match){
//                            resultsHtml+=match.defaultTerm + ' ' + match.conceptId + '<br>';
//                        });
//                    } else {
//                        resultsHtml = result.computeResponse;
//                    }
//                    $("#" + panel.divElement.id + "-results").html(resultsHtml);
                } else {
                    if (expression.charAt(0) == "(" && expression.charAt(expression.length-1) == ")") {
                        expression = expression.substr(1,expression.length-2);
                        panel.execute(form, expression, clean, onlyTotal);
                    } else {
                        if (!onlyTotal){
                            $("#" + panel.divElement.id + "-syntax-result").html('<span class="label label-danger">ERROR</span>');
                            $("#" + panel.divElement.id + "-results").html("Error...");
                        }else{
                            onlyTotal("Error");
                        }
                    }
                }
            }
        }).done(function(result){
            // done
            xhrExecute2 = null;
        }).fail(function(jqXHR, textStatus){
            xhrExecute2 = null;
            if(textStatus === 'timeout') {
//                $("#" + panel.divElement.id + "-syntax-result").html('<span class="label label-danger">ERROR</span>');
//                $("#" + panel.divElement.id + "-results").html("Timeout...");
                if (!onlyTotal){
                    $('#' + panel.divElement.id + '-resultInfo').html("This query cannot be completed in real-time, please schedule a Cloud executions.");
                    $('#' + panel.divElement.id + '-footer').html("Timeout Error, use the Cloud for running this query");
                }else{
                    onlyTotal("Error");
                }
            } else if (textStatus == "abort"){

            } else {
                if (expression.charAt(0) == "(" && expression.charAt(expression.length-1) == ")") {
                    expression = expression.substr(1,expression.length-2);
                    panel.execute(form, expression, clean, onlyTotal);
                } else {
                    if (!onlyTotal){
                        $("#" + panel.divElement.id + "-syntax-result").html('<span class="label label-danger">ERROR</span>');
                        $("#" + panel.divElement.id + "-results").html("Error...");
                    }else{
                        onlyTotal("Error");
                    }
                }
            }
        });
        if (!onlyTotal)
            xhrExecute = xhrExecute2;
    }
}