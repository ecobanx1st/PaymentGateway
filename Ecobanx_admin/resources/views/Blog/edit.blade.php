@php
$atitle ="coinlist";
@endphp
@extends('layouts.header')
@section('title', 'Add New Blog')
@section('content')
<section class="content">
	<header class="content__title">
		<h1>Edit Blog</h1>
	</header>
	<div class="row">
		<div class="col-md-12">
			<div class="card">
				<div class="card-body">
					<a href="{{ url('admin/blogs-list') }}"><i class="zmdi zmdi-arrow-left"></i> Back to Blog</a>
					<br /><br />
					@if(session('status'))
					<div class="alert alert-success" role="alert">
						<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button><strong>Success!</strong> {{ session('status') }}
					</div>
					@endif

					@if(Session::has('error'))
						<p class="alert alert-danger">{{ Session::get('error') }}</p>
					@endif

					<form method="post" action="{{ route('updateBlog') }}" autocomplete="off" enctype="multipart/form-data">
						{{ csrf_field() }}

                        <input type="hidden" value="{{Crypt::encrypt($blog->id)}}" name="blog_id">

						<div class="row">
							<div class="col-md-3">
								<div class="form-group">
									<label>Title</label>
								</div>
							</div>
							<div class="col-md-4">
								<div class="form-group">
									<input type="text" name="title" class="form-control" value="{{$blog->title}}"><i class="form-group__bar"></i>
									@if ($errors->has('title'))
									<span class="help-block">
										<strong>{{ $errors->first('title') }}</strong>
									</span>
									@endif
								</div>
							</div>
						</div>

						<div class="row">
							<div class="col-md-3">
								<div class="form-group">
									<label>Body of blog</label>
								</div>
							</div>
							<div class="col-md-8">
								<div class="form-group">
									<textarea style="color:black" name="body_of_blog" class="form-control contentckeditor ckeditor" id="contentckeditor" placeholder="Enter Body Of Blog" rows="3" >{{ $blog->body_of_blog }}</textarea>
									@if ($errors->has('body_of_blog'))
									<span class="help-block">
										<strong>{{ $errors->first('body_of_blog') }}</strong>
									</span>
									@endif
								</div>
							</div>
						</div>

						<div class="row">
							<div class="col-md-3">
								<div class="form-group">
									<label>Slug Name</label>
								</div>
							</div>
							<div class="col-md-4">
								<div class="form-group">
									<input type="text" name="slug" class="form-control" value="{{ $blog->slug }}"><i class="form-group__bar"></i>
									@if ($errors->has('slug'))
									<span class="help-block">
										<strong>{{ $errors->first('slug') }}</strong>
									</span>
									@endif
								</div>
							</div>
						</div>

						<div class="row">
							<div class="col-md-3">
								<div class="form-group">
									<label>Image Upload</label>
								</div>
							</div>
							<div class="col-md-4">
								<div class="form-group">
									<input type="file" id="image-uploadify" name="blog_image" class="form-control" value="{{ $blog->blog_image }}" step="any" /><i class="form-group__bar"></i>
									</br>
									</br>
									<img src ="{{url('images/colorimage')}}/{{$blog->blog_image ?? ''}}" id="blog_imageshow" alt="" style="height:200px">
									</br>
									@if ($errors->has('blog_image'))
									<span class="help-block">
										<strong>{{ $errors->first('blog_image') }}</strong>
									</span>
									@endif
								</div>
							</div>
						</div>


	<div class="form-group">
		<button type="submit" name="edit" class="btn btn-light"><i class=""></i> Update Now</button>
	</div>
	</form>
	</div>
	</div>
	</div>
	</div>
<script>
	function readURLsecond(input) {
		if (input.files && input.files[0]) {
			var reader = new FileReader();
			reader.onload = function(e) {
			$('#blog_imageshow').attr('src', e.target.result);
			}
			reader.readAsDataURL(input.files[0]);
		}
	}

$("#image-uploadify").change(function() {

    readURLsecond(this);
});
</script>
	@endsection
