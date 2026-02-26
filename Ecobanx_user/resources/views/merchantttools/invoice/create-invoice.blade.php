@php $title = "Button Maker"; $atitle ="merchant";
@endphp
@include('layouts.headercss')
</section>
</header>

<section class="Dashboard-page">
	<div class="container-fluid">
		<div class="row">

			@include('layouts.menu')


			<div class="col-lg-10 col-xl-10 col-md-12 col-sm-12 col-xs-12">

				<div class="header-part-outer">

					<div class="common-header-style title-outer">
						<div class="row">

							<div class="col-lg-6 col-xl-6 col-md-6 col-sm-6 col-xs-6">
								<div class="logo-payment"><a href="dashboard.html"><img src="img/logo.png" alt="logo"></a></div>
							</div>

							<div class="col-lg-6 col-xl-6 col-md-6 col-sm-6 col-xs-6">
								<div class="notify-part">
									<div class="notify"><img src="img/Notification.png"></div>
									<div class="message"><img src="img/message.png"></div>
								</div>
							</div>

						</div>
					</div>

					<div class="head-title-part">
						<h1>Invoice Maker Form</h1>
					</div>

				</div>
<article class="inner-banner invoice-maker">
<section class="loginbg inner-banner-ht buttonmaker invoicecreatebg">
<div class="container">
<div class="col-md-12 col-sm-12 col-xs-12 center-content securitybox">
@if(session()->has('success'))
<div class="alert alert-success" role="alert">
<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button><strong>Success!</strong> {{ session()->get('success') }}
</div>
@endif
@if(session()->has('error'))
<div class="alert alert-danger" role="alert">
<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button><strong>Failed!</strong> {{ session()->get('error') }}
</div>
@endif
<h3 class="text-center fnt-bld inner-heading">INVOICE</h3>
<div class="form-container">
<br>
<form action='{{ url("/invoice-maker-submit") }}' autocomplete="off" method='POST' id="invoiceform" enctype='multipart/form-data'>
{{ csrf_field() }}
<div class="table-responsive list" data-simplebar>
<table class="table table-small-font no-mb table-borderded createtablebg">
<tbody>
<tr>
<td>Invoice No:</td>
<td>
<input name="invoiceId" class="form-control" required="required" />
@if ($errors->has('invoiceId'))
<span class="help-block">
<strong class="text text-danger">{{ $errors->first('invoiceId') }}</strong>
</span>
@endif
</td>
<td>Business Name:</td>
<td>
<textarea name="companydetails" class="form-control" required="required"></textarea>
@if ($errors->has('companydetails'))
<span class="help-block">
<strong class="text text-danger">{{ $errors->first('companydetails') }}</strong>
</span>
@endif
</td>
</tr>
<tr>
<td>Customer Name:</td>
<td>
<input name="customername" class="form-control" required="required" />
@if ($errors->has('customername'))
<span class="help-block">
<strong class="text text-danger">{{ $errors->first('customername') }}</strong>
</span>
@endif
</td>
<td>Customer Email:</td>
<td>
<input name="customeremail" class="form-control" required="required" />
@if ($errors->has('customeremail'))
<span class="help-block">
<strong class="text text-danger">{{ $errors->first('customeremail') }}</strong>
</span>
@endif
</td>
</tr>
<tr>
<td>Billing Address:</td>
<td>
<textarea name="billaddress" class="form-control" required="required"></textarea>
@if ($errors->has('billaddress'))
<span class="help-block">
<strong class="text text-danger">{{ $errors->first('billaddress') }}</strong>
</span>
@endif
</td>
<td>Shipping Address:</td>
<td>
<textarea name="shippingaddress" class="form-control" required="required"></textarea>
@if ($errors->has('shippingaddress'))
<span class="help-block">
<strong class="text text-danger">{{ $errors->first('shippingaddress') }}</strong>
</span>
@endif
</td>
</tr>
<tr>
<td>Input Currency:</td>
<td>
<select name="coin" id="coin" onchange="calc();" class="form-control" required="required">
<option value="USD">USD</option>
<option value="EUR">EUR</option>
</select>
@if ($errors->has('coin'))
<span class="help-block">
<strong class="text text-danger">{{ $errors->first('coin') }}</strong>
</span>
@endif
</td>
<td>Payment Coin:</td>
<td>
<select name="cointwo" id="cointwo" onchange="calc();" class="form-control" required="required">
	@forelse($comDetails as $key => $val)
   <option value="{{$val->source}}">{{$val->source}}</option>
  @empty
  @endforelse
</select>
@if ($errors->has('cointwo'))
<span class="help-block">
<strong class="text text-danger">{{ $errors->first('cointwo') }}</strong>
</span>
@endif
</td>
</tr>
</tbody>
</table>
</div>

