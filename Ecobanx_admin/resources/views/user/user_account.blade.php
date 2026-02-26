@php
$atitle ="user";
@endphp
@extends('layouts.header')
@section('title', 'Users List - Admin')
@section('content')
<section class="content">
	<header class="content__title">
		<h1>View User Details</h1>
	</header>
	<div class="row">
		<div class="col-md-12">
			<div class="card">
				<div class="card-body">
					<a href="{{ url('admin/users') }}"><i class="zmdi zmdi-arrow-left"></i> Back to User</a>
					<br /><br />
					@if(session('updated_status'))
					<div class="alert alert-success">
						{{ session('updated_status') }}
					</div>
					@endif
					@php $title = 'merchant_details'; @endphp
					@include('user.tab')
					<form method="post" action="{{ url('admin/update_user') }}" autocomplete="off">
						{{ csrf_field() }}
						<input type="hidden" value="{{ isset($merchant->id) }}" name="id">
						<div class="row">
							<div class="col-md-3">
								<div class="form-group">
									<label>IPN Secret</label>
								</div>
							</div>
							<div class="col-md-6">
								<div class="form-group">
									<input type="text" name="ipn_secret" class="form-control" value="{{ isset($merchant->ipn_secret) != NULL ? $merchant->ipn_secret : $userdetails->name }}" readonly="" /><i class="form-group__bar"></i>
								</div>
							</div>
						</div>
						<div class="row">
							<div class="col-md-3">
								<div class="form-group">
									<label>IPN URL</label>
								</div>
							</div>
							<div class="col-md-6">
								<div class="form-group">
									<input type="text" name="ipn_url" class="form-control" value="{{ isset($merchant->ipn_url) != NULL ? $merchant->ipn_url : '' }}"  readonly /><i class="form-group__bar"></i>
								</div>
							</div>
						</div>
						<div class="row">
							<div class="col-md-3">
								<div class="form-group">
									<label>Coin</label>
								</div>
							</div>
							<div class="col-md-6">
								<div class="form-group">
									<input type="text" name="coin" class="form-control" value="{{ isset($merchant->coin) != NULL ? $merchant->coin : '' }}"  readonly /><i class="form-group__bar"></i>
								</div>
							</div>
						</div>
						@php
						$receive_mail=explode(",",isset($merchant->receive_mail));
						@endphp
						<div class="row">
							{{-- <div class="col-md-3">
								<div class="form-group">
									<label>Receive mail</label>
								</div>
							</div> --}}
							<div class="col-md-6">
								{{-- <div class="form-group">
									<label>When a user submits a new payment to you
										<input type="checkbox" name="receive_mail[]" value="1" @if (in_array(1,$receive_mail)) checked @endif>
										<span class="checkmark"></span> </label>
										<label>When funds have been received by us for a payment to you
											<input name="receive_mail[]" value="2" type="checkbox" @if (in_array(2, $receive_mail)) checked @endif > <span class="checkmark"></span></label>
											<label>When funds for a payment have been sent to you
												<input name="receive_mail[]" value="3" type="checkbox" @if (in_array(3, $receive_mail)) checked @endif> <span class="checkmark"></span>
											</label>
											<label>When a deposit is received on one of your deposit addresses
												<input name="receive_mail[]" value="4" type="checkbox" @if (in_array(4, $receive_mail)) checked @endif> <span class="checkmark"></span>
											</label>
										</div>
									</div>
								</div> --}}
								{{-- <div class="row">
									<div class="col-md-3">
										<div class="form-group">
											<label>Status mail</label>
										</div>
									</div>
									<div class="col-md-4">
										<div class="form-group">
											<input type="text" name="coin" class="form-control" value="{{ isset($merchant->status_email) != NULL ? $merchant->status_email : '' }}"  readonly /><i class="form-group__bar"></i>
										</div>
									</div>
								</div> --}}
							</form>
						</div>
					</div>
				</div>
			</div>
			@endsection
