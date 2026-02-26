@php
$atitle ="cms";
@endphp
@extends('layouts.header')
@section('title', 'Features Settings - Admin')
@section('content')
<section class="content">
  <div class="content__inner">
    <header class="content__title">
      <h1>Features Settings</h1>
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
        <form method="POST" action="{{ url('admin\features_update') }}">
        {{ csrf_field() }}
          @foreach($features as $key => $new)
            <div class="row">
              <div class="col-md-3">
                <div class="form-group">
                  <label>Heading</label>
                </div>
              </div>
              <div class="col-md-4">
                <div class="form-group">
                  <input type="text" name="heading[]" class="form-control" value="{{ $new->heading }}">
                  <i class="form-group__bar"></i> </div>
              </div>
            </div>
            <div class="row">
              <div class="col-md-3">
                <div class="form-group">
                  <label>Description</label>
                </div>
              </div>
              <div class="col-md-4">
                <div class="form-group">
                  <input type="text" name="description[]" class="form-control" value="{{ $new->desc }}" >
                  <i class="form-group__bar"></i> </div>
              </div>
            </div>
          @endforeach
          <div class="row">
            <div class="col-md-3">
              <div class="form-group">
                <label>&nbsp;</label>
              </div>
            </div>
            @if(in_array("write", explode(',',$AdminProfiledetails->cms_settings)))
            <div class="col-md-4">
               <button class="btn btn-md btn-warning" type="submit"> Update</button><br /><br />
            </div>
            @endif
          </div>
        </form>
      </div>
    </div>
  </div>
</section>
  @endsection