<div class="table-responsive" data-simplebar>
<table class="table table-small-font no-mb table-borderded innertablecreate" id="myTable">
<thead align="center">
<tr style="padding:10px 10px;background: #052788;">
<td colspan="5" style="padding:5px 10px;color: #fff;font-size:14px;font-weight:600;line-height: 22px;">Item Description : </td>
</tr>
<tr>
<td>Item Number</td>
<td>Item Name</td>
<td>Quantity</td>
<td>Price Per item (<span class="bracket"></span>)</td>
<td>Shipping (<span class="bracket"></span>)</td>
</tr>	
</thead>
<tbody align="center">
<tr>
<td><input type="text" required="required" name="itemno[]"></td>
<td><input type="text" required="required" name="itemname[]"></td>
<td><input type="number" required="required" onkeyup="calc();" class="numeric" name="quantity[]"></td>
<td><input type="number" required="required" onkeyup="calc();" class="numeric" name="priceperitem[]"></td>
<td><input type="number" required="required" onkeyup="calc();" class="numeric" name="shipping[]"></td>
</tr>
</tbody>
</table>
</div>

<div class="tableinvbtn">
	<div class="btnbox pull-right">
		<button type="button" class="btn btn-primary" onclick="addRows();">Add Item</button>
	</div>	
</div>	

<div class="table-responsive" data-simplebar>
<table class="table table-small-font no-mb table-borderded createtablebg">
<tr>
<td>Sub Total:</td>
<td>
<div class="input-group"> 
<input type="text" name="subtotal" id='subtotal' class="form-control" readonly="readonly" onkeyup="calc();" class="form-control" required="required">
<span class="input-group-addon beautiful"></span>
</div>
@if ($errors->has('subtotal'))
<span class="help-block">
<strong class="text text-danger">{{ $errors->first('subtotal') }}</strong>
</span>
@endif
</td>
<td>VAT:</td>
<td>
<div class="input-group"> 
<input type="text" name="tax" class="form-control" id='tax' class="form-control" onkeyup="calc();" required="required">
<span class="input-group-addon">%</span>
</div>
@if ($errors->has('tax'))
<span class="help-block">
<strong class="text text-danger">{{ $errors->first('tax') }}</strong>
</span>
@endif
</td>
</tr>
<tr>
<td>VAT Amount:</td>
<td>
<div class="input-group"> 
<input type="text" name="taxamt" readonly="readonly" class="form-control" id="taxamt" onkeyup="calc();" required="required">
<span class="input-group-addon beautiful"></span>
</div>
@if ($errors->has('taxamt'))
<span class="help-block">
<strong class="text text-danger">{{ $errors->first('taxamt') }}</strong>
</span>
@endif
</td>
<td>Total:</td>
<td>
<div class="input-group"> 
<input type="text" readonly="readonly" name="total" id="total" class="form-control" required="required">
<span class="input-group-addon beautiful"></span>
</div>
@if ($errors->has('total'))
<span class="help-block">
<strong class="text text-danger">{{ $errors->first('total') }}</strong>
</span>
@endif
</td>
</tr>

<tr>
<td>Amount in Input Coin:</td>
<td>
<div class="input-group"> 
<input type="text" name="checkamount" id="checkamount" class="form-control" readonly="readonly" required="required">
<span class="input-group-addon beautiful"></span>
</div>
@if ($errors->has('checkamount'))
<span class="help-block">
<strong class="text text-danger">{{ $errors->first('checkamount') }}</strong>
</span>
@endif
</td>
<td>Amount in Payment Coin:</td>
<td>
<div class="input-group"> 
<input type="text" name="payment_checkamt" id="payment_checkamt" class="form-control" readonly="readonly" required="required">
<span class="input-group-addon beautiful" id="currency2"></span>
</div>
@if ($errors->has('payment_checkamt'))
<span class="help-block">
<strong class="text text-danger">{{ $errors->first('payment_checkamt') }}</strong>
</span>
@endif
</td>
</tr>
<tr>
<td>Business Logo:</td>
<td >
<div class="">
<div class="form-group kycupload {{ $errors->has('logo_upload') ? ' has-error' : '' }}">
<label for="file-upload2" class="custom-file-upload customupload">
<i class="fa fa-cloud-upload"></i> Upload File </label>
<img id="doc2" class="img-responsive proofig">
<input id="file-upload2" name="logo_upload" type="file" style="display:none;">
@if ($errors->has('logo_upload'))
<span class="help-block">
<strong>{{ $errors->first('logo_upload') }}</strong>
</span>
@endif
<label id="file-name2" class="customupload1"></label>
</div>
</div>
</td>
</tr>
</tbody>
</table>
</div>
<div align="center" class="save-btn">
<input type="submit" id="btnsave" value="Save" class="btn btn-success">
</div>
</form>
</div>
</div>
</div>
<div class="center-btn text-center">
<br>
<a href="{{ url('/view-invoice') }}" class="btn btn-warning"><i class="fa fa-arrow-left"></i> Back to Invoice</a><br />
</div>		
</section>
</article>
<script type="text/javascript">
function addRows(){
$('#myTable').append('<tr><td><input type="text" name="itemno[]"></td><td><input type="text" name="itemname[]"></td><td><input type="text" name="quantity[]"></td><td><input type="text" name="priceperitem[]"></td><td><input type="text" name="shipping[]"></td></tr>');
}


