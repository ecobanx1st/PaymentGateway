@php
$atitle ="coinlist";
@endphp
@extends('layouts.header')
@section('title', 'Add Coin Settings')
@section('content')
<section class="content">
	<header class="content__title">
		<h1>Add Token</h1>
	</header>
	<div class="row">
		<div class="col-md-12">
			<div class="card">
				<div class="card-body">
					<a href="{{ url('admin/coinlist') }}"><i class="zmdi zmdi-arrow-left"></i> Back to Coin</a>
					<br /><br />
					@if(session('status'))
					<div class="alert alert-success" role="alert">
						<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button><strong>Success!</strong> {{ session('status') }}
					</div>
					@endif

					@if(Session::has('error'))
						<p class="alert alert-danger">{{ Session::get('error') }}</p>
					@endif
					
					<form method="post" action="{{ url('admin/addcoininsert') }}" autocomplete="off" enctype="multipart/form-data">
						{{ csrf_field() }}
						<div class="row">
							<div class="col-md-3">
								<div class="form-group">
									<label>Source</label>
								</div>
							</div>
							<div class="col-md-4">
								<div class="form-group">
									<input type="text" name="symbol" class="form-control" value="{{ old('symbol') }}"><i class="form-group__bar"></i>
									@if ($errors->has('symbol'))
									<span class="help-block">
										<strong>{{ $errors->first('symbol') }}</strong>
									</span>
									@endif
								</div>
							</div>
						</div>

						<div class="row">
							<div class="col-md-3">
								<div class="form-group">
									<label>Limit</label>
								</div>
							</div>
							<div class="col-md-4">
								<div class="form-group">
									<input type="number" name="limit" min="0" max="10000000" class="form-control" value="{{ old('limit') }}" step="any"/><i class="form-group__bar"></i>
									@if ($errors->has('limit'))
									<span class="help-block">
										<strong>{{ $errors->first('limit') }}</strong>
									</span>
									@endif
								</div>
							</div>
						</div>

						<div class="row">
							<div class="col-md-3">
								<div class="form-group">
									<label>Minimum Withdraw Amount</label>
								</div>
							</div>
							<div class="col-md-4">
								<div class="form-group">
									<input type="number" name="min_amount" class="form-control" value="{{ old('min_amount') }}" step="any" /><i class="form-group__bar"></i>
									@if ($errors->has('min_amount'))
									<span class="help-block">
										<strong>{{ $errors->first('min_amount') }}</strong>
									</span>
									@endif
								</div>
							</div>
						</div>

						<div class="row">
							<div class="col-md-3">
								<div class="form-group">
									<label>Maximum Withdraw Amount</label>
								</div>
							</div>
							<div class="col-md-4">
								<div class="form-group">
									<input type="number" name="max_amount" class="form-control" value="{{ old('max_amount') }}" step="any"/><i class="form-group__bar"></i>
									@if ($errors->has('max_amount'))
									<span class="help-block">
										<strong>{{ $errors->first('max_amount') }}</strong>
									</span>
									@endif
								</div>
							</div>
						</div>

						<div class="row">
							<div class="col-md-3">
								<div class="form-group">
									<label>Withdraw Commission (%)</label>
								</div>
							</div>
							<div class="col-md-4">
								<div class="form-group">
									<input type="number" name="withdraw" class="form-control" step="0.01" min="0" max="10000000" value="{{ old('withdraw') }}" /><i class="form-group__bar"></i>
									@if ($errors->has('withdraw'))
									<span class="help-block">
										<strong>{{ $errors->first('withdraw') }}</strong>
									</span>
									@endif
								</div>
							</div>
						</div>
						<!-- <div class="row">
							<div class="col-md-3">
								<div class="form-group">
									<label>Wallet Page Redirect URL</label>
								</div>
							</div>
							<div class="col-md-4">
								<div class="form-group">
									<input type="text" name="walletpair" placeholder="add with _(eg: BTC_USDT)"class="form-control" value="{{ old('walletpair') }}"  required><i class="form-group__bar"></i>
									@if ($errors->has('walletpair'))
					                    <span class="help-block">
					                        <strong>{{ $errors->first('walletpair') }}</strong>
					                    </span>
					                @endif
								</div>
							</div>
						</div> -->
						<!-- <div class="row">
							<div class="col-md-3">
								<div class="form-group">
									<label>Withdraw Commission Type</label>
								</div>
							</div>
							<div class="col-md-4">
								<div class="form-group">
									<select name="com_type" class="form-control">
										<option <?php if (old('com_type') == "Percentage") echo "selected"; ?> value="Percentage">Percentage</option>
										<option <?php if (old('com_type') == "Fixed") echo "selected"; ?> value="Fixed">Fixed</option>
									</select>
									@if ($errors->has('com_type'))
									<span class="help-block">
										<strong>{{ $errors->first('com_type') }}</strong>
									</span>
									@endif
								</div>
							</div>
						</div> -->

						<div class="row">
							<div class="col-md-3">
								<div class="form-group">
									<label>Type</label>
								</div>
							</div>
							<div class="col-md-4">
								<div class="form-group" {{ $errors->has('type') ? ' has-error' : '' }}>

									<select name="type" id="coin_type" class="form-control">
										<option value="">Select type</option>
										<option value="bsctoken" {{  old('type') == 'bsctoken' ? 'selected' : '' }}>Bep20 Token</option>
										<option value="trxtoken" {{  old('type') == 'trxtoken' ? 'selected' : '' }}>TRC20 Token</option>
										<option value="erctoken" {{  old('type') == 'erctoken' ? 'selected' : '' }}>ERC20 Token</option>
										<option value="polytoken" {{  old('type') == 'polytoken' ? 'selected' : '' }}>POLY20 Token</option>
										<option value="wfitoken" {{ old('type') == 'wfitoken' ? 'selected' : '' }}>WFI20 Token</option>
										<option value="token" {{ old('type') == 'token' ? 'selected' : '' }}>ERC 20 Token</option>
									</select>
									@if ($errors->has('type'))
									<span class="help-block">
										<strong>{{ $errors->first('type') }}</strong>
									</span>
									@endif
								</div>
							</div>
						</div>

						<div class="row" id="contract" style="display: none;">
							<div class="col-md-3">
								<div class="form-group">
									<label>Contract Address</label>
								</div>
							</div>
							<div class="col-md-8">
								<div class="form-group">
									<input type="text" name="contractaddress" class="form-control" value="{{ old('contractaddress') }}" /><i class="form-group__bar"></i>
									@if ($errors->has('contractaddress'))
									<span class="help-block">
										<strong>{{ $errors->first('contractaddress') }}</strong>
									</span>
									@endif
								</div>
							</div>
						</div>

						<div class="row" id="abi" style="display: none;">
							<div class="col-md-3">
								<div class="form-group">
									<label>Abi Array</label>
								</div>
							</div>
							<div class="col-md-8">
								<div class="form-group">
									<textarea name="abiarray" class="form-control" value="" />{{ old('abiarray') }}</textarea><i class="form-group__bar"></i>
									@if ($errors->has('abiarray'))
									<span class="help-block">
										<strong>{{ $errors->first('abiarray') }}</strong>
									</span>
									@endif
								</div>
							</div>
						</div>

						<div class="row">
							<div class="col-md-3">
								<div class="form-group">
									<label>Coinname</label>
								</div>
							</div>
							<div class="col-md-4">
								<div class="form-group">
									<input type="text" name="coinname" class="form-control" value="{{ old('coinname') }}" /><i class="form-group__bar"></i>
									@if ($errors->has('coinname'))
									<span class="help-block">
										<strong>{{ $errors->first('coinname') }}</strong>
									</span>
									@endif
								</div>
							</div>
						</div>
						<input type="hidden" name="netfee" class="form-control" value="0" />
						<!-- <div class="row">
							<div class="col-md-3">
								<div class="form-group">
									<label>Netfee</label>
								</div>
							</div>
							<div class="col-md-4">
								<div class="form-group">
									<input type="number" name="netfee" step="0.00001" min="0" max="10000000" class="form-control" value="{{ old('netfee') }}"/><i class="form-group__bar"></i>
									@if ($errors->has('netfee'))
					                    <span class="help-block">
					                        <strong>{{ $errors->first('netfee') }}</strong>
					                    </span>
				                	@endif
								</div>
							</div>
						</div> -->


						<div class="row">
							<div class="col-md-3">
								<div class="form-group">
									<label>Point digit</label>
								</div>
							</div>
							<div class="col-md-4">
								<div class="form-group">
									<input type="number" name="digit" min="0" max="10" class="form-control" value="{{ old('digit') }}" step="any"/><i class="form-group__bar"></i>
									@if ($errors->has('digit'))
									<span class="help-block">
										<strong>{{ $errors->first('digit') }}</strong>
									</span>
									@endif
								</div>
							</div>
						</div>


						<div class="row">
							<div class="col-md-3">
								<div class="form-group">
									<label>Contract Decimal Value</label>
								</div>
							</div>
							<div class="col-md-4">
								<div class="form-group">
									<input type="number" name="decimal_value" min="0" max="100" class="form-control" value="{{ old('decimal_value') }}" /><i class="form-group__bar"></i>
									@if ($errors->has('decimal_value'))
									<span class="help-block">
										<strong>{{ $errors->first('decimal_value') }}</strong>
									</span>
									@endif
								</div>
							</div>
						</div>



						 <div class="row">
							<div class="col-md-3">
								<div class="form-group">
									<label>Live url(Optional)</label>
								</div>
							</div>
							<div class="col-md-4">
								<div class="form-group">
									<input type="text" name="url" class="form-control" value="{{ old('url') }}"/><i class="form-group__bar"></i>
						@if ($errors->has('url'))
						<span class="help-block">
							<strong>{{ $errors->first('url') }}</strong>
						</span>
						@endif
				</div>
			</div>
		</div> 


		

