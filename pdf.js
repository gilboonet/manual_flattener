const PDFDocument = require ('pdfkit');
const fs = require ('fs');

// charge rendu.dat
try {  
    var data = fs.readFileSync('rendu.tmp', 'utf8');
} catch(e) {
    console.log('Error:', e.stack);
}
mx = 30; my = -70;
d = data.toString().split('\n');
imax = d.length;

mode = 'prod';
//mode = 'debug';

// grisage forcé n° Triangle
GFT = [154,160,159,162,151,140,113,104,110,108,101,105,161,
	150,132,131,137,138,136,114,
	34,17,16,20,18,21,38,26,27,28,29
];
// grisage forcé n° Encoche
GFE = [26,160,159,138,108,150,161];

var deltaT = [];// deplacement n° Triangle
deltaT[163] = [0,-7]

var deltaE = [];// deplacement Encoche
deltaE[152]= [0,-10];

// Cree un document
var doc = new PDFDocument({size:'a4', layout:'portrait', margin:0});
ws = fs.createWriteStream('p1.pdf');
doc.pipe(ws);

for(i=0; i<imax; i++){
	console.log((parseInt(i)+1)+'/'+imax);
	ch = d[i];
	ct = ch.split(" ");
	if((ct[0]=='line')||(ct[0]=='dash')){
		x1 = parseFloat(ct[1])+mx;
		y1 = parseFloat(ct[2])+my;
		x2 = parseFloat(ct[3])+mx;
		y2 = parseFloat(ct[4])+my;
	}
	else if((ct[0]=='textT')||(ct[0]=='textt')||(ct[0]=='textE')){
		txt = ct[1];
		n=parseInt(txt);
		x = parseFloat(ct[2])+mx;
		y = parseFloat(ct[3])+my;
	}

	switch(ct[0]){		
		case 'line':
		case 'dash':
			c = ct[0] == 'line' ? 'black' : 'red';
			doc.polygon([x1, y1], [x2, y2]).stroke(c);
			break;
			
		case 'textT': // n° de triangle
		case 'textt': // idem grisé
			c = ct[0] == 'textT' ? 'black' : 'gray';
			if(GFT.indexOf(n) > -1)c = 'gray';
			if((mode == 'debug')||(c == 'black')){
				doc.fontSize(15).fillColor(c);
				x = x - doc.widthOfString(txt)/2;
				y = y - doc.heightOfString(txt)/2;
				if(deltaT[n] !== undefined) {
					x = x + deltaT[n][0];
					y = y + deltaT[n][1];
				}
				doc.text(txt, x, y);
			}
			break;
		case 'textE': // n° d'encoche
			c = GFE.indexOf(n) > -1 ? 'gray' : 'blue';
			if((mode== 'debug')||(c =='blue')){
				doc.fillColor(c).fontSize(12);
				x = x - doc.widthOfString(txt)/2;			
				if(deltaE[n] !== undefined) {
					x = x + deltaE[n][0];
					y = y + deltaE[n][1];
				}
				doc.text(txt, x, y);
			}
			break;
	}
}

// Finalize PDF file
doc.end()
