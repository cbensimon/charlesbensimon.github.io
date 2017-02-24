VOITURE_LONGUEUR		= 5
VOLANT_INITIAL		= -0.5 //0.7
VOLANT_FINAL			= 0.5 //0.7
VOLANT_TIME			= 0.7
ACCELERATEUR_FINAL	= 110 //130
ACCELERATEUR_TIME	= 0.5 //0.4
FREIN_FINAL			= 80
FREIN_TIME			= 0.4

STEPS				= 200
COEF_FROTEMENTS		= 7 //8
V_MA					= 0.01
V_NULL				= 0.04
RENDER_STEPS			= 3
ZOOM					= 20

KEY_DOWN				= 40;
KEY_UP				= 38;
KEY_LEFT				= 37;
KEY_RIGHT			= 39;

//Structures

function Commande (value, initialValue, finalValue, time, sens) {
	this.value = value;
	this.initialValue = initialValue;
	this.finalValue = finalValue;
	this.time = time;
	this.sens = sens;
}

function Commandes (volant, accelerateur, frein, vitesse){
	this.volant = volant;
	this.accelerateur = accelerateur;
	this.frein = frein;
	this.vitesse = vitesse;
}

function Voiture (ax, ay, fax, fay, vax, vay, bx, by, longueur, commandes) {
	this.ax = ax;
	this.ay = ay;
	this.fax = fax;
	this.fay = fay;
	this.vax = vax;
	this.vay = vay;
	this.bx = bx;
	this.by = by;
    this.longueur = longueur;
	this.commandes = commandes;
}

function Keyboard (up, down, left, right){
	this.up = up;
	this.down = down;
	this.left = left;
	this.right = right;
}

//Functions

function majKeyboardDown(e, keyboard, pressed)
{
	var keyEvent = e;
	if (!pressed[keyEvent.keyCode])
	{
		switch(keyEvent.keyCode)
		{
			case KEY_UP :
				keyboard.up = 1;
				break;
			case KEY_DOWN :
				keyboard.down = 1;
				break;
			case KEY_LEFT :
				keyboard.left = 1;
				break;
			case KEY_RIGHT :
				keyboard.right = 1;
				break;
		}
		pressed[keyEvent.keyCode] = 1;
	}
}
function majKeyboardUp(e, keyboard, pressed)
{
	var keyEvent = e;
	pressed[keyEvent.keyCode] = 0;
	switch(keyEvent.keyCode)
	{
		case KEY_UP :
			keyboard.up = 0;
			break;
		case KEY_DOWN :
			keyboard.down = 0;
			break;
		case KEY_LEFT :
			keyboard.left = 0;
			break;
		case KEY_RIGHT :
			keyboard.right = 0;
			break;
	}
}

function majCommandes (commandes, keyboard)
{
	var marcheAvant = (commandes.vitesse == 1)?1:0;
	if ((keyboard.up && marcheAvant) || (keyboard.down && !marcheAvant)) {
		modifCommande(commandes.accelerateur);
	} else {
		commandes.accelerateur.value = 0;
	}
	
	if ((keyboard.down && marcheAvant) || (keyboard.up && !marcheAvant)) {
		modifCommande(commandes.frein);
	} else {
		commandes.frein.value = 0;
	}
	
	if (keyboard.left)
	{
		commandes.volant.sens = 1;
		modifCommande(commandes.volant);
	}
	if (keyboard.right)
	{
		commandes.volant.sens = -1;
		modifCommande(commandes.volant);
	}
}

function modifCommande(commande)
{
	commande.value += commande.sens*(commande.finalValue - commande.initialValue)/(STEPS*commande.time);
	if (commande.finalValue >= commande.initialValue)
	{
		if (commande.value > commande.finalValue)
		{
			commande.value = commande.finalValue;
		}
		else if (commande.value < commande.initialValue)
		{
			commande.value = commande.initialValue;
		}
	}
	else
	{
		if (commande.value < commande.finalValue)
		{
			commande.value = commande.finalValue;
		}
		else if (commande.value > commande.initialValue)
		{
			commande.value = commande.initialValue;
		}
	}
}

function majVitesseVolant(voiture)
{
	//majDirection
	var norme;
	var alpha;
	var directionX, directionY;
	directionX = voiture.ax - voiture.bx;
	directionY = voiture.ay - voiture.by;
    if (directionY > 0)
    {
    	alpha = Math.atan(directionX/directionY);
    } else {
    	alpha = Math.atan(directionX/directionY) + Math.PI;
    }
    norme = Math.sqrt((voiture.vax)*(voiture.vax) + (voiture.vay)*(voiture.vay));
    voiture.vax = voiture.commandes.vitesse*norme*Math.sin(alpha + voiture.commandes.volant.value);
    voiture.vay = voiture.commandes.vitesse*norme*Math.cos(alpha + voiture.commandes.volant.value);
}

