@php
$atitle ="cms";
@endphp
@extends('layouts.header')
@section('title', 'FAQ - Admin')
@section('content')
<section class="content">
  <div class="content__inner">
    <header class="content__title">
      <h1>FAQ Settings</h1>
    </header>

      @if ($message = Session::get('failed'))
    <div class="alert alert-danger">{{ $message }} </div><br />
  @endif
  
    <div class="card">
      <div class="card-body">
        <form method="POST" action="{{ url('admin\faq_save') }}">
        {{ csrf_field() }} 
            <div class="row">
              <div class="col-md-3">
                <div class="form-group">
                  <label>Heading</label>
                </div>
              </div>
              <div class="col-md-4">
                <div class="form-group">
                  <input type="text" name="heading" class="form-control" >
                  <i class="form-group__bar"></i> </div>
              </div>
            </div>
            <div class="row">
              <div class="col-md-3">
                <div class="form-group">
                  <label>Description</label>
                </div>
              </div>
              <div class="col-md-8">
                <div class="form-group">
                  <textarea name="description" class="form-control">
                  </textarea>
                  <i class="form-group__bar"></i> </div>
              </div>
            </div>  
          <div class="row">
            <div class="col-md-3">
              <div class="form-group">
                <label>&nbsp;</label>
              </div>
            </div>
            <div class="col-md-4">
               <button class="btn btn-md btn-warning" type="submit"> Add</button><br /><br />
            </div>
          </div>
        </form>
      </div>
    </div>
  </div>
</section>
@endsection
  