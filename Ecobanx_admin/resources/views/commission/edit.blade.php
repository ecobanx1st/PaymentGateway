@php
$atitle ="commission";
@endphp
@extends('layouts.header')
@section('title', 'Commission Settings')
@section('content')
<section class="content">
	<header class="content__title">
		<h1>Commission Settings</h1>
	</header>

	<div class="row">
		<div class="col-md-12">
			<div class="card">
				<div class="card-body">
					<a href="{{ url('admin/commission') }}"><i class="zmdi zmdi-arrow-left"></i> Back to Commission</a>
					<br /><br />
					@if(session('status'))
                        <div class="alert alert-success" role="alert">
                            <button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button><strong>Success!</strong> {{ session('status') }}
                        </div>
                    @endif
					<form method="post" action="{{ url('admin/commissionupdate') }}" autocomplete="off">
						{{ csrf_field() }}
						<input type="hidden" value="{{ $commission->id }}" name="id">
						<div class="row">
							<div class="col-md-3">
								<div class="form-group">
									<label>Coin / Currency</label>
								</div>
							</div>
							<div class="col-md-4">
								<div class="form-group">
									<input type="text" name="currency" class="form-control" value="{{ $commission->source != NULL ? $commission->source : '0' }}" readonly/><i class="form-group__bar"></i>
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
									<input type="number" name="limit"  min="0" max="10000000" class="form-control" value="{{ $commission->limit != NULL ? $commission->limit : '0' }}"/><i class="form-group__bar"></i>
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
									<input type="number" name="minamount" step="0.001" min="0" max="10000000" class="form-control" value="{{ $commission->min_amount != NULL ? $commission->min_amount : 'None' }}"/><i class="form-group__bar"></i>
									@if ($errors->has('minamount'))
					                    <span class="help-block">
					                        <strong>{{ $errors->first('minamount') }}</strong>
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
									<input type="number" name="maxamount"  min="0" max="10000000" class="form-control" value="{{ $commission->max_amount != NULL ? $commission->max_amount : 'None' }}"/><i class="form-group__bar"></i>
									@if ($errors->has('maxamount'))
					                    <span class="help-block">
					                        <strong>{{ $errors->first('maxamount') }}</strong>
					                    </span>
				                	@endif
								</div>
							</div>
						</div>
									<input type="hidden" step="0.001" name="autowithdraw"  min="0" max="10000000" class="form-control" value="{{ $commission->autowithdraw != NULL ? $commission->autowithdraw : 'None' }}"/>


							<div class="row">
							<div class="col-md-3">
								<div class="form-group">
									<label>Withdraw Commission (%)</label>
								</div>
							</div>
							<div class="col-md-4">
								<div class="form-group">
									<input type="number" name="withdraw" class="form-control"  step="0.01" min="0" max="10000000" value="{{ $commission->withdraw != NULL ? $commission->withdraw : '0' }}"/><i class="form-group__bar"></i>
									@if ($errors->has('withdraw'))
					                    <span class="help-block">
					                        <strong>{{ $errors->first('withdraw') }}</strong>
					                    </span>
					                @endif
								</div>
							</div>
						</div>
					<input type="hidden" name="card_com" value="{{$commission->card_com}}" required="required">

						<input type="hidden" name="type" value="{{$commission->type}}" required="required">

									<input type="hidden" name="tradecom" class="form-control"  step="0.01" min="0" max="10000000" value="{{ $commission->tradecom != NULL ? $commission->tradecom : '0' }}"/>



							<div class="row">
							<div class="col-md-3">
								<div class="form-group">
									<label>Coin name</label>
								</div>
							</div>
							<div class="col-md-4">
								<div class="form-group">
									<input type="text" name="coinname" class="form-control" value="{{ $commission->coinname != NULL ? $commission->coinname : 'None' }}"/><i class="form-group__bar"></i>
									@if ($errors->has('coinname'))
					                    <span class="help-block">
					                        <strong>{{ $errors->first('coinname') }}</strong>
					                    </span>
				                	@endif
								</div>
							</div>
						</div>

						<div class="row">
							<div class="col-md-3">
								<div class="form-group">
									<label>Contract Address</label>
								</div>
							</div>
							<div class="col-md-4">
								<div class="form-group">
									<input type="text" name="contractaddress" class="form-control" value="{{ $commission->contractaddress != NULL ? $commission->contractaddress : 'None' }}"/><i class="form-group__bar"></i>
									@if ($errors->has('contractaddress'))
					                    <span class="help-block">
					                        <strong>{{ $errors->first('contractaddress') }}</strong>
					                    </span>
				                	@endif
								</div>
							</div>
						</div>



						<div class="row">
							<div class="col-md-3">
								<div class="form-group">
									<label>Point value</label>
								</div>
							</div>
							<div class="col-md-4">
								<div class="form-group">
									<input type="number" name="pointvalue"  min="0" max="10000000" class="form-control" value="{{ $commission->point_value != NULL ? $commission->point_value : 'None' }}"/><i class="form-group__bar"></i>
									@if ($errors->has('pointvalue'))
					                    <span class="help-block">
					                        <strong>{{ $errors->first('pointvalue') }}</strong>
					                    </span>
				                	@endif
								</div>
							</div>
						</div>

						<div class="row">
							<div class="col-md-3">
								<div class="form-group">
									<label>Net fee</label>
								</div>
							</div>
							<div class="col-md-4">
								<div class="form-group">
									<input type="number" name="netfee" class="form-control" step="0.01" min="0" max="10000000" value="{{ $commission->netfee != NULL ? $commission->netfee : '0' }}"/><i class="form-group__bar"></i>
									@if ($errors->has('netfee'))
					                    <span class="help-block">
					                        <strong>{{ $errors->first('netfee') }}</strong>
					                    </span>
				                	@endif
								</div>
							</div>
						</div>

						<div class="row">
							<div class="col-md-3">
								<div class="form-group">
									<label>Url (Optional)</label>
								</div>
							</div>
							<div class="col-md-4">
								<div class="form-group">
									<input type="text" name="url" class="form-control" value="{{ $commission->url != NULL ? $commission->url : '' }}"/><i class="form-group__bar"></i>
									@if ($errors->has('url'))
					                    <span class="help-block">
					                        <strong>{{ $errors->first('url') }}</strong>
					                    </span>
				                	@endif
								</div>
							</div>
						</div>


                        @if(in_array("write", explode(',',$AdminProfiledetails->commissionsetting)))
						<div class="form-group">
							<button type="submit" name="edit" class="btn btn-light"><i class=""></i> Update</button>
						</div>
                        @endif
					</form>
				</div>
			</div>
		</div>
	</div>
	@endsection
