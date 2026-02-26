@php
$atitle ="cms";
@endphp
@extends('layouts.header')
@section('title', 'Support Ticket')
@section('content')
<section class="content">
<div class="content__inner">
  <header class="content__title">
    <h1>Social Media SETTING</h1>
  </header>
  @if ($message = Session::get('success'))
    <div class="alert alert-success alert-block">
    <button type="button" class="close" data-dismiss="alert">×</button> 
    <strong>{{ $message }}</strong>
    </div>
  @endif 
  <div class="card">
    <div class="card-body">
      <form method="post" action="{{ url('admin/save_social_media') }}" autocomplete="off">
      {{ csrf_field() }}
        <div class="row">
          <div class="col-md-3">
            <div class="form-group">
              <label>Pinterest</label>
            </div>
          </div>
          <div class="col-md-4">
            <div class="form-group">
              <input type="text" name="pinterest" required="required" id="pinterest" class="form-control" value="{{ $link->pinterest }}">
              <i class="form-group__bar"></i> </div>
          </div>
        </div>
        <div class="row">
          <div class="col-md-3">
            <div class="form-group">
              <label>Facebook</label>
            </div>
          </div>
          <div class="col-md-4">
            <div class="form-group">
              <input type="text" name="fb" required="required"  class="form-control" value="{{ $link->fb }}">
              <i class="form-group__bar"></i> </div>
          </div>
        </div>
        <div class="row">
          <div class="col-md-3">
            <div class="form-group">
              <label>Twitter</label>
            </div>
          </div>
          <div class="col-md-4">
            <div class="form-group">
              <input type="text" name="twitter" required="required"  class="form-control" value="{{ $link->twitter }}">
              <i class="form-group__bar"></i> </div>
          </div>
        </div>
        <div class="row">
          <div class="col-md-3">
            <div class="form-group">
              <label>Instagram</label>
            </div>
          </div>
          <div class="col-md-4">
            <div class="form-group">
              <input type="text" name="instagram" required="required"  class="form-control" value="{{ $link->instagram }}">
              <i class="form-group__bar"></i> </div>
          </div>
        </div>
        <div class="row">
          <div class="col-md-3">
            <div class="form-group">
              <label>Telegram</label>
            </div>
          </div>
          <div class="col-md-4">
            <div class="form-group">
              <input type="text" name="telegram" required="required"  class="form-control" value="{{ $link->telegram }}">
              <i class="form-group__bar"></i> </div>
          </div>
        </div>
        <input type="hidden" name="token" class="form-control" value="" placeholder="">
        <div class="form-group">
          <button type="submit" name="change_password" class="btn btn-light"><i class=""></i> Save</button>
        </div>
      </form>
      <hr/>
    </div>
  </div>
</div>
</section>
@endsection