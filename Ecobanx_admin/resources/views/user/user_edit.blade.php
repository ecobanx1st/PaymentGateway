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
					@if(session('error'))
					<div class="alert alert-danger">
						{{ session('error') }}
					</div>
					@endif
					@php $title = 'users_edit'; @endphp
					@include('user.tab')
					<form method="post" action="{{ url('admin/update_user') }}" autocomplete="off">
						{{ csrf_field() }}
						<input type="hidden" value="{{ $userdetails->id }}" name="id">
						<div class="row">
							<div class="col-md-3">
								<div class="form-group">
									<label>Full Name</label>
								</div>
							</div>
							<div class="col-md-4">
								<div class="form-group">
									<input type="text" name="fname" class="form-control" value="{{ $userdetails->name != NULL ? $userdetails->name : '' }}"/><i class="form-group__bar"></i>
								</div>
							</div>
						</div>
						<div class="row">
							<div class="col-md-3">
								<div class="form-group">
									<label>Email ID</label>
								</div>
							</div>
							<div class="col-md-4">
								<div class="form-group">
									<input type="email" name="email" class="form-control" value="{{ $userdetails->email }}"  readonly /><i class="form-group__bar"></i>
								</div>
							</div>
						</div>
						<div class="row">
							<div class="col-md-3">
								<div class="form-group">
									<label>Country</label>
								</div>
							</div>
							<div class="col-md-4">
								<div class="form-group">
									<select class="form-control" name="country">
										@if($userdetails->country == '')
										<option value="">Select Country</option>
										@foreach(country() as $countrys)
										<option value="{{ $countrys->id }}" @if($countrys->id == $userdetails->country ) selected @endif>{{ $countrys->name }}</option>
										@endforeach
										@else
										@foreach(country() as $countrys)
										<option value="{{ $countrys->id }}" @if($countrys->id == $userdetails->country ) selected @endif>{{ $countrys->name }}</option>
										@endforeach
										@endif
									</select>
								</div>
							</div>
						</div>
						<div class="row">
							<div class="col-md-3">
								<div class="form-group">
									<label>Phone No</label>
								</div>
							</div>
							<div class="col-md-4">
								<div class="form-group">
									<input type="text" name="phone" class="form-control" value="{{ $phone }}" /><i class="form-group__bar"></i>
								</div>
							</div>
						</div>
						<div class="row">
							<div class="col-md-3">
								<div class="form-group">
									<label>Email Verified</label>
								</div>
							</div>
							<div class="col-md-4">
								<div class="form-group">
									<div class="form-group">
										@if($userdetails->email_verify ==1)
										<select name="emailcheck" class="form-control" required>
											<option value="1">Verified</option>
											<option value="0">Not Verify</option>
										</select>
										@else
										<select name="emailcheck" class="form-control" required>
											<option value="0">Not Verfied</option>
											<option value="1">Verified</option>
										</select>
										@endif
									</div>
								</div>
							</div>
						</div>
						<div class="row">
							<div class="col-md-3">
								<div class="form-group">
									<label>2FA</label>
								</div>
							</div>
							<div class="col-md-4">
								<div class="form-group">
									<div class="form-group">
										<select name="twofachange" class="form-control" required>
											<option value="">Not Selected</option>
											<option value="email_otp" @if($userdetails->twofa == 'email_otp' ) selected @endif>Email</option>
											<option value="google_otp"  @if($userdetails->twofa == 'google_otp' ) selected @endif>Google auth</option>
											<option value="reset">Reset Google auth</option>
											<option value="null">Reset twofa</option>
										</select>
									</div>
								</div>
							</div>
						</div>
                        @if(in_array("write", explode(',',$AdminProfiledetails->userlist)))
						<div class="form-group">
							<button type="submit" name="edit" class="btn btn-light"><i class=""></i> Update</button>
						</div>
                        @endif
					</form>
					<div class="row">
						<div class="col-md-3">
							<div class="form-group">
								<label>Merchant id</label>
							</div>
						</div>
						<div class="col-md-4">
							<div class="form-group">
								<input class="form-control" value="{{ $userdetails->merchant_id }}"  readonly /><i class="form-group__bar"></i>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
	@endsection
