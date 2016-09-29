// Mise à plat d'un volume : cube
// Gilbert Duval 2016-09-27
/*
function getParameterDefinitions() { return [ // PARAMETRES
{ name: 'prec', type: 'float', initial:0.05, caption: "Précision"},
{ name: 'rendu',type: 'choice', initial: 3, caption: "Rendu :", values:[3,2], captions:["3d ", "2d"]},
{ name: 'V3D',  type: 'checkbox', checked:false, initial:0, caption:"voir 3D ?"},
{ name: 'VNU',  type: 'checkbox', checked:true, initial:0, caption:"voir n° ?"},
{ name: 'SVG',  type: 'checkbox', checked:false, initial:0, caption:"Générer SVG ?"}
  ];}*/
// GLOBAUX
const estNonTeste = -1, estDistant = 0, estVoisin = 1, estRelie = 2;
var vMin, C, D, E, nC, gT3D = [0,120,-40];
function r2(x){return Math.round(x*100)/100;}
function uniq(a) {
    return a.sort().filter(function(item, pos, ary) {
        return !pos || item != ary[pos - 1];
    });
}
function main(){ // SCRIPT
    var params = {
        prec:0.1, rendu:3, V3D:true, VNU:true, SVG:true
    };
    var A, B, R, T0, i,j, F;
    T0 = performance.now();
    vMin = params.prec;
	A = vmain().scale(5);
    //A = decoupe(A); // Decoupe si besoin
	A = A.rotateZ(180).rotateX(-90); //.rotateX(0)
    //B = supprime_plats(A);
    B = A.polygons;
	C = reseaute(B);
	nC = 0;
	D = []; // pieces assemblées
	E = []; // lignes de jointure

	// DEBUT du dépliage manuel ---------
pose(0,0,0); fixeTout([0,4]);
// FIN du dépliage manuel -----------

if(C.length > nC){
    echo("Reste : " +(C.length-nC) +"/"+ C.length);
}else{
    echo("Les "+C.length+" pièces sont posées");
}
	// RENDU
	R = affiche(params, B);
	
	pid = [];
	for(i in D){
	    for(j in D[i]){
	        pid.push(D[i][j].p2);
	    }
	}
	F = [];
	tmp = uniq(pid.sort());
	for(i in tmp)
	  F.push(C[tmp[i]].piece);
	  
	if(params.SVG !== false){ // Générer SVG
	    tmp = [];
	    for(i in F){
	        p = F[i].polygons[0].vertices;
	        pts = [];
	        for(j in p){
	            pts.push({x:p[j].pos.x, y:p[j].pos.y});
	        }
	        tmp.push(polygon(pts));
	    }
	    tmp = union(tmp);
	    //console.table(tmp);
	    
	    pL = []; // liste des points à tracer
	    cSVG = [];
	    cSVG.push('<svg width="200" height="200" viewBox="-100 -100 200 200">');
	    //for(i in E){
            ch = '<polygon points="';
	      ppts = [];
	      for(i in F){
			p = F[i].polygons[0].vertices;
	        pts = [];
	        for(j in p){
	            pts.push({x:r2(p[j].pos.x), y:r2(p[j].pos.y)});
	        }
	        
	        pts = polygon(pts).sides;
	        for(var j2 in pts)
	            ppts.push(pts[j2]);
	      }
	        // x1, y1, x2, y2, nb
	        for(j in ppts){
	            pt1 = ppts[j].vertex0.pos;
	            pt2 = ppts[j].vertex1.pos;
                //pt1 = {x:r2(pt1.x), y:r2(pt1.y)};
                //pt2 = {x:r2(pt2.x), y:r2(pt2.y)};
	            
	            if( (pt1.x < pt2.x)||
	                (diff(pt1.x, pt2.x)&&(pt1.y < pt2.y) )){ 
	                // inverser pt1 et pt2
	                ptmp = {x:pt1.x, y:pt1.y};
	                pt1 = {x:pt2.x, y:pt2.y};
	                pt2 = {x:ptmp.x, y:ptmp.y};
	            }
	            
	            // recherche dans pL
	            ok = false;
	            for(var k in pL){
	                pt = pL[k];
	                if(diff(pt.x1, pt1.x) && diff(pt.y1, pt1.y)
	                && diff(pt.x2, pt2.x) && diff(pt.y2, pt2.y)){
	                    ok = true;
	                    pL[k].nb++;
	                    echo("double");
	                    break;
	                }
	            }
	            if(!ok){
	                pL.push({x1:pt1.x, y1:pt1.y, 
	                        x2:pt2.x, y2:pt2.y, nb:1});
	            }
	        }

	        echo(pL.length+' points');
	            
            for(j in pL){
	            pt = pL[j];
	            echo(j+':'+pt.nb);
	            ok = pt.nb == 1; //false;
	            if(ok){
	                ch = '<line x1="'+ pt.x1 + '" y1="' + pt.y1
	                   +'" x2="' + pt.x2 + '" y2="' + pt.y2
	                   +'" style="stroke:#000;"/>';
    	            cSVG.push(ch);
	            } else { // pointiller
                    r = [];
                    dx = (pt.x2 - pt.x1)/10;
                    dy = (pt.y2 - pt.y1)/10;
                    x = pt.x1; y = pt.y1;
                    for(m=0; m<10; m++,x += dx, y+=dy){
                        r.push([x,y]);
                    }
                    for(k=0; k<r.length-1; k+=3){
    	                ch = '<line x1="'+ r[k][0] + '" y1="' + r[k][1]
	                       +'" x2="' + r[k+1][0] + '" y2="' + r[k+1][1]
	                    +'" style="stroke:#000;"/>';
    	                cSVG.push(ch);
                    }
	            }
	        }
	    
	    cSVG.push('</svg>');
	    echo(cSVG.join('\n'));
	    
	    pts = [];
	    return tmp;
	}
	else{
    if(params.rendu == 3){
        if(params.V3D !== false)
            R.push(color([1,1,1,0.3], A.translate(gT3D)));
        echo(affiche_duree(performance.now() - T0));
        return R;
    } else {
        return union(R);
    }
	}
}
function affiche_duree(T){
    var c;

    c = "00" + parseInt(Math.round(T / 1000) % 60);
return parseInt(Math.round(T / 60000) % 60)
    + ':' + c.substr(c.length-2);
}
function fixeToutVoisins(n){
    for(var i in C[n].voisins)fixeTout(C[n].voisins[n].id);
}
function fixeTout(n){
    if(n.constructor === Array){
       n.forEach(function(i) {fixeTout(i);});
    } else {
      for(var i in C[n].voisins)fixe(n, C[n].voisins[i].id);
    }
}
function reseaute(B){
	var R = [], i, j, tmp, BiTmp, nOk, corr, BjTmp, pt1, pt2, n, m;
	
	for(i in B){
		tmp = [];
		BiTmp = B[i].vertices;
		for(j in B){
			nOK = 0;
			corr = [];
			if(j != i){
				BjTmp = B[j].vertices;
				for(n in B[i].vertices){
					pt1 = B[i].vertices[n].pos;
					for(m in B[j].vertices){
						pt2 = B[j].vertices[m].pos;
						if( diff(pt1.x, pt2.x)
						 && diff(pt1.y, pt2.y)
						 && diff(pt1.z, pt2.z)){
							nOK++;
							corr.push({p1:parseInt(n), p2:parseInt(m), etat:estNonTeste});
						}
					}
				}
			}
			if(nOK == 2){
				tmp.push({id:parseInt(j), c:corr});
			}
		}
		R.push({ piece:CSG.fromPolygons([B[i]]).lieFlat(), voisins:tmp, estPosee:false });
	}
	return R;
}
function pose(n, x, y){
    tmp = [];
    C[n].estPosee = true;
    
    tmp.push({p1:-1, p2:n});
    D.push(tmp);
    
    if((typeof x !== 'undefined')&&(typeof y !== 'undefined'))
        C[n].piece = C[n].piece.translate([x,y]);
    
    echo("POSE " +n+ " ("+ listeVoisins(n)+")");
    nC++;
}
function listeVoisins(n){
    var v = [], i;
    for(i in C[n].voisins)v.push(C[n].voisins[i].id);
    return v.join();
}
function compteVoisinsPoses(n){
    var r = 0, i;
    for(i in C[n].voisins)
        if(C[C[n].voisins[i].id].estPosee)r++;
    return r;
}
function affiche(params, B){
    var R = [], c, i, j, pts, pt, np, centre, pt1, V, P, n;
    for(i in C){
        c = [Math.random(1), Math.random(1), Math.random(1), 0.8];
        //c = [i/C.length/2, i/C.length/2, i/C.length/2];
        //c = [0.5+i/C.length/2,0,0];
        if(C[i].estPosee){
            pts = [];
			P = C[i].piece.polygons[0];
			np = P.vertices.length;
            for (j in P.vertices){
                pt = P.vertices[j].pos;
                pts.push({x:pt.x, y:pt.y});
            }

            if(params.rendu == 3){
                tmp = rectangular_extrude(pts, {w: 0.15, h: 0.3, closed: true});
                if(params.V3D !== false)
                    R.push(color(c, C[i].piece.subtract(tmp)));
                R.push(color("black", tmp));
                if(params.VNU !== false){
                    if(pts.length == 3){
                        centre = centroid(P);
                    } else {
                        centre = fakecentroid(P);
                    }
				    //R.push(color([1-c[0], 1-c[1], 1-c[2]], text(centre.x, centre.y, i)));
				    
				    n = compteVoisinsPoses(i);
				    R.push(color( n == C[i].voisins.length ? "black" : "red", text(centre.x, centre.y, i)));
                }
                if(params.V3D !== false)
                    R.push(color(c, CSG.fromPolygons([B[i]])).translate(gT3D));//.rotateX(0));
            }else{
                R.push(polygon(pts));
            }
        }
    }
    return R;
}
function fakecentroid(P){
var centre, V, i, pt;

    centre = {x:0, y:0};
    V = P.vertices;
    np = V.length;
    for (i in V){
        pt = V[i].pos;
    	centre.x += pt.x;
	    centre.y += pt.y;
    }
    centre.x /= np;
    centre.y /= np;
    return centre;
}
function centroid(P){
var centre, V, sA, i, a, pt0, pt1;

    centre = {x:0, y:0};
    V = P.vertices;
    sA = 0;
    for (i in V){
        pt0 = V[i].pos;
        pt1 = V[(i + 1) % V.length].pos;
    	a = (pt0.x * pt1.y) - (pt1.x * pt0.y);
    	sA  += a;
    	centre.x += (pt0.x + pt1.x) * a;
	    centre.y += (pt0.y + pt1.y) * a;
    }
    sA *= 0.5;
    centre.x /= sA * 6; centre.y /= sA * 6;
    return centre;
}
function supprime_plats(A){ 
// Suppression des plats
    var tmp = [];
    var ok, x, y, z, i, j, p;
    for(i in A.polygons){
        p = A.polygons[i];
        y = p.vertices[0].pos.y;
        ok = false;
        for(j=1; j<p.vertices.length; j++){
            if(Math.abs(y - p.vertices[j].pos.y)>0.001){
                ok = true;
                break;
            }
        }
        if(ok){
            x = p.vertices[0].pos.x;
            ok = false;
            for(j=1; j<p.vertices.length; j++){
                if(Math.abs(x - p.vertices[j].pos.x)>0.001){
                    ok = true;
                    break;
                }
            }
            if(ok){
                z = p.vertices[0].pos.z;
                ok = false;
                for(j=1; j<p.vertices.length; j++){
                    if(Math.abs(z - p.vertices[j].pos.z)>0.001){
                        ok = true;
                        break;
                    }
                }
                if(ok)tmp.push(p);
            }
        }
    }
    return tmp;
}
function fixeId(na, nb, anti){ // pour inverser l'angle ajouter anti (true)
    tmp0 = C[na].piece;
	nProches = C[na].voisins;
    nProche = nProches[nb].id;
    if(anti)
        fixe(na, nProche, anti);
    else        
        fixe(na, nProche);
}
function fixe(na, nb, anti){
    tmp0 = C[na].piece;
	nProches = C[na].voisins;
	nProche = nb;
	
	D[D.length-1].push({p1:na, p2:nb});
	
	// rech de l'id
	ok = false;
	nb = 0;
	while((C[na].voisins[nb].id != nProche)
	&&(nb<C[na].voisins.length))
	    nb++;
	    
	if (!C[nProche].estPosee){
		tmp1 = C[nProche].piece;
		corr = nProches[nb].c;
		// rotation
		pt1  = tmp0.polygons[0].vertices[corr[0].p1].pos;
		pt2  = tmp0.polygons[0].vertices[corr[1].p1].pos;
		E.push({p1:pt1, p2:pt2});
		ok = false;
		for(a=-360; a<=360; a+=0.1){
			rot = tmp1.rotateZ(a);
			pt1p = rot.polygons[0].vertices[corr[0].p2].pos;
			pt2p = rot.polygons[0].vertices[corr[1].p2].pos;
			if((Math.abs((pt1p.x - pt1.x)- (pt2p.x - pt2.x)) <= vMin)
			&& (Math.abs((pt1p.y - pt1.y)- (pt2p.y - pt2.y)) <= vMin)){
				ok = true;
				break;
			}
		}

		if(ok){
			if(anti){
			  rot = tmp1.rotateZ(a-180);
			  pt2p = rot.polygons[0].vertices[corr[0].p2].pos;
			  pt1p = rot.polygons[0].vertices[corr[1].p2].pos;
			    
			}else{
			  rot = tmp1.rotateZ(a);
			  pt1p = rot.polygons[0].vertices[corr[0].p2].pos;
			  pt2p = rot.polygons[0].vertices[corr[1].p2].pos;
			}
			xc = pt1.x - pt1p.x;
			yc = pt1.y - pt1p.y;
			rot = rot.translate([xc, yc]);
		    C[nProche].piece = rot;
			C[nProche].estPosee = true;
			nC++;
			echo(nC  + ":"+ na + "~"+ nProche + "("+ listeVoisins(nProche) +")");
			//echo(nProche);
		} else {
			echo("Correspondance non trouvée!");
		}
	}
}
function diff(x,y){
    return Math.abs(x - y) <= vMin;
}
function decoupe(A){
	var b, B, planV, planH;
	
	b = A.getBounds();
	B = cube({size:[b[1].x-b[0].x, b[1].y-b[0].y, b[1].z-b[0].z]}).translate(b[0]);
    planV = CSG.Plane.fromPoints([0,-100,0],[0,100,0], [0,0,100]);
    planH = CSG.Plane.fromPoints([-100,0,0],[100,0,0],[0,0,-100]);
    B = B.cutByPlane(planH.translate([0,-10,0]));
    return A.intersect(B);
}
function text(x, y, ch){
var l, o, tmp, b, dx, dy;

l = vector_text(0 , 0, ch);   // l contains a list of polylines to be drawn
o = [];
l.forEach(function(pl) {                   // pl = polyline (not closed)
   o.push(rectangular_extrude(pl, {w: 2, h: 2}));   // extrude it to 3D
});
tmp = union(o).scale(0.075).rotateY(180);
b = tmp.getBounds();
dx = (b[1].x - b[0].x )/2; dy = (b[1].y - b[0].y )/2;
return tmp.translate([x + dx, y - dy]);
}
function vmain(){
     pts = [
         [0,0,0],[0,0,1],[0,1,0],[0,1,1]
        ,[1,0,0],[1,0,1],[1,1,0],[1,1,1]
         ];

    polys = [
        [0,2,3,1]
        ,[4,5,7,6]
        ,[0,1,5,4]
        ,[1,3,7,5]
        ,[3,2,6,7]
        ,[2,0,4,6]
        ];
    
    P = polyhedron({points:pts, polygons:polys});
    return P;
}