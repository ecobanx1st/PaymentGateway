$('#withdraw_loader', '#transfer_loader', '#transfer_loader_ETH', '#transfer_loader_BTC', '#transfer_loader_USDT', '#transfer_loader_BCH', '#transfer_loader_LTC').hide();
$('.BEP20').hide();
$('.TRC20').hide();

$('#confirm-delete, #confirm-enable, #remainder-email').one('show.bs.modal', function(e) {
	$(this).find('.btn-ok').attr('href', $(e.relatedTarget).data('href'));
});

$(document).ready(function () 
{
	$('#confirm_buy_crypto', '#confirm_sell_crypto').attr('disabled', true);
});

//password show/hide
function getPasswordResponse() {
	var password_repsonse = document.getElementById("password");
	if (password_repsonse.getAttribute('type') === "password") {
		password_repsonse.setAttribute('type', 'text');
		document.getElementById("passtexticon").innerHTML = '<i class="fa fa-eye" aria-hidden="true"></i>';
	} else {
		password_repsonse.setAttribute('type', 'password');
		document.getElementById("passtexticon").innerHTML = '<i class="fa fa-eye-slash" aria-hidden="true"></i>';
	}
}

//password confirm show/hide
function getPasswordConfirmResponse() {
	var password_confirm_repsonse = document.getElementById("password-confirm");
	if (password_confirm_repsonse.getAttribute('type') === "password") {
		password_confirm_repsonse.setAttribute('type', 'text');
		document.getElementById("passtexticon_confirm").innerHTML = '<i class="fa fa-eye" aria-hidden="true"></i>';
	} else {
		password_confirm_repsonse.setAttribute('type', 'password');
		document.getElementById("passtexticon_confirm").innerHTML = '<i class="fa fa-eye-slash" aria-hidden="true"></i>';
	}
}

$('#verify_code_btn').on('click', function(){
	$('#verify_code_btn').attr('disabled', true);
	$('#verify_code_btn').hide();
	var show_msg_data = "Please wait. Processing on, Verification code sent to your Email ID!";
	var data_url = $(this).attr('data-url');
	$('#email_status_msg').html("<div class='alert alert-success'>"+show_msg_data+"</div>");
	window.location.href = data_url;
});

$('#verify_btn').attr('disabled', true);

$("input").bind('paste', function(e) {
	var self = this;
	setTimeout(function(e) {
		if($(self).val().length >= 6)
		{
			$('#verify_btn').attr('disabled', false);
		}
		else
		{
			$('#verify_btn').attr('disabled', true);
		}
	}, 0);
});

$('#two_fa_code').on('keyup', function(){
	var two_fa_code = $('#two_fa_code').val();
	if(two_fa_code.length >= 6)
	{
		$('#verify_btn').attr('disabled', false);
	}
	else
	{
		$('#verify_btn').attr('disabled', true);
	}
});

$('#email_fa_code').on('keyup', function(){
	var two_fa_code = $('#email_fa_code').val();
	if(two_fa_code.length >= 6)
	{
		$('#verify_btn').attr('disabled', false);
	}
	else
	{
		$('#verify_btn').attr('disabled', true);
	}
});


$("#file_input_files1").change(function() {
	var limit_size = 1048576;
	var photo_size = this.files[0].size;
	if(photo_size > limit_size){
		$("#save_btn").attr('disabled',true);
		$('#file_input_files').val('');
		alert('Image Size Larger than 1MB');
	}
	else
	{ 
		$("#file_input_files1").text(this.files[0].name);
		$("#save_btn1").attr('disabled',false);

		var file = document.getElementById('file_input_files1').value;
		var ext = file.split('.').pop();
		switch(ext) {
		case 'jpg':
		case 'JPG':
		case 'Jpg':
		case 'jpeg':
		case 'JPEG':
		case 'Jpeg':
		case 'png':
		case 'PNG':
		case 'Png':
			readURL14(this);
			break;
		default:
			alert('Upload your profile like jpg, png, jpeg');
			break;
		}
	}
});

function readURL14(input) {
	var limit_size = 1048576;
	var photo_size = input.files[0].size;
	if(photo_size > limit_size){
		alert('Image size larger than 1MB');
	}
	else
	{
		if (input.files && input.files[0]) {
			var reader = new FileReader();
			reader.onload = function (e) {
				$('#doc4').attr('src', e.target.result);
			};
			reader.readAsDataURL(input.files[0]);
		}
	}
}


$('#verify_form').on('submit', function(){
	$('#verify_btn').attr('disabled', true);
});

$('#profileForm').on('submit', function(){
	$('#save_btn').attr('disabled', true);
});

$('#profileDetailsForm').on('submit', function(){
	$('#savedetail_btn').attr('disabled', true);
});

$('#enable_twofa_form').on('submit', function(){
	$('#verify_btn').attr('disabled', true);
});

$('#kyc_confirm_form').on('submit', function(){
	$('#kyc_confirm_btn').attr('disabled', true);
	$('#kyc_confirm_btn').html('Loading...');
});

$('#submit_ticket').show();

$('#addNewTicket').on('submit', function(){
	$('#btn-chat').attr('disabled', true);
	$('#btn-chat').val('Loading...');
});

$('#createTicket').on('submit', function(){
	$('#submit_ticket').hide();
});

function myCopyFunc() 
{
	var range = document.createRange();
	range.select(document.getElementById('coinaddress'));
	document.execCommand("Copy");
	var tooltip = document.getElementById("myTooltip");
	tooltip.innerHTML = "<strong>Copied!</strong>";
	$('#myTooltip').parent().addClass('copiedbtn');
	window.getSelection().removeAllRanges();
	window.getSelection().addRange(range);
}

function copy_text(element) {
    var text = document.getElementById('coinaddress');
    var selection = window.getSelection();
    var range = document.createRange();
    range.selectNodeContents(text);
    selection.removeAllRanges();
    selection.addRange(range);
    //add to clipboard.
    document.execCommand('copy');

    var tooltip = document.getElementById("myTooltip");
	tooltip.innerHTML = "<strong>Copied!</strong>";
	$('#myTooltip').parent().addClass('copiedbtn');

}


function myCopyFunc3() {
	$('#coinaddress3').attr('readonly', false);
	$('#coinaddress3').attr('contenteditable', true);
	var copyText = document.getElementById("coinaddress3");
	copyText.select();
	document.execCommand("Copy");
	var tooltip = document.getElementById("myTooltip3");
	tooltip.innerHTML = "<strong>Copied!</strong>";
	$('#myTooltip3').parent().addClass('copiedbtn');
	$('#coinaddress3').attr('readonly', true);
}

function myCopyFunc1(id) 
{
	$('#coinaddress'+id).attr('readonly', false);
	$('#coinaddress'+id).attr('contenteditable', true);
	var copyText = document.getElementById("coinaddress"+id);
	copyText.select();
	document.execCommand("Copy");
	var tooltip = document.getElementById("myTooltip"+id);
	tooltip.innerHTML = "<strong>Copied!</strong>";
	$('#coinaddress'+id).attr('readonly', true);
}

function myCopyFuncQR() {	
	$('#secretCode').attr('readonly', false);
	$('#secretCode').attr('contenteditable', true);
	var copyText = document.getElementById("secretCode");
	copyText.select();
	document.execCommand("Copy");
	var tooltip = document.getElementById("myTooltipQR");
	tooltip.innerHTML = "<strong>Copied!</strong>";
	$('#myTooltipQR').parent().addClass('copiedbtn');
	$('#secretCode').attr('readonly', true);
}

function getIDType()
{
	var data_url = $('#get_id_url').val();	
	var formData = $('#msform').serialize();
	$.ajax({
		type: "post",
		url: data_url,
		dataType: "json",
		data: formData,
		success: function(data){
			if(data.status == 'success')
			{
				$(".id_type").html(data.msg);
			}
			else
			{
				$(".id_type").html('');
			}
		}
	});
	return false;
}

function submit_withdraw(data_url)
{
	$('#transfer-btn').attr('disabled', true);
	var withdraw_amount  = $("#transfer_amount").val();
	var withdraw_address  = $("#transfer_address").val();
	if(withdraw_address!='' && withdraw_amount!='')
	{
		if(withdraw_amount > 0)
		{
			$('#transfer_loader').show();
			var formData = $('#transfer_form').serialize();
			$.ajax({
				type: "post",
				url: data_url,
				dataType: "json",
				data: formData,
				success: function(data){
					$('#transfer-btn').attr('disabled', false);
					$('#transfer_loader').hide();
					if(data.status == 'success')
					{
						$("#verificationModal1").modal("show");
						$("#verifyModalContent1, #verify_btn_box1").show();
						$('#transfer-btn').attr('disabled', false);
						$("#confirmModalContent1, #verify_btn_updated_box1").hide();
						$(".confirm_currency").html(data.currency);
						$(".confirm_amount").html(data.totalwithdraw_fee);
						$("#confirm_address1").val(data.address);
						$("#confirm_withdrawal_address1").html(data.address);
						$("#confirm_currency_amount1").val(data.amount);
						$("#confirm_withdraw_fee1").val(data.withdraw_fee);
						$("#totalwithdraw_fee1").val(data.totalwithdraw_fee);
						$("#confirm_pair1").val(data.currency);
					}
					else
					{
						$('#transfer-btn').attr('disabled', false);
						$('#transfer_loader').hide();
						$("#transfer_result").html('<div class="alert alert-danger" role="alert"><button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>'+data.msg+'</div>');
					}
				}
			});
			return false;
		}
		else
		{
			$('#transfer-btn').attr('disabled', false);
			$("#transfer_result").html('<div class="alert alert-danger" role="alert"><button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>Withdraw amount should be above zero!</div>');
		}
	}
	else
	{
		$('#transfer-btn').attr('disabled', false);
		$("#transfer_result").html('<div class="alert alert-danger" role="alert"><button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>All fields are required!</div>');
	}
}

