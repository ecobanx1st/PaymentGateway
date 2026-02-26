@include('inc.home-header')
</section>
<div class="inner-header">
	<script src="https://cdnjs.cloudflare.com/ajax/libs/simplebar/2.6.1/simplebar.js"></script>
	@include('inc.menu')
</div>
</header>

<article class="inner-banner">
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
				<hr class="x-linef">
				<br/>
				<div class="form-container">
					<br>

					<form action='{{ url("/updateinvoice") }}' method='POST' autocomplete="off" enctype='multipart/form-data'>
						{{ csrf_field() }}
						<div class="table-responsive" data-simplebar>
							<table class="table table-small-font no-mb table-borderded createtablebg">
								<tbody>
									<tr>
										<td>Invoice No:</td>
										<td>
											<input name="id" type="hidden" class="form-control" value="{{ $category->id }}" required="required" />
											<input name="invoiceId" type="text" class="form-control" value="{{ $category->invoice_id }}" required="required" />
											@if ($errors->has('invoiceId'))
											<span class="help-block">
												<strong class="text text-danger">{{ $errors->first('invoiceId') }}</strong>
											</span>
											@endif
										</td>
										<td>Business Details:</td>
										<td>
											<textarea name="companydetails" class="form-control" required="required">{!! $category->companydetails !!}</textarea>
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
											<input name="customername" class="form-control" value="{{ $category->customername }}" required="required" />
											@if ($errors->has('customername'))
											<span class="help-block">
												<strong class="text text-danger">{{ $errors->first('customername') }}</strong>
											</span>
											@endif
										</td>
										<td>Customer Email:</td>
										<td>
											<input name="customeremail" class="form-control" value="{{ $category->customeremail }}" required="required" />
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
											<textarea name="billaddress" class="form-control" required="required">{!! $category->billaddress !!}</textarea>
											@if ($errors->has('billaddress'))
											<span class="help-block">
												<strong class="text text-danger">{{ $errors->first('billaddress') }}</strong>
											</span>
											@endif
										</td>
										<td>Shipping Address:</td>
										<td>
											<textarea name="shippingaddress" class="form-control" required="required">{!! $category->shippingaddress !!}</textarea>
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
												<option @if($category->coin == 'USD') selected @endif value="USD">USD</option>
												<option @if($category->coin == 'NGN') selected @endif value="NGN">NGN</option>
												<option @if($category->coin == 'BTC') selected @endif value="BTC">BTC</option>
												<option @if($category->coin == 'DASH') selected @endif value="DASH">DASH</option>
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
												<option @if($category->cointwo == 'BTC') selected @endif value="BTC">BTC</option>
												<option @if($category->cointwo == 'DASH') selected @endif value="DASH">DASH</option>
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
									<tr style="padding:10px 10px;background: #1548d8;">
										<td colspan="5" style="padding:5px 10px;color: #fff;font-size:14px;font-weight:600;line-height: 22px;">Item Description : </td>
									</tr>
									<tr>
										<td>Item Number</td>
										<td>Item Name</td>
										<td>Quantity</td>
										<td>Price Per item (<span class="bracket">{{ $category->coin }}</span>)</td>
										<td>Shipping (<span class="bracket">{{ $category->coin }}</span>)</td>
										<!-- <td>Action</td> -->
									</tr>	
								</thead>
								<tbody align="center">
									@forelse($subcategory as $key => $value)
									<tr>
										<input type="hidden" required="required" value="{{$value->id}}" name="itemid[]">
										<td><input type="text" required="required" value="{{$value->itemno}}" name="itemno[]"></td>
										<td><input type="text" required="required" value="{{$value->itemname}}" name="itemname[]"></td>
										<td><input type="number" required="required" value="{{$value->quantity}}" onkeyup="calc();" class="numeric" name="quantity[]"></td>
										<td><input type="number" required="required" value="{{$value->priceperitem}}" onkeyup="calc();" class="numeric" name="priceperitem[]"></td>
										<td><input type="number" required="required" value="{{$value->shipping}}" onkeyup="calc();" class="numeric" name="shipping[]"></td>
										<!-- <td><a class="text-danger" href="{{ url('/deleteitem/'.\Hashids::encode($value->id)) }}" data-toggle="tooltip" title="Delete Invoice"><i class="fa fa-trash" aria-hidden="true"></i></a></td> -->
									</tr>
									@empty
									@endforelse
								</tbody>
							</table>
						</div>

						<div class="tableinvbtn">
							<div class="btnbox pull-right">
								<button type="button" class="btn btn-success" onclick="addRows();">Add Item</button>
							</div>	
						</div>

						<div class="table-responsive" data-simplebar>
							<table class="table table-small-font no-mb table-borderded createtablebg">
								<tr>
									<td>Sub Total:</td>
									<td>
										<div class="input-group"> 
											<input type="text" name="subtotal" id='subtotal' class="form-control" readonly="readonly" onkeyup="calc();" value="{{ $category->subtotal }}" required="required">
											<span class="input-group-addon beautiful"> {{ $category->coin }}</span>
										</div>
										@if ($errors->has('subtotal'))
										<span class="help-block">
											<strong class="text text-danger">{{ $errors->first('subtotal') }}</strong>
										</span>
										@endif
									</td>
									<td>VAT :</td>
									<td>
										<div class="input-group"> 
											<input type="text" name="tax" value="{{ $category->tax }}" class="form-control" id="tax" onkeyup="calc();" required="required">
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
											<input type="text" name="taxamt" value="{{ $category->taxamt }}" readonly="readonly" class="form-control" id="taxamt" onkeyup="calc();" required="required">
											<span class="input-group-addon beautiful">{{ $category->coin }}</span>
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
											<input type="text" readonly="readonly" name="total" id="total" value="{{ $category->total }}" class="form-control" required="required">
											<span class="input-group-addon beautiful"> {{ $category->coin }}</span>
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
											<input type="text" name="checkamount" id="checkamount" value="{{ $category->checkamount }}" class="form-control" readonly="readonly" required="required">
											<span class="input-group-addon beautiful">{{ $category->coin }}</span>
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
											<input type="text" name="payment_checkamt" id="payment_checkamt" value="{{ $category->payment_checkamt }}" class="form-control" readonly="readonly" required="required">
											<span class="input-group-addon beautiful" id="currency2">{{ $category->coin }}</span>
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
									<td>

										<div class="">
											<div class="form-group kycupload {{ $errors->has('logo_upload') ? ' has-error' : '' }}">
												<label for="file-upload2" class="custom-file-upload customupload">
													<i class="fa fa-cloud-upload"></i> Upload New File</label>
													<img id="doc2" class="img-responsive proofig">
													@if($category->logo)
													<img width="150px" src="{{url('public/storage/invoice/'.$category->logo)}}">
													@endif
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
										<td></td>
									</tr>
								</tbody>
							</table>
							<div align="center">
								<button class="btn btn-success" >Save</button>
							</div>
							<br>
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
@include('inc.home-footer')
@include('inc.customscript')
<script type="text/javascript">

	function addRows(){
		$('#myTable').append('<tr><td><input type="text" name="itemno[]"></td><td><input type="text" name="itemname[]"></td><td><input type="number" name="quantity[]" onkeyup="calc();"></td><td><input type="number" name="priceperitem[]" onkeyup="calc();"></td><td><input type="number" name="shipping[]" onkeyup="calc();"></td></tr>');
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
		} else { 
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
		} else {
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
</script>


<script>

  $(document).ready(function(){

   $('.extras').click(function(){

    $('.profile-list').toggleClass('showing')

  });

   $('.more-menu-bottom').click(function(){

    $('.extra-menu-mobile').toggleClass('showall-extramenus')

  })

 })
  
</script>

</body>
</html>