// app.js - Main app functions

var lyrLoaded = false;

var map;

var lyr;

var currentPanel = 'panelA';

var selectionSymbol;

var closetimer;

var medals;

var font;

// Load config XML file
dojo.addOnLoad(loadXML);

// INIT
function init(){
	
	
	esri.config.defaults.io.proxyUrl = config.proxyURL;
	
	font = new esri.symbol.Font("10px", esri.symbol.Font.STYLE_NORMAL, esri.symbol.Font.VARIANT_NORMAL, esri.symbol.Font.WEIGHT_NORMAL, "Arial");
	
	var mapDeferred = esri.arcgis.utils.createMap(config.webmap, "map", {
	      mapOptions: {
	        slider: false,
	        nav: false,
			logo: false
	      },
		  ignorePopups: true
	    });
		
    mapDeferred.addCallback(function(response) {
     
      map = response.map;
     
      //resize the map when the browser resizes
      dojo.connect(dijit.byId('map'), 'resize', map,map.resize);
	  
	  dojo.connect(map, "onUpdateEnd", layersUpdateEnd);
		
    });
	
    mapDeferred.addErrback(function(error) {
      console.log("Map creation failed: ", dojo.toJson(error));
    });
		
}


// TOGGLE PANEL
function togglePanel(newPanel) {
	
	if (newPanel != currentPanel) {
		var oldP = dojo.byId(currentPanel);
		var newP = dojo.byId(newPanel);
		
		var animOld = animatePanel(oldP, 1000, 300, 150, 'bounceOut');
		var animNew = animatePanel(newP, 1000, 150, 300, 'bounceOut');
		
		dojo.fx.combine([animOld,animNew]).play();
		currentPanel = newPanel;
		toggleMedal();
	}
	
}

// TOGGLE MEDAL
function toggleMedal() {
	switch (currentPanel) {
		case "panelA":
			grade = "A";
			break;
		case "panelB":
			grade = "B";
			break;
		case "panelC":
			grade = "C";
			break;
		case "panelD":
			break;
	}
	renderMedals();
}

// ANIMATE PANEL
function animatePanel(node, timeSpan, startWidth, endWidth, animationType){
	var animation = dojo.animateProperty({
        node: node,
        duration: timeSpan,
        easing: dojo.fx.easing[animationType],
        properties: {
            width: {
                end: endWidth,
                start: startWidth
            }
        }
    });
	return animation;
}

// LAYERS UPDATE END
function layersUpdateEnd() {
	if (lyrLoaded == false) {
		lyrLoaded = true;
		var gl = map.graphics;
		dojo.connect(gl, "onClick", lyrClick);
		map.setLevel(3);
		getMedals();
	}
}


// UPDATE COUNT
function updateMedalCount(tA, tB, tC, tD) {
	var a = dojo.byId("txtA");
	if (a != null)
		a.innerHTML = tA;
	var b = dojo.byId("txtB");
	if (b != null)
		b.innerHTML = tB;
	var c = dojo.byId("txtC");
	if (c != null)
		c.innerHTML = tC;
	var d = dojo.byId("txtD");
	if (d != null)
		d.innerHTML = tD;
}

// LYR CLICK
function lyrClick(event) {
	var gra = event.graphic;
	var url = gra.attributes.LINK;
	window.open(url);
}

// DO MAP ZOOM
function doMapZoom(value){
    var level = map.getLevel() + value;
    map.setLevel(level);
}


// GET MEDALS
function getMedals() {
	queryMedals();
}

// -- QUERY FUNCTIONS -- //

// QUERY ERROR HANDLER
function queryErrorHandler(error) {
	console.log(error.message);
}

// QUERY MEDALS
function queryMedals() {
	var queryTask = new esri.tasks.QueryTask("http://services.arcgis.com/diQdIhSzjZP7X9B2/arcgis/rest/services/worldgames2013/FeatureServer/0");
	var query = new esri.tasks.Query();
	query.where = "1=1";
	query.outFields = ["*"];
	query.returnGeometry = true;
	query.outSpatialReference = {wkid:102100};
	queryTask.execute(query, medalsResultsHandler, queryErrorHandler);
}