function submit_withdraw1(data_url, currency)
{
	$('#transfer-btn_'+currency).attr('disabled', true);
	var withdraw_amount  = $("#transfer_amount_"+currency).val();
	var withdraw_address  = $("#transfer_address_"+currency).val();
	if(withdraw_address!='' && withdraw_amount!='')
	{
		if(withdraw_amount > 0)
		{
			$("#transfer_loader_"+currency).show();
			var formData = $("#transfer_form_"+currency).serialize();
			$.ajax({
				type: "post",
				url: data_url,
				dataType: "json",
				data: formData,
				success: function(data){
					$('#transfer-btn_'+currency).attr('disabled', false);
					$("#transfer_loader_"+currency).hide();
					if(data.status == 'success')
					{
						$("#verificationModal1").modal("show");
						$("#verifyModalContent1, #verify_btn_box1").show();
						$('#transfer-btn').attr('disabled', false);
						$("#confirmModalContent1, #verify_btn_updated_box1").hide();
						$(".confirm_currency").html(data.currency);
						$(".confirm_amount").html(data.totalwithdraw_fee);
						$("#confirm_address1").val(data.address);
						$("#confirm_withdrawal_address1").html(data.address);
						$("#confirm_currency_amount1").val(data.amount);
						$("#confirm_withdraw_fee1").val(data.withdraw_fee);
						$("#totalwithdraw_fee1").val(data.totalwithdraw_fee);
						$("#confirm_pair1").val(data.currency);
					}
					else
					{
						$("#transfer-btn_"+currency).attr('disabled', false);
						$("#transfer_loader_"+currency).hide();
						$("#transfer_result_"+currency).html('<div class="alert alert-danger" role="alert"><button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>'+data.msg+'</div>');
					}
				}
			});
			return false;
		}
		else
		{
			$("#transfer-btn_"+currency).attr('disabled', false);
			$("#transfer_result_"+currency).html('<div class="alert alert-danger" role="alert"><button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>Withdraw amount should be above zero!</div>');
		}
	}
	else
	{
		$("#transfer-btn_"+currency).attr('disabled', false);
		$("#transfer_result_"+currency).html('<div class="alert alert-danger" role="alert"><button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>All fields are required!</div>');
	}
}

$('#withdraw_amount').on('keyup', function(){
	var withdraw_amount  = $("#withdraw_amount").val();
	var withdraw_admin_fee = $('#withdraw_admin_fee').val();
	var total = '';
	var withdraw_fee = fee = 0;
	if(withdraw_amount > 0)
	{
		if(withdraw_admin_fee > 0)
		{
			fee = withdraw_admin_fee / 100;
			fee = fee * withdraw_amount;
			if(fee < 0.01)
			{
				fee = 0.01
			}
		}
		if(withdraw_amount <= fee)
		{
			$('#total_deducted').html("0.00");
			$('#show_error_msg').html("Transfer amount should be greater than the transfer fee");
		}
		else
		{
			$('#show_error_msg').html('');
			total = parseFloat(withdraw_amount) - parseFloat(fee);
			if(isNaN(total))
			{
				$('#total_deducted').html("0.00");
			}
			else
			{
				total = parseFloat(total).toFixed(8);
				$('#total_deducted').html(total);
			}
		}
	}
	else
	{
		$('#total_deducted').html("0.00");
	}
});

$('#transfer_amount_BTC').on('keyup', function(){
	var withdraw_amount  = $("#transfer_amount_BTC").val();
	var withdraw_admin_fee = $('#transfer_admin_fee_BTC').val();
	var total = '';
	var withdraw_fee = fee = 0;
	if(withdraw_amount > 0)
	{
		if(withdraw_admin_fee > 0)
		{
			fee = withdraw_admin_fee / 100;
			fee = fee * withdraw_amount;
			if(fee < 0.0001)
			{
				fee = 0.0001
			}
		}
		if(withdraw_amount <= fee)
		{
			$('#total_withdraw_deducted_BTC').html("0.00000000");
			$('#show_transfer_error_msg_BTC').html("Withdraw amount should be greater than the withdraw fee");
		}
		else
		{
			$('#show_transfer_error_msg_BTC').html('');
			total = parseFloat(withdraw_amount) - parseFloat(fee);
			if(isNaN(total))
			{
				$('#total_withdraw_deducted_BTC').html("0.00000000");
			}
			else
			{
				total = parseFloat(total).toFixed(8);
				$('#total_withdraw_deducted_BTC').html(total);
			}
		}
	}
	else
	{
		$('#total_withdraw_deducted_BTC').html("0.00000000");
	}
});

$('#transfer_amount_ETH').on('keyup', function(){
	var withdraw_amount  = $("#transfer_amount_ETH").val();
	var withdraw_admin_fee = $('#transfer_admin_fee_ETH').val();
	var total = '';
	var withdraw_fee = fee = 0;
	if(withdraw_amount > 0)
	{
		if(withdraw_admin_fee > 0)
		{
			fee = withdraw_admin_fee / 100;
			fee = fee * withdraw_amount;
			if(fee < 0.0001)
			{
				fee = 0.0001
			}
		}
		if(withdraw_amount <= fee)
		{
			$('#total_withdraw_deducted_ETH').html("0.00000000");
			$('#show_transfer_error_msg_ETH').html("Withdraw amount should be greater than the withdraw fee");
		}
		else
		{
			$('#show_transfer_error_msg_ETH').html('');
			total = parseFloat(withdraw_amount) - parseFloat(fee);
			if(isNaN(total))
			{
				$('#total_withdraw_deducted_ETH').html("0.00000000");
			}
			else
			{
				total = parseFloat(total).toFixed(8);
				$('#total_withdraw_deducted_ETH').html(total);
			}
		}
	}
	else
	{
		$('#total_withdraw_deducted_ETH').html("0.00000000");
	}
});

$('#transfer_amount_USDT').on('keyup', function(){
	var withdraw_amount  = $("#transfer_amount_USDT").val();
	var withdraw_admin_fee = $('#transfer_admin_fee_USDT').val();
	var total = '';
	var withdraw_fee = fee = 0;
	if(withdraw_amount > 0)
	{
		if(withdraw_admin_fee > 0)
		{
			fee = withdraw_admin_fee / 100;
			fee = fee * withdraw_amount;
			if(fee < 0.0001)
			{
				fee = 0.0001
			}
		}
		if(withdraw_amount <= fee)
		{
			$('#total_withdraw_deducted_USDT').html("0.00000000");
			$('#show_transfer_error_msg_USDT').html("Withdraw amount should be greater than the withdraw fee");
		}
		else
		{
			$('#show_transfer_error_msg_USDT').html('');
			total = parseFloat(withdraw_amount) - parseFloat(fee);
			if(isNaN(total))
			{
				$('#total_withdraw_deducted_USDT').html("0.00000000");
			}
			else
			{
				total = parseFloat(total).toFixed(8);
				$('#total_withdraw_deducted_USDT').html(total);
			}
		}
	}
	else
	{
		$('#total_withdraw_deducted_USDT').html("0.00000000");
	}
});

$('#transfer_amount_BCH').on('keyup', function(){
	var withdraw_amount  = $("#transfer_amount_BCH").val();
	var withdraw_admin_fee = $('#transfer_admin_fee_BCH').val();
	var total = '';
	var withdraw_fee = fee = 0;
	if(withdraw_amount > 0)
	{
		if(withdraw_admin_fee > 0)
		{
			fee = withdraw_admin_fee / 100;
			fee = fee * withdraw_amount;
			if(fee < 0.0001)
			{
				fee = 0.0001
			}
		}
		if(withdraw_amount <= fee)
		{
			$('#total_withdraw_deducted_BCH').html("0.00000000");
			$('#show_transfer_error_msg_BCH').html("Withdraw amount should be greater than the withdraw fee");
		}
		else
		{
			$('#show_transfer_error_msg_BCH').html('');
			total = parseFloat(withdraw_amount) - parseFloat(fee);
			if(isNaN(total))
			{
				$('#total_withdraw_deducted_BCH').html("0.00000000");
			}
			else
			{
				total = parseFloat(total).toFixed(8);
				$('#total_withdraw_deducted_BCH').html(total);
			}
		}
	}
	else
	{
		$('#total_withdraw_deducted_BCH').html("0.00000000");
	}
});

