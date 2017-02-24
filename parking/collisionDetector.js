function pVect(ab, cd) {

	return ab[0]*cd[1] - ab[1]*cd[0];
}

function areCrossSegments(a, b, ap, bp) {

	var ab = [b[0]-a[0],b[1]-a[1]];
	var apbp = [bp[0]-ap[0],bp[1]-ap[1]];
	var abp = [bp[0]-a[0],bp[1]-a[1]];
	var aap = [ap[0]-a[0],ap[1]-a[1]];
	var apb = [b[0]-ap[0],b[1]-ap[1]];
	var apa = [a[0]-ap[0],a[1]-ap[1]];
	
	if (pVect(ab, apbp) == 0) return false;
	if ((pVect(ab, abp)*pVect(ab,aap)) <= 0)
	{
		if ((pVect(apbp,apb)*pVect(apbp,apa)) <= 0)
		{
			return true;
		}
	}
	return false;
}

function Feuille(x, y, value) {

	this.x = x;
	this.y = y;
	this.value = value;
}

function TreePosition(x, y, rad, width, height) {
	
	this.x = x;
	this.y = y;
	this.rad = rad;
	this.width = width;
	this.height = height;
}

function Noeud(topLeft, topRight, bottomLeft, bottomRight, xLeft, xRight, yTop, yBottom, feuille, position, id) {

	this.topLeft = topLeft;
	this.topRight = topRight;
	this.bottomLeft = bottomLeft;
	this.bottomRight = bottomRight;
	this.xLeft = xLeft;
	this.xRight = xRight;
	this.yTop = yTop;
	this.yBottom = yBottom;
	this.feuille = feuille;
	this.position = position;
	this.id = id;
	
	this.ajouterFeuille = function(feuille) {
		
		if (this.feuille != null)
		{
			var feuilleSauv = this.feuille;
			this.feuille = null;
			this.ajouterFeuille(feuilleSauv);
			this.ajouterFeuille(feuille);
		}
		else
		{
	
			var xMiddle = Math.round((this.xLeft + this.xRight)/2);
			var yMiddle = Math.round((this.yTop + this.yBottom)/2);
			
			if (feuille.x < xMiddle)
			{
				if (feuille.y < yMiddle)
				{
					if (this.topLeft == null)
					{
						this.topLeft = new Noeud(null, null, null, null, this.xLeft, xMiddle, this.yTop, yMiddle, feuille, this.position, this.id);
					}
					else
					{
						this.topLeft.ajouterFeuille(feuille);
					}
				}
				else
				{
					if (this.bottomLeft == null)
					{
						this.bottomLeft = new Noeud(null, null, null, null, this.xLeft, xMiddle, yMiddle, this.yBottom, feuille, this.position, this.id);
					}
					else
					{
						this.bottomLeft.ajouterFeuille(feuille);
					}
				}
			}
			else
			{
				if (feuille.y < yMiddle)
				{
					if (this.topRight == null)
					{
						this.topRight = new Noeud(null, null, null, null, xMiddle, this.xRight, this.yTop, yMiddle, feuille, this.position, this.id);
					}
					else
					{
						this.topRight.ajouterFeuille(feuille);
					}
				}
				else
				{
					if (this.bottomRight == null)
					{
						this.bottomRight = new Noeud(null, null, null, null, xMiddle, this.xRight, yMiddle, this.yBottom, feuille, this.position, this.id);
					}
					else
					{
						this.bottomRight.ajouterFeuille(feuille);
					}
				}
			}
		}
	};
	
	this.getChilds = function() {
	
		var fils = new Array();
		if (this.topLeft != null)		fils.push(this.topLeft);
		if (this.topRight != null)		fils.push(this.topRight);
		if (this.bottomLeft != null)	fils.push(this.bottomLeft);
		if (this.bottomRight != null)	fils.push(this.bottomRight);
		
		return fils;
	};
	
	this.compress = function() {
	
		if (this.feuille != null)
		{
			return;
		}
		var fils = this.getChilds();
		if (fils.length > 0)
		{
			for (var i=0 ; i<fils.length ; i++)
				fils[i].compress();
					
			var compressible = true;
			for (var i=0 ; i<fils.length ; i++)
				if (fils[i].feuille == null)
					compressible = false;
			if (compressible)
			{
				var color = fils[0].feuille.value;
				for (var j = 1 ; j < fils.length ; j++)
					if (fils[j].feuille.value != color)
						compressible = false;
				if (compressible)
				{
					this.topLeft = null;
					this.topRight = null;
					this.bottomLeft = null;
					this.bottomRight = null;
					this.feuille = new Feuille(-1, -1, color);
				}
			}
		}
	};
	
	this.compterFeuilles = function() {
	
		if (this.feuille != null)
		{
			return 1;
		}
		else
		{
			var fils = this.getChilds();
			var nbFeuilles = 0;
			for (var i=0 ; i<fils.length ; i++)
			{
				nbFeuilles += fils[i].compterFeuilles();
			}
			return nbFeuilles;
		}
	};
	
	this.getTransformedPoints = function() {
		
		var costheta = Math.cos(this.position.rad);
		var sintheta = Math.sin(this.position.rad);
		
		var xLeftCenter = this.xLeft - (this.position.width/2);
		var xRightCenter = this.xRight - (this.position.width/2);
		var yTopCenter = this.yTop - (this.position.height/2);
		var yBottomCenter = this.yBottom - (this.position.height/2);
		
		var topLeftTrans = [costheta*xLeftCenter - sintheta*yTopCenter + this.position.x + (this.position.width/2), sintheta*xLeftCenter + costheta*yTopCenter + this.position.y + (this.position.height/2)];
		var topRightTrans = [costheta*xRightCenter - sintheta*yTopCenter + this.position.x + (this.position.width/2), sintheta*xRightCenter + costheta*yTopCenter + this.position.y + (this.position.height/2)];
		var bottomLeftTrans = [costheta*xLeftCenter - sintheta*yBottomCenter + this.position.x + (this.position.width/2), sintheta*xLeftCenter + costheta*yBottomCenter + this.position.y + (this.position.height/2)];
		var bottomRightTrans = [costheta*xRightCenter - sintheta*yBottomCenter + this.position.x + (this.position.width/2), sintheta*xRightCenter + costheta*yBottomCenter + this.position.y + (this.position.height/2)];
		
		return [topLeftTrans, bottomLeftTrans, bottomRightTrans, topRightTrans];
	};
	
	this.isInContactWith = function(noeud) {
		
		var pointsThis = this.getTransformedPoints();
		var pointsNoeud = noeud.getTransformedPoints();
		
		var leftVect = [pointsThis[1][0] - pointsThis[0][0], pointsThis[1][1] - pointsThis[0][1]];
		var bottomVect = [pointsThis[2][0] - pointsThis[1][0], pointsThis[2][1] - pointsThis[1][1]];
		var rightVect = [pointsThis[3][0] - pointsThis[2][0], pointsThis[3][1] - pointsThis[2][1]];
		var topVect = [pointsThis[0][0] - pointsThis[3][0], pointsThis[0][1] - pointsThis[3][1]];
		var thisVect = [leftVect, bottomVect, rightVect, topVect];
		
		var leftVectNoeud = [pointsNoeud[1][0] - pointsNoeud[0][0], pointsNoeud[1][1] - pointsNoeud[0][1]];
		var bottomVectNoeud = [pointsNoeud[2][0] - pointsNoeud[1][0], pointsNoeud[2][1] - pointsNoeud[1][1]];
		var rightVectNoeud = [pointsNoeud[3][0] - pointsNoeud[2][0], pointsNoeud[3][1] - pointsNoeud[2][1]];
		var topVectNoeud = [pointsNoeud[0][0] - pointsNoeud[3][0], pointsNoeud[0][1] - pointsNoeud[3][1]];
		var noeudVect = [leftVectNoeud, bottomVectNoeud, rightVectNoeud, topVectNoeud];
		
		var pointVect;
		var isIn;
		
		for (var i=0 ; i<4 ; i++)
		{
			isIn = true;
			for (var j=0; j<4; j++)
			{
				pointVect = [pointsNoeud[i][0] - pointsThis[j][0], pointsNoeud[i][1] - pointsThis[j][1]];
				if ((thisVect[j][0]*pointVect[1] - thisVect[j][1]*pointVect[0]) > 0)
				{
					isIn = false;
					break;
				}
			}
			if (isIn) return true;
		}
		for (var i=0 ; i<4 ; i++)
		{
			isIn = true;
			for (var j=0; j<4; j++)
			{
				pointVect = [pointsThis[i][0] - pointsNoeud[j][0], pointsThis[i][1] - pointsNoeud[j][1]];
				if ((noeudVect[j][0]*pointVect[1] - noeudVect[j][1]*pointVect[0]) > 0)
				{
					isIn = false;
					break;
				}
			}
			if (isIn) return true;
		}
		
		for (var i=0 ; i<4 ; i++)
			for (var j=0 ; j<4 ; j++)
				if (areCrossSegments(pointsThis[i], pointsThis[(i+1)%4], pointsNoeud[j], pointsNoeud[(j+1)%4]))
					return true;
		return false;
	};
	
	this.isCollisionWithNode = function(noeud) {
	
		if (this.feuille != null && this.feuille.value == 0)
			return false;
		if (noeud.feuille != null && noeud.feuille.value == 0)
			return false;
		if (!(this.isInContactWith(noeud)))
			return false;
		if (this.feuille != null && noeud.feuille != null)
			return true;
			
		var collision;
		var filsNoeud, filsThis;
		if (this.feuille == null & noeud.feuille == null)
		{
			filsThis = this.getChilds();
			filsNoeud = noeud.getChilds();
			collision = false;
			for (var i=0 ; i<filsThis.length ; i++)
				for (var j=0 ; j<filsNoeud.length ; j++)
					if (filsThis[i].isCollisionWithNode(filsNoeud[j]))
						collision = true;
			return collision;
		}
		if (this.feuille == null)
		{
			filsThis = this.getChilds();
			collision = false;
			for (var i=0 ; i<filsThis.length ; i++)
				if (noeud.isCollisionWithNode(filsThis[i]))
					collision = true;
			return collision;
		}
		filsNoeud = noeud.getChilds();
		collision = false;
		for (var i=0 ; i<filsNoeud.length ; i++)
			if (this.isCollisionWithNode(filsNoeud[i]))
				collision = true;
		return collision;
	};
}
var cptId = 0;

