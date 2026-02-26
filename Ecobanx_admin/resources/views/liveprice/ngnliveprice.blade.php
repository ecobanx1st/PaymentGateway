@extends('layouts.header')
@section('title', 'Commission Settings')
@section('content')
<section class="content">
	<header class="content__title">
		<h1>Live Price For Ngn</h1>
	</header>
	
					@if(session('status'))
					<div class="alert alert-success" role="alert">
						<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button><strong>Success!</strong> {{ session('status') }}
					</div>
					@endif
					@if(session('error'))
					<div class="alert alert-danger" role="alert">
						<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button><strong>Error!</strong> {{ session('error') }}
					</div>
					@endif
	<div class="row">
		<div class="col-md-12">
			<div class="card">
				<div class="card-body">
					<a href="{{ url('admin/livepricelist') }}"><i class="zmdi zmdi-arrow-left"></i> Back to Live Price</a>
					<br /><br />
					<form method="post" action="{{ url('admin/ngnpriceupdate') }}" autocomplete="off">
						{{ csrf_field() }}
						<div class="row">
							<div class="col-md-3">
								<div class="form-group">
									<label>Coin</label>
								</div>
							</div>
							<div class="col-md-4">
								<div class="form-group">
									<input class="form-control" type="text" name="coin" value="NGN" required="required" readonly="readonly">
									@if ($errors->has('coin'))
									<span class="help-block">
										<strong>{{ $errors->first('coin') }}</strong>
									</span>
									@endif
								</div>
							</div>
						</div>
						<div class="row">
							<div class="col-md-3">
								<div class="form-group">
									<label>Price in BTC</label>
								</div>
							</div>
							<div class="col-md-4">
								<div class="form-group">
									<input class="form-control" type="text" name="price" value="{{$ngnliveprice}}" >
									@if ($errors->has('price'))
									<span class="help-block">
										<strong>{{ $errors->first('price') }}</strong>
									</span>
									@endif
								</div>
							</div>
						</div>
						<div class="form-group">
							<button type="submit" name="edit" class="btn btn-light"><i class=""></i> Update</button>
						</div>
					</form>
				</div>
			</div>
		</div>
	</div>
@endsection