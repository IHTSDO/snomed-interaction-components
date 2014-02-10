# SNOMED Interaction Components

SNOMED Interaction Components are Javascript widgets that can be easily integrated in any website.

[Click here for the demo site](http://termmed.github.io/snomed-interaction-components/)

## Concept Details and Search Widgets Example

The ConceptDetails panel is a proof of concept for a panel that displays the details of a SNOMED CT concept. The search widget provides a search as you type UI for SNOMED CT. Search works with the following pattern: `^text text*`.

This example loads these two widgets in a simple HTML page, and add some javascript code to add new instances in a fluid row of widgets.

Each widge has two modes, plain Javascript object, or JQuery plugin. We will explain both approaches in this tutorial. Both modes provide similar features, and the decision to use one or the other depends on personal preferences of the user.

### Importing dependencies

This widget depends on JQuery (js) and Bootstrap (js + css), so any recent version of both needs to be made available.

```HTML
<script src="lib/jquery-2.1.0.min.js" type="text/javascript"></script>
<script src="lib/jquery-ui-1.10.4.custom.min.js" type="text/javascript"></script>
<script src="lib/bootstrap.min.js"></script>
<link rel="stylesheet" href="css/bootstrap.min.css">
<link rel="stylesheet" href="css/bootstrap-theme.min.css">
<link rel="stylesheet" href="css/jquery-ui-1.10.4.custom.min.css">
```

### Importing the Concept Details widget library

The SNOMED CT widgets are distributed as a Javascript file (.js), available [here](https://github.com/termMed/snomed-interaction-components/raw/master/js). It needs to be imported in the HTML page also.

```HTML
<script src="js/conceptDetailsPlugIn.js" type="text/javascript"></script>
<script src="js/searchPlugin.js" type="text/javascript"></script>
```

### Preparing the canvas for the Concept Details panel

The body of the HTML page needs to include a div element that will contain the widget. This div needs to have a unique id. In this example we also assign the `onload` event of the body to the `initialize()` javascript function (that we will create later).

In this example we create two different divs, one as an example of plain Javascript mode and the other for the example of the JQuery mode.

```HTML
    <body onload="initialize()">
        <h1>Testing Concept Details Widget</h1>

        <h2>Plain Javascript mode</h2>
        <div id="concept_details_canvas" style="width:30%; height:100%"></div>

        <h2>JQuery mode</h2>
        <div id="concept_details_canvas_jquery" style="width:30%; height:100%"></div>
    </body>
```

### Initializing the Concept Details Panel

The `initialize()` function should be implemented in javascript in this example HTML page. It will define the `options` object that will configure the panel preferences.

After that, 2 panels are created using the 2 different modes.

```HTML
    <script type="text/javascript">
        function initialize() {
            // Example: common options object
            var options = {
                languageRefset: "bca0a686-3516-3daf-8fcf-fe396d13cfad",
                showIds: "true"
            };

            // Example: load first widget using plain javascript
            var cdPanel = new conceptDetails(document.getElementById("concept_details_canvas"),
                    "c265cf22-2a11-3488-b71e-296ec0317f96", options);
            cdPanel.updateDivContent();

            // Example: load second widget using JQery
            $("#concept_details_canvas_jquery").addConceptDetails("c265cf22-2a11-3488-b71e-296ec0317f96", options);

        }
    </script>
```

#### Defining the connection to the Terminology Server

The `options` object can include a property called `url` that would allow to connect to any provided terminology server, that follows a pre-defined rest methods API. In this example we don't provide any `url` value and the plugin will default to a development Terminology Server.

#### Defining the Concept to display

In both calls, one of the parameters is the concept UUID, in the example the UUID is `"c265cf22-2a11-3488-b71e-296ec0317f96"`, in future iteration of the widgets it will be possible to use SCTIDs instead of UUIDs.

Some example UUIDs to test:

* SNOMED CT (Root): ee9ac5d2-a07c-3981-a57a-f7f26baf38d8
* Clinical finding: bd83b1dd-5a82-34fa-bb52-06f666420a1c
* Asthma: c265cf22-2a11-3488-b71e-296ec0317f96 - 195967001
* Atenolol: f4298478-304f-36ca-bf05-7e14fbaebc5a - 87652004

After the initial load, it is possible to set the panel to a different concept by using the Javascript object methods.

```JavaScript
panel.conceptId = "ee9ac5d2-a07c-3981-a57a-f7f26baf38d8";
panel.updateDivContent();
```

## Full Example HTML
```HTML
<!DOCTYPE html>
<html>
    <head>
        <meta http-equiv="content-type" content="text/html; charset=UTF-8">
        <title>SNOMED CT Interaction Components</title>

        <script src="lib/jquery-2.1.0.min.js" type="text/javascript"></script>
        <script src="lib/jquery-ui-1.10.4.custom.min.js" type="text/javascript"></script>
        <script src="js/conceptDetailsPlugin.js" type="text/javascript"></script>
        <script src="js/searchPlugin.js" type="text/javascript"></script>
        <link rel="stylesheet" href="css/bootstrap.min.css">
        <link rel="stylesheet" href="css/bootstrap-theme.min.css">
        <link rel="stylesheet" href="css/sct-widgets.css">
        <link rel="stylesheet" href="css/jquery-ui-1.10.4.custom.min.css">
        <script src="lib/bootstrap.min.js"></script>

        <script type="text/javascript">
            function initialize() {
                // Example: common options object
                var options = {
                    languageRefset: "bca0a686-3516-3daf-8fcf-fe396d13cfad",
                    showIds: true,
                    displaySynonyms: false,
                    selectedView: "stated",
                    displayChildren: false
                };

                // Example: load first widget using plain javascript
                var sp = new searchPanel(document.getElementById("search_canvas"), options);

                // Example: load first widget using plain javascript
                var cdPanel = new conceptDetails(document.getElementById("concept_details_canvas"),
                        "195967001", options);
                cdPanel.setupCanvas();

                // Example: load second widget using JQery
                //$("#concept_details_canvas_jquery").addConceptDetails("c265cf22-2a11-3488-b71e-296ec0317f96", options);
                var count = 1;
                $("#addSearchButton").click(function() {
                    count = count + 1;
                    $("#searchRow").append('<div class ="col-md-6"><div id="search_auto_canvas_' + count + '"></div></div>');
                    var spa = new searchPanel(document.getElementById("search_auto_canvas_" + count), options);
                });
                $("#addCDButton").click(function() {
                    count = count + 1;
                    $("#cdRow").append('<div class ="col-md-6"><div id="cd_auto_canvas_' + count + '"></div></div>');
                    $("#cd_auto_canvas_" + count).addConceptDetails("195967001", options);
                });

                //$("#concept_details_canvas_3").addConceptDetails("c265cf22-2a11-3488-b71e-296ec0317f96", options);
                //$("#concept_details_canvas_4").addConceptDetails("c265cf22-2a11-3488-b71e-296ec0317f96", options);

            }
        </script>
    </head>
    <body onload="initialize()">
        <div class="container">
            <div class="row container">
                <h1>Testing SCT Interaction Components</h1>
            </div>
            <div class="row container">
                <button type="button" class="btn btn-primary" id="addSearchButton">Add Search</button>
            </div>
            <div class="row" id="searchRow">
                <div id="search_canvas" class ="col-md-6"></div>
            </div>
            <div class="row container">
                <button type="button" class="btn btn-primary" id="addCDButton">Add Concept Details</button>
            </div>
            <div class="row" id="cdRow">
                <div class ="col-md-6">
                    <div id="concept_details_canvas"></div>
                </div>
            </div>
        </div>
    </body>
</html>
```