$('#transfer_amount_LTC').on('keyup', function(){
	var withdraw_amount  = $("#transfer_amount_LTC").val();
	var withdraw_admin_fee = $('#transfer_admin_fee_LTC').val();
	var total = '';
	var withdraw_fee = fee = 0;
	if(withdraw_amount > 0)
	{
		if(withdraw_admin_fee > 0)
		{
			fee = withdraw_admin_fee / 100;
			fee = fee * withdraw_amount;
			if(fee < 0.0001)
			{
				fee = 0.0001
			}
		}
		if(withdraw_amount <= fee)
		{
			$('#total_withdraw_deducted_LTC').html("0.00000000");
			$('#show_transfer_error_msg_LTC').html("Withdraw amount should be greater than the withdraw fee");
		}
		else
		{
			$('#show_transfer_error_msg_LTC').html('');
			total = parseFloat(withdraw_amount) - parseFloat(fee);
			if(isNaN(total))
			{
				$('#total_withdraw_deducted_LTC').html("0.00000000");
			}
			else
			{
				total = parseFloat(total).toFixed(8);
				$('#total_withdraw_deducted_LTC').html(total);
			}
		}
	}
	else
	{
		$('#total_withdraw_deducted_LTC').html("0.00000000");
	}
});

$(function() {
	$('#transfer_amount, #transfer_amount_BTC, #transfer_amount_ETH, #transfer_amount_USDT, #transfer_amount_LTC, #transfer_amount_BCH').on('input', function() {
		this.value = this.value
		.replace(/[^\d.]/g, '')             // numbers and decimals only
		.replace(/(\..*)\./g, '$1')         // decimal can't exist more than once
		.replace(/(\.[\d]{8})./g, '$1');   // not more than 4 digits after decimal
		if(this.value == '0.00000' || this.value == '.00000'){
			this.value = '0.0000';
		}
	});
});

$(function() {
	$('#withdraw_amount, #item_amount, #tax_amount, #shipping_cost').on('input', function() {
		this.value = this.value
		.replace(/[^\d.]/g, '')             // numbers and decimals only
		.replace(/(\..*)\./g, '$1')         // decimal can't exist more than once
		.replace(/(\.[\d]{8})./g, '$1');   // not more than 4 digits after decimal
		if(this.value == '0.00000' || this.value == '.00000'){
			this.value = '0.0000';
		}
	});
});

$('#confirm_account').on('click', function(){
	$("#verify_btn_box").hide();
	$("#verify_btn_updated_box").show();
	$("#verify_btn_updated_box").html("<div class='alert alert-success'>Please wait. Processing on, Verification code will be sent within few minutes!</div>");
	var formData = $('#confirm_form').serialize();
	var data_url = $('#data_url').val();
	$.ajax({
		type: "post",
		url: data_url,
		dataType: "json",
		data: formData,
		success: function(data){
			if(data.status == 'success')
			{
				$("#verifyModalContent").hide();
				$("#confirmModalContent").show();
				$('#confirmMsg').html(data.msg);
			}
			else
			{
				$('#validateMsg').html(data.msg);
			}
		}
	});
	return false;
});

$('#confirm_account_btn').on('click', function(){
	$('#display_confirm_msgs').html('<div class="alert alert-info"><i class="fa fa-info-circle"></i> Processing on...Please wait...</div>');
	$('#display_confirm_msg').hide();
	var url = $('#current_url').val();
	var formData = $('#verify_form').serialize();
	var data_url = $('#confirm_data_url').val(); 
	$.ajax({
		type: "post",
		url: data_url,
		dataType: "json",
		data: formData,
		success: function(data){
			$('#display_confirm_msgs').html('');
			if(data.status == 'success')
			{  
				if(data.msgdata)
				{
					$("#confirm_msg_popup").css("display", "none");
					$("#confirmResult").html(data.msgdata);
				}
				else
				{
					$("#confirm_msg_popup").html("");
					$('#confirmResult').html(data.msg);
					window.setTimeout(function() {
						window.location.href = url;
					}, 1500);
				}
			}
			else
			{
				$('#display_confirm_msg').show();
				$('#confirmMsg').html(data.msg);
			}
		}
	});
	return false;
});

function validateEth(ethAddress){
	var address = document.getElementById(ethAddress).value;
	var val =  isAddress(address);
	if(val){
		$("#address_valid").html('');
		$("#withdraw-btn").show();
	} else {
		var show_msg_data = "Invalid Address!";
		$("#address_valid").html(show_msg_data);
		$("#withdraw-btn").hide();
	}
}

function isAddress(address) {
	if (!/^(0x)?[0-9a-f]{40}$/i.test(address)) {
		return false;
	} else if (/^(0x)?[0-9a-f]{40}$/.test(address) || /^(0x)?[0-9A-F]{40}$/.test(address)) {
		return true;
	} else {
		return isChecksumAddress(address);
	}
};

function isChecksumAddress(address) {
	address = address.replace('0x','');
	var addressHash = sha3(address.toLowerCase());
	for (var i = 0; i < 40; i++ ) {
		if ((parseInt(addressHash[i], 16) > 7 && address[i].toUpperCase() !== address[i]) || (parseInt(addressHash[i], 16) <= 7 && address[i].toLowerCase() !== address[i])) {
			return false;
		}
	}
	return true;
};

function pageredirect(self){ 
	window.location.href = self.value;
}

$('[data-toggle=datepicker1]').each(function() {
	var target = $(this).data('target-name');
	var t = $('input[name=' + target + ']');
	t.datepicker({
		format: 'yyyy-mm-dd',
		endDate: '-18y',
		autoclose: true
	});
	$(this).on("click", function() {
		t.datepicker("show");
	});
});

$('[data-toggle=datepicker2]').each(function() {
	var target = $(this).data('target-name');
	var t = $('input[name=' + target + ']');
	t.datepicker({
		format: 'yyyy-mm-dd',
		startDate: '+1d',
		autoclose: true
	});
	$(this).on("click", function() {
		t.datepicker("show");
	});
});

$("#proof_upload1").change(function() {
	var limit_size = 3145728;
	var photo_size = this.files[0].size;
	if(photo_size > limit_size){
		$("#kyc_btn").attr('disabled',true);
		$('#proof_upload1').val('');
		alert('Image Size Larger than 3MB');
	}
	else
	{ 
		$("#proof_upload1").text(this.files[0].name);
		$("#kyc_btn").attr('disabled',false);

		var file = document.getElementById('proof_upload1').value;
		var ext = file.split('.').pop();
		switch(ext) {
		case 'jpg':
		case 'JPG':
		case 'Jpg':
		case 'jpeg':
		case 'JPEG':
		case 'Jpeg':
		case 'png':
		case 'PNG':
		case 'Png':
			readURL10(this);
			break;
		default:
			alert('Upload your proof like jpg, png, jpeg');
			break;
		}
	}
});

$("#proof_upload2").change(function() {
	var limit_size = 3145728;
	var photo_size = this.files[0].size;
	if(photo_size > limit_size){
		$("#kyc_btn").attr('disabled',true);
		$('#proof_upload2').val('');
		alert('Image Size Larger than 3MB');
	}
	else
	{ 
		$("#proof_upload2").text(this.files[0].name);
		$("#kyc_btn").attr('disabled',false);

		var file = document.getElementById('proof_upload2').value;
		var ext = file.split('.').pop();
		switch(ext) {
		case 'jpg':
		case 'JPG':
		case 'Jpg':
		case 'jpeg':
		case 'JPEG':
		case 'Jpeg':
		case 'png':
		case 'PNG':
		case 'Png':
			readURL5(this);
			break;
		default:
			alert('Upload your proof like jpg, png, jpeg');
			break;
		}
	}
});

$("#proof_upload3").change(function() {
	var limit_size = 3145728;
	var photo_size = this.files[0].size;
	if(photo_size > limit_size){
		$("#kyc_btn").attr('disabled',true);
		$('#proof_upload3').val('');
		alert('Image Size Larger than 3MB');
	}
	else
	{ 
		$("#proof_upload3").text(this.files[0].name);
		$("#kyc_btn").attr('disabled',false);

		var file = document.getElementById('proof_upload2').value;
		var ext = file.split('.').pop();
		switch(ext) {
		case 'jpg':
		case 'JPG':
		case 'Jpg':
		case 'jpeg':
		case 'JPEG':
		case 'Jpeg':
		case 'png':
		case 'PNG':
		case 'Png':
			readURL6(this);
			break;
		default:
			alert('Upload your proof like jpg, png, jpeg');
			break;
		}
	}
});

function readURL6(input) {
	var limit_size = 3145728;
	var photo_size = input.files[0].size;
	if(photo_size > limit_size){
		alert('Image Size Larger than 3MB');
	}
	else
	{
		if (input.files && input.files[0]) {
			var reader = new FileReader();
			reader.onload = function(e) {
				$('#docs6').attr('src', e.target.result);
			}
			reader.readAsDataURL(input.files[0]);
		}
	}
}

function readURL10(input) {
	var limit_size = 3145728;
	var photo_size = input.files[0].size;
	if(photo_size > limit_size){
		alert('Image Size Larger than 3MB');
	}
	else
	{
		if (input.files && input.files[0]) {
			var reader = new FileReader();
			reader.onload = function(e) {
				$('#blah').attr('src', e.target.result);
			}
			reader.readAsDataURL(input.files[0]);
		}
	}
}

function readURL5(input) {
	var limit_size = 3145728;
	var photo_size = input.files[0].size;
	if(photo_size > limit_size){
		alert('Image Size Larger than 3MB');
	}
	else
	{
		if (input.files && input.files[0]) {
			var reader = new FileReader();
			reader.onload = function(e) {
				$('#docs4').attr('src', e.target.result);
			}
			reader.readAsDataURL(input.files[0]);
		}
	}
}

