@php
$atitle ="user";
@endphp
@extends('layouts.header')
@section('title', ' Users Wallet')
@section('content')
<section class="content">
	<header class="content__title">
		<h1>User Wallet</h1>
	</header>
	<div class="row">
		<div class="col-md-12">
			<div class="card">
				<div class="card-body">
					<a href="{{ url('admin/users') }}"><i class="zmdi zmdi-arrow-left"></i> Back to User</a>
				</br><br>
				@if(session('status'))
				<div class="alert alert-success">
					{{ session('status') }}
				</div>
				@endif

          	@php $title = 'users_wallet'; @endphp
          	@include('user.tab')

			@foreach($coins as $coin)
			@if($coin->type != 'fiat')
			<div class="row">
				<div class="col-md-3">
					<div class="form-group">
						<label>{{$coin->source}} Address</label>
					</div>
				</div>
				<div class="col-md-5">
					<div class="form-group">
						@if(isset($balance[$coin->source]['address']) && $balance[$coin->source]['address'] !="")
						<input type="text" name="from_address" class="form-control" value="{{ $balance[$coin->source]['address'] }}" readonly><i class="form-group__bar"></i> 
						@else
						<a href="{{ url('admin/users_address/'.$uid.'/'.$coin->source) }}" class="btn btn-light"><i class="form-group__bar"></i>Create {{ $coin->source }} address</a>
						@endif 
					</div>
				</div>
			</div>
			@endif
			<div class="row">
				<div class="col-md-3">
					<div class="form-group">
						<label>{{$coin->source}} Available Balance</label>
					</div>
				</div>
				<div class="col-md-5">
					<div class="form-group">
						@if(isset($balance[$coin->source]['balance']) && $balance[$coin->source]['balance'] > 0)
						<input type="text" name="balance" class="form-control" value="{{ number_format($balance[$coin->source]['balance'],8) }}" readonly><i class="form-group__bar"></i>
						@else
						<input type="text" name="balance" class="form-control" value="0" readonly><i class="form-group__bar"></i>
						@endif 
					</div>
				</div>
			</div>
			@endforeach 
		</form>
	</div>
</div>
</div>
</div>
@endsection