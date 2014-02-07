/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

function searchPanel(divElement, options) {
    var thread = null;

    this.$divElement = $(divElement);
    this.options = options;
    this.url = "http://ec2-23-22-254-72.compute-1.amazonaws.com/sct-rest-api/";
    
    searchHtml = '<form>';
    searchHtml = searchHtml + '<div class="form-group">';
    searchHtml = searchHtml + '<label for="searchBox">Search as you type</label>';
    searchHtml = searchHtml + '<input type="search" class="form-control" id="searchBox" placeholder="Search...">';
    searchHtml = searchHtml + '</div>';
    searchHtml = searchHtml + '</form>';
    searchHtml = searchHtml + "<div id='searchResultItems' class='panel panel-default' style='height:100px;overflow:auto;margin-bottom: 15px;'>";
    searchHtml = searchHtml + "<table id='resultsTable' class='table table-bordered'>";
    searchHtml = searchHtml + "</table>";
    searchHtml = searchHtml + "</div>";
    this.$divElement.html(searchHtml);
    $('#searchBox').keyup(function() {
        clearTimeout(thread);
        var $this = $(this);
        thread = setTimeout(function() {
            search($this.val())
        }, 1000);
    });

    function search(t) {
        console.log(t);
        //http://ec2-23-22-254-72.compute-1.amazonaws.com/sct-rest-api/rest/snomed/descriptions?phrase=asthma
        //$('#resultsTable').append("<tr><td>" + t + "</td></tr>");
        $('#resultsTable').html("<i class='glyphicon glyphicon-refresh icon-spin'></i>");
        resultsHtml = "";
        $.getJSON("http://ec2-23-22-254-72.compute-1.amazonaws.com/sct-rest-api/" + "rest/snomed/descriptions?limit=5&phrase=" + t, function(result) {
            $.each(result, function(i, field) {
                resultsHtml = resultsHtml + "<tr class='resultRow'><td><div class='jqui-draggable'data-concept-id='" + field.conceptId + "'>"  + field.term + "</div></td></tr>";
            });
            $('#resultsTable').html(resultsHtml);
            $('#resultsTable').find(".jqui-draggable").draggable({
                containment: 'window',
                helper: 'clone'
            });
        }).done(function() {
            //$(divElement).html(detailsHtml);
        }).fail(function() {
            //$('#resultsTable').html("<div class='alert alert-danger'><strong>Error</strong> while retrieving data from server...</div>");
        });
    }
}


