@php
$atitle ="cms";
@endphp
@extends('layouts.header')
@section('title', 'Homepage Banner')
@section('content')
<section class="content">
    <div class="content__inner">
        <header class="content__title">
            <h1>Homepage Banner Content</h1>
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
                <form method="post" autocomplete="off" action="{{ url('admin/updatebanner') }}">
                    {{ csrf_field() }}

                    <div class="row">
                        <div class="col-md-12">
                            <label class="primary-clr">Title</label>
                            <div class="form-group">
                                <input type="text" name="banner_title"
                                    value="{{ $terms->home_banner_title ? $terms->home_banner_title :'' }}"
                                    class="form-control" required="">
                            </div>
                        </div>
                    </div>

                    <div class="row">
                        <div class="col-md-12">
                            <div class="form-group">
                                <textarea class="ckeditor" name="banner">
						        @if(is_object($terms) > 0)
                                    @php $data = str_replace(array("\r\n", "\r", "\n"), "<br />", $terms->home_banner) @endphp
                                    {{ $data }}
                                @endif
						   </textarea>
                            </div>
                        </div>
                    </div>
                    @if(in_array("write", explode(',',$AdminProfiledetails->cms_settings)))
                    <div class="form-group">
                        <button type="submit" name="update_content" class="btn btn-light"><i class=""></i> Update
                            Content</button>
                    </div>
                    @endif
                </form>
            </div>
        </div>
    </div>
    @endsection