<!-- 
		<div class="row">
			<div class="col-md-3">
				<div class="form-group">
					<label>Deposit Status</label>
				</div>
			</div>
			<div class="col-md-4">
				<div class="form-group">
					<select name="is_deposit" class="form-control">
						<option value="1">Active</option>
						<option value="0">Deactive</option>

					</select>
					@if ($errors->has('is_deposit'))
					<span class="help-block">
						<strong>{{ $errors->first('is_deposit') }}</strong>
					</span>
					@endif
				</div>
			</div>
		</div>
		<div class="row">
			<div class="col-md-3">
				<div class="form-group">
					<label>Withdraw Status</label>
				</div>
			</div>
			<div class="col-md-4">
				<div class="form-group">
					<select name="is_withdraw" class="form-control">
						<option value="1">Active</option>
						<option value="0">Deactive</option>

					</select>
					@if ($errors->has('is_withdraw'))
					<span class="help-block">
						<strong>{{ $errors->first('is_withdraw') }}</strong>
					</span>
					@endif
				</div>
			</div>
		</div> -->



		<div class="row">
			<div class="col-xs-8 col-sm-8 col-md-8">
				<!-- <div class="loding">Loading...</div> -->
				<div class="form-group{{ $errors->has('image') ? ' has-error' : '' }}">
					<div class="form-group  has-feedback">
						<div class="col-xs-12 inputGroupContainer"> <img id="doc1" width="128px" height="128px" class="img-responsive kyc_img_cls" />
							<label for="file-upload1" class="custom-file-upload"> <i class="fa fa-cloud-upload"></i> Upload Image </label>
							<input id="file-upload1" class="kycimg2" onchange="ValidateSize(this)" name="image" type="file" style="display:none;">
							<label id="file-name1"></label>
							<br />
							<br />
							@if ($errors->has('image')) <span class="help-block"> <strong>{{ $errors->first('image') }}</strong> </span><br /> @endif
							<p style="color:#ff2626;font-weight:600;font-size: 15px;">Allowed only png image format 35 X 35</p>
						</div>
					</div>
				</div>
			</div>
		</div>




		<!-- <div class="row">
			<div class="col-md-3">
				<div class="form-group">
					<label>Auto Withdraw</label>
				</div>
			</div>
			<div class="col-md-4">
				<div class="form-group">
					<select name="auto_withdraw" class="form-control">
						<option value="1">Enabled</option>
						<option value="0">Disabled</option>

					</select>
					@if ($errors->has('auto_withdraw'))
					<span class="help-block">
						<strong>{{ $errors->first('auto_withdraw') }}</strong>
					</span>
					@endif
				</div>
			</div>
		</div> -->



		<div class="row">
			<div class="col-md-3">
				<div class="form-group">
					<label>Active Status</label>
				</div>
			</div>
			<div class="col-md-4">
				<div class="form-group">
					<select name="status" class="form-control">
						<option value="1">Active</option>
						<option value="0">Deactive</option>

					</select>
					@if ($errors->has('status'))
					<span class="help-block">
						<strong>{{ $errors->first('status') }}</strong>
					</span>
					@endif
				</div>
			</div>
		</div>

		{{-- <div class="row">
							<div class="col-md-3">
								<div class="form-group">
									<label>Is Swap</label>
								</div>
							</div>
							<div class="col-md-4">
								<div class="form-group">
									<select name="is_swap" class="form-control" >
									<option value="1" >Active</option>
									<option value="0">Deactive</option>
								
									</select>
									@if ($errors->has('is_swap'))
					                    <span class="help-block">
					                        <strong>{{ $errors->first('is_swap') }}</strong>
		</span>
		@endif
	</div>
	</div>
	</div> --}}


	<div class="form-group">
		<button type="submit" name="edit" class="btn btn-light"><i class=""></i> Add Now</button>
	</div>
	</form>
	</div>
	</div>
	</div>
	</div>
	@endsection