@php $title = "Checkout"; $atitle ="merchant";
@endphp
@include('layouts.headercss')
</section>
</header>

<section class="paymentstepsbg">
  <div class="container">
    <div class="row">
      <div class="stepsbanner">
        <div class="logo text-center">
            <a href="{{ url('/') }}">
                <img src="{{ url('img/logo.png') }}" alt="logo" width="120px">
            </a>
        </div>
       </div>

       <div class="col-lg-4 coinselect">
              <div class="coinbg active">
                <div class="cointable text-center">
                  <h4 class="h4">Item Name</h4>
                  <h5 class="h5 text-uppercase">{{ $payments['item_name'] }} </h5>
                </div>
              </div>
            </div>

            <div class="col-lg-4 coinselect">
              <div class="coinbg active">
                <div class="cointable text-center">
                  <h4 class="h4">Item Description</h4>
                  <h5 class="h5 text-uppercase">{{ $payments['item_desc'] }}</h5>
                </div>
              </div>
            </div>

            <div class="col-lg-4 coinselect">
              <div class="coinbg active">
                <div class="cointable text-center">
                  <h4 class="h4">Amount </h4>
                  <h5 class="h5 text-uppercase">{{ $payments['amount'] }} {{ $payments['currency'] }} </h5>
                </div>
              </div>
            </div>
            @if(isset($message))
            <div class="alert alert-warning">{!! $message !!}</div>
            @endif
           @if (session('error'))
            <div class="snackbar show" role="alert"><i class="fa fa-times-circle text-danger"></i> {{ session('error') }}</div>
            @endif
      <div class="col-xl-6 col-lg-6 col-md-12 col-sm-12 col-xs-12 boxb mx-auto">
        <form action="{{ route('makeorder') }}" id="profileForm" method="POST" autocomplete="off">
        @csrf 
        <input type="hidden" name="camount" id="camount" />
        <input type="hidden" name="total" value="{{ $payments['amount'] }}" />
		@if($payments['currency'] != 'USD' || $payments['currency'] != 'EUR')
		<input type="hidden" name="currency2" id="currency2" value="{{ $comDetails[0]['source'] }}" />
		@else
		<input type="hidden" name="currency2" id="currency2" value="{{ $payments['currency'] }}" />
		@endif       
           <div class="stepsbanner coinbanner">
            <h4 class="headt">Select A Coin</h4>
            <div class="row">
              <input type="hidden" name="currency" value="{{ $payments['currency'] }}">
              <input type="hidden" name="user_id" value="">
              <input type="hidden" name="amount" value="{{ $payments['amount'] }}">
              <input type="hidden" name="selected_token" id="selected_token" value="{{ $payments['currency'] }}">
              <input type="hidden" name="selected_amount" id="selected_amount" value="{{ $payments['amount'] }}">
              @forelse($comDetails as $key => $val)   
              	@php
                    if($payments['currency'] == 'USD'){
                        $tamount = ncDiv($payments['amount'],$val->usd_price);
                    }elseif($payments['currency'] == 'EUR'){
                        $tamount = ncDiv($payments['amount'],$val->eur_price);
                    }else{
                        $tamount = $payments['amount'];
                    }					
					
				@endphp                          
             <div class="col-md-6 coinselect" onclick="getPaymentCurrency('{{$val->source}}', '{{ $tamount }}')" @if($loop->iteration  > 1) style="cursor: not-allowed" @endif>
              <div class="coinbg @if($loop->iteration == 1) active @endif" id="{{$val->source}}data">
                <div class="cointable cointab">
                  <img src="{{ url('/img/color/'.$val->image) }}" />
                </div>
                <div class="cointable">
                  <h4 class="h4">{{ $tamount }}</h4>
                  <h5 class="h5 text-uppercase">{{$val->source}}</h5>
                </div>
              </div>
            </div>
            @empty
			@endforelse     
           </div>
        </div>
    </div>

    <div class="col-xl-6 col-lg-6 col-md-12 col-sm-12 col-xs-12 boxb mx-auto">         
           <div class="stepsbanner coinbanner invoice">
            <h4 class="headt">Buyer Details</h4>
                                    <fieldset class="buyer">
                                        <div class="form-card invoice">
                                            <div class="form-group{{ $errors->has('email') ? ' has-error' : '' }} ">
                                                <input type="text" class="form-control" name="email" value="{{ old('email') }}" placeholder="Email ID *" />
												@if ($errors->has('email'))
												<span class="help-block">
													<strong>{{ $errors->first('email') }}</strong>
												</span>
												@endif
                                               
                                            </div>
                                        </div>
                                    </fieldset>

                                    <div class="row">
                                        <div class="col-xl-6 col-lg-6 col-md-12 col-sm-12 col-xs-12">
                                                <fieldset class="buyer">
                                                    <div class="form-card invoice">
                                                        <div class="form-group{{ $errors->has('first_name') ? ' has-error' : '' }} ">
                                                            <input type="text" class="form-control" name="first_name" placeholder="First Name *" value="{{ old('first_name') }}"/>
															@if ($errors->has('first_name'))
															<span class="help-block">
																<strong>{{ $errors->first('first_name') }}</strong>
															</span>
															@endif
                                                           
                                                        </div>
                                                    </div>
                                                </fieldset>
                                        </div>

                                        <div class="col-xl-6 col-lg-6 col-md-12 col-sm-12 col-xs-12">
                                                <fieldset class="buyer">
                                                    <div class="form-card invoice">
                                                        <div class="form-group{{ $errors->has('last_name') ? ' has-error' : '' }} ">
                                                            <input type="text" class="form-control" name="last_name" placeholder="Last Name *" value="{{ old('last_name') }}" />
															@if ($errors->has('last_name'))
															<span class="help-block">
																<strong>{{ $errors->first('last_name') }}</strong>
															</span>
															@endif
                                                            
                                                        </div>
                                                    </div>
                                                </fieldset>
                                        </div>

                                    </div>

                                    <hr>
                                @if($payments['want_shipping'] == 1)    
                                <h4 class="headt">Shipping Details</h4>
                                    <fieldset class="buyer">
                                        <div class="form-card invoice">
                                            <div class="form-group{{ $errors->has('address1') ? ' has-error' : '' }}">
                                                <input type="text" class="form-control" name="address1" placeholder="Address Line 1" value="{{ old('address1') }}" />
												@if ($errors->has('address1'))
												<span class="help-block">
													<strong>{{ $errors->first('address1') }}</strong>
												</span>
												@endif
                                            </div>
                                        </div>
                                    </fieldset>
                                    <fieldset class="buyer">
                                        <div class="form-card invoice">
                                            <div class="form-group{{ $errors->has('address2') ? ' has-error' : '' }}">
                                                <input type="text" class="form-control" name="address2" placeholder="Address Line 2" value="{{ old('address2') }}" />
												@if ($errors->has('address2'))
												<span class="help-block">
													<strong>{{ $errors->first('address2') }}</strong>
												</span>
												@endif
                                            </div>
                                        </div>
                                    </fieldset>

                                    <div class="row">
                                        <div class="col-xl-6 col-lg-6 col-md-12 col-sm-12 col-xs-12">
                                                <fieldset class="buyer">
                                                    <div class="form-card invoice">
                                                        <div class="form-group ">
                                                            <input type="text" class="form-control" name="city" placeholder="City *" value="{{ old('city') }}" />
															@if ($errors->has('city'))
															<span class="help-block">
																<strong>{{ $errors->first('city') }}</strong>
															</span>
															@endif
                                                        </div>
                                                    </div>
                                                </fieldset>
                                        </div>

                                        <div class="col-xl-6 col-lg-6 col-md-12 col-sm-12 col-xs-12">
                                                <fieldset class="buyer">
                                                    <div class="form-card invoice">
                                                        <div class="form-group ">
                                                            <select class="form-control" name="country" required="">
																<option value="">Select country</option>
																@forelse($country as $countrys)
																<option value="{{ $countrys->id }}" <?php if($countrys->country == $countrys->id) echo "selected"; ?>>{{ $countrys->name }}</option>
																@empty
																<option value="">No record found</option>
																@endforelse
															</select>
															@if ($errors->has('country'))
															<span class="help-block">
																<strong>{{ $errors->first('country') }}</strong>
															</span>
															@endif
                                                        </div>
                                                    </div>
                                                </fieldset>
                                        </div>

                                    </div>

                                    <fieldset class="buyer">
                                        <div class="form-card invoice">
                                            <div class="form-group ">
                                                <input type="text" class="form-control" name="phoneno" placeholder="Phone Number*" value="{{ old('phoneno') }}" />
												@if ($errors->has('phoneno'))
												<span class="help-block">
													<strong>{{ $errors->first('phoneno') }}</strong>
												</span>
												@endif
                                            </div>
                                        </div>
                                    </fieldset>

                            @endif
          <div class="row"> 
            <div class="col-md-12">
              <div class="form-group text-center">
                <button type="submit" id="save_btn" class="btn btn-green">Complete Checkout</button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  </div>
</div>
</section>


<script
src="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/js/bootstrap.bundle.min.js"></script>

<script src="{{ url('js/validation1.js') }}"></script>
<script type="text/javascript">
	function getPaymentCurrency(currency, selected_amount)
	{   
		$('.coinbg').removeClass('active');
		$('#'+currency+'data').addClass('active');
		$('#selected_token').val(currency);
        $('#currency2').val(currency);
		$('#selected_amount').val(selected_amount);
	}
</script>
</body>
</html>