function main() {
    
    var A = sphere({r:1, fn:8}).scale([4,4,2]);

    var B = A.polygons;
    var num = 4;
    var poly = CSG.fromPolygons([B[num]]);
    
    //var tmp = poly.lieFlat();
    var transformation = poly.getTransformationToFlatLying();
    var tmp = poly.transform(transformation);
    
    //var transformationBack = ?
    
    txt = text(0,0,num.toString());
    
    R = tmp.subtract(txt);
    return [
         color("yellow", poly).translate([0,10,0])
        ,color([0,0,1,0.3], A).translate([0,10,0]) 
        ,color("yellow", R)
        ,color("black", txt)
    ];
}

function text(x, y, ch){
var l = vector_text(0 , 0, ch);   // l contains a list of polylines to be drawn
var o = [];
l.forEach(function(pl) {                   // pl = polyline (not closed)
   o.push(rectangular_extrude(pl, {w: 2, h: 2}));   // extrude it to 3D
});
return union(o).scale(0.025).translate([x,y]).mirroredX();
}
