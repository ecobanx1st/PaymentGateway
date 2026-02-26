@php
$atitle ="cms";
@endphp
@extends('layouts.header')
@section('title', 'About Us')
@section('content')
<section class="content">
<div class="content__inner">
	<header class="content__title">
		<h1>Update About Us Content</h1>
	</header>
	@if(session('status'))
        <div class="alert alert-success" role="alert">
            <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                <span aria-hidden="true">&times;</span>
            </button>
        {{ session('status') }}
        </div>
    @endif
	<div class="card">
		<div class="card-body">
			<form method="post" autocomplete="off" action="{{ url('admin/update_about') }}">
			    {{ csrf_field() }}
				<div class="row">
					<div class="col-md-12">
						<div class="form-group">
						   <textarea class="ckeditor" name="aboutus">
						        @if(is_object($aboutus) > 0)
                                    @php $data = str_replace(array("\r\n", "\r", "\n"), "<br />", $aboutus->aboutus) @endphp
                                    {{ $data }}
                                @endif
						   </textarea>
						</div>
					</div>
				</div>
                @if(in_array("write", explode(',',$AdminProfiledetails->cms_settings)))
				<div class="form-group">
					<button type="submit" name="update_content" class="btn btn-light"><i class=""></i> Update Content</button>
				</div>
                @endif
			</form>
		</div>
	</div>
</div>
@endsection
