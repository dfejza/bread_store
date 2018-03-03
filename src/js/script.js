$(function () {

	// Globals variables
	var allProducts = [];

	// Bread opts options
	var opts = {
		buttonId: 'bread-checkout-btn',
		actAsLabel: false,
		asLowAs: true,
		items: [
		{
		  name:'Couch',
		  price:150000,
		  sku:'COUCH123',
		  imageUrl:'[REPLACEMEWITHAREALURL]',
		  detailUrl:'[REPLACEMEWITHAREALURL]', 
		  quantity: 1
		}]
	  };
	opts.calculateTax = function(shippingContact, callback) {
		$.ajax({
			url: '/tax',
			type: 'POST',
			contentType: 'application/json',
			data: JSON.stringify({
				shippingAddress: shippingContact,
				total: 150000
			})
		})
		.done(function(data){
			callback(null, data);
		})
		.fail(function(err){
			callback(err);
		});
	};
	opts.calculateShipping = function(shippingContact, callback) {
		$.ajax({
		  url: '/shipping',
		  type: 'POST',
		  contentType: 'application/json',
		  data: JSON.stringify({
			shippingAddress: shippingContact,
			total: 150000
		  })
		})
		.done(function(data){
		  callback(null, data);
		})
		.fail(function(err){
		  callback(err);
		});
	  };


	// Get data about our products from products.json.
	$.getJSON( "/assets/products.json", function( data ) {

		// Write the data into our global variable.
		allProducts = data;

		generateProductHTML(allProducts);

	});



	// Using Handlebar syntax generate the products based off the imported JSON file
	function generateProductHTML(data){

		// Get the dom element pointing to the list we will insert in
		var list = $('.products-list');

		// Get the script that handlebar will use
		var theTemplateScript = $("#products-template").html();

		// Generate the HTML syntax
		var theTemplate = Handlebars.compile(theTemplateScript);

		// Append it to the DOM
		list.append(theTemplate(data));		

		// Create an onclick for each item
		list.find('.checkout').on('click', function (e) {
			e.preventDefault();
			var productIndex = $(this).data('index');
			renderProductsPage(allProducts[productIndex]);
			// TODO modal
		})
	}

	// Change the info on the modal
	function renderProductsPage(data){
		
		var modal = $('.modal');
		modal.find('h3').text(data.name);
		modal.find('img').attr('src', data.src);
		modal.find('.modalDescription').text(data.description);
		modal.find('.modalPrice').text("Total Price: $" + data.price);

		modal.find('.calcShippingTax').on('click', function (e) {
			e.preventDefault();
			console.log("s");
			shippingAddress = {
				"fullName" : "",
				"address" : "335 Nevada Street",
				"zip" : "11757",
				"city" : "Lindenhurst",
				"state" : "NY",
				"email" : "asds@gmail.com"
			};
			opts.calculateTax(shippingAddress, function(data){
				console.log(data);
			});
			// TODO modal
		})

		// Configure Bread
		opts.items[0].price = data.price;
		
		bread.checkout(opts);
	}
});