function majForce(voiture)
{
    var vitesse_ux, vitesse_uy;
    var voiture_ux, voiture_uy;
	var norme_va, norme_ba;
    
    if (voiture.vax==0 && voiture.vay==0)
    {
		norme_va = 0;
        vitesse_ux = 0;
        vitesse_uy = 0;
    }
    else
    {
		norme_va = Math.sqrt((voiture.vax)*(voiture.vax) + (voiture.vay)*(voiture.vay));
		if (norme_va < V_NULL)
		{
			norme_va = 0;
			vitesse_ux = 0;
			vitesse_uy = 0;
			voiture.vax = 0;
			voiture.vay = 0;
		}
		else
		{
			vitesse_ux = voiture.vax/norme_va;
			vitesse_uy = voiture.vay/norme_va;
		}
    }
    
	norme_ba = Math.sqrt((voiture.ax - voiture.bx)*(voiture.ax - voiture.bx) + (voiture.ay - voiture.by)*(voiture.ay - voiture.by));
    voiture_ux = (voiture.ax - voiture.bx)/norme_ba;
    voiture_uy = (voiture.ay - voiture.by)/norme_ba;
	
	//Acceleration
    voiture.fax = voiture_ux*(voiture.commandes.vitesse)*voiture.commandes.accelerateur.value;
    voiture.fay = voiture_uy*(voiture.commandes.vitesse)*voiture.commandes.accelerateur.value;
	
	//Freinage
	var coeffFrein = Math.pow(norme_va, 1/2);
    voiture.fax -= coeffFrein*vitesse_ux*(voiture.commandes.frein.value);
    voiture.fay -= coeffFrein*vitesse_uy*(voiture.commandes.frein.value);
	
	//Frottements
	coeffFrein = Math.pow(norme_va, 1/1);
	voiture.fax -= COEF_FROTEMENTS*coeffFrein*vitesse_ux;
    voiture.fay -= COEF_FROTEMENTS*coeffFrein*vitesse_uy;
	
}

function nextState(voiture, keyboard)
{
	CPU++;
	if (CPU%STEPS == 0)
	{
		console.log('Tic');
		CPU=0;
	}
    if ((voiture.vax)*(voiture.vax) + (voiture.vay)*(voiture.vay) < V_MA)
    {
        if (keyboard.down)
        {
        	voiture.commandes.vitesse = -1;
        	
        }
        if (keyboard.up)
        {
        	voiture.commandes.vitesse = 1;
        }
    }
	majCommandes(voiture.commandes, keyboard);
	
	majVitesseVolant(voiture);
	
	majForce(voiture);
	
	voiture.ax += (voiture.vax + (voiture.fax/STEPS)/2)/STEPS;
	voiture.ay += (voiture.vay + (voiture.fay/STEPS)/2)/STEPS;
    voiture.vax += voiture.fax/STEPS;
    voiture.vay += voiture.fay/STEPS;
    
    var voiture_ux, voiture_uy;
	var norme;
    
	norme = Math.sqrt((voiture.ax - voiture.bx)*(voiture.ax - voiture.bx) + (voiture.ay - voiture.by)*(voiture.ay - voiture.by));
    voiture_ux = (voiture.ax - voiture.bx)/norme;
    voiture_uy = (voiture.ay - voiture.by)/norme;
    
    voiture.bx = voiture.ax - voiture.longueur*voiture_ux;
    voiture.by = voiture.ay - voiture.longueur*voiture_uy;
}

function renderParking(voiture)
{	
	document.getElementById('avant').style.left = ZOOM*voiture.ax + 'px';
	document.getElementById('avant').style.top = ZOOM*voiture.ay + 'px';
	document.getElementById('arriere').style.left = ZOOM*voiture.bx + 'px';
	document.getElementById('arriere').style.top = ZOOM*voiture.by + 'px';
	var carX, carY;
	carX = 0.48*ZOOM*voiture.ax + 0.52*ZOOM*voiture.bx -88;
	carY = 0.48*ZOOM*voiture.ay + 0.52*ZOOM*voiture.by -85+45;
	var alpha;
	var directionX, directionY;
	directionX = voiture.ax - voiture.bx;
	directionY = voiture.ay - voiture.by;
    if (directionY > 0)
    {
    	alpha = Math.atan(directionX/directionY);
    } else {
    	alpha = Math.atan(directionX/directionY) + Math.PI;
    }
	document.getElementById('car').style.transform = 'translate(' + (carX) + 'px, ' + (carY) + 'px) rotate(' + (-1)*(alpha*180/Math.PI + 90) + 'deg)';
	document.getElementById('roues').style.transform = 'translate(' + (carX) + 'px, ' + (carY) + 'px) rotate(' + (-1)*(alpha*180/Math.PI + 90) + 'deg)';
	document.getElementById('RG').style.transform = 'rotate(' + (- voiture.commandes.volant.value*180/Math.PI + 90) + 'deg)';
	document.getElementById('RD').style.transform = 'rotate(' + (- voiture.commandes.volant.value*180/Math.PI + 90) + 'deg)';
}
var pressed = new Array;
var i;

for (i=0;i<128;i++)
{
	pressed[i] = 0;
}

var CPU	=0;

var volant			= new Commande(0,	VOLANT_INITIAL,	VOLANT_FINAL,		VOLANT_TIME,			1);
var accelerateur		= new Commande(0,	0,				ACCELERATEUR_FINAL,	ACCELERATEUR_TIME,	1);
var frein			= new Commande(0,	0,				FREIN_FINAL,			FREIN_TIME,			1);

var commandes		= new Commandes(volant, accelerateur, frein, 1);
var voiture			= new Voiture(10, 10, 0, 0, 0, 0, 10, 10+ZOOM*VOITURE_LONGUEUR, VOITURE_LONGUEUR, commandes);
var keyboard			= new Keyboard(0, 0, 0, 0);


var timerPhysics		= setInterval(function(){nextState(voiture, keyboard)},	1000/STEPS);
var timerGraphics	= setInterval(function(){renderParking(voiture)},		20);

document.addEventListener('keydown', function(e){majKeyboardDown(e, keyboard, pressed);}, false);
document.addEventListener('keyup', function(e){majKeyboardUp(e, keyboard, pressed);}, false);
