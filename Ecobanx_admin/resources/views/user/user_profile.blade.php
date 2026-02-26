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
					@php $title = 'basic_profile'; @endphp
					@include('user.tab')
					<form method="post" action="{{ url('admin/update_user') }}" autocomplete="off">
						{{ csrf_field() }}
						<input type="hidden" value="{{ isset($profile->id) }}" name="id">
						<div class="row">
							<div class="col-md-3">
								<div class="form-group">
									<label>User Name</label>
								</div>
							</div>
							<div class="col-md-4">
								<div class="form-group">
									<input type="text" name="display_name" class="form-control" value="{{ isset($profile->display_name) != NULL ? $profile->display_name : $userdetails->name }}" readonly="" /><i class="form-group__bar"></i>
								</div>
							</div>
						</div>
						<div class="row">
							<div class="col-md-3">
								<div class="form-group">
									<label>Gender</label>
								</div>
							</div>
							<div class="col-md-4">
								<div class="form-group">
									<input type="text" name="gender" class="form-control" value="{{ isset($profile->gender) != NULL ? $profile->gender : '' }}"  readonly /><i class="form-group__bar"></i>
								</div>
							</div>
						</div>
						@if(isset($profile->optional_mail) && $profile->optional_mail == 1)
						<div class="row">
							<div class="col-md-3">
								<div class="form-group">
									<label>Optional Emails</label>
								</div>
							</div>
							<div class="col-md-8">
								<div class="form-group">
									<input type="text" name="optional_mail" class="form-control" value="Receive electronic communications from CI Payments Inc."  readonly /><i class="form-group__bar"></i>
								</div>
							</div>
						</div>
						@endif
					</form>
				</div>
			</div>
		</div>
	</div>
	@endsection