$("#profile_input_file").change(function() {
	var limit_size = 1048576;
	var photo_size = this.files[0].size;
	if(photo_size > limit_size){
		$("#save_btn").attr('disabled',true);
		$('#profile_input_file').val('');
		alert('Image Size Larger than 1MB');
	}
	else
	{ 
		$("#profile_input_file").text(this.files[0].name);
		$("#save_btn").attr('disabled',false);

		var file = document.getElementById('profile_input_file').value;
		var ext = file.split('.').pop();
		switch(ext) {
		case 'jpg':
		case 'JPG':
		case 'Jpg':
		case 'jpeg':
		case 'JPEG':
		case 'Jpeg':
		case 'png':
		case 'PNG':
		case 'Png':
			readURL(this);
			break;
		default:
			alert('Upload your profile like jpg, png, jpeg');
			break;
		}
	}
});

function readURL(input) {
	var limit_size = 1048576;
	var photo_size = input.files[0].size;
	if(photo_size > limit_size){
		alert('Image size larger than 1MB');
	}
	else
	{
		if (input.files && input.files[0]) {
			var reader = new FileReader();
			reader.onload = function (e) {
				$('#blah').attr('src', e.target.result);
			};
			reader.readAsDataURL(input.files[0]);
		}
	}
}

$("#file_input_files").change(function() {
	var limit_size = 1048576;
	var photo_size = this.files[0].size;
	if(photo_size > limit_size){
		$("#save_btn").attr('disabled',true);
		$('#file_input_files').val('');
		alert('Image Size Larger than 1MB');
	}
	else
	{ 
		$("#file_input_files").text(this.files[0].name);
		$("#save_btn").attr('disabled',false);

		var file = document.getElementById('file_input_files').value;
		var ext = file.split('.').pop();
		switch(ext) {
		case 'jpg':
		case 'JPG':
		case 'Jpg':
		case 'jpeg':
		case 'JPEG':
		case 'Jpeg':
		case 'png':
		case 'PNG':
		case 'Png':
			readURL9(this);
			break;
		default:
			alert('Upload your profile like jpg, png, jpeg');
			break;
		}
	}
});

function readURL9(input) {
	var limit_size = 1048576;
	var photo_size = input.files[0].size;
	if(photo_size > limit_size){
		alert('Image size larger than 1MB');
	}
	else
	{
		if (input.files && input.files[0]) {
			var reader = new FileReader();
			reader.onload = function (e) {
				$('#doc3').attr('src', e.target.result);
			};
			reader.readAsDataURL(input.files[0]);
		}
	}
}

function entsub(event,ourform) {
	if (event && event.which == 13)
	{
		if(document.getElementById('verify_btn').disabled == false)
		{
			ourform.submit();
		}
	}
	else
	{
		return true;
	}
}

$('#kyc_btn').on('click', function(){
	$("#kyc_btn").attr('disabled', true);
	$("#kyc_btn").html('Loading...');
	var data_url = $('#data_url').val();
	var current_url = $('#current_url').val();
	$.ajax({
		type: "POST",
		url: data_url,
		dataType: "json",
		data: new FormData($('#kyc_form_data')[0]),
		processData: false,
		contentType: false,
		success: function(data){
			if(data.status == 'success')
			{
				$("#kyc_btn").attr('disabled', true);
				$("#kyc_btn").html('Submit');
				$("#result").html('<span class="text-success"><b>'+data.msg+'</b></span>');
				setInterval(function(){
					window.location.href=current_url;
				}, 1500);
			}
			else
			{
				$("#kyc_btn").attr('disabled', false);
				$("#kyc_btn").html('Submit');
				$("#result").html('<span class="text-danger">'+data.msg+'</span>');
			}
		}
	});
	return false;
});

//... Deposit/Withdraw History -- Search ...//
$('#searchDeposit').on('click', function(){
	$("#searchDeposit").html('Loading...');
	var formData = $('#depositForm').serialize();
	var data_url = $('#deposit_url').val();
	$.ajax({
		type: "post",
		url: data_url,
		dataType: "json",
		data: formData,
		success: function(data){
			$("#searchDeposit").html('Search');
			$('#searchDepositStartResult, #searchDepositEndResult').html("");
			if(data.status == 'success')
			{
				$('#depositResult').html(data.msg);
			}
			else if(data.status == 'start_msg')
			{
				$('#searchDepositStartResult').html('('+data.msg+')');
			}
			else if(data.status == 'end_msg')
			{
				$('#searchDepositEndResult').html('('+data.msg+')');
			}
		}
	});
	return false;
});

//... Buy/Sell Orders History -- Search ...//
$('#searchOrders').on('click', function(){
	$("#searchOrders").html('Loading...');
	var formData = $('#ordersForm').serialize();
	var data_url = $('#orders_url').val();
	$.ajax({
		type: "post",
		url: data_url,
		dataType: "json",
		data: formData,
		success: function(data){
			$("#searchOrders").html('Search');
			$('#searchOrdersStartResult, #searchOrdersEndResult').html("");
			if(data.status == 'success')
			{
				$('#ordersResult').html(data.msg);
			}
			else if(data.status == 'start_msg')
			{
				$('#searchOrdersStartResult').html('('+data.msg+')');
			}
			else if(data.status == 'end_msg')
			{
				$('#searchOrdersEndResult').html('('+data.msg+')');
			}
		}
	});
	return false;
});

$('#submitTicket').on('click', function(){
	var current_url = $('#current_url').val();
	$("#submitTicket").html('Loading...');
	$("#submitTicket").attr('disabled', true);
	$("#submit_ticket").hide();
	var formData = $('#createTicket').serialize();
	var data_url = $('#data_url').val();
	$.ajax({
		type: "post",
		url: data_url,
		dataType: "json",
		data: formData,
		success: function(data){
			if(data.status == 'success')
			{
				$("#submitTicket").html('Submit');
				$("#submitTicket").attr('disabled', false);
				$("#msg_data").hide();
				$('#result_data').html('<div class="alert alert-success alert-dismissible fade show" role="alert"><button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>'+data.msg+'</div>');
				setInterval(function(){
					window.location.href=current_url;
				}, 2000);
			}
			else
			{
				$("#submitTicket").html('Submit');
				$("#submitTicket").attr('disabled', false);
				$("#submit_ticket").show();
				$('#result_data').html('<div class="alert alert-danger alert-dismissible fade show" role="alert"><button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>'+data.msg+'</div>');
			}
		}
	});
	return false;
});

function getFixedValue(num, decimal)
{
	decimal = Number(decimal) + 1;
	num = num.toString(); //If it's not already a String
	if(num.indexOf(".") == -1)
	{
		return Number(num); //If you need it back as a Number
	}
	num = num.slice(0,(num.indexOf("."))+decimal); //With 3 exposing the hundredths place
	return Number(num); //If you need it back as a Number
}

function convert(n)
{
	var sign = +n < 0 ? "-" : "",
	toStr = n.toString();
	if (!/e/i.test(toStr)) {
		return n;
	}
	var [lead,decimal,pow] = n.toString()
	.replace(/^-/,"")
	.replace(/^([0-9]+)(e.*)/,"$1.$2")
	.split(/e|\./);
	return +pow < 0 
	? sign + "0." + "0".repeat(Math.max(Math.abs(pow)-1 || 0, 0)) + lead + decimal
	: sign + lead + (+pow >= decimal.length ? (decimal + "0".repeat(Math.max(+pow-decimal.length || 0, 0))) : (decimal.slice(0,+pow)+"."+decimal.slice(+pow)))
}

$('[data-toggle=datepicker3]').each(function() {
	var target = $(this).data('target-name');
	var t = $('input[name=' + target + ']');
	t.datepicker({
		format: 'yyyy-mm-dd',
		autoclose: true
	});
	$(this).on("click", function() {
		t.datepicker("show");
	});
});

$('[data-toggle=datepicker5]').each(function() {
	var target = $(this).data('target-name');
	var t = $('input[name=' + target + ']');
	t.datepicker({
		format: 'yyyy-mm-dd',
		startDate: '+0d',
		autoclose: true
	});
	$(this).on("click", function() {
		t.datepicker("show");
	});
});

function changeEndDate(id)
{
	var interval = $('#lock_period_'+id).val();
	var startDate = new Date($('#startDate_'+id).val());
	startDate.setDate((startDate.getDate()) + interval);

	$('#endDate_'+id).val(startDate.getFullYear() + '-' + convertDateString((startDate.getMonth() + 1), interval) + '-' + convertDateString(startDate.getDate(), interval));
}

function convertDateString(p, interval) { return (p < interval) ? '0' + p : p; }

$(function() {
	$('.allow_decimal').on('input', function() {
		this.value = this.value
		.replace(/[^\d.]/g, '')             // numbers and decimals only
		.replace(/(\..*)\./g, '$1')         // decimal can't exist more than once
		.replace(/(\.[\d]{2})./g, '$1');   // not more than 4 digits after decimal
		if(this.value == '0.000' || this.value == '.000'){
			this.value = '0.00';
		}
	});
});

