var CRskipUpdateFormAction = true;
document.addEventListener('crPickupActivated', function (e) {
	jqCR('#store-search').prepend('<input type="text" name="pickup-store-search" id="pickup-store-search" onkeyup="storePickup.storeFilter()" placeholder="Search..." class="valid" aria-invalid="false">')            	
})

$(document).on('click', '.searchTerm a', function(){
  	var storeName = $(this).data('name');
  
  	$('#pickup-store-search').val(storeName);

})