$("#file-upload2").change(function() {
$("#file-name2").text(this.files[0].name);
readURL2(this);
});

function readURL2(input) {
if (input.files && input.files[0]) {
var reader = new FileReader();
reader.onload = function(e) {
$('#doc2').attr('src', e.target.result);
}
reader.readAsDataURL(input.files[0]);
}
}

$("#file-upload2").change(function() {
var limit_size = 1048576;
var photo_size = this.files[0].size;
if(photo_size > limit_size){
$("#kyc_btn").attr('disabled',true);
$('#file-upload2').val('');
alert('Image Size Larger than 1MB');
}
else
{ 
$("#file-upload2").text(this.files[0].name);
$("#kyc_btn").attr('disabled',false);

var file = document.getElementById('file-upload2').value;
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
alert('Upload your proof like JPG, JPEG, PNG');
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
$('#doc2').attr('src', e.target.result);
};
reader.readAsDataURL(input.files[0]);
}
}
}

$(document).ready(function(){
calc();
});

function calc(){

var quantitysum = 0;
var shippingsum = 0;
var priceperitemsum = 0;
var subtotal = 0;

var quantity = document.getElementsByName('quantity[]');
var priceperitem = document.getElementsByName('priceperitem[]');
var shipping = document.getElementsByName('shipping[]');

for (var i = 0, iLen = quantity.length; i < iLen; i++) {
if(quantity[i].value == '') {
var quantityval = 0;
} else {
var quantityval = quantity[i].value;
}

if(priceperitem[i].value == '') {
var priceperitemval = 0;
} else {
var priceperitemval = priceperitem[i].value;
}

if(shipping[i].value == '') {
var shippingval = 0;
} else {
var shippingval = shipping[i].value;
}

shippingsum = parseInt(shippingval);
priceperitemsum = parseInt(priceperitemval);
quantitysum = parseInt(quantityval);
subtotal += (quantitysum * priceperitemsum) + shippingsum;
}

$('#subtotal').val(subtotal); 
var tax = document.getElementById('tax').value;
var coin = document.getElementById('coin').value;
var cointwo = document.getElementById('cointwo').value;

if(coin == 'BTC' || coin == 'DASH'){
	cointwo = coin;
    document.getElementById('cointwo').value = coin;
}

$('.beautiful').html(coin);
$('.bracket').html(coin);

if(tax =='') { tax = 0; } 
var per = tax / 100 ;
var taxamt = per * subtotal;
var total = subtotal + taxamt;

$('#taxamt').val(taxamt); 
$('#total').val(total); 

$('#checkamount').val(total); 

$.ajax({
type: "POST", 
url: "{{ url('checkamount') }}",
dataType: "json",
data: {'_token':'<?php echo csrf_token() ?>','coin': coin,'cointwo': cointwo ,'total' :total},
success: function(data) {
if(data.msg  == 'success') {
$('#payment_checkamt').val(data.amount); 
$('#currency2').html(data.currency);
}
}
});
}
/*function calc(){

var quantitysum = 0;
var shippingsum = 0;
var priceperitemsum = 0;
var subtotal = 0;

var quantity = document.getElementsByName('quantity[]');
var priceperitem = document.getElementsByName('priceperitem[]');
var shipping = document.getElementsByName('shipping[]');

for (var i = 0, iLen = quantity.length; i < iLen; i++) {
if(quantity[i].value == ''){
var quantityval = 0;
} else {
var quantityval = quantity[i].value;
}

if(priceperitem[i].value == ''){
var priceperitemval = 0;
} else {
var priceperitemval = priceperitem[i].value;
}

if(shipping[i].value == ''){
var shippingval = 0;
} else {
var shippingval = shipping[i].value;
}

shippingsum = parseInt(shippingval);
priceperitemsum = parseInt(priceperitemval);
quantitysum = parseInt(quantityval);
subtotal += (quantitysum * priceperitemsum) + shippingsum;
}

$('#subtotal').val(subtotal); 
var tax = document.getElementById('tax').value;
if(tax ==''){
  tax = 0;
} 
var per = tax / 100 ;
var taxamt = per * subtotal;
var total = subtotal + taxamt;

$('#taxamt').val(taxamt); 
$('#total').val(total); 
$('#checkamount').val(total); 
}*/
$( document ).ready(function() {

$('#invoiceform').submit(function() {
      $("#btnsave").val("Please Wait...").attr('disabled', 'disabled');  
});

});
</script>

</body>
</html>
