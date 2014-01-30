# SNOMED Interaction Components

SNOMED Interaction Components are Javascript widgets that can be easily integrated in any website.

## Concept Details Widget Example

The ConceptDetails panel is a proof of concept for a panel that displays the details of a SNOMED CT concept. In this stage the panel displays the descriptions of a concept.

This example loads the widget in a simple HTML page.

The widget has two modes, plain Javascript object, or JQuery plugin. We will explain both approaches in this tutorial. Both modes provide similar features, and the decision to use one or the other depends on personal preferences of the user.

### Importing dependencies

This widget depends on JQuery (js) and Bootstrap (js + css), so any recent version of both needs to be made available.

```
<script src="../lib/jquery-2.1.0.min.js" type="text/javascript"></script>
<script src="../lib/bootstrap.min.js"></script>
<link rel="stylesheet" href="../css/bootstrap.min.css">
<link rel="stylesheet" href="../css/bootstrap-theme.min.css">
```

### Importing the Concept Details widget library

The concept details widget is distributed as a Javascript file (.js), available [here](https://github.com/termMed/snomed-interaction-components/raw/master/lib/conceptDetailsPlugIn.js). It needs to be imported in the HTML page also.

```
<script src="../lib/conceptDetailsPlugIn.js" type="text/javascript"></script>
```

### Preparing the canvas for the Concept Details panel

The body of the HTML page needs to include a div element that will contain the widget. This div needs to have a unique id. In this example we also assign the `onload` event of the body to the `initialize()` javascript function (that we will create later).

In this exampel we create two different divs, one as an example of plain Javascript mode and the other for the example of the JQuery mode.

```
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

```
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

SNOMED CT (Root): ee9ac5d2-a07c-3981-a57a-f7f26baf38d8
Clinical finding: bd83b1dd-5a82-34fa-bb52-06f666420a1c
Asthma: c265cf22-2a11-3488-b71e-296ec0317f96
Atenolol: f4298478-304f-36ca-bf05-7e14fbaebc5a

## Full Example HTML
```
<!--
To change this license header, choose License Headers in Project Properties.
To change this template file, choose Tools | Templates
and open the template in the editor.
-->
<!DOCTYPE html>
<html>
    <head>
        <meta http-equiv="content-type" content="text/html; charset=ISO-8859-1">
        <title>Fancytree - Example</title>

        <script src="../lib/jquery-2.1.0.min.js" type="text/javascript"></script>
        <script src="../lib/conceptDetailsPlugIn.js" type="text/javascript"></script>
        <link rel="stylesheet" href="../css/bootstrap.min.css">
        <link rel="stylesheet" href="../css/bootstrap-theme.min.css">
        <script src="../lib/bootstrap.min.js"></script>
    </head>

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
    <body onload="initialize()">
        <h1>Testing Concept Details Widget</h1>

        <h2>Plain Javascript mode</h2>
        <div id="concept_details_canvas" style="width:30%; height:100%"></div>

        <h2>JQuery mode</h2>
        <div id="concept_details_canvas_jquery" style="width:30%; height:100%"></div>
    </body>
</html>

```
