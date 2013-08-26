//config.js - Javascript functions to read config.xml file

var config = {};

// LOAD CONFIG XML
function loadXML() {

  // CONFIG FILENAME
  var configFilename = "config.xml";

  // SET FULL URL PATH TO CONFIG FILE
  var urlObject = esri.urlToObject(document.location.href);
  var lastSlash = urlObject.path.lastIndexOf('/') + 1;
  var configUrl = esri.urlToObject(urlObject.path.substr(0, lastSlash) + configFilename);

  // LOAD CONFIG.XML
  var parseXMLDeferred = esri.request({
    url: configUrl.path,
    content: configUrl.query,
    handleAs: "xml"
  }, {
    useProxy: false
  });
  parseXMLDeferred.then(function(response) {

    // CONFIG NODE
    var configNode = dojo.query("config", response)[0];

	//webmap
	var webmapNode = findChildNode("webmap", configNode);
	config.webmap = getDomNodeText(webmapNode);
	
	//lyr
	var lyrNode = findChildNode("lyr", configNode);
	config.lyr = getDomNodeText(lyrNode);
			
	//proxyURL
	var proxyURLNode = findChildNode("proxyURL", configNode);
    config.proxyURL = getDomNodeText(proxyURLNode);
	   	
    // INITIALIZE APP
    init();
	
	// GET MEDALS
	//getMedals();

  }, function(error) {
    console.warn(error);
  });
}

// FIND CHILD NODES
function findChildNode(childNodeName, parentDomNode) {
  var childNodes = dojo.query(childNodeName, parentDomNode);
  if(childNodes.length > 0) {
    return childNodes[0];
  } else {
    return null;
  }
}

// GET DOM NODE TEXT
function getDomNodeText(domNode) {
//  if(domNode.textContent) {
//    return dojo.trim(domNode.textContent);
//  } else if(domNode.text) {
//    return dojo.trim(domNode.text);
//  } else {
//    return null;
//  }
  return (domNode.firstChild.data);
}

// GET COLOR 
function getColor(colorNode){
	var color = getDomNodeText(colorNode);
	return color || "000000";
}

