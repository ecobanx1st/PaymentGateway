@php
$atitle ="adminbank";
@endphp
@extends('layouts.header')
@section('title', 'Add bank')
@section('content')
<section class="content">
	<header class="content__title">
		<h1>Add {{ $fiat }} Bank Details</h1>
	</header>
	@if(session('status'))
        <div class="alert alert-success" role="alert">
            <button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button><strong>Success!</strong> {{ session('status') }}
        </div>
    @endif
	<div class="row">
		<div class="col-md-12">
			<div class="card">
				<div class="card-body">
					<a href="{{ url('admin/bank/'.$fiat) }}"><i class="zmdi zmdi-arrow-left"></i> Back to Company Bank Details</a>
					<br /><br />  
					<form method="post" action="{{ url('admin/bankadd') }}" autocomplete="off">
						{{ csrf_field() }}
						<div class="row">
							<div class="col-md-3">
								<div class="form-group">
									<label>Select Currency</label>
								</div>
							</div>
							<div class="col-md-6">
								<div class="form-group {{ $errors->has('coin') ? ' has-error' : '' }}">
								
									<select class="form-control" name="coin">
					
										<option value="{{ $fiat }}">{{ $fiat }}</option>
									</select>
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
									<label>Company Account Details</label>
								</div>
							</div>
							<div class="col-md-6">
								<div class="form-group {{ $errors->has('company_bank') ? ' has-error' : '' }}">
									<textarea rows="5" cols="50" name="company_bank" class="form-control textarea-class"></textarea>
									@if ($errors->has('company_bank'))
					                	<span class="help-block">
					                        <strong>{{ $errors->first('company_bank') }}</strong>
					                    </span>
					                @endif
								</div>
							</div>
						</div>
						<input type="hidden" value="{{ $fiat }}" name="fiat">
						<div class="form-group">
							<button type="submit" name="edit" class="btn btn-light"><i class=""></i> Add</button>
						</div>
					</form>
				</div>
			</div>
		</div>
	</div>
	@endsection