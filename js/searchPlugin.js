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
    
    this.$divElement.append('<form>');
    this.$divElement.append('<div class="form-group">');
    this.$divElement.append('<label for="searchBox">Search as you type</label>');
    this.$divElement.append('<input type="search" class="form-control" id="searchBox" placeholder="Search...">');
    this.$divElement.append('</div>');
    this.$divElement.append('</form>');
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
        //http://ec2-23-22-254-72.compute-1.amazonaws.com/sct-rest-api/rest/snomed/descriptions?phrase=asthma
        //$('#resultsTable').append("<tr><td>" + t + "</td></tr>");
        $('.resultRow').remove();
        $.getJSON("http://ec2-23-22-254-72.compute-1.amazonaws.com/sct-rest-api/" + "rest/snomed/descriptions?limit=5&phrase=" + t, function(result) {
            $.each(result, function(i, field) {
                $('#resultsTable').append("<tr class='resultRow'><td><div class='jqui-draggable'data-concept-id='" + field.conceptId + "'>"  + field.term + "</div></td></tr>");
            });
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


