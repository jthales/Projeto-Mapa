// Inicializa Mapa
var map;

var infoWindow = new google.maps.InfoWindow({
  content: '<div><h4 id="brewery-name"></h4><p id="brewery-address"></p><p id="yelp"></p></div>'
});

var ViewModel = function() {
  'use strict';

  var self = this;
  self.breweryList = ko.observableArray([]);
  self.filteredBreweryList = ko.observableArray([]);

  // Inicio onde com zoom
  self.initialize = function() {
    var mapCanvas = document.getElementById('google-map');
    var cenLatLng = new google.maps.LatLng(-23.5308, -47.1355);
    var mapOptions = {
      center: cenLatLng,
      zoom: 15,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    map = new google.maps.Map(mapCanvas, mapOptions);
  };

  self.buildBreweryLocations = function() {
    breweryLocations.forEach(function(brewItem) {
      self.breweryList.push( new Brewery(brewItem) );
    });
  };

  self.setBreweryClickFunctions = function() {
    self.breweryList().forEach(function(brewery) {
      google.maps.event.addListener(brewery.marker(), 'click', function() {
        self.breweryClick(brewery);
      });
    });
  };

  self.breweryClick = function(brewery) {
    // Infos
    var infoContent = '<div><h4 id="brewery-name">' + brewery.name() + '</h4>' +
                      '<h5 id="brewery-address">' + brewery.address() + '</h5>' +
                      '<h6 id="brewery-neighborhood">' + brewery.neighborhood() + '</h6>' +
                      '<p id="text">Rating on <a id="yelp-url">yelp</a>: ' +
                      '<img id="yelp"></p></div>';
    infoWindow.setContent(infoContent);
    self.getYelpData(brewery);

    // Centraliza Clique
    map.panTo(new google.maps.LatLng(brewery.lat(), brewery.lng()));

    infoWindow.open(map, brewery.marker());

    self.setMarkerAnimation(brewery);
  };

  // Bounce
  self.setMarkerAnimation = function(brewery) {
    brewery.marker().setAnimation(google.maps.Animation.BOUNCE);
    setTimeout( function() { brewery.marker().setAnimation(null); }, 750);
  };

  // Filtros
  self.filterBreweries = function() {
    self.filteredBreweryList([]);

    var searchString = $('#search-str').val().toLowerCase();
    var len = self.breweryList().length;

    for (var i = 0; i < len; i++) {
      var breweryName = self.breweryList()[i].name().toLowerCase();
      var breweryNeighborhood = self.breweryList()[i].neighborhood().toLowerCase();

      if (breweryName.indexOf(searchString) > -1 ||
          breweryNeighborhood.indexOf(searchString) > -1) {
        self.filteredBreweryList.push(self.breweryList()[i]);
        self.breweryList()[i].marker().setMap(map);
      } else {
        self.breweryList()[i].marker().setMap(null);
      }
    }
  };

  self.getYelpData = function(brewery) {

    var httpMethod = 'GET';

    // Yelp API
    var yelpURL = 'http://api.yelp.com/v2/search/';

    // Nonce GEN

    var nonce = function(length) {
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        for(var i = 0; i < length; i++) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        return text;
    };

    var parameters = {
      oauth_consumer_key: 'S46AQ1iwQtvxw_D1wQLHZA',
      oauth_token: 'TO9rPx1abdPe3lllR5Wo3WFrvz8CV9vw',
      oauth_nonce: nonce(20),
      oauth_timestamp: Math.floor(Date.now() / 1000),
      oauth_signature_method: 'HMAC-SHA1',
      oauth_version: '1.0',
      callback: 'cb',
      term: brewery.name(),
      location: 'São Roque, SP',
      limit: 1
    };

    // API's Parametros
    var consumerSecret = '8hqIHpplfRBLzs6YOqLZFfkx7jg';
    var tokenSecret = 'evb3bjTox8RNlfZ5Ma74hqJjZWo';
    var signature = oauthSignature.generate(httpMethod, yelpURL, parameters, consumerSecret, tokenSecret);

    parameters.oauth_signature = signature;

    // Sets do AJAX
    var ajaxSettings = {
      url: yelpURL,
      data: parameters,
      cache: true,
      dataType: 'jsonp',
      success: function(response) {
        $('#yelp').attr("src", response.businesses[0].rating_img_url);
        $('#yelp-url').attr("href", response.businesses[0].url);
      },
      error: function() {
        $('#text').html('Data could not be retrieved from yelp.');
      }
    };

    $.ajax(ajaxSettings);
  };

  google.maps.event.addDomListener(window, 'load', function() {
    self.initialize();
    self.buildBreweryLocations();
    self.setBreweryClickFunctions();
    self.filteredBreweryList(self.breweryList());
  });
};

var Brewery = function(data) {
  'use strict';

  var marker;
  this.name = ko.observable(data.name);
  this.lat = ko.observable(data.lat);
  this.lng = ko.observable(data.lng);
  this.address = ko.observable(data.address);
  this.neighborhood = ko.observable(data.neighborhood);

  // Marcador
  marker = new google.maps.Marker({
    position: new google.maps.LatLng(this.lat(), this.lng()),
    map: map,
    title: this.name()
  });

  this.marker = ko.observable(marker);
};

ko.applyBindings( new ViewModel() );
