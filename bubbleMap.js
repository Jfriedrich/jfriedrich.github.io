// This script is to add bubble layer and tooltip layer to the geomap
function Bubble(data, options) {
  this.data = data;

  if (options)
	  this.options = options
  else
    this.options = {
			radiusMin:20000,  // bubble size
      radiusMed:70000,
      radiusMax:80000,
			text:{
				visible:false,
				minimumZoom:13,
				maximumZoom:15
			},
			bubble:{
        fill:{opacity:0.9},
				stroke:{weight:1, opacity:0.2}
			}
    };

  // this.totalSize = this.getTotalSize(this.data);
  this.minSize = this.getMinMaxSize(this.data).minSize;
  this.maxSize = this.getMinMaxSize(this.data).maxSize;
  this.threshold = 1500;
  this.stepSize = {
      sm:(this.options.radiusMed-this.options.radiusMin)/(this.threshold-this.minSize),
      lg:(this.options.radiusMax-this.options.radiusMed)/(this.maxSize-this.threshold)
  };
}

Bubble.prototype = new google.maps.OverlayView;

Bubble.prototype.colorPalette = function(){
  var colors = {
    Coal:"#17202A",
    Oil:"#784212",
    Gas:"#EC7063",
    Nuclear:"#A93226",
    Waste:"#B7950B",
    Biomass:"#186A3B",
    Hydro:"#1F618D",
    Geothermal:"#76D7C4",
    Wind:"#5DADE2",
    Solar:"#E67E22",
    Other:"#ABB2B9"
  }
  return colors
}

Bubble.prototype.onAdd = function() {
	for (var row = 0; row < this.data.getNumberOfRows(); row++)
		this.drawBubble(this.data, this.options, row);
}

// Draw bubble if visible is true
Bubble.prototype.draw = function() {
	if (this.options.text.visible)
		for (var row = 0; row < this.data.getNumberOfRows(); row++)
			this.drawText(this.data, this.options, row);
}

Bubble.prototype.getMinMaxSize = function(data) {
    var minSize = 99999999;
    var maxSize = 0;
    for (var row = 0; row < data.getNumberOfRows(); row++) {
        if (data.getValue(row, 2) < minSize) {minSize = data.getValue(row, 2)};
        if (data.getValue(row, 2) > maxSize) {maxSize = data.getValue(row, 2)};
    }
    return {minSize: minSize, maxSize: maxSize};
}

Bubble.prototype.drawBubble = function(data, options, row) {
    var sizeOfLocation = data.getValue(row, 2);
    if (sizeOfLocation <= this.threshold) {
        var stepAdded = (sizeOfLocation - this.minSize) * this.stepSize.sm;
        var radiusForLocation = stepAdded + options.radiusMin;
      } else {
        var stepAdded = (sizeOfLocation - this.threshold) * this.stepSize.lg;
        var radiusForLocation = stepAdded + options.radiusMed;
      }
    var color = this.colorPalette()[data.getValue(row,1)];
    var marker = new google.maps.Circle({
        center: new google.maps.LatLng(data.getValue(row, 3), data.getValue(row, 4)),
        fillColor: color,
        fillOpacity:options.bubble.fill.opacity,
        strokeColour: color,
        strokeWeight:options.bubble.stroke.weight,
        strokeOpacity:options.bubble.stroke.opacity,
        radius:radiusForLocation
    });

    marker.setMap(this.getMap()); // Place circle markers on the map

    // Add on-click event listener so the bubbles are clickable
    var contentString = '<div id="content"><b>Plant Name:</b> '
                      + data.getValue(row, 0)
                      + ' <b><p>Fuel:</b> '
                      + data.getValue(row, 1)
                      + ' <b><p>Capacity:</b> '
                      + data.getValue(row, 2) + '&nbsp;MW'
                      + ' <b><p>Latitude:</b> '
                      + data.getValue(row, 3)
                      + ' <b><p>Longitude:</b> '
                      + data.getValue(row, 4)
                      + ' </div>';

    var infowindow = new google.maps.InfoWindow({
    		content: contentString,
    		position: new google.maps.LatLng(data.getValue(row, 3), data.getValue(row, 4))
    });

    marker.addListener('click', function(){
      if(onlyInfoWindow != null){
      	onlyInfoWindow.close();}
      infowindow.open(this.getMap(), marker);
      onlyInfoWindow = infowindow;
    });
}

Bubble.prototype.drawText = function(data, options, row) {
	var itemId = "_map_text_" + row;
	var textContainer = document.getElementById(itemId);
	if (this.map.getZoom() < options.text.minimumZoom) {
		if (textContainer)  {
			var parent = textContainer.parentNode;
			parent.removeChild(textContainer);
		}
		return;
	}

	if (!textContainer) {
		var textItem = document.createElement('span');
		textItem.className = 'label';
		textItem.innerHTML = data.getValue(row, 0) + ' (' + data.getValue(row, 2) + ')';

		textContainer = document.createElement('div');
		textContainer.id = itemId;
		textContainer.appendChild(textItem);
		textContainer.style.cssText = 'position: absolute;';

		var panes = this.getPanes();
		panes.overlayLayer.appendChild(textContainer);
	}

	var projection = this.getProjection();
  var position = projection.fromLatLngToDivPixel(new google.maps.LatLng(data.getValue(row, 3), data.getValue(row, 4)));

  textContainer.style.left = position.x+ 'px';
  textContainer.style.top = position.y + 'px';
}
