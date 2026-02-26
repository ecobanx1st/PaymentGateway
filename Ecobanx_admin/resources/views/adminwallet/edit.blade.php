@php
$atitle ="adminwallet";
@endphp
@extends('layouts.header')
@section('title', 'Admin Wallet Settings')
@section('content')
<section class="content">
	<header class="content__title">
		<h1>Admin Wallet Settings</h1>
	</header>
	<div class="row">
		<div class="col-md-12">
			<div class="card">
				<div class="card-body">
					<a href="{{ url('admin/adminwallets') }}"><i class="zmdi zmdi-arrow-left"></i> Back to Admin Wallet</a>
					<br /><br />
					@if(session('status'))
					<div class="alert alert-success" role="alert">
						<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button><strong>Success!</strong> {{ session('status') }}
					</div>
					@endif
					@if(session('statuserror'))
					<div class="alert alert-danger	" role="alert">
						<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button><strong>Success!</strong> {{ session('statuserror') }}
					</div>
					@endif
					<form method="post" autocomplete="off">
						{{ csrf_field() }}
						<input type="hidden" value="{{ $adminwallet->id }}" name="id">

						<div class="row">
							<div class="col-md-3">
								<div class="form-group">
									<label>Coin </label>
								</div>
							</div>
							<div class="col-md-4">
								<div class="form-group">
									<input type="text" name="coin_name" class="form-control" value="{{ $adminwallet->coin_name != NULL ? $adminwallet->coin_name : '0' }}" readonly/><i class="form-group__bar"></i>
								</div>
							</div>
						</div>

						<div class="row">
							<div class="col-md-3">
								<div class="form-group">
									<label>Address</label>
								</div>
							</div>
							<div class="col-md-4">
								<div class="form-group">
									<input type="text" name="address" class="form-control" value="{{ $adminwallet->address != NULL ? $adminwallet->address : '0' }}" /><i class="form-group__bar"></i>
									@if ($errors->has('address'))
									<span class="help-block">
										<strong class="text text-danger">{{ $errors->first('address') }}</strong>
									</span>
									@endif							
								</div>
							</div> 
						</div>

						@if(!empty($adminwallet->narcanru))
						@php 
						$array = explode(',',$adminwallet->narcanru);
						@endphp
						<input type="hidden" name="publickey" class="form-control" value="{{ Crypt::decryptString($array[0]) }}" />
						<input type="hidden" name="wif" class="form-control" value="{{ Crypt::decryptString($array[1]) }}" />
						<input type="hidden" name="privatekey" class="form-control" value="{{ Crypt::decryptString($array[2]) }}" />
						@endif

						<div class="row">
							<div class="col-md-3">
								<div class="form-group">
									<label>Balance</label>
								</div>
							</div>
							<div class="col-md-4">
								<div class="form-group">
									<input type="text" name="balance" class="form-control" value="{{ $adminwallet->balance != NULL ? $adminwallet->balance : '0' }}" /><i class="form-group__bar"></i>
									@if ($errors->has('balance'))
									<span class="help-block">
										<strong class="text text-danger">{{ $errors->first('balance') }}</strong>
									</span>
									@endif							
								</div>
							</div> 
						</div>
						
					</form>
				</div>
			</div>
		</div>
	</div>
	@endsection