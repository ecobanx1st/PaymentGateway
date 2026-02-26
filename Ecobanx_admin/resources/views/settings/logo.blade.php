@php
$atitle ="cms";
@endphp
@extends('layouts.header')
@section('title', 'Support Ticket')
@section('content')
<section class="content">
	<header class="content__title">
		<h1>Update Logo & Favicon</h1>
	</header>
	<div class="row">
		<div class="col-md-12">
			<div class="card">
				<div class="card-body">
					@if(session('status'))
                        <div class="alert alert-success" role="alert">
                            <button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button><strong>Success!</strong> {{ session('status') }}
                        </div>
                    @endif
					<form method="post" action="{{ url('admin/update_logo') }}" autocomplete="off" enctype="multipart/form-data">
						{{ csrf_field() }}
						<div class="row">
							<div class="col-md-3">
								<div class="form-group">
									<label>Logo Image (JPG, JPEG, PNG)</label>
								</div>
							</div>
							<div class="col-md-6">
								<div class="form-group {{ $errors->has('logo') ? ' has-error' : '' }}">
									<input type="hidden" name="old_logo" value="{{ $logo->logo }}">
									<input type="hidden" name="old_favicon" value="{{ $logo->favicon }}">
	                              <img id="blah" src="{{ $logo->logo }}" width="20%" />
	                              <label for="proof_upload1" class="btn btn-sm btn-primary btn-class">
	                                <i class="fa fa-cloud-upload"></i> Upload Logo (Image)
	                              </label>
	                              <input id="proof_upload1" name="logo" type="file" style="display:none;"><br />
	                              @if ($errors->has('logo'))
				                	<span class="help-block">
				                        <strong>{{ $errors->first('logo') }}</strong>
				                    </span>
				                @endif
								</div>
							</div>
						</div>
						<div class="row">
							<div class="col-md-3">
								<div class="form-group">
									<label>Favicon Image (JPG, JPEG, PNG)</label>
								</div>
							</div>
							<div class="col-md-6">
								<div class="form-group {{ $errors->has('favicon') ? ' has-error' : '' }}">
	                              <img id="doc3" src="{{ $logo->favicon }}" width="20%" />
	                              <label for="proof_upload2" class="btn btn-sm btn-primary btn-class">
	                                <i class="fa fa-cloud-upload"></i> Upload Favicon (Image)
	                              </label>
	                              <input id="proof_upload2" name="favicon" type="file" style="display:none;"><br />
	                              @if ($errors->has('favicon'))
				                	<span class="help-block">
				                        <strong>{{ $errors->first('favicon') }}</strong>
				                    </span>
				                @endif
								</div>
							</div>
						</div>
						<div class="form-group">
							<button type="submit" id="kyc_btn" class="btn btn-light"><i class=""></i> Update</button>
						</div>
					</form>
				</div>
			</div>
		</div>
	</div>
	@endsection