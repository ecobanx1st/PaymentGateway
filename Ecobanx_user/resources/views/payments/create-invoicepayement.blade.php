@php $title = "Checkout"; $atitle ="merchant";
@endphp
@include('layouts.headercss')
</section>
</header>
		
		<section class="paymentstepsbg">
			<div class="container">
				<div class="">
					<div class="col-lg-7 col-md-8 col-sm-10 col-xs-12 center-content boxb">
						@if(isset($message))
						<div class="alert alert-warning">{!! $message !!}</div>
						@endif
						<div class="stepsbanner">
							<div class="logo text-center">
								<img src="{{ url('public/assets/images/darklogo.png') }}" />
							</div>
        		                <h4 class="headt">
        		                @forelse($payments['subcategory'] as $key => $value)
        		                @if($payments['category']['invoicetype'] == 'simple')
								{{ $value->itemname }} 
								@endif
								@empty
								@endforelse	
							</h4>
							
							<div class="notestext">Sold by <a href="#" class="atextlink">{{ $dpname }}</a></div>			    
						</div>
						<form action="{{ route('makeinvoiceordercode') }}" method="POST">
						<div class="stepsbanner checkborderbox">
							<table class="table">
								<tbody>
									<tr>
										<td class="fnt-bld text-uppercase text-left">Item Description</td>
		        		                @if($payments['category']['invoicetype'] == 'simple')
										<td class="text-right">
		        		                @forelse($payments['subcategory'] as $key => $value)
										{{ $value->itemname }} 
										@empty
										@endforelse	
										</td>
										@else
										<td class="text-left">
		        		                @forelse($payments['subcategory'] as $key => $value)
										{!! str_replace("\r\n",'<br>', $value->itemname) !!}
										@empty
										@endforelse	
										</td>
										@endif
									</tr>
									<tr>
										<td class="fnt-bld text-uppercase text-left">TOTAL</td>
										<td class="text-right">{{ $payments['category']['total'] }} {{ $payments['category']['coin'] }}
										<input type="hidden" name="total" value="{{ $payments['category']['total'] }}" />
										</td>
									</tr>
								</tbody>
							</table>
						</div>
						
						<div class="stepsbanner coinbanner">
							<h4 class="headt">Select A Coin</h4>
							<div class="col-md-12 coinselect">
								<div class="coinbg">
									<div class="cointable cointab">
										<img src="{{ url('public/images/color/'.strtolower($payments['category']['cointwo']).'.png') }}" />
									</div>
									<div class="cointable">
										@if(($payments['category']['coin'] == 'USD')||($payments['category']['coin'] == 'NGN'))
										@php
											$tamount = ncDiv($payments['category']['total'],$lprice);
										@endphp
										<h4 class="h4">{{ $tamount }}</h4>
										<h5 class="h5 text-uppercase">{{$payments['category']['cointwo']}}</h5>
										@else
										<h4 class="h4">{{ $payments['category']['total'] }}</h4>
										<h5 class="h5 text-uppercase">{{ $payments['category']['cointwo'] }}</h5>
										@endif
									</div>
								</div>
							</div>
						</div>
						
						
						<div class="stepsbanner">				
								{{ csrf_field() }}
								<div class="row">
									<div class="col-md-12">
										<div class="form-group{{ $errors->has('email') ? ' has-error' : '' }}">
											<input type="text" class="form-control" name="email" value="{{ old('email') }}" placeholder="Email" />
											@if ($errors->has('email'))
											<span class="help-block">
												<strong>{{ $errors->first('email') }}</strong>
											</span>
											@endif
										</div>
									</div>
								</div>
								<div class="row">
									<div class="col-md-6">
										<div class="form-group{{ $errors->has('first_name') ? ' has-error' : '' }}">
											<input type="text" class="form-control" name="first_name" placeholder="First Name" value="{{ old('first_name') }}"/>
											@if ($errors->has('first_name'))
											<span class="help-block">
												<strong>{{ $errors->first('first_name') }}</strong>
											</span>
											@endif
										</div>
									</div>
									<div class="col-md-6">
										<div class="form-group{{ $errors->has('last_name') ? ' has-error' : '' }}">
											<input type="text" class="form-control" name="last_name" placeholder="Last Name" value="{{ old('last_name') }}" />
											@if ($errors->has('last_name'))
											<span class="help-block">
												<strong>{{ $errors->first('last_name') }}</strong>
											</span>
											@endif
										</div>
									</div>
								</div>
		        		        @if($payments['category']['invoicetype'] == 'simple')
								@if(!empty($payments['category']['shippingaddress']))
								<div class="row">
									<div class="col-md-6">
										<div class="form-group{{ $errors->has('address1') ? ' has-error' : '' }}">
											<textarea rows="4" cols="50" name="address1" placeholder="Address Line 1" required="required" readonly="readonly">{{$payments['category']['shippingaddress']}}</textarea>
											@if ($errors->has('address1'))
											<span class="help-block">
												<strong>{{ $errors->first('address1') }}</strong>
											</span>
											@endif
										</div>
									</div>
								</div>	
								@endif
								@endif
								
								<div class="row">	
									<div class="col-md-12">
										<div class="form-group">
											<input type="submit" class="btn btn-green" value="Complete Checkout" />
										</div>
									</div>
								</div>
							
						</div>

							</form>
					</div>
				</div>
			</div>
		</section>		
		<script src="{{ url('public/js/jquery.min.js') }}"></script> 
		<script src="{{ url('public/js/bootstrap.min.js') }}"></script>		
	</body>
</html>