function isValidURL(string, return_url) {
	var res = string.match(/(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g);
	if(res == null){
		$('#'+return_url).html('Invalid URL!');
	} else {
		$('#'+return_url).html('');
	}
};

$('#generate_btn').on('click', function(){
	$("#generate_btn").attr('disabled', true);
	$("#generate_btn").html("Loading...");
	var formData = $('#profileForm').serialize();
	var data_url = $('#data_url').val();
	$.ajax({
		type: "post",
		url: data_url,
		dataType: "json",
		data: formData,
		success: function(data){
			$("#generate_btn").attr('disabled', false);
			$("#generate_btn").html("Generate Button");
			if(data.status == 'success')
			{
				$("#verificationModal").modal('show');
				$("#showHtmlForm").html(data.msg);
			}
			else
			{
				$('#showError').html(data.msg);
			}
		}
	});
	return false;
});

function getPaymentCurrency(currency, selected_amount)
{   
$('#BTCdata, #ETHdata,#USDCdata,  #USDTdata,  #TRCdata, #TRXdata').removeClass('active');
$('#'+currency+'data').addClass('active');
$('#selected_token').val(currency);
$('#selected_amount').val(selected_amount);
}

function showKey(id)
{
	$('#show_btn_'+id).attr('disabled', true);
	$('#show_btn_'+id).html('Loading...');
	var data_url = $('#data_url').val();
	$.ajax({
		type: "get",
		url: data_url,
		dataType: "json",
		success: function(data){
			$('#show_btn_'+id).attr('disabled', false);
			$('#show_btn_'+id).html('<i class="fa fa-eye"></i> Show Keys');
			if(data.status == 'success')
			{
				$("#verificationModal").modal('show');
				$("#confirm_msg_popup").css("display", "block");
				$('#display_confirm_msg').show();
				$('#email_fa_code').val("");
				$("#confirmResult").html(data.msg);
				$("#getId").val(id);
			}
		}
	});
	return false;
}

$('#deposit-btn-BTC').on('click', function(){
	$('#BTC').html('<a href="#" id="deposit-btn" class="btn sitebtn green-btn mr-1">Deposit</a>');
});

$('#deposit-btn-ETH').on('click', function(){
	$('#ETH').html('<a href="#" id="deposit-btn" class="btn sitebtn green-btn mr-1">Deposit</a>');
});

$('#deposit-btn-USDT').on('click', function(){
	$('#USDT').html('<a href="#" id="deposit-btn" class="btn sitebtn green-btn mr-1">Deposit</a>');
});

$('#deposit-btn-LTC').on('click', function(){
	$('#LTC').html('<a href="#" id="deposit-btn" class="btn sitebtn green-btn mr-1">Deposit</a>');
});

$('#deposit-btn-BCH').on('click', function(){
	$('#BCH').html('<a href="#" id="deposit-btn" class="btn sitebtn green-btn mr-1">Deposit</a>');
});

var padel = null;
function padSetup() {
	if (padel == null) {
		padel = document.getElementById('amountf');
	}
	return (padel != null) ? true:false;
}
function padClear() {
	if (padSetup()) {
		padel.value = '';
	}
}
function padPeriod() {
	if (padSetup()) {
		if (padel.value.indexOf('.') == -1) {
			padel.value = padel.value+'.';
		}
	}
}
function padBack() {
	if (padSetup()) {
		if (padel.value.length > 0) {
			padel.value = padel.value.slice(0, -1);
		}
	}
}
function padPress(i) {
	if (padSetup()) {
		padel.value = padel.value+i.toString();
	}
}

function calculateWithdrwaCurrencyAmount(amount, currency)
{
	$('#25withdrawcol_'+currency+', #50withdrawcol_'+currency+', #75withdrawcol_'+currency+', #100withdrawcol_'+currency+'').removeClass('activelimit')
	$('#'+amount+'withdrawcol_'+currency+'').addClass('activelimit')
	var wallet_balance = $('#wallet_balance_'+currency).val();
	if(amount > 0 && wallet_balance > 0)
	{
		var new_balance = amount / 100;
		new_balance = new_balance * wallet_balance;
		new_balance = new_balance.toFixed(8);

		if(isNaN(new_balance))
		{
			$('#transfer_amount_'+currency+'').val("0.00000000");
		}
		else
		{
			if(Number(wallet_balance) < Number(new_balance))
			{
				$('#transfer_amount_'+currency+'').val("0.00000000");
			}
			else
			{
				$('#transfer_amount_'+currency+'').val(new_balance);

				var withdraw_amount  = new_balance;
				var withdraw_admin_fee = $('#transfer_admin_fee_'+currency+'').val();
				var total = '';
				var withdraw_fee = fee = 0;
				if(withdraw_amount > 0)
				{
					if(withdraw_admin_fee > 0)
					{
						fee = Number(withdraw_admin_fee) / 100;
						fee = Number(fee) * Number(withdraw_amount);
						if(fee < 0.00001) fee = 0.00001;
						fee = fee.toFixed(8);
					}
					if(Number(withdraw_amount) <= Number(fee))
					{
						$('#total_withdraw_deducted_'+currency+'').html("0.00000000");
						$('#show_transfer_error_msg_'+currency+'').html("Withdraw amount should be greater than the withdraw fee");
					}
					else
					{
						$('#show_transfer_error_msg_'+currency+'').html('');
						total = parseFloat(withdraw_amount) - parseFloat(fee);
						if(isNaN(total))
						{
							$('#total_withdraw_deducted_'+currency+'').html("0.00000000");
						}
						else
						{
							total = convert(getFixedValue(total, 8));
							$('#total_withdraw_deducted_'+currency+'').html(total);
						}
					}
				}
				else
				{
					$('#show_transfer_error_msg_'+currency+'').html('');
					$('#total_withdraw_deducted_'+currency+'').html("0.00000000");
				}
			}
		}
	}
	else
	{
		$('#transfer_amount_'+currency+'').val("0.00000000");
	}
}

function getAddress(get_token_network)
{
	if(get_token_network == 'ERC20')
	{
		$('.'+get_token_network).show();
		
		$('.TRC20').hide();
	}
	
	else if(get_token_network == 'TRC20')
	{
		$('.'+get_token_network).show();
		$('.ERC20').hide();
	
	}
}

$('#password_btn').on('click', function(){
	$("#password_btn").attr('disabled', true);
	$("#password_btn").html("Loading...");

	var formData = $('#profileForm').serialize();
	var change_pwd_url = $('#change_pwd_url').val();

	$.ajax({
		type: "post",
		url: change_pwd_url,
		dataType: "json",
		data: formData,
		beforeSend:function()
		{
			$(document).find('span.errors-text').text('');
		},
		success: function(result){
			$("#password_btn").attr('disabled', false);
			$("#password_btn").html("Change");

			if(result.status == 0)
			{
				var errAll = result.errorss;

				$.each(errAll, function(index, val)
				{
					$('span.'+index+'_error').text(val[0]);
				});

				$('#password_btn').attr('disabled', false);
				$('#password_btn').html('Change');
			}
			else if(result.status == 'failed')
			{
				$('#pwdsuccessAlert').html('');
				$('#pwdfailedAlert').html('<div class="alert alert-danger alert-dismissible fade show" role="alert"><button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>'+result.msg+'</div>');

				$('#password_btn').attr('disabled', false);
				$('#password_btn').html('Change');

			}
			else if(result.status == 'success')
			{
				$('#pwdfailedAlert').html('');
				$('#pwdsuccessAlert').html('<div class="alert alert-success alert-dismissible fade show" role="alert"><button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>'+result.msg+'</div>');
				window.setTimeout(function() {
					$("#pwdsuccessAlert").fadeTo(1000, 0).slideUp(1000, function(){
						$(this).remove(); 
						
					});
				}, 1500);
				
				
				$('#current_password').val('');
				$('#password-confirm').val('');
				$('#password').val('');
			}
		}
	});
	return false;
});


/*********Google 2FA Enable -- START ***********/
$('#google2fa_enable_btn').on('click', function(event)
{
	$('#google2fa_enable_btn').attr('disabled', true);
	$('#google2fa_enable_btn').html('Loading...');

	var google_twofa_url = $("#enableGoogleTwoFaUrl").val();
	event.preventDefault();

	$.ajax({
		type: "get",
		url : google_twofa_url,
		dataType: "json",
		beforeSend: function(){
			$("#show_error_password").html('');
			$('#submit_twofa_loader').show();
		},
		success: function(data){
			if(data.status == 'success')
			{	
				let res = data.responseData;
				$('#secretCode').val(res.secret);
				$('#qr_image_display').attr('src',res.image); 

				$('#auth').modal('show');

				$('#submit_twofa_loader').hide();
				$('#google2fa_enable_btn').attr('disabled', false);
				$('#google2fa_enable_btn').html('Enable');
			}
			else
			{
				$('#google2fa_enable_btn').attr('disabled', false);
				$('#google2fa_enable_btn').html('Enable');
			}
		}
	});
	return false;
}); 

//Google 2FA Enable Verification
$('#verify_btn').on('click', function(event)
{
	$('#verify_btn').attr('disabled', true);
	$('#verify_btn').html('Loading...');

	var formData = $('#enable_google_twofa_form').serialize();
	event.preventDefault();

	var google_twofa_enable_data_url = $('#google_twofa_enable_data_url').val();

	$.ajax({
		url : google_twofa_enable_data_url,
		type: 'post',
		data: formData,
		dataType: 'json',
		beforeSend:function()
		{
			$(document).find('span.errors-text').text('');
		},
		success: function(result)
		{
			if(result.status == 0)
			{
				var errAll = result.errorss;

				$.each(errAll, function(index, val)
				{
					$('span.'+index+'_error').text(val[0]);
				});

				$('#verify_btn').attr('disabled', false);
				$('#verify_btn').html('Verify');
			}
			else if(result.status == 'success')
			{
				$('#successAlert').append('<div class="alert alert-success alert-dismissible fade show" role="alert"><button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>'+result.messageEnable+'..!</div>');

				setTimeout(function() {$('#auth').modal('toggle');}, 3000);

				setTimeout(function() { window.location.reload(); }, 2000);

				$('#verify_btn').attr('disabled', false);
				$('#verify_btn').html('Verify');
			}
			else if(result.status == 'failed')
			{
				$('#failedAlert').append('<div class="alert alert-danger alert-dismissible fade show" role="alert"><button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>'+result.messageFailed+'..!</div>');

				$('#verify_btn').attr('disabled', false);
				$('#verify_btn').html('Verify'); 
			}
		}
	});
	return false;

}); 
/*********Google 2FA Enable -- END ***********/

/*********Email 2FA Enable -- END ***********/
$('#email2fa_enable_btn').on('click', function(event)
{ 
	$('#email2fa_enable_btn').attr('disabled', true);
	$('#email2fa_enable_btn').html('Loading...');

	var email_twofa_url = $("#enableEmailTwoFaUrl").val();
	event.preventDefault();
	
	$.ajax({
		type: "get",
		url : email_twofa_url,
		dataType: "json",
		beforeSend: function(){
			$("#show_error_password").html('');
			$('#submit_twofa_loader').show();
		},
		success: function(data){

			if(data.status == 'success')
			{
				$('#emailotp').modal('show');

				$('#submit_twofa_loader').hide();

				$("#resultSuccess").append("<div class='alert alert-info alert-dismissable'>"+data.msg+"..!</div>");
				
				$('#email2fa_enable_btn').attr('disabled', false);
				$('#email2fa_enable_btn').html('');
				
			}
			else
			{
				$('#email2fa_enable_btn').attr('disabled', false);
				$('#email2fa_enable_btn').html('');
				
			}

			$(document).ready(function () 
			{
				window.setTimeout(function() {
					$(".alert").fadeTo(1000, 0).slideUp(1000, function(){
						$(this).remove(); 
						$('#email2fa_enable_btn').html('Resend');
					});
				}, 4000);
			}); 
		}
	});
	return false;
}); 

//Email 2FA Enable Verification
$('#email_verify_btn').on('click', function(event)
{
	$('#email_verify_btn').attr('disabled', true);
	$('#email_verify_btn').html('Loading...');
	var confirm_url = $('#confirm_url').val();
	var formData = $('#email_twofa_verify_form').serialize();
	event.preventDefault();

	var email_twofa_enable_data_url = $('#email_twofa_enable_data_url').val();
	var email_code = $('#email_fa_code').val();

	$.ajax({
		url : email_twofa_enable_data_url,
		type: 'post',
		data: formData,
		dataType: 'json',
		beforeSend:function()
		{
			$(document).find('span.errors-text').text('');
		},
		success: function(result)
		{
			if(result.status == 'failed_vals')
			{
				var errAll = result.msg.errorss;

				$.each(errAll, function(index, val)
				{
					$('span.'+index+'_error').text(val[0]);
				});

				$('#email_verify_btn').attr('disabled', false);
				$('#email_verify_btn').html('Verify');
			}
			else if(result.status == 'success')
			{
				$('#resultSuccess').append('<div class="alert alert-success alert-dismissible fade show" role="alert"><button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>'+result.messageEnable+'..!</div>');

				setTimeout(function() {$('#emailotp').modal('toggle');}, 1500);

				setTimeout(function() { window.location.href = confirm_url; }, 1500);

				$('#email_verify_btn').attr('disabled', false);
				$('#email_verify_btn').html('Verify');
			}
			else if(result.status == 'failed')
			{
				$('#resultFailed').append('<div class="alert alert-danger alert-dismissible fade show" role="alert"><button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>'+result.messageFailed+'..!</div>');

				$('#email_verify_btn').attr('disabled', false);
				$('#email_verify_btn').html('Verify');
			}
		}
	});
	return false;

}); 
/*********Email 2FA Enable -- END ***********/




function calculateTransferAmount(amount)
{
	$('#25transfercol, #50transfercol, #75transfercol, #100transfercol').removeClass('activelimit')
	$('#'+amount+'transfercol').addClass('activelimit')
	var spot_wallet_balance = $('#wallet_balance').val();
	var ptop_wallet_balance = $('#ptop_wallet_balance').val();
	var from_wallet_account_change = $('#from_wallet_account_change').val();
	var to_wallet_account_change = $('#to_wallet_account_change').val();
	var withdraw_address = $('#withdraw_address').val();
	var coin_name = $('#coin_name').val();
	var total_decimal = 8;

	if(amount > 0 && from_wallet_account_change > 0)
	{
		if(from_wallet_account_change == 1)
		{
			var new_balance = amount / 100;
			
			new_balance = new_balance * spot_wallet_balance;
			new_balance = new_balance.toFixed(total_decimal);

			if(isNaN(new_balance))
			{
				$('#withdraw_amount').val("0.000000");
			}
			else
			{
				if(Number(spot_wallet_balance) < Number(new_balance))
				{
					$('#withdraw_amount').val("0.000000");
				}
				else
				{
					$('#withdraw_amount').val(new_balance);

					var withdraw_amount  = new_balance;
					var withdraw_admin_fee = $('#withdraw_admin_fee').val();

					var total = '';
					var feesNew1 = '';
					var feesNew2 = '';

					var withdraw_fee = fee = 0;
					if(withdraw_amount > 0)
					{
						if(withdraw_admin_fee > 0)
						{
							if (typeof to_wallet_account_change == "undefined" || to_wallet_account_change == null)
							{
								fee = withdraw_admin_fee;
							}
							else
							{
								fee = Number(withdraw_admin_fee) / 100;
								fee = Number(fee) * Number(withdraw_amount);
								if(fee < 0.000001) fee = 0.000001;
								fee = fee.toFixed(total_decimal);
							}
						}
						if(Number(withdraw_amount) <= Number(fee))
						{
							if(from_wallet_account_change == 1 && to_wallet_account_change == 2)
							{
								$('#total_deducted').html("0.00000000");
								$('#show_error_msg').html("");
							}
							else
							{
								$('#total_deducted').html("0.00000000");
								$('#show_error_msg').html("Transfer amount should be greater than the transfer fee");
							}
						}
						else
						{
							$('#show_error_msg').html('');
							if(from_wallet_account_change == 1 && to_wallet_account_change == 2)
							{
								total = parseFloat(withdraw_amount);
							}
							else
							{

								feesNew1 = Number(fee)/100;
								feesNew2 = Number(withdraw_amount) * Number(feesNew1);

								total = parseFloat(withdraw_amount) - parseFloat(feesNew2);
							}

							if(isNaN(total))
							{
								$('#total_deducted').html("0.00000000");
							}
							else
							{	

								total = convert(getFixedValue(total, total_decimal));
								$('#total_deducted').html(total);
							}
						}
					}
					else
					{
						$('#show_error_msg').html('');
						$('#total_deducted').html("0.00000000");
					}
				}
			}
		}
		else if(from_wallet_account_change == 2)
		{
			var new_balance = amount / 100;
			new_balance = new_balance * ptop_wallet_balance;
			new_balance = new_balance.toFixed(total_decimal);

			if(isNaN(new_balance))
			{
				$('#withdraw_amount').val("0.000000");
			}
			else
			{
				if(Number(ptop_wallet_balance) < Number(new_balance))
				{
					$('#withdraw_amount').val("0.000000");
				}
				else
				{
					$('#withdraw_amount').val(new_balance);

					var withdraw_amount  = new_balance;
					var withdraw_admin_fee = $('#withdraw_admin_fee').val();

					if (typeof coin_name != "undefined" || coin_name != null)
					{
						if(coin_name == 'USDT')
						{
							var check_letter = withdraw_address.substr(0, 1);
							if(check_letter != 'T')
							{
								var withdraw_admin_fee = $('#erc_admin_fee').val();
							}
						}
					}

					var total = '';
					var withdraw_fee = fee = 0;
					if(withdraw_amount > 0)
					{
						if(withdraw_admin_fee > 0)
						{
							if (typeof to_wallet_account_change == "undefined" || to_wallet_account_change == null)
							{
								fee = withdraw_admin_fee;
							}
							else
							{
								fee = Number(withdraw_admin_fee) / 100;
								fee = Number(fee) * Number(withdraw_amount);
								if(fee < 0.000001) fee = 0.000001;
								fee = fee.toFixed(total_decimal);
							}
						}
						if(Number(withdraw_amount) <= Number(fee))
						{
							if(from_wallet_account_change == 1 && to_wallet_account_change == 2)
							{
								$('#total_deducted').html("0.00000000");
								$('#show_error_msg').html("");
							}
							else
							{
								$('#total_deducted').html("0.00000000");
								$('#show_error_msg').html("Transfer amount should be greater than the transfer fee");
							}
						}
						else
						{
							$('#show_error_msg').html('');
							if(from_wallet_account_change == 1 && to_wallet_account_change == 2)
							{
								total = parseFloat(withdraw_amount);
							}
							else
							{
								total = parseFloat(withdraw_amount) - parseFloat(fee);
							}
							if(isNaN(total))
							{
								$('#total_deducted').html("0.00000000");
							}
							else
							{
								total = convert(getFixedValue(total, total_decimal));
								$('#total_deducted').html(total);
							}
						}
					}
					else
					{
						$('#show_error_msg').html('');
						$('#total_deducted').html("0.00000000");
					}
				}
			}
		}
		else
		{
			$('#withdraw_amount').val("0.000000");
		}
	}
	else
	{
		$('#withdraw_amount').val("0.000000");
	}
}

// Cash Balance Buy/Sell
function crypto_selected(currency)
{
	var coinOneBalance = $('#cryptoBalance_'+currency).text();
	var coinOneImg = $('#cryptoImg_'+currency).attr('src');
	var coinOnetype = $('#type').val();
	var coinTwotype = $('#sell_type').val();

	var cointwoTokenName = $.trim($('#buy_coinfiat').text());

	if(coinOneBalance != '' && currency != '')
	{
		var coin_one_balance = $.trim(coinOneBalance);
		var coin_one_token = $.trim(currency);

		var change_url = $("#change_crypto_url").val();
		event.preventDefault();
		
		$.ajax({
			type: "get",
			url : change_url,
			data: { 
				'coin_one_token' : currency,
				'coin_two_token' : cointwoTokenName,
			},
			dataType: "json",
			beforeSend: function(){
				$("#errorMsg").html('');
				$('#infoMsg').html('');
			},
			success: function(data){
				if(data.status == 'success')
				{
					var res = data.resultData;

					$('#cryptos').modal('hide');

					//... Buy Orders ...//
					$('#buy_balanceWallet').html('<span class="ba">Balance</span>: '+parseFloat(coin_one_balance).toFixed(2)+' '+coin_one_token);
					$('#buy_coinOne').html(coin_one_token);
					$('#buy_img').attr("src",coinOneImg);
					// $('#buy_livePrice').val(res.live_price);
					$('#currentPrice').val(res.live_price);
					$('.buy_coinOne').val(coin_one_token);

					$('#buy_balanceWalletfiat').html('<span class="ba">Balance</span>: '+parseFloat(res.balance).toFixed(2)+' '+res.cointwo);
					$('#buy_coinfiat').html(res.cointwo);
					$('#buy_imgfiat').attr("src",res.cointwoImg);
					$('.buy_coinfiat').val(res.cointwo);

					$('#confirm_buy_crypto').html(coinOnetype+' '+coin_one_token);
					$('#cointwo_amount').val("");
					$('#currentPrice').html('0.000000 '+'<span class="t-gray">'+coin_one_token+'</span>');
					$('#buyTradefee').html(res.buy_fee+'<span class="t-gray"> % of '+coin_one_token+'</span>');
					$('.buyTradefee').val(res.buy_fee);

					//... Sell Orders ...//
					$('#sell_balanceWallet').html('<span class="ba">Balance</span>: '+parseFloat(coin_one_balance).toFixed(2)+' '+coin_one_token);
					$('#sell_coinOne').html(coin_one_token);
					$('#sell_img').attr("src",coinOneImg);
					// $('#buy_livePrice').val(res.live_price);
					$('#sell_currentPrice').val(res.live_price);
					$('.sell_coinOne').val(coin_one_token);

					$('#sell_balanceWalletfiat').html('<span class="ba">Balance</span>: '+parseFloat(res.balance).toFixed(2)+' '+res.cointwo);
					$('#sell_coinfiat').html(res.cointwo);
					$('#sell_imgfiat').attr("src",res.cointwoImg);
					$('.sell_coinfiat').val(res.cointwo);

					$('#confirm_sell_crypto').html(coinTwotype+' '+coin_one_token);
					$('#cointwo_amount').val("");
					$('#sell_currentPrice').html('0.000000 '+'<span class="t-gray">'+coin_one_token+'</span>');
					$('#sellTradefee').html(res.sell_fee+'<span class="t-gray"> % of '+coin_one_token+'</span>');
					$('.sellTradefee').val(res.sell_fee);

					var fiatDatas = data.fiat_responses;
					var token_bal = data.balances;

					$('#fiatDetails').empty('');

					$.each(fiatDatas, function( index, value ) 
					{
			        	// var img_url = 'https://localhost/Bluuchip/public/userpanel/images/color/'+value['cointwo'].toLowerCase()+'.svg';

			        	// var chg_fiat_url = 'http://localhost/Bluuchip/public/cashBalanceChangeFiat';

						var img_url = APP_URL+'/userpanel/images/color/'+value['cointwo'].toLowerCase()+'.svg';

						var chg_fiat_url = APP_URL+'/cashBalanceChangeFiat';

						var avail = 0.00000000;

						if(token_bal[value['cointwo']]['balances'] != '')
						{
							avail = token_bal[value['cointwo']]['balances'];
						}

						var coinTwoName = '';
						if(token_bal[value['cointwo']]['name'] != '')
						{
							coinTwoName = token_bal[value['cointwo']]['name'];
						}
						else
						{
							coinTwoName = res.cointwo;
						}

						html = '<tr onclick="fiat_selected('+"'"+value['cointwo']+"'"+')"><td id="coinTwo_'+value['cointwo']+'"><img id="fiatImg_'+value['cointwo']+'" src="'+img_url+'" class="coinicon">'+value['cointwo'].toUpperCase()+'<br><span class="t-gray">'+coinTwoName+'</span></td>';
						html += '<td class="text-end" id="fiatBalance_'+value['cointwo']+'"><span>'+parseFloat(avail).toFixed(8)+'</span><input type="hidden" id="change_fiat_url" value="'+chg_fiat_url+'"></td>';

						$('#fiatDetails').append(html);
					});
				}
			}
		});
		return false;	
	}
}

function fiat_selected(currency)
{
	var coinTwoBalance = $('#fiatBalance_'+currency).text();
	var coinTwoImg = $('#fiatImg_'+currency).attr('src');

	var coinTwotype = $('#type').val();

	var coinoneTokenName = $.trim($('#buy_coinOne').text());

	if(coinTwoBalance != '' && currency != '')
	{
		var coin_two_balance = $.trim(coinTwoBalance);
		var coin_two_token = $.trim(currency);

		var change_url = $("#change_fiat_url").val();
		event.preventDefault();
		
		$.ajax({
			type: "get",
			url : change_url,
			data: { 
				'coin_two_token' : currency,
				'coin_one_token' : coinoneTokenName,
			},
			dataType: "json",
			beforeSend: function(){
				$("#errorMsg").html('');
				$('#infoMsg').html('');
			},
			success: function(data){
				if(data.status == 'success')
				{
					var res = data.resultData;

					$('#currency').modal('hide');

					//... Buy Orders ...//
					$('#buy_balanceWallet').html('<span class="ba">Balance</span>: '+parseFloat(res.balance).toFixed(2)+' '+res.coinone);
					$('#buy_coinOne').html(res.coinone);
					$('#buy_img').attr("src",res.coinoneImg);
					// $('#buy_livePrice').val(res.live_price);
					$('#currentPrice').val(res.live_price);
					$('.buy_coinOne').val(res.coinone);

					$('#buy_balanceWalletfiat').html('<span class="ba">Balance</span>: '+parseFloat(coin_two_balance).toFixed(2)+' '+coin_two_token);
					$('#buy_coinfiat').html(coin_two_token);
					$('#buy_imgfiat').attr("src",coinTwoImg);
					$('.buy_coinfiat').val(coin_two_token);

					$('#confirm_buy_crypto').html(res.coinone+' '+coinTwotype);
					$('#cointwo_amount').val("");
					$('#currentPrice').html('0.000000 '+'<span class="t-gray">'+res.coinone+'</span>');
					$('#buyTradefee').html(res.buy_fee+'<span class="t-gray"> % of '+res.coinone+'</span>');
					$('.buyTradefee').val(res.buy_fee);

					//... Sell Orders ...//
					$('#sell_balanceWallet').html('<span class="ba">Balance</span>: '+parseFloat(res.balance).toFixed(2)+' '+res.coinone);
					$('#sell_coinOne').html(res.coinone);
					$('#sell_img').attr("src",res.coinoneImg);
					// $('#sell_livePrice').val(res.live_price);
					$('#sell_currentPrice').val(res.live_price);
					$('.sell_coinOne').val(res.coinone);

					$('#sell_balanceWalletfiat').html('<span class="ba">Balance</span>: '+parseFloat(coin_two_balance).toFixed(2)+' '+coin_two_token);
					$('#sell_coinfiat').html(coin_two_token);
					$('#sell_imgfiat').attr("src",coinTwoImg);
					$('.sell_coinfiat').val(coin_two_token);

					$('#confirm_sell_crypto').html(res.coinone+' '+coinTwotype);
					$('#cointwo_amount').val("");
					$('#sell_currentPrice').html('0.000000 '+'<span class="t-gray">'+res.coinone+'</span>');
					$('#sellTradefee').html(res.sell_fee+'<span class="t-gray"> % of '+res.coinone+'</span>');
					$('.sellTradefee').val(res.sell_fee);


					var cryptoDatas = data.crypto_responses;
					var crypto_token_bal = data.balances;

					$('#cryptoDetails').empty('');

					$.each(cryptoDatas, function( index, value ) 
					{
			        	// var img_url = 'https://localhost/Bluuchip/public/userpanel/images/color/'+value['coinone'].toLowerCase()+'.svg';

			        	// var chg_crypto_url = 'http://localhost/Bluuchip/public/cashBalanceChangeCrypto';

						var img_url = APP_URL+'/userpanel/images/color/'+value['coinone'].toLowerCase()+'.svg';

						var chg_crypto_url = APP_URL+'/cashBalanceChangeCrypto';

						var avail = 0.00000000;

						if(crypto_token_bal[value['coinone']]['balances'] != '')
						{
							avail = crypto_token_bal[value['coinone']]['balances'];
						}

						var coinOneName = '';
						if(crypto_token_bal[value['coinone']]['name'] != '')
						{
							coinOneName = crypto_token_bal[value['coinone']]['name'];
						}
						else
						{
							coinOneName = res.coinone;
						}

						html = '<tr onclick="crypto_selected('+"'"+value['coinone']+"'"+')"><td id="coinOne_'+value['coinone']+'"><img id="cryptoImg_'+value['coinone']+'" src="'+img_url+'" class="coinicon">'+value['coinone'].toUpperCase()+'<br><span class="t-gray">'+coinOneName+'</span></td>';
						html += '<td class="text-end" id="cryptoBalance_'+value['coinone']+'"><span>'+parseFloat(avail).toFixed(8)+'</span><input type="hidden" id="change_crypto_url" value="'+chg_crypto_url+'"></td>';

						$('#cryptoDetails').append(html);
					});
				}
			}
		});
		return false;	
	}
}

//******* Buy Orders ********//
//calculate total value
$('#cointwo_amount').on('keyup', function(){
	var type = $('#type').val();
	var formData = $('#buyForm').serialize();
	var data_url = $('#data_url').val();
	$.ajax({
		type: "post",
		url: data_url,
		data: formData,
		dataType: "json",
		success: function(data){
			if(data.status == 'success')
			{
				$('#confirm_buy_crypto').attr('disabled', false);
				$('#errorMsg').html("");
				// $('#buy_coin').html(data.msg);
				// $('#currentPrice').html(data.total_received+' <span class="t-gray">'+data.coin_one+'</span>');
				$('#currentPrice').val(data.total_received);
			}
			else
			{
				$('#confirm_buy_crypto').attr('disabled', true);
				// $('#buy_coin').html("0.00000000");
				// $('#currentPrice').html('0.000000 '+'<span class="t-gray">'+data.coin_one+'</span>');
				$('#errorMsg').html(data.msg);
			}
		}
	});
	return false;
});

$('#confirm_buy_crypto').on('click', function()
{
	$('#confirm_buy_crypto').attr('disabled', true);
	var data_url = $('#get_url').val();
	var formData = $('#buyForm').serialize();
	var confirm_url = $('#confirm_buy_url').val();

	$.ajax({
		type: "post",
		url: data_url,
		dataType: "json",
		data: formData,
		success: function(data){
			if(data.status == 'success')
			{
				// $('.confirm_currency_amount').html(data.total_received);

				window.location.href = confirm_url;

				/* $('#errorMsg').html("");
				$('#confirm_cointwo_amount').val(data.total_invest);
				$('.confirm_fiat_currency_amount').html(data.total_invest);
				$('.confirm_currency_amount').html(data.total_received);

				$('.coinOne').val(data.coin_one);
				$('.coinTwo').val(data.coin_two);

				$('#confirm_buy_crypto').attr('disabled', false);*/
			}
			else
			{
				// $('#confirm_buy_crypto').attr('disabled', false);
				$('#errorMsg').html(data.msg);
			}
		}
	});
	return false;
});

$('#confirmTrade').on('click', function(){
	$('#confirm_buy_crypto_account').html('<div class="alert alert-info"><i class="fa fa-info-circle"></i> Processing on...Please wait...</div>');
	var current_url = $('#current_url').val();
	var data_url = $('#get_confirm_url').val();
	var formData = $('#confirm_buy_trade_form').serialize();
	$.ajax({
		type: "post",
		url: data_url,
		dataType: "json",
		data: formData,
		success: function(data){
			if(data.status == 'success')
			{
				$('#confirm_buy_crypto_account').hide();
				$("#tradeMessage").html('<div class="alert alert-success alert-dismissible fade show" role="alert"><button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>'+data.msg+'</div>');
				
				window.setTimeout(function() {
					$(".alert").fadeTo(1000, 0).slideUp(1000, function(){
						$(this).remove(); 
					});
				}, 3000);

				setInterval(function(){
					window.location.href=current_url;
				}, 5000);
			}
			else
			{
				$('#confirm_buy_crypto_account').show();
				$("#tradeMessage").html('<div class="alert alert-danger alert-dismissible fade show" role="alert"><button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>'+data.msg+'</div>');
			}
		}
	});
	return false;
});


//******* Sell Orders ********//
$('#coinone_amount').on('keyup', function(){
	var type = $('#sell_type').val();
	var formData = $('#sellForm').serialize();
	var data_url = $('#data_url').val();

	$.ajax({
		type: "post",
		url: data_url,
		data: formData,
		dataType: "json",
		success: function(data){
			if(data.status == 'success')
			{
				$('#confirm_sell_crypto').attr('disabled', false);
				$('#errorSellMsg').html("");
				// $('#sell_coin').html(data.msg);
				// $('#sell_currentPrice').html(data.total_received+' <span class="t-gray">'+data.coin_one+'</span>');
				$('#sell_currentPrice').val(data.total_received);
			}
			else
			{
				$('#confirm_sell_crypto').attr('disabled', true);
				// $('#sell_coin').html("0.00");
				// $('#sell_currentPrice').html('0.000000 '+'<span class="t-gray">'+data.coin_one+'</span>');
				$('#errorSellMsg').html(data.msg);
			}
		}
	});
	return false;
});

$('#sellOrder').on('click', function(){
	var selected_coin = $('#sell_coinOne').html();
	selected_coin = $.trim(selected_coin);

	$('#confirm_sell_crypto').html('SELL '+selected_coin);

	$('#headerType').html('SELL Crypto with Cash Balance');
});

$('#confirm_sell_crypto').on('click', function()
{
	$('#confirm_sell_crypto').attr('disabled', true);
	var data_url = $('#get_url').val();
	var formData = $('#sellForm').serialize();
	var confirm_url = $('#confirm_sell_url').val();

	$.ajax({
		type: "post",
		url: data_url,
		dataType: "json",
		data: formData,
		success: function(data){
			if(data.status == 'success')
			{
				// $('.confirm_currency_amount').html(data.total_received);

				window.location.href = confirm_url;

				/* $('#errorMsg').html("");
				$('#confirm_cointwo_amount').val(data.total_invest);
				$('.confirm_fiat_currency_amount').html(data.total_invest);
				$('.confirm_currency_amount').html(data.total_received);

				$('.coinOne').val(data.coin_one);
				$('.coinTwo').val(data.coin_two);

				$('#confirm_buy_crypto').attr('disabled', false);*/
			}
			else
			{
				// $('#confirm_buy_crypto').attr('disabled', false);
				$('#errorSellMsg').html(data.msg);
			}
		}
	});
	return false;
});

$('#confirmSellTrade').on('click', function(){
	$('#confirm_sell_crypto_account').html('<div class="alert alert-info"><i class="fa fa-info-circle"></i> Processing on...Please wait...</div>');
	var current_url = $('#current_url').val();
	var data_url = $('#get_confirm_url').val();
	var formData = $('#confirm_sell_trade_form').serialize();

	$.ajax({
		type: "post",
		url: data_url,
		dataType: "json",
		data: formData,
		success: function(data){
			if(data.status == 'success')
			{
				$('#confirm_sell_crypto_account').hide();
				$("#tradeMessage").html('<div class="alert alert-success alert-dismissible fade show" role="alert"><button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>'+data.msg+'</div>');
				
				window.setTimeout(function() {
					$(".alert").fadeTo(1000, 0).slideUp(1000, function(){
						$(this).remove(); 
					});
				}, 3000);

				setInterval(function(){
					window.location.href=current_url;
				}, 5000);
			}
			else
			{
				$('#confirm_sell_crypto_account').show();
				$("#tradeMessage").html('<div class="alert alert-danger alert-dismissible fade show" role="alert"><button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>'+data.msg+'</div>');
			}
		}
	});
	return false;
});

$(".download_QR").on("click", function () 
{
	var imagePath = $(this).attr("href");

    // console.log('aaaaaaaaaaa '+imagePath);

	var fileName = "Dummy_image.png";
    saveAs(imagePath, fileName); // This is a function please download the file from the link
    //Download file from this link  
    // https://raw.githubusercontent.com/eligrey/FileSaver.js/master/dist/FileSaver.js
});

$(".download_QR").on("click", function () 
{
	var imagePath = $(this).attr("href");

    // console.log('aaaaaaaaaaa '+imagePath);

	var fileName = "Dummy_image.png";
    saveAs(imagePath, fileName); // This is a function please download the file from the link
    //Download file from this link  
    // https://raw.githubusercontent.com/eligrey/FileSaver.js/master/dist/FileSaver.js
});

$(document).ready(function() {
	$(".swapingPosition#swapModes").click(function () {
		var bigHtml = $('div#buyplace').html();
		var smallHtml = $('div#paywithplace').html();

		$('div#buyplace').html(smallHtml);
		$('div#paywithplace').html(bigHtml);

		var th = $(this);
		$(th).hide().fadeIn(200);
	});

	$(".sellSwapingPosition#sellSwapModes").click(function () {
		var bigSellHtml = $('div#sellplace').html();
		var smallSellHtml = $('div#sellpaywithplace').html();

		$('div#sellplace').html(smallSellHtml);
		$('div#sellpaywithplace').html(bigSellHtml);

		var th = $(this);
		$(th).hide().fadeIn(200);
	});
});
