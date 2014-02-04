/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

function searchPanel(divElement, options) {
    var thread = null;

    this.$divElement = $(divElement);
    this.options = options;
    this.url = "http://ec2-54-226-82-147.compute-1.amazonaws.com/sct-rest-api/";

    this.$divElement.append("<input id=searchBox>");
    this.$divElement.append("<div id='searchResultItems'/>").append("<table id='resultsTable' class='table table-bordered'/>");

    $('#searchBox').keyup(function() {
        clearTimeout(thread);
        var $this = $(this);
        thread = setTimeout(function() {
            search($this.val())
        }, 1000);
    });

    function search(t) {
        console.log(t);
        //http://ec2-54-226-82-147.compute-1.amazonaws.com/sct-rest-api/rest/snomed/descriptions?phrase=asthma
        //$('#resultsTable').append("<tr><td>" + t + "</td></tr>");
        $('.resultRow').remove();
        $.getJSON("http://ec2-54-226-82-147.compute-1.amazonaws.com/sct-rest-api/" + "rest/snomed/descriptions?limit=5&phrase=" + t, function(result) {
            $.each(result, function(i, field) {
                $('#resultsTable').append("<tr class='resultRow'><td>" + field.term + "</td></tr>");
            });
        });
    }
}