function CollisionDetector(image) {

	if (!(image.complete))
	{
		window.alert('Image non encore chargee');
		return;
	}

	this.canvas = document.createElement('canvas');
	this.canvas.width = image.width;
	this.canvas.height = image.height;
	
	this.ctx = this.canvas.getContext('2d');
	this.ctx.drawImage(image, 0, 0);
	
	this.pixels = this.ctx.getImageData(0, 0, image.width, image.height);
	
	this.position = new TreePosition(0, 0, 0, image.width, image.height);
	
	this.tree = new Noeud(null, null, null, null, 0, image.width-1 , 0, image.height-1, null, this.position, cptId);
	cptId++;
	
	for (var i=0 ; i<image.width*image.height*4 ; i += 4)
	{
		this.tree.ajouterFeuille(new Feuille((i/4)%image.width, Math.floor((i/4)/image.width), (this.pixels.data[i+3] <= 128)?0:1));
	}
	
	this.tree.compress();
	console.log('Arbre Construit ' + this.tree.compterFeuilles() + ' feuilles');
	
	this.setPosition = function(x, y, rad) {
	
		this.position.x = parseFloat(x);
		this.position.y = parseFloat(y);
		this.position.rad = parseFloat(rad);
	};
	
	this.isCollisionWith = function(cDetector) {
	
		return this.tree.isCollisionWithNode(cDetector.tree);
	};
}
	
	
	