// MEDALS RESULTS HANDLER
function medalsResultsHandler(featureSet) {
	//features = featureSet.features.slice();
	medals = featureSet.features.slice();
	var tA = "";
	var tB = "";
	var tC = "";
	var tD = "";
	var i = 0;
	medals.sort(compareTotal);
	medals.reverse();
	for (i=0; i<3; i++) {
		var obj = medals[i].attributes;
		var name = obj.NOMECONT;
		var total = obj.total;
		tA += name + "<br><span class='txtNum'>" + total + "</span><br>";
	}
	medals.sort(compareGold);
	medals.reverse();
	for (i=0; i<3; i++) {
		var obj = medals[i].attributes;
		var name = obj.NOMECONT;
		var gold = obj.gold;
		tB += name + "<br><span class='txtNum'>" + gold + "</span><br>";
	}
	medals.sort(compareSilver);
	medals.reverse();
	for (i=0; i<3; i++) {
		var obj = medals[i].attributes;
		var name = obj.NOMECONT;
		var silver = obj.silver;
		tC += name + "<br><span class='txtNum'>" + silver + "</span><br>";
	}
	medals.sort(compareBronze);
	medals.reverse();
	for (i=0; i<3; i++) {
		var obj = medals[i].attributes;
		var name = obj.NOMECONT;
		var bronze = obj.bronze;
		tD += name + "<br><span class='txtNum'>" + bronze + "</span><br>";
	}
	updateMedalCount(tA, tB, tC, tD);
	renderMedals();
}


// RENDER MEDALS
function renderMedals() {
	console.log(currentPanel);
	map.graphics.clear();
	var color = "#886197";
	for (var i = 0; i < medals.length; i++) {
		var feature = medals[i];
		var obj = feature.attributes;
		var name = obj.country;
		var total = obj.total;
		var gold = obj.gold;
		var silver = obj.silver;
		var bronze = obj.bronze;
		var count = 0;
		
		switch (currentPanel) {
			case "panelA":
				color = "#886197";
				count = total;
				break;
			
			case "panelB":
				color = "#f2c202";
				count = gold;
				break;
				
			case "panelC":
				color = "#696969";
				count = silver;
				break;
			
			case "panelD":
				color = "#bb7028";
				count = bronze;
				break;
		}
		
		if (count > 0) {
			
			// GEOMETRY
			//var feature = getCountryFeature(name);
			
			if (feature) {
				var pt = feature.geometry;
				var link = feature.attributes.LINK;
				
				// SYMBOL
				var rgb = getColorRGB(color);
				var lSym = new esri.symbol.SimpleLineSymbol("solid", new dojo.Color([0,0,0,0]), 1);
				var mSym = new esri.symbol.SimpleMarkerSymbol(esri.symbol.SimpleMarkerSymbol.STYLE_CIRCLE, 20 + count*2, lSym, new dojo.Color([rgb[0],rgb[1],rgb[2],0.5]));
				var gra1 = new esri.Graphic(pt, mSym, {LINK: link});
				
				map.graphics.add(gra1);
				
				// SYMBOL BLACK
				var rgb = getColorRGB(color);
				var lSymB = new esri.symbol.SimpleLineSymbol("solid", new dojo.Color([0,0,0,0.5]), 1);
				var mSymB = new esri.symbol.SimpleMarkerSymbol(esri.symbol.SimpleMarkerSymbol.STYLE_CIRCLE, 20, lSymB, new dojo.Color([0,0,0,1]));
				var gra2 = new esri.Graphic(pt, mSymB, {LINK: link});
				map.graphics.add(gra2);
			
				// LABEL
				var symText = new esri.symbol.TextSymbol(count, font, "#ffffff");
				symText.setOffset(0, -4);
				var gra3 = new esri.Graphic(pt, symText, {LINK: link});
				map.graphics.add(gra3);
			}
			else
			{
				console.log(name);
			}
			
		}
		
	}
}

// GET COLOR RGB
function getColorRGB(color) {
	var symColor = dojo.colorFromString(color);
	return symColor.toRgb(); 
}

// -- SORT FUNCTIONS --

// COMPARE TOTAL
function compareTotal(a,b) {
  if (a.attributes.total < b.attributes.total)
     return -1;
  if (a.attributes.total > b.attributes.total)
    return 1;
  return 0;
}

// COMPARE GOLD
function compareGold(a,b) {
  if (a.attributes.gold < b.attributes.gold)
     return -1;
  if (a.attributes.gold > b.attributes.gold)
    return 1;
  return 0;
}

// COMPARE SILVER
function compareSilver(a,b) {
  if (a.attributes.silver < b.attributes.silver)
     return -1;
  if (a.attributes.silver > b.attributes.silver)
    return 1;
  return 0;
}

// COMPARE BRONZE
function compareBronze(a,b) {
  if (a.attributes.bronze < b.attributes.bronze)
     return -1;
  if (a.attributes.bronze > b.attributes.bronze)
    return 1;
  return 0;
}




