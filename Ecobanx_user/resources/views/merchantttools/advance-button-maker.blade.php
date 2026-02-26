@php $title = "Advance  Button Maker"; $atitle ="merchant";
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
						<h1>Advance  Button Maker</h1>
						<!-- <p>Instant crypto checkout with easy to use advanced buttons, invoice builder, and an API for custom integrations</p> -->
					</div>

				</div>

				<article class="inner-banner">
					<section class="loginbg inner-banner-ht buttonmaker">
						<div class="container">
							<div class="col-md-12 col-sm-12 col-xs-12 center-content securitybox">					
								<div class="form-container">
									<form action='{{ route("generateadvancebuttonmaker") }}' method='POST' enctype='multipart/form-data' id="profileForm">
										{{ csrf_field() }}
										<div class="table-responsive" data-simplebar>
											<table class="table table-small-font no-mb table-borderded">
												<thead>											
													<tr>
														<th>Item</th>
														<th>Value</th>
														<th>Required?</th>
													</tr>
												</thead>
												<tbody>
													<tr>
														<td>Merchant ID <span class="text-danger">*</span> </td>
														<td>
															<input name="merchant" value="{{ $merchant }}" class="form-control" @if($merchant !="") readonly="" @endif />
															@if ($errors->has('merchant'))
															<span class="help-block">
																<strong class="text text-danger">{{ $errors->first('merchant') }}</strong>
															</span>
															@endif

															<h5 class="frm-subtext">You can find this on your My Account page. If you were logged in it would fill this in automatically.</h5>
														</td>

														<td class="text-center">Yes</td>
													</tr>
													<tr>
														<td>Item Name <span class="text-danger">*</span></td>
														<td>
															<input name="item_name" value="{{ old('item_name') }}" class="form-control">
															@if ($errors->has('item_name'))
															<span class="help-block">
																<strong class="text text-danger">{{ $errors->first('item_name') }}</strong>
															</span>
															@endif

														</td>

														<td class="text-center">Yes</td>
													</tr>
													<input type="hidden" id="pricecalculate_url" value="{{ route('calLiveprice') }}">
													<input type="hidden" id="liveprice" value="">
              <tr>
                <td>Amount in Currency <span class="text-danger">*</span></td>
                <td class="slectinputbox ">
                  <input name="currency_amount" value="0" class="form-control allownumericwithdecimal" id="item_value" value="">
                  <span class="selectrightbox">
                    <select class="form-control" name="convert_currency" id="convert_currency">
                      <option value="EUR">EUR</option>
                      <option value="USD">USD</option>
                    </select>
                  </span>
                                  </td>
                <td style="text-align:center">Yes</td>
              </tr>
              <span id="errorSellMsg"></span>
              <tr>
                <td>Request Amount <span class="text-danger">*</span></td>
                <td class="slectinputbox ">
                  <input name="item_amount" value="0" class="form-control allownumericwithdecimal" id="item_amount" value="">
                  <span class="selectrightbox">
                    <select class="form-control" name="paymentcurrency" id="paymentcurrency">
                      @forelse($comDetails as $key => $val)
                      <option value="{{$val->source}}">{{$val->source}}</option>
                      @empty
                      @endforelse
                    </select>
                  </span>
                                  </td>
                <td style="text-align:center">Yes</td>
              </tr>
													<tr>
														<td>Item Description</td>
														<td>
															<input name="item_desc" class="form-control" value="">
															@if ($errors->has('item_desc'))
															<span class="help-block">
																<strong class="text text-danger">{{ $errors->first('item_desc') }}</strong>
															</span>
															@endif
														</td>
														<td class="text-center">No</td>
													</tr>
													<tr>
														<td>Item Number [not visible to buyer] </td>
														<td>
															<input name="item_number" value="" class="form-control">
															@if ($errors->has('item_number'))
															<span class="help-block">
																<strong class="text text-danger">{{ $errors->first('item_number') }}</strong>
															</span>
															@endif
														</td>
														<td class="text-center">No</td>
													</tr>
													<tr>
														<td>Invoice [not visible to buyer] <span class="text-danger">*</span> </td>
														<td>
															<input name="invoice" value="" class="form-control">
															@if ($errors->has('invoice'))
															<span class="help-block">
																<strong class="text text-danger">{{ $errors->first('invoice') }}</strong>
															</span>
															@endif
														</td>
														<td class="text-center">No</td>
													</tr>
													<tr>
														<td>Item Quantity </td>
														<td>
															<input name="item_quantity" value="1" class="form-control allownumericwithdecimal" id="item_quantity">
															@if ($errors->has('item_quantity'))
															<span class="help-block">
																<strong class="text text-danger">{{ $errors->first('item_quantity') }}</strong>
															</span>
															@endif
														</td>
														<td style="text-align:center">No</td>
													</tr>
													<tr>
														<td>Allow Buyer to Edit Quantity </td>
														<td class="">
															<label class="checkcont">
																<input name="update_quantity" type="checkbox"> <span class="checkmark"></span></label>
															@if ($errors->has('update_quantity'))
															<span class="help-block">
																<strong class="text text-danger">{{ $errors->first('update_quantity') }}</strong>
															</span>
															@endif
															</td>
															<td style="text-align:center">No</td>
														</tr>
														<tr>
															<td>Tax Amount</td>
															<td class="">
																<input name="tax_amount" value="0.00000000" class="form-control allownumericwithdecimal" id="tax_amount" fdprocessedid="7rq8w4">
																@if ($errors->has('tax_amount'))
																<span class="help-block">
																	<strong class="text text-danger">{{ $errors->first('tax_amount') }}</strong>
																</span>
																@endif
															</td>
															<td class="text-center">No</td>
														</tr>
														<tr>
															<td>Don't Collect Shipping Address</td>
															<td class="">
																<label class="checkcont">
																	<input name="shipping_address" type="checkbox" value="on" checked=""> <span class="checkmark"></span></label>
																	@if ($errors->has('shipping_address'))
																<span class="help-block">
																	<strong class="text text-danger">{{ $errors->first('shipping_address') }}</strong>
																</span>
																@endif
																</td>
																<td class="text-center">No</td>
															</tr>
															<tr>
																<td>Shipping Cost of 1st Item</td>
																<td class="">
																	<input name="shipping_cost" id="shipping_cost" class="form-control allownumericwithdecimal" value="0.00000000" fdprocessedid="a217wq">
																	@if ($errors->has('shipping_cost'))
																<span class="help-block">
																	<strong class="text text-danger">{{ $errors->first('shipping_cost') }}</strong>
																</span>
																@endif
																</td>
																<td class="text-center">No</td>
															</tr>
															<tr>
																<td>Shipping Cost of Additional Items</td>
																<td class="">
																	<input name="shipping_cost_additional" id="shipping_cost_additional" class="form-control allownumericwithdecimal" value="0.00000000" fdprocessedid="1x7q3">
																	@if ($errors->has('shipping_cost_additional'))
																<span class="help-block">
																	<strong class="text text-danger">{{ $errors->first('shipping_cost_additional') }}</strong>
																</span>
																@endif
																</td>
																<td class="text-center">No</td>
															</tr>
															<tr>
																<td>Success URL <span class="text-danger">*</span></td>
																<td>
																	<input name="success_url" class="form-control" value="{{ old('success_url') }}">
																	<h5 class="frm-subtext">Buyer will be prompted to continue to this URL after successful payment.</h5>
																	@if ($errors->has('success_url'))
																	<span class="help-block">
																		<strong class="text text-danger">{{ $errors->first('success_url') }}</strong>
																	</span>
																	@endif 

																</td>

																<td class="text-center">Yes</td>
															</tr>
															<tr>
																<td>Cancel URL <span class="text-danger">*</span></td>
																<td>
																	<input name="cancel_url" class="form-control" value="{{ old('cancel_url') }}">
																	<h5 class="frm-subtext">Buyer will be given this URL to return to your store instead of checking out.</h5>

																	@if ($errors->has('cancel_url'))
																	<span class="help-block">
																		<strong class="text text-danger">{{ $errors->first('cancel_url') }}</strong>
																	</span>
																	@endif 
																</td>
																<td class="text-center">Yes</td>
															</tr>
															<tr>
																<td>IPN URL</td>
																<td>
																	<input name="ipn_url" class="form-control" value="">
																	<h5 class="frm-subtext">Leave blank to use your account default.</h5>
																	@if ($errors->has('ipn_url'))
																	<span class="help-block">
																		<strong class="text text-danger">{{ $errors->first('ipn_url') }}</strong>
																	</span>
																	@endif
																</td>
																<td class="text-center">No</td>
															</tr>
															<tr>
																<td>Allow Buyer to Leave You A Note</td>
																<td class="">
																	<label class="checkcont">
																		<input name="leave_msg" type="checkbox" value="0"> <span class="checkmark"></span></label>
																		@if ($errors->has('leave_msg'))
																		<span class="help-block">
																			<strong class="text text-danger">{{ $errors->first('leave_msg') }}</strong>
																		</span>
																		@endif
																	</td>
																	<td class="text-center">No</td>
																</tr>
																<tr>
																	<td>Button Image <span class="text-danger">*</span></td>
																	<td>
																		<table>
																			<tbody>
																				<tr>
																					<td>
																						<label class="checkcont">
																							<input type="radio" name="radio" value="{{ url('img/paymentlogo.svg') }}" checked>	 <span class="checkmark"></span>
																						</label>
																					</td>

																					<td class="buttonlogo">
																						<img src="{{ url('img/paymentlogo.svg') }}">
																					</td>
																				</tr>
																				<tr>
																					<td>
																						@if ($errors->has('radio'))
																						<span class="help-block">
																							<strong class="text text-danger">{{ $errors->first('radio') }}</strong>
																						</span>
																						@endif 
																					</td>
																				</tr>
																			</tbody>
																		</table>
																	</td>

																	<td class="text-center">Yes</td>
																</tr>
																<tr>
																	<td colspan="3" align="center">
																		<button type="submit" class="btn blues-btn fnt-reg mb-20 mt-20 sitebtn">Generate Button</button>
																	</td>
																</tr>
															</tbody>
															<tfoot>
																<tr>
																	<td colspan="3">For a full list of fields and detailed information please check out the <a href="{{ route('merchanttoolssimple') }}" class="alinktext">HTML POST Fields</a> page.</td>
																</tr>
															</tfoot>
														</table>
													</div>
												</form>
											</div>
										</div>


									</div>		
								</section>
							</article>

						</div>

					</div>
				</div>
			</section>

			@if($requestparam !="")

			<div class="modal fade" id="staticBackdrop" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="false">
				<div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
					<div class="modal-content">
						<div class="modal-content">
							<div class="modal-header">
								<h4 class="modal-title">Advance  Button Maker</h4>
								<button type="button" class="btn-close" data-bs-dismiss="modal" fdprocessedid="jhervp"></button>
							</div>
							<div class="modal-body">
								<div class="row">
									<div class="col-md-6">
										<div class="input-group-append copybtnbg" onclick="myFunction()" style="cursor: pointer;">
											<span class="input-group-text btn sitebtn btn-sm" id="myTooltip"><strong><i class="fa fa-clipboard"></i> Copy Button Code</strong></span>
										</div>
									</div>
								</div><br>
								<div class="alert alert-info">
									<i class="fa fa-info-circle"></i> Copy the below code, after page refresh then you can't recover this code again!
								</div>
								<div class="buttonmakerbg">
									<div class="examplebtnbg">
										<div id="showHtmlForm">
											<textarea rows="18" class="form-control" id="myInput">
												<form action="{{ url('/makepayment') }}" method="post">
													<input type="hidden" name="cmd" value="_pay_advanced">
													<input type="hidden" name="reset" value="1">
													<input type="hidden" name="merchant" value="{{ $requestparam->merchant }}">
													<input type="hidden" name="item_name" value="{{ $requestparam->item_name }}">
													<input type="hidden" name="item_desc" value="{{ $requestparam->item_desc }}">
													<input type="hidden" name="item_number" value="{{ $requestparam->item_number }}">
													<input type="hidden" name="invoice" value="{{ $requestparam->invoice }}">
													<input type="hidden" name="quantity" value="{{$requestparam->item_quantity}}">
										          <input type="hidden" name="allow_quantity" value="{{$requestparam->update_quantity}}">
										          <input type="hidden" name="shippingf" value="{{$requestparam->shipping_cost}}">
										          <input type="hidden" name="shipping2f" value="{{$requestparam->shipping_cost_additional}}">
	          										<input type="hidden" name="buyer_to_leave_msg" value="{{$requestparam->leave_msg}}">
													<input type="hidden" name="custom" value="{{ $requestparam->custom }}">
													<input type="hidden" name="currency" value="{{ $requestparam->paymentcurrency }}">
													<input type="hidden" name="amount" value="{{ $requestparam->item_amount }}">
													<input type="hidden" name="want_shipping" value="{{ $requestparam->shipping_address == 1 ? 1:0 }}">
													<input type="hidden" name="success_url" value="{{ $requestparam->success_url }}">
													<input type="hidden" name="cancel_url" value="{{ $requestparam->cancel_url }}">
													<input type="hidden" name="ipn_url" value="{{ $requestparam->ipn_url }}">
													<input type="hidden" name="tax" value="{{ $requestparam->tax }}">
													
													<input type="image" src="{{ $requestparam->radio }}" alt="">
												</form>
											</textarea>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
			<script type="text/javascript">
				$(window).on('load', function() {
					$('#staticBackdrop').modal('show');
				});
			</script>
			@endif

			<script>
				function myFunction() {
					var copyText = document.getElementById("myInput");
					copyText.select();
					document.execCommand("copy");

					var tooltip = document.getElementById("myTooltip");
					tooltip.innerHTML = "Copied!";
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

<script type="text/javascript">
	$(document).ready(function() {
    getLivePrice();
  });
  $('#convert_currency').on('change', function(){
    getLivePrice();
  });
  $('#paymentcurrency').on('change', function(){
    getLivePrice();
  });
  $('#item_value').on('keyup', function(){    
    var currencyAmt = $('#item_value').val();
    var livePrice = $('#liveprice').val();
    total = parseFloat(currencyAmt) / parseFloat(livePrice);
    if(total > 0){
      $('#item_amount').val(total); 
    }else{
      $('#item_amount').val(0);
    }
  });
  $('#item_amount').on('keyup', function(){
    var currencyAmt = $('#item_amount').val();
    var livePrice = $('#liveprice').val();
    total = parseFloat(currencyAmt) * parseFloat(livePrice);
    if(total > 0){
      $('#item_value').val(total); 
    }else{
      $('#item_value').val(0);
    }
  });
  function getLivePrice(){
    var formData = $('#profileForm').serialize();
    var data_url = $('#pricecalculate_url').val();
    $.ajax({
      type: "post",
      url: data_url,
      data: formData,
      dataType: "json",
      success: function(data){
        if(data.status)
        {
          var result = data.result;
          //$('#item_amount').val(result.amount);        
          $('#liveprice').val(result.price);        
        }
        else
        {
          $('#errorSellMsg').html(data.msg);
        }
      }
    });
  return false;
}
</script>

		</body>
		</html>
