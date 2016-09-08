# manual_flattener
http://openjscad.org script to flatten a CSG for lasercut

Manual flattener is my first try at Github, so I hope it will be OK.

The purpose of this project is to flatten a CSG so it can be crafted (my usage is lasercut cardboard).

I wanted to keep this project simple, so it form is very simple : it is a script to use with OpenJSCAD.

The file 'aplat_manuel_base.jscad' contains an example.

To use the script, you need this script and also your CSG that must be put into the function vmain().

vmain() is what OpenJSCAD generate when you drag an STL file on its FileDropZone, just with a v added to main().

Try to reduce the number of triangles of your STL, MeshLab filter called 'Quadric Edge Collapse Decimation' is excellent for that. I would say that 500 triangles is a good maximum.

When you have your STL data put into vmain(), to proceed you must edit main() function that I describe here :

1°) if needed you can manipulate your CSG (to cut, transform it or do any customization)
2°) basically at this stage all pieces are flatten and put at the origin, what you must to is :
    a) choose a piece that is not drawn, put it where you want
    b) attach and draw its neighbours then their neighbours and so on
    c) if needed restart from a)
    
function main(params){ // SCRIPT
...	
  A = vmain().scale(0.5);
	//A = decoupe(A); // Decoupe si besoin
	A = A.rotateX(180).rotateZ(180);
  //B = supprime_plats(A);
  B = A.polygons;
	C = reseaute(B);
	nC = 0;
	
	1°) 
	- change the scale value if needed
	- uncomment the call to decoupe() and adapt it if you need to cut you CSG with planes
	- the rotation can help you better vizualise where are the pieces you draw (you can also change the value of gT3D to move the CSG).
	- if you cut your CSG, it will has supplemental triangles where the cut was done, you can remove them with supprime_plats(), but its not a very clever function that simply removes any polygon where all x or y or z are the same.

  2°)
// DEBUT du dépliage manuel (beginning of manual unfolding)

  You only need three functions to unfold
  a) pose(n, x, y)  : draw piece #n and put it at coordinates [x,y]
      don't hesitate to use coordinates like 100,0 to easily show where the pieces will be
  
  b) fixeTout(n)    : attach all the neighbour of piece #n,
      there is also an array version :
     fixeTout([...]) that does the same for each member of the array
  
  c) fixe(n1, n2 [,true]) : attach piece #n2 to piece #n1, its the basis of this script, it finds the best rotation angle for piece #n2 so it fits with piece #n1, it's an ugly loop as I didn't find the correct formula to calculate it.
      the third parameter is set (only with true) when the attachment angle must be reversed (I suspect it is for mountains folds but I don't have the maths to correctly detect that so I use this trick to solve this problem).
      
  Now you only need to draw a piece, attach neighbours, repeat tiil all pieces are drawn.
  The javascript console will show a log to see how your unfolding goes (in french).
  
  Each time you launch the script, it renders flat pieces with colored numbers :
  - black numbers means that all neighbours of the piece are drawn
  - red numbers means that this piece has at least one neighbour that is not drawn
  
For simple STL you will only need pose() and series of fixeTout([]) with a list of all red numbers till you have all the pieces, but most of times there will be pieces that will unfold over others, so you will need to remove them from the fixeTout() array and add one or more fixe(). Also when you will encounter badly rotated pieces (as I explained earlier) you will need to replace the piece from fixeTout, add fixe (n1, n2) for its corected attachments and fixe(n1,n2, true) for the badly rotated attachment. 
  
    pose(0,0,0);
    fixeTout(0);
    fixeTout([1,9,10]);
    fixeTout([5,6,11,22,28]);
    fixeTout([4,7,12,13,21,29,30,31,38]);
    fixeTout([2,3,15,20,23,32,37,39,46,54,55,56,66]);
    fixeTout([8,16,19,26,27,34,40,41,47,48,49,65,67,76,77,78,83,84]);
    fixeTout([14,17,18,25,35,36,44,45,57,58,59,68,70,75,96,98,100,114,117]);
    fixe(99,116);
    fixeTout([24,42,43,53,60,61,62,64,69,71,79,85,94,95,97,115,116,118,127,128]);
    fixeTout([33,50,52,63,74,82,86,88,91,102,103,104,113,126,129,138,140,153,155,158]);
    fixeTout([51,72,80,81,87,92,105,106,110,112,119,120,137,139,141,142,152,154,156,157,159,182,197]);
    fixeTout([73,90,107,109,111,124,125,130,136,143,145,147,161,169,177,178,179,180,181,195,224]);
    fixeTout([108,122,123,131,134,135,144,146,148,151,160,168,170,176,194,196,198,205,206,220,223,225]);
    fixeTout([121,133,149,150,164,166,167,171,172,173,183,185,203,218,219,221,222,226,227,235,244,246]);
    fixeTout([132,162,163,165,174,184,186,190,192,193,201,204,217,228,230,234,245,247,255,257,270,272]);
    fixeTout([175,188,189,191,200,207,208,210,215,216,229,243,248,254,268,269,271,273,291]);
    fixeTout([187,209,211,212,214,233,237,238,239,250,266,274,278,289,290,292]);
    fixe(315,314);
    fixeTout([213,231,241,249,252,253,259,264,265,279,299,300,314,316]);
    fixeTout([232,242,260,275,277,280,281,294,298,308,317,328]);
    fixeTout([261,263,282,286,293,296,309,310,325]);
    fixe(331,329);
    fixeTout([283,303,304,329]);
    fixeTout([297,312,319]);
    fixeTout([322,330,234,324,321,313,327]);
    fixe(306,287);
// FIN du dépliage manuel


To export the result of this script as svg, you must uncheck the parameters "voir 3D" and "voir n°" (see 3D and see numbers), render then save as STL, run Slic3r, execute "File/Slice to svg" and choose the saved file. Then you will certainly need to run Inkscape to change the inner walls depending on the way you laser handles them. I hope that OpenJSCAD will soon let us customize SVG so that Slic3r and Inkscape won't be needed. A js app could certainly do those steps but for this first try at GitHub I didn't want to do something too complex to explain.
