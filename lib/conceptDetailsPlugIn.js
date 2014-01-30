function conceptDetails(divElement, conceptId, options) {
   this.conceptId = conceptId;
   this.divElement = divElement;
   this.options = options;
   this.url = "http://ec2-54-226-82-147.compute-1.amazonaws.com/sct-rest-api/";
   
   if (typeof options.url != "undefined") {
   		this.url = options.url;
   }
    
   this.getConceptId = function() {
       return this.conceptId;
   }
   
   this.getDivId = function() {
       return this.divId;
   }
   
   this.updateDivContent = function() {
       $.getJSON(this.url + "rest/snomed/concepts/" + this.conceptId + "/descriptions",function(result) {
            detailsHtml = "<table class='table table-bordered'>";
            detailsHtml = detailsHtml + "<thead><tr>";
            detailsHtml = detailsHtml + "<th>Term</th>";
            if (options.showIds == "true") {
            	detailsHtml = detailsHtml + "<th>SCTID</th>";
            }
            detailsHtml = detailsHtml + "</tr></thead>"; 
            $.each(result, function(i, field){
                var row = "<tr>"; 
                row = row + "<td>" + field.term + "</td>"; 
                if (options.showIds == "true") {
                    row = row + "<td>" + field.descSctid + "</td>"; 
                }
                row = row + "</tr>";
                detailsHtml = detailsHtml + row;    
                });
          detailsHtml = detailsHtml + "</table>";
          $(divElement).html(detailsHtml);
      });
   }
}

(function( $ ) {
 
    $.fn.addConceptDetails = function(conceptId, options) {
        this.filter( "div" ).each(function() {
            var cd = new conceptDetails(this, conceptId, options);
    		cd.updateDivContent();
        });
 
    };
}( jQuery ));

