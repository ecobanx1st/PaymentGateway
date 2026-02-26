@php
$atitle ="category";
@endphp
@extends('layouts.header')
@section('title', 'Edit Merchant Category')
@section('content')
<section class="content">
	<header class="content__title">
		<h1>Edit Merchant Category</h1>
	</header>
	<div class="row">
		<div class="col-md-12">
			<div class="card">
				<div class="card-body">
					<a href="{{ url('admin/category') }}"><i class="zmdi zmdi-arrow-left"></i> Back to Merchant Category</a>
					<br /><br />
					@if(session('status'))
                        <div class="alert alert-success" role="alert">
                            <button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button><strong>Success!</strong> {{ session('status') }}
                        </div>
                    @endif
                     @if(session('error'))
                        <div class="alert alert-warning" role="alert">
                            <button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button><strong>Failed!</strong> {{ session('error') }}
                        </div>
                    @endif
					<form method="post" action="{{ url('admin/updatecategory') }}" autocomplete="off">
						{{ csrf_field() }}
						<input type="hidden" value="{{ $forum->id }}" name="id">


						<div class="row">
							<div class="col-md-3">
								<div class="form-group">
									<label>Category</label>
								</div>
							</div>
							<div class="col-md-4">
								<div class="form-group">
									<input type="text" name="category" class="form-control" value="{{ $forum->category != NULL ? $forum->category : ' ' }}"/><i class="form-group__bar"></i>
									@if ($errors->has('category'))
									<span class="help-block">
									<strong>{{ $errors->first('category') }}</strong>
									</span>
									@endif
								</div>
							</div>
						</div>


						<div class="form-group">
                            @if(in_array("write", explode(',',$AdminProfiledetails->merchant_api)))
							<button type="submit" name="edit" class="btn btn-light"><i class=""></i> Update</button>
                            @endif
						</div>
					</form>
				</div>
			</div>
		</div>
	</div>
	@endsection
