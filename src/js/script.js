$(function () {

	// Globals variables
	var allProducts = [];

	// Bread opts options
	var opts = {
		buttonId: 'bread-checkout-btn',
		actAsLabel: false,
		asLowAs: true,
		shippingContact: {},
		tax: 0,
		customTotal: 0,
		customCSS: "/* Include custom fonts with @import */ @import url(\"https://fonts.googleapis.com/css?family=Roboto:400,700\"); html, body, #bread-button { height: 100%; margin: 0; width: 100%; } body { display: table; } #bread-button { /* Base button styles */ background: #197797; color: red; border-radius: 6px; display: table-cell; font-family: \"Roboto\", sans-serif; font-size: 16px; text-align: center; vertical-align: middle; /* Modify or remove transition here */ transition: all 0.3s ease; } .bread-btn { cursor: pointer; } #bread-button.bread-btn:hover { /* Button hover state */ background: #209cc5; } .bread-embed-inner, .bread-label .bread-embed-icon { display: inline-block; } .bread-label .bread-embed-icon:after { /* Icon that shows the bread tooltip on hover */ background: rgba(255, 255, 255, 0.5); border-radius: 50px; color: #333; content: \"i\"; cursor: pointer; display: inline-block; line-height: 1; margin-left: 8px; padding: 4px 9px; } .bread-pot:before { /* Content for the default state. */ content: \"Pay Over Time\"; } .bread-btn .bread-as-low-as:before, .bread-label .bread-as-low-as:before { /* Prefix for buttons with asLowAs set to true */ content: \"As low as \"; } .bread-for:before { /* Prefix for logged in users */ content: \"For \"; }",
		items: [
		{
		  name:'Couch',
		  price:15000,
		  sku:'COUCH123',
		  imageUrl:'[REPLACEMEWITHAREALURL]',
		  detailUrl:'[REPLACEMEWITHAREALURL]', 
		  quantity: 1
		}]
	};
		
	// Let this simulate a backend call, where the shipping is checked
	opts.calculateShipping = function(shippingModel) {
		return new Promise((resolve, reject) => {
			let shippingPrice = 0;
			if(shippingModel == 1){
				shippingPrice = 0;
			}else if(shippingModel == 2){
				shippingPrice = 700;
			} else{
				shippingPrice = 2000;
			}
			resolve(shippingPrice);
		});
	};

	// We should check this on the backend since can be modified on the front
	// state - current state
	// shippingCost - the shipping price
	// itemPrice - the price of the actual item
	opts.calculateTax = function(state, shippingCost, itemPrice) {
		return new Promise((resolve, reject) => {
			let taxPrice = itemPrice + shippingCost;
			if(state !== "NY"){
				taxPrice = itemPrice + shippingCost;
				opts.tax = 0;
			}else{
				taxPrice = (itemPrice + shippingCost) * 1.05;
				opts.tax = (itemPrice + shippingCost) * 0.05 ;
			} 
			opts.customTotal = taxPrice;
			resolve(taxPrice);
		});
	};

	// Callback when done
	opts.done = function(err, tx_token) {
		if (err) {
			console.error("There was an error: " + err);
			return;
		}
		if (tx_token !== undefined) {
			console.write(tx_token);
			alertDialogue("Order completed!",tx_token);
		}
		return;
	};

	opts.onCustomerClose = function(err, custData) {
		if (err !== null) {
			console.error("An error occurred getting customer close data.");
			return;
		}
		var customerEmail = custData.email;
		var qualState     = custData.state;
		switch (qualState) {
			case 'PREQUALIFIED':
				alertDialogue("Congratulations",customerEmail + " was prequalified for financing.");
			break;
			case 'PARTIALLY_PREQUALIFIED':
				alertDialogue("Wait!",customerEmail + " was partially prequalified for financing.");
			break;
			case 'NOT_PREQUALIFIED':
				alertDialogue("Sorry",customerEmail + " was not prequalified for financing.");
			break;
			case 'ABANDONED':
				if (customerEmail === undefined || customerEmail === null) {
					console.log("Unknown customer abandoned their prequalification attempt.");
				} else {
					console.log(customerEmail + " abandoned their prequalification attempt.");
				}
				break;
			}
		}
		 


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
		var modal = $('#modalPurchase');

		// Lets store the shipping details in the opts, autofilling the finance option????
		opts.shippingContact = {
			"fullName" : modal.find("#firstNameInput").val() +" " + modal.find("#lastNameInput").val() ,
			"address" : modal.find("#inputAddress").val(),
			"zip" : modal.find("#inputZip").val(),
			"city" : modal.find("#inputCity").val(),
			"state" : modal.find("#inputState").val(),
			"email" : ""
		};

		// Update the item in opts
		opts.items[0].name = data.name;
		opts.items[0].price = data.price;
		opts.items[0].sku = data.name;


		// Update the text
		modal.find('h3').text(data.name);
		modal.find('img').attr('src', data.src);
		modal.find('.modalDescription').text(data.description);

		// Show the price
		updateModalPrice(data);

		// Create a listener for the update price button
		modal.find('.calcShippingTax').on('click', function (e) {
			e.preventDefault();

			// Change the price based off the user input
			updateModalPrice(data);
		})

	}

	// Called when a user clicks on a specific item to view.
	// The modal's template will be updated with the specific data
	function updateModalPrice(data){
		var modal = $('#modalPurchase');
		// Get the selected radio button specifying the shipping type
		var shippingModel = 1;
		if(modal.find("#exampleRadios1").is(':checked')){
			shippingModel = 1;
		} else if(modal.find("#exampleRadios2").is(':checked')){
			shippingModel = 2;
		} else {
			shippingModel = 3;
		}

		// Using promises to simulate an actual ajax/callback situation
		opts.calculateShipping(shippingModel).then( shippingCost =>{
			// Going to assume shipping is taxed
			var state = modal.find("#inputState").val();
			// Calculate total costs
			opts.calculateTax(state, shippingCost, data.price).then( totalCost =>{
				opts.items[0].price = totalCost;

				// Update the prices on checkout and breadcheckout
				modal.find('.checkOutButton').text("Total Price: $" + Number(totalCost/100).toFixed(2));
				
				bread.checkout(opts);
			});
		});
	}

	// Create a dialogue prompting the user on the status of his checkout
	function alertDialogue(header, text){
		var modal = $('#newDialogue');
		modal.find('#newDialogueTitle').text(header);
		modal.find('#newDialogueText').text(text);
		// Hide the old modal
		$('#modalPurchase').modal('hide');
		modal.modal('show');
	}

	// Popover
	$(function () {
		$('[data-toggle="popover"]').popover()
	})

});
