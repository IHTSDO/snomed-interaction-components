/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
function drawSctDiagram(concept, parentDiv) {
    parentDiv.svg({settings: {width: '600px', height: '500px'}});
    var svg = parentDiv.svg('get');
    loadDefs(svg);
    rect1 = drawSctBox(parentDiv, 10, 10, "<span class='sct-box-id'>12676007<br></span>Fracture of radius", "sct-defined-concept");
    circle1 = drawEquivalentNode(svg, 120,130);
    drawSubsumedByNode(svg, 120,230);
    drawSubsumesNode(svg, 120,330);
    drawSctBox(parentDiv, 100, 400, "&lt;slot&gt;", "sct-slot");
    connectElements(svg, rect1, circle1, 'center', 'left');
    
    circle2 = drawConjunctionNode(svg, 200, 130);
    connectElements(svg, circle1, circle2, 'right', 'left');
    
    rect2 = drawSctBox(parentDiv, 250, 100, "<span class='sct-box-id'>65966004<br></span>Fracture of forearm", "sct-defined-concept");
    connectElements(svg, circle2, rect2, 'bottom', 'left', 'ClearTriangle');
    
    rect3 = drawSctBox(parentDiv, 250, 200, "<span class='sct-box-id'>429353004<br></span>Injury of radius", "sct-defined-concept");
    connectElements(svg, circle2, rect3, 'bottom', 'left', 'ClearTriangle');
    
    circle3 = drawAttributeGroupNode(svg, 250, 330);
    connectElements(svg, circle2, circle3, 'bottom', 'left');
    
    circle4 = drawConjunctionNode(svg, 300, 330);
    connectElements(svg, circle3, circle4, 'right', 'left');

    rect4 = drawSctBox(parentDiv, 350, 300, "<span class='sct-box-id'>116676008<br></span>Associated morphology", "sct-attribute");
    connectElements(svg, circle4, rect4, 'right', 'left');
    
    rect5 = drawSctBox(parentDiv, 550, 300, "<span class='sct-box-id'>72704001<br></span>Fracture", "sct-primitive-concept");
    connectElements(svg, rect4, rect5, 'right', 'left');
    
    rect6 = drawSctBox(parentDiv, 350, 400, "<span class='sct-box-id'>363698007<br></span>Finding site", "sct-attribute");
    connectElements(svg, circle4, rect6, 'bottom', 'left');
    
    rect7 = drawSctBox(parentDiv, 550, 400, "<span class='sct-box-id'>62413002<br></span>Bone structure of radius", "sct-primitive-concept");
    connectElements(svg, rect6, rect7, 'right', 'left');
}

function toggleIds() {
    $('.sct-box-id').toggle();
}

