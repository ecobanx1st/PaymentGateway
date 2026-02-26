@php
$atitle ="cms";
@endphp
@extends('layouts.header')
@section('title', 'Accept Bitcoin Payments')
@section('content')
<section class="content">
    <div class="content__inner">
        <header class="content__title">
            @php
            if($id == 1){
            $headval = 'bannerheadone';
            $descval = 'bannerone';
            } else {
            $headval = 'bannerheadtwo';
            $descval = 'bannertwo';
            }

            @endphp
            <h1>Home Down Banner {{$id}}</h1>
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
                <form method="post" autocomplete="off" action="{{ url('admin/update_homebanner') }}">
                    {{ csrf_field() }}
                    <input type="hidden" name="id" value="{{$id}}">

                    <div class="row">
                        <div class="col-md-12">
                            <label class="primary-clr">Title</label>
                            <div class="form-group">
                                <input type="text" name="{{$headval}}"
                                    value="{{ $homebanner->$headval ? $homebanner->$headval :'' }}" class="form-control"
                                    required="">
                            </div>
                        </div>
                    </div>

                    <div class="row">
                        <div class="col-md-12">
                            <div class="form-group">
                                <textarea class="ckeditor" name="{{$descval}}">
						        @if(is_object($homebanner) > 0)
                                    @php $data = str_replace(array("\r\n", "\r", "\n"), "<br />", $homebanner->$descval) @endphp
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
